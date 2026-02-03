"use client";

import { useReducer, useState, useEffect, FormEvent, useRef } from "react";
import { createConnection } from "./connection";

type MessageType = "observation" | "beslut" | "uppdatering" | "system";
const adress = "https://localhost:7298/api/";

interface ChatMessage {
  id: string;
  timestamp: number;
  type: MessageType;
  channel: string;
  text: string;
}

interface State {
  channels: string[];
  activeChannel: string;
  messages: ChatMessage[];
}

type Action =
  | { type: "SET_CHANNELS"; channels: string[] }
  | { type: "SET_CHANNEL"; channel: string }
  | { type: "ADD_MESSAGE"; message: ChatMessage;};
  
  
const initialState: State = {
  channels: [],
  activeChannel: "",
  messages: [
  ],
};
  
const colorMap: Record<MessageType, string> = {
  observation: "text-blue-400",
  beslut: "text-green-400",
  uppdatering: "text-orange-400",
  system: "text-gray-400",
};
  
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CHANNEL":
      if (action.channel === state.activeChannel) return state;
      return { ...state, activeChannel: action.channel };
    case "SET_CHANNELS":
      return {
        ...state,
        channels: action.channels,
        activeChannel: state.activeChannel || action.channels[0] || "",
      };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    default:
      return state;
  }
}

function parseCommand(input: string): { type: MessageType; text: string } | null {
  if (!input.startsWith("@")) return null;

  const [cmd, ...rest] = input.slice(1).split(" ");
  const text = rest.join(" ");

  const typeMap: Record<string, MessageType> = {
    obs: "observation",
    bes: "beslut",
    upp: "uppdatering",
  };

  const type = typeMap[cmd];
  if (!type) return null;

  return { type, text };
}

export default function EmergencyChat() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [input, setInput] = useState("");
  const connectionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const visibleMessages = state.messages.filter(
    (m) => m.channel === state.activeChannel
  );
  // Effect to manage the SignalR connection
  useEffect(() => {
    if (!state.activeChannel) {
      return;
    }

    const initConnection = async () => {
      try {
        const conn = await createConnection();
        connectionRef.current = conn;
        if (connectionRef.current.state === "Disconnected") {
          await conn.start();
          console.log("SignalR connected");
        }

        conn.on("ReceiveMessage", (message) => {
          dispatch({ type: "ADD_MESSAGE", message: message });
        });
      } catch (e) {
        console.error("SignalR Connection failed: ", e);
      }
    };

    initConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("ReceiveMessage");
      }
    };
  }, [state.activeChannel]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch(`${adress}channels`); //TODO: Move to config
        if (!res.ok) {
          throw new Error(`Failed to fetch channels: ${res.status} ${res.statusText}`);
        }
        const channels = await res.json();
        dispatch({ type: "SET_CHANNELS", channels });
      } catch (e) {
        console.error("Failed to fetch channels: ", e);
      }
    };

    fetchChannels();
  }, []);


  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const command = parseCommand(input);
    if (command) {
      connectionRef.current?.invoke("SendMessage", command.type, command.text, state.activeChannel);
    }
    setInput("");
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-100 font-mono">
      <aside className="w-56 border-r border-zinc-700 p-3">
        <div className="mb-3 flex justify-between items-center">
          <span className="text-orange-400 font-bold">EMBER</span>

        </div>
        {state.channels.map((ch) => (
          <div
            key={ch}
            onClick={() => {
              if (ch !== state.activeChannel) {
                connectionRef.current?.invoke("SwitchChannel", state.activeChannel, ch);
                dispatch({ type: "SET_CHANNEL", channel: ch });
              }
            }}
            className={`cursor-pointer px-2 py-1 rounded mb-1 ${
              state.activeChannel === ch
                ? "bg-zinc-700"
                : "hover:bg-zinc-800"
            }`}
          >
            {ch}
          </div>
        ))}
      </aside>
      <main className="flex flex-col flex-1">
        <div className="border-b border-zinc-700 px-4 py-2 font-bold">
          {state.activeChannel}

          <button 
            onClick={async () => {
              const name = prompt("Ärende-namn:");
              if (name) {
                try {
                  await fetch(`${adress}issues?name=${encodeURIComponent(name)}`, { method: 'POST' });
                } catch (e) {
                  console.error("Failed to create channel", e);
                }
              }
            }}
            className="text-xs bg-zinc-700 hover:bg-zinc-600 px-1 rounded"
          > +  Nytt Ärende</button>

        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {visibleMessages.map((m) => (
            <div key={m.id} className={colorMap[m.type]}>
              <span className="opacity-50 mr-2">
                @{m.type}:
              </span>
              {m.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-zinc-700 p-2"
        >
          <div className="flex gap-2 mb-2">
            {[
              { label: "OBSERVATION", prefix: "@obs " },
              { label: "BESLUT", prefix: "@bes " },
              { label: "STATUS", prefix: "@upp " },
            ].map((btn) => (
              <button
                key={btn.prefix}
                type="button"
                onClick={() => {
                  setInput(btn.prefix + input.replace(/^@(obs|bes|upp)\s*/, ""));
                  inputRef.current?.focus();
                }}
                className="text-[10px] border border-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="…"
            className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 outline-none"
          />
        </form>
      </main>
    </div>
  );
}
