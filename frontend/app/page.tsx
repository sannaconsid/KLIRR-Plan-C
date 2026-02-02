"use client";

import { useReducer, useState, useEffect, FormEvent } from "react";
import { connection } from "./connection";

type MessageType = "observation" | "beslut" | "uppdatering" | "system";

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

  const visibleMessages = state.messages.filter(
    (m) => m.channel === state.activeChannel
  );

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await fetch("https://localhost:7298/api/channels");
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

  // Effect to manage the SignalR connection
  useEffect(() => {
    if (!state.activeChannel) {
      return;
    }

    const startConnection = async () => {
      try {
        if (connection.state === "Disconnected") {
          await connection.start();
          console.log("SignalR connected");
        }

        connection.on("ReceiveMessage", (message) => {
          dispatch({ type: "ADD_MESSAGE", message: message });
        });
      } catch (e) {
        console.error("SignalR Connection failed: ", e);
      }
    };

    startConnection();

    return () => {
      connection.off("ReceiveMessage");
    };
  }, [state.activeChannel]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const command = parseCommand(input);
    if (command) {
      connection.invoke("SendMessage", command.type, command.text, state.activeChannel);
    }
    setInput("");
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-100 font-mono">
      <aside className="w-56 border-r border-zinc-700 p-3">
        <div className="mb-3 text-orange-400 font-bold">EMBER</div>
        {state.channels.map((ch) => (
          <div
            key={ch}
            onClick={() => {
              if (ch !== state.activeChannel) {
                connection.invoke("SwitchChannel", state.activeChannel, ch);
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
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="@obs …  @bes … "
            className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 outline-none"
          />
        </form>
      </main>
    </div>
  );
}
