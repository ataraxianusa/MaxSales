import React from "react";
import { CustomerSegment, BusinessCanvasData } from "../types";
import { Users, HeartCrack, Plus, Award, Loader2, Coins } from "lucide-react";

interface CustomerInsightProps {
  dna: BusinessCanvasData;
  segments: CustomerSegment[];
  setSegments: (list: CustomerSegment[]) => void;
}

export default function CustomerInsight({ dna, segments, setSegments }: CustomerInsightProps) {
  // LTV states
  const [aov, setAov] = React.useState(dna.normalPrice || 399000);
  const [frequency, setFrequency] = React.useState(2); // times/month
  const [lifespan, setLifespan] = React.useState(12); // months

  // Segment creation modal / quick form
  const [segName, setSegName] = React.useState("");
  const [segPercent, setSegPercent] = React.useState(15);
  const [segChannel, setSegChannel] = React.useState("WhatsApp DM");
  const [segAvgSpend, setSegAvgSpend] = React.useState(dna.normalPrice || 399000);
  const [segRisk, setSegRisk] = React.useState<"Low" | "Medium" | "High">("Low");

  const ltvResult = aov * frequency * lifespan;

  const addNewSegment = () => {
    if (!segName.trim()) {
      alert("Harap isi nama segmen pembeli!");
      return;
    }
    const newSeg: CustomerSegment = {
      name: segName,
      percentage: segPercent,
      channel: segChannel,
      avgTransaction: Number(segAvgSpend),
      frequency: `${frequency}x / bulan`,
      risk: segRisk
    };

    setSegments([...segments, newSeg]);
    setSegName("");
  };

  const deleteSegment = (index: number) => {
    const updated = segments.filter((_, i) => i !== index);
    setSegments(updated);
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "High": return "bg-neutral-50 dark:bg-[#1C1212] text-red-650 dark:text-red-400 border-red-200 dark:border-red-900/30";
      case "Medium": return "bg-neutral-50 dark:bg-[#1C1A12] text-neutral-600 dark:text-amber-400 border-neutral-200 dark:border-amber-900/30";
      default: return "bg-neutral-50 dark:bg-[#121A16] text-neutral-650 dark:text-emerald-400 border-neutral-200 dark:border-emerald-900/30";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="border-b pb-4 border-neutral-200 dark:border-[#262626]">
        <h2 className="text-xl font-light tracking-tight flex items-center space-x-2 text-neutral-900 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-[#E5E5E5]"></span>
          <span>Customer Insight & LTV Engine</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
          Ulas segmentasi pasar sejati Anda, hitung taksiran nilai ekonomis jangka panjang pembeli, serta tanggulangi resiko Churn sebelum pembeli berpaling!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Segmentation Cards & Churn alerts */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-widest">Model Segmentasi Demografi Psikografis</span>
            <span className="text-xs text-neutral-400 font-mono">Berdasarkan data DNA: {dna.productName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segments.map((seg, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono text-neutral-800 dark:text-[#E5E5E5] bg-neutral-100 dark:bg-[#262626] px-2 py-0.5 rounded uppercase tracking-wider">
                      Segmentasi {seg.percentage}% Pasar
                    </span>
                    <button
                      onClick={() => deleteSegment(idx)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                  
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white mb-1">{seg.name}</h4>
                  <p className="text-[11px] text-neutral-500 dark:text-[#A3A3A3] mb-4">
                    Kanal Utama: <strong className="text-neutral-700 dark:text-neutral-300">{seg.channel}</strong>
                  </p>

                  <div className="grid grid-cols-2 gap-2 border-t pt-3 border-neutral-100 dark:border-[#262626] text-xs">
                    <div>
                      <span className="text-[9px] text-neutral-450 dark:text-[#737373] uppercase block">Rerata Transaksi</span>
                      <strong className="text-neutral-800 dark:text-neutral-200 font-mono">Rp {seg.avgTransaction.toLocaleString("id-ID")}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-neutral-450 dark:text-[#737373] uppercase block">Frekuensi Beli</span>
                      <strong className="text-neutral-800 dark:text-neutral-200">{seg.frequency}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-[#262626] flex items-center justify-between text-[11px]">
                  <span className="text-neutral-450 text-[10px] font-mono">Resiko Churn:</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono border uppercase tracking-wider ${getRiskBadgeColor(seg.risk)}`}>
                    {seg.risk} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Form to quick add a Customer profile segment */}
          <div className="p-5 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-white font-mono flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Petakan Segmen Pelanggan</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">Nama Segmen Pembeli *</label>
                <input
                  id="inp-seg-name"
                  type="text"
                  placeholder="misal: Anggota Komunitas Ibu Arisan"
                  value={segName}
                  onChange={e => setSegName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">Kanal Interaksi Utama</label>
                <input
                  id="inp-seg-channel"
                  type="text"
                  placeholder="Instagram, Telegram Group, dll"
                  value={segChannel}
                  onChange={e => setSegChannel(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">Estimasi Persentase %</label>
                <input
                  id="inp-seg-percent"
                  type="number"
                  placeholder="15"
                  value={segPercent}
                  onChange={e => setSegPercent(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">Rata-rata Belanja Per Transaksi (Rp)</label>
                <input
                  id="inp-seg-avgSpend"
                  type="number"
                  placeholder="399000"
                  value={segAvgSpend}
                  onChange={e => setSegAvgSpend(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">Resiko Churn</label>
                <select
                  id="inp-seg-risk"
                  value={segRisk}
                  onChange={e => setSegRisk(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 border rounded bg-transparent border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                >
                  <option value="Low" className="bg-white dark:bg-neutral-900 text-black dark:text-white">Low Risk (Pelanggan Setia)</option>
                  <option value="Medium" className="bg-white dark:bg-neutral-900 text-black dark:text-white">Medium Risk (Beli Kadangkala)</option>
                  <option value="High" className="bg-white dark:bg-neutral-900 text-black dark:text-white">High Risk (Beli Sekali Saja)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  id="btn-add-segment"
                  onClick={addNewSegment}
                  className="w-full py-2 px-4 rounded text-xs font-semibold bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black hover:bg-neutral-900 dark:hover:bg-white transition-colors"
                >
                  Tambahkan Segmen
                </button>
              </div>
            </div>
          </div>

          {/* CRM Action Matrix Recommendation block */}
          <div className="p-5 rounded border bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626] text-neutral-800 dark:text-white space-y-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-950 dark:text-white font-mono flex items-center space-x-1.5 border-b pb-2 border-neutral-200 dark:border-[#262626]">
              <HeartCrack className="w-3.5 h-3.5 text-neutral-500" />
              <span>CRM COUNTER-CHURN CAMPAIGN RULES</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded border border-neutral-201 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] space-y-1">
                <strong className="text-neutral-900 dark:text-white block font-bold font-mono text-[10px]">1. PENYELAMATAN SEGMEN HIGH-RISK (E.G. RESELLER)</strong>
                <p className="text-neutral-500 dark:text-[#A3A3A3] leading-relaxed text-[11px]">
                  Mereka sensitif pada margin harga. Berikan kupon diskon volume instan flat-rate senilai <strong>15%</strong> jika tidak bertransaksi dalam 45 hari untuk menahan mereka dari kompetitor sebelah.
                </p>
              </div>
              <div className="p-3.5 rounded border border-neutral-201 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] space-y-1">
                <strong className="text-neutral-900 dark:text-white block font-bold font-mono text-[10px]">2. PENGIKATAN SEGMEN LOW-RISK (E.G. IBU MUDA MODIS)</strong>
                <p className="text-neutral-500 dark:text-[#A3A3A3] leading-relaxed text-[11px]">
                  Berikan tawaran unboxing experience premium gratis cetak foto kartu ucapan personal, poin voucher loyalty bulanan, dan prarilis/preorder eksklusif model butik terbaru.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: SME Lifetime Value calculator */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="p-6 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-6">
            <div className="flex items-center space-x-2 border-b pb-3 border-neutral-200 dark:border-[#262626]">
              <div className="p-2 rounded bg-neutral-100 dark:bg-[#262626] text-neutral-850 dark:text-neutral-200">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-neutral-900 dark:text-white">Kalkulator LTV Pelanggan</h3>
                <p className="text-[10px] text-neutral-400">Ketahui nilai sejati aset customer Anda.</p>
              </div>
            </div>

            {/* Input Slider 1: Average Order Value */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-500 font-semibold">Average Order Value (AOV)</span>
                <span className="text-neutral-900 dark:text-white font-bold">Rp {aov.toLocaleString("id-ID")}</span>
              </div>
              <input
                id="slide-ltv-aov"
                type="range"
                min={50000}
                max={1500000}
                step={25000}
                value={aov}
                onChange={e => setAov(Number(e.target.value))}
                className="w-full accent-neutral-950 dark:accent-white cursor-pointer"
              />
              <p className="text-[9px] text-neutral-400 leading-none">Rata-rata nominal pengeluaran sekali belanja seorang pembeli.</p>
            </div>

            {/* Input Slider 2: Purchase Frequency */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-500 font-semibold">Frekuensi Pembelian</span>
                <span className="text-neutral-900 dark:text-white font-bold">{frequency}x / bulan</span>
              </div>
              <input
                id="slide-ltv-freq"
                type="range"
                min={1}
                max={10}
                step={1}
                value={frequency}
                onChange={e => setFrequency(Number(e.target.value))}
                className="w-full accent-neutral-950 dark:accent-white cursor-pointer"
              />
              <p className="text-[9px] text-neutral-400 leading-none">Berapa kali pelanggan yang sama membeli dari toko Anda dalam sebulan.</p>
            </div>

            {/* Input Slider 3: Lifespan */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-500 font-semibold">Masa Hubungan (Lifespan)</span>
                <span className="text-neutral-900 dark:text-white font-bold">{lifespan} bulan</span>
              </div>
              <input
                id="slide-ltv-lifespan"
                type="range"
                min={1}
                max={36}
                step={1}
                value={lifespan}
                onChange={e => setLifespan(Number(e.target.value))}
                className="w-full accent-neutral-950 dark:accent-white cursor-pointer"
              />
              <p className="text-[9px] text-neutral-400 leading-none">Keawetan hubungan sebelum pelanggan churn / berhenti total membeli.</p>
            </div>

            {/* Result Area */}
            <div className="p-4 rounded bg-[#111111] dark:bg-[#171717] border border-[#262626] text-center space-y-1.5">
              <span className="text-[9px] font-mono uppercase text-neutral-450 tracking-wider">TOTAL ESTIMATED LTV</span>
              <p className="text-lg sm:text-xl font-bold font-mono text-white dark:text-[#E5E5E5]">
                Rp {ltvResult.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-neutral-400 leading-normal px-2">
                Setiap 1 (Satu) pembeli yang didatangkan bernilai ekonomis kotor sebesar ini bagi bisnis Anda selama masa retensinya!
              </p>
            </div>

            <div className="text-[10px] text-neutral-450 leading-normal p-3 rounded border border-dashed border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] text-center">
              💡 <strong className="font-semibold text-neutral-950 dark:text-white font-mono">Matematika Bisnis:</strong> Jika LTV Anda adalah <strong>Rp {(ltvResult/1000).toFixed(0)}rb</strong>, Anda boleh beriklan aman (Customer Acquisition Cost / CAC) hingga <strong>Rp {(ltvResult*0.25/1000).toFixed(0)}rb</strong> per pembeli baru agar tetap untung optimal (Aturan CAC &lt; 1/3 LTV).
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
