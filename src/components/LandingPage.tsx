import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import PricingSection from "./PricingSection";
import {
  ArrowRight,
  Target,
  Zap,
  TrendingUp,
  Check,
  Users,
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

function SectionLabel({ n, label }: { n: number; label: string }) {
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
      className="tactical-card p-6 md:p-8"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40 dark:text-dark-text/40">
          Daily Tactical Briefing
        </span>
        <span className="font-mono text-[10px] tracking-[0.1em] text-merah dark:text-merah">
          HARI INI
        </span>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-3.5 h-3.5 text-merah" />
          <span className="font-display text-base text-ink dark:text-dark-text">Celah Bisnis Hari Ini</span>
        </div>
        <p className="text-sm leading-relaxed text-ink/70 dark:text-dark-text/70 font-body">
          Kompetitor utama lemah di response time WhatsApp — rata-rata 4 jam. Ini celah Anda.
        </p>
        <p className="mt-2 font-mono text-xs text-merah dark:text-merah">
          Potensi omzet: Rp 2.400.000/minggu.
        </p>
      </div>

      <div className="border-t border-ink/8 dark:border-dark-text/8 my-5" />

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-3.5 h-3.5 text-emas" />
          <span className="font-display text-base text-ink dark:text-dark-text">Langkah Eksekusi</span>
        </div>
        <div className="space-y-2.5">
          {["Cek DM WhatsApp jam 09:00 — balas personal", "Hubungi 5 pelanggan repeat-order", "Foto 3 varian produk untuk story besok"].map((step, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-mono text-[10px] text-merah dark:text-merah font-bold mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-sm text-ink/70 dark:text-dark-text/70 font-body">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-ink/8 dark:border-dark-text/8 my-5" />

      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-3.5 h-3.5 text-biru" />
          <span className="font-display text-base text-ink dark:text-dark-text">Template WhatsApp</span>
        </div>
        <div className="bg-base dark:bg-space-dark rounded px-4 py-3 border border-ink/5 dark:border-dark-text/5">
          <p className="text-sm text-ink/80 dark:text-dark-text/80 font-body">
            Halo Kak! Lagi ada koleksi baru nih. Boleh saya kirim preview-nya? ✨
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-ink/5 dark:border-dark-text/5 flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/30 dark:text-dark-text/30">3-Chain AI</span>
        <span className="font-mono text-[9px] tracking-[0.1em] text-ink/30 dark:text-dark-text/30">0.8s</span>
      </div>
    </motion.div>
  );
}

const PROBLEMS = [
  { icon: Clock, title: "Tidak punya strategi", desc: "Setiap hari improvisasi. Tidak tahu harus fokus ke mana." },
  { icon: Users, title: "Kompetitor terus berkembang", desc: "Anda tidak tahu kelemahan mereka." },
  { icon: PenTool, title: "Buang waktu 3 jam sehari", desc: "Mikir konten yang tidak convert." },
];

const FEATURES = [
  { icon: TrendingUp, title: "Daily Sales Pulse", desc: "Briefing harian dari 3-chain AI. Siap eksekusi.", color: "merah" },
  { icon: Target, title: "Competitor War Room", desc: "Intelijen kompetitor + SWOT otomatis.", color: "biru" },
  { icon: Users, title: "Customer Insight", desc: "Segmentasi, LTV, churn risk.", color: "emas" },
  { icon: Lightbulb, title: "Strategy Forge", desc: "Blueprint 5-11 pilar berbasis DNA bisnis.", color: "biru" },
  { icon: PenTool, title: "Content Generator", desc: "Headlines, caption, hashtag otomatis.", color: "emas" },
  { icon: MessageSquare, title: "AI Advisor", desc: "Chatbot kontekstual 24/7.", color: "merah" },
];

const STEPS = [
  { n: 1, title: "Isi DNA Business Canvas", desc: "5 menit. 6 tab tentang bisnis Anda.", detail: "AI belajar dari data Anda, bukan teori." },
  { n: 2, title: "Terima Briefing Harian", desc: "Setiap pagi: 3 langkah + template WhatsApp.", detail: "GapAnalyzer → ExecutionPlan → CommsWriter." },
  { n: 3, title: "Eksekusi & Lihat Hasil", desc: "Jalankan strategi, track omset.", detail: "Sistem belajar setiap hari." },
];

const FAQ_ITEMS = [
  {
    q: "Saya gaptek, bisa pakai ini?",
    a: "Bisa banget. MaxSales dirancang untuk pengusaha, bukan programmer. Anda cukup isi formulir bisnis seperti ngobrol biasa — soal produk, pelanggan, harga. Setelah itu, AI yang bekerja. Tidak perlu install apa pun, cukup buka browser.",
  },
  {
    q: "Kok bisa AI tahu bisnis saya? Datanya dari mana?",
    a: "Semua dari data yang Anda sendiri isi lewat DNA Business Canvas — ada 6 tab yang mencakup produk, target pasar, pola keuangan, channel media, performa real-time, dan kompetitor. Semakin lengkap Anda isi, semakin tajam rekomendasinya. Tidak ada data yang diambil dari luar.",
  },
  {
    q: "Aman nggak sih data bisnis saya?",
    a: "Aman. Semua data tersimpan di browser Anda sendiri (localStorage), bukan di server kami. Tidak ada database pusat yang menyimpan data pribadi Anda. Kalau mau hapus, tinggal clear browser — data hilang selamanya.",
  },
  {
    q: "Bisnis saya bidang jasa, cocok nggak?",
    a: "Cocok. MaxSales dipakai oleh pengusaha F&B, fashion, retail, jasa catering, salon, bengkel, sampai kerajinan tangan. Yang penting Anda punya produk atau jasa yang dijual dan ingin omset naik — sisanya AI bantu.",
  },
  {
    q: "Gimana kalau ternyata nggak cocok?",
    a: "Hubungi kami dalam 7 hari pertama. Kami bantu cari solusinya, atau kalau memang tidak cocok, kami refund 100% tanpa ribet. Kami nggak mau uang Anda kalau produknya nggak bermanfaat.",
  },
];

const TESTIMONIALS = [
  {
    name: "Siti Nurhaliza",
    role: "Pemilik Katering Rumahan, Surabaya",
    quote: "Dulu saya bingung setiap mau promosi. Sekarang tinggal buka MaxSales pagi-pagi, langsung dapat template WhatsApp yang tinggal kirim. Omset bulan ini naik 25%.",
    initials: "SN",
  },
  {
    name: "Budi Santoso",
    role: "Reseller Fashion, Jakarta",
    quote: "Fitur Competitor War Room-nya juara. Saya jadi tahu kelemahan kompetitor dan bisa ambil celah. Yang paling suka, AI-nya ngomong bahasa manusia — bukan bahasa robot.",
    initials: "BS",
  },
  {
    name: "Rina Wijaya",
    role: "Pemilik Toko Kue Online, Bandung",
    quote: "Saya nggak ngerti teknologi sama sekali, tapi MaxSales gampang banget dipakai. Sekarang setiap pagi saya punya 'briefing' dari AI — kayak punya asisten pribadi yang ngerti bisnis saya.",
    initials: "RW",
  },
];

export default function LandingPage({ onEnterDashboard }: LandingPageProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  return (
    <div className="min-h-screen bg-base dark:bg-space-dark text-ink dark:text-dark-text font-body">
      {/* ── HERO ──────────────────────────────────────── */}
      <section id="visual-showcase" className="w-full px-6 md:px-12 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-6xl mx-auto">
        <SectionLabel n={1} label="SISTEM OPERASI PERTUMBUHAN BISNIS" />

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <motion.h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-ink dark:text-dark-text mb-6 leading-tight" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              Ubah Produk Biasa<br /><span className="text-merah dark:text-merah">Jadi Luar Biasa</span>
            </motion.h1>

            <motion.p className="text-lg text-ink/60 dark:text-dark-text/60 mb-8 max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              AI yang memahami bisnis Anda. Strategi siap eksekusi setiap hari.
            </motion.p>

            <motion.div className="flex flex-wrap gap-3 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
              <button onClick={onEnterDashboard} className="bg-merah text-white px-6 py-3 font-mono text-sm tracking-[0.05em] uppercase hover:bg-merah/90 transition-colors flex items-center gap-2">
                Mulai Sekarang <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#pricing" className="px-6 py-3 border border-ink/15 dark:border-dark-text/15 font-mono text-sm tracking-[0.05em] uppercase text-ink/70 dark:text-dark-text/70 hover:border-ink/30 dark:hover:border-dark-text/30 transition-colors">
                Lihat Harga
              </a>
            </motion.div>

            <motion.div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink/40 dark:text-dark-text/40 font-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Lifetime access</span>
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Tanpa biaya tersembunyi</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Siap pakai 5 menit</span>
            </motion.div>
          </div>

          <div className="hidden lg:block"><TacticalBriefingCard /></div>
        </div>

        <div className="lg:hidden mt-10"><TacticalBriefingCard /></div>
        </div>
      </section>

      {/* ── PROBLEM ───────────────────────────────────── */}
      <section className="border-t border-ink/5 dark:border-dark-text/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <SectionLabel n={2} label="KENAPA ANDA BUTUH INI" />

          <div className="grid md:grid-cols-3 gap-4">
            {PROBLEMS.map((p, i) => (
              <motion.div key={i} className="paper-surface rounded-sm p-6" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="w-10 h-10 flex items-center justify-center border border-merah/20 mb-4">
                  <p.icon className="w-5 h-5 text-merah" />
                </div>
                <h3 className="font-body font-bold text-base text-ink dark:text-dark-text mb-2">{p.title}</h3>
                <p className="text-sm text-ink/60 dark:text-dark-text/60">{p.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.p className="mt-8 text-lg text-ink/70 dark:text-dark-text/70" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
            MaxSales menyelesaikan ketiganya dalam <strong className="text-ink dark:text-dark-text">satu briefing harian</strong>.
          </motion.p>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section className="border-t border-ink/5 dark:border-dark-text/5 bg-krem/50 dark:bg-dark-krem/30">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <SectionLabel n={3} label="6 MODUL INTI" />

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={i} className="paper-surface rounded-sm p-6 group" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.4, delay: i * 0.06 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 flex items-center justify-center border ${f.color === "merah" ? "border-merah/20" : f.color === "emas" ? "border-emas/20" : "border-biru/20"}`}>
                    <f.icon className={`w-4 h-4 ${f.color === "merah" ? "text-merah" : f.color === "emas" ? "text-emas" : "text-biru"}`} />
                  </div>
                  <h3 className="font-body font-bold text-sm text-ink dark:text-dark-text">{f.title}</h3>
                </div>
                <p className="text-sm text-ink/60 dark:text-dark-text/60">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Animated Steps ─────────────── */}
      <section id="dna-canvas" className="border-t border-ink/5 dark:border-dark-text/5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <SectionLabel n={4} label="CARA KERJA" />

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Big number */}
                <motion.div
                  className="w-16 h-16 flex items-center justify-center border-2 border-merah/20 dark:border-merah/20 mb-5"
                  whileHover={{ scale: 1.05, borderColor: "var(--color-merah)" }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="font-mono text-3xl font-bold text-merah dark:text-merah">{s.n}</span>
                </motion.div>

                <h3 className="font-display text-xl text-ink dark:text-dark-text mb-2">{s.title}</h3>
                <p className="text-sm text-ink/60 dark:text-dark-text/60 mb-1">{s.desc}</p>
                <p className="text-xs font-mono text-ink/30 dark:text-dark-text/30">{s.detail}</p>

                {/* Connector line (not on last) */}
                {i < STEPS.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute top-8 left-full w-full h-px border-t border-dashed border-ink/10 dark:border-dark-text/10"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.2 + 0.4 }}
                    style={{ transformOrigin: "left" }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────── */}
      <section id="pricing" className="border-t border-ink/5 dark:border-dark-text/5 bg-krem/50 dark:bg-dark-krem/30">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <SectionLabel n={5} label="HARGA" />
          <PricingSection onBuyNow={onEnterDashboard} />
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
      <section className="border-t border-ink/5 dark:border-dark-text/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <SectionLabel n={6} label="KATA MEREKA" />

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                className="paper-surface rounded-sm p-6"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-biru/10 dark:bg-biru/20 flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-biru dark:text-biru">{t.initials}</span>
                  </div>
                  <div>
                    <p className="font-body font-bold text-sm text-ink dark:text-dark-text">{t.name}</p>
                    <p className="font-mono text-[10px] text-ink/40 dark:text-dark-text/40">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-ink/70 dark:text-dark-text/70 leading-relaxed italic">"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section id="faq" className="border-t border-ink/5 dark:border-dark-text/5 bg-krem/50 dark:bg-dark-krem/30">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24">
          <SectionLabel n={7} label="PERTANYAAN" />

          <div className="space-y-0">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div key={i} className="border-b border-ink/5 dark:border-dark-text/5" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}>
                <button className="w-full flex items-center justify-between py-5 text-left group" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-body font-bold text-sm text-ink dark:text-dark-text group-hover:text-merah dark:group-hover:text-merah transition-colors pr-4">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-ink/30 dark:text-dark-text/30 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div className="pb-5 pr-8" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
                    <p className="text-sm text-ink/60 dark:text-dark-text/60">{item.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-ink/5 dark:border-dark-text/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="font-display text-base text-ink dark:text-dark-text">MaxxSales</span>
            <p className="text-xs text-ink/30 dark:text-dark-text/30 mt-1 font-mono">© 2026 VOXIA. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-xs font-mono text-ink/40 dark:text-dark-text/40">
            <Link to="/about" className="hover:text-ink dark:hover:text-dark-text transition-colors">Tentang</Link>
            <Link to="/terms" className="hover:text-ink dark:hover:text-dark-text transition-colors">Syarat</Link>
            <Link to="/privacy" className="hover:text-ink dark:hover:text-dark-text transition-colors">Privasi</Link>
            <Link to="/risk" className="hover:text-ink dark:hover:text-dark-text transition-colors">Risiko</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
