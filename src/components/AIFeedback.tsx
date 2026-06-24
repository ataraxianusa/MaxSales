import React from "react";
import { useChain } from "../store/ChainContext";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface AIFeedbackProps {
  promptType: "strategy" | "pulse" | "content";
  responseId: string;
}

export default function AIFeedback({ promptType, responseId }: AIFeedbackProps) {
  const { addFeedback } = useChain();
  const [voted, setVoted] = React.useState<"useful" | "not" | null>(null);

  const handleVote = (vote: "useful" | "not") => {
    setVoted(vote);
    addFeedback({
      promptType,
      responseId,
      vote,
      timestamp: new Date().toISOString(),
    });
  };

  if (voted) {
    return (
      <span className="text-[10px] font-mono text-emerald-500 mt-2 inline-block">
        ✓ Terima kasih!
      </span>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => handleVote("useful")}
        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-neutral-200 dark:border-[#262626] text-neutral-500 dark:text-[#737373] hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-colors"
      >
        <ThumbsUp className="w-3 h-3" />
        Berguna
      </button>
      <button
        onClick={() => handleVote("not")}
        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-neutral-200 dark:border-[#262626] text-neutral-500 dark:text-[#737373] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-colors"
      >
        <ThumbsDown className="w-3 h-3" />
        Tidak Relevan
      </button>
    </div>
  );
}
