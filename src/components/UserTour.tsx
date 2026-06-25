import React from "react";
import { 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Target, 
  TrendingUp, 
  Zap, 
  Image, 
  Sparkles, 
  Compass, 
  Flame, 
  BookMarked,
  Info
} from "lucide-react";

interface UserTourProps {
  currentTab: "competitor" | "customer" | "strategy" | "content" | "pulse";
  setTab: (tab: "competitor" | "customer" | "strategy" | "content" | "pulse") => void;
}

interface TourStep {
  id: number;
  title: string;
  focusTab: "competitor" | "customer" | "strategy" | "content" | "pulse" | null;
  selector: string;
  conceptName: string;
  conceptDesc: string;
  learnMoreTerm: string;
  learnMoreDefinition: string;
  practicalTips: string;
  icon: React.ComponentType<any>;
  badgeColor: string;
}

export default function UserTour({ currentTab, setTab }: UserTourProps) {
  const [isActive, setIsActive] = React.useState<boolean>(() => {
    const hasDone = localStorage.getItem("maxx_sales_tour_done_v4");
    return !hasDone; // Auto-active on first load/login!
  });
  const [currentStepIdx, setCurrentStepIdx] = React.useState<number>(0);
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = React.useState<string | null>(null);

  // Focus & coordinate tracking state
  const [rect, setRect] = React.useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [position, setPosition] = React.useState<{ top: number; left: number; placement: "right" | "bottom" } | null>(null);

  const tourSteps: TourStep[] = [
    {
      id: 1,
      title: "Pilar 1: Daily Sales Pulse",
      focusTab: "pulse",
      selector: "#btn-dash-tab-pulse",
      conceptName: "Checklist Disiplin Harian & Streak",
      conceptDesc: "Penjualan yang hebat tidak lahir dalam semalam, melainkan dari konsistensi harian. Daily Sales Pulse menantang Anda menyelesaikan checklist taktis penjualan demi meningkatkan Level dan mengumpulkan poin XP usaha Anda.",
      learnMoreTerm: "Gamifikasi Penjualan",
      learnMoreDefinition: "Penerapan elemen permainan (seperti tantangan harian, level, poin XP, dan streak hari beruntun) ke dalam aktivitas bisnis agar operasional terasa menyenangkan dan memotivasi.",
      practicalTips: "Pastikan Anda mengklik Check-in di penanda Streak harian setiap hari untuk menjaga reputasi dan melipatgandakan poin XP bisnis Anda!",
      icon: Flame,
      badgeColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20"
    },
    {
      id: 2,
      title: "Pilar 2: DNA & Merek Aktif",
      focusTab: "competitor",
      selector: "#brand-overview-card",
      conceptName: "Fondasi Kampanye Penjualan",
      conceptDesc: "Sistem taktis MaxxSales berjalan sepenuhnya di atas data DNA Brand Canvas Anda. Nama merek, deskripsi produk, harga jual, keunikan, serta target wilayah Anda memengaruhi strategi promosi dan analisis AI lainnya secara nyata.",
      learnMoreTerm: "DNA Business Canvas",
      learnMoreDefinition: "Kerangka kerja modern pengganti business plan tradisional yang menyederhanakan rumusan bisnis ke dalam beberapa variabel inti yang bisa langsung dioperasikan untuk penyerangan penjualan.",
      practicalTips: "Klik tombol 'Sesuaikan DNA' di sidebar jika Anda mengubah produk atau harga jual Anda di kemudian hari agar taktik AI menyesuaikan.",
      icon: Compass,
      badgeColor: "bg-blue-500/10 text-blue-500 border border-blue-500/20"
    },
    {
      id: 3,
      title: "Pilar 3: Competitor War Room",
      focusTab: "competitor",
      selector: "#btn-dash-tab-competitor",
      conceptName: "Intelijen Pesaing (SWOT)",
      conceptDesc: "Kunci memenangkan pasar lokal adalah memahami peta kekuatan (SWOT) kompetitor Anda. Fitur Spider-Web Radar membantu Anda menyimulasikan skor harga, kualitas, kekuatan medsos, dan layanan Anda dibandingkan pesaing terdekat.",
      learnMoreTerm: "Analisis SWOT",
      learnMoreDefinition: "Metode evaluasi strategis terdiri dari Strengths (Kekuatan diri), Weaknesses (Kelemahan diri), Opportunities (Peluang eksternal yang bisa diambil), dan Threats (Ancaman dari kompetitor/lingkungan luar).",
      practicalTips: "Gunakan sliders interaktif pada Spider-Web Radar untuk mengevaluasi parameter mana yang perlu Anda tingkatkan agar mengalahkan pesaing Anda.",
      icon: Target,
      badgeColor: "bg-red-500/10 text-red-500 border border-red-500/20"
    },
    {
      id: 4,
      title: "Pilar 4: Customer Insight",
      focusTab: "customer",
      selector: "#btn-dash-tab-customer",
      conceptName: "Profil Pembeli Ideal & LTV",
      conceptDesc: "Memetakan karakter spesifik segmen pembeli lokal Anda membantu meminimalisasi biaya iklan yang terbuang sia-sia. LTV membantu mengukur seberapa setia loyalitas mereka membeli produk Anda.",
      learnMoreTerm: "LTV (Customer Lifetime Value)",
      learnMoreDefinition: "Total estimasi nilai ekonomi (rupiah) yang akan dibelanjakan oleh seorang pelanggan tunggal selama mereka tetap setia berlangganan atau membeli produk Anda.",
      practicalTips: "Lihat diagram perilaku konsumen Anda untuk mengetahui jam tersibuk mereka berbelanja dan saluran komunikasi favorit mereka.",
      icon: TrendingUp,
      badgeColor: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
    },
    {
      id: 5,
      title: "Pilar 5: Strategy Fusion",
      focusTab: "strategy",
      selector: "#btn-dash-tab-strategy",
      conceptName: "Kolaborasi Strategi Terpadu",
      conceptDesc: "Menerjemahkan data menjadi aksi taktis instan. Fitur ini otomatis menyatukan DNA produk Anda dengan peta kompetitor untuk melahirkan rekomendasi di 11 area strategis digital marketing.",
      learnMoreTerm: "Strategy Fusion AI",
      learnMoreDefinition: "Sistem sintesis logika bisnis yang mengawinkan unique value proposition produk dengan kelemahan kompetitor, menghasilkan draf taktik yang siap dijalankan.",
      practicalTips: "Salin draf gimmick promo yang ditawarkan di area Strategy Fusion dan jadikan bahan bakar utama untuk membuat konten visual.",
      icon: Zap,
      badgeColor: "bg-purple-500/10 text-purple-500 border border-purple-500/20"
    },
    {
      id: 6,
      title: "Pilar 6: Content Generator",
      focusTab: "content",
      selector: "#btn-dash-tab-content",
      conceptName: "Alat Desain Konten Mandiri",
      conceptDesc: "Ubah tulisan manis promosi menjadi gambar siap sebar. Di sini Anda bisa mengunggah foto produk asli Anda, memadukannya dengan kutipan promosi, logo, atau dekorasi warna modern, lalu langsung mendownloadnya.",
      learnMoreTerm: "Visual Call to Action",
      learnMoreDefinition: "Elemen tulisan dalam gambar promosi yang mengundang mata calon pembeli untuk segera melakukan tindakan, seperti mengklik link, mengirim WhatsApp, atau membeli.",
      practicalTips: "Upload foto produk dengan pencahayaan terang dan gunakan kontras frame gelap agar tulisan promosi Anda terlihat jelas saat dibagikan.",
      icon: Image,
      badgeColor: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
    },
    {
      id: 7,
      title: "Tujuan Akhir: Streak & Kontrol",
      focusTab: null,
      selector: "#daily-streak-sidebar-card",
      conceptName: "Habit Penjualan & Chatbot Pendukung",
      conceptDesc: "Akhirnya, semua rekap kemudahan ada di Sidebar Kanan. Anda bisa merevisi DNA merek Anda kapan pun, memantau level kelulusan tantangan harian (Daily Streak Counter) secara langsung, melirik kamus cepat, serta mengobrol gratis dengan Asisten AI di bagian kanan bawah.",
      learnMoreTerm: "Sidebar Control Hub",
      learnMoreDefinition: "Pusat aktivitas sekunder untuk mengawasi status keaktifan jualan harian secara mandiri agar tetap produktif.",
      practicalTips: "Gunakan kamus kosa kata cepat yang tertempel di sidebar untuk mencerna definisi istilah asing secara kilat tanpa keluar halaman.",
      icon: BookMarked,
      badgeColor: "bg-teal-500/10 text-teal-500 border border-teal-500/20"
    }
  ];

  // Auto route dashboard tab when stepping through the tour
  React.useEffect(() => {
    if (isActive) {
      const step = tourSteps[currentStepIdx];
      if (step && step.focusTab) {
        setTab(step.focusTab);
      }
    }
  }, [currentStepIdx, isActive]);

  // Handle absolute viewport-relative layout tracing for tooltips
  React.useEffect(() => {
    if (!isActive) {
      setRect(null);
      setPosition(null);
      return;
    }

    const currentStep = tourSteps[currentStepIdx];
    if (!currentStep) return;

    const updatePosition = () => {
      const el = document.querySelector(currentStep.selector);
      if (el) {
        const r = el.getBoundingClientRect();
        
        // Save the raw rectangle to render the pulsing glow border
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height
        });

        // Compute responsive float placement
        const isDesktop = window.innerWidth >= 1024;
        if (isDesktop) {
          // Placed to the right of the highlighted widget
          setPosition({
            top: Math.max(8, r.top + (r.height / 2) - 150),
            left: r.left + r.width + 16,
            placement: "right"
          });
        } else {
          // Placed below the highlighted widget
          setPosition({
            top: r.top + r.height + 16,
            left: Math.max(8, Math.min(window.innerWidth - 328, r.left + (r.width / 2) - 160)),
            placement: "bottom"
          });
        }

        // Auto scrolling support
        const inView = r.top >= 60 && r.bottom <= window.innerHeight - 60;
        if (!inView) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else {
        setRect(null);
        setPosition(null);
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition, { passive: true });

    const pollTimer = setInterval(updatePosition, 300);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      clearInterval(pollTimer);
    };
  }, [isActive, currentStepIdx, currentTab]);

  // Active Tab inline hints (original requested live explanations below the buttons list)
  const activeTabDetails = React.useMemo(() => {
    switch(currentTab) {
      case "competitor":
        return {
          title: "Competitor War Room",
          badge: "⚔️ INTEL SWOT & RADAR",
          classColor: "border-red-500/20 bg-red-500/[0.02] text-red-600 dark:text-red-400",
          desc: "Analisis bersilang SWOT dari kompetitor sekitar Anda. Fitur Spider-Web Radar membantu melihat skor harga vs kualitas di area Anda secara presisi.",
          term: "SWOT & Radar Spider-Web",
          definition: "SWOT merinci kekuatan (Strengths) & kelemahan (Weaknesses) Anda dibenturkan dengan ancaman kompetitor. Radar visual memudahkan penentuan harga jual ideal.",
          tip: "Amati SWOT Kompetitor lalu sesuaikan strategi promosi di 'Strategy Fusion' untuk menyerang kelemahan mereka."
        };
      case "customer":
        return {
          title: "Customer Insight Profile",
          badge: "👥 PERSPECTIVE & LTV",
          classColor: "border-emerald-500/20 bg-emerald-500/[0.02] text-emerald-600 dark:text-emerald-400",
          desc: "Identifikasi segmen pembeli lokal terbaik, jam tersibuk mereka bertransaksi, dan diagram kecenderungan belanja.",
          term: "Customer Lifetime Value (LTV)",
          definition: "Estimasi total profit bersih dari satu pelanggan setia selama mereka terus terpikat membeli produk/jasa Anda.",
          tip: "Prediksi frekuensi belanja di kartu LTV untuk menyusun paket kupon hemat berkala."
        };
      case "strategy":
        return {
          title: "Strategy Fusion Hub",
          badge: "⚡ 11 OFFENSIVE CHANNELS",
          classColor: "border-purple-500/20 bg-purple-500/[0.02] text-purple-600 dark:text-purple-400",
          desc: "Sistem kawal serbu pemasaran yang mensintesis DNA keunikan produk Anda dengan celah kelemahan operasional pesaing.",
          term: "Strategy Fusion System",
          definition: "Metode pemetaan otomatis yang membagi taktik pemasaran Pengusaha ke dalam 11 ruang lingkup digital modern gratisan.",
          tip: "Salin draft gimmick penawaran dari sini dan jadikan tulisan utama promosi Anda di tab Content Creator."
        };
      case "content":
        return {
          title: "Creative Content Generator",
          badge: "🎨 FRAMING & PROMO DESIGN",
          classColor: "border-cyan-500/20 bg-cyan-500/[0.02] text-cyan-600 dark:text-cyan-400",
          desc: "Alat visualisasi iklan mandiri. Gabungkan jepretan foto produk fisik Anda dengan penawaran bombastis siap didownload.",
          term: "Visual Call to Action (CTA)",
          definition: "Tulisan penarik perhatian di dalam poster gambar yang membimbing psikologis pembeli untuk segera memencet tombol WhatsApp.",
          tip: "Gunakan foto beresolusi tajam & atur ketebalan frame latar belakang gelap agar tulisan berwarna neon terbaca jelas."
        };
      case "pulse":
        return {
          title: "Daily Sales Pulse Action",
          badge: "🔥 GAMIFICATION STREAK",
          classColor: "border-amber-500/20 bg-amber-500/[0.02] text-amber-600 dark:text-amber-400",
          desc: "Kawal kerutinan harian operasional penjualan, mulai dari follow-up chat, upload postingan hingga evaluasi laporan keuangan.",
          term: "Consistency Gamification",
          definition: "Teknik membentuk kebiasaan menjual yang sukses dengan memicu dopamin harian via XP, check-in harian, dan petualangan level kuantitas.",
          tip: "Selesaikan 3 dari 5 agenda setiap hari agar api streak penjualan Anda terus membara tanpa padam!"
        };
      default:
        return null;
    }
  }, [currentTab]);

  const handleNext = () => {
    if (currentStepIdx < tourSteps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      setIsActive(false);
      localStorage.setItem("maxx_sales_tour_done_v4", "true");
      alert("🎉 Hebat! Anda telah menyelesaikan seluruh Tour Edukasi Bisnis MaxxSales. Strategi jualan Anda kini bersiap lepas landas!");
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleStartTour = () => {
    setCurrentStepIdx(0);
    setIsActive(true);
  };

  const currentStep = tourSteps[currentStepIdx];
  const IconComponent = currentStep?.icon;

  const glossaryTerms = [
    { term: "SWOT Analysis", def: "Metode evaluasi kekuatan (Strengths), kelemahan (Weaknesses), peluang (Opportunities), dan ancaman (Threats) dalam bisnis Anda." },
    { term: "LTV (Lifetime Value)", def: "Total estimasi keuntungan bersih atau transaksi finansial yang diperoleh dari satu pelanggan seumur hidupnya bertransaksi dengan Anda." },
    { term: "Unique Value Prop", def: "Alasan utama mengapa calon pembeli harus memilih produk Anda dibanding semua pesaing lainnya di pasar." },
    { term: "Strategy Fusion", def: "Penyatuan otomatis antara nilai keunggulan produk Anda dengan data pesaing untuk meramu rencana pemasaran baru." },
    { term: "Gamifikasi Bisnis", def: "Menggunakan elemen interaktif game (skor, streak, XP, check-in harian) untuk meningkatkan kedisiplinan jualan harian." },
    { term: "Cohort Demografi", def: "Pengelompokan target calon pembeli berdasarkan umur, kegemaran, lokasi geografis, dan daya beli mereka." }
  ];

  return (
    <div className="space-y-3.5">
      
      {/* 1. Contextual Educational Guide exactly matching the active main feature tab */}
      {activeTabDetails && (
        <div className={`p-4 rounded border text-left space-y-2.5 transition-all duration-300 shadow-xs ${activeTabDetails.classColor}`}>
          <div className="flex items-center justify-between">
            <span className="text-[8.5px] font-bold font-mono tracking-wider uppercase opacity-80">
              {activeTabDetails.badge}
            </span>
            <div className="flex items-center space-x-1 text-[9px] font-mono font-bold bg-neutral-900/10 dark:bg-white/10 px-1.5 py-0.5 rounded leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE PANDUAN</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {activeTabDetails.title}
            </h4>
            <p className="text-[10px] text-neutral-500 dark:text-[#A3A3A3] font-sans leading-relaxed mt-1">
              {activeTabDetails.desc}
            </p>
          </div>

          <div className="p-2.5 rounded bg-white dark:bg-[#0A0A0A] border border-neutral-200/50 dark:border-[#202020] space-y-1">
            <span className="text-[8.5px] font-bold font-mono text-emerald-500 tracking-wider block uppercase">
              💡 ISTILAH: {activeTabDetails.term.toUpperCase()}
            </span>
            <p className="text-[9.5px] text-neutral-600 dark:text-[#8E8E8E] leading-relaxed font-mono">
              {activeTabDetails.definition}
            </p>
          </div>

          <div className="text-[9.5px] text-neutral-550 dark:text-[#919191] font-sans bg-neutral-900/[0.02] dark:bg-white/[0.02] p-2 rounded">
            <strong>Tips Aksi:</strong> {activeTabDetails.tip}
          </div>
        </div>
      )}

      {/* 2. Tour Launcher & Integrated Quick Glossary Card */}
      <div className="p-4 rounded border bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-[#111111] dark:to-[#161616] border-neutral-200 dark:border-[#262626] space-y-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <BookMarked className="w-4 h-4 text-emerald-500 shrink-0" />
          <h4 className="text-xs font-bold font-mono text-neutral-800 dark:text-neutral-200 tracking-wide">PANDUAN & ISTILAH</h4>
        </div>
        <p className="text-[10px] text-neutral-500 dark:text-[#A3A3A3] font-sans leading-relaxed">
          Ingin tour langkah demi langkah di seluruh 5 menu utama secara berurutan? Klik di bawah ini:
        </p>

        <button
          id="btn-start-user-tour"
          onClick={handleStartTour}
          className="w-full py-1.5 rounded text-[10px] font-mono font-bold bg-neutral-900 hover:bg-neutral-800 dark:bg-[#E5E5E5] dark:hover:bg-white text-white dark:text-black flex items-center justify-center space-x-1 transition-colors shadow-sm"
        >
          <span>💡 Jalankan Tour Interaktif</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Quick glossary lookups */}
        <div className="pt-2.5 border-t border-neutral-200 dark:border-[#1E1E1E] space-y-1">
          <span className="text-[8px] font-mono text-neutral-400 dark:text-[#737373] uppercase tracking-wide block">Kamus Istilah Cepat:</span>
          <div className="flex flex-wrap gap-1">
            {glossaryTerms.map((item) => (
              <button
                key={item.term}
                id={`btn-glossary-quick-${item.term.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedGlossaryTerm(selectedGlossaryTerm === item.term ? null : item.term)}
                className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                  selectedGlossaryTerm === item.term
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold"
                    : "bg-white dark:bg-[#181818] border-neutral-200 dark:border-[#2B2B2B] text-neutral-600 dark:text-[#A3A3A3] hover:bg-neutral-100"
                }`}
              >
                {item.term}
              </button>
            ))}
          </div>
          
          {selectedGlossaryTerm && (
            <div className="mt-1.5 p-2 bg-neutral-50 dark:bg-[#080808] border border-neutral-200 dark:border-[#202020] rounded text-[9.5px] font-mono text-neutral-500 dark:text-[#9F9F9F] leading-relaxed transition-all animate-fade-in relative">
              <button 
                onClick={() => setSelectedGlossaryTerm(null)} 
                className="absolute right-1 top-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
              <strong className="text-neutral-800 dark:text-neutral-200 block mb-0.5 text-[10px]">{selectedGlossaryTerm}:</strong>
              {glossaryTerms.find(g => g.term === selectedGlossaryTerm)?.def}
            </div>
          )}
        </div>
      </div>

      {/* Dimmed backdrop to avoid unwanted browser click conflicts during the live guide */}
      {isActive && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-49 pointer-events-auto" />
      )}

      {/* Dynamic highlighting outline wrapper */}
      {isActive && rect && (
        <div 
          className="fixed border-[3px] border-emerald-500 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.7)] z-50 pointer-events-none transition-all duration-300 animate-pulse"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12
          }}
        />
      )}

      {/* Dynamic positioning balloon tooltip */}
      {isActive && position && currentStep && (
        <div 
          id="user-tour-dialog-panel"
          className="fixed z-50 w-[300px] sm:w-[320px] bg-white dark:bg-[#0D0D0D] border border-neutral-200 dark:border-[#262626] rounded-lg shadow-2xl p-5 text-left transition-all duration-300 animate-scale-up"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {/* Pointing arrows based on responsive placement */}
          {position.placement === "right" && (
            <div className="hidden lg:block absolute left-[-8px] top-[40px] w-4 h-4 bg-white dark:bg-[#0D0D0D] border-l border-t border-neutral-200/80 dark:border-[#262626] rotate-[-45deg] z-10" />
          )}
          {position.placement === "bottom" && (
            <div className="absolute top-[-8px] left-[50%] translate-x-[-50%] w-4 h-4 bg-white dark:bg-[#0D0D0D] border-l border-t border-neutral-200/80 dark:border-[#262626] rotate-45 z-10" />
          )}

          {/* Close button inside tooltip */}
          <button
            id="btn-close-tour"
            onClick={() => {
              if (confirm("Apakah anda ingin keluar dari panduan praktis ini?")) {
                setIsActive(false);
                localStorage.setItem("maxx_sales_tour_done_v4", "true");
              }
            }}
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] transition-colors"
            aria-label="Tutup Tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Step indicator */}
          <div className="mb-2">
            <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full ${currentStep.badgeColor}`}>
              LANGKAH {currentStep.id} DARI {tourSteps.length}
            </span>
          </div>

          {/* Icon & Title */}
          <div className="flex items-start space-x-2.5 mb-2.5">
            <div className="p-1.5 rounded bg-neutral-100 dark:bg-[#181818] border border-neutral-200/60 dark:border-[#262626] text-neutral-900 dark:text-white shrink-0">
              {IconComponent && <IconComponent className="w-4 h-4 text-emerald-500" />}
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                {currentStep.title}
              </h3>
              <p className="text-[10px] text-neutral-500 dark:text-emerald-400 font-mono mt-0.5 leading-none">
                Konsep: {currentStep.conceptName}
              </p>
            </div>
          </div>

          {/* Body content */}
          <p className="text-[11px] text-neutral-600 dark:text-[#C2C2C2] leading-relaxed mb-3">
            {currentStep.conceptDesc}
          </p>

          {/* Technology terminology lookups inside tooltip */}
          <div className="p-2.5 rounded border bg-emerald-500/[0.03] border-emerald-500/10 mb-2.5 space-y-0.5">
            <span className="text-[8px] font-bold font-mono text-emerald-500 tracking-wider block uppercase">
              📖 REKAP ISTILAH: {currentStep.learnMoreTerm}
            </span>
            <p className="text-[10px] text-neutral-500 dark:text-[#A3A3A3] leading-normal font-sans">
              {currentStep.learnMoreDefinition}
            </p>
          </div>

          {/* Practical action items */}
          <div className="p-2.5 rounded border bg-blue-500/[0.02] border-blue-500/10 mb-3.5 space-y-0.5">
            <span className="text-[8px] font-bold font-mono text-blue-500 tracking-wider block uppercase">
              💡 LANGKAH OPERASIONAL / TIPS
            </span>
            <p className="text-[10px] text-neutral-500 dark:text-[#A3A3A3] leading-normal font-sans">
              {currentStep.practicalTips}
            </p>
          </div>

          {/* Interactive footer action buttons */}
          <div className="flex items-center justify-between border-t border-neutral-100 dark:border-[#202020] pt-3">
            <button
              id="btn-skip-tour"
              onClick={() => {
                setIsActive(false);
                localStorage.setItem("maxx_sales_tour_done_v4", "true");
              }}
              className="text-[9.5px] font-mono text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors"
            >
              Skip
            </button>

            <div className="flex space-x-1.5">
              <button
                id="btn-prev-tour-step"
                disabled={currentStepIdx === 0}
                onClick={handlePrev}
                className="px-2 py-1 rounded border border-neutral-250 dark:border-[#262626] text-[9.5px] font-mono hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-0.5 text-neutral-700 dark:text-neutral-300"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Sebelumnya</span>
              </button>

              <button
                id="btn-next-tour-step"
                onClick={handleNext}
                className="px-2.5 py-1 rounded bg-neutral-950 dark:bg-white text-white dark:text-black font-bold text-[9.5px] font-mono hover:bg-neutral-850 dark:hover:bg-neutral-100 flex items-center space-x-0.5 transition-colors shadow-sm"
              >
                <span>{currentStepIdx === tourSteps.length - 1 ? "Selesai" : "Lanjut"}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
