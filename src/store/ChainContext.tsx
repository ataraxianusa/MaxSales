import React from "react";
import {
  BusinessCanvasData,
  CompetitorIntel,
  CustomerSegment,
  StrategyOutput,
  DailyPulseRecord,
  FeedbackLog,
} from "../types";

interface ChainContextValue {
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  dna: BusinessCanvasData;
  strategyOutput: StrategyOutput | null;
  dailyRecords: DailyPulseRecord[];
  feedbackLog: FeedbackLog[];
  streakCount: number;

  setCompetitors: (c: CompetitorIntel[]) => void;
  setSegments: (s: CustomerSegment[]) => void;
  setDna: React.Dispatch<React.SetStateAction<BusinessCanvasData>>;
  updateDna: (patch: Partial<BusinessCanvasData>) => void;
  setStrategyOutput: (s: StrategyOutput) => void;
  addPulseRecord: (r: DailyPulseRecord) => void;
  addFeedback: (f: FeedbackLog) => void;
}

export const ChainContext = React.createContext<ChainContextValue | null>(null);

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

interface ChainProviderProps {
  children: React.ReactNode;
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  dna: BusinessCanvasData;
  streakCount: number;
  setCompetitors: (c: CompetitorIntel[]) => void;
  setSegments: (s: CustomerSegment[]) => void;
  setDna: React.Dispatch<React.SetStateAction<BusinessCanvasData>>;
}

export function ChainProvider({
  children,
  competitors,
  segments,
  dna,
  streakCount,
  setCompetitors,
  setSegments,
  setDna,
}: ChainProviderProps) {
  const [strategyOutput, setStrategyOutput] = React.useState<StrategyOutput | null>(
    () => loadJson<StrategyOutput | null>("maxx_sales_strategy_output", null)
  );

  const [dailyRecords, setDailyRecords] = React.useState<DailyPulseRecord[]>(
    () => loadJson<DailyPulseRecord[]>("maxx_sales_daily_records", [])
  );

  const [feedbackLog, setFeedbackLog] = React.useState<FeedbackLog[]>(
    () => loadJson<FeedbackLog[]>("maxx_sales_feedback_log", [])
  );

  React.useEffect(() => {
    localStorage.setItem("maxx_sales_strategy_output", JSON.stringify(strategyOutput));
  }, [strategyOutput]);

  React.useEffect(() => {
    localStorage.setItem("maxx_sales_daily_records", JSON.stringify(dailyRecords));
  }, [dailyRecords]);

  React.useEffect(() => {
    localStorage.setItem("maxx_sales_feedback_log", JSON.stringify(feedbackLog));
  }, [feedbackLog]);

  const addPulseRecord = React.useCallback((record: DailyPulseRecord) => {
    setDailyRecords((prev) => [...prev, record]);
  }, []);

  const addFeedback = React.useCallback((log: FeedbackLog) => {
    setFeedbackLog((prev) => [...prev, log]);
  }, []);

  const updateDna = React.useCallback(
    (patch: Partial<BusinessCanvasData>) => {
      setDna((prev) => ({ ...prev, ...patch }));
    },
    [setDna]
  );

  const value: ChainContextValue = React.useMemo(
    () => ({
      competitors,
      segments,
      dna,
      strategyOutput,
      dailyRecords,
      feedbackLog,
      streakCount,
      setCompetitors,
      setSegments,
      setDna,
      updateDna,
      setStrategyOutput,
      addPulseRecord,
      addFeedback,
    }),
    [competitors, segments, dna, strategyOutput, dailyRecords, feedbackLog, streakCount]
  );

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>;
}

export function useChain(): ChainContextValue {
  const ctx = React.useContext(ChainContext);
  if (!ctx) throw new Error("useChain must be used within ChainProvider");
  return ctx;
}
