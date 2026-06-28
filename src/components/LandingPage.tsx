import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import PricingSection from "./PricingSection";
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
    { id: 1, label: "Cek stok produk terlaris & pastikan cukup sampai tutup", desc: "Sosis, bumbu, gas — semua aman sebelum jam sibuk sore", done: true },
    { id: 2, label: "Kirim siaran WA promo ke 5 grup pelanggan teraktif", desc: 'Gunakan template "Amunisi Komunikasi" — tinggal salin & kirim', done: true },
    { id: 3, label: "Hubungi 3 pelanggan loyal & tawarkan promo spesial", desc: "Cek database Customer Insight, pilih yang LTV tertinggi", done: false },
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
      {/* Decorative Grid Backdrop — hexagonal feel */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(30,58,138,0.03)_0%,rgba(139,92,246,0.02)_100%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_32px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 md:py-16 relative z-10">
        
        {/* 1. HERO */}
        <div className="relative max-w-6xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center mb-10 pt-4 pb-12">
          
          <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto pt-6">
            
            {/* Eyebrow tag */}
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold font-mono tracking-[0.12em] uppercase bg-market-indigo/10 dark:bg-ai-violet/10 text-market-indigo dark:text-ai-violet border border-market-indigo/20 dark:border-ai-violet/20 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.05s' }}>
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

            <p className="text-base sm:text-lg lg:text-xl text-earth-terracotta dark:text-[#E5E5E5] font-medium mb-4 max-w-2xl opacity-0 animate-fade-in-up font-body" style={{ animationDelay: '0.2s' }}>
              Sistem Operasi Pertumbuhan Bisnis Berbasis AI Untuk Memaximalkan Penjualan
            </p>

            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed max-w-xl mx-auto opacity-0 animate-fade-in-up font-body" style={{ animationDelay: '0.3s' }}>
              Tanpa teori rumit. Tanpa dashboard kosong. <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">MaxxSales</strong> mengubah data penjualan & intelijen pasar jadi langkah eksekusi harian — langsung bisa dikerjakan hari ini juga.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up w-full sm:w-auto mb-10" style={{ animationDelay: '0.4s' }}>
              <button
                id="cta-start-dashboard"
                onClick={onEnterDashboard}
                className="group relative w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 bg-ai-violet hover:bg-urgent-red text-white shadow-lg shadow-ai-violet/25 hover:shadow-urgent-red/25 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
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
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 border border-market-indigo/30 dark:border-ai-violet/30 text-market-indigo dark:text-ai-violet hover:bg-market-indigo/5 dark:hover:bg-ai-violet/5 flex items-center justify-center gap-2"
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
              className="flex flex-wrap items-center justify-center gap-5 sm:gap-8 mb-16 text-[11px] text-earth-terracotta dark:text-neutral-400 font-body"
            >
              {[
                { icon: ShieldCheck, text: "Coba Prototype Gratis" },
                { icon: Clock, text: "Siap Pakai dalam 5 Menit" },
                { icon: UserCheck, text: "Untuk Pengusaha, Bukan Akademisi" },
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
        </div>

        {/* ═══════════════════════════════════════════════ */}
        {/* 2. SHOWCASE: 4 PANELS                        */}
        {/* ═══════════════════════════════════════════════ */}
        <div id="visual-showcase" className="max-w-6xl mx-auto min-h-screen flex flex-col justify-center mb-20 scroll-mt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <span className="text-[10px] font-bold font-mono tracking-[0.15em] text-ai-violet uppercase block mb-2">
              ✦ Show, Don't Just Tell ✦
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              Tools Andalan Bisnis Anda
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-md mx-auto font-body">
              Semua yang dibutuhkan pengusaha dalam satu dashboard terintegrasi AI.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* 1. Daily Pulse Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-stone-border bg-charcoal-surface overflow-hidden shadow-xl shadow-black/30 flex flex-col h-full text-left"
            >
              {/* Card header */}
              <div className="px-5 py-3.5 border-b border-stone-border flex items-center gap-2 bg-charcoal-surface/80">
                <span className="w-2.5 h-2.5 rounded-full bg-urgent-red/80 shrink-0"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80 shrink-0"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-data-cyan/80 shrink-0 mr-2"></span>
                <span className="text-[10px] font-mono text-neutral-500 truncate">maxxsales.ai/daily-pulse</span>
                <div className="flex-1"></div>
                <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-ai-violet/15 text-ai-violet border border-ai-violet/25 whitespace-nowrap">
                  🔥 STREAK 4 HARI
                </span>
              </div>

              {/* Checklist body — balanced */}
              <div className="p-4 sm:p-5 space-y-3.5 flex-1">
                {checklist.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                      item.done
                        ? "bg-ai-violet/5 border-ai-violet/15 hover:bg-ai-violet/10"
                        : "border-stone-border bg-space-dark hover:bg-urgent-red/5 hover:border-urgent-red/20"
                    } group`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        item.done
                          ? "bg-ai-violet border-ai-violet"
                          : "border-neutral-700 bg-transparent group-hover:border-ai-violet/40"
                      }`}
                    >
                      {item.done && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <span className={`text-xs transition-all font-body ${
                        item.done
                          ? "text-neutral-500 line-through"
                          : "text-white font-medium group-hover:text-earth-terracotta"
                      }`}>
                        {item.label}
                      </span>
                      <p className="text-[10px] text-neutral-500 mt-0.5 font-body">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Card footer */}
              <div className="px-6 py-4 border-t border-stone-border bg-charcoal-surface/50 flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-500">
                  ✅ {checklist.filter(i => i.done).length}/{checklist.length} tugas selesai hari ini
                </span>
                <span className="text-[10px] font-mono text-ai-violet font-bold">
                  +{checklist.filter(i => i.done).length * 25} XP HARI INI
                </span>
              </div>
            </motion.div>

            {/* 2. AI Chatbot Assistant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-stone-border bg-charcoal-surface overflow-hidden shadow-xl shadow-black/30 flex flex-col h-full text-left"
            >
              {/* Card header */}
              <div className="px-5 py-3.5 border-b border-stone-border flex items-center gap-2 bg-charcoal-surface/85">
                <div className="w-2.5 h-2.5 rounded-full bg-ai-violet/25 border border-ai-violet/50 flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-ai-violet animate-pulse"></span>
                </div>
                <Bot className="w-4 h-4 text-ai-violet mr-1" />
                <div>
                  <h3 className="text-xs font-bold text-white leading-tight font-body">AI Business Advisor</h3>
                  <p className="text-[9px] text-neutral-500 font-mono">maxxsales.ai/advisor</p>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-4 space-y-3.5 flex-1 font-sans text-[11px] overflow-y-auto">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-neutral-800 text-white rounded-2xl px-3 py-2 max-w-[85%]">
                    <p>Bagaimana cara menaikkan omzet sosis bakar premium minggu ini?</p>
                  </div>
                </div>

                {/* AI message */}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="bg-[#111111] border border-neutral-800 text-neutral-300 rounded-2xl px-3 py-2.5 max-w-[85%] space-y-2">
                    <p>Berdasarkan data penjualan Anda dan cuaca mendung sore hari ini:</p>
                    <ul className="list-decimal pl-4 space-y-1 text-neutral-400">
                      <li>Buat <strong className="text-emerald-400">Promo Kombo Sosis + Teh Jahe Hangat</strong> khusus jam 16:00-19:00.</li>
                      <li>Kirim pesan WA ke <strong className="text-emerald-400">42 pelanggan terdekat</strong> yang biasa beli di jam tersebut.</li>
                    </ul>
                    <div className="pt-1.5">
                      <button className="w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-[9px] uppercase transition-colors flex items-center justify-center gap-1.5">
                        <Zap className="w-3 h-3 fill-black" /> Jalankan Broadcast WA
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input area */}
              <div className="p-3 border-t border-neutral-800 bg-[#0f0f0f] flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Tanya AI Advisor..." 
                  disabled
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-400 placeholder-neutral-600 focus:outline-none text-[10px]"
                />
                <button disabled className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-500 cursor-not-allowed shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>

            {/* LEFT: Amunisi Komunikasi */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-cyan-500/20 bg-[#0c0c0c] overflow-hidden shadow-xl shadow-black/30"
            >
              {/* Card header */}
              <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center gap-2.5 bg-[#111111]">
                <motion.span
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="text-lg"
                >
                  💬
                </motion.span>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Amunisi Komunikasi</h3>
                  <p className="text-[10px] text-neutral-500 font-mono">Template Siaran · Siap Copas</p>
                </div>
              </div>

              {/* Templates body */}
              <div className="p-3 sm:p-4 space-y-3">
                {/* WA Blast template */}
                <motion.div
                  whileHover={{ scale: 1.02, borderColor: "rgba(6,182,212,0.4)" }}
                  className="rounded-xl border border-stone-border bg-space-dark overflow-hidden transition-colors"
                >
                  <div className="px-3 py-2 bg-charcoal-surface border-b border-stone-border flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-data-cyan"></span>
                    <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Siaran WhatsApp</span>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-body">
                      <span className="text-earth-terracotta font-semibold">🔥 PROMO GILA HARI INI! 🔥</span><br />
                      Juragan, khusus hari ini: beli <strong className="text-white">2 Sosis Bakar Premium</strong> gratis <strong className="text-white">1 Es Teh Segar</strong>!<br /><br />
                      📍 Depan Indomaret Jl. Kenangan<br />⏰ Jam 15:00 - 18:00 sore ini
                    </p>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleCopy("wa")}
                      className={`mt-2.5 w-full py-2 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                        copiedWa ? "bg-data-cyan/20 text-data-cyan border border-data-cyan/30" : "bg-data-cyan/15 text-data-cyan border border-data-cyan/25 hover:bg-data-cyan/25"
                      }`}
                    >
                      {copiedWa ? <><Check className="w-3 h-3" /> Tersalin!</> : <><Copy className="w-3 h-3" /> Salin Teks Siaran</>}
                    </motion.button>
                  </div>
                </motion.div>

                {/* Social caption template */}
                <motion.div
                  whileHover={{ scale: 1.02, borderColor: "rgba(139,92,246,0.4)" }}
                  className="rounded-xl border border-stone-border bg-space-dark overflow-hidden transition-colors"
                >
                  <div className="px-3 py-2 bg-charcoal-surface border-b border-stone-border flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-ai-violet"></span>
                    <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Caption Instagram</span>
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-body">
                      Siapa bilang jajan enak harus mahal? 🤔<br /><br />
                      <strong className="text-white">Sosis Bakar MaxxSales</strong> — daging sapi asli, bukan tepung isi angin. Dijamin nagih dari gigitan pertama! 🥩✨
                    </p>
                    <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleCopy("ig")}
                      className={`mt-2.5 w-full py-2 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
                        copiedIg ? "bg-ai-violet/20 text-ai-violet border border-ai-violet/30" : "bg-ai-violet/15 text-ai-violet border border-ai-violet/25 hover:bg-ai-violet/25"
                      }`}
                    >
                      {copiedIg ? <><Check className="w-3 h-3" /> Tersalin!</> : <><Copy className="w-3 h-3" /> Salin Caption</>}
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Card footer */}
              <div className="px-5 py-3 border-t border-stone-border bg-charcoal-surface/50">
                <motion.p animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-[10px] text-neutral-500 font-mono text-center">
                  ⚡ Template diperbarui otomatis setiap pagi oleh AI
                </motion.p>
              </div>
            </motion.div>

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
            {/* Custom polished header replacing "MVP Core" */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              DNA Business Canvas — Pusat Kendali Bisnis Anda
            </h2>
            <p className="text-xs text-neutral-400 max-w-xl mx-auto">
              Satu data, semua terhubung. Setiap pilar di bawah ini <strong className="text-emerald-400">mengalir dari DNA Bisnis Anda</strong> sebagai Single Source of Truth.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">

            {/* ========== PILAR 1: DNA HUB - Single Source of Truth ========== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl border-2 border-emerald-500/30 bg-[#0c0c0c] overflow-hidden shadow-xl shadow-emerald-500/10"
            >
              <div className="absolute top-3 right-4 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                ⭐ Single Source of Truth
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 flex-col sm:flex-row">
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest block mb-1">Pilar 1 · Fondasi</span>
                    <h3 className="text-xl font-bold text-white mb-2">DNA Business Canvas</h3>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                      Data dasar berisi identitas bisnis terdalam Anda: spesifikasi produk, harga, target segmen mikro, pola logistik, hingga preferensi media sosial. <strong className="text-white/80">DNA ini melandasi keakuratan seluruh pilar di bawahnya.</strong>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Sekali Isi, Pakai Selamanya
                      </span>
                      <span className="flex items-center gap-1 text-neutral-500">
                        ↓ Data mengalir ke seluruh pilar eksekusi
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

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

            {/* ========== PILAR 2-3-4-5: FLOW ROW ========== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Pilar 2 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                whileHover={{ y: -3 }}
                className="group rounded-xl border border-red-500/15 bg-[#0c0c0c] p-5 hover:border-red-500/30 hover:bg-[#0f0f0f] transition-all relative"
              >
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-red-500 text-black text-[10px] font-bold flex items-center justify-center">2</span>
                <Target className="w-6 h-6 text-red-400 mb-3" />
                <h4 className="text-sm font-bold text-white mb-1.5">Competitor War Room</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  SWOT head-to-head dengan kompetitor lokal. Cari celah harga, kemasan, dan strategi promosi.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-1.5 text-[9px] font-mono text-red-400/70">
                  <Target className="w-3 h-3" /> Intelijen Pasar
                </div>
              </motion.div>

              {/* Pilar 3 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ y: -3 }}
                className="group rounded-xl border border-emerald-500/15 bg-[#0c0c0c] p-5 hover:border-emerald-500/30 hover:bg-[#0f0f0f] transition-all relative"
              >
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">3</span>
                <TrendingUp className="w-6 h-6 text-emerald-400 mb-3" />
                <h4 className="text-sm font-bold text-white mb-1.5">Customer Insight & LTV</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  4 segmen psikografis, kalkulator LTV, prediksi Churn Risk — kenali siapa pembeli Anda.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-1.5 text-[9px] font-mono text-emerald-400/70">
                  <UserCheck className="w-3 h-3" /> CRM & Retensi
                </div>
              </motion.div>

              {/* Pilar 4 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ y: -3 }}
                className="group rounded-xl border border-purple-500/15 bg-[#0c0c0c] p-5 hover:border-purple-500/30 hover:bg-[#0f0f0f] transition-all relative"
              >
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-purple-500 text-black text-[10px] font-bold flex items-center justify-center">4</span>
                <Zap className="w-6 h-6 text-purple-400 mb-3" />
                <h4 className="text-sm font-bold text-white mb-1.5">Strategy Fusion AI</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  11 saluran rekomendasi strategi dari data DNA. Pilih level: Konservatif, Moderat, atau Agresif.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-1.5 text-[9px] font-mono text-purple-400/70">
                  <Zap className="w-3 h-3" /> 11 Saluran Strategis
                </div>
              </motion.div>

              {/* Pilar 5 */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ y: -3 }}
                className="group rounded-xl border border-cyan-500/15 bg-[#0c0c0c] p-5 hover:border-cyan-500/30 hover:bg-[#0f0f0f] transition-all relative"
              >
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-cyan-500 text-black text-[10px] font-bold flex items-center justify-center">5</span>
                <Image className="w-6 h-6 text-cyan-400 mb-3" />
                <h4 className="text-sm font-bold text-white mb-1.5">Content Design Overlay</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Render 4 variasi overlay visual instan dari foto produk — siap posting IG Stories & WA.
                </p>
                <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/70">
                  <Image className="w-3 h-3" /> Overlay Banner Instan
                </div>
              </motion.div>
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
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-left">
              <div className="flex items-center space-x-2 text-neutral-500 dark:text-[#A3A3A3] mb-3">
                <MonitorSmartphone className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest">Optimized for accessibility</span>
              </div>
              <h3 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-white mb-3">Satu UI Responsif untuk Segala Ukuran Layar</h3>
              <p className="text-xs text-neutral-550 dark:text-[#A3A3A3] leading-relaxed mb-4 font-sans">
                Didukung oleh tema kontras tinggi dan adaptabilitas media yang ramah aksesibilitas. Nyaman dibuka lewat smartphone Android di pasar grosir fisik, hingga laptop beresolusi tinggi di kantor Anda. Dukungan penuh navigasi keyboard dan penata visual minimalis menjamin kegunaan yang adil bagi siapa saja.
              </p>
              <ul className="space-y-2 text-[11px] text-neutral-450 dark:text-[#737373] list-none pl-0">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Mendukung penuh perubahan kontras gelap dan terang dalam sekali sentuh.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Bebas dari iklan mengganggu dan bebas biaya operasional selamanya ($0 Infrastructure).</span>
                </li>
              </ul>
            </div>
            
            {/* Simple Dynamic Demo Box */}
            <div className="w-full lg:w-96 rounded-lg border border-neutral-250 dark:border-[#262626] p-6 bg-neutral-50 dark:bg-[#0A0A0A] text-left">
              <span className="text-[9px] font-mono uppercase text-neutral-400 dark:text-[#737373] block mb-3">Interactive Demo: Try Dynamic Canvas Promo</span>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider block text-neutral-500 dark:text-[#737373] mb-1">Tentukan Nilai Promo Bisnis Anda:</label>
                  <input 
                    type="text" 
                    placeholder="misal: Diskon 30% Terbatas!" 
                    defaultValue="Promo Gajian: Hemat 35%!"
                    className="w-full text-xs px-3 py-2 rounded border bg-white dark:bg-[#111111] border-neutral-300 dark:border-[#262626] text-neutral-900 dark:text-white outline-none focus:border-emerald-500"
                    onChange={() => {}}
                    id="demo-promo-input"
                  />
                </div>
                <button
                  id="btn-demo-proceed"
                  onClick={onEnterDashboard}
                  className="w-full py-2.5 px-4 rounded text-xs font-semibold bg-neutral-900 dark:bg-[#E5E5E5] text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-white flex items-center justify-center space-x-1 transition-all"
                >
                  <span>Mulai Render Foto Produk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
