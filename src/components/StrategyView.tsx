/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RecommendationStrategy, BlueprintRow } from '../types';
import { apiFetch } from '../api';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  TrendingUp,
  Sliders,
  PieChart as PieIcon,
  HelpCircle,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Smartphone,
  Info,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Database,
  Play,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface StrategyViewProps {
  strategy: RecommendationStrategy;
  setStrategy: React.Dispatch<React.SetStateAction<RecommendationStrategy>>;
  addToast: (msg: string, type: 'success' | 'error' | 'warning') => void;
  onPushToCrm: () => void;
}

export default function StrategyView({
  strategy,
  setStrategy,
  addToast,
  onPushToCrm
}: StrategyViewProps) {
  // Wizard states
  const [wizardStep, setWizardStep] = useState<number>(0); // 0 = Results Dashboard, 1 = Step 1, 2 = Step 2, 3 = Step 3, 4 = Step 4
  const [isWizardsGenerating, setIsWizardsGenerating] = useState(false);

  // Buffer states for the wizard form
  const [bizName, setBizName] = useState(strategy.businessName);
  const [bizIndustry, setBizIndustry] = useState(strategy.industry);
  const [bizPainPoints, setBizPainPoints] = useState<string[]>(strategy.painPoints);
  const [customPainPoint, setCustomPainPoint] = useState('');
  const [budgetVal, setBudgetVal] = useState(strategy.budget);
  const [timelineVal, setTimelineVal] = useState(strategy.timeline);

  // Funnel steps inside the wizard configuration
  const [funnelSteps, setFunnelSteps] = useState(strategy.funnelSteps);

  // Active Strategy Results active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'blueprint' | 'budget'>('blueprint');
  // AI reasoning side drawer
  const [aiExplainVisible, setAiExplainVisible] = useState(false);

  // Custom expanded detail state for blueprint rows table
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRowExpand = (idx: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handlePainPointToggle = (point: string) => {
    if (bizPainPoints.includes(point)) {
      setBizPainPoints(bizPainPoints.filter((p) => p !== point));
    } else {
      setBizPainPoints([...bizPainPoints, point]);
    }
  };

  const addCustomPainPoint = () => {
    if (customPainPoint.trim() && !bizPainPoints.includes(customPainPoint.trim())) {
      setBizPainPoints([...bizPainPoints, customPainPoint.trim()]);
      setCustomPainPoint('');
      addToast('Kendala kustom ditambahkan!', 'success');
    }
  };

  const toggleFunnelStep = (id: string) => {
    setFunnelSteps(
      funnelSteps.map((step) =>
        step.id === id ? { ...step, active: !step.active } : step
      )
    );
  };

  // Submit the Wizard Form and call Backend GPT generator
  const runStrategyWizard = async () => {
    setIsWizardsGenerating(true);
    addToast('Menganalisis profil bisnis & kendala korporat...', 'success');

    try {
      const response = await apiFetch('/api/generate-strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName: bizName,
          industry: bizIndustry,
          painPoints: bizPainPoints,
          budget: budgetVal,
          timeline: timelineVal
        })
      });

      const data = await response.json();

      setTimeout(() => {
        setIsWizardsGenerating(false);
        setStrategy({
          id: data.id || `strat_${Date.now()}`,
          businessName: bizName,
          industry: bizIndustry,
          painPoints: bizPainPoints,
          funnelSteps: funnelSteps,
          budget: budgetVal,
          timeline: timelineVal,
          blueprint: data.blueprint,
          budgetAllocation: data.budgetAllocation,
          aiReasoning: data.aiReasoning,
          createdAt: new Date().toLocaleDateString('id-ID')
        });
        setWizardStep(0); // Exit wizard and show results
        addToast('Strategi Blueprint AI sukses dirumuskan!', 'success');
      }, 3500);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setIsWizardsGenerating(false);
        addToast('Koneksi server terhambat. Menggunakan cadangan simulator.', 'warning');
        setWizardStep(0);
      }, 3000);
    }
  };

  // Budget Allocation live sliders handler
  const handleBudgetSliderChange = (idx: number, newVal: number) => {
    const updated = [...strategy.budgetAllocation];
    updated[idx].value = newVal;

    // Optional: Normalize elements to sum exactly 100
    const totalOthers = updated
      .filter((_, i) => i !== idx)
      .reduce((acc, curr) => acc + curr.value, 0);

    const diff = 100 - (totalOthers + newVal);

    if (totalOthers > 0 && diff !== 0) {
      // Pro-rate adjust elements
      updated.forEach((el, i) => {
        if (i !== idx) {
          const shareOfOthers = el.value / totalOthers;
          el.value = Math.max(0, Math.round(el.value + diff * shareOfOthers));
        }
      });
    }

    setStrategy({
      ...strategy,
      budgetAllocation: updated
    });
  };

  return (
    <div className="space-y-6">
      {/* Upper context action elements */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-150 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Strategy – Recommendation Engine AI
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Petakan corong sales funnel dan rumuskan alokasi dana periklanan taktis dalam sekejap.
          </p>
        </div>

        {wizardStep === 0 && (
          <button
            onClick={() => {
              setWizardStep(1); // Start Wizard
              // Prefill options
              setBizName(strategy.businessName);
              setBizIndustry(strategy.industry);
              setBizPainPoints(strategy.painPoints);
              setFunnelSteps(strategy.funnelSteps);
            }}
            className="px-4 py-2 bg-[#0A3D62] hover:bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Compass size={14} className="animate-spin" />
            Luncurkan Ulang Wizard Baru
          </button>
        )}
      </div>

      {/* 4-STEP WIZARD OVERLAY PANEL */}
      {wizardStep > 0 && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-lg space-y-6 max-w-2xl mx-auto">
          {/* Header step progress */}
          <div className="flex items-center justify-between border-b pb-3 border-slate-150 dark:border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">
              WIZARD STRATEGI : LANGKAH {wizardStep} DARI 4
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    step <= wizardStep ? 'bg-[#00A3E0]' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: BUSINESS LOGISTICS */}
          {wizardStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Langkah 1: Tulis Detail Bisnis / Profil Utama Anda
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Nama Merek/Usaha</label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="Contoh: Mentari Busana"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-705 text-slate-850 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Sektor Industri Utama</label>
                  <select
                    value={bizIndustry}
                    onChange={(e) => setBizIndustry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-705 text-slate-850 dark:text-white focus:outline-none"
                  >
                    <option>Fashion / Retail Muslimah</option>
                    <option>SaaS / Solusi Perangkat Lunak</option>
                    <option>Makanan / Kafe Kuliner (F&B)</option>
                    <option>Jasa Profesional / Agensi Kreatif</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PAIN POINTS CHOOSER */}
          {wizardStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Langkah 2: Pilih Kendala Terbesar Penjualan Saat Ini
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Konversi iklan Instagram rendah',
                  'Biaya perolehan pelanggan (CAC) mahal',
                  'Admin kewalahan follow up',
                  'Kompetitor banting harga tinggi',
                  'Rasio Churn pelanggan tinggi',
                  'Database prospek kosong'
                ].map((point) => {
                  const isChecked = bizPainPoints.includes(point);
                  return (
                    <button
                      key={point}
                      onClick={() => handlePainPointToggle(point)}
                      className={`p-3 text-left rounded-lg text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#0A3D62] bg-[#0A3D62]/10 text-[#0A3D62]'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-[#0A3D62] text-white border-[#0A3D62]' : 'border-slate-300'}`}>
                        {isChecked && <Check size={10} />}
                      </div>
                      <span>{point}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add custom parameter free text */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-500 block">Ada kendala lain?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPainPoint}
                    onChange={(e) => setCustomPainPoint(e.target.value)}
                    placeholder="Contoh: Logistik pengiriman luar pulau lambat"
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-705 text-slate-850 dark:text-white focus:outline-none"
                  />
                  <button
                    onClick={addCustomPainPoint}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CURRENT FUNNEL DIAGRAM INTERACTIVE VISUALIZER */}
          {wizardStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Langkah 3: Atur Bagan Alir Funnel Pemasaran Digital
              </h3>

              <p className="text-xs text-slate-500 leading-normal">
                Ketuk node untuk mengaktifkan/menonaktifkan corong operasional Anda dalam bagan alir berikut. Model AI akan menyesuaikan parameter bujet berdasarkan ini.
              </p>

              {/* Visual Flowchart Display Canvas */}
              <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4 py-8 select-none">
                {funnelSteps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <button
                      onClick={() => toggleFunnelStep(step.id)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center min-w-[110px] ${
                        step.active
                          ? 'border-[#00a3e0] bg-white dark:bg-slate-850 ring-2 ring-cyan-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-100/30 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-400">Step {index+1}</span>
                      <span className={`text-[11px] font-bold mt-1 ${step.active ? 'text-slate-850 dark:text-slate-200' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-400 mt-1 line-clamp-1">
                        {step.active ? 'Aktif' : 'Non-aktif'}
                      </span>
                    </button>
                    {index < funnelSteps.length - 1 && (
                      <ArrowRight size={14} className="text-slate-350 shrink-0 hidden sm:block rotate-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET & RANGE */}
          {wizardStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Langkah 4: Tetapkan Rencana Anggaran & Masa Kampanye
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Anggaran Pemasaran Total</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono">Rp {budgetVal.toLocaleString('id-ID')}</span>
                  </div>
                  <input
                    type="range"
                    min={2000000}
                    max={100005010}
                    step={1000000}
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(Number(e.target.value))}
                    className="w-full h-2 rounded bg-slate-100 dark:bg-slate-800 accent-[#00A3E0]"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
                    <span>Rp 2.000.000</span>
                    <span>Rp 50.000.000</span>
                    <span>Rp 100.000.000</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 block">Jangka Waktu Kontrak</label>
                  <select
                    value={timelineVal}
                    onChange={(e) => setTimelineVal(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-705 text-slate-850 dark:text-white"
                  >
                    <option>1 Bulan</option>
                    <option>3 Bulan (Direkomendasikan)</option>
                    <option>6 Bulan</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* BACK AND NEXT BUTTON CONTROLS */}
          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              onClick={() => setWizardStep(wizardStep - 1)}
              className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-755 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={13} /> Kembali
            </button>

            {wizardStep < 4 ? (
              <button
                onClick={() => setWizardStep(wizardStep + 1)}
                className="px-4 py-2 bg-[#00A3E0] hover:bg-[#0092c8] text-white text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                Selanjutnya <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={runStrategyWizard}
                disabled={isWizardsGenerating}
                className="px-5 py-2 bg-[#0A3D62] hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                {isWizardsGenerating ? 'Processing...' : 'Rumuskan Formula AI 🚀'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* STRATEGY RESULTS DASHBOARD COCKPIT */}
      {wizardStep === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel metrics blueprint */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Nav Headers tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <button
                onClick={() => setActiveSubTab('blueprint')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  activeSubTab === 'blueprint'
                    ? 'border-[#0a3d62] text-[#0A3D62] dark:text-cyan-400 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-500 hover:bg-slate-50/40'
                }`}
              >
                💼 Blueprint Kampanye
              </button>
              <button
                onClick={() => setActiveSubTab('budget')}
                className={`flex-1 py-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                  activeSubTab === 'budget'
                    ? 'border-[#0a3d62] text-[#0A3D62] dark:text-cyan-400 bg-white dark:bg-slate-850'
                    : 'border-transparent text-slate-500 hover:bg-slate-50/40'
                }`}
              >
                📊 Alokasi Bujet Iklan
              </button>
            </div>

            {/* Sub-Tab Content: Campaign Blueprint expanding Table */}
            {activeSubTab === 'blueprint' && (
              <div className="p-4 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-semibold text-slate-500">
                    Blueprint Merek: <b className="text-slate-700 dark:text-stone-200">{strategy.businessName} ({strategy.industry})</b>
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onPushToCrm();
                        addToast('Koneksi kampanye sukses dievaluasi ke CRM!', 'success');
                      }}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-100 dark:border-emerald-800 rounded text-[10px] font-bold cursor-pointer hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <Database size={11} /> Push to CRM
                    </button>
                    <button
                      onClick={() => alert('Simulasi Ekspor PDF: File Mentari-Busana-Blueprint.pdf berhasil diunduh.')}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold cursor-pointer hover:bg-slate-200 flex items-center gap-1"
                    >
                      <Download size={11} /> PDF
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-110 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-805 text-slate-500 font-bold">
                        <th className="p-3">Kanal Iklan</th>
                        <th className="p-3">Pesan Utama (Ad Copy)</th>
                        <th className="p-3">Target Audiens</th>
                        <th className="p-3">Utama KPI</th>
                        <th className="p-3 text-center">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {strategy.blueprint.map((row, idx) => {
                        const isExpanded = !!expandedRows[idx];
                        return (
                          <React.Fragment key={idx}>
                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all font-medium">
                              <td className="p-3 font-bold text-slate-800 dark:text-white max-w-[130px] truncate">
                                {row.channel}
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                                "{row.message}"
                              </td>
                              <td className="p-3 text-slate-500 line-clamp-2 mt-2">
                                {row.targetAudience}
                              </td>
                              <td className="p-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                {row.kpi}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => toggleRowExpand(idx)}
                                  className="p-1 rounded bg-slate-100 hover:bg-[#0A3D62] hover:text-white text-slate-500 border cursor-pointer"
                                >
                                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-50/60 dark:bg-slate-900/10">
                                <td colSpan={5} className="p-4 text-xs space-y-2">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <span className="font-mono font-extrabold text-[#0D5F8F] block uppercase text-[10px]">
                                        Tactical Operation Action
                                      </span>
                                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                                        {row.details || "Menyusun skrip iklan andalan serta ulasan rating bintang 5."}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="font-mono font-extrabold text-amber-600 block uppercase text-[10px]">
                                        Tindakan CTA / Call to Action
                                      </span>
                                      <span className="px-2.5 py-1 text-[10px] bg-amber-500 text-slate-950 font-extrabold rounded-md shadow inline-block">
                                        {row.cta}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub-Tab Content: Budget Slider & Pie charts */}
            {activeSubTab === 'budget' && (
              <div className="p-5 space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Interactive Sliders */}
                  <div className="md:col-span-6 space-y-4">
                    <h4 className="text-xs font-mono font-bold uppercase text-slate-400">
                      Sesuaikan Persen Alokasi ( sliders )
                    </h4>

                    <div className="space-y-4">
                      {strategy.budgetAllocation.map((item, idx) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-700 dark:text-stone-300 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </span>
                            <span className="font-mono text-[#0A3D62] dark:text-cyan-400">{item.value}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={item.value}
                            onChange={(e) => handleBudgetSliderChange(idx, Number(e.target.value))}
                            className="w-full h-1.5 rounded bg-slate-100 accent-[#0A3D62]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right pie chart figure using Recharts */}
                  <div className="md:col-span-6 flex flex-col items-center justify-center min-h-[220px]">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={strategy.budgetAllocation}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {strategy.budgetAllocation.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center text-[10px] font-bold text-slate-500 mt-2">
                        {strategy.budgetAllocation.map((entry) => (
                          <span key={entry.name} className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name} ({entry.value}%)
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel informational reasoning bar */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-[#0A3D62] text-white p-5 rounded-2xl relative shadow-md">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest block">
                  AI STRATEGIC REASONING
                </span>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Analisis Rationale
                </h3>
              </div>
              <button
                onClick={() => setAiExplainVisible(true)}
                className="p-1 px-1.5 rounded-md hover:bg-white/10 text-cyan-300 border border-cyan-400/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Info size={11} /> AI-Explain
              </button>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium mt-4 bg-white/5 p-4 rounded-xl border border-white/5">
              {strategy.aiReasoning}
            </p>

            <div className="mt-6 p-4 rounded-xl bg-[#00A3E0]/10 border border-[#00A3E0]/20 text-xs space-y-2">
              <span className="font-bold flex items-center gap-1.5 text-cyan-300">
                <Smartphone size={14} /> Solusi Integrasi Terbuka
              </span>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Kombinasi Meta-Ads dengan Automasi Whatsapp memastikan waktu tunggu (lead response time) di bawah 3 menit, memotong kebocoran anggaran hingga 35%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED SIDE DRAWER EXPLANATORY (AI EXPLAIN CHATBOT) */}
      {aiExplainVisible && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-6 flex flex-col justify-between animate-slideIn">
          <div className="space-y-6 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0A3D62] flex items-center justify-center text-white">
                  <Info size={14} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white">AI-Explain Advisor Desk</h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase">Interactive Strategic Rationale</span>
                </div>
              </div>
              <button
                onClick={() => setAiExplainVisible(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X font-bold size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold leading-relaxed">
              <h4 className="text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#00A3E0]" /> Kenapa alokasi periklanan sosial post berbobot 45%?
              </h4>
              <p className="text-slate-500 dark:text-slate-400 font-medium ml-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded">
                Untuk target market {strategy.industry}, elemen keputusan pembelian 70% ditentukan oleh unboxing video serta transisi pakaian. Facebook & Instagram Ads memiliki ROAS 3x lipat dibanding platform visual statis lainnya.
              </p>

              <h4 className="text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#00A3E0]" /> Bagaimana WA Automasi membantu mengurangi Churn?
              </h4>
              <p className="text-slate-500 dark:text-slate-400 font-medium ml-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded">
                Bila prospek warmth tidak segera direspons dalam 5 menit pertama, ketertarikan mereka berkurang hingga 80%. Pesan prapendaftaran otomatis menghidupkan percakapan interaktif seketika di WhatsApp mereka.
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <button
              onClick={() => setAiExplainVisible(false)}
              className="w-full py-2.5 bg-[#0A3D62] text-white hover:bg-slate-900 text-xs font-bold rounded-lg text-center cursor-pointer"
            >
              Kembali ke Blueprint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal missing component help
function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
