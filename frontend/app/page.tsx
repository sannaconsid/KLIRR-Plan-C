"use client";

import { useReducer, useEffect, useRef, MouseEvent } from "react";
import { createConnection } from "./connection";
import DetailedView from "./detailedView";

type MessageType = "observation" | "beslut" | "uppdatering" | "system";

const getAPiBaseUrl = () => {
  if(typeof window !== "undefined"){
    const hostname = window.location.hostname;
    return `http://${hostname}/api/`;
  }
  return "http://localhost/api/";
};

const adress = getAPiBaseUrl();

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
  detailedIssue: Issue | null;
}

type Action =
  | { type: "SET_CHANNELS"; channels: string[] }
  | { type: "SET_ISSUES"; issues: Issue[] }
  | { type: "ADD_ISSUE"; issue: Issue }
  | { type: "SET_ACTIVE_ISSUE"; issueId: string | null; details?: Issue }
  | { type: "SET_CHANNEL"; channel: string }
  | { type: "ADD_MESSAGE"; message: ChatMessage;}
  | { type: "ADD_INFO"; payload: { issueId: string; text: string; timestamp: string } };
  
  
const initialState: State = {
  channels: [],
  activeChannel: "",
  messages: [],
  issues: [],
  activeIssueId: null,
  detailedIssue: null,
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
      return { ...state, activeChannel: action.channel, activeIssueId: null, detailedIssue: null };
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
      return { ...state, activeIssueId: action.issueId, detailedIssue: action.details || null };
    case "ADD_MESSAGE":
      if (state.messages.some(m => m.id === action.message.id)) return state;
      return { ...state, messages: [...state.messages, action.message] };
    case "ADD_INFO":
      const newInfo = { 
        description: action.payload.text, 
        timestamp: action.payload.timestamp };
      const updatedIssues = state.issues.map((i) => {
        if (i.id === action.payload.issueId) {
          return { ...i, info: [...i.info, newInfo] };
        }
        return i;
      });
      
      let updatedDetailedIssue = state.detailedIssue;
      if (state.detailedIssue && state.detailedIssue.id === action.payload.issueId) {
         updatedDetailedIssue = { ...state.detailedIssue, info: [...state.detailedIssue.info, newInfo] };
      }
      return { ...state, issues: updatedIssues, detailedIssue: updatedDetailedIssue };
    default:
      return state;
  }
}

export default function EmergencyChat() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const connectionRef = useRef<any>(null);

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
        conn.on("ReceiveInfo", (info: any) => {
          dispatch({ type: "ADD_INFO", payload: info });
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
  }, []);

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

  return (
    <div className="flex h-screen bg-zinc-900 text-zinc-100 font-mono overflow-hidden">
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

      {/* The middle column */}
      <main className="flex flex-col flex-1 min-w-0">

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
                // Use the detailedView component to show details
                
                onClick={async () => {
                  const response = await fetch(`${adress}issue/${issue.id}`);
                  if (response.ok) {
                    const issueDetails = await response.json();
                    dispatch({ type: "SET_ACTIVE_ISSUE", issueId: issue.id, details: issueDetails });
                  }
                }}
              >
                <div>
                <h2 className="font-bold text-lg mb-2 text-zinc-300">
                  {issue.title}
                </h2>
                <div style={{ float: "right", top: 10 }} className="text-sm text-zinc-500">
                  {issue.state}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </main>

      {/* Detailed View Pane */}
      <DetailedView 
        issue={state.detailedIssue} 
        activeChannel={state.activeChannel}
        connection={connectionRef.current}
        adress={adress}
      />
    </div>
  );
}
