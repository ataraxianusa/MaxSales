import React from "react";
import { BusinessCanvasData, DailyPulseData } from "../types";
import { Sparkles, CheckSquare, Square, TrendingUp, RefreshCw, BarChart2, Target, Users, Bell, ChevronRight, Loader2 } from "lucide-react";

interface DailyPulseProps {
  dna: BusinessCanvasData;
}

export default function DailyPulse({ dna }: DailyPulseProps) {
  const [loading, setLoading] = React.useState(false);
  const [briefing, setBriefing] = React.useState(
    `Selamat pagi, Owner Hebat! Hari baru adalah momentum baru untuk memajukan brand Anda. Berdasarkan DNA Produk: ${dna.productName}, segmentasi ibu muda saat ini sangat aktif mencari inspirasi belanja menjelang siang hari. Kami menyarankan untuk menyelesaikan action item di bawah ini sebelum pukul 11:30 WIB agar tidak kehilangan momentum closing!`
  );

  // Checklist items
  const [items, setItems] = React.useState([
    { id: "1", text: `Posting desain visual Reels terbaru dari Content Generator ke Instagram`, done: false, category: "Marketing" },
    { id: "2", text: "Follow up chat prospek pelanggan Ibu Rianita (LTV Tinggi: score 95)", done: true, category: "Sales" },
    { id: "3", text: `Siapkan kupon voucher "Penyelamat Churn" 15% ke grup reseller`, done: false, category: "Retention" },
    { id: "4", text: `Periksa kesesuaian stok fisik dan digital untuk varian utama`, done: false, category: "Operasional" },
    { id: "5", text: "Pantau perang promo diskon Zahra Store (kompetitor utama)", done: false, category: "Competitor" }
  ]);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/daily-pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna,
          completedCount: items.filter(x => x.done).length
        })
      });
      const data = await response.json();
      if (data.briefing) {
        setBriefing(data.briefing);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setItems(
      items.map(it => (it.id === id ? { ...it, done: !it.done } : it))
    );
  };

  const doneCount = items.filter(x => x.done).length;
  const progressPercent = Math.round((doneCount / items.length) * 100);

  // Target calculations based on DNA
  const revenueGoal = dna.targetMonthlyRevenue || 50000000;
  // Simulated stats
  const achievedRevenue = Math.round(revenueGoal * 0.42); // 42% achieved
  const percentageAchieved = 42;

  return (
    <div className="space-y-6">
      
      {/* Intro header */}
      <div className="border-b pb-4 border-neutral-200 dark:border-[#262626]">
        <h2 className="text-xl font-light tracking-tight flex items-center space-x-2 text-neutral-900 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-[#E5E5E5]"></span>
          <span>Daily Sales Pulse Core</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
          Ulas sinyal harian operasional Anda. Selesaikan daftar tugas taktis pencetak closingan, lacak rasio omzet, dan pantau radar pasar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: BRIEFING & CHECKLIST (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Morning briefing panel */}
          <div className="p-5 rounded border bg-neutral-50 dark:bg-[#111111] border-neutral-200 dark:border-[#262626] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full filter blur-3xl opacity-5 bg-neutral-400 pointer-events-none"></div>
            
            <div className="flex items-center justify-between border-b pb-3 border-neutral-200 dark:border-[#262626] mb-3">
              <h3 className="text-xs font-bold flex items-center space-x-1.5 text-neutral-850 dark:text-white font-mono tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-neutral-500 dark:text-[#A3A3A3]" />
                <span>MORNING BRIEFING CO-PILOT</span>
              </h3>
              
              <button
                id="btn-refresh-briefing"
                onClick={fetchBriefing}
                disabled={loading}
                className="p-1 px-2.5 rounded bg-white dark:bg-[#171717] border border-neutral-200 dark:border-[#262626] text-[10px] font-mono text-neutral-700 dark:text-[#A3A3A3] hover:bg-neutral-50 dark:hover:bg-[#262626]"
                title="Refresh Briefing"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span className="ml-1">Acak Tips Baru</span>
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-neutral-500 dark:text-[#A3A3A3] font-mono flex items-center justify-center space-x-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses data DNA untuk menyusun resep penjualan harian...</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm leading-relaxed text-neutral-650 dark:text-[#A3A3A3]">
                {briefing}
              </p>
            )}
          </div>

          {/* Action item checklist */}
          <div className="p-6 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 border-neutral-150 dark:border-[#1A1A1A] gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center space-x-2 text-neutral-900 dark:text-white">
                  <CheckSquare className="w-4 h-4 text-neutral-850 dark:text-white" />
                  <span>Daftar Pekerjaan Penjualan Harian</span>
                </h3>
                <p className="text-[10px] text-neutral-400 dark:text-[#737373]">Centang pekerjaan yang selesai untuk menaikkan rasio kemapanan omzet.</p>
              </div>
              
              {/* Progress pill counter */}
              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono text-neutral-450 dark:text-[#737373] font-bold block uppercase tracking-wider">KETERAMPILAN SELESAI</span>
                <span className="text-xs font-bold font-mono text-neutral-900 dark:text-white">{progressPercent}% ({doneCount}/{items.length})</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-neutral-900 dark:bg-[#E5E5E5] h-1.5 transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Checklist lists mapping */}
            <div className="space-y-2 pt-2">
              {items.map(it => (
                <button
                  id={`btn-todo-toggle-${it.id}`}
                  key={it.id}
                  onClick={() => toggleItem(it.id)}
                  className={`w-full p-3.5 rounded border text-left flex items-start space-x-3 transition-colors ${
                    it.done
                      ? "bg-neutral-50/50 dark:bg-neutral-950/20 border-neutral-200 dark:border-neutral-900 opacity-60 line-through"
                      : "bg-neutral-50 dark:bg-[#171717] border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {it.done ? (
                      <div className="w-4 h-4 rounded bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black flex items-center justify-center text-[10px] font-bold">✓</div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-neutral-350 dark:border-[#3F3F46]"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-xs">
                    <p className={`text-neutral-850 dark:text-[#E5E5E5] ${it.done ? "text-neutral-500" : "font-medium"}`}>
                      {it.text}
                    </p>
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded uppercase mt-2 inline-block bg-neutral-200/50 dark:bg-[#262626] text-neutral-500 dark:text-[#737373]">
                      • {it.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REVENUE KPI & RADAR ALERTS (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Target Revenue Progress Box */}
          <div className="p-5 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-4">
            <div className="flex items-center space-x-1.5 text-neutral-550 border-b pb-2 border-neutral-100 dark:border-[#1A1A1A]">
              <Target className="w-4 h-4 text-neutral-500 dark:text-[#737373]" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-900 dark:text-[#A3A3A3]">Pencapaian Target Omzet</h4>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-neutral-400 dark:text-[#737373] font-mono block uppercase">Target Bulan Ini (DNA)</span>
              <strong className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                Rp {revenueGoal.toLocaleString("id-ID")}
              </strong>
            </div>

            <div className="p-4 rounded bg-neutral-900 text-white dark:bg-[#171717] border border-transparent dark:border-[#262626] text-center space-y-1">
              <span className="text-[9px] font-mono uppercase text-neutral-450 dark:text-[#737373]">AKUMULASI CLOSING SEKARANG</span>
              <p className="text-md font-black text-white dark:text-[#E5E5E5] font-mono">Rp {achievedRevenue.toLocaleString("id-ID")}</p>
              <div className="flex justify-between items-center text-[9px] font-mono px-2 pt-1.5 mt-1 border-t border-neutral-800 dark:border-[#262626] text-neutral-400">
                <span>Rasio:</span>
                <span className="text-white font-bold">{percentageAchieved}% Tercapai</span>
              </div>
            </div>

            <ul className="space-y-2 text-[10px] font-mono text-neutral-450 dark:text-[#737373]">
              <li className="flex items-center justify-between">
                <span>Sisa Kekurangan:</span>
                <strong className="font-semibold text-neutral-700 dark:text-neutral-300">Rp {(revenueGoal - achievedRevenue).toLocaleString("id-ID")}</strong>
              </li>
              <li className="flex items-center justify-between pb-1">
                <span>Prediksi Akhir Bulan:</span>
                <strong className="text-neutral-900 dark:text-white font-bold">✓ 89% Peluang</strong>
              </li>
            </ul>
          </div>

          {/* New Leads radar summary */}
          <div className="p-5 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-3">
            <div className="flex items-center space-x-1.5 border-b pb-2 border-neutral-100 dark:border-[#1A1A1A]">
              <Users className="w-4 h-4 text-neutral-500" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono text-neutral-900 dark:text-[#A3A3A3]">Radar Leads Pemesanan</h4>
            </div>

            <div className="space-y-3">
              {[
                { name: "Andriani (Ibu Muda)", status: "WA Pending Chat", item: "Gamis Sutra", time: "2 mnt lalu" },
                { name: "Dewi S (Reseller)", status: "Bundle Offer", item: "Buy 10 packs", time: "10 mnt lalu" },
                { name: "Rina Kartika (Impulse)", status: "Ready to Pay", item: "Voucher Claim", time: "1 jam lalu" }
              ].map((ld, i) => (
                <div key={i} className="flex items-center justify-between text-xs pb-2.5 border-b border-neutral-100 dark:border-[#1A1A1A] last:border-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">{ld.name}</span>
                    <span className="text-[10px] text-neutral-400 dark:text-[#737373] font-mono">{ld.item} • {ld.time}</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#1A1A1A] text-neutral-650 dark:text-[#A3A3A3] border border-neutral-200 dark:border-[#262626] uppercase font-bold">{ld.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Market notification alerts */}
          <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-[#111111] space-y-2">
            <h4 className="text-[10px] font-bold font-mono text-red-500 dark:text-[#737373] uppercase tracking-widest flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-neutral-400" />
              <span>RADAR PASAR KOMPETITOR</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-[#A3A3A3]">
              Pesaing utama Anda <strong className="font-semibold text-neutral-805 dark:text-white">{dna.biggestCompetitor || "Zahra Store"}</strong> mendetect volume kampanye visual Anda. Hubungi segmen pembeli Anda dengan taktik retensi CRM penyelamat Churn secepatnya!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
