/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Branch } from '../types';
import {
  MapPin,
  Map as MapIcon,
  Award,
  CircleCheck,
  TrendingUp,
  Settings,
  ShieldCheck,
  Download,
  Plus,
  Compass,
  DollarSign,
  Users2,
  ChevronRight,
  RefreshCw,
  GitMerge,
  ToggleLeft
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface BranchesViewProps {
  branches: Branch[];
  setBranches: React.Dispatch<React.SetStateAction<Branch[]>>;
  addToast: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

export default function BranchesView({
  branches,
  setBranches,
  addToast
}: BranchesViewProps) {
  // Dropdown select active branch
  const [activeBranchId, setActiveBranchId] = useState<string>('All');

  // New branch modal states
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('Surabaya');
  const [showAddBranch, setShowAddBranch] = useState(false);

  // Sync animation simulation triggers
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter branches or active target
  const activeBranch = branches.find((b) => b.id === activeBranchId);

  // Calculation total KPI when status is 'All'
  const totalSalesAll = branches.reduce((acc, curr) => acc + curr.sales, 0);
  const totalLeadsAll = branches.reduce((acc, curr) => acc + curr.leads, 0);

  // Stacked chart data representation for 'All' branch
  const stackedChartData = branches.map((b) => ({
    name: b.name.replace('VOXIA ', '').replace('Outlet - ', '').replace('HQ - ', '').replace('Distrik - ', '').replace('Pop-up - ', ''),
    Laba: b.sales / 1000000, // In Millions
    Prospek: b.leads
  }));

  const triggerBranchSync = () => {
    setIsSyncing(true);
    addToast('Memulai sinkronisasi pustaka materi HQ ke cabang-cabang lokal...', 'success');
    
    setTimeout(() => {
      setIsSyncing(false);
      setBranches(
        branches.map((b) =>
          b.customSettings.syncWithHQ
            ? { ...b, usageCount: b.usageCount + Math.floor(Math.random() * 5 + 1) }
            : b
        )
      );
      addToast('Seluruh cabang yang ter-sync berhasil menyalin bauran kampanye terbaru!', 'success');
    }, 2500);
  };

  const toggleSyncHQSetting = (id: string) => {
    setBranches(
      branches.map((b) =>
        b.id === id
          ? {
              ...b,
              customSettings: {
                ...b.customSettings,
                syncWithHQ: !b.customSettings.syncWithHQ
              }
            }
          : b
      )
    );
    addToast('Konfigurasi sinkronisasi diubah.', 'success');
  };

  const togglePromoHQSetting = (id: string) => {
    setBranches(
      branches.map((b) =>
        b.id === id
          ? {
              ...b,
              customSettings: {
                ...b.customSettings,
                localPromosEnabled: !b.customSettings.localPromosEnabled
              }
            }
          : b
      )
    );
    addToast('Konfigurasi kustomisasi diskon diubah.', 'success');
  };

  const createBranch = () => {
    if (!newBranchName) {
      addToast('Nama cabang tidak boleh kosong!', 'warning');
      return;
    }

    const freshBranch: Branch = {
      id: `branch_${Date.now()}`,
      name: `VOXIA Outlet - ${newBranchName}`,
      city: newBranchCity,
      sales: 12000000,
      leads: 120,
      usageCount: 0,
      status: 'warning',
      coords: { x: Math.floor(Math.random() * 60 + 20), y: Math.floor(Math.random() * 40 + 30) },
      customSettings: {
        syncWithHQ: true,
        localPromosEnabled: false
      }
    };

    setBranches([...branches, freshBranch]);
    setActiveBranchId(freshBranch.id);
    setNewBranchName('');
    setShowAddBranch(false);
    addToast(`Cabang "${newBranchName}" berhasil diregistrasikan di peta!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Upper Context Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-150 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <select
            value={activeBranchId}
            onChange={(e) => setActiveBranchId(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-850 border-slate-205 text-slate-800 dark:text-white font-extrabold focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="All">🌐 Semua Wilayah (HQ + Cabang)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                📍 {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 text-xs">
          <button
            onClick={triggerBranchSync}
            disabled={isSyncing}
            className="px-4 py-2 border border-slate-205 hover:border-[#0A3D62] bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 dark:border-slate-850 dark:text-stone-300 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm text-slate-700"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin text-[#00A3E0]' : ''} />
            Kirim library HQ
          </button>

          <button
            onClick={() => setShowAddBranch(true)}
            className="px-4 py-2 bg-[#00A3E0] hover:bg-[#0092c8] text-white rounded-lg font-extrabold flex items-center gap-1 cursor-pointer shadow"
          >
            <Plus size={13} /> Tambah Cabang
          </button>
        </div>
      </div>

      {/* Main Grid mapping and statistics layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left pane: Interactive Regional Vector SVG coordinate map */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-widest pl-1">
              PETA NASIONAL GEOGRAFIS (INDONESIA DISPLAY COORDS MOCK)
            </span>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold pl-1">
              Berikut lokasi sebaran outlet aktif. Ketuk koordinat pin untuk beralih performa dashboard spesifik wilayah.
            </p>
          </div>

          {/* Majestic Interactive Map Graphic Container */}
          <div className="w-full h-80 bg-[#E0F2FE]/40 dark:bg-slate-900 border border-slate-100 rounded-xl relative select-none overflow-hidden flex items-center justify-center">
            {/* Mocking abstract SVG Indonesian islands */}
            <svg viewBox="0 0 800 400" className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none w-full h-full">
              {/* Sumatra block */}
              <path d="M50,80 L200,180 L180,240 L30,120 Z" fill="#0A3D62" />
              {/* Kalimantan block */ }
              <path d="M280,100 L410,10 L440,210 L310,180 Z" fill="#00A3E0" />
              {/* Java block */}
              <path d="M160,280 L480,310 L470,330 L150,300 Z" fill="#FFB400" />
              {/* Sulawesi block */}
              <path d="M470,110 L560,90 L520,200 L450,150 Z" fill="#4B5563" />
            </svg>

            {/* Render coordinates pins of branches list dynamically */}
            {branches.map((b) => {
              const isSelected = activeBranchId === b.id;
              // Health Indicator colors
              let markerColor = 'bg-emerald-500 border-white ring-emerald-500/30';
              if (b.status === 'warning') {
                markerColor = 'bg-amber-500 border-white ring-amber-500/30';
              } else if (b.status === 'critical') {
                markerColor = 'bg-rose-500 border-white ring-rose-500/30';
              }

              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBranchId(b.id);
                    addToast(`Terfokus ke ${b.name}!`, 'success');
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full ring-4 shadow-lg transition-all cursor-pointer ${markerColor} ${
                    isSelected ? 'scale-150 z-20 ring-blue-500/50' : 'hover:scale-125 hover:z-10 bg-opacity-90'
                  }`}
                  style={{ left: `${b.coords.x}%`, top: `${b.coords.y}%` }}
                  title={b.name}
                >
                  <MapPin size={isSelected ? 14 : 10} className="text-white" />
                </button>
              );
            })}

            {/* Map compass legend */}
            <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-slate-850/80 p-2.5 rounded border text-[9px] font-bold text-slate-500 flex flex-wrap gap-2">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Prima</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Sedikit Melambat</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Kritis</span>
            </div>
          </div>
        </div>

        {/* Right pane: Branch KPIs details and Settings selectors */}
        <div className="lg:col-span-5 space-y-5">
          {/* Header Title Branch focused */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-[#0A3D62] dark:text-cyan-400">
              {activeBranchId === 'All' ? 'Wilayah : Seluruh Indonesia' : `Wilayah : ${activeBranch?.name}`}
            </span>
            <span className="font-mono text-slate-400">STATUS : AKTIF</span>
          </div>

          {/* Mini focused metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
              <span className="block text-slate-400 text-[9px] font-bold uppercase">PENJUALAN TERREALISASI</span>
              <span className="text-lg font-extrabold mt-1 block font-mono text-slate-800 dark:text-white">
                Rp {activeBranchId === 'All' ? totalSalesAll.toLocaleString('id-ID') : activeBranch?.sales.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
              <span className="block text-slate-400 text-[9px] font-bold uppercase">PROSPEK DIKANDANGKAN</span>
              <span className="text-lg font-extrabold mt-1 block font-mono text-slate-850 dark:text-white">
                {activeBranchId === 'All' ? totalLeadsAll.toLocaleString('id-ID') : activeBranch?.leads.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Dynamic Content Display */}
          {activeBranchId === 'All' ? (
            /* ALL BRANCHES: Stacked bar charts showing contribution */
            <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-slate-400 block uppercase pl-1">
                KONTRIBUSI LABA TIAP OUTLET (Rp Juta)
              </h4>
              <div className="min-h-[160px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={stackedChartData}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={9} />
                    <YAxis stroke="#888888" fontSize={9} />
                    <Tooltip />
                    <Bar dataKey="Laba" fill="#0A3D62" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* SINGLE BRANCH DETAILED SETTINGS WIDGET GEAR */
            <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Settings size={12} /> CONFIG SETTINGS : {activeBranch?.city}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Use count: {activeBranch?.usageCount}</span>
              </div>

              {activeBranch && (
                <div className="space-y-4 text-xs font-semibold text-slate-750">
                  {/* Setting Toggle 1 */}
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-105">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 dark:text-white block">Sinkronisasi Penuh Pusat (Sync HQ)</span>
                      <p className="text-[10px] text-slate-400 font-medium">Bauran aset & blueprint dari HQ disalin otomatis.</p>
                    </div>

                    <button
                      onClick={() => toggleSyncHQSetting(activeBranch.id)}
                      className={`font-bold py-1 px-2.5 rounded border text-[10px] cursor-pointer transition ${
                        activeBranch.customSettings.syncWithHQ
                          ? 'bg-[#00A3E0]/15 text-[#00A3E0] border-[#00A3E0]/40'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {activeBranch.customSettings.syncWithHQ ? '✓ AKTIF' : '❌ OFF'}
                    </button>
                  </div>

                  {/* Setting Toggle 2 */}
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-105">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800 dark:text-white block">Kustom Diskon Lokal</span>
                      <p className="text-[10px] text-slate-400 font-medium">Izinkan tim wilayah mengekstrak potongan harga kustom.</p>
                    </div>

                    <button
                      onClick={() => togglePromoHQSetting(activeBranch.id)}
                      className={`font-bold py-1 px-2.5 rounded border text-[10px] cursor-pointer transition ${
                        activeBranch.customSettings.localPromosEnabled
                          ? 'bg-[#FFB400]/15 text-[#FFB400] border-[#FFB400]/40'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                    >
                      {activeBranch.customSettings.localPromosEnabled ? '✓ AKTIF' : '❌ OFF'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NEW BRANCH POPUP DIALOG */}
      {showAddBranch && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 p-6 max-w-sm w-full rounded-2xl relative border shadow-2xl space-y-4 border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Registrasikan Cabang / Outlet Baru</h3>
            
            <div className="space-y-3">
              <div className="space-y-1 text-xs">
                <label className="text-slate-450 font-bold">Nama Cabang</label>
                <input
                  type="text"
                  placeholder="Contoh: Yogyakarta Malioboro"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-950/40 text-slate-850 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 text-xs">
                <label className="text-slate-450 font-bold">Kota Pengawasan</label>
                <select
                  value={newBranchCity}
                  onChange={(e) => setNewBranchCity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-950/40 text-slate-850 dark:text-white"
                >
                  <option>Yogyakarta</option>
                  <option>Surabaya</option>
                  <option>Denpasar</option>
                  <option>Makassar</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                onClick={() => setShowAddBranch(false)}
                className="px-3.5 py-1.5 border hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={createBranch}
                className="px-4 py-1.5 bg-[#00A3E0] hover:bg-[#0092c8] text-white rounded-lg cursor-pointer"
              >
                Registrasikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
