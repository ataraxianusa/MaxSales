import React from "react";
import { BusinessCanvasData, defaultCanvasData } from "../types";
import { Info, Save, RotateCcw, AlertTriangle, Layers, Target, Coins, Share2, TrendingUp, Eye } from "lucide-react";

interface BusinessCanvasProps {
  canvas: BusinessCanvasData;
  setCanvas: (data: BusinessCanvasData) => void;
  onSave: () => void;
  isSetupWizard?: boolean;
  isReEditing?: boolean;
}

type SubTabType = "produk" | "target" | "pola" | "media" | "performa" | "kompetitor";

export default function BusinessCanvas({ canvas, setCanvas, onSave, isSetupWizard = false, isReEditing = false }: BusinessCanvasProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<SubTabType>("produk");

  const updateField = (field: keyof BusinessCanvasData, value: any) => {
    setCanvas({
      ...canvas,
      [field]: value
    });
  };

  const handleArrayToggle = (field: keyof BusinessCanvasData, item: string) => {
    const list = (canvas[field] as string[]) || [];
    if (list.includes(item)) {
      updateField(field, list.filter(x => x !== item));
    } else {
      updateField(field, [...list, item]);
    }
  };

  const loadPreset = () => {
    if (window.confirm("Muat data contoh bimbingan (Gamis Premium)? Ini akan menimpa DNA yang sedang Anda edit saat ini.")) {
      setCanvas(defaultCanvasData());
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab bar header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#262626] gap-4">
        <div>
          <h2 className="text-xl font-light tracking-tight flex items-center space-x-2 text-neutral-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Fondasi: Business Canvas DNA</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
            {isSetupWizard 
              ? "Isi Nama Produk, Harga, Keunggulan, & Target Market untuk mengaktifkan 5 Fitur Utama." 
              : "Identitas paten statis yang dibagikan dan melandasi keakuratan analisis seluruh modul AI MaxxSales."}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="btn-load-preset-dna"
            type="button"
            onClick={loadPreset}
            className="px-3.5 py-1.5 rounded text-xs font-mono border hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] border-neutral-300 dark:border-[#262626] text-neutral-700 dark:text-[#A3A3A3] flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Muat Contoh Templet</span>
          </button>
          
          <button
            id="btn-save-dna"
            type="button"
            onClick={onSave}
            className={`px-4 py-1.5 rounded text-xs font-semibold tracking-wide flex items-center space-x-1.5 transition-colors focus:ring-1 focus:ring-emerald-500 focus:outline-none ${
              isSetupWizard
                ? "text-black bg-emerald-400 hover:bg-emerald-350 dark:text-black dark:bg-emerald-400 dark:hover:bg-emerald-300 animate-pulse"
                : "text-white dark:text-black bg-neutral-950 hover:bg-neutral-900 dark:bg-[#E5E5E5] dark:hover:bg-white"
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isReEditing ? "Simpan Perubahan DNA" : isSetupWizard ? "Aktifkan 6 Fitur Utama" : "Simpan DNA"}</span>
          </button>
        </div>
      </div>

      {/* Info Warning */}
      <div className="p-3.5 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] text-xs text-neutral-600 dark:text-[#A3A3A3] flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-neutral-500 dark:text-[#737373] shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-neutral-805 dark:text-white">Penting:</strong> {isReEditing
            ? "Sesuaikan data bisnis Anda. Setiap perubahan langsung tersimpan otomatis. Klik tombol di bawah bila sudah selesai."
            : "Isi kolom di bawah ini semaksimal mungkin sesuai keunikan bisnis Anda. Data di sub-tab ini akan direferensikan saat AI menyusun 3-chain briefing taktis, visual banner, dan 11 pilar strategi."}
        </p>
      </div>

      {/* Sub-Tabs Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 border-b pb-2 border-neutral-200 dark:border-[#262626]">
        {[
          { key: "produk", label: "Produk & Spesifikasi", icon: Layers },
          { key: "target", label: "Target Market", icon: Target },
          { key: "pola", label: "Pola & Finansial", icon: Coins },
          { key: "media", label: "Media & Channel", icon: Share2 },
          { key: "performa", label: "Performa Real-Time", icon: TrendingUp },
          { key: "kompetitor", label: "Kompetitor", icon: Eye }
        ].map(tb => {
          const IconComp = tb.icon;
          const isSelected = activeSubTab === tb.key;
          return (
            <button
              id={`tab-canvas-sub-${tb.key}`}
              key={tb.key}
              onClick={() => setActiveSubTab(tb.key as SubTabType)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition-all ${
                isSelected
                  ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-bold"
                  : "bg-white dark:bg-[#111111] text-neutral-650 dark:text-[#A3A3A3] border border-neutral-200 dark:border-[#262626] hover:bg-neutral-50 dark:hover:bg-[#171717]"
              }`}
            >
              <IconComp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tb.label}</span>
            </button>
          );
        })}
      </div>

      {/* Forms Area divided by Tab */}
      <div className="p-6 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] transition-all duration-300">
        
        {/* SUBTAB 1: PRODUK & SPESIFIKASI */}
        {activeSubTab === "produk" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Nama Produk Utama *</label>
              <input
                id="inp-dna-productName"
                type="text"
                placeholder="misal: Gamis Premium Sutra El-Zahra"
                value={canvas.productName}
                onChange={e => updateField("productName", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Merek / Brand Dagang *</label>
              <input
                id="inp-dna-brand"
                type="text"
                placeholder="misal: El-Zahra Boutique"
                value={canvas.brand}
                onChange={e => updateField("brand", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Kategori Utama *</label>
              <select
                id="inp-dna-category"
                value={canvas.category}
                onChange={e => updateField("category", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                {["Fashion", "F&B (Makanan/Minuman)", "Kecantikan / Skincare", "Kesehatan", "Edukasi/Jasa", "Furniture & Rumah Tangga", "Gadget/Elektronik", "Pertanian/Lokal", "Lainnya"].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Sub-Kategori Produk</label>
              <input
                id="inp-dna-subCategory"
                type="text"
                placeholder="misal: Gamis Muslimah, Hijab Instant"
                value={canvas.subCategory || ""}
                onChange={e => updateField("subCategory", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Deskripsi Singkat Keunikan Produk *</label>
              <textarea
                id="inp-dna-shortDescription"
                placeholder="Tuliskan spesifikasi produk, kegunaan, dan nilai tambah premiumnya..."
                value={canvas.shortDescription}
                onChange={e => updateField("shortDescription", e.target.value)}
                rows={3}
                className="w-full text-xs p-3.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Harga Eceran Normal (Rp) *</label>
              <input
                id="inp-dna-normalPrice"
                type="number"
                placeholder="misal: 399000"
                value={canvas.normalPrice || ""}
                onChange={e => updateField("normalPrice", Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Range Harga Produk</label>
              <select
                id="inp-dna-priceRange"
                value={canvas.priceRange}
                onChange={e => updateField("priceRange", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                {["< 50rb", "50-100rb", "100-300rb", "300-500rb", "500rb-1jt", "> 1jt"].map(rng => (
                  <option key={rng} value={rng}>{rng}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Kualitas Finis / Bahan</label>
              <select
                id="inp-dna-quality"
                value={canvas.quality}
                onChange={e => updateField("quality", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                {["Premium", "Menengah", "Ekonomis"].map(q => (
                  <option key={q} value={q}>{q} Quality</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Kemasan (Packaging) Fisik</label>
              <input
                id="inp-dna-packaging"
                type="text"
                placeholder="misal: Kardus mewah berlapis tissue wrap"
                value={canvas.packaging || ""}
                onChange={e => updateField("packaging", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Keunggulan Utama (Pisahkan dengan koma) *</label>
              <textarea
                id="inp-dna-advantages"
                placeholder="Bahan sutra asli adem, jahitan kuat, motif eksklusif butik"
                value={canvas.advantages}
                onChange={e => updateField("advantages", e.target.value)}
                rows={2}
                className="w-full text-xs p-3.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* SUBTAB 2: TARGET MARKET SEGMENT */}
        {activeSubTab === "target" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Jenis Kelamin Target Market</label>
                <div className="flex space-x-2 text-xs">
                  {["Laki-laki", "Perempuan", "Semua"].map(g => {
                    const isSelected = canvas.genders?.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleArrayToggle("genders", g)}
                        className={`px-4 py-1.5 rounded text-xs tracking-wide transition-all border ${
                          isSelected
                            ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-medium"
                            : "bg-transparent border-neutral-300 dark:border-[#262626] text-neutral-500 hover:border-neutral-400 dark:hover:border-[#3F3F46]"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Rentang Usia</label>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {["Anak (0-12)", "Remaja (13-17)", "Dewasa Muda (18-25)", "Dewasa (26-35)", "Paruh Baya (36-50)", "Senior (51+)"].map(a => {
                    const isSelected = canvas.ages?.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => handleArrayToggle("ages", a)}
                        className={`px-3 py-1 rounded transition-all border ${
                          isSelected
                            ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-medium"
                            : "bg-transparent border-neutral-300 dark:border-[#262626] text-neutral-500 hover:border-neutral-400 dark:hover:border-[#3F3F46]"
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Pekerjaan Utama</label>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {["Pelajar/Mahasiswa", "Karyawan Swasta", "PNS/TNI/Polri", "Wiraswasta", "Ibu Rumah Tangga", "Freelancer"].map(j => {
                    const isSelected = canvas.jobs?.includes(j);
                    return (
                      <button
                        key={j}
                        type="button"
                        onClick={() => handleArrayToggle("jobs", j)}
                        className={`px-3 py-1 rounded transition-all border ${
                          isSelected
                            ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-medium"
                            : "bg-transparent border-neutral-300 dark:border-[#262626] text-neutral-500 hover:border-neutral-400 dark:hover:border-[#3F3F46]"
                        }`}
                      >
                        {j}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Golongan Status Sosial Ekonomi</label>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {["Sejahtera", "Mampu", "Kelas Menengah", "Ekstra Kaya"].map(ec => {
                    const isSelected = canvas.economicClasses?.includes(ec);
                    return (
                      <button
                        key={ec}
                        type="button"
                        onClick={() => handleArrayToggle("economicClasses", ec)}
                        className={`px-3 py-1 rounded transition-all border ${
                          isSelected
                            ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-medium"
                            : "bg-transparent border-neutral-300 dark:border-[#262626] text-neutral-500 hover:border-neutral-400 dark:hover:border-[#3F3F46]"
                        }`}
                      >
                        {ec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 font-mono">Range Pendapatan Target (Bulanan)</label>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {["< 1jt", "1-3jt", "3-5jt", "5-10jt", "10-25jt", "> 25jt"].map(inc => {
                    const isSelected = canvas.incomeRanges?.includes(inc);
                    return (
                      <button
                        key={inc}
                        type="button"
                        onClick={() => handleArrayToggle("incomeRanges", inc)}
                        className={`px-3 py-1  transition-all border rounded ${
                          isSelected
                            ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-medium"
                            : "bg-transparent border-neutral-300 dark:border-[#262626] text-neutral-500 hover:border-neutral-400 dark:hover:border-[#3F3F46]"
                        }`}
                      >
                        {inc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Segmentasi Lokasi Utama</label>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {["Desa", "Kota Kecil", "Kota Besar", "Metropolitan"].map(loc => {
                    const isSelected = canvas.locations?.includes(loc);
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleArrayToggle("locations", loc)}
                        className={`px-3 py-1 rounded transition-all border ${
                          isSelected
                            ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-medium"
                            : "bg-transparent border-neutral-300 dark:border-[#262626] text-neutral-500 hover:border-neutral-400 dark:hover:border-[#3F3F46]"
                        }`}
                      >
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Hobi & Ketertarikan Perilaku (Interest)</label>
              <textarea
                id="inp-dna-hobbies"
                rows={2}
                placeholder="misal: Fashion hijab, arisan mami muda, kulineran modern, hobi reels"
                value={canvas.hobbies || ""}
                onChange={e => updateField("hobbies", e.target.value)}
                className="w-full text-xs p-3.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* SUBTAB 3: POLA BISNIS & FINANSIAL */}
        {activeSubTab === "pola" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Tipe Skema Bisnis</label>
              <select
                id="inp-dna-businessType"
                value={canvas.businessType}
                onChange={e => updateField("businessType", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                <option value="Mendatangi konsumen">A. Mendatangi konsumen (Sales Lapangan)</option>
                <option value="Didatangi konsumen">B. Didatangi konsumen (Toko Ritel/Butik)</option>
                <option value="Campuran">C. Campuran (Toko / Online butik terintegrasi)</option>
                <option value="Perantara">D. Perantara (Reseller/Agen distributor)</option>
                <option value="Jasa khusus">E. Jasa khusus / Kustomisasi pesanan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Target Omzet Bulanan (Rp) *</label>
              <input
                id="inp-dna-targetMonthlyRevenue"
                type="number"
                placeholder="misal: 50000000"
                value={canvas.targetMonthlyRevenue || ""}
                onChange={e => updateField("targetMonthlyRevenue", Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Margin Keuntungan</label>
              <select
                id="inp-dna-marginRange"
                value={canvas.marginRange}
                onChange={e => updateField("marginRange", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                {["< 10%", "10-20%", "20-30%", "30-50%", "> 50%"].map(m => (
                  <option key={m} value={m}>{m} Margin Bersih</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Estimasi Omzet Saat Ini</label>
              <select
                id="inp-dna-monthlyRevenueRange"
                value={canvas.monthlyRevenueRange}
                onChange={e => updateField("monthlyRevenueRange", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                {["< 5jt", "5-10jt", "10-25jt", "25-50jt", "50-100jt", "> 100jt"].map(omz => (
                  <option key={omz} value={omz}>{omz} / bulan</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* SUBTAB 4: MEDIA & CHANNEL */}
        {activeSubTab === "media" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Kontak Bisnis Utama (WA/E-mail) *</label>
              <input
                id="inp-dna-businessContact"
                type="text"
                placeholder="misal: 08123456789 (Admin Rania)"
                value={canvas.businessContact}
                onChange={e => updateField("businessContact", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Situs Web / URL Toko</label>
              <input
                id="inp-dna-websiteUrl"
                type="text"
                placeholder="misal: www.elzahramuslimah.com"
                value={canvas.websiteUrl}
                onChange={e => updateField("websiteUrl", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Budget Iklan Bulanan (Rp)</label>
              <input
                id="inp-dna-monthlyAdBudget"
                type="number"
                placeholder="misal: 1500000"
                value={canvas.monthlyAdBudget || ""}
                onChange={e => updateField("monthlyAdBudget", Number(e.target.value))}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Target Engagement Kampanye</label>
              <select
                id="inp-dna-engagementTarget"
                value={canvas.engagementTarget}
                onChange={e => updateField("engagementTarget", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                {["Awareness (Jangkauan luas)", "Engagement (Interaksi & Like)", "Conversion (Penjualan / Closing WA)", "Retention (Pelanggan berulang)"].map(tg => (
                  <option key={tg} value={tg.split(' ')[0]}>{tg}</option>
                ))}
              </select>
            </div>

            {/* activeSocialMedia — used by AI Strategy Forge */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                Media Sosial Aktif *
                <span className="text-[9px] text-neutral-400 dark:text-[#737373] font-normal ml-1">
                  (Digunakan AI untuk strategi konten & promosi)
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {["Instagram", "TikTok", "Facebook", "WhatsApp", "YouTube", "Shopee", "Tokopedia", "Lazada", "Twitter/X", "Pinterest", "Telegram", "Threads"].map(sm => {
                  const isSelected = canvas.activeSocialMedia?.includes(sm);
                  return (
                    <button
                      key={sm}
                      id={`inp-dna-activeSocialMedia-${sm.toLowerCase()}`}
                      type="button"
                      onClick={() => handleArrayToggle("activeSocialMedia", sm)}
                      className={`px-3 py-1 rounded transition-all border ${
                        isSelected
                          ? "bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black border-transparent font-medium"
                          : "bg-transparent border-neutral-300 dark:border-[#262626] text-neutral-500 hover:border-neutral-400 dark:hover:border-[#3F3F46]"
                      }`}
                    >
                      {sm}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 6: PERFORMA REAL-TIME */}
        {activeSubTab === "performa" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                ⏰ Jam Sibuk Transaksi
              </label>
              <input
                id="inp-dna-peakHours"
                type="text"
                placeholder="misal: 09:00-11:00 & 19:00-21:00"
                value={canvas.peakHours}
                onChange={e => updateField("peakHours", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
              <p className="text-[10px] text-neutral-400 dark:text-[#737373] mt-1">Jam di mana pelanggan paling sering bertransaksi. AI akan mengarahkan eksekusi ke window ini.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                📡 Channel Konversi Tertinggi
              </label>
              <select
                id="inp-dna-topConvertingChannel"
                value={canvas.topConvertingChannel}
                onChange={e => updateField("topConvertingChannel", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                {["WhatsApp DM", "Instagram DM", "TikTok Comment", "Shopee Chat", "Tokopedia Chat", "Website / Landing Page", "Offline / Toko Fisik", "Lainnya"].map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
              <p className="text-[10px] text-neutral-400 dark:text-[#737373] mt-1">Channel yang menghasilkan closingan tertinggi. AI akan arahkan rekomendasi ke channel ini.</p>
            </div>

            <div className="md:col-span-2 p-4 rounded bg-emerald-50 dark:bg-[#0a1a10] border border-emerald-200 dark:border-emerald-900/30">
              <p className="text-[11px] leading-relaxed text-emerald-750 dark:text-emerald-300">
                <strong>💡 Kenapa ini penting:</strong> Data jam sibuk dan channel konversi membuat AI bisa memberikan rekomendasi yang presisi — tahu <em>kapan</em> dan <em>di mana</em> eksekusi paling efektif, bukan sekedar saran generik.
              </p>
            </div>
          </div>
        )}

        {/* SUBTAB 5: KOMPETITOR RINGKASAN */}
        {activeSubTab === "kompetitor" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Estimasi Jumlah Pesaing Terdekat</label>
              <select
                id="inp-dna-localCompetitorCount"
                value={canvas.localCompetitorCount}
                onChange={e => updateField("localCompetitorCount", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-neutral-50 dark:bg-[#171717] border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white text-neutral-850 dark:text-[#E5E5E5] focus:outline-none"
              >
                {["0-2 Kompetitor", "3-5 Kompetitor", "6-10 Kompetitor", "> 10 Kompetitor"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Pesaing Terbesar / Utama *</label>
              <input
                id="inp-dna-biggestCompetitor"
                type="text"
                placeholder="misal: Syar'i Chic Mall"
                value={canvas.biggestCompetitor}
                onChange={e => updateField("biggestCompetitor", e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Kelebihan Pesaing Terbesar</label>
              <textarea
                id="inp-dna-competitorStrengths"
                placeholder="Tuliskan kekuatan draf produk atau strategi marketing mereka..."
                value={canvas.competitorStrengths}
                onChange={e => updateField("competitorStrengths", e.target.value)}
                rows={3}
                className="w-full text-xs p-3.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">Kelemahan Pesaing Terbesar</label>
              <textarea
                id="inp-dna-competitorWeaknesses"
                placeholder="Tuliskan titik lengah mereka (misalnya tidak go-online, kemasan bungkus biasa)..."
                value={canvas.competitorWeaknesses}
                onChange={e => updateField("competitorWeaknesses", e.target.value)}
                rows={3}
                className="w-full text-xs p-3.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
