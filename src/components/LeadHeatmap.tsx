import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Flame, Clock, Users, ArrowRight, Sparkles, X, Phone, Mail, CheckCircle2, ShieldAlert } from 'lucide-react';

interface HeatmapCell {
  day: string;
  hour: string;
  value: number;
  responseTimeMin: number; // Avg sales response time in minutes
}

interface LeadHeatmapProps {
  theme?: 'light' | 'dark';
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const HOURS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

// Seed simulation data with specific weekday & office hour peak trends
const generateHeatmapData = (): HeatmapCell[] => {
  const data: HeatmapCell[] = [];
  DAYS.forEach((day) => {
    HOURS.forEach((hour) => {
      const hrInt = parseInt(hour.split(':')[0]);
      
      // Base value
      let val = Math.floor(Math.random() * 25) + 10;
      
      // Weekday vs Weekend multipliers
      const isWeekend = day === 'Sabtu' || day === 'Minggu';
      
      // Hourly peak factors (office morning peak around 10:00-12:00, and afternoon 16:00-18:00)
      if (hrInt >= 10 && hrInt <= 12) {
        val += isWeekend ? 20 : 55;
      } else if (hrInt >= 16 && hrInt <= 18) {
        val += isWeekend ? 15 : 45;
      } else if (hrInt >= 20) {
        val += isWeekend ? 30 : 15; // evening leisure peaks on weekends
      }
      
      // Add a bit of natural variation
      val = Math.max(5, Math.min(100, Math.round(val)));
      
      // Response time is inversely proportional to conversions (higher conversions = faster team response / focus)
      const responseTime = Math.max(4, Math.round(45 - (val * 0.35) + (Math.random() * 5)));
      
      data.push({
        day,
        hour,
        value: val,
        responseTimeMin: responseTime
      });
    });
  });
  return data;
};

export default function LeadHeatmap({ theme = 'dark' }: LeadHeatmapProps) {
  const isDark = theme === 'dark';
  const data = useMemo(() => generateHeatmapData(), []);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  // Maximum value for scaling intensities
  const maxValue = useMemo(() => d3.max(data, (d: HeatmapCell) => d.value) || 100, [data]);

  // Color scale defined using D3 linear colors mapped to the brand palette
  const colorScale = useMemo(() => {
    if (isDark) {
      return d3.scaleLinear<string>()
        .domain([0, maxValue * 0.25, maxValue * 0.6, maxValue])
        .range(['#1e293b', '#0f2f4c', '#007ca8', '#00A3E0']);
    } else {
      return d3.scaleLinear<string>()
        .domain([0, maxValue * 0.25, maxValue * 0.6, maxValue])
        .range(['#f1f5f9', '#bae6fd', '#38bdf8', '#0284c7']);
    }
  }, [isDark, maxValue]);

  // Stat calculations
  const peakCell = useMemo(() => {
    return data.reduce((prev, current) => (prev.value > current.value ? prev : current), data[0]);
  }, [data]);

  const avgResponseTime = useMemo(() => {
    const sum = data.reduce((acc, curr) => acc + curr.responseTimeMin, 0);
    return Math.round(sum / data.length);
  }, [data]);

  const getResponseLabel = (min: number) => {
    if (min <= 10) return { label: 'Optimal / Instant', color: 'text-emerald-500 bg-emerald-500/10' };
    if (min <= 20) return { label: 'Sangat Cepat', color: 'text-cyan-500 bg-cyan-500/10' };
    if (min <= 35) return { label: 'Standar Standby', color: 'text-amber-500 bg-amber-500/10' };
    return { label: 'Perlu Follow up', color: 'text-orange-500 bg-orange-500/10' };
  };

  // Generate realistic simulated lead details inside modal based on selectedDay & Time
  const simulatedLeads = useMemo(() => {
    if (!selectedCell) return [];
    
    const indonesianNames = [
      'Adi Nugroho', 'Budi Santoso', 'Candra Wijaya', 'Dewi Lestari', 'Eko Prasetyo',
      'Fajar Ramadhan', 'Gita Gutawa', 'Hendra Kusuma', 'Indah Permata', 'Joko Widodo',
      'Kartika Sari', 'Lukman Hakim', 'Mega Utami', 'Novianti', 'Oki Setiana',
      'Prabowo Subianto', 'Qori Sandioriva', 'Rian Jamil', 'Siti Aminah', 'Taufika Malik',
      'Umar Shihab', 'Vina Panduwinata', 'Wawan Hermawan', 'Yulianti', 'Zainal Abidin'
    ];

    const products = ['VOXIA Business Suite', 'AI Auto-Response Bot', 'CRM Premium Call', 'Omnichanel Integration'];
    const sources = ['Iklan Meta Ads', 'Google Search SEO', 'Referral Instagram', 'Direct Web Form', 'TikTok Lead Generation'];
    const stages = ['Baru Masuk', 'Sedang Ditelepon', 'Menunggu Pembayaran', 'Selesai Deal'];

    // Generate stable number of items for the specific slot
    const count = Math.min(5, Math.max(3, Math.round(selectedCell.value / 18)));
    const daySeed = selectedCell.day.length;
    const hourVal = parseInt(selectedCell.hour.split(':')[0]);
    const finalSeed = daySeed + hourVal;

    return Array.from({ length: count }).map((_, index) => {
      const nameIndex = (finalSeed + index * 7) % indonesianNames.length;
      const productIndex = (finalSeed + index * 5) % products.length;
      const sourceIndex = (finalSeed + index * 3) % sources.length;
      const stageIndex = (finalSeed + index * 4) % stages.length;
      
      const emailLocal = indonesianNames[nameIndex].toLowerCase().replace(/\s+/g, '');
      const mockEmail = `${emailLocal}@example.co.id`;
      const mockPhone = `+62 812-${Math.floor(1000 + (finalSeed + index) * 452) % 9000 + 1000}-${Math.floor(100 + index * 99) % 900 + 100}`;
      
      return {
        id: `VOX-${selectedCell.day.substring(0,3).toUpperCase()}-${hourVal}-${100 + index}`,
        name: indonesianNames[nameIndex],
        email: mockEmail,
        phone: mockPhone,
        product: products[productIndex],
        source: sources[sourceIndex],
        stage: stages[stageIndex],
        time: `${String(hourVal).padStart(2, '0')}:${String((index * 14 + 10) % 60).padStart(2, '0')}`,
        potentials: (1500000 + ((finalSeed + index) * 350000) % 8500000).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
      };
    });
  }, [selectedCell]);

  return (
    <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 border-b border-transparent">
            <Flame size={16} className="text-[#FFB400] animate-pulse" /> Heatmap Aktivitas & Respon Konversi Leads (D3 Engine)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Menganalisis densitas volume prospek masuk berdasarkan pola hari dan jam. <strong>Klik kotak untuk melihat detail leads masuk.</strong>
          </p>
        </div>

        {/* Dynamic Peak Sales Summary Badge */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs w-full lg:w-auto shrink-0">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
            <span className="block text-[9px] text-slate-400 uppercase font-mono tracking-tight">Waktu Puncak</span>
            <span className="font-extrabold text-slate-800 dark:text-white block font-mono text-[11px] mt-0.5">
              {peakCell.day} @ {peakCell.hour}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
            <span className="block text-[9px] text-slate-400 uppercase font-mono tracking-tight">Rerata Respon CS</span>
            <span className="font-extrabold text-emerald-500 dark:text-emerald-400 block font-mono text-[11px] mt-0.5">
              {avgResponseTime} Menit
            </span>
          </div>
          <div className="hidden md:block p-2 rounded-xl col-span-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
            <span className="block text-[9px] text-slate-400 uppercase font-mono tracking-tight">Konversi Puncak</span>
            <span className="font-extrabold text-[#00A3E0] block font-mono text-[11px] mt-0.5">
              +{peakCell.value} Leads/jam
            </span>
          </div>
        </div>
      </div>

      {/* Grid Heatmap Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* The Graphic Visual */}
        <div className="md:col-span-8 space-y-4">
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            <div className="min-w-[480px] space-y-2.5">
              
              {/* Heatmap Row representation */}
              <div className="flex items-center">
                {/* Space offset for the Day Label Column */}
                <div className="w-16 shrink-0"></div>
                {/* Hour header labels */}
                <div className="flex-1 grid grid-cols-8 gap-1.5 text-[10px] font-mono text-slate-400 font-bold text-center">
                  {HOURS.map((hour) => (
                    <div key={hour} className="py-0.5">
                      {hour}
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Grid body */}
              {DAYS.map((day) => (
                <div key={day} className="flex items-center">
                  {/* Day label */}
                  <div className="w-16 text-xs font-semibold text-slate-600 dark:text-slate-350 pr-2 select-none shrink-0">
                    {day}
                  </div>
                  
                  {/* Row Cells */}
                  <div className="flex-1 grid grid-cols-8 gap-1.5">
                    {HOURS.map((hour) => {
                      const cell = data.find((d) => d.day === day && d.hour === hour) || {
                        day,
                        hour,
                        value: 0,
                        responseTimeMin: 45
                      };
                      const cellColor = colorScale(cell.value);
                      const isHovered = hoveredCell?.day === day && hoveredCell?.hour === hour;
                      const isSelected = selectedCell?.day === day && selectedCell?.hour === hour;

                      return (
                        <button
                          key={hour}
                          onMouseEnter={() => setHoveredCell(cell)}
                          onMouseLeave={() => setHoveredCell(null)}
                          onClick={() => setSelectedCell(cell)}
                          style={{ backgroundColor: cellColor }}
                          type="button"
                          className={`h-9 rounded-md transition-all duration-150 cursor-pointer relative w-full text-left ${
                            isSelected 
                              ? 'ring-2 ring-[#FFB400] scale-[1.08] shadow-lg z-15 opacity-100' 
                              : isHovered 
                              ? 'ring-2 ring-emerald-400 scale-[1.04] shadow-md z-10 opacity-100' 
                              : 'opacity-90 hover:opacity-100 hover:scale-[1.02]'
                          }`}
                        >
                          {/* Minimalistic text overlay for higher volume zones */}
                          {cell.value > 45 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white leading-none pointer-events-none drop-shadow-sm">
                              {cell.value}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Color scale gradient guide bar */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold pt-1 border-t border-slate-100 dark:border-slate-800/40">
            <span>Rendah (~10 Leads)</span>
            <div className="flex items-center gap-1">
              <span className="mr-1">Indikator:</span>
              <div className="w-24 h-2 rounded bg-gradient-to-r from-slate-200 to-sky-500 dark:from-slate-800 dark:to-[#00A3E0]" />
            </div>
            <span>Tinggi (80+ Leads)</span>
          </div>
        </div>

        {/* Sidebar analytics detail panel */}
        <div className="md:col-span-4 bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#00A3E0]" />
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase font-mono">
                Live Inspector
              </span>
            </div>
            {selectedCell && (
              <span className="text-[10px] text-emerald-500 font-mono font-bold animate-pulse">Klik Terdeteksi!</span>
            )}
          </div>

          {hoveredCell ? (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00A3E0]/10 text-[#00A3E0] font-mono uppercase tracking-wider">
                  {hoveredCell.day} @ {hoveredCell.hour}
                </span>
                <span className="text-[10px] text-[#FFB400] font-bold">Tekan untuk rincian</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Prospek Masuk</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">
                    {hoveredCell.value} Leads
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Rerata Respon CS</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">
                    {hoveredCell.responseTimeMin} Menit
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Status Tindak Lanjut</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getResponseLabel(hoveredCell.responseTimeMin).color}`}>
                    {getResponseLabel(hoveredCell.responseTimeMin).label}
                  </span>
                </div>
              </div>

              {hoveredCell.value >= 60 ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-start gap-1.5 leading-relaxed">
                  <Sparkles size={12} className="shrink-0 mt-0.5" />
                  <span><strong>Zona Emas Terdeteksi!</strong> Tingkat minat prospek sangat tinggi. Tim CS siaga penuh untuk mengunci transaksi dalam &lt; 15 menit.</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/40 text-[10px] text-slate-500 flex items-start gap-1.5 leading-relaxed">
                  <Users size={12} className="shrink-0 mt-0.5" />
                  <span>Stabil. Waktu ideal untuk membagikan info rilis konten mingguan atau edukasi brand secara otomatis.</span>
                </div>
              )}
            </div>
          ) : selectedCell ? (
            <div className="space-y-2 text-xs">
              <span className="text-[11px] text-slate-400 font-mono block">Terpilih:</span>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-1">
                <p className="font-bold text-[#FFB400]">{selectedCell.day} @ {selectedCell.hour}</p>
                <p className="text-slate-500 dark:text-slate-400">Terdapat {selectedCell.value} leads masuk. Detail interaksi di bawah ini sedang aktif.</p>
                <button 
                  onClick={() => setSelectedCell(null)}
                  className="mt-2 text-[10px] font-mono text-cyan-500 hover:underline block cursor-pointer"
                >
                  Reset Pilihan
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-2 text-slate-400">
              <div className="text-2xl animate-bounce">📍</div>
              <p className="text-[11px] font-medium leading-relaxed max-w-[200px] mx-auto">
                Arahkan kursor atau klik kotak di samping untuk memeriksa detail metrik konversi dan status antrean tim CS.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Renders dynamic modal when a cell inside the heatmap is clicked */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#00A3E0] uppercase">
                  Analisis Log Prospek Akurat
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-mono flex items-center gap-2">
                  <Users size={18} className="text-[#FFB400]" /> {selectedCell.day} pukul {selectedCell.hour} ({selectedCell.value} Leads Masuk)
                </h3>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body: Leads List */}
            <div className="p-6 space-y-4 max-h-[380px] overflow-y-auto">
              <div className="p-3 bg-[#00A3E0]/5 dark:bg-[#00A3E0]/10 border border-[#00A3E0]/20 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#00A3E0] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Berikut merupakan daftar rincian prospek terenkripsi yang masuk pada slot waktu terpilih untuk mempermudah tim asisten Anda melakukan peninjauan respons cepat.
                </p>
              </div>

              <div className="space-y-3">
                {simulatedLeads.map((lead) => (
                  <div 
                    key={lead.id}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800 dark:text-white">{lead.name}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {lead.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00A3E0]/10 text-[#00A3E0]">
                          {lead.time} WIB
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">📞</span> {lead.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px]">📧</span> {lead.email}
                        </div>
                        <div className="col-span-2 mt-1 py-0.5 px-1.5 rounded bg-slate-100 dark:bg-slate-900 inline-block w-fit text-[10px] font-medium text-slate-600 dark:text-slate-300">
                          🎯 Alternatif Tertarik: {lead.product}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-150 dark:border-slate-800 pt-2 sm:pt-0 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">Estimasi Potensi Kesepakatan:</span>
                      <span className="text-xs font-black text-emerald-500 font-mono">{lead.potentials}</span>
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold ${
                        lead.stage === 'Selesai Deal' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : lead.stage === 'Sedang Ditelepon'
                          ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                          : lead.stage === 'Menunggu Pembayaran'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                      }`}>
                        {lead.stage}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldAlert size={14} className="text-amber-500" /> Data disinkronkan secara aman dengan VOXIA Core Database.
              </span>
              <button
                type="button"
                onClick={() => setSelectedCell(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#00A3E0] to-[#0A3D62] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                Selesai Meninjau
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
