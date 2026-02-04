"use client";

import { useReducer, useState, useEffect, FormEvent, useRef, MouseEvent } from "react";
import { createConnection } from "./connection";

type MessageType = "observation" | "beslut" | "uppdatering" | "system";
const adress = "https://localhost:7298/api/";

// A message now belongs to an issue
interface ChatMessage {
  id: string;
  timestamp: number;
  type: MessageType;
  channel: string;
  issueId: string; // New field
  text: string;
}

// Represents an issue, which will be a "card"
interface Issue {
  id: string;
  title: string;
  state: string;
  info: any[];
}

interface State {
  channels: string[];
  activeChannel: string;
  messages: ChatMessage[];
  issues: Issue[];
  activeIssueId: string | null;
}

type Action =
  | { type: "SET_CHANNELS"; channels: string[] }
  | { type: "SET_ISSUES"; issues: Issue[] }
  | { type: "ADD_ISSUE"; issue: Issue }
  | { type: "SET_ACTIVE_ISSUE"; issueId: string | null; details?: Issue }
  | { type: "SET_CHANNEL"; channel: string }
  | { type: "ADD_MESSAGE"; message: ChatMessage;};
  
  
const initialState: State = {
  channels: [],
  activeChannel: "",
  messages: [],
  issues: [],
  activeIssueId: null,
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
      if (action.channel === state.activeChannel) return state; // No change
      // When channel changes, clear the active issue
      return { ...state, activeChannel: action.channel, activeIssueId: null };
    case "SET_CHANNELS":
      return {
        ...state,
        channels: action.channels,
        activeChannel: state.activeChannel || action.channels[0] || "",
      };
    case "SET_ISSUES":
      return { ...state, issues: action.issues };
    case "ADD_ISSUE":
      if (state.issues.some(i => i.id === action.issue.id)) return state;
      return { ...state, issues: [...state.issues, action.issue] };
    case "SET_ACTIVE_ISSUE":
      return { ...state, activeIssueId: action.issueId };
    case "ADD_MESSAGE":
      // Prevent duplicate messages if we fetch and get from SignalR
      if (state.messages.some(m => m.id === action.message.id)) return state;
      return { ...state, messages: [...state.messages, action.message] };
    default:
      return state;
  }
}

function parseCommand(input: string): { type: MessageType; text: string } | null {
  if (!input.startsWith("@")) return null;

  const [cmd, ...rest] = input.slice(1).split(" ");
  const text = rest.join(" ");

  const typeMap: Record<string, MessageType | undefined> = {
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

  // Effect to manage the SignalR connection
  useEffect(() => {
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
  }, []); // Run only once

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [channelsRes, issuesRes, infoTypesRes] = await Promise.all([
          fetch(`${adress}channels`),
          fetch(`${adress}issue`),
          fetch(`${adress}info/infotypes`),
        ]);

        if (!channelsRes.ok) throw new Error(`Failed to fetch channels: ${channelsRes.statusText}`);
        if (!issuesRes.ok) throw new Error(`Failed to fetch issues: ${issuesRes.statusText}`);
        if (!infoTypesRes.ok) throw new Error(`Failed to fetch info types: ${infoTypesRes.statusText}`);

        const infoTypes = await infoTypesRes.json();
        const channels = await channelsRes.json();
        const issues: Issue[] = await issuesRes.json();

        dispatch({ type: "SET_CHANNELS", channels });
        dispatch({ type: "SET_ISSUES", issues });

      } catch (e) {
        console.error("Failed to fetch initial data: ", e);
      }
    };

    fetchInitialData();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!state.activeIssueId) {
      alert("Please select an issue card to send a message.");
      return;
    }

    const command = parseCommand(input);
    const msg = command?.text;
    const issueId = state.activeIssueId;
    const response = await fetch(`${adress}info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text:msg, issueId:issueId,})
    });

    setInput("");
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-100 font-mono">
      {/* The left side */}
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

      {/* The right side */}
      <main className="flex flex-col flex-1">

        {/* Channel header */}
        <div className="border-b border-zinc-700 px-4 py-2 font-bold">
          {state.activeChannel}

          {/* New Issue Button */}
          <button
            onClick={async (e: MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              const title = prompt("Ärende-namn:");
              if (!title) return;

              const response = await fetch(`${adress}issue`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ title, channel: state.activeChannel })
              });

              if (response.ok) {
                const text = await response.text();
                if (text) {
                  const newIssue: Issue = JSON.parse(text);
                  dispatch({ type: "ADD_ISSUE", issue: newIssue });
                  dispatch({ type: "SET_ACTIVE_ISSUE", issueId: newIssue.id });
                }
              } else {
                alert("Failed to create issue.");
              }
            }} className="text-xs bg-zinc-700 hover:bg-zinc-600 px-1 rounded"
            >
            + Nytt Ärende
          </button>
        </div>

        {/* Issue Flow */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.issues
            .map((issue) => (
              <div
                key={issue.id}
                className={`bg-zinc-800/50 rounded-lg p-4 cursor-pointer border-2 transition-colors ${
                  state.activeIssueId === issue.id
                    ? "border-orange-400 bg-zinc-800"
                    : "border-transparent hover:border-zinc-700"
                }`}
                // Fetch detailed info when clicking an issue
                onClick={async () => {
                  const response = await fetch(`${adress}issue/${issue.id}`);
                  if (response.ok) {
                    const issueDetails = await response.json();
                    dispatch({ type: "SET_ACTIVE_ISSUE", issueId: issue.id, details: issueDetails });
                  }
                }}
              >
                <h2 className="font-bold text-lg mb-2 text-zinc-300">{issue.title}</h2>
                <div className="space-y-1 pl-2 border-l-2 border-zinc-700">
                  {state.messages
                    .filter((m) => m.issueId === issue.id)
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .map((m) => (
                      <div key={m.id} className={colorMap[m.type]}>
                        <span className="opacity-50 mr-2">
                          @{m.type}:
                        </span>
                        {m.text}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
          
        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-zinc-700 p-2"
        >
          {/* Command buttons */}
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
                className="text-[10px] border border-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-700 transition-colors">
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
