import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import PricingSection from "./PricingSection";
import MarketNeuralNetwork from "./MarketNeuralNetwork";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Zap,
  Image,
  TrendingUp,
  MonitorSmartphone,
  Sun,
  Moon,
  Flame,
  CheckSquare,
  Award,
  Clock,
  UserCheck,
  Check,
  Copy,
  Bot,
  Send
} from "lucide-react";

interface LandingPageProps {
  onEnterDashboard: () => void;
  brandName: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function LandingPage({ onEnterDashboard, brandName, darkMode, setDarkMode }: LandingPageProps) {
  // Mockup dashboard tab auto-cycler
  const [activeMockTab, setActiveMockTab] = React.useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = React.useState<boolean>(true);

  // Interactive checklist state for Visual Showcase
  const [checklist, setChecklist] = React.useState([
    { id: 1, label: "AI cek stok otomatis & warning sebelum kehabisan", desc: "Tidak perlu hitung manual — sistem alert sebelum jam sibuk", done: true },
    { id: 2, label: "Siapkan kampanye WA blast dari template AI", desc: "Satu klik copy, kirim ke 50+ grup sekaligus", done: true },
    { id: 3, label: "Hubungi pelanggan churn risk sebelum mereka pindah", desc: "AI prediksi siapa yang akan berhenti beli bulan depan", done: false },
  ]);

  // Copy-to-clipboard feedback states
  const [copiedWa, setCopiedWa] = React.useState(false);
  const [copiedIg, setCopiedIg] = React.useState(false);

  const handleCopy = (type: "wa" | "ig") => {
    if (type === "wa") {
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 1800);
    } else {
      setCopiedIg(true);
      setTimeout(() => setCopiedIg(false), 1800);
    }
  };

  const toggleChecklist = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  React.useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveMockTab((prev) => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const selectMockTab = (index: number) => {
    setActiveMockTab(index);
    setIsAutoPlaying(false); // Stop autoplay once user interacts manually
  };

  const mockTabs = [
    { title: "Competitor War Room", icon: Target, desc: "Peta SWOT & Radar" },
    { title: "Customer Insight", icon: TrendingUp, desc: "LTV & Segmen Mikro" },
    { title: "Strategy Fusion", icon: Zap, desc: "11 Saluran Promosi" },
    { title: "Content Overlay", icon: Image, desc: "Poster Iklan Instan" },
    { title: "Daily Sales Pulse", icon: Sparkles, desc: "Streak & Checklist" }
  ];

  return (
    <div className="relative overflow-hidden transition-colors duration-300 bg-linen-base dark:bg-space-dark text-neutral-900 dark:text-[#E5E5E5] min-h-[calc(100vh-4rem)]">
      {/* Signature Element: Market Neural Network Background */}
      <MarketNeuralNetwork />
      
      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,138,0.02)_0%,rgba(139,92,246,0.01)_100%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 md:py-16 relative z-10">
        
        {/* 1. HERO — Asymmetric split: Text left, visual interest right */}
        <div className="relative max-w-6xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center mb-10 pt-4 pb-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Text content */}
            <div className="lg:col-span-7 flex flex-col">
              
              {/* Eyebrow tag */}
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold font-mono tracking-[0.12em] uppercase bg-market-indigo/10 dark:bg-ai-violet/10 text-market-indigo dark:text-ai-violet border border-market-indigo/20 dark:border-ai-violet/20 mb-6 w-fit opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-ai-violet animate-pulse"></span>
                AI-Powered Market Intelligence
              </span>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black tracking-[-0.02em] leading-[1.05] mb-6 text-neutral-900 dark:text-white opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Ubah Produk Biasa Jadi
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-market-indigo via-ai-violet to-market-indigo dark:from-ai-violet dark:via-data-cyan dark:to-ai-violet animate-gradient-shift">
                  Luar Biasa
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-earth-terracotta dark:text-[#E5E5E5] font-medium mb-4 max-w-xl opacity-0 animate-fade-in-up font-body leading-snug" style={{ animationDelay: '0.2s' }}>
                Analisis kompetitor otomatis. Strategi promosi harian. Konten iklan siap pakai — semua dalam satu dashboard.
              </p>

              <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed max-w-lg opacity-0 animate-fade-in-up font-body" style={{ animationDelay: '0.3s' }}>
                <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">MaxxSales</strong> mengambil data penjualan & intelijen pasar Anda, lalu mengubahnya menjadi checklist harian, konten promosi, dan strategi yang bisa langsung dieksekusi — tanpa perlu hire konsultan mahal.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 opacity-0 animate-fade-in-up mb-8" style={{ animationDelay: '0.4s' }}>
                <button
                  id="cta-start-dashboard"
                  onClick={onEnterDashboard}
                  className="group relative px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 bg-ai-violet hover:bg-urgent-red text-white shadow-lg shadow-ai-violet/25 hover:shadow-urgent-red/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10 flex items-center gap-2">
                    Mulai Rancang Strategi Hari Ini
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </button>
                <button
                  id="cta-explore-preview"
                  onClick={() => document.getElementById('visual-showcase')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 border border-market-indigo/30 dark:border-ai-violet/30 text-market-indigo dark:text-ai-violet hover:bg-market-indigo/5 dark:hover:bg-ai-violet/5 flex items-center justify-center gap-2"
                >
                  <MonitorSmartphone className="w-4 h-4" />
                  Lihat Pratinjau
                </button>
              </div>

              {/* Trust micro-signals */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-wrap items-center gap-5 sm:gap-6 text-[11px] text-earth-terracotta dark:text-neutral-400 font-body"
              >
                {[
                  { icon: ShieldCheck, text: "Satu harga, akses penuh" },
                  { icon: Clock, text: "Siap pakai dalam 3 menit" },
                  { icon: UserCheck, text: "Untuk pengusaha, bukan akademisi" },
                ].map((item, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.05, color: "#EF4444" }}
                    className="flex items-center gap-1.5 cursor-default transition-colors"
                  >
                    <item.icon className="w-3.5 h-3.5 text-data-cyan" /> {item.text}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Right: Visual accent — abstract neural pattern */}
            <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Glowing orb */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-ai-violet/20 via-market-indigo/10 to-transparent blur-3xl animate-pulse"></div>
                {/* Central node */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-2 border-ai-violet/30 flex items-center justify-center animate-neural-pulse">
                    <div className="w-20 h-20 rounded-full border border-data-cyan/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ai-violet to-market-indigo flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Orbiting dots */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-ai-violet/60"
                    style={{
                      top: `${50 + 40 * Math.sin(deg * Math.PI / 180)}%`,
                      left: `${50 + 40 * Math.cos(deg * Math.PI / 180)}%`,
                      transform: 'translate(-50%, -50%)',
                      animationDelay: `${i * 0.5}s`
                    }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* 2. SHOWCASE: 4 PANELS                        */}
        {/* ═══════════════════════════════════════════════ */}
        <div id="visual-showcase" className="max-w-6xl mx-auto min-h-screen flex flex-col justify-center mb-20 scroll-mt-16">
          <div className="text-center mb-8">
            <span className="text-[10px] font-bold font-mono tracking-[0.15em] text-ai-violet uppercase block mb-2">
              ✦ Apa yang Anda Dapatkan ✦
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              Bisnis Jalan, AI Kerja
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-lg mx-auto font-body leading-relaxed">
              Empat modul AI yang bekerja 24/7 untuk bisnis Anda — <strong className="text-neutral-700 dark:text-neutral-300">bukan sekadar dashboard, tapi asisten yang mengambil keputusan.</strong>
            </p>
          </div>

          <div className="grid w-full">

            {/* RIGHT: Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="border border-stone-border bg-charcoal-surface rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
            >
              <div className="bg-charcoal-surface border-b border-stone-border px-4 py-3 flex items-center justify-between">
                <span className="text-[9px] font-bold font-mono tracking-widest text-ai-violet uppercase">✦ Preview Dashboard</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-ai-violet animate-ping"></span><span className="text-[8px] font-mono text-neutral-500 uppercase">Live</span></span>
              </div>
            {/* Window Browser Chrome Header bar */}
            <div className="bg-neutral-100 dark:bg-[#121212] border-b border-neutral-250 dark:border-[#1E1E1E] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-urgent-red"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-data-cyan"></span>
              </div>
              <div className="bg-white dark:bg-charcoal-surface border border-stone-border rounded text-[10px] font-mono text-neutral-400 dark:text-[#737373] px-3 py-1 text-center w-64 truncate select-none">
                https://maxxsales.ai/dashboard/war-room
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-data-cyan animate-ping"></span>
                <span className="text-[8px] font-mono text-neutral-400 dark:text-data-cyan uppercase tracking-tighter">PREVIEW AKTIF</span>
              </div>
            </div>

            {/* Dashboard Workspace */}
            <div className="p-4 sm:p-6 min-h-[300px]">
              
              {/* Interactive Mockup Tabs Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 mb-6 border-b border-neutral-200 dark:border-[#202020] pb-2">
                {mockTabs.map((mt, index) => {
                  const Icon = mt.icon;
                  const isActive = activeMockTab === index;
                  return (
                    <button
                      key={index}
                      onClick={() => selectMockTab(index)}
                      className={`py-2 px-1 text-center rounded flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? "bg-neutral-900 text-white dark:bg-[#E5E5E5] dark:text-black shadow-xs transform scale-102 font-bold"
                          : "bg-white/40 dark:bg-[#141414]/30 text-neutral-500 dark:text-[#8E8E8E] border border-transparent hover:bg-neutral-200/50 dark:hover:bg-[#1a1a1a]/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[9.5px] whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">{mt.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Mockup Viewport */}
              <div className="bg-white dark:bg-[#101010] border border-neutral-200 dark:border-[#1F1F1F] p-4 rounded-xl min-h-[220px] transition-all duration-300">
                
                {/* Tab 0: Competitor SWOT & Radar */}
                {activeMockTab === 0 && (
                  <div className="space-y-4 animate-fade-in-quick text-left">
                    <div className="flex justify-between items-center bg-red-500/5 p-2 rounded border border-red-500/15">
                      <span className="text-[10px] font-mono font-bold text-red-500 flex items-center gap-1">⚔️ INTEL SWOT KOMPETITOR</span>
                      <span className="text-[8.5px] font-mono text-neutral-400">Total Terdata: 3 Kompetitor Terdekat</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* SWOT Mini Grid */}
                      <div className="p-3 bg-neutral-50 dark:bg-[#161616] rounded border border-neutral-200 dark:border-[#222222] space-y-2">
                        <span className="text-[8.5px] font-mono text-neutral-400 block uppercase font-bold">Kekuatan Merek Anda</span>
                        <ul className="text-[10px] text-neutral-600 dark:text-[#A3A3A3] space-y-1 list-disc pl-3">
                          <li>Sosis Bakar Premium daging lembu murni</li>
                          <li>Menggunakan mayones racikan rahasia</li>
                          <li>Nama merek unik dan kekinian (MaxxSales)</li>
                        </ul>
                      </div>
                      
                      {/* Spider-Web Radar Sim */}
                      <div className="p-3 bg-neutral-50 dark:bg-[#161616] rounded border border-neutral-200 dark:border-[#222222] space-y-2">
                        <span className="text-[8.5px] font-mono text-neutral-400 block uppercase font-bold">Simulasi Skor versus Pesaing</span>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[9px] text-[#A3A3A3] font-mono">
                              <span>Skor Rasa & Kualitas Anda</span>
                              <span className="text-emerald-500 font-bold">95/100</span>
                            </div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded">
                              <div className="bg-emerald-500 h-1 rounded w-[95%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[9px] text-[#A3A3A3] font-mono">
                              <span>Skor Harga Kompetitor Sebelah</span>
                              <span className="text-red-500 font-bold">85/100</span>
                            </div>
                            <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded">
                              <div className="bg-red-400 h-1 rounded w-[85%]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 1: Customer Insight */}
                {activeMockTab === 1 && (
                  <div className="space-y-4 animate-fade-in-quick text-left">
                    <div className="flex justify-between items-center bg-emerald-500/5 p-2 rounded border border-emerald-500/15">
                      <span className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-1">👥 CUSTOMER LIFETIME VALUE & COHORT</span>
                      <span className="text-[8.5px] font-mono text-neutral-400">Database: 4 Segmen Mikro Terpetakan</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded border border-neutral-200 dark:border-[#222222] text-center bg-neutral-50 dark:bg-[#151515]">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase block">Loyalty Index</span>
                        <span className="text-xl font-bold font-mono text-emerald-500">92.4%</span>
                        <p className="text-[8px] text-[#737373] mt-1">Pembelian berulang stabil</p>
                      </div>

                      <div className="p-3 rounded border border-neutral-200 dark:border-[#222222] text-center bg-neutral-50 dark:bg-[#151515]">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase block">Proyeksi LTV</span>
                        <span className="text-xl font-bold font-mono text-[#D4D4D4] dark:text-white">Rp320.000</span>
                        <p className="text-[8px] text-[#737373] mt-1">Akumulasi per kepala pelanggan</p>
                      </div>

                      <div className="p-3 rounded border border-neutral-200 dark:border-[#222222] text-center bg-neutral-50 dark:bg-[#151515]">
                        <span className="text-[8px] font-mono text-neutral-400 uppercase block">Churn Risk</span>
                        <span className="text-xl font-bold font-mono text-amber-500">Low (Rendah)</span>
                        <p className="text-[8px] text-[#737373] mt-1">Kepuasan rasa optimal</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-neutral-50 dark:bg-[#161616] border border-neutral-200 dark:border-[#222222]">
                      <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase block">Segmentasi Pembeli Utama: Siswa SMA Berduit Saku Fleksibel</span>
                      <p className="text-[9.5px] text-[#8E8E8E] leading-relaxed mt-1">
                        Suka jajan berkelompok sore hari pukul 16:00-18:00, sering memicu viralitas fofo makanan gratis via status Whatsapp lokal.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Strategy Fusion */}
                {activeMockTab === 2 && (
                  <div className="space-y-3 animate-fade-in-quick text-left">
                    <div className="flex justify-between items-center bg-purple-500/5 p-2 rounded border border-purple-500/15">
                      <span className="text-[10px] font-mono font-bold text-purple-500 flex items-center gap-1">⚡ STRATEGY FUSION AI (11 SALURAN OFFENSIVE)</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-[8.5px] font-mono font-bold text-purple-400">OPTIMISME: AGRESIF</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2 border-l-2 border-purple-500 bg-neutral-50 dark:bg-[#151515] rounded-r text-[10px]">
                        <strong className="text-neutral-800 dark:text-white block font-sans">Formula Gimmick Diskon Silang Lokal:</strong>
                        <p className="text-[#8E8E8E] mt-0.5">Gabungkan pembelian Sosis Bakar dengan minuman dingin seharga Rp25,000 pas di jam padat sore agar anak sekolah merasa hemat 15%.</p>
                      </div>

                      <div className="p-2 border-l-2 border-emerald-500 bg-neutral-50 dark:bg-[#151515] rounded-r text-[10px]">
                        <strong className="text-neutral-800 dark:text-white block font-sans">Skenario Social Proof Taktis:</strong>
                        <p className="text-[#8E8E8E] mt-0.5">Berikan tambahan bumbu lumer ekstra gratis untuk setiap pembeli yang memposting status Instagram/WA dengan me-mention lokasi gerobak Anda.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Content Overlay */}
                {activeMockTab === 3 && (
                  <div className="animate-fade-in-quick text-left flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-500 block uppercase">🎨 Poster Overlay Previewer</span>
                      <p className="text-[10px] text-neutral-400 dark:text-[#A3A3A3] leading-relaxed">
                        Merender otomatis teks promosi Anda ke atas filter gradien/bingkai dekoratif foto produk asli real-time secara kilat.
                      </p>
                      <div className="space-y-1.5 text-[9px] font-mono text-[#8E8E8E]">
                        <div>✓ Bingkai Gelap Elegan</div>
                        <div>✓ Overlay Neon Tajam & Reflektif</div>
                        <div>✓ Sempurna untuk IG/WA Stories</div>
                      </div>
                    </div>

                    {/* Smartphone Screen simulator */}
                    <div className="w-1/2 sm:w-44 mx-auto shrink-0 relative bg-neutral-900 border-4 border-neutral-700 dark:border-neutral-800 rounded-xl overflow-hidden aspect-square flex flex-col justify-between p-3.5 shadow-md">
                      
                      {/* Top banner overlay */}
                      <div className="bg-emerald-500 text-black text-[7px] font-mono font-extrabold px-1 rounded-sm text-center leading-tight mx-auto transform -rotate-1 tracking-wider uppercase">
                        PROMO TERHADAP KOMPETITOR
                      </div>

                      {/* Mock Product Image silhouette inside */}
                      <div className="absolute inset-2 top-8 bottom-8 rounded bg-gradient-to-br from-neutral-800 to-neutral-950 flex flex-col items-center justify-center opacity-90 border border-neutral-700/50">
                        <Image className="w-6 h-6 text-neutral-600 animate-pulse" />
                        <span className="text-[7.5px] font-mono text-[#525252] mt-1">[FOTO SOSIS BAKAR ANDA]</span>
                      </div>

                      {/* Bottom Banner overlay with Call to Action text */}
                      <div className="bg-neutral-950/90 border border-emerald-500/40 rounded p-1 text-center z-10 space-y-0.5">
                        <span className="text-[7px] font-mono font-bold text-yellow-400 tracking-wide uppercase block">PROMO DUO KENYANG</span>
                        <p className="text-[6.5px] text-white font-sans leading-none">Cuma Rp25.000 + Es Teh Gratis!</p>
                        <span className="text-[5.5px] text-neutral-400 font-mono block leading-none">Ketuk Link di Bio WA</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 4: Daily Sales Pulse */}
                {activeMockTab === 4 && (
                  <div className="space-y-3 animate-fade-in-quick text-left">
                    <div className="flex justify-between items-center bg-amber-500/5 p-2 rounded border border-amber-500/15">
                      <span className="text-[10px] font-mono font-bold text-amber-500 flex items-center gap-1">🔥 DAILY SALES PULSE CHECKLIST</span>
                      <span className="text-[8px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">LEVEL 3 SELLER</span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[9px] text-neutral-600 dark:text-[#A3A3A3]">
                      <div className="flex items-center space-x-2 bg-[#1A1A1A]/5 p-1 rounded">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="line-through">Lakukan Follow up 5 pelanggan loyal WhatsApp</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-[#1A1A1A]/5 p-1 rounded">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="line-through">Post materi flier promo di status WhatsApp</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-[#1A1A1A]/5 p-1 rounded">
                        <CheckSquare className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-700" />
                        <span className="text-neutral-800 dark:text-white">Review sisa stok daging & gas untuk operasional esok</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-amber-500/5 p-2 rounded border border-amber-550/15">
                      <span className="text-sm">🔥</span>
                      <div className="leading-tight text-[9px]">
                        <strong>Streak Jualan: 4 Hari Terjaga!</strong>
                        <span className="text-neutral-400 block font-mono">Simpan energi jualan harian secara rutin dan klaim bonus XP.</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            </motion.div>

          </div>
        </div>

        {/* 2 & 3. BENTO GRID OF 5 PILLARS */}
        <div id="dna-canvas" className="min-h-screen flex flex-col justify-center mb-24 scroll-mt-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
              Satu Data, Seluruh Bisnis Terhubung
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto font-body">
              Isi DNA bisnis sekali — <strong className="text-neutral-700 dark:text-neutral-300">semua modul AI langsung aktif dan bekerja untuk Anda.</strong>
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">

            {/* DNA Hub — Central visual */}
            <div className="relative rounded-2xl border border-stone-border bg-charcoal-surface overflow-hidden p-8 sm:p-10">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Left: DNA icon cluster */}
                <div className="relative w-40 h-40 shrink-0">
                  <div className="absolute inset-0 rounded-full bg-ai-violet/10 animate-pulse"></div>
                  <div className="absolute inset-4 rounded-full border border-ai-violet/20 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-ai-violet to-market-indigo flex items-center justify-center shadow-lg shadow-ai-violet/30">
                      <span className="text-3xl">🧬</span>
                    </div>
                  </div>
                  {/* Orbiting feature dots */}
                  {[0, 72, 144, 216, 288].map((deg, i) => {
                    const icons = ["🎯", "👥", "⚡", "🎨", "📊"];
                    return (
                      <div key={i} className="absolute w-8 h-8 rounded-full bg-charcoal-surface border border-stone-border flex items-center justify-center text-sm" style={{ top: `${50 + 45 * Math.sin(deg * Math.PI / 180)}%`, left: `${50 + 45 * Math.cos(deg * Math.PI / 180)}%`, transform: 'translate(-50%, -50%)' }}>
                        {icons[i]}
                      </div>
                    );
                  })}
                </div>
                {/* Right: benefit text */}
                <div className="flex-1 text-center lg:text-left">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-3">DNA Business Canvas</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-body leading-relaxed mb-4">
                    Satu kali isi data bisnis Anda — produk, harga, target pasar, keunggulan — lalu semua modul AI otomatis menyesuaikan.
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    {["Sekali isi", "Otomatis aktif", "Update berkala", "Tanpa coding"].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[10px] font-mono bg-ai-violet/10 text-ai-violet border border-ai-violet/20">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ========== CONNECTOR ========== */}
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-emerald-500/60 text-lg"
              >
                ↓
              </motion.div>
            </div>

            {/* 5 Pillars — Visual cards with mockup previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Pilar 1: Competitor War Room */}
              <div className="rounded-xl border border-stone-border bg-charcoal-surface p-5 hover:border-urgent-red/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-urgent-red/10 flex items-center justify-center text-xl">🎯</div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Competitor War Room</h4>
                    <p className="text-[10px] text-neutral-500 font-mono">SWOT & Radar Pesaing</p>
                  </div>
                </div>
                <div className="rounded-lg bg-space-dark border border-stone-border p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-urgent-red"></div>
                    <span className="text-[9px] font-mono text-neutral-500">Skor vs Kompetitor</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px]"><span className="text-neutral-400">Harga</span><span className="text-urgent-red font-bold">7/10</span></div>
                    <div className="w-full bg-neutral-800 h-1 rounded"><div className="bg-urgent-red h-1 rounded w-[70%]"></div></div>
                    <div className="flex justify-between text-[9px]"><span className="text-neutral-400">Kualitas</span><span className="text-data-cyan font-bold">9/10</span></div>
                    <div className="w-full bg-neutral-800 h-1 rounded"><div className="bg-data-cyan h-1 rounded w-[90%]"></div></div>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500">Temukan celah harga & strategi promosi yang belum disentuh pesaing.</p>
              </div>

              {/* Pilar 2: Customer Insight */}
              <div className="rounded-xl border border-stone-border bg-charcoal-surface p-5 hover:border-data-cyan/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-data-cyan/10 flex items-center justify-center text-xl">👥</div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Customer Insight</h4>
                    <p className="text-[10px] text-neutral-500 font-mono">LTV & Segmen Mikro</p>
                  </div>
                </div>
                <div className="rounded-lg bg-space-dark border border-stone-border p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono text-neutral-500">Estimasi LTV</span>
                    <span className="text-[11px] font-bold text-data-cyan">Rp 9.576.000</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded bg-neutral-800 p-1.5 text-center"><span className="text-[9px] text-neutral-400 block">AOV</span><span className="text-[10px] font-bold text-white">399rb</span></div>
                    <div className="rounded bg-neutral-800 p-1.5 text-center"><span className="text-[9px] text-neutral-400 block">Freq</span><span className="text-[10px] font-bold text-white">2x/bln</span></div>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500">Kenali siapa pembeli Anda, berapa nilai seumur hidupnya, dan kapan mereka akan pergi.</p>
              </div>

              {/* Pilar 3: Strategy Fusion */}
              <div className="rounded-xl border border-stone-border bg-charcoal-surface p-5 hover:border-ai-violet/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-ai-violet/10 flex items-center justify-center text-xl">⚡</div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Strategy Fusion</h4>
                    <p className="text-[10px] text-neutral-500 font-mono">11 Saluran Promosi AI</p>
                  </div>
                </div>
                <div className="rounded-lg bg-space-dark border border-stone-border p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-ai-violet/15 text-[9px] font-bold text-ai-violet">MODERAT</span>
                    <span className="text-[9px] text-neutral-500">→</span>
                    <span className="text-[9px] text-neutral-400">Rekomendasi AI</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] text-neutral-400"><span className="w-1.5 h-1.5 rounded-full bg-ai-violet"></span>Instagram Reels</div>
                    <div className="flex items-center gap-1.5 text-[9px] text-neutral-400"><span className="w-1.5 h-1.5 rounded-full bg-data-cyan"></span>WhatsApp Blast</div>
                    <div className="flex items-center gap-1.5 text-[9px] text-neutral-400"><span className="w-1.5 h-1.5 rounded-full bg-urgent-red"></span>TikTok Shop</div>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500">Pilih level ambisi — AI susun strategi promosi berdasarkan data bisnis Anda.</p>
              </div>

              {/* Pilar 4: Content Generator */}
              <div className="rounded-xl border border-stone-border bg-charcoal-surface p-5 hover:border-market-indigo/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-market-indigo/10 flex items-center justify-center text-xl">🎨</div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Content Generator</h4>
                    <p className="text-[10px] text-neutral-500 font-mono">Poster Iklan Instan</p>
                  </div>
                </div>
                <div className="rounded-lg bg-space-dark border border-stone-border p-3 mb-3 flex gap-2">
                  <div className="flex-1 rounded bg-gradient-to-b from-market-indigo/20 to-market-indigo/5 p-2 text-center">
                    <span className="text-[9px] text-neutral-400 block">Feed 1:1</span>
                    <span className="text-[10px] font-bold text-white">📱</span>
                  </div>
                  <div className="flex-1 rounded bg-gradient-to-b from-ai-violet/20 to-ai-violet/5 p-2 text-center">
                    <span className="text-[9px] text-neutral-400 block">Story 9:16</span>
                    <span className="text-[10px] font-bold text-white">📲</span>
                  </div>
                  <div className="flex-1 rounded bg-gradient-to-b from-data-cyan/20 to-data-cyan/5 p-2 text-center">
                    <span className="text-[9px] text-neutral-400 block">WA</span>
                    <span className="text-[10px] font-bold text-white">💬</span>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500">Upload foto produk → AI render 4 variasi poster promosi siap posting.</p>
              </div>

              {/* Pilar 5: Daily Pulse */}
              <div className="rounded-xl border border-stone-border bg-charcoal-surface p-5 hover:border-earth-terracotta/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-earth-terracotta/10 flex items-center justify-center text-xl">📊</div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Daily Pulse</h4>
                    <p className="text-[10px] text-neutral-500 font-mono">Briefing & Checklist Harian</p>
                  </div>
                </div>
                <div className="rounded-lg bg-space-dark border border-stone-border p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono text-neutral-500">🔥 Streak</span>
                    <span className="text-[10px] font-bold text-earth-terracotta">4 Hari</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px]"><span className="w-3 h-3 rounded bg-ai-violet/20 flex items-center justify-center text-[7px]">✓</span><span className="text-neutral-400">Cek stok otomatis</span></div>
                    <div className="flex items-center gap-1.5 text-[9px]"><span className="w-3 h-3 rounded bg-ai-violet/20 flex items-center justify-center text-[7px]">✓</span><span className="text-neutral-400">Siapkan WA blast</span></div>
                    <div className="flex items-center gap-1.5 text-[9px]"><span className="w-3 h-3 rounded border border-neutral-600"></span><span className="text-neutral-500">Hubungi churn risk</span></div>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500">Checklist harian + briefing AI — tahu persis apa yang harus dilakukan hari ini.</p>
              </div>

              {/* Pilar 6: AI Chatbot */}
              <div className="rounded-xl border border-stone-border bg-charcoal-surface p-5 hover:border-[#F59E0B]/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-xl">🤖</div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">AI Advisor</h4>
                    <p className="text-[10px] text-neutral-500 font-mono">Tanya Kapan Saja</p>
                  </div>
                </div>
                <div className="rounded-lg bg-space-dark border border-stone-border p-3 mb-3">
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-neutral-800 px-2 py-1.5">
                      <span className="text-[9px] text-neutral-400">Cara naikkan omzet minggu ini?</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 justify-end">
                    <div className="flex-1 rounded-lg bg-ai-violet/15 border border-ai-violet/20 px-2 py-1.5">
                      <span className="text-[9px] text-ai-violet">Buat promo kombo Sosis + Teh Jahe untuk jam 16:00-19:00...</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500">AI yang tahu DNA bisnis Anda — tanya kapan saja, jawaban instan.</p>
              </div>

            </div>

            {/* ========== CONNECTOR ========== */}
            <div className="flex justify-center">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="text-emerald-500/60 text-lg"
              >
                ↓
              </motion.div>
            </div>

            {/* ========== DAILY PULSE: OUTPUT LAYER ========== */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-amber-500/20 bg-[#0c0c0c] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/25 uppercase tracking-wider">Output Harian</span>
                    <h4 className="text-sm font-bold text-white">Daily Sales Pulse — Checklist Eksekusi</h4>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-lg">
                    Setiap pagi: briefing performa pasar + checklist aktivitas penjualan taktis yang siap dieksekusi. Centang, lacak streak, dorong omzet.
                  </p>
                </div>
              </div>
              <button
                onClick={onEnterDashboard}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                Buka Daily Pulse <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* 4. PRICING SECTION                             */}
        {/* ═══════════════════════════════════════════════ */}
        <PricingSection onBuyNow={onEnterDashboard} />

        {/* Accessibility Focus Showcase */}
        <div className="rounded-xl border p-8 bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] mb-12">
        {/* ═══════════════════════════════════════════════ */}
        {/* FAQ + TESTIMONI + PARTNER TRUST               */}
        {/* ═══════════════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto mb-20">

          {/* Testimoni & Partner Trust */}
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
              Sudah Dipercaya Pengusaha Seperti Anda
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto font-body">
              Berikut kata mereka yang sudah merasakan dampak MaxxSales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {/* Testimoni 1 */}
            <div className="p-5 rounded-xl border border-stone-border bg-charcoal-surface">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ai-violet to-market-indigo flex items-center justify-center text-sm font-bold text-white">RS</div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">Rina Sari</p>
                  <p className="text-[10px] text-neutral-500 font-mono">Toko Fashion Muslimah, Surabaya</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-body leading-relaxed italic">
                "Sebelum MaxxSales, saya harus cek 5 aplikasi berbeda setiap pagi. Sekarang semua ada di satu dashboard — stok, promo, bahkan siapa yang harus dihubungi hari ini."
              </p>
              <div className="flex items-center gap-1 mt-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
              </div>
            </div>

            {/* Testimoni 2 */}
            <div className="p-5 rounded-xl border border-stone-border bg-charcoal-surface">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-data-cyan to-market-indigo flex items-center justify-center text-sm font-bold text-white">BP</div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">Budi Prasetyo</p>
                  <p className="text-[10px] text-neutral-500 font-mono">Sosis Bakar Premium, Malang</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-body leading-relaxed italic">
                "Konten iklan yang dulu butuh 2 jam sekarang jadi 5 menit. AI-nya tahu persis cara nulis yang bikin pelanggan saya beli."
              </p>
              <div className="flex items-center gap-1 mt-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
              </div>
            </div>

            {/* Testimoni 3 */}
            <div className="p-5 rounded-xl border border-stone-border bg-charcoal-surface">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-earth-terracotta to-urgent-red flex items-center justify-center text-sm font-bold text-white">DM</div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">Dewi Melati</p>
                  <p className="text-[10px] text-neutral-500 font-mono">Kue Kering Premium, Jakarta</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-body leading-relaxed italic">
                "Saya tahu persis pelanggan mana yang akan berhenti beli sebelum mereka benar-benar pergi. Retensi naik 35% dalam sebulan."
              </p>
              <div className="flex items-center gap-1 mt-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-xs">★</span>)}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div id="faq" className="text-center mb-8 scroll-mt-16">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {[
              { q: "Apakah perlu keahlian teknis untuk menggunakan MaxxSales?", a: "Tidak sama sekali. Isi data bisnis Anda sekali — produk, harga, target pasar — lalu semua fitur AI langsung aktif. Tidak perlu coding atau setup teknis." },
              { q: "Bagaimana AI tahu tentang bisnis saya?", a: "Melalui DNA Business Canvas. Anda mengisi data sekali saat onboarding, lalu semua modul AI menggunakan data tersebut sebagai dasar analisis dan rekomendasi." },
              { q: "Apakah data saya aman?", a: "Ya. Semua data disimpan lokal di browser Anda menggunakan localStorage. Tidak ada data bisnis yang dikirim ke server kami." },
              { q: "Bagaimana cara kerja AI Chatbot?", a: "Chatbot memahami DNA bisnis Anda — produk, harga, kompetitor, segmen. Tanya kapan saja dan dapatkan saran yang relevan dengan kondisi bisnis Anda saat ini." },
              { q: "Apakah ada biaya tambahan tersembunyi?", a: "Tidak. Satu harga, akses penuh ke semua fitur. Tidak ada biaya tambahan atau langganan tersembunyi." },
            ].map((faq, i) => (
              <details key={i} className="group rounded-xl border border-stone-border bg-charcoal-surface overflow-hidden">
                <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-neutral-900 dark:text-white flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-neutral-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-5 pb-4 text-xs text-neutral-500 dark:text-neutral-400 font-body leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          {/* Partner Trust Bar */}
          <div className="mt-12 text-center">
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-4">Digunakan oleh pengusaha di</p>
            <div className="flex flex-wrap items-center justify-center gap-6 opacity-60">
              {["Surabaya", "Malang", "Jakarta", "Bandung", "Semarang", "Yogyakarta"].map(city => (
                <span key={city} className="text-xs font-mono text-neutral-500 dark:text-neutral-500">{city}</span>
              ))}
            </div>
          </div>

        </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-neutral-200 dark:border-[#262626] pt-8 pb-6 mt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-neutral-500 dark:text-neutral-500">
              © 2026 <span className="font-semibold text-neutral-700 dark:text-neutral-300">PT. Gen Indo Kreatif</span>. Surabaya, Indonesia.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
              <Link to="/about" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Tentang Kami</Link>
              <Link to="/terms" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Syarat & Ketentuan</Link>
              <Link to="/privacy" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Kebijakan Privasi</Link>
              <Link to="/risk" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">Pernyataan Risiko</Link>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
