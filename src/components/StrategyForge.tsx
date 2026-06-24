import React from "react";
import { StrategyArea } from "../types";
import { API_BASE } from "../api";
import { useChain } from "../store/ChainContext";
import AIFeedback from "./AIFeedback";
import { Zap, Shield, Sparkles, Copy, CheckCircle2, Loader2 } from "lucide-react";

export default function StrategyForge() {
  const { dna, competitors, strategyOutput, setStrategyOutput } = useChain();
  const [level, setLevel] = React.useState<"Konservatif" | "Moderat" | "Agresif">("Moderat");
  const [loading, setLoading] = React.useState(false);
  const [strategyIntro, setStrategyIntro] = React.useState(
    strategyOutput?.synopsis || "STRATEGI AMAN BERKELANJUTAN: Pelayanan prima dipadu dengan retensi loyalitas seimbang."
  );
  const [areas, setAreas] = React.useState<StrategyArea[]>(strategyOutput?.pillars || []);
  const [copiedText, setCopiedText] = React.useState(false);

  const cacheRef = React.useRef({ dnaHash: "", competitorsHash: "" });

  const fetchStrategy = async (optLevel: "Konservatif" | "Moderat" | "Agresif") => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/strategy-forge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna,
          optimismLevel: optLevel,
          competitors: competitors.filter((c) => c.name.trim()),
        }),
      });
      const data = await response.json();
      if (data.pillars) {
        setAreas(data.pillars);
        setStrategyIntro(data.synopsis || data.intro || "");
        setStrategyOutput({ pillars: data.pillars, synopsis: data.synopsis || "" });
      }
    } catch (err) {
      console.error(err);
      alert("Gagal meramu strategi. Silakan periksa jaringan dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const newDnaHash = JSON.stringify(dna);
    const newCompHash = JSON.stringify(competitors);
    if (newDnaHash === cacheRef.current.dnaHash && newCompHash === cacheRef.current.competitorsHash) {
      return;
    }
    cacheRef.current.dnaHash = newDnaHash;
    cacheRef.current.competitorsHash = newCompHash;
    fetchStrategy(level);
  }, [dna, level, competitors]);

  const handleLevelChange = (newLevel: "Konservatif" | "Moderat" | "Agresif") => {
    setLevel(newLevel);
    cacheRef.current.dnaHash = "";
    fetchStrategy(newLevel);
  };

  const copyStrategySummary = () => {
    let summaryText = `🔥 PLAN MAXXSALES STRATEGY - LEVEL: ${level} 🔥\n\n`;
    summaryText += `${strategyIntro}\n\n`;
    areas.forEach((area, i) => {
      summaryText += `${i + 1}. [${area.areaName}] - ${area.title}\n`;
      summaryText += `   Deskripsi: ${area.description}\n`;
      area.actionSteps.forEach((step) => {
        summaryText += `   - [ ] ${step}\n`;
      });
      summaryText += `\n`;
    });

    navigator.clipboard.writeText(summaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#262626] gap-4">
        <div>
          <h2 className="text-xl font-light tracking-tight flex items-center space-x-2 text-neutral-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-[#E5E5E5]"></span>
            <span>Strategy Fusion Co-Pilot</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
            AI menggabungkan DNA, data kompetitor, dan segmen pelanggan Anda untuk menggodok strategi taktis.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-copy-strategy-plan"
            onClick={copyStrategySummary}
            className="px-3.5 py-1.5 rounded text-xs font-mono border hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] border-neutral-350 dark:border-[#262626] text-neutral-800 dark:text-neutral-200 flex items-center space-x-1.5 transition-colors"
          >
            {copiedText ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? "Tersalin!" : "Salin Rencana Rapi"}</span>
          </button>
        </div>
      </div>

      {/* Optimism Level Buttons */}
      <div className="p-5 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-4">
        <span className="text-[10px] font-bold font-mono text-neutral-450 dark:text-[#737373] uppercase tracking-wider block">
          Tingkat Optimisme Risiko Bisnis (Modulasi AI)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: "Konservatif", desc: "Aman, Tanpa Modal Iklan", icon: Shield },
            { key: "Moderat", desc: "Seimbang & Terukur", icon: Sparkles },
            { key: "Agresif", desc: "Masif, Ekspansi Maksimal", icon: Zap },
          ].map((lvl) => {
            const IconComp = lvl.icon;
            const isActive = level === lvl.key;
            return (
              <button
                id={`btn-strategy-level-${lvl.key}`}
                key={lvl.key}
                disabled={loading}
                onClick={() => handleLevelChange(lvl.key as any)}
                className={`p-4 rounded border text-left transition-colors ${
                  isActive
                    ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent"
                    : "bg-transparent border-neutral-250 dark:border-[#262626] text-neutral-600 dark:text-[#A3A3A3] hover:border-neutral-450 dark:hover:border-neutral-750"
                }`}
              >
                <div className="flex items-center space-x-2 mb-1.5 text-xs font-bold font-mono uppercase tracking-wide">
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{lvl.key}</span>
                </div>
                <p className={`text-[10px] ${isActive ? "text-neutral-350 dark:text-neutral-700" : "text-neutral-400 dark:text-neutral-500"} line-clamp-1`}>
                  {lvl.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategy Display Zone */}
      {loading ? (
        <div className="p-20 text-center rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-6 h-6 text-neutral-900 dark:text-white animate-spin" />
          <p className="text-[11px] text-neutral-550 dark:text-neutral-450 font-mono text-center max-w-md">
            Bekerja di server proxy... AI sedang menganalisis keunggulan {dna.productName || "UKM"} Anda beserta {competitors.length} kompetitor...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Intro card */}
          <div className="p-4 rounded border bg-neutral-50 dark:bg-[#1A1A1A] border-neutral-201 dark:border-[#262626] text-xs text-neutral-750 dark:text-neutral-300">
            <strong className="font-bold flex items-center space-x-1.5 text-neutral-950 dark:text-white uppercase text-[9px] tracking-wider mb-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SINOPSIS POLA STRATEGI {level.toUpperCase()}</span>
            </strong>
            <p className="leading-relaxed">{strategyIntro}</p>
            <AIFeedback promptType="strategy" responseId={`strategy-${level}-${Date.now()}`} />
          </div>

          {/* Strategy Areas grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map((area, idx) => (
              <div
                key={idx}
                className="p-5 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] flex flex-col justify-between transition-colors hover:border-neutral-400 dark:hover:border-neutral-700"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono text-neutral-800 dark:text-[#E5E5E5] bg-neutral-100 dark:bg-[#262626] px-2 py-0.5 rounded uppercase tracking-wider">
                      Pilar {idx + 1}: {area.areaName}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white mb-1.5">{area.title}</h3>
                  <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] leading-relaxed mb-4">{area.description}</p>
                </div>

                <div className="border-t pt-3 border-neutral-150 dark:border-[#262626] space-y-2.5">
                  <span className="text-[9px] font-bold font-mono uppercase text-neutral-450 dark:text-[#737373] block tracking-wide">
                    Langkah Action Items:
                  </span>
                  <ul className="space-y-2 text-[11px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {area.actionSteps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-850 dark:text-neutral-300 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
