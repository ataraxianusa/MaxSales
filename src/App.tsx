import React from "react";
import { Routes, Route, useNavigate, useLocation, useParams } from "react-router-dom";
import { API_BASE } from "./api";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import AboutPage from "./components/AboutPage";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import RiskDisclosure from "./components/RiskDisclosure";
import BusinessCanvas from "./components/BusinessCanvas";
import CompetitorWarRoom from "./components/CompetitorWarRoom";
import CustomerInsight from "./components/CustomerInsight";
import StrategyForge from "./components/StrategyForge";
import ContentGenerator from "./components/ContentGenerator";
import DailyPulse from "./components/DailyPulse";
import FloatingChatbot from "./components/FloatingChatbot";
import UserTour from "./components/UserTour";
import PartnerDashboard from "./pages/PartnerDashboard";
import AdminPromos from "./pages/AdminPromos";
import { ChainProvider, useChain } from "./store/ChainContext";
import { useDNAAutoUpdate } from "./hooks/useDNAAutoUpdate";
import { 
  BusinessCanvasData, 
  CompetitorIntel, 
  CustomerSegment, 
  defaultCanvasData, 
  defaultCompetitors, 
  defaultSegments 
} from "./types";
import { 
  Layers, 
  Target, 
  TrendingUp, 
  Zap, 
  Image, 
  MonitorSmartphone, 
  Sparkles,
  BookOpen,
  Sun,
  Moon,
  AlertTriangle,
  X
} from "lucide-react";

function DNANotificationBanner() {
  const { dna, dailyRecords, updateDna } = useChain();
  const suggestion = useDNAAutoUpdate(dna, dailyRecords, updateDna);
  const [dismissed, setDismissed] = React.useState(false);

  if (!suggestion || dismissed) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-4">
      <div className="p-4 rounded border bg-amber-500/10 border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-amber-700 dark:text-amber-300">{suggestion.message}</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={suggestion.action}
              className="px-3 py-1 rounded text-[10px] font-mono font-bold bg-amber-500 text-black hover:bg-amber-600 transition-colors"
            >
              Update Sekarang
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1 rounded text-[10px] font-mono border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-amber-500/50 hover:text-amber-500 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function PartnerDashboardWrapper() {
  const { code } = useParams();
  return (
    <PartnerDashboard
      partnerCode={code || "PARTNER"}
      onLogout={() => window.location.href = "/"}
      onBack={() => window.history.back()}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme state
  const [darkMode, setDarkMode] = React.useState<boolean>(true);

  // App routing state: "landing" | "login" | "dashboard"
  const [currentTab, setTab] = React.useState<"landing" | "login" | "dashboard">("landing");

  // Authentication & wizard state
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(() => {
    return localStorage.getItem("maxx_sales_logged_in") === "true";
  });

  const [isDnaFilled, setIsDnaFilled] = React.useState<boolean>(() => {
    return localStorage.getItem("maxx_sales_dna_filled") === "true";
  });

  const [dnaWasEverFilled, setDnaWasEverFilled] = React.useState<boolean>(() => {
    return localStorage.getItem("maxx_sales_dna_filled") !== null;
  });

  // Dashboard Sub-navigation Tab
  // "competitor" | "customer" | "strategy" | "content" | "pulse"
  const [dashTab, setDashTab] = React.useState<"competitor" | "customer" | "strategy" | "content" | "pulse">("pulse");

  // If user is already logged in, automatically proceed to dashboard if they want to enter
  React.useEffect(() => {
    if (isLoggedIn && currentTab === "login") {
      setTab("dashboard");
    }
  }, [isLoggedIn, currentTab]);

  // Global persistent states (Business DNA, competitors, segments)
  const [canvas, setCanvas] = React.useState<BusinessCanvasData>(() => {
    const saved = localStorage.getItem("maxx_sales_dna");
    return saved ? JSON.parse(saved) : defaultCanvasData();
  });

  const [competitors, setCompetitors] = React.useState<CompetitorIntel[]>(() => {
    const saved = localStorage.getItem("maxx_sales_competitors");
    return saved ? JSON.parse(saved) : defaultCompetitors();
  });

  const [segments, setSegments] = React.useState<CustomerSegment[]>(() => {
    const saved = localStorage.getItem("maxx_sales_segments");
    return saved ? JSON.parse(saved) : defaultSegments();
  });

  // Auto-generate segments from DNA when DNA is filled
  React.useEffect(() => {
    if (!canvas.productName?.trim()) return;

    const fetchAutoSegment = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auto-segment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dna: canvas })
        });
        const data = await response.json();
        if (data.segments && data.segments.length > 0 && data.mode === "live-ai") {
          setSegments(data.segments);
        }
      } catch (err) {
        console.error("Auto-segment failed:", err);
      }
    };

    const timer = setTimeout(fetchAutoSegment, 2000);
    return () => clearTimeout(timer);
  }, [canvas.productName, canvas.category, canvas.normalPrice, canvas.brand]);

  // Sync state to localStorage
  React.useEffect(() => {
    localStorage.setItem("maxx_sales_dna", JSON.stringify(canvas));
  }, [canvas]);

  React.useEffect(() => {
    localStorage.setItem("maxx_sales_competitors", JSON.stringify(competitors));
  }, [competitors]);

  React.useEffect(() => {
    localStorage.setItem("maxx_sales_segments", JSON.stringify(segments));
  }, [segments]);

  // Sync DNA competitor data → CompetitorWarRoom (debounced)
  const dnaSyncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (dnaSyncTimerRef.current) clearTimeout(dnaSyncTimerRef.current);

    dnaSyncTimerRef.current = setTimeout(() => {
      if (!canvas.biggestCompetitor?.trim()) return;

      const dnaCompId = "dna-" + canvas.biggestCompetitor.toLowerCase().replace(/\s+/g, "-").slice(0, 20);

      const dnaCompetitor: CompetitorIntel = {
        id: dnaCompId,
        name: canvas.biggestCompetitor,
        location: "-",
        averagePrice: canvas.priceRange || "-",
        activeChannels: canvas.activeSocialMedia || [],
        strengths: canvas.competitorStrengths || "",
        weaknesses: canvas.competitorWeaknesses || "",
        opportunities: "",
        threats: "",
        estimatedRevenue: canvas.monthlyRevenueRange || "-",
      };

      // Only remove hardcoded competitors (comp-1, comp-2) and existing dna-* competitors
      // Keep ALL user-created competitors (comp-1719412345678 etc.)
      const manualOnly = competitors.filter(c => !c.id.startsWith("dna-") && c.id !== "comp-1" && c.id !== "comp-2");

      // Add single DNA competitor at top, keep manual ones below
      setCompetitors([dnaCompetitor, ...manualOnly]);
    }, 800);

    return () => {
      if (dnaSyncTimerRef.current) clearTimeout(dnaSyncTimerRef.current);
    };
  }, [canvas.biggestCompetitor, canvas.competitorStrengths, canvas.competitorWeaknesses]);

  // State to track completion/engagement status of the 5 key features
  const [featureEngagement, setFeatureEngagement] = React.useState<{
    competitor: boolean;
    customer: boolean;
    strategy: boolean;
    content: boolean;
    pulse: boolean;
  }>(() => {
    const saved = localStorage.getItem("maxx_sales_feature_engagement_v2");
    if (saved) return JSON.parse(saved);
    return {
      competitor: false,
      customer: false,
      strategy: false,
      content: false,
      pulse: false,
    };
  });

  // Sync engagement progress to localStorage
  React.useEffect(() => {
    localStorage.setItem("maxx_sales_feature_engagement_v2", JSON.stringify(featureEngagement));
  }, [featureEngagement]);

  // Auto-detect feature engagement based on user activity & inputs
  React.useEffect(() => {
    // If user added/customized more than default 2 competitors
    if (competitors.length > 2) {
      setFeatureEngagement(prev => prev.competitor ? prev : { ...prev, competitor: true });
    }
  }, [competitors]);

  React.useEffect(() => {
    // If user defined/added custom segments beyond the default 4 segments
    if (segments.length > 4) {
      setFeatureEngagement(prev => prev.customer ? prev : { ...prev, customer: true });
    }
  }, [segments]);

  // Daily Streak Counter State for Gamification
  const [streak, setStreak] = React.useState<{ count: number; lastClaimDate: string; xp: number }>(() => {
    const saved = localStorage.getItem("maxx_sales_streak_info_v2");
    if (saved) return JSON.parse(saved);
    // Seed with a satisfying 3-day history so first-time users can test increments to 4 days easily!
    return {
      count: 3,
      lastClaimDate: "2026-06-21",
      xp: 150
    };
  });

  React.useEffect(() => {
    localStorage.setItem("maxx_sales_streak_info_v2", JSON.stringify(streak));
  }, [streak]);

  const claimDailyPulseStreak = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (streak.lastClaimDate === todayStr) {
      return false;
    }
    const nextCount = streak.count + 1;
    setStreak({
      count: nextCount,
      lastClaimDate: todayStr,
      xp: streak.xp + 50
    });
    return true;
  };

  React.useEffect(() => {
    // Flag respective features as engaged/completed instantly when the user visits them
    if (dashTab === "strategy") {
      setFeatureEngagement(prev => prev.strategy ? prev : { ...prev, strategy: true });
    } else if (dashTab === "content") {
      setFeatureEngagement(prev => prev.content ? prev : { ...prev, content: true });
    } else if (dashTab === "pulse") {
      setFeatureEngagement(prev => prev.pulse ? prev : { ...prev, pulse: true });
      
      // Auto-increment streak when visiting Daily Sales Pulse
      const todayStr = new Date().toISOString().split("T")[0];
      if (streak.lastClaimDate !== todayStr) {
        setStreak(prev => ({
          count: prev.count + 1,
          lastClaimDate: todayStr,
          xp: prev.xp + 50
        }));
      }
    }
  }, [dashTab, streak.lastClaimDate]);

  // Derived progress values
  const completedCount = Object.values(featureEngagement).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / 5) * 100);

  // Adjust DOM classes for Theme styling
  React.useEffect(() => {
    const list = document.documentElement.classList;
    if (darkMode) {
      list.add("dark");
    } else {
      list.remove("dark");
    }
  }, [darkMode]);

  const handleSaveDNAFromWizard = () => {
    localStorage.setItem("maxx_sales_dna", JSON.stringify(canvas));
    setIsDnaFilled(true);
    setDnaWasEverFilled(true);
    localStorage.setItem("maxx_sales_dna_filled", "true");
    setDashTab("pulse"); // Default ke DailyPulse (posisi #1)
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("maxx_sales_logged_in");
    setTab("landing");
  };

  // Safe handler to reset DNA filled status for testing/re-editing
  const handleResetDNA = () => {
    if (window.confirm("Buka kembali form edit DNA Business Canvas? Anda dapat menyesuaikan Nama Produk, Harga, Keunggulan, dan Target Market.")) {
      setIsDnaFilled(false);
      localStorage.removeItem("maxx_sales_dna_filled");
      setDashTab("pulse");
    }
  };

  return (
    <div id="app-wrapper" className="min-h-screen flex flex-col transition-colors duration-300 bg-white dark:bg-[#050505] text-neutral-900 dark:text-[#E5E5E5]">
      
      {/* Dynamic Header Component */}
      <Header 
        currentTab={currentTab} 
        setTab={setTab} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        brandName={canvas.brand}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Routing Render */}
      <main id="main-content" className="flex-1">
        
        {/* All Routes — partner, admin, legal pages */}
        <Routes>
          <Route path="/partner/:code" element={<PartnerDashboardWrapper />} />
          <Route path="/admin/promos" element={<AdminPromos onBack={() => navigate("/")} />} />
          <Route path="/about" element={<AboutPage onBack={() => navigate("/")} />} />
          <Route path="/terms" element={<TermsOfService onBack={() => navigate("/")} />} />
          <Route path="/privacy" element={<PrivacyPolicy onBack={() => navigate("/")} />} />
          <Route path="/risk" element={<RiskDisclosure onBack={() => navigate("/")} />} />
          <Route path="*" element={null} />
        </Routes>

        {/* APP CONTENT — only render when NOT on a special page */}
        {!["/about", "/terms", "/privacy", "/risk", "/admin/promos"].includes(location.pathname) && !location.pathname.startsWith("/partner/") && (
          <>
            {/* LANDING PAGE ROUTE */}
            {currentTab === "landing" && (
              <LandingPage 
                onEnterDashboard={() => {
                  if (isLoggedIn) {
                    setTab("dashboard");
                  } else {
                    setTab("login");
                  }
                }}
                brandName={canvas.brand}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            )}

            {/* LOGIN PAGE ROUTE */}
            {currentTab === "login" && (
              <Login 
                onLoginSuccess={() => {
                  setIsLoggedIn(true);
                  localStorage.setItem("maxx_sales_logged_in", "true");
                  setTab("dashboard");
                }}
              />
            )}

            {/* DASHBOARD ROUTE */}
        {currentTab === "dashboard" && isLoggedIn && (
          <ChainProvider
            competitors={competitors}
            segments={segments}
            dna={canvas}
            streakCount={streak.count}
            setCompetitors={setCompetitors}
            setSegments={setSegments}
            setDna={setCanvas}
          >
          <DNANotificationBanner />
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10 animate-fade-in">
            
            {/* If Business Canvas DNA is not filled once, force wizard entry */}
            {!isDnaFilled ? (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                
                {/* Onboarding Welcome Badge */}
                <div className="p-6 rounded border bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626] text-center space-y-2">
                  <span className="text-[9px] font-bold font-mono text-emerald-500 uppercase tracking-widest block">
                    ★ {dnaWasEverFilled ? "EDIT MODE — DNA SUDAH ADA" : "INITIAL ONBOARDING STAGE"}
                  </span>
                  <h2 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-white">
                    {dnaWasEverFilled ? "Sesuaikan DNA Business Canvas" : "Lengkapi DNA Business Canvas Anda"}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] max-w-xl mx-auto">
                    {dnaWasEverFilled
                      ? "Ubah spesifikasi produk, harga, atau target market. Perubahan langsung tersimpan otomatis — klik tombol apabila sudah selesai menyesuaikan."
                      : "Masukkan spesifikasi dasar produk, harga, keunggulan utama, dan segmentasi target market Anda sekali saja untuk mengaktifkan seluruh taktik analisis dari 6 Fitur Utama."}
                  </p>
                </div>

                <BusinessCanvas 
                  canvas={canvas} 
                  setCanvas={setCanvas} 
                  onSave={handleSaveDNAFromWizard} 
                  isSetupWizard={true}
                  isReEditing={dnaWasEverFilled}
                />
              </div>
            ) : (
              /* The 6 main features unlocked interface */
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Sidebar Navigation Panel for 5 main features */}
                <aside className="w-full lg:w-64 shrink-0 space-y-4">
                       {/* Brand overview segment */}
                  <div id="brand-overview-card" className="p-4 card-sb text-center space-y-1 bg-white dark:bg-charcoal-surface border border-neutral-250 dark:border-stone-border">
                    <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-ink/40 dark:text-dark-text/40">Merek Aktif Anda</span>
                    <h3 className="text-sm font-extrabold text-ink dark:text-dark-text truncate font-body">{canvas.brand || "Siap Jualan"}</h3>
                    <p className="text-[10px] font-mono text-ink/50 dark:text-dark-text/50 capitalize truncate">{canvas.productName}</p>
                    
                    <div className="pt-2.5 border-t border-neutral-150 dark:border-stone-border mt-2">
                       <button
                        id="btn-trigger-reedit-dna"
                        onClick={handleResetDNA}
                        className="text-[9px] font-mono hover:underline font-bold text-[#00754A] dark:text-[#cba258] uppercase tracking-wider block mx-auto cursor-pointer"
                      >
                        ✎ Sesuaikan DNA (Statis)
                      </button>
                    </div>
                  </div>

                  {/* HIGHLY VISIBLE INTERACTIVE THEME SWITCHER CARD */}
                  <div className="p-3 card-sb bg-white dark:bg-charcoal-surface border border-neutral-250 dark:border-stone-border flex items-center justify-between shadow-xs">
                    <div className="flex items-center space-x-2">
                      {darkMode ? <Moon className="w-3.5 h-3.5 text-[#cba258]" /> : <Sun className="w-3.5 h-3.5 text-[#cba258]" />}
                      <span className="text-[10px] font-mono font-bold uppercase text-ink/60 dark:text-dark-text/60">TEMA VISUAL</span>
                    </div>
                    <div className="inline-flex items-center p-0.5 rounded-full bg-[#f2f0eb] dark:bg-space-dark border border-neutral-250 dark:border-stone-border">
                      <button
                        onClick={() => setDarkMode(false)}
                        className={`p-1 rounded-full transition-all cursor-pointer ${!darkMode ? "bg-white text-[#cba258] shadow-xs" : "text-neutral-400 hover:text-neutral-900"}`}
                        title="Ubah ke Mode Terang"
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDarkMode(true)}
                        className={`p-1 rounded-full transition-all cursor-pointer ${darkMode ? "bg-[#1E3932] text-[#cba258] shadow-xs" : "text-neutral-500 hover:text-neutral-905"}`}
                        title="Ubah ke Mode Gelap"
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Daily Streak Indicator Card (Starbucks Rewards style) */}
                  <div id="daily-streak-sidebar-card" className="p-4 rounded-lg border border-[#2a5a4a] bg-[#1E3932] text-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono tracking-wider text-white/60 uppercase">🔥 DAILY STREAK PULSE</span>
                      <span className="border border-[#cba258] text-[#cba258] bg-[#cba258]/10 rounded-full px-2.5 py-0.5 text-[8px] font-mono font-bold tracking-wide uppercase">
                        LEVEL {Math.floor(streak.count / 3) + 1}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#cba258]/10 text-[#cba258] text-lg font-bold border border-[#cba258]/20 shadow-sm animate-pulse">
                        🔥
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-extrabold block text-white font-body">
                          {streak.count} Hari Beruntun
                        </span>
                        <span className="text-[9px] text-white/70 font-mono block leading-tight">
                          XP Terkumpul: <strong className="text-[#cba258]">{streak.xp}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-white/80 leading-normal font-sans">
                      {streak.lastClaimDate === new Date().toISOString().split("T")[0] 
                        ? "✓ Anda telah mengaktifkan sinyal harian hari ini!" 
                        : "Ketuk tab harian atau klik check-in di bawah untuk klaim +50 XP!"}
                    </div>

                    {/* Interactive Simulator Claim buttons */}
                    <div className="flex gap-2 pt-1 border-t border-stone-border">
                      <button
                        id="btn-claim-streak"
                        onClick={() => {
                          const success = claimDailyPulseStreak();
                          if (success) {
                            alert("🎉 Hebat! Streak harian Anda bertambah menjadi " + (streak.count + 1) + " hari. Level Naik! (+50 XP)");
                          } else {
                            alert("👍 Anda telah mengaktifkan energi jualan hari ini! Kembali lagi esok hari.");
                          }
                        }}
                        className={`flex-1 btn-sb text-[9.5px] py-1.5 cursor-pointer ${
                          streak.lastClaimDate === new Date().toISOString().split("T")[0]
                            ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                            : "btn-sb-white shadow-sm"
                        }`}
                      >
                        {streak.lastClaimDate === new Date().toISOString().split("T")[0] ? "✓ Selesai" : "⚡ Check-in"}
                      </button>

                      <button
                        id="btn-simulate-yesterday"
                        onClick={() => {
                          setStreak({
                            count: streak.count,
                            lastClaimDate: "2026-06-21", // yesterday relative to 2026-06-22
                            xp: streak.xp
                          });
                          alert("🔬 Simulasi Esok Hari aktif! Status check-in didekatkan ke hari kemarin sehingga Anda bisa mengulas kembali tombol check-in harian.");
                        }}
                        className="btn-sb btn-sb-white-outline px-2 py-1.5 text-[9px] cursor-pointer"
                        title="Simulasikan Kemarin agar bisa dicoba berulang"
                      >
                        Simulasi
                      </button>
                    </div>
                  </div>

                  {/* Unified Dashboard Menu / Tab List with Integrated Progress Tracker */}
                  <div className="p-4 card-sb bg-white dark:bg-charcoal-surface border border-neutral-250 dark:border-stone-border space-y-3 shadow-xs">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold font-mono tracking-wider uppercase text-ink/40 dark:text-dark-text/40">MENU UTAMA & PROGRES</span>
                        <span className="text-xs font-bold font-mono text-[#00754A] dark:text-[#cba258]">{progressPercentage}%</span>
                      </div>

                      {/* Progress Bar Track */}
                      <div className="w-full bg-[#f2f0eb] dark:bg-space-dark h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#00754A] dark:bg-[#cba258] h-1.5 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Integrated Tab Buttons with Checkboxes */}
                    <div className="space-y-1" role="tablist">
                      {[
                        { key: "pulse" as const, label: "Daily Sales Pulse", desc: "Evaluasi & Checklist", icon: Sparkles },
                        { key: "competitor" as const, label: "Competitor War Room", desc: "SWOT & Radar Kompetitor", icon: Target },
                        { key: "customer" as const, label: "Customer Insight", desc: "Profil & LTV Pelanggan", icon: TrendingUp },
                        { key: "strategy" as const, label: "Strategy Fusion", desc: "11 Saluran Promosi AI", icon: Zap },
                        { key: "content" as const, label: "Content Generator", desc: "Poster Iklan Visual", icon: Image }
                      ].map((tab, idx) => {
                        const IconComp = tab.icon;
                        const isActive = dashTab === tab.key;
                        const isDone = featureEngagement[tab.key];
                        
                        return (
                          <div
                            key={tab.key}
                            id={`btn-dash-tab-${tab.key}`}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setDashTab(tab.key)}
                            className={`group w-full flex items-center justify-between p-2 rounded-xl text-left transition-all border cursor-pointer select-none ${
                              isActive
                                ? "bg-[#00754A] text-white dark:bg-[#cba258] dark:text-[#1E3932] border-transparent shadow"
                                : "bg-[#fcfbf9] dark:bg-space-dark/40 text-ink/70 dark:text-dark-text/75 border-neutral-200 dark:border-stone-border hover:bg-[#f2f0eb] dark:hover:bg-charcoal-surface"
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                              {/* Small Checkbox to trigger engagement status */}
                              <input 
                                type="checkbox"
                                checked={isDone}
                                id={`chk-eng-feat-${tab.key}`}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  setFeatureEngagement(prev => ({
                                    ...prev,
                                    [tab.key]: e.target.checked
                                  }));
                                }}
                                className={`w-3.5 h-3.5 rounded border ${
                                  isActive
                                    ? "border-neutral-500 dark:border-neutral-400 accent-emerald-500"
                                    : "border-neutral-350 dark:border-neutral-750 accent-emerald-500"
                                } bg-transparent text-emerald-500 focus:ring-0 cursor-pointer shrink-0`}
                              />

                              {/* Simple mini Icon */}
                              <IconComp className={`w-3.5 h-3.5 shrink-0 ${
                                isActive 
                                  ? "text-emerald-400 dark:text-emerald-600" 
                                  : "text-neutral-400 dark:text-[#525252] group-hover:text-emerald-500"
                              }`} />

                              <div className="min-w-0 leading-tight">
                                <span className={`text-[10px] sm:text-[10.5px] font-bold block truncate ${
                                  isDone && !isActive ? "line-through text-neutral-400 dark:text-[#525252]" : ""
                                }`}>
                                  {idx + 1}. {tab.label}
                                </span>
                                <span className={`text-[8.5px] font-mono block truncate ${
                                  isActive ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-400 dark:text-neutral-500"
                                }`}>
                                  {tab.desc}
                                </span>
                              </div>
                            </div>

                            {/* Badge */}
                            <span className={`text-[7.5px] font-mono tracking-wider font-bold uppercase py-0.5 px-1 rounded shrink-0 ${
                              isDone 
                                ? (isActive ? "bg-white/20 text-white dark:bg-black/10 dark:text-black" : "bg-emerald-500/10 text-emerald-500") 
                                : "bg-neutral-250 dark:bg-[#202020] text-neutral-400"
                            }`}>
                              {isDone ? "Done" : "Todo"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Onboarding User Tour guide with interactive tech Glossary term lookup aligned exactly with menu tabs */}
                  <UserTour currentTab={dashTab} setTab={setDashTab} />

                  <div className="p-3.5 rounded border border-dashed text-[10px] text-neutral-450 dark:text-[#737373] leading-normal bg-neutral-50/50 dark:bg-[#111111]/45 border-neutral-200 dark:border-[#262626] text-center font-mono">
                    Model DNA Anda terkunci secara statis. Gunakan panel 5 fitur utama di atas untuk taktik perang penjualan harian.
                  </div>
                </aside>

                {/* Central Contents panel (9-Columns) */}
                <div className="flex-1 w-full min-w-0">
                  
                  {/* FEATURE 1. COMPETITOR WAR ROOM TAB */}
                  {dashTab === "competitor" && (
                    <CompetitorWarRoom 
                      dna={canvas} 
                      competitors={competitors} 
                      setCompetitors={setCompetitors} 
                    />
                  )}

                  {/* FEATURE 2. CUSTOMER INSIGHT TAB */}
                  {dashTab === "customer" && (
                    <CustomerInsight 
                      dna={canvas} 
                      segments={segments} 
                      setSegments={setSegments} 
                    />
                  )}

                  {/* FEATURE 3. STRATEGY FUSION TAB */}
                  {dashTab === "strategy" && (
                    <StrategyForge />
                  )}

                  {/* FEATURE 4. CONTENT GENERATOR OVERLAY TAB */}
                  {dashTab === "content" && (
                    <ContentGenerator />
                  )}

                  {/* FEATURE 5. DAILY SALES PULSE TAB */}
                  {dashTab === "pulse" && (
                    <DailyPulse />
                  )}

                </div>

              </div>
            )}
          </div>
          </ChainProvider>
        )}
          </>
        )}

      </main>

      {/* Floating Smart Virtual Assistant — Dashboard only */}
      {currentTab === "dashboard" && isLoggedIn && (
        <FloatingChatbot dna={canvas} />
      )}

      {/* SME friendly Accessible footer */}
      <footer className="py-8 border-t mt-16 text-center text-[11px] font-mono tracking-wider text-neutral-400 dark:text-[#737373] border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>MaxxSales Cloud Core • Mitra Solusi Digital Pengusaha</span>
          <span>Hak Cipta © 2026 • MaxxSales</span>
        </div>
      </footer>

    </div>
  );
}
