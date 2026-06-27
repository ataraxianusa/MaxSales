import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Check,
  ShieldCheck,
  Zap,
  Target,
  TrendingUp,
  Image,
  Sun,
  Lock,
  CreditCard,
  BadgePercent,
  Clock,
  Rocket,
  RefreshCcw,
  Star,
} from "lucide-react";

interface PricingSectionProps {
  onBuyNow: () => void;
}

const BENEFITS = [
  {
    icon: Target,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    title: "Competitor War Room",
    desc: "SWOT head-to-head & radar pesaing lokal — temukan celah harga & promosi.",
  },
  {
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    title: "Customer Insight & LTV",
    desc: "4 segmen psikografis, kalkulator Lifetime Value, prediksi Churn Risk.",
  },
  {
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    title: "Strategy Fusion AI",
    desc: "11 saluran strategi promosi personal — Konservatif, Moderat, atau Agresif.",
  },
  {
    icon: Image,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    title: "Content Design Overlay",
    desc: "Render 4 variasi poster promosi instan dari foto produk Anda — siap IG & WA.",
  },
  {
    icon: Sun,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    title: "Daily Sales Pulse",
    desc: "Briefing pasar pagi + checklist eksekusi harian. Streak, XP, dan momentum.",
  },
  {
    icon: Sparkles,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    title: "AI Chatbot Pendamping",
    desc: "Tanya kapan saja — AI yang tahu DNA bisnis Anda dan siap beri saran instan.",
  },
  {
    icon: Rocket,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    title: "Siap Pakai dalam 5 Menit",
    desc: "Isi DNA bisnis sekali, semua fitur langsung aktif. Tidak butuh keahlian teknis.",
  },
  {
    icon: RefreshCcw,
    color: "text-lime-400",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
    title: "Update AI Selamanya",
    desc: "Model AI diperbarui otomatis. Tidak ada biaya tambahan atau langganan tersembunyi.",
  },
];

const TRUST_BADGES = [
  { icon: Lock, label: "Pembayaran Aman" },
  { icon: ShieldCheck, label: "Data Terenkripsi" },
  { icon: CreditCard, label: "Xendit Gateway" },
  { icon: Star, label: "Garansi 7 Hari" },
];

export default function PricingSection({ onBuyNow }: PricingSectionProps) {
  const [hovered, setHovered] = React.useState(false);
  const [countdown, setCountdown] = React.useState({ h: 5, m: 47, s: 12 });

  // Live countdown timer for urgency
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="pricing" className="relative mb-24 scroll-mt-24">
      {/* Radial ambient glow behind the card */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[700px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55 }}
        className="text-center mb-10 relative z-10"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono font-bold tracking-[0.15em] text-emerald-400 uppercase mb-4">
          <BadgePercent className="w-3.5 h-3.5" />
          Harga Perkenalan · Terbatas
        </span>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
          Satu Investasi.{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Seluruh Sistem.
          </span>
        </h2>
        <p className="text-sm text-neutral-400 max-w-md mx-auto">
          Tidak ada langganan bulanan. Tidak ada kejutan biaya. Bayar sekali —
          akses penuh selamanya.
        </p>
      </motion.div>

      {/* Main Pricing Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        {/* Outer glow ring on hover */}
        <div
          className={`absolute -inset-[1px] rounded-3xl transition-all duration-700 ${
            hovered
              ? "bg-gradient-to-br from-emerald-500/50 via-cyan-500/30 to-purple-500/20 blur-sm"
              : "bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent"
          }`}
        />

        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative rounded-3xl border border-emerald-500/25 bg-[#0c0c0c] overflow-hidden shadow-2xl shadow-black/60"
        >
          {/* Top gradient stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 animate-gradient-shift" />

          {/* BEST VALUE ribbon */}
          <div className="absolute top-5 right-5">
            <motion.div
              animate={{ rotate: [0, 1, -1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30"
            >
              ⭐ Best Value
            </motion.div>
          </div>

          <div className="p-7 sm:p-10">
            {/* Plan name */}
            <div className="mb-6">
              <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-[0.2em] block mb-1.5">
                MaxxSales · Akses Penuh
              </span>
              <h3 className="text-xl font-black text-white">
                Paket Founder — Harga Perkenalan
              </h3>
            </div>

            {/* Price display */}
            <div className="flex flex-wrap items-end gap-4 mb-3">
              {/* Main price */}
              <motion.div
                animate={hovered ? { scale: 1.03 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-baseline gap-1.5"
              >
                <span className="text-[11px] font-mono text-emerald-400 -mb-1">Rp</span>
                <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter leading-none">
                  299
                </span>
                <span className="text-2xl font-bold text-white/80 -mb-1">ribu</span>
              </motion.div>

              {/* Strikethrough original price */}
              <div className="flex flex-col items-start pb-1">
                <span className="text-xs font-mono text-neutral-500 line-through">
                  Rp499.000
                </span>
                <span className="text-[10px] font-mono text-neutral-600">
                  harga normal
                </span>
              </div>

              {/* Savings badge */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring", stiffness: 260 }}
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30"
              >
                {/* Shimmer sweep on badge */}
                <motion.span
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent overflow-hidden rounded-xl"
                />
                <BadgePercent className="w-4 h-4 text-emerald-400 relative z-10" />
                <div className="relative z-10">
                  <span className="text-lg font-black text-emerald-400 leading-none block">
                    40%
                  </span>
                  <span className="text-[8px] font-mono text-emerald-500/80 leading-none">
                    HEMAT
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Urgency: countdown */}
            <motion.div
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/8 border border-amber-500/20 mb-7"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-mono text-amber-300">
                Harga berakhir dalam:{" "}
                <span className="font-black text-amber-400">
                  {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
                </span>
              </span>
            </motion.div>

            {/* Divider */}
            <div className="border-t border-neutral-800 mb-7" />

            {/* Benefits list */}
            <div className="mb-8">
              <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-4">
                Semua yang Anda Dapatkan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BENEFITS.map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * i, duration: 0.35 }}
                      whileHover={{ x: 3 }}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${b.border} ${b.bg} group cursor-default transition-all`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${b.bg} border ${b.border} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${b.color}`} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-white block leading-tight mb-0.5">
                          {b.title}
                        </span>
                        <p className="text-[10px] text-neutral-500 leading-snug">
                          {b.desc}
                        </p>
                      </div>
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Extra micro-benefits */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "✓ Tidak ada langganan bulanan",
                  "✓ Akses selamanya",
                  "✓ Gratis update fitur",
                  "✓ Support via WhatsApp",
                  "✓ Garansi 7 hari",
                ].map((txt, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full bg-neutral-800/60 text-[10px] font-mono text-neutral-400 border border-neutral-700/50"
                  >
                    {txt}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              id="cta-buy-now-xendit"
              onClick={onBuyNow}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="group relative w-full py-4 rounded-2xl text-sm font-black transition-all duration-300 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-500 text-black shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center gap-2.5 overflow-hidden mb-4"
            >
              {/* Shimmer sweep */}
              <motion.span
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />
              <CreditCard className="w-5 h-5 relative z-10" />
              <span className="relative z-10 tracking-wide">
                Beli Sekarang — Rp299.000
              </span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>

            {/* Xendit payment info */}
            <div className="flex items-center justify-center gap-2 mb-5">
              <Lock className="w-3 h-3 text-neutral-600" />
              <span className="text-[10px] font-mono text-neutral-600">
                Pembayaran diproses aman via{" "}
                <span className="text-neutral-400 font-bold">Xendit</span> —
                Transfer Bank · QRIS · E-Wallet · Kartu Kredit
              </span>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-4 gap-2">
              {TRUST_BADGES.map((badge, i) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl bg-neutral-900/60 border border-neutral-800/60"
                  >
                    <Icon className="w-4 h-4 text-emerald-500/70" />
                    <span className="text-[8.5px] font-mono text-neutral-500 text-center leading-tight">
                      {badge.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom social proof */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center mt-8 relative z-10"
      >
        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-500 font-mono">
          <span className="flex -space-x-1.5">
            {["🧑", "👩", "👨", "🧑"].map((e, i) => (
              <span
                key={i}
                className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px]"
              >
                {e}
              </span>
            ))}
          </span>
          <span>
            <strong className="text-white">47 pengusaha</strong> bergabung minggu ini
          </span>
          <span className="w-1 h-1 rounded-full bg-neutral-700" />
          <span className="text-emerald-500">⭐⭐⭐⭐⭐ 4.9/5</span>
        </div>
      </motion.div>
    </section>
  );
}
