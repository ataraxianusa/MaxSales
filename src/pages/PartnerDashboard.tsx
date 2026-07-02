import React from "react";
import { PromoCode } from "../types";
import { BarChart3, DollarSign, Users, TrendingUp, ArrowLeft, LogOut, Clock } from "lucide-react";

interface PartnerDashboardProps {
  partnerCode: string;
  onLogout: () => void;
  onBack: () => void;
}

// Mock data — nanti dari API
const MOCK_TRANSACTIONS = [
  { id: "INV-001", user: "Rina Sari", amount: 239200, commission: 47840, date: "2026-07-01", status: "paid" },
  { id: "INV-002", user: "Dewi Lestari", amount: 239200, commission: 47840, date: "2026-07-01", status: "paid" },
  { id: "INV-003", user: "Maya Putri", amount: 209300, commission: 41860, date: "2026-06-30", status: "paid" },
  { id: "INV-004", user: "Andi Wijaya", amount: 239200, commission: 47840, date: "2026-06-29", status: "paid" },
  { id: "INV-005", user: "Siti Nurhaliza", amount: 239200, commission: 47840, date: "2026-06-28", status: "pending" },
];

const MOCK_PAYOUTS = [
  { id: "PO-001", amount: 239200, date: "2026-06-25", status: "paid", method: "Transfer Bank" },
  { id: "PO-002", amount: 191360, date: "2026-06-18", status: "paid", method: "Transfer Bank" },
];

export default function PartnerDashboard({ partnerCode, onLogout, onBack }: PartnerDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "transactions" | "payouts">("overview");

  const totalEarning = MOCK_TRANSACTIONS.reduce((s, t) => s + t.commission, 0);
  const pendingPayout = MOCK_TRANSACTIONS.filter(t => t.status === "pending").reduce((s, t) => s + t.commission, 0);
  const totalPaid = MOCK_PAYOUTS.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-md border-b border-neutral-200 dark:border-[#262626]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">
              <ArrowLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-neutral-900 dark:text-white">Partner Dashboard</h1>
              <p className="text-[10px] font-mono text-[#cba258]">{partnerCode}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total Earning", value: `Rp${totalEarning.toLocaleString("id-ID")}`, icon: DollarSign, color: "text-emerald-500" },
            { label: "Pending Payout", value: `Rp${pendingPayout.toLocaleString("id-ID")}`, icon: Clock, color: "text-amber-500" },
            { label: "Sudah Dibayar", value: `Rp${totalPaid.toLocaleString("id-ID")}`, icon: TrendingUp, color: "text-blue-500" },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="p-4 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111]">
                <div className="flex items-center gap-1.5 mb-2">
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
            { key: "overview" as const, label: "Ringkasan", icon: BarChart3 },
            { key: "transactions" as const, label: "Transaksi", icon: Users },
            { key: "payouts" as const, label: "Payout History", icon: DollarSign },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${activeTab === t.key ? "bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Statistik Kode Promo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A]">
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">{MOCK_TRANSACTIONS.length}</span>
                  <p className="text-[10px] text-neutral-500">Total Pengguna</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A]">
                  <span className="text-2xl font-black text-emerald-500">{MOCK_TRANSACTIONS.filter(t => t.status === "paid").length}</span>
                  <p className="text-[10px] text-neutral-500">Berhasil Bayar</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A]">
                  <span className="text-2xl font-black text-amber-500">{MOCK_TRANSACTIONS.filter(t => t.status === "pending").length}</span>
                  <p className="text-[10px] text-neutral-500">Pending</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A]">
                  <span className="text-2xl font-black text-blue-500">{MOCK_PAYOUTS.length}</span>
                  <p className="text-[10px] text-neutral-500">Payout Diterima</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Transaksi Terbaru</h3>
              <div className="space-y-2">
                {MOCK_TRANSACTIONS.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-[#1A1A1A]">
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">{tx.user}</span>
                      <p className="text-[10px] text-neutral-500">{tx.date} • {tx.id}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+Rp{tx.commission.toLocaleString("id-ID")}</span>
                      <p className={`text-[9px] ${tx.status === "paid" ? "text-emerald-500" : "text-amber-500"}`}>{tx.status === "paid" ? "Dibayar" : "Pending"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        {activeTab === "transactions" && (
          <div className="rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden">
            <div className="grid grid-cols-5 gap-2 px-4 py-2.5 bg-neutral-50 dark:bg-[#1A1A1A] border-b border-neutral-200 dark:border-[#262626] text-[9px] font-bold font-mono text-neutral-500 uppercase">
              <span>ID</span><span>User</span><span>Date</span><span className="text-right">Amount</span><span className="text-right">Komisi</span>
            </div>
            {MOCK_TRANSACTIONS.map(tx => (
              <div key={tx.id} className="grid grid-cols-5 gap-2 px-4 py-3 border-b border-neutral-100 dark:border-[#262626] last:border-0 text-xs">
                <span className="font-mono text-neutral-900 dark:text-white">{tx.id}</span>
                <span className="text-neutral-700 dark:text-neutral-300 truncate">{tx.user}</span>
                <span className="text-neutral-500">{tx.date}</span>
                <span className="text-right text-neutral-900 dark:text-white">Rp{tx.amount.toLocaleString("id-ID")}</span>
                <span className="text-right font-bold text-emerald-600 dark:text-emerald-400">+Rp{tx.commission.toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        )}

        {/* Payouts */}
        {activeTab === "payouts" && (
          <div className="space-y-2">
            {MOCK_PAYOUTS.map(po => (
              <div key={po.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">{po.id}</span>
                    <p className="text-[10px] text-neutral-500">{po.date} • {po.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Rp{po.amount.toLocaleString("id-ID")}</span>
                  <p className="text-[9px] text-emerald-500 font-bold">Dibayar</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
