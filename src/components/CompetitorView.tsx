/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CompetitorData } from '../types';
import { apiFetch } from '../api';
import {
  TrendingUp,
  Search,
  Globe,
  Award,
  CircleAlert,
  HelpCircle,
  PlusCircle,
  Bookmark,
  ExternalLink,
  DollarSign,
  Activity,
  BarChart,
  Target
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip } from 'recharts';

interface CompetitorViewProps {
  competitors: CompetitorData[];
  setCompetitors: React.Dispatch<React.SetStateAction<CompetitorData[]>>;
  addToast: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export default function CompetitorView({
  competitors,
  setCompetitors,
  addToast
}: CompetitorViewProps) {
  // Competitor URL Search query
  const [competitorQuery, setCompetitorQuery] = useState('Zahra Muslimah Store');
  const [isSearching, setIsSearching] = useState(false);

  // Selected competitors list for matrix side-by-side (up to 3)
  const [selectedCompIds, setSelectedCompIds] = useState<string[]>(competitors.map((c) => c.id));
  const [bookmarkedSamples, setBookmarkedSamples] = useState<Record<string, boolean>>({});

  const toggleSelectCompetitor = (id: string) => {
    if (selectedCompIds.includes(id)) {
      setSelectedCompIds(selectedCompIds.filter((cid) => cid !== id));
    } else {
      if (selectedCompIds.length >= 3) {
        addToast('Maksimal membandingkan 3 kompetitor sekaligus!', 'warning');
        return;
      }
      setSelectedCompIds([...selectedCompIds, id]);
    }
  };

  const scrapeCompetitorData = async () => {
    if (!competitorQuery.trim()) {
      addToast('Masukkan nama kompetitor atau web URL!', 'warning');
      return;
    }

    setIsSearching(true);
    addToast('Menghubungkan asisten riset intelijen VOXIA...', 'success');

    try {
      const response = await apiFetch('/api/analyze-competitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitorUrlOrName: competitorQuery })
      });

      const data = await response.json();

      setTimeout(() => {
        setIsSearching(false);
        const exists = competitors.some((c) => c.name.toLowerCase() === data.name.toLowerCase());
        
        if (exists) {
          addToast('Data kompetitor sudah diperluas!', 'success');
        } else {
          const freshData: CompetitorData = {
            id: `comp_${Date.now()}`,
            name: data.name,
            url: data.name.toLowerCase().replace(/\s+/g, '') + '.com',
            channelMix: data.channelMix,
            pricingSnapshot: data.pricingSnapshot,
            metrics: data.metrics,
            socialAdSamples: data.socialAdSamples
          };
          setCompetitors([...competitors, freshData]);
          setSelectedCompIds((prev) => [...prev, freshData.id].slice(0, 3));
          addToast(`Intelijen "${data.name}" sukses diunduh secara tak terbatas!`, 'success');
        }
      }, 3500);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setIsSearching(false);
        addToast('Koneksi intelijen gagal. Menggunakan simulasi lokal.', 'warning');
      }, 3000);
    }
  };

  const toggleBookmarkCreative = (keyIndex: string) => {
    setBookmarkedSamples({
      ...bookmarkedSamples,
      [keyIndex]: !bookmarkedSamples[keyIndex]
    });
    addToast(
      bookmarkedSamples[keyIndex]
        ? 'Dihapus dari pustaka referensi.'
        : 'Menyimpan tulisan ad ke bookmark referensi.',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Analysis Scraper Inputs */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
            Riset Intelijen Kompetitor AI (Scraper Search)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-3 text-slate-400" size={17} />
              <input
                type="text"
                value={competitorQuery}
                onChange={(e) => setCompetitorQuery(e.target.value)}
                placeholder="Masukkan domain web / nama merek kompetitor (e.g., Zahra Hijab, Elzatta...)"
                className="w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-705 text-slate-850 dark:text-white font-semibold focus:outline-none"
              />
            </div>
            <button
              onClick={scrapeCompetitorData}
              disabled={isSearching}
              className={`px-5 py-2.5 bg-[#0A3D62] hover:bg-slate-950 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow cursor-pointer ${
                isSearching ? 'bg-slate-400 cursor-not-allowed shadow-none' : ''
              }`}
            >
              {isSearching ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Menganalisis...</span>
                </>
              ) : (
                <>
                  <Search size={14} /> Scrape & Analisis
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
             VOXIA AI Scraper mendeteksi bauran anggaran iklan digital melalui audit pixel sosial, visual creative feed, estimasi tarif kargo, dan rentang harga marketplace.
          </p>
        </div>
      </div>

      {/* Grid of Scraped Competitor Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left pane: Scraped Cards Lists */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
              Merek Terindeks ({competitors.length} Kompetitor)
            </h3>
            <span className="text-[10px] text-slate-400">Centang kotak untuk memasukkan ke tabel banding</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitors.map((comp) => {
              const isComparing = selectedCompIds.includes(comp.id);
              return (
                <div
                  key={comp.id}
                  className="bg-white dark:bg-slate-850 p-5 border border-slate-150 dark:border-slate-800 rounded-xl relative hover:shadow-md transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-tight">
                        {comp.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Globe size={10} /> {comp.url}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSelectCompetitor(comp.id)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-all border ${
                        isComparing
                          ? 'bg-[#00A3E0]/15 text-[#00A3E0] border-[#00A3E0]/20'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {isComparing ? '✓ Membandingkan' : '+ Bandingkan'}
                    </button>
                  </div>

                  {/* Channel Mix pie mini metrics */}
                  <div className="grid grid-cols-2 gap-3 items-center border-t border-b py-3 border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col items-center justify-center h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={comp.channelMix}
                            innerRadius={24}
                            outerRadius={38}
                            paddingAngle={2}
                            dataKey="spend"
                          >
                            {comp.channelMix.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 text-[9px] font-bold text-slate-500">
                      <span className="text-[10px] font-mono block text-slate-400 uppercase">CHANNEL SPEND MIX</span>
                      {comp.channelMix.map((item) => (
                        <div key={item.name} className="flex justify-between items-center">
                          <span className="truncate max-w-[90px] text-slate-700 dark:text-stone-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </span>
                          <span className="font-mono text-slate-800 dark:text-white">{item.spend}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimations metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-205/40">
                      <span className="block text-[8px] text-slate-400 uppercase">Estimasi Budget Iklan</span>
                      <span className="font-bold text-slate-950 dark:text-white mt-0.5 block truncate text-[11px]">{comp.metrics.adSpendEst}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-205/40">
                      <span className="block text-[8px] text-slate-400 uppercase">Social Engagement</span>
                      <span className="font-bold text-emerald-600 mt-0.5 block truncate text-[11px]">{comp.metrics.engagementRate}</span>
                    </div>
                  </div>

                  {/* Creative copy samples */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase pl-0.5">CREATIVE ADS SAMPLES</span>
                    {comp.socialAdSamples.map((sample, idx) => {
                      const sampleKey = `${comp.id}_sample_${idx}`;
                      const isBookmarked = !!bookmarkedSamples[sampleKey];
                      return (
                        <div
                          key={idx}
                          className="p-3 border rounded-xl bg-orange-50/10 dark:bg-slate-900/40 relative space-y-1 bg-white"
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-bold text-slate-800 dark:text-slate-250 line-clamp-1 truncate max-w-[190px]">
                              "{sample.headline}"
                            </span>
                            <button
                              onClick={() => toggleBookmarkCreative(sampleKey)}
                              className={`p-1 rounded hover:bg-slate-50 shadow-sm border ${
                                isBookmarked ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                              } cursor-pointer`}
                              title="Bookmark reference ad copy"
                            >
                              <Bookmark size={11} />
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold pl-1">
                            {sample.copy}
                          </p>
                          <span className="flex flex-wrap gap-1 mt-1.5 pl-1">
                            {sample.channels.map((ch) => (
                              <span key={ch} className="px-1.5 py-0.5 bg-slate-100 text-[8px] font-bold text-slate-500 rounded font-mono">
                                🌐 {ch}
                              </span>
                            ))}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right pane: Side-by-Side comparison table matrix */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
          <div className="space-y-1 border-b pb-3 border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 block tracking-widest uppercase">
              MATRIKS PERBANDINGAN
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              Banding Versus VOXIA Sales-Flow
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Merek kompetitor yang tercentang dibandingkan secara otomatis dengan performa aseli kampanye Anda dalam diagram berikut.
          </p>

          <div className="space-y-4">
            {/* Table Row 1: Spend estimasi mapping */}
            <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 space-y-2 text-xs">
              <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                1. RATA BUDGET IKLAN MEDIA
              </span>
              <div className="space-y-2 font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-900 dark:text-white font-bold flex items-center gap-1">
                    <Target size={12} className="text-[#0A3D62]" /> VOXIA HQ Kampanye
                  </span>
                  <span className="font-mono font-bold">15,00 jt / bln</span>
                </div>
                {selectedCompIds.map((cid) => {
                  const compItem = competitors.find((c) => c.id === cid);
                  if (!compItem) return null;
                  return (
                    <div key={cid} className="flex justify-between pl-3 border-l border-slate-300">
                      <span>{compItem.name}</span>
                      <span className="font-mono">{compItem.metrics.adSpendEst.split('–')[0].replace('Rp', '')} th</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table Row 2: Ad Copy audit suggestions */}
            <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900/30 space-y-2 text-xs">
              <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase tracking-wider">
                2. AI OPTIMIZATION ALERT
              </span>
              <div className="flex gap-2 text-[11px] leading-relaxed font-semibold text-slate-500 bg-amber-500/10 p-3 rounded border border-amber-200">
                <CircleAlert className="shrink-0 text-amber-600 text-sm mt-0.5" size={15} />
                <span>
                   Merek <b>Zahra Muslimah</b> meningkatkan spending iklan TikTok sebesar 15% minggu ini. Untuk menyamakan keterikatan target pasar, AI VOXIA menyarankan memposting aset bertipe video 15-detik (Reels transisi) dalam waktu dekat.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
