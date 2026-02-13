import { useState, useRef, FormEvent, useEffect } from "react";

type MessageType = "observation" | "beslut" | "uppdatering" | "system";

interface Issue {
  id: string;
  title: string;
  state: string;
  info: any[];
}

interface DetailedViewProps {
  issue: Issue | null;
  activeChannel: string;
  connection: any;
  adress: string;
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

export default function DetailedView({ issue, activeChannel, connection, adress }: DetailedViewProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!issue) {
      alert("Please select an issue card to send a message.");
      return;
    }

    const command = parseCommand(input);
    const msg = command?.text;
    const issueId = issue.id;

    if (!msg) return;

    const response = await fetch(`${adress}info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: msg, issueId: issueId })
    });

    if (response.ok) {
        try {
            connection?.invoke("SendInfo", issueId, msg, activeChannel);
        } catch (error) {
            console.log("Failed to send info via SignalR, but message was saved to database. Error:", error);
            console.error("Error sending info via SignalR:", error);
        }
    }

    setInput("");
  }

  if (!issue) {
    return (
      <div className="p-4 border-l border-zinc-700 w-1/3 bg-zinc-900">
        <h2 className="text-2xl font-bold mb-4 text-zinc-300">Detailed View</h2>
        <p className="text-zinc-400">Select an issue to see more details.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-l border-zinc-700 w-1/3 bg-zinc-900 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-zinc-300">{issue.title}</h2>
        <p className="text-zinc-400">State: {issue.state}</p>
        <div className="mt-4">
          <h3 className="font-bold text-lg text-zinc-300">Info Log</h3>
          <ul className="list-disc list-inside text-zinc-400 mt-2 space-y-1">
            {issue.info.map((infoItem: any, index: number) => (
              <li key={index}>{infoItem.description}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-700 p-2 mt-4"
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
    </div>
  );
}
function dispatch(arg0: { type: string; payload: { issueId: string; text: string; timestamp: string; }; }) {
    throw new Error("Function not implemented.");
}

