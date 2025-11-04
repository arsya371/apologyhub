import { ApologyCard } from "./apology-card";
import type { Apology } from "../types";

interface ApologyListProps {
  apologies: Apology[];
  emptyMessage?: string;
}

export function ApologyList({ apologies, emptyMessage = "No apologies found" }: ApologyListProps) {
  if (apologies.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl backdrop-blur-lg bg-white/40 dark:bg-gray-800/40 border-2 border-dashed border-gray-300/50 dark:border-gray-600/50 p-12">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {apologies.map((apology) => (
        <ApologyCard key={apology.id} apology={apology} />
      ))}
    </div>
  );
}
