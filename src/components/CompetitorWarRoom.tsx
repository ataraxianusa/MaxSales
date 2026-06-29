import React from "react";
import { CompetitorIntel, BusinessCanvasData, defaultCompetitors } from "../types";
import { API_BASE } from "../api";
import { Shield, ShieldAlert, Target, Zap, Plus, Award, AlertTriangle, Cpu, Loader2 } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CompetitorWarRoomProps {
  dna: BusinessCanvasData;
  competitors: CompetitorIntel[];
  setCompetitors: (list: CompetitorIntel[]) => void;
}

export default function CompetitorWarRoom({ dna, competitors, setCompetitors }: CompetitorWarRoomProps) {
  // Manual states
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [averagePrice, setAveragePrice] = React.useState("");
  const [activeChannels, setActiveChannels] = React.useState<string[]>([]);
  const [estimatedRevenue, setEstimatedRevenue] = React.useState("10-50jt");
  const [instagramUsername, setInstagramUsername] = React.useState("");
  const [facebookUrl, setFacebookUrl] = React.useState("");
  
  // SWOT detail triggers
  const [strengths, setStrengths] = React.useState("");
  const [weaknesses, setWeaknesses] = React.useState("");
  const [opportunities, setOpportunities] = React.useState("");
  const [threats, setThreats] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [scrapeStatus, setScrapeStatus] = React.useState<string | null>(null);
  const [activeIntelCompetitor, setActiveIntelCompetitor] = React.useState<CompetitorIntel | null>(
    competitors[0] || null
  );

  // Radar scores states for brand and competitors comparison
  const [ratings, setRatings] = React.useState<Record<string, {
    price: number;
    quality: number;
    marketing: number;
    service: number;
    unique: number;
  }>>({
    brand: { price: 8, quality: 9, marketing: 6, service: 7, unique: 8 },
    "comp-1": { price: 9, quality: 6, marketing: 4, service: 5, unique: 4 },
    "comp-2": { price: 5, quality: 9, marketing: 10, service: 8, unique: 9 },
  });

  const toggleChannel = (ch: string) => {
    if (activeChannels.includes(ch)) {
      setActiveChannels(activeChannels.filter(x => x !== ch));
    } else {
      setActiveChannels([...activeChannels, ch]);
    }
  };

  const handleAISWOTAnalysis = async () => {
    if (!name.trim()) {
      alert("Harap masukkan nama kompetitor!");
      return;
    }
    setLoading(true);
    setScrapeStatus(null);
    try {
      // Call AI analysis, web scraping, Instagram scrape, AND Facebook scrape in parallel
      const fbUrl = facebookUrl.trim()
        ? (facebookUrl.startsWith("http") ? facebookUrl : `https://facebook.com/${facebookUrl.replace("facebook.com/", "")}`)
        : "";

      const [analysisRes, scrapeRes, igRes, fbRes] = await Promise.all([
        fetch(`${API_BASE}/api/analyze-competitor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ competitorName: name, location, averagePrice, activeChannels, dna })
        }),
        fetch(`${API_BASE}/api/scrape-competitor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ competitorName: name, location })
        }),
        instagramUsername.trim()
          ? fetch(`${API_BASE}/api/instagram-scrape`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username: instagramUsername.replace("@", "") })
            })
          : Promise.resolve(null),
        fbUrl
          ? fetch(`${API_BASE}/api/facebook-scrape`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: fbUrl })
            })
          : Promise.resolve(null)
      ]);

      const analysisData = await analysisRes.json();
      const scrapeData = await scrapeRes.json();

      // Safe JSON parse — network timeout or proxy errors can return non-JSON
      let igData: any = null;
      let fbData: any = null;
      try { igData = igRes ? await igRes.json() : null; } catch { igData = { mode: "parse-error" }; }
      try { fbData = fbRes ? await fbRes.json() : null; } catch { fbData = { mode: "parse-error" }; }

      console.log("[SWOT] API Results:", { analysisData, scrapeData, igData, fbData });

      // Surface Apify result status to user
      const statusParts: string[] = [];
      if (igData) {
        if (igData.mode === "apify") statusParts.push(`✅ IG: ${igData.followers?.toLocaleString()} followers`);
        else if (igData.mode === "no-token") statusParts.push("⚠️ IG: Token Apify belum dikonfigurasi");
        else if (igData.mode === "empty") statusParts.push("⚠️ IG: Profil tidak ditemukan");
        else if (igData.mode === "error" || igData.mode === "parse-error") statusParts.push(`❌ IG: ${igData.error || "Scraping gagal"}`);
      }
      if (fbData) {
        if (fbData.mode === "apify") statusParts.push(`✅ FB: ${fbData.likes?.toLocaleString()} likes`);
        else if (fbData.mode === "no-token") statusParts.push("⚠️ FB: Token Apify belum dikonfigurasi");
        else if (fbData.mode === "empty") statusParts.push("⚠️ FB: Halaman tidak ditemukan");
        else if (fbData.mode === "error" || fbData.mode === "parse-error") statusParts.push(`❌ FB: ${fbData.error || "Scraping gagal"}`);
      }
      if (statusParts.length > 0) setScrapeStatus(statusParts.join(" · "));

      // Merge all data sources
      const webInfo = scrapeData.socialLinks?.length
        ? `\n\nData Online: ${scrapeData.socialLinks.join(", ")}`
        : "";

      const igInfo = igData?.mode === "apify"
        ? `\n\nInstagram: ${igData.followers?.toLocaleString()} followers, ${igData.posts} posts, Engagement: ${igData.recentPosts?.length ? Math.round(igData.recentPosts.reduce((a: number, p: any) => a + (p.likes || 0), 0) / igData.recentPosts.length / Math.max(igData.followers || 1, 1) * 100) : 0}%`
        : "";

      const fbInfo = fbData?.mode === "apify"
        ? `\n\nFacebook: ${fbData.likes?.toLocaleString()} likes, ${fbData.followers?.toLocaleString()} followers, Rating: ${fbData.rating}/5 (${fbData.reviewCount} reviews)`
        : "";

      const newId = `comp-${Date.now()}`;
      const newCompetitor: CompetitorIntel = {
        id: newId,
        name: igData?.fullName || fbData?.name || name,
        location: location || scrapeData.searchResults?.[0]?.snippet?.slice(0, 50) || fbData?.address || "Kota Terdekat",
        averagePrice: averagePrice || "Rp 200.000 - Rp 350.000",
        activeChannels: activeChannels.length > 0 ? activeChannels : ["Instagram"],
        strengths: (analysisData.strengths || "Memiliki modal fisik kuat.") + webInfo + igInfo + fbInfo,
        weaknesses: analysisData.weaknesses || "Kemasan pengiriman belum diuji.",
        opportunities: analysisData.opportunities || "Tawarkan kemasan box mewah kustom Anda.",
        threats: analysisData.threats || "Banting harga eceran.",
        estimatedRevenue: igData?.followers
          ? `${Math.round(igData.followers / 1000)}jt followers IG`
          : fbData?.followers
          ? `${Math.round(fbData.followers / 1000)}jt followers FB`
          : analysisData.estimatedRevenue || "10-50jt"
      };

      console.log("[SWOT] New competitor:", newCompetitor);

      const updated = [newCompetitor, ...competitors];
      setCompetitors(updated);
      setActiveIntelCompetitor(newCompetitor);
      setRatings(prev => ({ ...prev, [newId]: { price: 7, quality: 6, marketing: 5, service: 6, unique: 5 } }));
      
      // Reset forms
      setName("");
      setLocation("");
      setAveragePrice("");
      setActiveChannels([]);
      setInstagramUsername("");
      setFacebookUrl("");
      setStrengths("");
      setWeaknesses("");
      setOpportunities("");
      setThreats("");
    } catch (err) {
      console.error("[SWOT] Error:", err);
      setScrapeStatus(`❌ Error: ${err}`);
      alert(`Gagal analisis: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const addManualCompetitor = () => {
    if (!name.trim() || !strengths.trim() || !weaknesses.trim()) {
      alert("Harap isi Nama, Kekuatan, dan Kelemahan kompetitor secara lengkap!");
      return;
    }

    const newId = `comp-${Date.now()}`;
    const newCompetitor: CompetitorIntel = {
      id: newId,
      name,
      location: location || "Lokasi Kompetitor",
      averagePrice: averagePrice || "Rp 300.000",
      activeChannels: activeChannels.length > 0 ? activeChannels : ["Instagram"],
      strengths,
      weaknesses,
      opportunities: opportunities || "Tawarkan kemasan kustom atau gratis garansi tukar ukuran.",
      threats: threats || "Perkelahian harga eceran produk.",
      estimatedRevenue
    };

    const updated = [newCompetitor, ...competitors];
    setCompetitors(updated);
    setActiveIntelCompetitor(newCompetitor);
    setRatings(prev => ({ ...prev, [newId]: { price: 7, quality: 6, marketing: 5, service: 6, unique: 5 } }));

    // Reset
    setName("");
    setLocation("");
    setAveragePrice("");
    setActiveChannels([]);
    setStrengths("");
    setWeaknesses("");
    setOpportunities("");
    setThreats("");
  };

  const deleteCompetitor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = competitors.filter(x => x.id !== id);
    setCompetitors(updated);
    if (activeIntelCompetitor?.id === id) {
      setActiveIntelCompetitor(updated[0] || null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction bar */}
      <div className="border-b pb-4 border-neutral-200 dark:border-[#262626]">
        <h2 className="text-xl font-light tracking-tight flex items-center space-x-2 text-neutral-900 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-[#E5E5E5]"></span>
          <span>Competitor War Room</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
          Ulas peta taktik pertempuran pasar lokal. Identifikasi kelemahan krusial bungkus kompetitor untuk beralih mengambil alih basis pelanggan mereka.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Add competitor & list */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Form Create */}
          <div className="p-5 bg-white dark:bg-[#111111] border rounded border-neutral-200 dark:border-[#262626] space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-850 dark:text-white flex items-center space-x-1 uppercase">
              <Plus className="w-3.5 h-3.5" />
              <span>Daftarkan Kompetitor</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono block font-semibold text-neutral-450 dark:text-[#737373] mb-1">Nama Toko Kompetitor *</label>
                <input
                  id="inp-comp-name"
                  type="text"
                  placeholder="misal: Zahra Grosir Store"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-[#E5E5E5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono block font-semibold text-neutral-450 dark:text-[#737373] mb-1">Lokasi Toko</label>
                  <input
                    id="inp-comp-location"
                    type="text"
                    placeholder="misal: Pasar Atom"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-[#E5E5E5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono block font-semibold text-neutral-450 dark:text-[#737373] mb-1">Harga Rata-rata</label>
                  <input
                    id="inp-comp-avgPrice"
                    type="text"
                    placeholder="misal: 250rb"
                    value={averagePrice}
                    onChange={e => setAveragePrice(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-[#E5E5E5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono block font-semibold text-neutral-450 dark:text-[#737373] mb-1">Kanal yang Mereka Ambil</label>
                <div className="flex flex-wrap gap-1">
                  {["Instagram", "TikTok Shop", "Shopee", "Toko Fisik", "WhatsApp"].map(ch => {
                    const isSelected = activeChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all border ${
                          isSelected
                            ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-bold"
                            : "bg-transparent border-neutral-200 dark:border-[#262626] text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-600"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Social Media Inputs */}
              <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30">
                <p className="text-[9px] font-mono text-blue-600 dark:text-blue-400 mb-2">
                  📊 Isi minimal salah satu untuk data lebih akurat. Kosongkan jika tidak diketahui.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono block font-semibold text-neutral-450 dark:text-[#737373] mb-1">Instagram ID</label>
                    <input
                      id="inp-comp-instagram"
                      type="text"
                      placeholder="misal: yuwprojects"
                      value={instagramUsername}
                      onChange={e => setInstagramUsername(e.target.value.replace("@", ""))}
                      className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-[#E5E5E5] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono block font-semibold text-neutral-450 dark:text-[#737373] mb-1">Facebook Page URL</label>
                    <input
                      id="inp-comp-facebook"
                      type="text"
                      placeholder="misal: facebook.com/zahra.store"
                      value={facebookUrl}
                      onChange={e => setFacebookUrl(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-[#E5E5E5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Manual SWOT vs AI instant generation */}
              <div className="pt-2 border-t border-neutral-100 dark:border-[#262626] space-y-2">
                <button
                  id="btn-intel-ai"
                  type="button"
                  disabled={loading}
                  onClick={handleAISWOTAnalysis}
                  className="w-full py-2 rounded text-xs font-semibold bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black hover:bg-neutral-900 dark:hover:bg-white flex items-center justify-center space-x-1.5 px-3 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
                  <span>{loading ? "Menganalisis & scraping..." : "Generate SWOT dengan AI"}</span>
                </button>

                {/* Apify scrape result status */}
                {scrapeStatus && (
                  <p className="text-[9px] font-mono leading-relaxed text-neutral-500 dark:text-[#737373] bg-neutral-50 dark:bg-[#1A1A1A] rounded px-2 py-1.5 border border-neutral-200 dark:border-[#262626]">
                    {scrapeStatus}
                  </p>
                )}

                <p className="text-[9px] font-mono text-center text-neutral-400">Atau ketik manual di bawah ini:</p>

                <div className="space-y-1.5">
                  <input
                    id="inp-comp-strength"
                    type="text"
                    placeholder="Kekuatan utama mereka..."
                    value={strengths}
                    onChange={e => setStrengths(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                  />
                  <input
                    id="inp-comp-weakness"
                    type="text"
                    placeholder="Kelemahan terbesar mereka..."
                    value={weaknesses}
                    onChange={e => setWeaknesses(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                  />
                  <button
                    id="btn-add-manual-competitor"
                    onClick={addManualCompetitor}
                    className="w-full py-2 border border-neutral-350 dark:border-[#262626] text-xs font-mono rounded hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] text-neutral-700 dark:text-[#A3A3A3]"
                  >
                    Tambah Kompetitor Manual
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* List of Registered Competitors */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase tracking-widest px-1">Terdaftar Di Database</span>
            <div className="space-y-1.55">
              {competitors.map(comp => {
                const isActive = activeIntelCompetitor?.id === comp.id;
                const isDnaSourced = comp.id.startsWith("dna-");
                return (
                  <div
                    id={`btn-select-competitor-${comp.id}`}
                    key={comp.id}
                    onClick={() => setActiveIntelCompetitor(comp)}
                    className={`w-full p-3.5 rounded border text-left flex items-start justify-between transition-colors cursor-pointer ${
                      isActive
                        ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent"
                        : "bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] hover:bg-neutral-50 dark:hover:bg-[#1A1A1A]"
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-bold flex items-center space-x-1 ${isActive ? "text-white dark:text-black" : "text-neutral-955 dark:text-white"}`}>
                        <Award className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{comp.name}</span>
                        {isDnaSourced && (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ml-1">
                            DNA
                          </span>
                        )}
                      </span>
                      <p className={`text-[10px] font-mono mt-1 ${isActive ? "text-neutral-305 dark:text-neutral-700" : "text-neutral-400 dark:text-[#737373]"}`}>
                        {comp.location} • {comp.averagePrice}
                      </p>
                    </div>
                    {!isDnaSourced && (
                      <button
                        id={`btn-del-competitor-${comp.id}`}
                        onClick={(e) => deleteCompetitor(comp.id, e)}
                        className={`text-[9px] font-mono hover:font-bold p-1 ${isActive ? "text-neutral-300 dark:text-neutral-800" : "text-red-500 hover:underline"}`}
                        title="Hapus"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                );
              })}
              {competitors.length === 0 && (
                <div className="p-8 text-center text-xs text-neutral-400 border border-dashed rounded font-mono">
                  Belum ada kompetitor terdaftar. Gunakan modul AI gratis untuk auto-generate atau buat manual.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Columns: SWOT Analysis Matrix & battlefield insights */}
        <div className="lg:col-span-2 space-y-6 min-w-0 overflow-hidden">
          
          {activeIntelCompetitor ? (
            <div className="space-y-6">
              {/* Target Header Info */}
              <div className="p-5 rounded border border-neutral-200 dark:border-[#262626] bg-[#111111] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <span className="text-[9px] font-bold font-mono uppercase bg-neutral-250 dark:bg-[#262626] text-neutral-800 dark:text-[#A3A3A3] px-2.5 py-0.5 rounded">SWOT MATCH MATRIX</span>
                  <h3 className="text-md font-bold tracking-tight text-white mt-1.5">
                    Pertempuran Bisnis: {dna.brand || "Toko Anda"} vs {activeIntelCompetitor.name}
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-[#737373] font-mono mt-0.5">
                    Lokasi: {activeIntelCompetitor.location} • Saluran: {activeIntelCompetitor.activeChannels.join(", ")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-neutral-450 dark:text-[#737373] font-mono block uppercase">Estimasi Omzet Pesaing/bln</span>
                  <span className="text-xs font-mono font-bold text-white dark:text-[#E5E5E5]">Rp {activeIntelCompetitor.estimatedRevenue}</span>
                </div>
              </div>

              {/* Spider-Web Competitive Radar Chart Card */}
              {(() => {
                const currentCompId = activeIntelCompetitor.id;
                const competitorRating = ratings[currentCompId] || { price: 7, quality: 6, marketing: 5, service: 6, unique: 5 };
                const brandRating = ratings.brand;

                const radarData = [
                  {
                    subject: "Harga Bersaing",
                    "Brand Anda": brandRating.price,
                    [activeIntelCompetitor.name]: competitorRating.price,
                  },
                  {
                    subject: "Kualitas Produk",
                    "Brand Anda": brandRating.quality,
                    [activeIntelCompetitor.name]: competitorRating.quality,
                  },
                  {
                    subject: "Kekuatan Medsos",
                    "Brand Anda": brandRating.marketing,
                    [activeIntelCompetitor.name]: competitorRating.marketing,
                  },
                  {
                    subject: "Layanan Admin",
                    "Brand Anda": brandRating.service,
                    [activeIntelCompetitor.name]: competitorRating.service,
                  },
                  {
                    subject: "Keunikan Merek",
                    "Brand Anda": brandRating.unique,
                    [activeIntelCompetitor.name]: competitorRating.unique,
                  },
                ];

                return (
                  <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3 border-neutral-100 dark:border-[#1E1E1E]">
                      <div>
                        <span className="text-[9px] font-bold font-mono tracking-wider text-emerald-500 uppercase">SPIDER-WEB COMPETITIVE RADAR</span>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5">Analisis Kekuatan 5 Sisi (Skor 1-10)</h4>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400 dark:text-[#737373] bg-neutral-100 dark:bg-[#181818] px-2 py-0.5 rounded">
                        Geser Slider di Samping untuk Simulasi Siasat!
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                      
                      {/* Recharts Radar Chart Container */}
                      <div className="h-[250px] w-full flex items-center justify-center bg-neutral-50 dark:bg-[#0A0A0A] rounded border border-neutral-150 dark:border-[#1F1F1F] relative p-1 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#444444" strokeOpacity={0.2} />
                            <PolarAngleAxis 
                              dataKey="subject" 
                              tick={{ fill: '#737373', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} 
                            />
                            <PolarRadiusAxis 
                              angle={30} 
                              domain={[0, 10]} 
                              tick={{ fill: '#444444', fontSize: 7 }} 
                            />
                            <Radar
                              name={`Anda (${dna.brand || "Brand Kita"})`}
                              dataKey="Brand Anda"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.2}
                            />
                            <Radar
                              name={activeIntelCompetitor.name}
                              dataKey={activeIntelCompetitor.name}
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              fillOpacity={0.2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#161616',
                                borderColor: '#262626',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                                color: 'white',
                                borderRadius: '4px'
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', paddingTop: '10px' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Config Interaktif Range Sliders */}
                      <div className="space-y-4">
                        
                        {/* Brand Scores controls */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold font-mono text-emerald-500 uppercase tracking-widest block bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                            🛡️ SKOR ANDA ({dna.brand || "El-Zahra"})
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                            {[
                              { key: "price" as const, label: "Harga Bersaing" },
                              { key: "quality" as const, label: "Kualitas Produk" },
                              { key: "marketing" as const, label: "Kekuatan Medsos" },
                              { key: "service" as const, label: "Layanan Admin" },
                              { key: "unique" as const, label: "Daya Unik" },
                            ].map(slider => (
                              <div key={slider.key} className="space-y-0.5">
                                <div className="flex justify-between text-[9px]">
                                  <span className="truncate">{slider.label}</span>
                                  <span className="font-bold text-emerald-500">{brandRating[slider.key]}/10</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={brandRating[slider.key]}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setRatings(prev => ({
                                      ...prev,
                                      brand: { ...prev.brand, [slider.key]: val }
                                    }));
                                  }}
                                  className="w-full accent-emerald-500 h-1 bg-neutral-200 dark:bg-[#262626] rounded appearance-none cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Competitor Scores controls */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold font-mono text-amber-500 uppercase tracking-widest block bg-amber-500/5 px-2 py-1 rounded border border-amber-500/10">
                            ⚠️ SKOR PESAING ({activeIntelCompetitor.name.toUpperCase()})
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-600 dark:text-neutral-400">
                            {[
                              { key: "price" as const, label: "Harga Bersaing" },
                              { key: "quality" as const, label: "Kualitas Produk" },
                              { key: "marketing" as const, label: "Kekuatan Medsos" },
                              { key: "service" as const, label: "Layanan Admin" },
                              { key: "unique" as const, label: "Daya Unik" },
                            ].map(slider => (
                              <div key={slider.key} className="space-y-0.5">
                                <div className="flex justify-between text-[9px]">
                                  <span className="truncate">{slider.label}</span>
                                  <span className="font-bold text-amber-500">{competitorRating[slider.key]}/10</span>
                                </div>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={competitorRating[slider.key]}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setRatings(prev => ({
                                      ...prev,
                                      [currentCompId]: {
                                        ...competitorRating,
                                        [slider.key]: val
                                      }
                                    }));
                                  }}
                                  className="w-full accent-amber-500 h-1 bg-neutral-200 dark:bg-[#262626] rounded appearance-none cursor-pointer"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Complete SWOT Matrix Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                
                {/* 1. STRENGTHS */}
                <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] space-y-2 overflow-hidden">
                  <span className="text-[10px] font-bold font-mono text-neutral-850 dark:text-[#E5E5E5] uppercase tracking-widest flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>S - STRENGTH (KEKUATAN)</span>
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-700 dark:text-[#A3A3A3] break-words">
                    {activeIntelCompetitor.strengths}
                  </p>
                  <span className="text-[9px] block font-mono text-neutral-400 dark:text-[#737373]">Analisis: Jangan banting harga jika kekuatan mereka adalah margin modal besar.</span>
                </div>

                {/* 2. WEAKNESSES */}
                <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] space-y-2 overflow-hidden">
                  <span className="text-[10px] font-bold font-mono text-neutral-850 dark:text-[#E5E5E5] uppercase tracking-widest flex items-center space-x-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>W - WEAKNESS (KELEMAHAN)</span>
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-700 dark:text-[#A3A3A3] break-words">
                    {activeIntelCompetitor.weaknesses}
                  </p>
                  <span className="text-[9px] block font-mono text-neutral-900 dark:text-white font-bold">✓ Serbu bagian ini! Ini adalah celah masuk utama kampanye Anda.</span>
                </div>

                {/* 3. OPPORTUNITIES */}
                <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] space-y-2 col-span-1 lg:col-span-2 overflow-hidden">
                  <span className="text-[10px] font-bold font-mono text-neutral-850 dark:text-[#E5E5E5] uppercase tracking-widest flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>O - OPPORTUNITY (PELUANG ANDA)</span>
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-805 dark:text-white font-semibold break-words">
                    {activeIntelCompetitor.opportunities}
                  </p>
                  <span className="text-[9px] block font-mono text-neutral-450 dark:text-[#737373]">Ide Tindakan: Gunakan Content Generator untuk merebut interaksi video pendek yang luput dari mereka.</span>
                </div>

                {/* 4. THREATS */}
                <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] space-y-2 col-span-1 lg:col-span-2 overflow-hidden">
                  <span className="text-[10px] font-bold font-mono text-neutral-850 dark:text-[#E5E5E5] uppercase tracking-widest flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>T - THREAT (ANCAMAN KITA)</span>
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-700 dark:text-[#A3A3A3] break-words">
                    {activeIntelCompetitor.threats}
                  </p>
                </div>

              </div>

              {/* Social Media Intelligence Card */}
              {(() => {
                // Parse social media data from strengths field
                const igMatch = activeIntelCompetitor.strengths.match(/Instagram:\s*([^\n]+)/);
                const fbMatch = activeIntelCompetitor.strengths.match(/Facebook:\s*([^\n]+)/);
                const webMatch = activeIntelCompetitor.strengths.match(/Data Online:\s*([^\n]+)/);
                const hasSocialData = igMatch || fbMatch || webMatch;

                return hasSocialData ? (
                  <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">📊</span>
                      <span className="text-[10px] font-bold font-mono text-neutral-800 dark:text-white uppercase tracking-widest">Social Media Intelligence</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {igMatch && (
                        <div className="p-3 rounded bg-white dark:bg-[#1a1a1a] border border-pink-200 dark:border-pink-800/30">
                          <span className="text-[9px] font-bold font-mono text-pink-600 dark:text-pink-400 uppercase">📷 Instagram</span>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-1 break-words">
                            {igMatch[1].trim()}
                          </p>
                        </div>
                      )}
                      {fbMatch && (
                        <div className="p-3 rounded bg-white dark:bg-[#1a1a1a] border border-blue-200 dark:border-blue-800/30">
                          <span className="text-[9px] font-bold font-mono text-blue-600 dark:text-blue-400 uppercase">👥 Facebook</span>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-1 break-words">
                            {fbMatch[1].trim()}
                          </p>
                        </div>
                      )}
                      {webMatch && (
                        <div className="p-3 rounded bg-white dark:bg-[#1a1a1a] border border-green-200 dark:border-green-800/30 md:col-span-2">
                          <span className="text-[9px] font-bold font-mono text-green-600 dark:text-green-400 uppercase">🌐 Web Presence</span>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-1 break-words">
                            {webMatch[1].trim()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Head-to-Head battlefield summary card */}
              <div className="p-5 rounded border bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 dark:text-white font-mono">BATTLEGROUND STRATEGY BRIEFING</h4>
                <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
                  Berdasarkan matriks di atas, kompetitor sebanding Anda <strong className="text-neutral-900 dark:text-white font-semibold">{activeIntelCompetitor.name}</strong> terfokus kuat pada penjualan {activeIntelCompetitor.location}. Namun, celah digital mereka lebar. Jangan ikut melakukan perang harga eceran jika margin Anda tipis. Dominasi pasar dengan mengandalkan <strong>{dna.advantages?.split(",")[0] || "keunggulan produk Anda"}</strong> serta memperkuat interaksi video pendek yang tidak dikuasai oleh kompetitor!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center border border-dashed border-neutral-250 dark:border-[#262626] rounded">
              <p className="text-xs font-mono text-neutral-450">Silakan pilih kompetitor di kolom kiri atau buat kompetitor baru untuk melihat SWOT Matriks terpadu.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
