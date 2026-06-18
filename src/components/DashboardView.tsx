/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppTab, MarketingAsset, Contact, Branch } from '../types';
import LeadHeatmap from './LeadHeatmap';
import AIForecast from './AIForecast';
import {
  Sparkles,
  Compass,
  Users,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PlusCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface DashboardViewProps {
  onSwitchTab: (tab: AppTab) => void;
  assets: MarketingAsset[];
  contacts: Contact[];
  branches: Branch[];
  onOpenConsultant: () => void;
  theme?: 'light' | 'dark';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1.5 font-sans">
        <p className="font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{label} 2026</p>
        {payload.map((entry: any, index: number) => {
          const isTotal = entry.name === 'Total Leads';
          const icon = isTotal ? '📈' : '🎯';
          const colorClass = isTotal ? 'text-[#00A3E0]' : 'text-[#0A3D62] dark:text-cyan-400';
          return (
            <div key={index} className="flex items-center gap-4 justify-between">
              <span className="text-slate-500 dark:text-slate-300 font-medium">
                {icon} {entry.name}:
              </span>
              <span className={`font-mono font-bold ${colorClass}`}>
                {entry.value.toLocaleString('id-ID')} Prospek
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function DashboardView({
  onSwitchTab,
  assets,
  contacts,
  branches,
  onOpenConsultant,
  theme = 'dark'
}: DashboardViewProps) {
  const [chartFilter, setChartFilter] = useState<'30_days' | '3_months' | 'ytd'>('ytd');

  // Calculated stats from props
  const totalAssetsCount = assets.length + 8; // Including pre-populated history
  const activeLeadsCount = contacts.length + 2580; // Large prefilled numbers
  const activeBranchHealth = branches.filter((b) => b.status === 'excellent').length;

  // Dynamic Leads Growth Data for Recharts
  const dynamicNewLeads = 130 + contacts.length;
  const dynamicTotalLeads = 2580 + contacts.length;

  // Generate data based on the selected filter
  let leadGrowthData = [];
  let yAxisLeftDomain = [1000, 2800 + contacts.length];
  let yAxisRightDomain = [100, 350 + contacts.length];

  if (chartFilter === '30_days') {
    leadGrowthData = [
      { name: 'W1', 'Total Leads': 2470, 'Leads Baru': 45 },
      { name: 'W2', 'Total Leads': 2515, 'Leads Baru': 50 },
      { name: 'W3', 'Total Leads': 2555, 'Leads Baru': 65 },
      { name: 'W4', 'Total Leads': dynamicTotalLeads, 'Leads Baru': dynamicNewLeads },
    ];
    yAxisLeftDomain = [2400, 2650 + contacts.length];
    yAxisRightDomain = [20, 180 + contacts.length];
  } else if (chartFilter === '3_months') {
    leadGrowthData = [
      { name: 'Apr', 'Total Leads': 2240, 'Leads Baru': 260 },
      { name: 'Mei', 'Total Leads': 2450, 'Leads Baru': 210 },
      { name: 'Jun', 'Total Leads': dynamicTotalLeads, 'Leads Baru': dynamicNewLeads },
    ];
    yAxisLeftDomain = [2100, 2700 + contacts.length];
    yAxisRightDomain = [80, 360 + contacts.length];
  } else {
    leadGrowthData = [
      { name: 'Jan', 'Total Leads': 1450, 'Leads Baru': 190 },
      { name: 'Feb', 'Total Leads': 1720, 'Leads Baru': 270 },
      { name: 'Mar', 'Total Leads': 1980, 'Leads Baru': 260 },
      { name: 'Apr', 'Total Leads': 2240, 'Leads Baru': 260 },
      { name: 'Mei', 'Total Leads': 2450, 'Leads Baru': 210 },
      { name: 'Jun', 'Total Leads': dynamicTotalLeads, 'Leads Baru': dynamicNewLeads },
    ];
    yAxisLeftDomain = [1200, 2800 + contacts.length];
    yAxisRightDomain = [100, 350 + contacts.length];
  }

  // Growth indicators compared to previous period
  let growthPercentage = '0.0';
  let isGrowthPositive = true;
  let comparisonPeriodLabel = '';

  if (chartFilter === '30_days') {
    const previousLeads = 210;
    const currentLeads = 160 + dynamicNewLeads; // 45 + 50 + 65 + dynamicNewLeads
    const diff = currentLeads - previousLeads;
    growthPercentage = ((diff / previousLeads) * 100).toFixed(1);
    isGrowthPositive = diff >= 0;
    comparisonPeriodLabel = "vs 30 hari lalu";
  } else if (chartFilter === '3_months') {
    const previousLeads = 520;
    const currentLeads = 470 + dynamicNewLeads; // 260 + 210 + dynamicNewLeads
    const diff = currentLeads - previousLeads;
    growthPercentage = ((diff / previousLeads) * 100).toFixed(1);
    isGrowthPositive = diff >= 0;
    comparisonPeriodLabel = "vs kuartal lalu";
  } else {
    // ytd (accumulative total compared to baseline target of 1850)
    const baselineLeads = 1850;
    const currentLeads = dynamicTotalLeads;
    const diff = currentLeads - baselineLeads;
    growthPercentage = ((diff / baselineLeads) * 100).toFixed(1);
    isGrowthPositive = diff >= 0;
    comparisonPeriodLabel = "vs target baseline YTD";
  }

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#1f2937' : '#e2e8f0';
  const labelColor = isDark ? '#768390' : '#475569';
  
  const activities = [
    {
      id: 'act_1',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
      user: 'Yuki - Admin Bandung',
      action: 'menyinkronkan Aset Promosi',
      target: 'SaaS CRM Pro',
      time: '5 menit lalu',
      type: 'branding'
    },
    {
      id: 'act_2',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
      user: 'Sistem VOXIA AI',
      action: 'menghitung skor prospek baru',
      target: 'Andini Putri (Score 88)',
      time: '15 menit lalu',
      type: 'crm'
    },
    {
      id: 'act_3',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
      user: 'Indah - Outlet Surabaya',
      action: 'membuat Lead baru via WhatsApp',
      target: 'Agus Santoso',
      time: '1 jam lalu',
      type: 'crm'
    },
    {
      id: 'act_4',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
      user: 'Zahra Admin',
      action: 'merumuskan Blueprint Strategi digital',
      target: 'Fashion Mentari Busana',
      time: '3 jam lalu',
      type: 'strategy'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-850 dark:to-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            Selamat Datang, Zahra! <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Dasbor terpadu VOXIA mengotomatisasi bauran kreatif, perumusan strategi corong sales, serta lead-scoring multi-wilayah secara tak terbatas.
          </p>
        </div>
        
        <button
          onClick={onOpenConsultant}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00A3E0] hover:bg-[#0092c8] text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-cyan-500/10 cursor-pointer self-start md:self-center"
        >
          <MessageSquare size={16} />
          Tanya VOXIA AI Assistant
        </button>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Total Aset Kreatif
              </span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">
                {totalAssetsCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#0A3D62] dark:text-blue-400">
              <Sparkles size={18} />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Siklus Kampanye Aktif</span>
              <span className="font-mono">4 of 5 tahapan</span>
            </div>
            {/* Custom progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#0A3D62] h-full rounded-full transition-all duration-500"
                style={{ width: '80%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Analisis Blueprint
              </span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">
                {branches.length + 1}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
              <Compass size={18} />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Alokasi Bujet Akurat</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                +18.5% Efisiensi <ArrowUpRight size={12} />
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#00A3E0] h-full rounded-full transition-all duration-500"
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Prospek di Pipeline
              </span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">
                {activeLeadsCount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Users size={18} />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Rasio Konversi Rata-rata</span>
              <span className="font-mono">14.2%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#FFB400] h-full rounded-full transition-all duration-500"
                style={{ width: '62%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Kesehatan Cabang
              </span>
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1 block">
                {activeBranchHealth}/{branches.length} <span className="text-sm font-semibold text-emerald-500">Prima</span>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <MapPin size={18} />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Sinergi HQ & Cabang</span>
              <span className="font-mono text-emerald-500 font-bold">Sinkron</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: '92%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Growth Trend Section */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800/40">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                <TrendingUp size={16} className="text-[#00A3E0]" /> Analisis Tren Pertumbuhan Prospek (Leads Growth)
              </h2>
              
              {/* Dynamic growth indicator pill */}
              <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-0.5 select-none ${
                isGrowthPositive 
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
              }`}>
                {isGrowthPositive ? <ArrowUpRight size={12} className="shrink-0" /> : <ArrowDownRight size={12} className="shrink-0" />}
                <span>{isGrowthPositive ? '+' : ''}{growthPercentage}%</span>
                <span className="text-[9px] font-medium opacity-85 text-slate-500 dark:text-slate-400 font-sans ml-1">({comparisonPeriodLabel})</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualisasi historis akumulasi prospek baru dan momentum pendaftaran bulanan platform VOXIA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Filter Button Group */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
              <button
                onClick={() => setChartFilter('30_days')}
                className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  chartFilter === '30_days'
                    ? 'bg-white dark:bg-slate-800 text-[#00A3E0] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setChartFilter('3_months')}
                className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  chartFilter === '3_months'
                    ? 'bg-white dark:bg-slate-800 text-[#00A3E0] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Last 3 Months
              </button>
              <button
                onClick={() => setChartFilter('ytd')}
                className={`px-3 py-1.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  chartFilter === 'ytd'
                    ? 'bg-white dark:bg-slate-800 text-[#00A3E0] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Year to Date
              </button>
            </div>

            {/* Quick Metrics Legends */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs border-l border-slate-150 dark:border-slate-800 pl-4 sm:pl-6">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-medium block text-[10px] uppercase font-mono">Total Akumulasi</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-white font-mono">
                  {dynamicTotalLeads.toLocaleString('id-ID')} <span className="text-xs font-normal text-[#00A3E0]">pt</span>
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 font-medium block text-[10px] uppercase font-mono">Rerata Bulanan</span>
                <span className="text-base font-extrabold text-[#0A3D62] dark:text-cyan-400 font-mono">
                  {chartFilter === '30_days' ? '~55' : chartFilter === '3_months' ? '~200' : '~215'} <span className="text-xs font-normal">leads</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Composed Chart Block */}
        <div className="h-72 w-full select-none">
          <div
            key={chartFilter}
            className="w-full h-full animate-fadeInUp"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={leadGrowthData}
                margin={{ top: 10, right: 5, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A3E0" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00A3E0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke={labelColor}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                  className="font-mono"
                />
                <YAxis
                  yAxisId="left"
                  stroke={labelColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                  domain={yAxisLeftDomain}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={labelColor}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  className="font-mono"
                  domain={yAxisRightDomain}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: '11px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 605,
                    paddingBottom: '10px'
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="Total Leads"
                  stroke="#00A3E0"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  animationDuration={850}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Leads Baru"
                  stroke={isDark ? '#38bdf8' : '#0A3D62'}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1.5, fill: isDark ? '#0d1117' : '#ffffff' }}
                  activeDot={{ r: 6 }}
                  animationDuration={850}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly Lead Conversion activity heatmap with D3 scale */}
      <LeadHeatmap theme={theme} />

      {/* Dynamic predictive simulation segment using historical/live client counts */}
      <AIForecast contacts={contacts} theme={theme} />

      {/* Main Grid: Interactive Tiles & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Action Tasks Tiles */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold tracking-wider text-slate-400 uppercase">
              Tindakan Cepat (Quick Actions)
            </h2>
            <Activity size={15} className="text-slate-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tile 1 */}
            <button
              onClick={() => onSwitchTab('branding')}
              className="p-5 text-left rounded-xl bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800/40 dark:to-slate-850 border border-slate-100 hover:border-[#0A3D62] dark:border-slate-800 dark:hover:border-blue-500 group shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#0A3D62] dark:group-hover:text-blue-400 transition-colors">
                Buat Aset Kreatif Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Buat ad copy dan visual instan untuk produk Anda dengan parameter persona Gen-Z atau Retail.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-[#0A3D62] dark:text-cyan-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Generator Tab <ChevronRight size={12} />
              </div>
            </button>

            {/* Tile 2 */}
            <button
              onClick={() => onSwitchTab('strategy')}
              className="p-5 text-left rounded-xl bg-gradient-to-br from-cyan-50/50 to-white dark:from-slate-800/40 dark:to-slate-850 border border-slate-100 hover:border-[#0A3D62] dark:border-slate-800 dark:hover:border-cyan-500 group shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-100/40 dark:bg-cyan-900/10 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Compass size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#0a3d62] dark:group-hover:text-cyan-400 transition-colors">
                Rujuk Strategi Blueprint
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Luncurkan wizard strategi 4 langkah guna menganalisis alur funnel pasar dan estimasi anggaran iklan.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-cyan-600 dark:text-cyan-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Launch Wizard <ChevronRight size={12} />
              </div>
            </button>

            {/* Tile 3 */}
            <button
              onClick={() => onSwitchTab('crm')}
              className="p-5 text-left rounded-xl bg-gradient-to-br from-amber-50/50 to-white dark:from-slate-800/40 dark:to-slate-850 border border-slate-100 hover:border-[#0A3D62] dark:border-slate-800 dark:hover:border-amber-500 group shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#0a3d62] dark:group-hover:text-amber-400 transition-colors">
                Atur Prospek & Automasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Impor kontak baru dari CSV/WhatsApp, hitung AI-Score prospek, dan rancang trigger no-code otomatis.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 dark:text-cyan-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                CRM Pipeline <ChevronRight size={12} />
              </div>
            </button>

            {/* Tile 4 */}
            <button
              onClick={() => onSwitchTab('branches')}
              className="p-5 text-left rounded-xl bg-gradient-to-br from-emerald-50/50 to-white dark:from-slate-800/40 dark:to-slate-850 border border-slate-100 hover:border-[#0A3D62] dark:border-slate-800 dark:hover:border-emerald-500 group shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#0A3D62] dark:group-hover:text-emerald-400 transition-colors">
                Tambah & Sync Cabang Baru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Pantau cakupan data penjualan multi-outlet pada peta geografis dan kelola sinkronisasi aset pusat.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-cyan-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Branch Dashboard <ChevronRight size={12} />
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-mono font-bold tracking-wider text-slate-400 uppercase">
            Aktivitas Terkini (Recent Feed)
          </h2>

          <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 text-xs leading-normal">
                <img
                  src={activity.avatar}
                  alt={activity.user}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-100 select-none"
                />
                <div className="flex-1 space-y-0.5">
                  <div className="text-slate-800 dark:text-slate-200">
                    <span className="font-bold text-slate-950 dark:text-white">
                      {activity.user}
                    </span>{' '}
                    {activity.action}{' '}
                    <span className="font-semibold text-[#00A3E0] bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                      {activity.target}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock size={10} /> {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Info Bar */}
      <div className="text-center p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span className="flex items-center gap-1">
          <CheckCircle size={14} className="text-emerald-500" /> Server VOXIA cloud berjalan optimal di Cloud Run.
        </span>
        <span className="hidden sm:inline">|</span>
        <button
          onClick={onOpenConsultant}
          className="text-[#0A3D62] dark:text-cyan-400 hover:underline font-bold transition flex items-center gap-1 cursor-pointer"
        >
          Butuh Bantuan? Mulai chat live di pojok kanan bawah
        </button>
      </div>
    </div>
  );
}
