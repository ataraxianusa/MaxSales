import React from "react";
import { PromoCode } from "../types";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, ArrowLeft, Users, DollarSign, BarChart3, Download } from "lucide-react";

interface AdminPromosProps {
  onBack: () => void;
}

type AdminTab = "promos" | "partners" | "payouts";

const INITIAL_PROMOS: PromoCode[] = [
  { id: "BUNGA20", code: "BUNGA20", influencer: "BUNGA", type: "partner", discount: 20, discountType: "percent", commissionRate: 20, partnerName: "BUNGA", partnerContact: "bunga@influencer.id", maxUsage: 100, currentUsage: 35, totalRevenue: 8372000, totalPartnerPayout: 1674400, active: true, createdBy: "admin", createdAt: "2026-07-01" },
  { id: "RAMADHAN50", code: "RAMADHAN50", influencer: "RAMADHAN", type: "partner", discount: 50, discountType: "percent", commissionRate: 20, partnerName: "RAMADHAN", partnerContact: "ramadhan@influencer.id", maxUsage: 50, currentUsage: 12, totalRevenue: 1794000, totalPartnerPayout: 358800, active: true, createdBy: "admin", createdAt: "2026-06-15" },
  { id: "FLASH30", code: "FLASH30", influencer: "FLASH", type: "internal", discount: 30, discountType: "percent", commissionRate: 0, maxUsage: 200, currentUsage: 89, totalRevenue: 18669300, totalPartnerPayout: 0, active: true, createdBy: "admin", createdAt: "2026-06-20" },
  { id: "VIP100K", code: "VIP100K", influencer: "VIP", type: "internal", discount: 100000, discountType: "nominal", commissionRate: 0, maxUsage: 30, currentUsage: 8, totalRevenue: 1592000, totalPartnerPayout: 0, active: false, createdBy: "admin", createdAt: "2026-06-25" },
  { id: "SAMPOERNA20", code: "SAMPOERNA20", influencer: "SAMPOERNA", type: "partner", discount: 20, discountType: "percent", commissionRate: 20, partnerName: "Sampoerna Foundation", partnerContact: "partnership@sampoerna.org", maxUsage: 500, currentUsage: 156, totalRevenue: 74832000, totalPartnerPayout: 14966400, active: true, createdBy: "admin", createdAt: "2026-05-10" },
];

export default function AdminPromos({ onBack }: AdminPromosProps) {
  const [tab, setTab] = React.useState<AdminTab>("promos");
  const [promos, setPromos] = React.useState<PromoCode[]>(INITIAL_PROMOS);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({
    code: "", influencer: "", discount: "", discountType: "percent" as "percent" | "nominal",
    type: "internal" as "internal" | "partner", commissionRate: "", partnerName: "", partnerContact: "",
    maxUsage: "100", expiresAt: ""
  });

  const handleCreate = () => {
    if (!form.code.trim() || !form.discount) return;
    const newPromo: PromoCode = {
      id: form.code.toUpperCase(), code: form.code.toUpperCase(),
      influencer: form.influencer.toUpperCase() || form.code.toUpperCase(),
      type: form.type, discount: Number(form.discount), discountType: form.discountType,
      commissionRate: form.type === "partner" ? Number(form.commissionRate) || 0 : 0,
      partnerName: form.type === "partner" ? form.partnerName : undefined,
      partnerContact: form.type === "partner" ? form.partnerContact : undefined,
      maxUsage: Number(form.maxUsage) || 100, currentUsage: 0, totalRevenue: 0, totalPartnerPayout: 0,
      expiresAt: form.expiresAt || undefined, active: true, createdBy: "admin",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPromos([newPromo, ...promos]);
    setForm({ code: "", influencer: "", discount: "", discountType: "percent", type: "internal", commissionRate: "", partnerName: "", partnerContact: "", maxUsage: "100", expiresAt: "" });
    setShowForm(false);
  };

  const toggleActive = (code: string) => setPromos(promos.map(p => p.code === code ? { ...p, active: !p.active } : p));
  const deletePromo = (code: string) => { if (window.confirm(`Hapus "${code}"?`)) setPromos(promos.filter(p => p.code !== code)); };

  const totalRevenue = promos.reduce((s, p) => s + p.totalRevenue, 0);
  const totalPartnerPayout = promos.filter(p => p.type === "partner").reduce((s, p) => s + p.totalPartnerPayout, 0);
  const totalUsage = promos.reduce((s, p) => s + p.currentUsage, 0);
  const partnerPromos = promos.filter(p => p.type === "partner");
  const partners = [...new Set(partnerPromos.map(p => p.partnerName || ""))].filter(Boolean);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-[#262626]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">
            <ArrowLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#cba258]" />
              Super Admin — Promo & Partner
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Kelola kode promo, partner earnings, dan payouts</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Revenue", value: `Rp${(totalRevenue / 1000).toFixed(0)}jt`, icon: DollarSign, color: "text-emerald-500" },
          { label: "Partner Payout", value: `Rp${(totalPartnerPayout / 1000).toFixed(0)}jt`, icon: Users, color: "text-blue-500" },
          { label: "Total Usage", value: String(totalUsage), icon: BarChart3, color: "text-purple-500" },
          { label: "Active Codes", value: String(promos.filter(p => p.active).length), icon: Tag, color: "text-[#cba258]" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-3 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111]">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 uppercase">{card.label}</span>
              </div>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">{card.value}</span>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-neutral-100 dark:bg-[#111111] border border-neutral-200 dark:border-[#262626]">
        {[
          { key: "promos" as AdminTab, label: "Kode Promo", icon: Tag },
          { key: "partners" as AdminTab, label: "Partner Earnings", icon: Users },
          { key: "payouts" as AdminTab, label: "Payouts", icon: DollarSign },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${tab === t.key ? "bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
            <t.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: Promo Codes */}
      {tab === "promos" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E3932] text-white text-xs font-bold hover:bg-[#00754A] transition-colors">
              <Plus className="w-3.5 h-3.5" /><span>Buat Baru</span>
            </button>
          </div>

          {showForm && (
            <div className="mb-4 p-4 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] space-y-3">
              {/* Step 1: Pilih tipe dulu */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setForm({ ...form, type: "internal" })}
                  className={`p-4 rounded-xl border text-left transition-colors ${form.type === "internal" ? "border-[#cba258] bg-[#cba258]/5" : "border-neutral-200 dark:border-[#262626] hover:border-neutral-400"}`}>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white block">Internal</span>
                  <span className="text-[10px] text-neutral-500">100% masuk MaxxSales</span>
                </button>
                <button onClick={() => setForm({ ...form, type: "partner" })}
                  className={`p-4 rounded-xl border text-left transition-colors ${form.type === "partner" ? "border-blue-500 bg-blue-500/5" : "border-neutral-200 dark:border-[#262626] hover:border-neutral-400"}`}>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white block">Partner</span>
                  <span className="text-[10px] text-neutral-500">Split revenue dengan partner</span>
                </button>
              </div>

              {/* Step 2: Field sesuai tipe */}
              {form.type === "internal" && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold font-mono text-[#cba258] uppercase tracking-wider">Kode Promo Internal</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input placeholder="Kode (FLASH30)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                    <input placeholder="Diskon (30)" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                    <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white">
                      <option value="percent">Persen (%)</option>
                      <option value="nominal">Nominal (Rp)</option>
                    </select>
                    <input placeholder="Max usage (100)" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                  </div>
                </div>
              )}

              {form.type === "partner" && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold font-mono text-blue-500 uppercase tracking-wider">Kode Promo Partner</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <input placeholder="Kode (BUNGA20)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                    <input placeholder="Diskon (20)" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                    <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white">
                      <option value="percent">Persen (%)</option>
                      <option value="nominal">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <input placeholder="Nama Partner" value={form.partnerName} onChange={e => setForm({ ...form, partnerName: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                    <input placeholder="Kontak (email/WA)" value={form.partnerContact} onChange={e => setForm({ ...form, partnerContact: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                    <input placeholder="Komisi partner %" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                    <input placeholder="Max usage (100)" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} className="text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white" />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#00754A] text-white text-xs font-bold hover:bg-[#005a3a] transition-colors">Simpan</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">Batal</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {promos.map(promo => (
              <div key={promo.code} className={`p-4 rounded-xl border transition-colors ${promo.active ? "border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]" : "border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#0A0A0A] opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-black text-xs ${promo.type === "partner" ? "bg-blue-500/10 text-blue-500 border border-blue-500/30" : "bg-[#cba258]/10 text-[#cba258] border border-[#cba258]/30"}`}>
                      {promo.type === "partner" ? "P" : "M"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{promo.code}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${promo.type === "partner" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-neutral-100 dark:bg-[#262626] text-neutral-500"}`}>
                          {promo.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{promo.influencer}</span>
                        <span className="text-[10px] font-mono text-[#cba258]">{promo.discountType === "percent" ? `${promo.discount}%` : `Rp${promo.discount.toLocaleString("id-ID")}`}</span>
                        {promo.type === "partner" && <span className="text-[10px] text-blue-500">• {promo.commissionRate}% komisi</span>}
                        <span className="text-[10px] text-neutral-400">•</span>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{promo.currentUsage}/{promo.maxUsage}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Rp{(promo.totalRevenue / 1000).toFixed(0)}jt</span>
                    <button onClick={() => toggleActive(promo.code)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">
                      {promo.active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-neutral-400" />}
                    </button>
                    <button onClick={() => deletePromo(promo.code)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-neutral-100 dark:bg-[#262626] overflow-hidden">
                  <div className="h-full rounded-full bg-[#cba258] transition-all" style={{ width: `${Math.min((promo.currentUsage / promo.maxUsage) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Partner Earnings */}
      {tab === "partners" && (
        <div className="space-y-3">
          {partners.map(partner => {
            const partnerData = partnerPromos.filter(p => p.partnerName === partner);
            const totalEarned = partnerData.reduce((s, p) => s + p.totalPartnerPayout, 0);
            const totalRev = partnerData.reduce((s, p) => s + p.totalRevenue, 0);
            const totalUsed = partnerData.reduce((s, p) => s + p.currentUsage, 0);
            const contact = partnerData[0]?.partnerContact || "-";
            return (
              <div key={partner} className="p-4 rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/30 flex items-center justify-center font-bold text-xs">{partner.slice(0, 2)}</div>
                    <div>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{partner}</span>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{contact}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">Rp{(totalEarned / 1000).toFixed(0)}jt</span>
                    <p className="text-[9px] text-neutral-500">total earning</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A]">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">{totalUsed}</span>
                    <p className="text-[9px] text-neutral-500">penggunaan</p>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A]">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">{partnerData.length}</span>
                    <p className="text-[9px] text-neutral-500">kode aktif</p>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A]">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">Rp{(totalRev / 1000).toFixed(0)}jt</span>
                    <p className="text-[9px] text-neutral-500">total revenue</p>
                  </div>
                </div>
              </div>
            );
          })}
          {partners.length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">Belum ada partner terdaftar</div>
          )}
        </div>
      )}

      {/* TAB: Payouts */}
      {tab === "payouts" && (
        <div className="space-y-3">
          {partnerPromos.filter(p => p.totalPartnerPayout > 0).map(promo => (
            <div key={promo.code} className="p-4 rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{promo.code}</span>
                    <p className="text-[10px] text-neutral-500">{promo.partnerName} • {promo.currentUsage} transaksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Rp{promo.totalPartnerPayout.toLocaleString("id-ID")}</span>
                  <p className="text-[9px] text-neutral-500">pending payout</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-colors">Bayar Sekarang</button>
                <button className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-[#262626] text-[10px] font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">Ekspor CSV</button>
              </div>
            </div>
          ))}
          {partnerPromos.filter(p => p.totalPartnerPayout > 0).length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">Tidak ada payout pending</div>
          )}
        </div>
      )}
    </div>
  );
}
