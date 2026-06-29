import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import PricingSection from "./PricingSection";
import {
  ArrowRight,
  Target,
  Zap,
  TrendingUp,
  Sun,
  Moon,
  Check,
  Users,
  BarChart3,
  MessageSquare,
  Lightbulb,
  PenTool,
  Clock,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

interface LandingPageProps {
  onEnterDashboard: () => void;
  brandName: string;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

const SECTION_LABELS = [
  "SISTEM OPERASI PERTUMBUHAN BISNIS",
  "KENAPA ANDA BUTUH INI",
  "6 MODUL INTI",
  "CARA KERJA",
  "HARGA",
  "PERTANYAAN",
];

function SectionNumber({ n, label }: { n: number; label: string }) {
  return (
    <motion.div
      className="flex items-center gap-3 mb-8"
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <span className="font-mono text-xs tracking-[0.15em] text-merah dark:text-merah font-bold">
        {String(n).padStart(2, "0")}
      </span>
      <span className="w-8 h-px bg-ink/20 dark:bg-dark-text/20" />
      <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 dark:text-dark-text/50">
        {label}
      </span>
    </motion.div>
  );
}

function TacticalBriefingCard() {
  return (
    <motion.div
      className="tactical-card p-6 md:p-8 max-w-lg mx-auto lg:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 dark:text-dark-text/40">
          Daily Tactical Briefing
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-merah dark:text-merah">
          HARI INI
        </span>
      </div>

      {/* Section 1: Gap */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5 text-merah" />
          <span className="font-display text-base text-ink dark:text-dark-text">
            Celah Bisnis Hari Ini
          </span>
        </div>
        <p className="text-sm leading-relaxed text-ink/70 dark:text-dark-text/70 font-body">
          Kompetitor utama lemah di response time WhatsApp — rata-rata 4 jam.
          Pelanggan yang chat jam 10 pagi baru dibalas jam 2 siang. Ini celah Anda.
        </p>
        <p className="mt-2 font-mono text-xs text-merah dark:text-merah">
          Jika tidak dibereskan, Anda kehilangan Rp 2.400.000/minggu.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-ink/8 dark:border-dark-text/8 my-5" />

      {/* Section 2: Steps */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-3.5 h-3.5 text-emas" />
          <span className="font-display text-base text-ink dark:text-dark-text">
            Langkah Eksekusi
          </span>
        </div>
        <div className="space-y-2.5">
          {[
            "Cek semua DM WhatsApp jam 09:00 — balas personal dengan penawaran",
            "Hubungi 5 pelanggan repeat-order via chat, tawarkan early access",
            "Foto 3 varian produk dengan pencahayaan natural untuk story besok",
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-mono text-[10px] text-merah dark:text-merah font-bold mt-0.5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-sm text-ink/70 dark:text-dark-text/70 font-body leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-ink/8 dark:border-dark-text/8 my-5" />

      {/* Section 3: Template */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-biru" />
          <span className="font-display text-base text-ink dark:text-dark-text">
            Template WhatsApp
          </span>
        </div>
        <div className="bg-base dark:bg-space-dark rounded px-4 py-3 border border-ink/5 dark:border-dark-text/5">
          <p className="text-sm text-ink/80 dark:text-dark-text/80 font-body leading-relaxed">
            Halo Kak! Lagi ada koleksi baru nih yang mirip banget sama selera Kakak
            selama ini. Boleh saya kirim preview-nya? Siapa tau cocok ✨
          </p>
        </div>
      </div>

      {/* Card footer */}
      <div className="mt-5 pt-4 border-t border-ink/5 dark:border-dark-text/5 flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/30 dark:text-dark-text/30">
          Generated by 3-Chain AI
        </span>
        <span className="font-mono text-[9px] tracking-[0.1em] text-ink/30 dark:text-dark-text/30">
          0.8s · 1.024 tokens
        </span>
      </div>
    </motion.div>
  );
}

const PROBLEMS = [
  {
    icon: Clock,
    title: "Tidak punya strategi",
    desc: "Setiap hari improvisasi. Tidak tahu harus fokus ke mana.",
  },
  {
    icon: Users,
    title: "Kompetitor terus berkembang",
    desc: "Anda tidak tahu kelemahan mereka, dan mereka tahu kekuatan Anda.",
  },
  {
    icon: PenTool,
    title: "Buang waktu 3 jam sehari",
    desc: "Mikir konten yang tidak convert. Foto produk yang tidak ada yang lihat.",
  },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Daily Sales Pulse",
    desc: "Briefing harian dari 3-chain AI. Celah bisnis, langkah eksekusi, template WhatsApp — siap kirim.",
    color: "merah",
  },
  {
    icon: Target,
    title: "Competitor War Room",
    desc: "Intelijen kompetitor otomatis. SWOT analysis, radar chart, identifikasi blind spot mereka.",
    color: "biru",
  },
  {
    icon: Users,
    title: "Customer Insight",
    desc: "Segmentasi pelanggan, prediksi LTV, churn risk analysis. Tahu siapa yang harus dijaga.",
    color: "emas",
  },
  {
    icon: Lightbulb,
    title: "Strategy Forge",
    desc: "Blueprint strategi 5-11 pilar berbasis DNA bisnis Anda. Konservatif sampai agresif.",
    color: "biru",
  },
  {
    icon: PenTool,
    title: "Content Generator",
    desc: "Headlines, caption, hashtag, promo text — otomatis untuk Instagram, WhatsApp, Story.",
    color: "emas",
  },
  {
    icon: MessageSquare,
    title: "AI Advisor",
    desc: "Chatbot kontekstual yang memahami DNA bisnis Anda. Tanya apa saja, kapan saja.",
    color: "merah",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Isi DNA Business Canvas",
    desc: "Jawab 6 tab tentang bisnis Anda — produk, pelanggan, pola, media, performa, kompetitor. 5 menit.",
    detail: "AI belajar dari data bisnis Anda, bukan teori umum.",
  },
  {
    n: 2,
    title: "Terima Briefing Taktis Harian",
    desc: "Setiap pagi, AI kasih 3 langkah eksekusi + template WhatsApp siap kirim.",
    detail: "3-chain pipeline: GapAnalyzer → ExecutionPlan → CommsWriter.",
  },
  {
    n: 3,
    title: "Eksekusi & Lihat Hasilnya",
    desc: "Jalankan strategi, track omset, ulangi yang berhasil. Sistem belajar setiap hari.",
    detail: "Streak tracking, revenue chart, engagement metrics.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Apakah saya perlu keahlian teknis?",
    a: "Tidak. Isi formulir bisnis seperti ngobrol biasa, AI yang bekerja. Tidak perlu install apa pun — buka browser, langsung pakai.",
  },
  {
    q: "Bagaimana AI tahu bisnis saya?",
    a: "Dari DNA Business Canvas yang Anda isi — 59 field tentang produk, pelanggan, pola bisnis, dan kompetitor. Semakin lengkap, semakin tajam rekomendasinya.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Ya. Data disimpan di browser Anda (localStorage). Tidak ada server database yang menyimpan data pribadi. Anda bisa hapus kapan saja.",
  },
  {
    q: "Bisa dipakai untuk berbagai jenis bisnis?",
    a: "Ya. F&B, fashion, retail, jasa, kerajinan — MaxSales dirancang untuk pengusaha Indonesia di semua industri.",
  },
  {
    q: "Ada garansi uang kembali?",
    a: "Hubungi kami dalam 7 hari jika tidak puas. Kami akan bantu atau refund 100%.",
  },
];

export default function LandingPage({ onEnterDashboard, brandName, darkMode, setDarkMode }: LandingPageProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-base dark:bg-space-dark text-ink dark:text-dark-text font-body">
      {/* ── Navigation ────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-base/80 dark:bg-space-dark/80 backdrop-blur-md border-b border-ink/5 dark:border-dark-text/5">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display text-lg text-ink dark:text-dark-text">
            {brandName || "MaxxSales"}
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-ink/40 dark:text-dark-text/40 hover:text-ink dark:hover:text-dark-text transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onEnterDashboard}
              className="font-mono text-xs tracking-[0.1em] uppercase text-merah dark:text-merah hover:underline underline-offset-4"
            >
              Masuk
            </button>
          </div>
        </div>
      </nav>

      {/* ── Section 01: HERO ──────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <SectionNumber n={1} label={SECTION_LABELS[0]} />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Copy */}
          <div>
            <motion.h1
              className="font-display text-4xl md:text-[56px] md:leading-[64px] text-ink dark:text-dark-text mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Ubah Produk Biasa{" "}
              <span className="text-merah dark:text-merah">Jadi Luar Biasa</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-ink/60 dark:text-dark-text/60 mb-8 leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              AI yang memahami bisnis Anda. Bukan teori — tapi strategi siap eksekusi setiap hari.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button
                onClick={onEnterDashboard}
                className="bg-merah text-white px-6 py-3 font-mono text-sm tracking-[0.05em] uppercase hover:bg-merah/90 transition-colors flex items-center gap-2"
              >
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#demo"
                className="px-6 py-3 border border-ink/15 dark:border-dark-text/15 font-mono text-sm tracking-[0.05em] uppercase text-ink/70 dark:text-dark-text/70 hover:border-ink/30 dark:hover:border-dark-text/30 transition-colors"
              >
                Lihat Demo
              </a>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/40 dark:text-dark-text/40 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Lifetime access
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3 h-3" /> Tanpa biaya tersembunyi
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Siap pakai 5 menit
              </span>
            </motion.div>
          </div>

          {/* Right: Tactical Briefing Card */}
          <div className="hidden lg:block">
            <TacticalBriefingCard />
          </div>
        </div>

        {/* Mobile: Tactical Card below copy */}
        <div className="lg:hidden mt-12">
          <TacticalBriefingCard />
        </div>
      </section>

      {/* ── Section 02: PROBLEM ───────────────────────── */}
      <section className="border-t border-ink/5 dark:border-dark-text/5">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <SectionNumber n={2} label={SECTION_LABELS[1]} />

          <motion.h2
            className="font-display text-3xl md:text-4xl text-ink dark:text-dark-text mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            Tiga masalah yang setiap{" "}
            <span className="text-merah dark:text-merah">pengusaha</span> hadapi setiap hari.
          </motion.h2>

          <div className="space-y-6">
            {PROBLEMS.map((p, i) => (
              <motion.div
                key={i}
                className="paper-surface rounded-sm p-6 flex gap-5"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="shrink-0 w-10 h-10 flex items-center justify-center border border-merah/20 dark:border-merah/20">
                  <p.icon className="w-5 h-5 text-merah" />
                </div>
                <div>
                  <h3 className="font-body font-bold text-base text-ink dark:text-dark-text mb-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-ink/60 dark:text-dark-text/60 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="mt-10 text-lg text-ink/70 dark:text-dark-text/70 font-body"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            MaxSales menyelesaikan ketiganya dalam{" "}
            <strong className="text-ink dark:text-dark-text">satu briefing harian</strong>.
          </motion.p>
        </div>
      </section>

      {/* ── Section 03: FEATURES ──────────────────────── */}
      <section className="border-t border-ink/5 dark:border-dark-text/5 bg-krem/50 dark:bg-dark-krem/30">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <SectionNumber n={3} label={SECTION_LABELS[2]} />

          <motion.h2
            className="font-display text-3xl md:text-4xl text-ink dark:text-dark-text mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            6 modul. Satu tujuan.
          </motion.h2>
          <motion.p
            className="text-base text-ink/50 dark:text-dark-text/50 mb-12 max-w-md"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Masing-masing dirancang untuk satu hal: menaikkan omset Anda.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                className="paper-surface rounded-sm p-6 group"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 flex items-center justify-center border ${
                    f.color === "merah" ? "border-merah/20" :
                    f.color === "emas" ? "border-emas/20" :
                    "border-biru/20"
                  }`}>
                    <f.icon className={`w-4 h-4 ${
                      f.color === "merah" ? "text-merah" :
                      f.color === "emas" ? "text-emas" :
                      "text-biru"
                    }`} />
                  </div>
                  <h3 className="font-body font-bold text-sm text-ink dark:text-dark-text">
                    {f.title}
                  </h3>
                </div>
                <p className="text-sm text-ink/60 dark:text-dark-text/60 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 04: HOW IT WORKS ──────────────────── */}
      <section className="border-t border-ink/5 dark:border-dark-text/5">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <SectionNumber n={4} label={SECTION_LABELS[3]} />

          <motion.h2
            className="font-display text-3xl md:text-4xl text-ink dark:text-dark-text mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            Tiga langkah. Tidak lebih.
          </motion.h2>

          <div className="space-y-0">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <motion.div
                  className="flex gap-6 py-8"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="shrink-0 w-12 h-12 flex items-center justify-center border border-ink/10 dark:border-dark-text/10">
                    <span className="font-mono text-lg font-bold text-merah dark:text-merah">
                      {s.n}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-xl text-ink dark:text-dark-text mb-2">
                      {s.title}
                    </h3>
                    <p className="text-sm text-ink/60 dark:text-dark-text/60 leading-relaxed mb-1">
                      {s.desc}
                    </p>
                    <p className="text-xs font-mono text-ink/30 dark:text-dark-text/30">
                      {s.detail}
                    </p>
                  </div>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className="ml-6 border-l border-dashed border-ink/10 dark:border-dark-text/10 h-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 05: PRICING ───────────────────────── */}
      <section className="border-t border-ink/5 dark:border-dark-text/5 bg-krem/50 dark:bg-dark-krem/30">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <SectionNumber n={5} label={SECTION_LABELS[4]} />

          <motion.h2
            className="font-display text-3xl md:text-4xl text-ink dark:text-dark-text mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            Harga yang masuk akal.
          </motion.h2>

          <PricingSection onBuyNow={onEnterDashboard} />
        </div>
      </section>

      {/* ── Section 06: FAQ ───────────────────────────── */}
      <section className="border-t border-ink/5 dark:border-dark-text/5">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
          <SectionNumber n={6} label={SECTION_LABELS[5]} />

          <motion.h2
            className="font-display text-3xl md:text-4xl text-ink dark:text-dark-text mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            Pertanyaan yang sering ditanyakan.
          </motion.h2>

          <div className="space-y-0">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                className="border-b border-ink/5 dark:border-dark-text/5"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <button
                  className="w-full flex items-center justify-between py-5 text-left group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-body font-bold text-sm text-ink dark:text-dark-text group-hover:text-merah dark:group-hover:text-merah transition-colors pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink/30 dark:text-dark-text/30 shrink-0 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <motion.div
                    className="pb-5 pr-8"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-ink/60 dark:text-dark-text/60 leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-ink/5 dark:border-dark-text/5">
        <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="font-display text-base text-ink dark:text-dark-text">
              {brandName || "MaxxSales"}
            </span>
            <p className="text-xs text-ink/30 dark:text-dark-text/30 mt-1 font-mono">
              © 2026 VOXIA. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-xs font-mono text-ink/40 dark:text-dark-text/40">
            <Link to="/about" className="hover:text-ink dark:hover:text-dark-text transition-colors">
              Tentang
            </Link>
            <Link to="/terms" className="hover:text-ink dark:hover:text-dark-text transition-colors">
              Syarat
            </Link>
            <Link to="/privacy" className="hover:text-ink dark:hover:text-dark-text transition-colors">
              Privasi
            </Link>
            <Link to="/risk" className="hover:text-ink dark:hover:text-dark-text transition-colors">
              Risiko
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
