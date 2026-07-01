import React from "react";
import { BusinessCanvasData } from "../types";
import { API_BASE } from "../api";
import { useChain } from "../store/ChainContext";
import AIFeedback from "./AIFeedback";
import { Sparkles, CheckSquare, TrendingUp, RefreshCw, BarChart2, Target, Users, Bell, ChevronRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

export default function DailyPulse() {
  const { dna, strategyOutput, dailyRecords, addPulseRecord, streakCount, competitors, segments } = useChain();
  const [loading, setLoading] = React.useState(false);
  const [briefing, setBriefing] = React.useState("");

  // Generate AI briefing on mount
  React.useEffect(() => {
    if (!dna.productName) {
      setBriefing("Selamat pagi! Isi DNA bisnis Anda terlebih dahulu untuk mendapatkan briefing personal.");
      return;
    }
    const fetchBriefing = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: `Buat briefing pagi singkat (2-3 kalimat) untuk pemilik bisnis "${dna.brand || "Bisnis Anda"}" yang menjual ${dna.productName || "produk"} (kategori ${dna.category || "-"}, harga Rp${dna.normalPrice || 0}). Target revenue: Rp${(dna.targetMonthlyRevenue || 0).toLocaleString()}/bln. Sertakan satu saran aksi konkret untuk hari ini. Bahasa Indonesia, nada motivasi, singkat.` }],
            dna
          })
        });
        const data = await response.json();
        if (data.reply) {
          setBriefing(data.reply);
        } else {
          setBriefing(`Selamat pagi! Hari baru, semangat baru untuk ${dna.productName || "bisnis Anda"}. Fokus pada action item di bawah ini untuk mencapai target harian.`);
        }
      } catch {
        setBriefing(`Selamat pagi! Hari baru, semangat baru untuk ${dna.productName || "bisnis Anda"}. Fokus pada action item di bawah ini.`);
      }
    };
    fetchBriefing();
  }, [dna.productName, dna.brand, dna.category]);

  // Tactical Briefing state (3-chain output)
  const [tacticalGap, setTacticalGap] = React.useState("");
  const [tacticalSteps, setTacticalSteps] = React.useState<{ id: string; text: string; done: boolean; category: string }[]>([]);
  const [waTemplate, setWaTemplate] = React.useState("");
  const [socialCopy, setSocialCopy] = React.useState("");
  const [radarIntel, setRadarIntel] = React.useState("");

  // Dynamic action items pool - more creative and varied
  const allTasks = React.useMemo(() => [
    { text: `Buat 3 konten Story Instagram tentang ${dna.productName || "produk"} dengan angle berbeda`, category: "Marketing" },
    { text: "Kirim broadcast WA promo ke 10 grup pelanggan teraktif hari ini", category: "Sales" },
    { text: "Analisis 3 postingan kompetitor terlaris minggu ini di Instagram", category: "Competitor" },
    { text: "Hubungi pelanggan yang rating LTV-nya di atas 80 untuk repeat order", category: "Retention" },
    { text: "Review stok produk paling laris & pastikan aman sampai akhir minggu", category: "Operasional" },
    { text: "Buat 1 video Reels unboxing atau behind-the-scenes produk", category: "Marketing" },
    { text: "Kirim voucher spesial ke 5 pelanggan yang belum beli 2 minggu terakhir", category: "Retention" },
    { text: "Screenshot harga kompetitor di Shopee/Tokopedia dan bandingkan", category: "Competitor" },
    { text: "Siapkan 2 caption Instagram berbeda untuk produk terlaris Anda", category: "Marketing" },
    { text: "Hitung omzet kemarin vs target, catat di Daily Pulse", category: "Operasional" },
    { text: "Buat 1 konten carousel tips & trik yang relevan dengan produk Anda", category: "Marketing" },
    { text: "Follow 5 akun influencer potensial di niche bisnis Anda", category: "Sales" },
    { text: "Cek rating & review di marketplace, balas 3 ulasan terbaru", category: "Retention" },
    { text: "Ambil foto produk terbaru untuk digunakan di konten minggu ini", category: "Marketing" },
    { text: "Buat daftar 3 ide konten yang bisa dipost minggu depan", category: "Marketing" },
    { text: "Pelajari 1 tren terbaru di TikTok yang relevan dengan produk Anda", category: "Competitor" },
    { text: "Kirim pesan personal ke 3 pelanggan setia sebagai bentuk apresiasi", category: "Retention" },
    { text: "Periksa semua kanal penjualan dan pastikan harga konsisten", category: "Operasional" },
    { text: "Buat 1 postingan dengan format Before-After atau Testimoni pelanggan", category: "Marketing" },
    { text: "Tawarkan bundle promo spesial untuk pelanggan yang beli lebih dari 2 item", category: "Sales" },
  ], [dna.productName]);

  const [items, setItems] = React.useState(() => {
    const shuffled = [...allTasks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).map((t, i) => ({
      id: String(i + 1),
      text: t.text,
      done: false,
      category: t.category
    }));
  });

  const refreshTasks = () => {
    const shuffled = [...allTasks].sort(() => Math.random() - 0.5);
    setItems(shuffled.slice(0, 5).map((t, i) => ({
      id: String(Date.now() + i),
      text: t.text,
      done: false,
      category: t.category
    })));
  };

  // Revenue tracking state
  const [yesterdayRevenue, setYesterdayRevenue] = React.useState<number>(() => {
    return Number(localStorage.getItem("maxx_sales_yesterday_revenue")) || 0;
  });
  const [todayTarget, setTodayTarget] = React.useState<number>(() => {
    return Number(localStorage.getItem("maxx_sales_today_target")) || Math.round((dna.targetMonthlyRevenue || 50000000) / 30);
  });

  React.useEffect(() => {
    localStorage.setItem("maxx_sales_yesterday_revenue", String(yesterdayRevenue));
    localStorage.setItem("maxx_sales_today_target", String(todayTarget));
  }, [yesterdayRevenue, todayTarget]);

  // Auto-save revenue to dailyRecords when user inputs data
  React.useEffect(() => {
    if (yesterdayRevenue <= 0) return;
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const existing = dailyRecords.find(r => r.date === yesterdayStr);
    if (existing) return; // Already saved

    const achievement = todayTarget > 0 ? Math.round((yesterdayRevenue / todayTarget) * 100) : 0;
    addPulseRecord({
      date: yesterdayStr,
      briefing: "",
      completedCount: 0,
      pendingItems: [],
      activeStrategies: [],
      streakCount: streakCount,
      yesterdayRevenue,
      todayTarget,
      dailyAchievement: achievement,
    });
  }, [yesterdayRevenue, todayTarget]);

  // Derived calculations
  const doneCount = items.filter((x) => x.done).length;
  const progressPercent = Math.round((doneCount / items.length) * 100);
  const monthlyTarget = dna.targetMonthlyRevenue || 50000000;
  const dailyAvgTarget = Math.round(monthlyTarget / 30);
  const dailyAchievement = todayTarget > 0 ? Math.round((yesterdayRevenue / todayTarget) * 100) : 0;

  // Chart period state
  type ChartPeriod = "week" | "month" | "year" | "all";
  const [chartPeriod, setChartPeriod] = React.useState<ChartPeriod>("week");

  // Aggregate revenue data from dailyRecords
  const chartData = React.useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Add today's data if input exists
    const allRecords = [...dailyRecords];
    if (yesterdayRevenue > 0) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      if (!allRecords.find(r => r.date === yesterdayStr)) {
        allRecords.push({
          date: yesterdayStr,
          briefing: "",
          completedCount: 0,
          pendingItems: [],
          activeStrategies: [],
          streakCount: 0,
          yesterdayRevenue,
          todayTarget,
          dailyAchievement,
        });
      }
    }

    // Filter by period
    let filtered = allRecords;
    if (chartPeriod === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = allRecords.filter(r => new Date(r.date) >= weekAgo);
    } else if (chartPeriod === "month") {
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      filtered = allRecords.filter(r => new Date(r.date) >= monthAgo);
    } else if (chartPeriod === "year") {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      filtered = allRecords.filter(r => new Date(r.date) >= yearAgo);
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Map to chart format
    return filtered.map(r => {
      const d = new Date(r.date);
      const label = chartPeriod === "week"
        ? d.toLocaleDateString("id-ID", { weekday: "short" })
        : chartPeriod === "month"
        ? `${d.getDate()}/${d.getMonth() + 1}`
        : chartPeriod === "year"
        ? d.toLocaleDateString("id-ID", { month: "short" })
        : r.date;
      return {
        name: label,
        omzet: r.yesterdayRevenue || 0,
        target: r.todayTarget || dailyAvgTarget,
      };
    });
  }, [dailyRecords, chartPeriod, yesterdayRevenue, todayTarget, dailyAchievement, dailyAvgTarget]);

  // ── Tactical Briefing: markdown parser ────────────────────────
  function parseTacticalMarkdown(md: string) {
    const blocks = md.split(/^### /m);
    const sec1 = blocks.find(b => b.startsWith("1.")) ?? "";
    const sec2 = blocks.find(b => b.startsWith("2.")) ?? "";
    const sec3 = blocks.find(b => b.startsWith("3.")) ?? "";

    // Section 1: gap text (strip the header line)
    const gapLines = sec1.split("\n");
    const gapText = gapLines.slice(1).join("\n").trim();

    // Section 2: parse numbered action items with **Verb** pattern
    const stepLines = sec2.split("\n").filter(l => /^\d+\.\s/.test(l.trim()));
    const steps = stepLines.map((line, i) => {
      const cleaned = line
        .replace(/^\d+\.\s+/, "")          // strip "1. "
        .replace(/\*\*(.+?)\*\*/g, "$1")   // strip **bold**
        .replace(/\*(.+?)\*/g, "$1")        // strip *italic*
        .replace(/`(.+?)`/g, "$1")          // strip `code`
        .trim();

      // Extract the first word as category hint
      const firstWord = cleaned.split(/\s+/)[0]?.replace(/[.:,;!?]/g, "") || "Eksekusi";

      return {
        id: `tactical-${i}`,
        text: cleaned,
        done: false,
        category: firstWord,
      };
    });

    // Section 3: extract WhatsApp template & social copy from code blocks
    const waMatch = sec3.match(/```[\s\S]*?```/);
    const waText = waMatch ? waMatch[0].replace(/```/g, "").trim() : "";

    // Second code block = social copy
    const allCodeBlocks = sec3.match(/```[\s\S]*?```/g);
    const socialText = allCodeBlocks && allCodeBlocks.length > 1
      ? allCodeBlocks[1].replace(/```/g, "").trim()
      : "";

    return { gapText, steps, waText, socialText };
  }

  // ── Tactical Briefing: input builder from ChainContext ──────
  function buildTacticalInput() {
    const topComp = competitors[0];
    const topSegment = [...segments].sort((a, b) => b.percentage - a.percentage)[0];
    const churnSegment = segments.find(s => s.risk === "High");

    return {
      dna: {
        brand: dna.brand || "Brand Anda",
        productName: dna.productName,
        category: dna.category,
        advantages: dna.advantages,
        normalPrice: dna.normalPrice,
        targetMonthlyRevenue: dna.targetMonthlyRevenue,
        activeSocialMedia: dna.activeSocialMedia?.length ? dna.activeSocialMedia : ["Instagram", "WhatsApp"],
        businessContact: dna.businessContact || "-",
        peakHours: dna.peakHours || "09:00-11:00 & 19:00-21:00",
        topConvertingChannel: dna.topConvertingChannel || "WhatsApp DM",
      },
      warRoom: {
        competitors: competitors.filter(c => c.name?.trim()).map(c => ({
          name: c.name,
          biggestWeakness: c.weaknesses || "-",
          priceGap: c.averagePrice || "-",
          blindSpot: c.opportunities || "-",
        })),
        topMarketThreat: competitors[0]?.threats || "Belum teridentifikasi",
        untappedOpportunity: competitors[0]?.opportunities || "Belum teridentifikasi",
      },
      customerInsight: {
        topSegment: topSegment?.name || "Pelanggan Setia",
        topComplaint: "Butuh variasi produk & respon cepat",
        topDesire: "Produk eksklusif dengan harga kompetitif",
        churnRiskSegment: churnSegment?.name || "Belum teridentifikasi",
        avgTransactionGap: topSegment
          ? `Rp ${((dna.normalPrice * 1.5) - topSegment.avgTransaction).toLocaleString()} gap`
          : "Belum terhitung",
      },
      daily: {
        yesterdayRevenue,
        todayTarget,
        dailyAchievementPct: dailyAchievement,
        activeStrategies: strategyOutput?.pillars?.map(p => p.title) ?? [],
        pendingItems: items.filter(x => !x.done).map(x => x.text),
        streakDays: streakCount,
      },
    };
  }

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const payload = buildTacticalInput();

      const response = await fetch(`${API_BASE}/api/tactical-briefing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.markdown) {
        const parsed = parseTacticalMarkdown(data.markdown);

        setTacticalGap(parsed.gapText);
        setBriefing(parsed.gapText); // backward compat — keep existing briefing display
        setTacticalSteps(parsed.steps);
        setItems(parsed.steps); // overwrite hardcoded items
        setWaTemplate(parsed.waText);
        setSocialCopy(parsed.socialText);

        // Radar intel: extract first impactful sentence from gap
        const gapSentences = parsed.gapText.split(/[.!?]\s+/).filter(Boolean);
        setRadarIntel(
          gapSentences.length > 0
            ? gapSentences[0] + "."
            : parsed.gapText.slice(0, 150)
        );

        addPulseRecord({
          date: new Date().toISOString().split("T")[0],
          briefing: parsed.gapText,
          completedCount: 0,
          pendingItems: parsed.steps.map(s => s.text),
          activeStrategies: strategyOutput?.pillars?.map(p => p.title) ?? [],
          streakCount,
          yesterdayRevenue,
          todayTarget,
          dailyAchievement,
        });
      }
    } catch (err) {
      console.error("Tactical Briefing fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  return (
    <div className="space-y-6">
      {/* Intro header */}
      <div className="border-b pb-4 border-neutral-200 dark:border-[#262626]">
        <h2 className="text-xl font-light tracking-tight flex items-center space-x-2 text-neutral-900 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-[#E5E5E5]"></span>
          <span>Daily Sales Pulse Core</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
          Ulas sinyal harian operasional Anda. Selesaikan daftar tugas taktis pencetak closingan, lacak rasio omzet, dan pantau radar pasar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: BRIEFING & CHECKLIST (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Morning briefing panel */}
          <div className="p-5 rounded border bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-3xl opacity-5 bg-neutral-400 pointer-events-none"></div>

            <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-[#262626] mb-3">
              <h3 className="text-xs font-bold flex items-center space-x-1.5 text-neutral-850 dark:text-white font-mono tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-neutral-500 dark:text-[#A3A3A3]" />
                <span>MORNING BRIEFING CO-PILOT</span>
              </h3>

              <button
                id="btn-refresh-briefing"
                onClick={fetchBriefing}
                disabled={loading}
                className="p-1 px-2.5 rounded bg-white dark:bg-[#171717] border border-neutral-200 dark:border-[#262626] text-[10px] font-mono text-neutral-700 dark:text-[#A3A3A3] hover:bg-neutral-50 dark:hover:bg-[#262626]"
                title="Refresh Briefing"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span className="ml-1">Acak Tips Baru</span>
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-neutral-500 dark:text-[#A3A3A3] font-mono flex items-center justify-center space-x-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses data DNA untuk menyusun resep penjualan harian...</span>
              </div>
            ) : (
              <>
                <p className="text-xs sm:text-sm leading-relaxed text-neutral-650 dark:text-[#A3A3A3]">{briefing}</p>
                <AIFeedback promptType="pulse" responseId={`pulse-${Date.now()}`} />
              </>
            )}
          </div>

          {/* Action item checklist */}
          <div className="p-6 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-neutral-150 dark:border-[#1A1A1A] gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center space-x-2 text-neutral-900 dark:text-white">
                  <CheckSquare className="w-4 h-4 text-neutral-850 dark:text-white" />
                  <span>Daftar Pekerjaan Penjualan Harian</span>
                </h3>
                <p className="text-[10px] text-neutral-400 dark:text-[#737373]">Centang pekerjaan yang selesai untuk menaikkan rasio kemapanan omzet.</p>
              </div>

              <div className="text-right shrink-0">
                <button
                  onClick={refreshTasks}
                  className="text-[9px] font-mono text-neutral-400 hover:text-neutral-700 dark:hover:text-white flex items-center space-x-1 mb-1"
                  title="Acak ulang pekerjaan"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Acak Ulang</span>
                </button>
                <span className="text-[9px] font-mono text-neutral-450 dark:text-[#737373] font-bold block uppercase tracking-wider">KETERAMPILAN SELESAI</span>
                <span className="text-xs font-bold font-mono text-neutral-900 dark:text-white">
                  {progressPercent}% ({doneCount}/{items.length})
                </span>
              </div>
            </div>

            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-neutral-900 dark:bg-[#E5E5E5] h-1.5 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="space-y-2 pt-2">
              {items.map((it) => (
                <button
                  id={`btn-todo-toggle-${it.id}`}
                  key={it.id}
                  onClick={() => toggleItem(it.id)}
                  className={`w-full p-3.5 rounded border text-left flex items-start space-x-3 transition-colors ${
                    it.done
                      ? "bg-neutral-50/50 dark:bg-neutral-950/20 border-neutral-200 dark:border-neutral-900 opacity-60 line-through"
                      : "bg-neutral-50 dark:bg-[#171717] border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {it.done ? (
                      <div className="w-4 h-4 rounded bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-neutral-350 dark:border-[#3F3F46]"></div>
                    )}
                  </div>

                  <div className="flex-1 text-xs">
                    <p className={`text-neutral-850 dark:text-[#E5E5E5] ${it.done ? "text-neutral-500" : "font-medium"}`}>{it.text}</p>
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase mt-2 inline-block bg-neutral-200/50 dark:bg-[#262626] text-neutral-500 dark:text-[#737373]">
                      • {it.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amunisi Komunikasi — from Chain 3 */}
          {(waTemplate || socialCopy) && (
            <div className="p-6 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-neutral-150 dark:border-[#1A1A1A]">
                <h3 className="text-sm font-bold flex items-center space-x-2 text-neutral-900 dark:text-white">
                  <span className="text-base">💬</span>
                  <span>Amunisi Komunikasi (Siap Pakai)</span>
                </h3>
              </div>

              {waTemplate && (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold font-mono uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Template WhatsApp
                  </span>
                  <div className="relative">
                    <pre className="p-3 rounded bg-emerald-50 dark:bg-[#0f1a14] border border-emerald-200 dark:border-emerald-900/40 text-xs leading-relaxed text-neutral-800 dark:text-[#E5E5E5] whitespace-pre-wrap font-sans">
                      {waTemplate}
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(waTemplate)}
                      className="absolute top-2 right-2 p-1.5 rounded bg-white dark:bg-[#171717] border border-neutral-200 dark:border-[#262626] text-[10px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      title="Copy WhatsApp"
                    >
                      📋 Salin
                    </button>
                  </div>
                </div>
              )}

              {socialCopy && (
                <div className="space-y-2">
                  <span className="text-[9px] font-bold font-mono uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                    Copywriting Media Sosial
                  </span>
                  <div className="relative">
                    <pre className="p-3 rounded bg-purple-50 dark:bg-[#13101a] border border-purple-200 dark:border-purple-900/40 text-xs leading-relaxed text-neutral-800 dark:text-[#E5E5E5] whitespace-pre-wrap font-sans">
                      {socialCopy}
                    </pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(socialCopy)}
                      className="absolute top-2 right-2 p-1.5 rounded bg-white dark:bg-[#171717] border border-neutral-200 dark:border-[#262626] text-[10px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      title="Copy Social"
                    >
                      📋 Salin
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REVENUE KPI & RADAR ALERTS (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue Tracking Input */}
          <div className="p-5 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-4">
            <div className="flex items-center space-x-1.5 text-neutral-550 border-b pb-2 border-neutral-100 dark:border-[#1A1A1A]">
              <Target className="w-4 h-4 text-neutral-500 dark:text-[#737373]" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-900 dark:text-[#A3A3A3]">Pencapaian Omzet</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-mono font-semibold text-neutral-450 dark:text-[#737373] block mb-1 uppercase">Omzet Kemarin (Rp)</label>
                <input
                  type="number"
                  value={yesterdayRevenue || ""}
                  onChange={(e) => setYesterdayRevenue(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-sm px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono font-semibold text-neutral-450 dark:text-[#737373] block mb-1 uppercase">Target Hari Ini (Rp)</label>
                <input
                  type="number"
                  value={todayTarget || ""}
                  onChange={(e) => setTodayTarget(Number(e.target.value))}
                  placeholder="0"
                  className="w-full text-sm px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded bg-neutral-900 text-white dark:bg-[#171717] border border-transparent dark:border-[#262626] text-center space-y-1">
              <span className="text-[9px] font-mono uppercase text-neutral-450 dark:text-[#737373]">PENCAPAIAN KEMARIN</span>
              <p className="text-2xl font-black font-mono">
                {dailyAchievement}%
                {yesterdayRevenue > 0 && (
                  <span className={`text-xs ml-2 ${dailyAchievement >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {dailyAchievement >= 100 ? '✓ Over Target' : '⚡ Kejar Target!'}
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-mono text-neutral-450 dark:text-[#737373]">
                <span>Avg harian DNA: Rp {dailyAvgTarget.toLocaleString("id-ID")}</span>
                <span>× 30 hari</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${dailyAchievement >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(dailyAchievement, 100)}%` }}
                />
              </div>
              <p className="text-[9px] font-mono text-neutral-400 dark:text-[#737373]">
                Target Bulanan: Rp {monthlyTarget.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Revenue Visualization Chart */}
          <div className="p-5 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-neutral-100 dark:border-[#1A1A1A]">
              <div className="flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-neutral-500" />
                <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-900 dark:text-[#A3A3A3]">Visualisasi Omzet</h4>
              </div>
            </div>

            {/* Period filter */}
            <div className="flex gap-1">
              {([
                { key: "week" as ChartPeriod, label: "Minggu" },
                { key: "month" as ChartPeriod, label: "Bulan" },
                { key: "year" as ChartPeriod, label: "Tahun" },
                { key: "all" as ChartPeriod, label: "Semua" },
              ]).map(p => (
                <button
                  key={p.key}
                  onClick={() => setChartPeriod(p.key)}
                  className={`px-2 py-1 rounded text-[9px] font-mono transition-colors ${
                    chartPeriod === p.key
                      ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black font-bold"
                      : "bg-transparent border border-neutral-200 dark:border-[#262626] text-neutral-500 hover:border-neutral-400"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Bar Chart */}
            {chartData.length > 0 ? (
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#737373', fontSize: 8, fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#525252', fontSize: 8, fontFamily: 'monospace' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v >= 1000000 ? `${(v/1000000).toFixed(0)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : v}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161616',
                        borderColor: '#262626',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: 'white',
                        borderRadius: '4px'
                      }}
                      formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, '']}
                    />
                    <ReferenceLine
                      y={dailyAvgTarget}
                      stroke="#525252"
                      strokeDasharray="3 3"
                      label={{ value: "Target", fill: '#737373', fontSize: 8, fontFamily: 'monospace', position: 'right' }}
                    />
                    <Bar dataKey="omzet" radius={[3, 3, 0, 0]} maxBarSize={32}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={entry.omzet >= entry.target ? "#10b981" : "#f59e0b"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-[10px] font-mono text-neutral-400 dark:text-[#737373]">
                Mulai input omzet harian untuk melihat grafik
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-3 text-[9px] font-mono text-neutral-400 dark:text-[#737373]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Over Target
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm bg-amber-500" /> Under Target
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-neutral-500 border-dashed" /> Target DNA
              </span>
            </div>
          </div>

          {/* Market notification alerts */}
          <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-[#111111] space-y-2">
            <h4 className="text-[10px] font-bold font-mono text-red-500 dark:text-[#737373] uppercase tracking-widest flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-neutral-400" />
              <span>RADAR PASAR KOMPETITOR</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-[#A3A3A3]">
              {radarIntel || (
                <>Pesaing utama Anda <strong className="font-semibold text-neutral-805 dark:text-white">{dna.biggestCompetitor || "Zahra Store"}</strong> mendetect volume kampanye visual Anda. Klik <strong>"Acak Tips Baru"</strong> untuk mendapatkan briefing taktis terkini.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
