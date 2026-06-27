import React from "react";
import { CustomerSegment, BusinessCanvasData } from "../types";
import { API_BASE } from "../api";
import { Users, HeartCrack, Plus, Award, Loader2, Coins, Cpu, CheckCircle2, AlertTriangle, TrendingUp, Lightbulb, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "motion/react";

interface CustomerInsightProps {
  dna: BusinessCanvasData;
  segments: CustomerSegment[];
  setSegments: (list: CustomerSegment[]) => void;
}

interface AISegmentInsight {
  name: string;
  estimatedLtv: string;
  churnRisk: string;
  recommendation: string;
}

interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  segments: AISegmentInsight[];
}

interface RevenuePrediction {
  name: string;
  monthlyRevenue: number;
  annualRevenue: number;
  growthPotential: string;
  action: string;
}

interface CustomerCluster {
  name: string;
  description: string;
  percentage: number;
  channel: string;
  strategy: string;
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

  // AI analysis states
  const [aiAnalysis, setAiAnalysis] = React.useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);

  // Revenue prediction states
  const [revenuePredictions, setRevenuePredictions] = React.useState<RevenuePrediction[] | null>(null);
  const [revenueLoading, setRevenueLoading] = React.useState(false);
  const [totalMonthlyRevenue, setTotalMonthlyRevenue] = React.useState(0);

  // Customer clustering states
  const [clusters, setClusters] = React.useState<CustomerCluster[] | null>(null);
  const [clusterLoading, setClusterLoading] = React.useState(false);

  const ltvResult = aov * frequency * lifespan;

  // Clear AI error when segments change
  React.useEffect(() => {
    setAiError(null);
  }, [segments]);

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

  const fetchAIAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch(`${API_BASE}/api/analyze-segments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna, segments })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Server error (${response.status})`);
      }
      const data = await response.json();
      if (data.insights) {
        setAiAnalysis(data.insights);
      } else {
        throw new Error("Format respons AI tidak valid.");
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Gagal menghubungi AI. Coba lagi nanti.");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchAutoSegment = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch(`${API_BASE}/api/auto-segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna })
      });
      const data = await response.json();
      if (data.segments) {
        setSegments(data.segments);
      }
    } catch (err: any) {
      setAiError(err.message || "Gagal generate segmentasi.");
    } finally {
      setAiLoading(false);
    }
  };

  const fetchRevenuePrediction = async () => {
    setRevenueLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/predict-revenue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna, segments })
      });
      const data = await response.json();
      if (data.predictions) {
        setRevenuePredictions(data.predictions);
        setTotalMonthlyRevenue(data.totalMonthly || 0);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setRevenueLoading(false);
    }
  };

  const fetchClusters = async () => {
    setClusterLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/cluster-customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dna, segments })
      });
      const data = await response.json();
      if (data.clusters) {
        setClusters(data.clusters);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setClusterLoading(false);
    }
  };

  // Helper: parse estimatedLtv string like "Rp8,400,000/tahun" or "Rp36.000.000" to number
  const parseLTV = (val: string): number => {
    const cleaned = val.replace(/[^0-9]/g, "");
    return Number(cleaned) || 0;
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

        </div>

        {/* Right column: LTV Calculator */}
        <div className="lg:col-span-1 space-y-6">

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

      {/* AI Intelligence — full width section */}
      <div className="space-y-4">
        <div className="p-4 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100 dark:border-[#262626]">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-neutral-400" />
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-neutral-800 dark:text-white">AI Intelligence Tools</span>
            </div>
            {aiError && <span className="text-[9px] text-red-500">{aiError}</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button onClick={fetchAIAnalysis} disabled={aiLoading || segments.length === 0} className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#262626] transition-colors disabled:opacity-40 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Lightbulb className="w-3 h-3 text-amber-500" />}
              <span>Analisis Segmen</span>
            </button>
            <button onClick={fetchAutoSegment} disabled={aiLoading} className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#262626] transition-colors disabled:opacity-40 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
              {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Users className="w-3 h-3 text-emerald-500" />}
              <span>Auto-Segment</span>
            </button>
            <button onClick={fetchRevenuePrediction} disabled={revenueLoading || segments.length === 0} className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#262626] transition-colors disabled:opacity-40 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
              {revenueLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <BarChart3 className="w-3 h-3 text-blue-500" />}
              <span>Prediksi Revenue</span>
            </button>
            <button onClick={fetchClusters} disabled={clusterLoading || segments.length === 0} className="flex items-center justify-center space-x-1.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#262626] transition-colors disabled:opacity-40 text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">
              {clusterLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Award className="w-3 h-3 text-purple-500" />}
              <span>Cluster Pelanggan</span>
            </button>
          </div>
        </div>

        {(aiAnalysis || revenuePredictions || clusters) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {aiAnalysis && (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
                <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-neutral-100 dark:border-[#262626]">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-800 dark:text-white">Analisis Segmentasi</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">{aiAnalysis.summary}</p>
                <div className="space-y-2">
                  {aiAnalysis.segments.map((seg, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-[#262626]">
                      <span className="text-[11px] font-semibold text-neutral-800 dark:text-white">{seg.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-mono">LTV: {seg.estimatedLtv}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${seg.churnRisk === "High" ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" : seg.churnRisk === "Medium" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"}`}>{seg.churnRisk}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {aiAnalysis.recommendations[0] && <p className="mt-3 pt-2 border-t border-neutral-100 dark:border-[#262626] text-[10px] text-neutral-500">💡 {aiAnalysis.recommendations[0]}</p>}
              </div>
            )}

            {revenuePredictions && (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-100 dark:border-[#262626]">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-800 dark:text-white">Prediksi Revenue</span>
                  </div>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Rp {totalMonthlyRevenue.toLocaleString("id-ID")}/bln</span>
                </div>
                <div className="space-y-2">
                  {revenuePredictions.map((pred, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A] border border-neutral-100 dark:border-[#262626]">
                      <span className="text-[11px] font-semibold text-neutral-800 dark:text-white">{pred.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-neutral-500 font-mono">Rp {pred.monthlyRevenue.toLocaleString("id-ID")}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${pred.growthPotential === "Tinggi" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : pred.growthPotential === "Sedang" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"}`}>{pred.growthPotential}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clusters && (
              <div className="p-4 rounded-lg border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] lg:col-span-2">
                <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-neutral-100 dark:border-[#262626]">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-neutral-800 dark:text-white">Customer Clustering</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {clusters.map((cluster, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-100 dark:border-purple-800/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-neutral-900 dark:text-white">{cluster.name}</span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">{cluster.percentage}%</span>
                      </div>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-snug mb-1.5">{cluster.description}</p>
                      <p className="text-[9px] text-purple-600 dark:text-purple-400">💡 {cluster.strategy}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
