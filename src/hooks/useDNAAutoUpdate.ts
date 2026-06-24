import React from "react";
import { BusinessCanvasData, DailyPulseRecord } from "../types";

interface DNAUpdateSuggestion {
  type: "market_shift" | "new_competitor";
  message: string;
  action: () => void;
}

export function useDNAAutoUpdate(
  dna: BusinessCanvasData,
  dailyRecords: DailyPulseRecord[],
  updateDna: (patch: Partial<BusinessCanvasData>) => void
): DNAUpdateSuggestion | null {
  const [suggestion, setSuggestion] = React.useState<DNAUpdateSuggestion | null>(null);

  React.useEffect(() => {
    if (dailyRecords.length < 7) {
      setSuggestion(null);
      return;
    }

    const last7 = dailyRecords.slice(-7);

    // Check: competitor mentions in briefings
    const competitorMentions = last7.filter(
      (r) =>
        r.briefing?.toLowerCase().includes("kompetitor") ||
        r.briefing?.toLowerCase().includes("pesaing") ||
        r.briefing?.toLowerCase().includes(dna.biggestCompetitor?.toLowerCase() || "")
    );

    if (competitorMentions.length >= 3) {
      setSuggestion({
        type: "new_competitor",
        message:
          "Kompetitor sering disebut di briefing 7 hari terakhir. Tinjau data kompetitor di War Room?",
        action: () => {
          setSuggestion(null);
        },
      });
      return;
    }

    // Check: active strategies vs DNA alignment
    const allStrategies = last7.flatMap((r) => r.activeStrategies || []);
    const strategyCounts: Record<string, number> = {};
    allStrategies.forEach((s) => {
      strategyCounts[s] = (strategyCounts[s] || 0) + 1;
    });

    const dominantStrategy = Object.entries(strategyCounts).sort((a, b) => b[1] - a[1])[0];

    if (dominantStrategy && dominantStrategy[1] >= 5) {
      setSuggestion({
        type: "market_shift",
        message: `Strategi "${dominantStrategy[0]}" mendominasi 7 hari terakhir (${dominantStrategy[1]}x). Pertimbangkan untuk fokus pada area ini.`,
        action: () => {
          setSuggestion(null);
        },
      });
      return;
    }

    setSuggestion(null);
  }, [dailyRecords.length]);

  return suggestion;
}
