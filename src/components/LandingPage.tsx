import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Target, Zap, Image, TrendingUp, MonitorSmartphone } from "lucide-react";

interface LandingPageProps {
  onEnterDashboard: () => void;
  onEnterDocs: () => void;
  brandName: string;
}

export default function LandingPage({ onEnterDashboard, onEnterDocs, brandName }: LandingPageProps) {
  return (
    <div className="relative overflow-hidden transition-colors duration-300 bg-white dark:bg-[#050505] text-neutral-900 dark:text-[#E5E5E5] min-h-[calc(100vh-4rem)]">
      {/* Decorative Grid Backdrop or Subtle Light */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-24 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-neutral-100 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-neutral-650 dark:text-[#A3A3A3]" />
            <span className="text-[10px] font-bold font-mono tracking-widest text-neutral-600 dark:text-[#A3A3A3] uppercase">
              AI BUSINESS BRAIN SYSTEM FOR SME PIONEERS
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-6 leading-tight text-neutral-900 dark:text-white">
            Ubah Produk Biasa Jadi 
            <span className="block font-semibold text-neutral-800 dark:text-[#E5E5E5] mt-2">
              Penjualan Maksimal (MaxxSales)
            </span>
          </h1>

          <p className="text-base text-neutral-500 dark:text-[#A3A3A3] mb-10 leading-relaxed font-sans max-w-2xl mx-auto">
            MaxxSales bertindak sebagai <strong className="text-neutral-800 dark:text-white font-semibold">AI Business Brain</strong> Anda untuk memodelkan DNA produk, mengintai kompetitor lokal secara rahasia, memetakan segmentasi pembeli sejati, meramu 11 pilar taktis penjualan, hingga melahirkan materi flier promosi langsung dengan visual overlay foto produk Anda.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="cta-start-dashboard"
              onClick={onEnterDashboard}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-sm font-semibold transition-all shadow-sm text-white dark:text-black bg-neutral-950 hover:bg-neutral-850 dark:bg-[#E5E5E5] dark:hover:bg-white flex items-center justify-center space-x-2"
            >
              <span>Mulai Buat DNA Bisnis Anda</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="cta-go-docs"
              onClick={onEnterDocs}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-sm font-medium transition-all border border-neutral-200 dark:border-[#262626] hover:bg-neutral-50 dark:hover:bg-[#111111] text-neutral-700 dark:text-[#A3A3A3]"
            >
              <span>Dokumentasi Sistem</span>
            </button>
          </div>
        </div>

        {/* Bento Grid layout of 5 Key Pillars */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
              5 Pilar MVP Core yang Mengubah Aturan Main Penjualan Anda
            </h2>
            <p className="text-xs font-mono text-neutral-400 dark:text-[#737373] uppercase tracking-wider mt-2">
              Segala alat bantu yang dibutuhkan pemilik UKM untuk mendominasi kompetisi tanpa berlangganan mahal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            
            {/* Feature 1: DNA Business Canvas (Larger box) */}
            <div className="md:col-span-3 rounded-xl p-6 border transition-all bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:border-neutral-450 dark:hover:border-neutral-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-800 dark:text-white mb-4 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white mb-2">Fondasi: DNA Business Canvas</h3>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] leading-relaxed mb-4">
                  Data statis berisi identitas bisnis terdalam Anda mulai dari spesifikasi fisik produk, target segmentasi mikro, pola logistik, hingga preferensi media sosial sasaran. DNA ini yang melandasi keakuratan seluruh fitur pintar lainnya.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252]">
                <span>Sekali Isi, Pakai Selamanya</span>
                <span className="text-neutral-900 dark:text-white font-semibold uppercase tracking-wider">DNA INTEGRASI</span>
              </div>
            </div>

            {/* Feature 2: Competitor War Room */}
            <div className="md:col-span-3 rounded-xl p-6 border transition-all bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:border-neutral-450 dark:hover:border-neutral-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-850 dark:text-white mb-4 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white mb-2">Fitur 1: Competitor War Room</h3>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] leading-relaxed mb-4">
                  Petakan kekuatan, kelemahan, peluang, dan ancaman (SWOT) dari kompetitor lokal terdekat maupun kelas berat. Bandingkan strategi keunggulan produk Anda langsung berdampingan (head-to-head) untuk mencari celah perang harga dan kemasan.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252]">
                <span>SWOT Manual & AI-Insights</span>
                <span className="text-neutral-900 dark:text-white font-semibold uppercase tracking-wider">PERTANDINGAN PASAR</span>
              </div>
            </div>

            {/* Feature 3: Customer Insight & Segmentation */}
            <div className="md:col-span-2 rounded-xl p-6 border transition-all bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:border-neutral-450 dark:hover:border-neutral-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-800 dark:text-white mb-4 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-md font-semibold tracking-tight text-neutral-900 dark:text-white mb-2">Fitur 2: Customer Insight</h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
                  Bagi pembeli Anda ke dalam 4 modul segmentasi psikografis yang akurat. Disertai kalkulator LTV (Lifetime Value) dan modul prediksi Churn Risk pelanggan agar Anda tahu kapan harus melancarkan promosi retensi khusus.
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252]">
                <span>CRM & RETENTION GUARD</span>
              </div>
            </div>

            {/* Feature 4: Strategy Fusion */}
            <div className="md:col-span-2 rounded-xl p-6 border transition-all bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:border-neutral-450 dark:hover:border-neutral-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-800 dark:text-white mb-4 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-md font-semibold tracking-tight text-neutral-900 dark:text-white mb-2">Fitur 3: Strategy Fusion</h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
                  Gabungkan parameter dari seluruh DNA Anda untuk melahirkan 11 pilar rekomendasi strategi operasional konkret. Pilih tingkat optimisme bisnis Anda: Konservatif hemat modal, Moderat berhati-hati, atau Agresif penuh ekspansi.
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252]">
                <span>11 UNSUR STRATEGIS</span>
              </div>
            </div>

            {/* Feature 5: Content Generator with Image Overlay (Visual highlighted grid) */}
            <div className="md:col-span-2 rounded-xl p-6 border transition-all bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:border-neutral-450 dark:hover:border-neutral-700 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-800 dark:text-white mb-4 flex items-center justify-center">
                  <Image className="w-5 h-5" />
                </div>
                <h3 className="text-md font-semibold tracking-tight text-neutral-900 dark:text-white mb-2">Fitur 4: Content Overlay</h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
                  Upload jepretan foto produk polos dari smartphone Anda, ketik nominal promo/CTA yang dimau, dan biarkan sistem merender 4 variasi visual overlay tangguh secara client-side gratis (Feed, Stories, katalog WA, disertai caption).
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252]">
                <span>OVERLAY BANNER INSTAN</span>
              </div>
            </div>

            {/* Feature 6: Daily Sales Pulse (Full row width / emphasis) */}
            <div className="md:col-span-6 rounded-xl p-6 border transition-all bg-[#0F0F0F] border-[#262626] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2.5 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#262626] border border-neutral-800 text-[9px] font-mono text-[#A3A3A3] font-bold uppercase tracking-wider">DAILY HEARTBEAT CORE</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight">Daily Sales Pulse: Asisten Penjualan Harian</h4>
                </div>
                <p className="text-xs text-[#A3A3A3] leading-relaxed">
                  Awali pagi hari Anda dengan briefing performa pasar yang energik. Dapatkan checklist daftar aktivitas penjualan (action items) taktis harian terkomputerisasi. Cukup centang aktivitas yang selesai untuk melacak kemapanan pencapaian target omzet Anda.
                </p>
              </div>
              <button
                id="btn-pulse-preview-landing"
                onClick={onEnterDashboard}
                className="w-full md:w-auto px-5 py-2.5 rounded text-xs font-semibold bg-[#E5E5E5] text-black hover:bg-white flex items-center justify-center space-x-1.5 shrink-0"
              >
                <span>Buka Daily Pulse Anda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Responsive Showcase / Accessibility Focus */}
        <div className="rounded-xl border p-8 bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] mb-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 text-neutral-500 dark:text-[#A3A3A3] mb-3">
                <MonitorSmartphone className="w-4 h-4" />
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest">Optimized for accessibility</span>
              </div>
              <h3 className="text-2xl font-light tracking-tight text-neutral-900 dark:text-white mb-3">Satu UI Responsif untuk Segala Ukuran Layar</h3>
              <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] leading-relaxed mb-4 font-sans">
                Didukung oleh tema kontras tinggi dan adaptabilitas media yang ramah aksesibilitas. Nyaman dibuka lewat smartphone Android di pasar grosir fisik, hingga laptop beresolusi tinggi di kantor Anda. Dukungan penuh navigasi keyboard dan penata visual minimalis menjamin kegunaan yang adil bagi siapa saja.
              </p>
              <ul className="space-y-2 text-[11px] text-neutral-400 dark:text-[#737373]">
                <li className="flex items-center space-x-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-white"></span>
                  <span>Mendukung penuh perubahan kontras gelap dan terang dalam sekali sentuh.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-white"></span>
                  <span>Bebas dari iklan mengganggu dan bebas biaya operasional selamanya ($0 Infrastructure).</span>
                </li>
              </ul>
            </div>
            
            {/* Minimalist interactive simulator on landing */}
            <div className="w-full lg:w-96 rounded-lg border border-neutral-200 dark:border-[#262626] p-6 bg-neutral-50 dark:bg-[#0A0A0A]">
              <span className="text-[9px] font-mono uppercase text-neutral-400 dark:text-[#737373] block mb-3">Interactive Demo: Try Dynamic Canvas Promo</span>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider block text-neutral-500 dark:text-[#737373] mb-1">Tentukan Nilai Promo Bisnis Anda:</label>
                  <input 
                    type="text" 
                    placeholder="misal: Diskon 30% Terbatas!" 
                    defaultValue="Promo Gajian: Hemat 35%!"
                    className="w-full text-xs px-3 py-2 rounded border bg-white dark:bg-[#111111] border-neutral-300 dark:border-[#262626] text-neutral-900 dark:text-white outline-none"
                    onChange={() => {}}
                    id="demo-promo-input"
                  />
                </div>
                <button
                  id="btn-demo-proceed"
                  onClick={onEnterDashboard}
                  className="w-full py-2 px-4 rounded text-xs font-semibold bg-neutral-900 dark:bg-[#E5E5E5] text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-white flex items-center justify-center space-x-1"
                >
                  <span>Mulai Render Foto Produk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
