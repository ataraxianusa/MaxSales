import React from "react";
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
  UserCheck
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
    <div className="relative overflow-hidden transition-colors duration-300 bg-white dark:bg-[#050505] text-neutral-900 dark:text-[#E5E5E5] min-h-[calc(100vh-4rem)]">
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 md:py-16 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-neutral-100 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626] mb-4 opacity-0 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="w-3.5 h-3.5 text-neutral-650 dark:text-[#A3A3A3]" />
            <span className="text-[10px] font-bold font-mono tracking-widest text-neutral-600 dark:text-[#A3A3A3] uppercase">
              AI BUSINESS BRAIN SYSTEM FOR SME PIONEERS
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight mb-5 leading-tight text-neutral-900 dark:text-white opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Ubah Produk Biasa Jadi 
            <span className="block font-semibold mt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-cyan-400 to-blue-600 dark:from-emerald-300 dark:via-cyan-300 dark:to-blue-400 animate-gradient-shift">
              Penjualan Maksimal (MaxxSales)
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-500 dark:text-[#A3A3A3] mb-6 leading-relaxed font-sans max-w-2xl mx-auto opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            MaxxSales adalah <strong className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-700 dark:from-emerald-300 dark:to-blue-300 font-semibold">Sistem Operasi Pertumbuhan Bisnis</strong> berbasis AI yang mengubah data bisnis, intelijen pasar, dan wawasan kompetitor menjadi strategi, konten, dan tindakan yang mendorong pertumbuhan bisnis setiap hari.
          </p>



          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="cta-start-dashboard"
              onClick={onEnterDashboard}
              className="w-full sm:w-auto px-8 py-3.5 rounded-lg text-sm font-semibold transition-all shadow-sm text-white dark:text-black bg-neutral-950 hover:bg-neutral-850 dark:bg-[#E5E5E5] dark:hover:bg-white flex items-center justify-center space-x-2"
            >
              <span>Masuk ke Dashboard Bisnis Anda</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. DYNAMIC INTERACTIVE DASHBOARD ANIMATION PREVIEW */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-6">
            <span className="text-[9px] font-bold font-mono tracking-widest text-emerald-500 dark:text-emerald-450 uppercase block">
              ✦ INTUITIVE LIVE PREVIEW ✦
            </span>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
              Sekilas Cockpit Taktis Dashboard Jualan MaxxSales
            </h3>
            <p className="text-xs text-neutral-550 dark:text-[#8E8E8E] font-sans">
              Klik tab di bawah simulasi ini untuk melihat cuplikan layar antarmuka dashboard jualan Anda
            </p>
          </div>

          <div className="border border-neutral-250 dark:border-[#222222] bg-neutral-50/50 dark:bg-[#0c0c0c] rounded-2xl shadow-xl overflow-hidden">
            {/* Window Browser Chrome Header bar */}
            <div className="bg-neutral-100 dark:bg-[#121212] border-b border-neutral-250 dark:border-[#1E1E1E] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
              </div>
              <div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] rounded text-[10px] font-mono text-neutral-400 dark:text-[#737373] px-3 py-1 text-center w-64 truncate select-none">
                https://maxxsales.ai/dashboard/war-room
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[8px] font-mono text-neutral-400 dark:text-emerald-400 uppercase tracking-tighter">PREVIEW AKTIF</span>
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

          </div>
        </div>

        {/* 2 & 3. BENTO GRID OF 5 PILLARS */}
        <div className="mb-24">
          <div className="text-center mb-12">
            {/* Custom polished header replacing "MVP Core" */}
            <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
              5 Pilar Utama Taktis Jualan yang Mengubah Aturan Main Penjualan Anda
            </h2>
            <p className="text-xs font-mono text-neutral-400 dark:text-[#737373] uppercase tracking-wider mt-2 max-w-xl mx-auto">
              Sistem terpadu pembangun habit bersaing yang agresif dan ramah operasional Pengusaha lokal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            
            {/* Pilar 1: DNA Business Canvas */}
            <div className="group cursor-pointer md:col-span-3 rounded-xl p-6 border transition-all duration-300 ease-out bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-[0_0_12px_3px_rgba(52,211,153,0.25),0_0_40px_12px_rgba(52,211,153,0.12),0_0_80px_25px_rgba(52,211,153,0.06)] hover:border-emerald-400/50 dark:hover:border-emerald-400/70 flex flex-col justify-between">
              <div>
                <div className="neon-icon-emerald w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-800 dark:text-white mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/25 group-hover:border-emerald-400/60 dark:group-hover:border-emerald-400/80 group-hover:-rotate-6 group-hover:shadow-sm group-hover:shadow-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 transition-all duration-300 group-hover:text-emerald-400 dark:group-hover:text-emerald-200 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-200">Pilar 1: DNA Business Canvas (Fondasi)</h3>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] leading-relaxed mb-4">
                  Data dasar berisi identitas bisnis terdalam Anda mulai dari spesifikasi fisik produk, target segmentasi mikro, pola logistik, hingga preferensi media sosial sasaran. DNA ini yang melandasi keakuratan seluruh fitur pintar lainnya.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252] transition-all duration-300 group-hover:border-emerald-200/50 dark:group-hover:border-emerald-500/40">
                <span className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-500/70 dark:group-hover:text-emerald-300/80">Sekali Isi, Pakai Selamanya</span>
                <span className="text-neutral-900 dark:text-white font-semibold uppercase tracking-wider transition-all duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 dark:group-hover:drop-shadow-[0_0_6px_rgba(52,211,153,0.5)] group-hover:tracking-[0.15em]">DNA INTEGRASI</span>
              </div>
            </div>

            {/* Pilar 2: Competitor War Room */}
            <div className="group cursor-pointer md:col-span-3 rounded-xl p-6 border transition-all duration-300 ease-out bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 dark:hover:shadow-[0_0_12px_3px_rgba(248,113,113,0.25),0_0_40px_12px_rgba(248,113,113,0.12),0_0_80px_25px_rgba(248,113,113,0.06)] hover:border-red-400/50 dark:hover:border-red-400/70 flex flex-col justify-between">
              <div>
                <div className="neon-icon-red w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-850 dark:text-white mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-red-500/10 dark:group-hover:bg-red-500/25 group-hover:border-red-400/60 dark:group-hover:border-red-400/80 group-hover:shadow-sm group-hover:shadow-red-500/20">
                  <Target className="w-5 h-5 text-red-500 transition-all duration-300 group-hover:text-red-400 dark:group-hover:text-red-200 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-red-700 dark:group-hover:text-red-200">Pilar 2: Competitor War Room</h3>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] leading-relaxed mb-4">
                  Petakan kekuatan, kelemahan, peluang, dan ancaman (SWOT) dari kompetitor lokal terdekat maupun kelas berat. Bandingkan strategi keunggulan produk Anda langsung berdampingan (head-to-head) untuk mencari celah perang harga dan kemasan.
                </p>
              </div>
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252] transition-all duration-300 group-hover:border-red-200/50 dark:group-hover:border-red-500/40">
                <span className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-red-500/70 dark:group-hover:text-red-300/80">SWOT Manual & AI-Insights</span>
                <span className="text-neutral-900 dark:text-white font-semibold uppercase tracking-wider transition-all duration-300 group-hover:text-red-600 dark:group-hover:text-red-300 dark:group-hover:drop-shadow-[0_0_6px_rgba(248,113,113,0.5)] group-hover:tracking-[0.15em]">PERTANDINGAN PASAR</span>
              </div>
            </div>

            {/* Pilar 3: Customer Insight */}
            <div className="group cursor-pointer md:col-span-2 rounded-xl p-6 border transition-all duration-300 ease-out bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-[0_0_12px_3px_rgba(52,211,153,0.25),0_0_40px_12px_rgba(52,211,153,0.12),0_0_80px_25px_rgba(52,211,153,0.06)] hover:border-emerald-400/50 dark:hover:border-emerald-400/70 flex flex-col justify-between">
              <div>
                <div className="neon-icon-emerald w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-800 dark:text-white mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/25 group-hover:border-emerald-400/60 dark:group-hover:border-emerald-400/80 group-hover:shadow-sm group-hover:shadow-emerald-500/20">
                  <TrendingUp className="w-5 h-5 text-emerald-400 transition-all duration-300 group-hover:text-emerald-300 dark:group-hover:text-emerald-200 group-hover:scale-110" />
                </div>
                <h3 className="text-md font-semibold tracking-tight text-neutral-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-200">Pilar 3: Customer Insight & LTV</h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
                  Bagi pembeli Anda ke dalam 4 modul segmentasi psikografis yang akurat. Disertai kalkulator LTV (Lifetime Value) dan modul prediksi Churn Risk pelanggan agar Anda tahu kapan harus melancarkan promosi retensi khusus.
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252] transition-all duration-300 group-hover:border-emerald-200/50 dark:group-hover:border-emerald-500/40">
                <span className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-500/70 dark:group-hover:text-emerald-300/80">CRM & RETENTION GUARD</span>
              </div>
            </div>

            {/* Pilar 4: Strategy Fusion */}
            <div className="group cursor-pointer md:col-span-2 rounded-xl p-6 border transition-all duration-300 ease-out bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-[0_0_12px_3px_rgba(192,132,252,0.25),0_0_40px_12px_rgba(192,132,252,0.12),0_0_80px_25px_rgba(192,132,252,0.06)] hover:border-purple-400/50 dark:hover:border-purple-400/70 flex flex-col justify-between">
              <div>
                <div className="neon-icon-purple w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-800 dark:text-white mb-4 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-500/10 dark:group-hover:bg-purple-500/25 group-hover:border-purple-400/60 dark:group-hover:border-purple-400/80 group-hover:rotate-6 group-hover:shadow-sm group-hover:shadow-purple-500/20">
                  <Zap className="w-5 h-5 text-purple-400 transition-all duration-300 group-hover:text-purple-300 dark:group-hover:text-purple-200 group-hover:scale-110" />
                </div>
                <h3 className="text-md font-semibold tracking-tight text-neutral-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-purple-700 dark:group-hover:text-purple-200">Pilar 4: Strategy Fusion AI</h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
                  Gabungkan parameter dari seluruh DNA Anda untuk melahirkan 11 pilar rekomendasi strategi operasional konkret. Pilih tingkat optimisme bisnis Anda: Konservatif hemat modal, Moderat berhati-hati, atau Agresif penuh ekspansi.
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252] transition-all duration-300 group-hover:border-purple-200/50 dark:group-hover:border-purple-500/40">
                <span className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-500/70 dark:group-hover:text-purple-300/80">11 UNSUR STRATEGIS</span>
              </div>
            </div>

            {/* Pilar 5: Content Generator / Overlay */}
            <div className="group cursor-pointer md:col-span-2 rounded-xl p-6 border transition-all duration-300 ease-out bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 dark:hover:shadow-[0_0_12px_3px_rgba(34,211,238,0.25),0_0_40px_12px_rgba(34,211,238,0.12),0_0_80px_25px_rgba(34,211,238,0.06)] hover:border-cyan-400/50 dark:hover:border-cyan-400/70 flex flex-col justify-between">
              <div>
                <div className="neon-icon-cyan w-10 h-10 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-neutral-800 dark:text-white mb-4 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-cyan-500/10 dark:group-hover:bg-cyan-500/25 group-hover:border-cyan-400/60 dark:group-hover:border-cyan-400/80 group-hover:rotate-[360deg] group-hover:shadow-sm group-hover:shadow-cyan-500/20">
                  <Image className="w-5 h-5 text-cyan-400 transition-all duration-300 group-hover:text-cyan-300 dark:group-hover:text-cyan-200 group-hover:scale-110" />
                </div>
                <h3 className="text-md font-semibold tracking-tight text-neutral-900 dark:text-white mb-2 transition-colors duration-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-200">Pilar 5: Content Design Overlay</h3>
                <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] leading-relaxed">
                  Upload jepretan foto produk polos dari smartphone Anda, ketik nominal promo/CTA yang dimau, dan biarkan sistem merender 4 variasi visual overlay tangguh secara client-side gratis (Feed, Stories, katalog WA, disertai caption).
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-neutral-100 dark:border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono text-neutral-400 dark:text-[#525252] transition-all duration-300 group-hover:border-cyan-200/50 dark:group-hover:border-cyan-500/40">
                <span className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-500/70 dark:group-hover:text-cyan-300/80">OVERLAY BANNER INSTAN</span>
              </div>
            </div>

            {/* Secondary Highlight: Daily Sales Pulse */}
            <div className="group cursor-pointer md:col-span-6 rounded-xl p-6 border transition-all duration-300 ease-out bg-[#0F0F0F] border-[#262626] hover:border-emerald-400/60 dark:hover:shadow-[0_0_12px_3px_rgba(52,211,153,0.25),0_0_40px_12px_rgba(52,211,153,0.12),0_0_80px_25px_rgba(52,211,153,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2.5 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#262626] border border-neutral-800 text-[9px] font-mono text-[#A3A3A3] font-bold uppercase tracking-wider transition-all duration-300 group-hover:bg-emerald-500/25 group-hover:border-emerald-400/50 group-hover:text-emerald-200 group-hover:shadow-[0_0_8px_2px_rgba(52,211,153,0.15)]">DAILY HEARTBEAT CORE</span>
                  <h4 className="text-sm font-bold text-white uppercase tracking-tight transition-colors duration-300 group-hover:text-emerald-200">Kunci Konsistensi: Daily Sales Pulse Checklist</h4>
                </div>
                <p className="text-xs text-[#A3A3A3] leading-relaxed transition-colors duration-300 group-hover:text-neutral-100">
                  Awali pagi hari Anda dengan briefing performa pasar yang energik. Dapatkan checklist daftar aktivitas penjualan (action items) taktis harian terkomputerisasi. Cukup centang aktivitas yang selesai untuk melacak kemapanan pencapaian target omzet Anda.
                </p>
              </div>
              <button
                id="btn-pulse-preview-landing"
                onClick={onEnterDashboard}
                className="w-full md:w-auto px-5 py-2.5 rounded text-xs font-semibold bg-[#E5E5E5] text-black hover:bg-white flex items-center justify-center space-x-1.5 shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:bg-white group-hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.25)]"
              >
                <span>Buka Daily Pulse Anda</span>
                <ArrowRight className="w-3.5 h-3.5 transition-all duration-300 group-hover:translate-x-1" />
              </button>
            </div>

          </div>
        </div>

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

      </div>
    </div>
  );
}
