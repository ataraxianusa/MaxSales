/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { MarketingAsset } from '../types';
import { apiFetch } from '../api';
import {
  Sparkles,
  Layers,
  Users2,
  Share2,
  FileImage,
  Flame,
  AlertTriangle,
  Download,
  Trash2,
  Check,
  RotateCcw,
  Copy,
  Clock,
  History,
  X
} from 'lucide-react';

interface BrandingViewProps {
  assets: MarketingAsset[];
  setAssets: React.Dispatch<React.SetStateAction<MarketingAsset[]>>;
  addToast: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export default function BrandingView({
  assets,
  setAssets,
  addToast
}: BrandingViewProps) {
  // Input pane Tab state: 'product' | 'persona' | 'market' | 'specs'
  const [formSubTab, setFormSubTab] = useState<'product' | 'persona' | 'market' | 'specs'>('product');

  // Input states
  const [productName, setProductName] = useState('Mentari Daily Gamis XL Check');
  const [personaName, setPersonaName] = useState('Ibu muda perkotaan 25-35 th, muslimah aktif.');
  const [targetMarket, setTargetMarket] = useState('Jabodetabek & Kota Besar, Penghasilan > 5 jt');
  const [mediaSpecs, setMediaSpecs] = useState('Instagram Feed (1:1) Square Post');
  const [promptEditable, setPromptEditable] = useState(false);

  // Active generation simulation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [historyModalAsset, setHistoryModalAsset] = useState<MarketingAsset | null>(null);

  // Drag-and-drop state representation
  const [dragActive, setDragActive] = useState(false);
  const [uploadedProductPic, setUploadedProductPic] = useState<string | null>(
    'https://images.unsplash.com/photo-1609142721820-2580cc2258aa?auto=format&fit=crop&w=400&q=80'
  );

  // Auto generated prompt based on states
  const derivedPrompt = `Direktur Kreatif VOXIA AI: Buatlah copy digital periklanan persuasif modern untuk nama produk berkelanjutan: "${productName}". Target audiens ideal kami adalah: "${personaName}" yang berada di jangkauan target market: "${targetMarket}". Visualisasikan template post di spesifikasi media "${mediaSpecs}". Output harus memiliki bauran warna primer, aksen mencolok, tulisan copy pemikat, judul display, serta CTA aksi tegas.`;

  const [promptOverride, setPromptOverride] = useState('');
  const activePromptText = promptEditable ? promptOverride : derivedPrompt;

  // Presets trigger handlers
  const loadPreset = (brandType: 'fashion' | 'fnb' | 'saas') => {
    if (brandType === 'fashion') {
      setProductName('Mentari Daily Gamis XL Check');
      setPersonaName('Ibu muda perkotaan 25-35 th, muslimah aktif.');
      setTargetMarket('Jabodetabek & Kota Besar, Pembelian online');
      setMediaSpecs('Instagram Feed (1:1) Square Post');
    } else if (brandType === 'fnb') {
      setProductName('KOPI VOXIA Gula Aren 1 Liter');
      setPersonaName('Pekerja WFH kreatif, mahasiswa tingkat akhir, penikmat kafein.');
      setTargetMarket('Karyawan SCBD & Sudirman Jakarta, Usia 20-40 th');
      setMediaSpecs('Social Post Stories (9:16) Portrait');
    } else if (brandType === 'saas') {
      setProductName('VOXIA Sales Automation Toolkit');
      setPersonaName('Solo-owner bisnis online, UMKM naik kelas, admin kewalahan.');
      setTargetMarket('Merchant Marketplace & Owner UKM Mandiri');
      setMediaSpecs('TikTok Video Promo Script (9:16)');
    }
    setPromptOverride('');
    addToast('Preset bauran industri berpindah!', 'success');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedProductPic(event.target?.result as string);
        addToast('Gambar produk berhasil diunggah!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate button handler
  const handleGenerate = async () => {
    if (!productName.trim() || !personaName.trim()) {
      addToast('Nama produk dan persona wajib diisi!', 'warning');
      return;
    }

    setIsGenerating(true);
    setProgressText('Menghubungkan asisten kreatif VOXIA...');

    // Simulate progressive skeleton steps
    setTimeout(() => setProgressText('Menganalisis parameter persona & kecocokan media...'), 1200);
    setTimeout(() => setProgressText('Menyusun ad copy persuasif dengan model Gemini 3.5...'), 2400);

    try {
      const response = await apiFetch('/api/generate-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productName,
          persona: personaName,
          targetMarket,
          mediaSpecs: promptEditable ? promptOverride : mediaSpecs
        })
      });

      const data = await response.json();
      
      setTimeout(() => {
        if (data.assets && data.assets.length > 0) {
          // Put generated assets to the beginning of state array
          setAssets((prev) => [...data.assets, ...prev]);
          addToast(`Berhasil merumuskan ${data.assets.length} aset kreatif baru!`, 'success');
        } else {
          addToast('Aset kosong. Menggunakan cadangan simulator.', 'warning');
        }
        setIsGenerating(false);
      }, 3500);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setIsGenerating(false);
        addToast('Gagal terhubung server API. Menggunakan cadangan mockup.', 'error');
      }, 3000);
    }
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(activePromptText);
    addToast('Prompt tersalin ke papan klip!', 'success');
  };

  const deleteAsset = (id: string) => {
    if (window.confirm('Hapus aset visual ini dari database?')) {
      setAssets((prev) => prev.filter((a) => a.id !== id));
      addToast('Aset berhasil dihapus.', 'success');
    }
  };

  const downloadAsset = (asset: MarketingAsset) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(asset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voxia_asset_${asset.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Aset diekspor ke format JSON!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-150 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Branding – Asset Generator AI
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dukung visualisasi promosi produk digital Anda secara akurat memakai formula persona taktis.
          </p>
        </div>

        {/* Brand presets shortcuts */}
        <div className="flex gap-2 text-xs select-none">
          <button
            onClick={() => loadPreset('fashion')}
            className="px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#0A3D62] dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
          >
            🌸 Muslimah Fashion
          </button>
          <button
            onClick={() => loadPreset('fnb')}
            className="px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#00a3e0] dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
          >
            ☕ Food & Beverage
          </button>
          <button
            onClick={() => loadPreset('saas')}
            className="px-3 py-1.5 rounded-full border border-slate-200 hover:border-amber-500 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
          >
            💻 SaaS Portal
          </button>
        </div>
      </div>

      {/* Main Split Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden relative pb-16">
          {/* Internal subtab headers */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            {[
              { id: 'product', label: 'Produk', icon: Layers },
              { id: 'persona', label: 'Persona', icon: Users2 },
              { id: 'market', label: 'Target', icon: Share2 },
              { id: 'specs', label: 'Specs', icon: FileImage }
            ].map((subTab) => {
              const Icon = subTab.icon;
              const isActive = formSubTab === subTab.id;
              return (
                <button
                  key={subTab.id}
                  onClick={() => setFormSubTab(subTab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#0A3D62] text-[#0A3D62] dark:text-cyan-400 bg-white dark:bg-slate-850'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{subTab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5 space-y-4">
            {/* Tab: PRODUCT BRAND FORM */}
            {formSubTab === 'product' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Nama / Kategori Produk
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Contoh: Kaos Oversize Katun Organik"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-[#0A3D62]/20 dark:focus:ring-blue-500/20 text-slate-800 dark:text-white outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block font-mono">
                    *Tip: Masukkan nama spesifik produk agar hasil copy lebih presisi.
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Unggah Media Inspirasi (Drag & Drop)
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center min-h-[140px] cursor-pointer ${
                      dragActive
                        ? 'border-[#0A3D62] bg-[#0A3D62]/5 dark:border-blue-500 dark:bg-blue-500/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-350 bg-slate-50/30 dark:bg-slate-900/10'
                    }`}
                  >
                    {uploadedProductPic ? (
                      <div className="relative group">
                        <img
                          src={uploadedProductPic}
                          alt="Product preview"
                          className="max-h-24 w-auto rounded-lg mx-auto shadow-sm object-contain"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedProductPic(null);
                          }}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 transition"
                        >
                          <X size={10} />
                        </button>
                        <span className="block text-[10px] text-slate-400 mt-2 font-mono">
                          Format terunggah. Klik x untuk ganti.
                        </span>
                      </div>
                    ) : (
                      <>
                        <FileImage size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Seret foto produk di sini atau pilih berkas
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1">
                          Mendukung PNG, JPG, JPEG (Maksimal 4MB)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const reader = new FileReader();
                              reader.onload = (ev) => setUploadedProductPic(ev.target?.result as string);
                              reader.readAsDataURL(e.target.files[0]);
                              addToast('Foto produk berhasil diunggah!', 'success');
                            }
                          }}
                          className="hidden"
                          id="drag-and-drop-input"
                        />
                        <label
                          htmlFor="drag-and-drop-input"
                          className="mt-3 px-3 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold border border-slate-250 dark:border-slate-700 rounded-md cursor-pointer block"
                        >
                          Pilih Dokumen
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: PERSONA FOCUS */}
            {formSubTab === 'persona' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Ideal Customer Persona
                  </label>
                  <textarea
                    rows={4}
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                    placeholder="Tulis deskripsi persona e.g. Mahasiswa tingkat akhir jurusan kreatif yang suka kafein..."
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-[#0A3D62]/20 text-slate-800 dark:text-white outline-none resize-none"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Gen-Z Urban', 'Ibu-ibu Muda', 'Pebisnis UKM', 'Pekerja Kantor'].map((pTag) => (
                      <button
                        key={pTag}
                        onClick={() => {
                          setPersonaName(`${pTag} berumur 20-35 tahun, pengguna gadget aktif.`);
                          addToast(`Persona disetel ke ${pTag}!`, 'success');
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-[#0A3D62] hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded cursor-pointer transition-colors"
                      >
                        🏷️ {pTag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: TARGET MARKET */}
            {formSubTab === 'market' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Karakter Demografi & Target Market
                  </label>
                  <input
                    type="text"
                    value={targetMarket}
                    onChange={(e) => setTargetMarket(e.target.value)}
                    placeholder="Contoh: Domisili Bandung, Pendapatan 4-10 jt cangkupan ritel"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-[#0A3D62]/20 text-slate-800 dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Metrik Level Pembelian
                  </label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-[#0A3D62]/20 text-slate-805 dark:text-white outline-none">
                    <option>High Purchase Frequency (Membeli mingguan)</option>
                    <option>Medium Purchase Intent (Membeli bulanan)</option>
                    <option>Aspirasional (Butuh promosi pengingat kupon diskon)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tab: MEDIA SPECS */}
            {formSubTab === 'specs' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Format & Spesifikasi Media Iklan
                  </label>
                  <select
                    value={mediaSpecs}
                    onChange={(e) => setMediaSpecs(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-semibold focus:ring-2 focus:ring-[#0A3D62]/20 text-slate-800 dark:text-white outline-none"
                  >
                    <option>Instagram Feed (1:1) Square Post</option>
                    <option>TikTok Video Promo Script (9:16) Portrait</option>
                    <option>Facebook Carousel Shoppable Ad</option>
                    <option>WhatsApp Broadcast Campaign Newsletter</option>
                  </select>
                </div>
              </div>
            )}

            {/* Prompt Preview Textarea */}
            <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-orange-50/20 dark:bg-slate-900/30 space-y-2 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
                  <Flame size={14} className="animate-pulse" /> Prompt Preview (Read Only)
                </span>
                <button
                  onClick={() => setPromptEditable(!promptEditable)}
                  className="text-[10px] font-bold text-[#0A3D62] dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  {promptEditable ? 'Kunci Auto-Prompt' : 'Sunting Manual'}
                </button>
              </div>

              {promptEditable ? (
                <textarea
                  rows={3}
                  value={promptOverride}
                  onChange={(e) => setPromptOverride(e.target.value)}
                  placeholder="Ketik manual prompts kustomisasi..."
                  className="w-full text-xs font-mono p-2 border border-yellow-250 rounded bg-white dark:bg-slate-900 focus:outline-none dark:text-slate-200"
                />
              ) : (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  {derivedPrompt}
                </p>
              )}

              {promptEditable && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-600 font-semibold leading-none">
                  <AlertTriangle size={12} className="shrink-0" />
                  <span>Mengubah aslinya dapat mempengaruhi tingkat kecocokan formula AI.</span>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={copyPromptToClipboard}
                  className="flex items-center gap-1 text-[10px] bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 font-bold px-2 py-1 rounded text-slate-600 dark:text-slate-350 cursor-pointer"
                >
                  <Copy size={11} /> Salin Prompt
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Generate Button below panel */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-md flex items-center gap-2 cursor-pointer transition-all ${
                isGenerating
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#00A3E0] hover:bg-[#0092c8] shadow-cyan-500/10'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Membat proses...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Aset Kampanye</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Gallery Result Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
              Galeri Aset Generated ({assets.length} Aset)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Hover aset untuk mengaktifkan aksi ekspor
            </span>
          </div>

          {/* SKELETON LOADERS WHILE GENERATING */}
          {isGenerating && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40 space-y-3 min-h-[220px]">
                  <div className="w-12 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                  <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-slate-250 dark:bg-slate-800 rounded"></div>
                    <div className="w-5/6 h-3 bg-slate-250 dark:bg-slate-800 rounded"></div>
                  </div>
                  <div className="w-full h-24 bg-slate-100 dark:bg-slate-800/80 rounded border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 font-mono">{progressText}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {assets.length === 0 && !isGenerating ? (
            <div className="border border-dashed border-slate-250 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <FileImage size={42} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <h4 className="text-sm font-bold text-slate-600 dark:text-slate-300">Belum ada aset pemenang</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
                Masukkan parameter produk Anda dalam form sebelah kiri lalu ketuk generate untuk melahirkan materi visual promosi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white dark:bg-slate-850 p-4 border border-slate-150 dark:border-slate-800 rounded-xl hover:shadow-md transition-all relative group flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Upper badge block */}
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono bg-[#0A3D62]/10 dark:bg-cyan-950/40 text-[#0A3D62] dark:text-cyan-400 border border-[#0A3D62]/10 px-2 py-0.5 rounded font-extrabold uppercase select-none">
                        {asset.type}
                      </span>
                      <span className="text-slate-400 font-medium">
                        v{asset.version} • {asset.timestamp || 'Baru Saja'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1 pr-6 uppercase tracking-tight">
                      {asset.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-medium">
                      {asset.copy}
                    </p>

                    {/* Integrated Responsive Micro-Render SVG representation */}
                    <div
                      className={`w-full rounded-lg h-28 bg-gradient-to-br ${asset.styleTheme?.bgGradient || 'from-slate-900 to-indigo-950'} flex flex-col items-center justify-center p-3 text-center border border-slate-100/10 dark:border-slate-800 relative select-none`}
                    >
                      <span className={`text-[10px] font-extrabold uppercase text-white/90 truncate max-w-[140px] tracking-wider`}>
                        {asset.productName}
                      </span>
                      <span className={`text-[8px] mt-1 text-white/70 max-w-[150px] font-light leading-snug line-clamp-2`}>
                        {asset.copy}
                      </span>
                      {/* CTA placeholder button inside graphic preview */}
                      <span
                        className="mt-2.5 px-3 py-1 font-extrabold text-[8px] uppercase tracking-wide rounded-md shadow"
                        style={{
                          backgroundColor: asset.styleTheme?.accentColor || '#FFB400',
                          color: '#1E293B'
                        }}
                      >
                        {asset.ctaText || 'Amankan Sekarang'}
                      </span>
                    </div>
                  </div>

                  {/* Operational Controls Buttons (Hover state only or visible block) */}
                  <div className="flex justify-between items-center mt-3 border-t border-slate-50 dark:border-slate-800 pt-2 text-xs">
                    {/* History button toggle */}
                    <button
                      onClick={() => setHistoryModalAsset(asset)}
                      className="text-slate-500 hover:text-[#0A3D62] dark:hover:text-cyan-400 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <History size={12} /> Versi
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => downloadAsset(asset)}
                        className="p-1 border border-slate-205 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded text-slate-600 dark:text-slate-300 hover:text-black cursor-pointer"
                        title="Download JSON"
                      >
                        <Download size={12} />
                      </button>
                      <button
                        onClick={() => deleteAsset(asset.id)}
                        className="p-1 border border-rose-100 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VERSION LIST MODAL DETAILED */}
      {historyModalAsset && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 max-w-md w-full rounded-2xl p-5 border border-slate-100 dark:border-slate-800 relative shadow-2xl space-y-4">
            <button
              onClick={() => setHistoryModalAsset(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <History className="text-indigo-600" size={18} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Riwayat Versi : {historyModalAsset.productName}
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Setiap kali Anda men-generate ulang dengan parameter modifikasi, VOXIA merekam riwayat lama agar tidak menimpa ide terdahulu.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[220px] overflow-y-auto">
              <div className="py-2.5 text-xs flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-850 dark:text-white">Versi 1 (Aktif)</span>
                  <p className="text-[10px] text-slate-400">{historyModalAsset.timestamp || 'Hari Ini'}</p>
                </div>
                <button
                  onClick={() => alert(`Aset v1 sedang aktif dengan file template: ${historyModalAsset.title}`)}
                  className="px-2.5 py-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold rounded"
                >
                  Buka
                </button>
              </div>

              <div className="py-2.5 text-xs flex justify-between items-center text-slate-400">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-500">Versi Basis Inisiasi</span>
                  <p className="text-[10px]">15 Juni 2026, 12:10 WIB</p>
                </div>
                <button
                  className="px-2.5 py-1 text-[10px] bg-slate-100 text-slate-400 font-medium rounded cursor-not-allowed"
                  disabled
                >
                  Dipulihkan
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHistoryModalAsset(null)}
                className="px-4 py-2 bg-[#0A3D62] text-white text-xs font-bold rounded-lg hover:bg-blue-900 cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
