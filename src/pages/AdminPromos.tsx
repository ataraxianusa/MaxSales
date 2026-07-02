import React from "react";
import { PromoCode } from "../types";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";

interface AdminPromosProps {
  onBack: () => void;
}

const INITIAL_PROMOS: PromoCode[] = [
  { id: "BUNGA20", code: "BUNGA20", influencer: "BUNGA", discount: 20, type: "percent", maxUsage: 100, currentUsage: 35, active: true, createdBy: "admin", createdAt: "2026-07-01" },
  { id: "RAMADHAN50", code: "RAMADHAN50", influencer: "RAMADHAN", discount: 50, type: "percent", maxUsage: 50, currentUsage: 12, active: true, createdBy: "admin", createdAt: "2026-06-15" },
  { id: "FLASH30", code: "FLASH30", influencer: "FLASH", discount: 30, type: "percent", maxUsage: 200, currentUsage: 89, active: true, createdBy: "admin", createdAt: "2026-06-20" },
  { id: "VIP100K", code: "VIP100K", influencer: "VIP", discount: 100000, type: "nominal", maxUsage: 30, currentUsage: 8, active: false, createdBy: "admin", createdAt: "2026-06-25" },
];

export default function AdminPromos({ onBack }: AdminPromosProps) {
  const [promos, setPromos] = React.useState<PromoCode[]>(INITIAL_PROMOS);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ code: "", influencer: "", discount: "", type: "percent" as "percent" | "nominal", maxUsage: "100", expiresAt: "" });

  const handleCreate = () => {
    if (!form.code.trim() || !form.discount) return;
    const newPromo: PromoCode = {
      id: form.code.toUpperCase(),
      code: form.code.toUpperCase(),
      influencer: form.influencer.toUpperCase() || form.code.toUpperCase(),
      discount: Number(form.discount),
      type: form.type,
      maxUsage: Number(form.maxUsage) || 100,
      currentUsage: 0,
      expiresAt: form.expiresAt || undefined,
      active: true,
      createdBy: "admin",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPromos([newPromo, ...promos]);
    setForm({ code: "", influencer: "", discount: "", type: "percent", maxUsage: "100", expiresAt: "" });
    setShowForm(false);
  };

  const toggleActive = (code: string) => {
    setPromos(promos.map(p => p.code === code ? { ...p, active: !p.active } : p));
  };

  const deletePromo = (code: string) => {
    if (window.confirm(`Hapus kode promo "${code}"?`)) {
      setPromos(promos.filter(p => p.code !== code));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-[#262626]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">
            <ArrowLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#cba258]" />
              Admin — Kode Promo
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Kelola kode promo untuk pelanggan</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E3932] text-white text-xs font-bold hover:bg-[#00754A] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Baru</span>
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 p-4 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input placeholder="Kode (BUNGA20)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
            <input placeholder="Influencer" value={form.influencer} onChange={e => setForm({ ...form, influencer: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
            <input placeholder="Diskon (20)" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white">
              <option value="percent">Persen (%)</option>
              <option value="nominal">Nominal (Rp)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input placeholder="Max usage (100)" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
            <input type="date" placeholder="Expires" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
            <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#00754A] text-white text-xs font-bold hover:bg-[#005a3a] transition-colors">Simpan</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">Batal</button>
          </div>
        </div>
      )}

      {/* Promo List */}
      <div className="space-y-3">
        {promos.map(promo => (
          <div key={promo.code} className={`p-4 rounded-xl border transition-colors ${promo.active ? "border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]" : "border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#0A0A0A] opacity-60"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-black text-xs ${promo.active ? "bg-[#cba258]/10 text-[#cba258] border border-[#cba258]/30" : "bg-neutral-100 dark:bg-[#1A1A1A] text-neutral-400 border border-neutral-200 dark:border-[#262626]"}`}>
                  {promo.code.slice(0, 4)}
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{promo.code}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{promo.influencer}</span>
                    <span className="text-[10px] font-mono text-[#cba258]">{promo.type === "percent" ? `${promo.discount}%` : `Rp${promo.discount.toLocaleString("id-ID")}`}</span>
                    <span className="text-[10px] text-neutral-400">•</span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{promo.currentUsage}/{promo.maxUsage} terpakai</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(promo.code)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">
                  {promo.active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-neutral-400" />}
                </button>
                <button onClick={() => deletePromo(promo.code)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            {/* Usage bar */}
            <div className="mt-2 h-1.5 rounded-full bg-neutral-100 dark:bg-[#262626] overflow-hidden">
              <div className="h-full rounded-full bg-[#cba258] transition-all" style={{ width: `${Math.min((promo.currentUsage / promo.maxUsage) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
