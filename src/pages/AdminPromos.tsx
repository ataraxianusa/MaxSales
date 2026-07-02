import React from "react";
import { PartnerProfile, PartnerSettlement } from "../types";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, ArrowLeft, Users, DollarSign, BarChart3, Download, Clock, AlertTriangle, FileText, Building, User } from "lucide-react";

interface AdminPromosProps {
  onBack: () => void;
}

type AdminTab = "partners" | "settlements" | "export";

function generatePromoCode(name: string, discount: number, existing: string[]): string {
  const base = name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g, "");
  const suffix = discount >= 100 ? `${discount / 1000}K` : String(discount);
  let code = `${base}${suffix}`;
  let counter = 2;
  while (existing.includes(code)) {
    code = `${base}${suffix}-${counter}`;
    counter++;
  }
  return code;
}

const MOCK_PARTNERS: PartnerProfile[] = [
  { id: "BUNGA20", name: "Bunga Putri", type: "personal", email: "bunga@email.com", phone: "081234567890", promoCode: "BUNGA20", discountPercent: 20, commissionPercent: 10, joinDate: "2026-06-15", totalEarning: 837200, totalPayout: 598000, pendingPayout: 239200, totalTransactions: 35, status: "active", bankName: "BCA", bankAccountNumber: "1234567890", bankAccountName: "Bunga Putri", createdAt: "2026-06-15", updatedAt: "2026-07-01" },
  { id: "SAMPOERNA20", name: "Sampoerna Foundation", type: "organization", email: "partnership@sampoerna.org", phone: "081298765432", picName: "Budi Santoso", picPhone: "081211112222", picEmail: "budi@sampoerna.org", promoCode: "SAMPOERNA20", discountPercent: 20, commissionPercent: 15, joinDate: "2026-05-10", totalEarning: 14966400, totalPayout: 10000000, pendingPayout: 4966400, totalTransactions: 156, status: "active", bankName: "Mandiri", bankAccountNumber: "9876543210", bankAccountName: "Sampoerna Foundation", createdAt: "2026-05-10", updatedAt: "2026-07-01" },
  { id: "RAMADHAN50", name: "Ramadhan Store", type: "personal", email: "ramadhan@email.com", phone: "081255556666", promoCode: "RAMADHAN50", discountPercent: 50, commissionPercent: 10, joinDate: "2026-06-20", totalEarning: 358800, totalPayout: 200000, pendingPayout: 158800, totalTransactions: 12, status: "active", bankName: "BRI", bankAccountNumber: "5555666677", bankAccountName: "Ramadhan", createdAt: "2026-06-20", updatedAt: "2026-07-01" },
];

const MOCK_SETTLEMENTS: PartnerSettlement[] = [
  { id: "STL-001", partnerName: "Bunga Putri", periodStart: "2026-06-01", periodEnd: "2026-06-30", totalTransactions: 15, totalRevenue: 3588000, totalCommission: 358800, status: "pending", deadline: "2026-07-05", createdAt: "2026-07-01" },
  { id: "STL-002", partnerName: "Sampoerna Foundation", periodStart: "2026-06-01", periodEnd: "2026-06-30", totalTransactions: 50, totalRevenue: 11960000, totalCommission: 1794000, status: "processing", deadline: "2026-07-05", createdAt: "2026-07-01" },
  { id: "STL-003", partnerName: "Ramadhan Store", periodStart: "2026-06-01", periodEnd: "2026-06-30", totalTransactions: 5, totalRevenue: 748000, totalCommission: 74800, status: "paid", deadline: "2026-07-05", paidAt: "2026-07-02", paidBy: "admin", createdAt: "2026-07-01" },
];

export default function AdminPromos({ onBack }: AdminPromosProps) {
  const [tab, setTab] = React.useState<AdminTab>("partners");
  const [partners, setPartners] = React.useState<PartnerProfile[]>(MOCK_PARTNERS);
  const [settlements] = React.useState<PartnerSettlement[]>(MOCK_SETTLEMENTS);
  const [showForm, setShowForm] = React.useState(false);
  const [formType, setFormType] = React.useState<"personal" | "organization">("personal");
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", address: "",
    picName: "", picPhone: "", picEmail: "",
    bankName: "", bankAccountNumber: "", bankAccountName: "",
    ovoPhone: "", gopayPhone: "",
    discountPercent: "", commissionPercent: "",
  });

  const handleCreate = () => {
    if (!form.name.trim() || !form.discountPercent) return;
    const discount = Number(form.discountPercent);
    const existingCodes = partners.map(p => p.promoCode);
    const promoCode = generatePromoCode(form.name, discount, existingCodes);

    const newPartner: PartnerProfile = {
      id: promoCode, name: form.name, type: formType, email: form.email, phone: form.phone,
      address: form.address || undefined,
      picName: formType === "organization" ? form.picName : undefined,
      picPhone: formType === "organization" ? form.picPhone : undefined,
      picEmail: formType === "organization" ? form.picEmail : undefined,
      bankName: form.bankName, bankAccountNumber: form.bankAccountNumber, bankAccountName: form.bankAccountName,
      ovoPhone: form.ovoPhone || undefined, gopayPhone: form.gopayPhone || undefined,
      promoCode, discountPercent: discount,
      commissionPercent: Number(form.commissionPercent) || 0,
      joinDate: new Date().toISOString().split("T")[0],
      totalEarning: 0, totalPayout: 0, pendingPayout: 0, totalTransactions: 0,
      status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    setPartners([newPartner, ...partners]);
    setForm({ name: "", email: "", phone: "", address: "", picName: "", picPhone: "", picEmail: "", bankName: "", bankAccountNumber: "", bankAccountName: "", ovoPhone: "", gopayPhone: "", discountPercent: "", commissionPercent: "" });
    setShowForm(false);
  };

  const toggleStatus = (id: string) => setPartners(partners.map(p => p.id === id ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p));
  const deletePartner = (id: string) => { if (window.confirm(`Hapus partner "${id}"?`)) setPartners(partners.filter(p => p.id !== id)); };

  const totalRevenue = partners.reduce((s, p) => s + p.totalEarning, 0);
  const totalPending = partners.reduce((s, p) => s + p.pendingPayout, 0);
  const totalTransactions = partners.reduce((s, p) => s + p.totalTransactions, 0);

  const inputClass = "text-xs px-3 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white focus:outline-none focus:border-[#cba258]";

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
              Super Admin — Partner & Payouts
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Kelola partner, kode promo, settlement, dan export</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport("partners")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 dark:border-[#262626] text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">
            <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Revenue", value: `Rp${(totalRevenue / 1000).toFixed(0)}jt`, icon: DollarSign, color: "text-emerald-500" },
          { label: "Pending Payout", value: `Rp${(totalPending / 1000).toFixed(0)}jt`, icon: Clock, color: "text-amber-500" },
          { label: "Total Transaksi", value: String(totalTransactions), icon: BarChart3, color: "text-purple-500" },
          { label: "Active Partners", value: String(partners.filter(p => p.status === "active").length), icon: Users, color: "text-[#cba258]" },
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
          { key: "partners" as AdminTab, label: "Partner", icon: Users },
          { key: "settlements" as AdminTab, label: "Settlement", icon: DollarSign },
          { key: "export" as AdminTab, label: "Export", icon: Download },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${tab === t.key ? "bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
            <t.icon className="w-3.5 h-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB: Partners */}
      {tab === "partners" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E3932] text-white text-xs font-bold hover:bg-[#00754A] transition-colors">
              <Plus className="w-3.5 h-3.5" /><span>Tambah Partner</span>
            </button>
          </div>

          {/* Create Partner Form */}
          {showForm && (
            <div className="mb-4 p-5 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111] space-y-4">
              {/* Tipe Partner */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setFormType("personal")}
                  className={`p-3 rounded-xl border text-left transition-colors ${formType === "personal" ? "border-[#cba258] bg-[#cba258]/5" : "border-neutral-200 dark:border-[#262626] hover:border-neutral-400"}`}>
                  <User className="w-4 h-4 mb-1 text-[#cba258]" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white block">Personal</span>
                  <span className="text-[9px] text-neutral-500">Influencer / individu</span>
                </button>
                <button onClick={() => setFormType("organization")}
                  className={`p-3 rounded-xl border text-left transition-colors ${formType === "organization" ? "border-blue-500 bg-blue-500/5" : "border-neutral-200 dark:border-[#262626] hover:border-neutral-400"}`}>
                  <Building className="w-4 h-4 mb-1 text-blue-500" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white block">Organisasi</span>
                  <span className="text-[9px] text-neutral-500">Komunitas / asosiasi / foundation</span>
                </button>
              </div>

              {/* Data Utama */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono text-neutral-500 uppercase tracking-wider">Data Utama</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <input placeholder="Nama Lengkap *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
                  <input placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
                  <input placeholder="HP / WA Aktif *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                </div>
                <input placeholder="Alamat (opsional)" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={`w-full ${inputClass}`} />
              </div>

              {/* PIC (Organisasi only) */}
              {formType === "organization" && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-blue-500 uppercase tracking-wider">PIC (Person In Charge)</span>
                  <div className="grid grid-cols-3 gap-3">
                    <input placeholder="Nama PIC" value={form.picName} onChange={e => setForm({ ...form, picName: e.target.value })} className={inputClass} />
                    <input placeholder="HP PIC" value={form.picPhone} onChange={e => setForm({ ...form, picPhone: e.target.value })} className={inputClass} />
                    <input placeholder="Email PIC" value={form.picEmail} onChange={e => setForm({ ...form, picEmail: e.target.value })} className={inputClass} />
                  </div>
                </div>
              )}

              {/* Rekening Bank */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase tracking-wider">Rekening Bank (Transfer Manual)</span>
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="Nama Bank" value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} className={inputClass} />
                  <input placeholder="No. Rekening" value={form.bankAccountNumber} onChange={e => setForm({ ...form, bankAccountNumber: e.target.value })} className={inputClass} />
                  <input placeholder="Atas Nama" value={form.bankAccountName} onChange={e => setForm({ ...form, bankAccountName: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* E-Wallet */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono text-purple-500 uppercase tracking-wider">E-Wallet (Disbursement)</span>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="No. OVO" value={form.ovoPhone} onChange={e => setForm({ ...form, ovoPhone: e.target.value })} className={inputClass} />
                  <input placeholder="No. GoPay" value={form.gopayPhone} onChange={e => setForm({ ...form, gopayPhone: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Diskon & Komisi */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono text-[#cba258] uppercase tracking-wider">Diskon & Komisi</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-neutral-500 mb-1 block">Diskon untuk User (%)</label>
                    <input placeholder="20" type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-[9px] text-neutral-500 mb-1 block">Komisi Partner (%)</label>
                    <input placeholder="10" type="number" value={form.commissionPercent} onChange={e => setForm({ ...form, commissionPercent: e.target.value })} className={inputClass} />
                  </div>
                </div>
                {form.name && form.discountPercent && (
                  <div className="p-2 rounded-lg bg-[#cba258]/5 border border-[#cba258]/20">
                    <span className="text-[10px] font-mono text-[#cba258]">Kode promo otomatis: <strong>{generatePromoCode(form.name, Number(form.discountPercent), partners.map(p => p.promoCode))}</strong></span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-[#00754A] text-white text-xs font-bold hover:bg-[#005a3a] transition-colors">Simpan Partner</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-[#262626] text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">Batal</button>
              </div>
            </div>
          )}

          {/* Partner List */}
          <div className="space-y-2">
            {partners.map(partner => (
              <div key={partner.id} className={`p-4 rounded-xl border transition-colors ${partner.status === "active" ? "border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]" : "border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#0A0A0A] opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-black text-xs ${partner.type === "organization" ? "bg-blue-500/10 text-blue-500 border border-blue-500/30" : "bg-[#cba258]/10 text-[#cba258] border border-[#cba258]/30"}`}>
                      {partner.type === "organization" ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">{partner.name}</span>
                        <span className="text-[10px] font-mono text-[#cba258] bg-[#cba258]/10 px-1.5 py-0.5 rounded">{partner.promoCode}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-neutral-500">{partner.email}</span>
                        <span className="text-[10px] text-neutral-400">•</span>
                        <span className="text-[10px] font-mono text-emerald-500">{partner.discountPercent}% diskon</span>
                        <span className="text-[10px] text-neutral-400">•</span>
                        <span className="text-[10px] font-mono text-blue-500">{partner.commissionPercent}% komisi</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">Rp{partner.pendingPayout.toLocaleString("id-ID")}</span>
                      <p className="text-[9px] text-amber-500">pending</p>
                    </div>
                    <button onClick={() => toggleStatus(partner.id)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">
                      {partner.status === "active" ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-neutral-400" />}
                    </button>
                    <button onClick={() => deletePartner(partner.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-[9px] text-neutral-400">
                  <span>Join: {partner.joinDate}</span>
                  <span>Transaksi: {partner.totalTransactions}</span>
                  <span>Total Earning: Rp{partner.totalEarning.toLocaleString("id-ID")}</span>
                  {partner.bankName && <span>Bank: {partner.bankName}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Settlements */}
      {tab === "settlements" && (
        <div className="space-y-3">
          {settlements.map(settlement => (
            <div key={settlement.id} className="p-4 rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{settlement.partnerName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                      settlement.status === "paid" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
                      settlement.status === "overdue" ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
                      settlement.status === "processing" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
                      "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                    }`}>{settlement.status}</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Periode: {settlement.periodStart} - {settlement.periodEnd} • Deadline: {settlement.deadline}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#cba258]">Rp{settlement.totalCommission.toLocaleString("id-ID")}</span>
                  <p className="text-[9px] text-neutral-500">{settlement.totalTransactions} transaksi</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: Export */}
      {tab === "export" && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#cba258]" />
              Export Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { type: "partners", label: "Semua Partner", desc: "Profil lengkap + rekening + e-wallet + stats", icon: Users },
                { type: "transactions", label: "Transaksi Periode", desc: "Detail transaksi per bulan", icon: FileText },
                { type: "settlements", label: "Settlement Report", desc: "Laporan settlement per periode", icon: DollarSign },
              ].map(exp => {
                const Icon = exp.icon;
                return (
                  <button key={exp.type} onClick={() => handleExport(exp.type as any)}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-[#262626] text-left hover:border-[#cba258]/50 hover:bg-[#cba258]/5 transition-colors">
                    <Icon className="w-5 h-5 text-[#cba258] mb-2" />
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">{exp.label}</span>
                    <span className="text-[10px] text-neutral-500">{exp.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111]">
            <span className="text-[10px] font-mono text-neutral-500">Semua waktu dalam WIB (UTC+7). Format: DD/MM/YYYY HH:MM WIB</span>
          </div>
        </div>
      )}
    </div>
  );
}

function handleExport(type: string) {
  // Placeholder — nanti connect ke API export
  alert(`Export ${type} — fitur ini akan terhubung ke backend saat implementasi Azure Functions.`);
}
