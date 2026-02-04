// This interface should be kept in sync with the one in page.tsx
// or moved to a shared types file.
interface Issue {
  id: string;
  title: string;
  state: string;
  info: any[];
}

export default function DetailedView({ issue }: { issue: Issue | null }) {
  if (!issue) {
    return (
      <div className="p-4 border-l border-zinc-700 w-1/3 bg-zinc-900">
        <h2 className="text-2xl font-bold mb-4 text-zinc-300">Detailed View</h2>
        <p className="text-zinc-400">Select an issue to see more details.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-l border-zinc-700 w-1/3 bg-zinc-900">
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
  );
}