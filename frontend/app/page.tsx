"use client";

import { useReducer, useState, useEffect, useRef } from "react";
import { createConnection } from "./connection";

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
  | { type: "SET_CHANNEL"; channel: string }
  | { type: "ADD_MESSAGE"; message: ChatMessage;};


  const initialState: State = {
  channels: ["#Flödet", "Ledning", "Fält", "Samordning", "#4242"],
  activeChannel: "#Flödet",
  messages: [
  ],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_CHANNEL":
      return { ...state, activeChannel: action.channel };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    default:
      return state;
  }
}


const colorMap: Record<MessageType, string> = {
  observation: "text-blue-400",
  beslut: "text-green-400",
  uppdatering: "text-orange-400",
  system: "text-gray-400",
};

function parseCommand(input: string, channel: string): ChatMessage | null {
  
  if (!input.startsWith("@")) return null;
  
  const [cmd, ...rest] = input.slice(1).split(" ");
  const text = rest.join(" ");
  
  const typeMap: Record<string, MessageType> = {
    obs: "observation",
    bes: "beslut",
    issue: "uppdatering",
  };
  
  const type = typeMap[cmd];
  if (!type) return null;
  
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    type,
    channel,
    text,
  };
}

export default function EmergencyChat() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [input, setInput] = useState("");
  const connectionRef = useRef<any>(null);

  if (!state.activeChannel) {
    return;
  }

  const visibleMessages = state.messages.filter(
    (m) => m.channel === state.activeChannel
  );

  useEffect(() => {
    const initConnection = async () => {
      const conn = await createConnection();
      connectionRef.current = conn;
      await conn.start()
        .then(() => console.log("SignalR connected"))
        .catch(console.error);

      conn.on("ReceiveMessage", (message) => {
        dispatch({ type: "ADD_MESSAGE", message: message});
      });
    };

    initConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.off("ReceiveMessage");
      }
    };
  }, []);
  
  function handleSubmit(e: React.ChangeEvent<HTMLInputElement>) {

    e.preventDefault();
    const msg = parseCommand(input, state.activeChannel);
    if (msg) {
      connectionRef.current?.invoke("SendMessage", msg.type, msg.text, msg.channel)
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
            onClick={() => dispatch({ type: "SET_CHANNEL", channel: ch })}
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
            placeholder="@obs …  @beslut …  /issue …"
            className="w-full bg-zinc-800 text-zinc-100 px-3 py-2 outline-none"
          />
        </form>
      </main>
    </div>
  );
}
