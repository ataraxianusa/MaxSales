/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppTab, MarketingAsset, RecommendationStrategy, Contact, CompetitorData, Branch, UnifiedChatSession } from './types';
import {
  INITIAL_MARKETING_ASSETS,
  INITIAL_STRATEGY,
  INITIAL_CONTACTS,
  INITIAL_COMPETITORS,
  INITIAL_BRANCHES
} from './data';

// Import View Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import BrandingView from './components/BrandingView';
import StrategyView from './components/StrategyView';
import CrmView from './components/CrmView';
import CompetitorView from './components/CompetitorView';
import BranchesView from './components/BranchesView';

// Global Icon imports
import {
  Search,
  Bell,
  Sparkles,
  MessageSquare,
  X,
  Send,
  HelpCircle,
  Eye,
  Keyboard,
  Compass,
  Database,
  Users,
  Sun,
  Moon,
  CreditCard,
  User,
  Shield,
  Check,
  Download,
  Lock,
  Calendar,
  Building,
  Phone,
  ArrowRight,
  BarChart3,
  Brain,
  Target,
  TrendingUp,
  Zap,
  Globe,
  ChevronRight,
  Play,
  Home
} from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

// ─────────────────────────────────────────────────────────────
// LANDING PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
function LandingPage({ onEnterDashboard }: { onEnterDashboard: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain size={22} />,
      title: 'AI Sales Advisor',
      desc: 'Asisten cerdas berbasis Voxia AI yang membantu strategi penjualan dan analisis prospek secara real-time.',
    },
    {
      icon: <Target size={22} />,
      title: 'CRM Automation',
      desc: 'Kelola ribuan kontak dan pipeline prospek dengan scoring otomatis serta tracking konversi terpusat.',
    },
    {
      icon: <BarChart3 size={22} />,
      title: 'Competitor Intelligence',
      desc: 'Pantau pergerakan kompetitor dan analisis kesenjangan pasar untuk merebut peluang lebih cepat.',
    },
    {
      icon: <Globe size={22} />,
      title: 'Multi-Cabang',
      desc: 'Sinkronisasi data penjualan seluruh jaringan cabang dalam satu dashboard terintegrasi.',
    },
    {
      icon: <Zap size={22} />,
      title: 'Branding Generator',
      desc: 'Buat aset promosi berkualitas tinggi dengan Voxia AI dalam hitungan detik — siap pakai untuk semua kanal.',
    },
    {
      icon: <TrendingUp size={22} />,
      title: 'Strategy Engine',
      desc: 'Rekomendasi strategi penjualan berbasis data historis dan tren pasar yang selalu diperbarui.',
    },
  ];

  const stats = [
    { value: '10x', label: 'Peningkatan Efisiensi Tim Sales' },
    { value: '98%', label: 'Tingkat Kepuasan Pengguna' },
    { value: '500+', label: 'Bisnis Aktif Terdaftar' },
    { value: '24/7', label: 'Dukungan Voxia AI Non-Stop' },
  ];

  return (
    <div className="min-h-screen bg-[#07090d] text-gray-200 font-sans overflow-x-hidden">
      {/* ── NAV ────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#07090d]/95 backdrop-blur-md border-b border-slate-800/60 shadow-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 bg-[#00A3E0] text-black font-extrabold rounded-lg text-xs tracking-wider leading-none">
              VOXIA AI
            </span>
            <span className="text-base font-black text-white tracking-tight hidden sm:inline">
              MaxSales
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#statistik" className="hover:text-white transition-colors">Statistik</a>
            <a href="#harga" className="hover:text-white transition-colors">Harga</a>
          </div>

          {/* CTA Nav */}
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-[#00A3E0] hover:bg-[#0092c8] text-black text-sm font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-[#00A3E0]/20"
          >
            <Play size={14} />
            Live Demo
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
        {/* Atmospheric glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00A3E0]/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/6 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-400/5 rounded-full blur-[60px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00A3E0]/10 border border-[#00A3E0]/30 rounded-full text-[#00A3E0] text-xs font-bold tracking-wider mb-6 relative z-10">
          <Sparkles size={12} className="animate-pulse" />
          Powered by Voxia AI · Versi 2.0 · 2026
        </div>

        {/* Heading */}
        <h1 className="relative z-10 text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.05] max-w-4xl mb-6 tracking-tight">
          Platform CRM &amp; Sales AI{' '}
          <span className="text-[#00A3E0]">Paling Cerdas</span>{' '}
          untuk Bisnis Modern
        </h1>

        {/* Sub */}
        <p className="relative z-10 text-slate-400 text-base sm:text-lg max-w-2xl mb-10 leading-relaxed font-medium">
          MaxSales by VOXIA mengintegrasikan kecerdasan Voxia AI, CRM otomatis, intel kompetitor, dan
          manajemen multi-cabang dalam satu platform yang siap pakai hari ini.
        </p>

        {/* Hero CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onEnterDashboard}
            className="group flex items-center gap-3 px-8 py-4 bg-[#00A3E0] hover:bg-[#0092c8] text-black font-extrabold rounded-xl text-base transition-all active:scale-95 shadow-2xl shadow-[#00A3E0]/30 hover:shadow-[#00A3E0]/50"
          >
            <Play size={18} />
            LIVE DEMO — Masuk Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#fitur"
            className="flex items-center gap-2 px-8 py-4 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold rounded-xl text-base transition-all"
          >
            Lihat Fitur
            <ChevronRight size={16} />
          </a>
        </div>

        {/* Hero screenshot mock */}
        <div className="relative z-10 mt-16 w-full max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-black/60 bg-[#0a0c10]">
            {/* Mock browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-[#0d1117] border-b border-slate-800">
              <span className="w-3 h-3 rounded-full bg-rose-500/70" />
              <span className="w-3 h-3 rounded-full bg-amber-500/70" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="flex-1 mx-4 px-3 py-1 bg-slate-900 rounded text-slate-500 text-xs font-mono">
                ataraxianusa.github.io/MaxSales/
              </div>
            </div>
            {/* Dashboard preview using CSS art */}
            <div className="flex h-48 sm:h-64">
              {/* Sidebar mock */}
              <div className="w-14 bg-[#07090d] border-r border-slate-800 flex flex-col items-center py-4 gap-3">
                {['🏠','🌸','📍','👥','📊','🌐'].map((icon, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${i === 0 ? 'bg-[#00A3E0]/20 text-[#00A3E0]' : 'text-slate-600'}`}>
                    {icon}
                  </div>
                ))}
              </div>
              {/* Main area mock */}
              <div className="flex-1 p-4 space-y-3 overflow-hidden">
                {/* KPI row */}
                <div className="grid grid-cols-4 gap-2">
                  {['Rp 184M', '3.2K', '86%', '47'].map((val, i) => (
                    <div key={i} className="bg-slate-900 rounded-lg p-2.5 border border-slate-800">
                      <div className="text-[#00A3E0] text-xs font-black font-mono">{val}</div>
                      <div className="text-slate-600 text-[9px] mt-0.5">
                        {['Revenue', 'Prospek', 'Konversi', 'Cabang'][i]}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Chart mock */}
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 h-16 flex items-end gap-1">
                  {[40,65,45,80,55,90,70,85,60,75,95,88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i === 11 ? '#00A3E0' : `rgba(0,163,224,${0.2 + i * 0.05})`
                      }}
                    />
                  ))}
                </div>
                {/* Table mock */}
                <div className="space-y-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="w-4 h-4 rounded-full bg-slate-800" />
                      <div className="flex-1 h-2 bg-slate-800 rounded" style={{width: `${80 - i * 15}%`}} />
                      <div className="w-10 h-2 bg-[#00A3E0]/20 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under screenshot */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-[#00A3E0]/10 blur-2xl rounded-full" />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 text-xs animate-bounce">
          <span>Scroll</span>
          <ChevronRight size={14} className="rotate-90" />
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section id="statistik" className="py-16 border-y border-slate-800/50 bg-[#0d1117]/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl font-black text-[#00A3E0] font-mono">{s.value}</div>
              <div className="text-xs text-slate-400 font-medium leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="fitur" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-[#00A3E0]/10 text-[#00A3E0] text-xs font-bold rounded-full border border-[#00A3E0]/20 mb-4">
              FITUR UNGGULAN
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Semua Yang Dibutuhkan Tim Sales
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
              Satu platform lengkap dengan Voxia AI terintegrasi — dari prospek pertama hingga closing deal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-5 rounded-2xl bg-[#0d1117] border border-slate-800 hover:border-[#00A3E0]/40 hover:bg-[#0d1117]/80 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#00A3E0]/10 text-[#00A3E0] flex items-center justify-center mb-4 group-hover:bg-[#00A3E0]/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-sm font-black text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ─────────────────────────────────────────────────────── */}
      <section id="harga" className="py-20 px-6 bg-[#0a0c10]/60">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20 mb-4">
            MULAI GRATIS
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Coba MaxSales Tanpa Biaya
          </h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-lg mx-auto">
            Paket Starter tersedia gratis selamanya. Upgrade ke Pro atau Enterprise kapan saja
            sesuai kebutuhan bisnis Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onEnterDashboard}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-[#00A3E0] hover:bg-[#0092c8] text-black font-extrabold rounded-xl text-base transition-all active:scale-95 shadow-2xl shadow-[#00A3E0]/25"
            >
              <Play size={16} />
              LIVE DEMO — Coba Sekarang
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-4">
            Tidak perlu kartu kredit · Langsung aktif · Data demo tersedia
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#00A3E0] text-black font-extrabold rounded text-[10px]">VOXIA AI</span>
            <span className="font-bold text-slate-500">MaxSales © 2026</span>
          </div>
          <div className="flex gap-4 font-medium">
            <a href="#fitur" className="hover:text-slate-400 transition-colors">Fitur</a>
            <a href="#statistik" className="hover:text-slate-400 transition-colors">Statistik</a>
            <a href="#harga" className="hover:text-slate-400 transition-colors">Harga</a>
            <button onClick={onEnterDashboard} className="hover:text-[#00A3E0] transition-colors">Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  // View state: 'landing' shows landing page, 'app' shows dashboard
  const [view, setView] = useState<'landing' | 'app'>('landing');

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('vox_theme') as 'light' | 'dark') || 'dark'; } catch { return 'dark'; }
  });

  // Current tab routing
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Sidebar collapsible desktop state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Stateful profile details
  const [userProfile, setUserProfile] = useState({
    name: 'Zahra Admin',
    email: 'invezthink@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
    role: 'CRM Administrator',
    phone: '+62 812-3456-7890',
    company: 'Voxia Business Solutions'
  });

  // Edit Profile / Billing Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Billing subscriptions and cards details
  const [billingPlan, setBillingPlan] = useState<'Starter' | 'Pro' | 'Enterprise'>('Starter');
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '4242 4242 4242 4242',
    cardHolder: 'ZAHRA ADMIN',
    expiry: '12/28',
    cvv: '992'
  });
  const [billingHistory, setBillingHistory] = useState([
    { id: 'INV-2026-042', date: '10 Jun 2026', amount: 'Rp 0', status: 'Lunas', description: 'Starter Free Monthly Tier Reset' },
    { id: 'INV-2026-039', date: '10 Mei 2026', amount: 'Rp 0', status: 'Lunas', description: 'Starter Free Monthly Tier Reset' }
  ]);

  // Global States across pages
  const [assets, setAssets] = useState<MarketingAsset[]>(INITIAL_MARKETING_ASSETS);
  const [strategy, setStrategy] = useState<RecommendationStrategy>(INITIAL_STRATEGY);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [competitors, setCompetitors] = useState<CompetitorData[]>(INITIAL_COMPETITORS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);

  // Toast alert states
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<UnifiedChatSession[]>([]);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [currentChatInput, setCurrentChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Theme apply
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('vox_theme', theme); } catch {}
  }, [theme]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen) chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSessions, isChatOpen]);

  const handleBackToLanding = () => {
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── LANDING PAGE VIEW ──────────────────────────────────────
  if (view === 'landing') {
    return <LandingPage onEnterDashboard={() => setView('app')} />;
  }

  // ── DASHBOARD VIEW ─────────────────────────────────────────
  const activeSession = chatSessions.find(s => s.id === activeChatSessionId) || null;

  return (
    <div className={`flex min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        theme={theme}
        setTheme={setTheme}
        addToast={addToast}
        userProfile={userProfile}
        onEditProfile={() => setIsProfileModalOpen(true)}
        onViewBilling={() => setIsBillingModalOpen(true)}
        onBackToLanding={handleBackToLanding}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0a0c10] overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-14 bg-white dark:bg-[#07090d] border-b border-slate-200 dark:border-gray-850 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Back to landing button for mobile (header) */}
            <button
              onClick={handleBackToLanding}
              className="md:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A3E0] transition-colors px-2 py-1 rounded-lg hover:bg-[#00A3E0]/10"
              title="Kembali ke Beranda"
            >
              <Home size={15} />
              <span>Beranda</span>
            </button>
            <div className="hidden md:block">
              <h2 className="text-sm font-bold text-slate-800 dark:text-gray-200 capitalize">
                {activeTab === 'dashboard' ? 'Dashboard Utama' :
                 activeTab === 'branding' ? 'Branding AI Generator' :
                 activeTab === 'strategy' ? 'Strategy AI Engine' :
                 activeTab === 'crm' ? 'CRM & Leads Management' :
                 activeTab === 'competitor' ? 'Competitor Intelligence' :
                 activeTab === 'branches' ? 'Multi-Branch Management' : activeTab}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                VOXIA MaxSales · Powered by Voxia AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900 text-slate-500 dark:text-gray-400 transition-colors">
              <Search size={17} />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900 text-slate-500 dark:text-gray-400 transition-colors relative">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#00A3E0] hover:bg-[#0092c8] text-black text-xs font-bold rounded-lg transition-all shadow-sm shadow-[#00A3E0]/25"
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">Voxia AI</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              theme={theme}
              assets={assets}
              strategy={strategy}
              contacts={contacts}
              competitors={competitors}
              branches={branches}
              addToast={addToast}
            />
          )}
          {activeTab === 'branding' && (
            <BrandingView assets={assets} setAssets={setAssets} theme={theme} addToast={addToast} />
          )}
          {activeTab === 'strategy' && (
            <StrategyView strategy={strategy} setStrategy={setStrategy} theme={theme} addToast={addToast} />
          )}
          {activeTab === 'crm' && (
            <CrmView contacts={contacts} setContacts={setContacts} theme={theme} addToast={addToast} />
          )}
          {activeTab === 'competitor' && (
            <CompetitorView competitors={competitors} setCompetitors={setCompetitors} theme={theme} addToast={addToast} />
          )}
          {activeTab === 'branches' && (
            <BranchesView branches={branches} setBranches={setBranches} theme={theme} addToast={addToast} />
          )}
        </div>
      </main>

      {/* ── TOASTS ──────────────────────────────────────────────── */}
      <div className="fixed bottom-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold max-w-xs border backdrop-blur-sm animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300' :
              toast.type === 'error' ? 'bg-rose-950/90 border-rose-800 text-rose-300' :
              'bg-amber-950/90 border-amber-800 text-amber-300'
            }`}
          >
            {toast.type === 'success' ? <Check size={13} /> : toast.type === 'error' ? <X size={13} /> : <Bell size={13} />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* ── VOXIA AI CHAT PANEL ─────────────────────────────────── */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-[#07090d] border-l border-slate-200 dark:border-gray-800 z-[150] flex flex-col shadow-2xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-[#07090d]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00A3E0]/20 flex items-center justify-center">
                <Sparkles size={14} className="text-[#00A3E0]" />
              </div>
              <div>
                <span className="text-sm font-black text-slate-800 dark:text-gray-100">Voxia AI</span>
                <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-[9px] font-bold rounded-full">ONLINE</span>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900 text-slate-500 dark:text-gray-400 cursor-pointer">
              <X size={17} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!activeSession || activeSession.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-[#00A3E0]/10 flex items-center justify-center">
                  <Sparkles size={24} className="text-[#00A3E0]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-gray-200 mb-1">Selamat datang di Voxia AI</p>
                  <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">Tanyakan apa saja tentang data penjualan, strategi, atau minta saran untuk meningkatkan performa bisnis Anda.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full">
                  {[
                    'Analisis performa penjualan bulan ini',
                    'Buat strategi untuk meningkatkan konversi',
                    'Leads mana yang harus diprioritaskan?',
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentChatInput(q)}
                      className="text-left text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-800 hover:border-[#00A3E0]/50 hover:text-[#00A3E0] transition-all text-slate-500 dark:text-gray-400"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              activeSession.messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#00A3E0] text-black font-medium rounded-br-sm'
                      : 'bg-slate-100 dark:bg-gray-900 text-slate-700 dark:text-gray-300 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-gray-900 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-[#00A3E0] rounded-full animate-bounce" style={{animationDelay: `${i * 0.15}s`}} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-200 dark:border-gray-800">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!currentChatInput.trim() || isChatLoading) return;
                const userMsg = currentChatInput.trim();
                setCurrentChatInput('');
                setIsChatLoading(true);

                let sessionId = activeChatSessionId;
                if (!sessionId) {
                  sessionId = Date.now().toString();
                  const newSession: UnifiedChatSession = { id: sessionId, title: userMsg.slice(0, 40), messages: [], createdAt: new Date().toISOString() };
                  setChatSessions(prev => [newSession, ...prev]);
                  setActiveChatSessionId(sessionId);
                }

                setChatSessions(prev => prev.map(s =>
                  s.id === sessionId
                    ? { ...s, messages: [...s.messages, { role: 'user', content: userMsg, timestamp: new Date().toISOString() }] }
                    : s
                ));

                // Simulate Voxia AI response
                await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
                const aiReply = `Terima kasih atas pertanyaan Anda tentang "${userMsg.slice(0, 60)}...". Sebagai Voxia AI, saya sedang menganalisis data Anda dan akan memberikan insight yang relevan untuk meningkatkan performa penjualan Anda.`;

                setChatSessions(prev => prev.map(s =>
                  s.id === sessionId
                    ? { ...s, messages: [...s.messages, { role: 'assistant', content: aiReply, timestamp: new Date().toISOString() }] }
                    : s
                ));
                setIsChatLoading(false);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={currentChatInput}
                onChange={e => setCurrentChatInput(e.target.value)}
                placeholder="Tanya Voxia AI..."
                className="flex-1 px-3 py-2.5 rounded-xl text-xs bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 focus:outline-none focus:border-[#00A3E0] text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600"
              />
              <button
                type="submit"
                disabled={!currentChatInput.trim() || isChatLoading}
                className="p-2.5 bg-[#00A3E0] hover:bg-[#0092c8] disabled:opacity-40 disabled:cursor-not-allowed text-black rounded-xl transition-all cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE MODAL ──────────────────────────────────── */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 dark:text-gray-100">Edit Profile</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900 text-slate-500 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              {([
                { label: 'Nama Lengkap', key: 'name', icon: <User size={13}/> },
                { label: 'Email', key: 'email', icon: <Database size={13}/> },
                { label: 'Nomor HP', key: 'phone', icon: <Phone size={13}/> },
                { label: 'Perusahaan', key: 'company', icon: <Building size={13}/> },
                { label: 'Role/Jabatan', key: 'role', icon: <Shield size={13}/> },
              ] as { label: string; key: keyof typeof userProfile; icon: React.ReactNode }[]).map(field => (
                <div key={field.key}>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider mb-1">{field.label}</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-lg">
                    <span className="text-slate-400 dark:text-gray-500">{field.icon}</span>
                    <input
                      className="flex-1 bg-transparent text-xs text-slate-700 dark:text-gray-200 focus:outline-none"
                      value={userProfile[field.key]}
                      onChange={e => setUserProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-gray-800 text-xs font-semibold text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-900 cursor-pointer">Batal</button>
              <button
                onClick={() => { setIsProfileModalOpen(false); addToast('Profil berhasil diperbarui!', 'success'); }}
                className="flex-1 py-2 rounded-lg bg-[#00A3E0] hover:bg-[#0092c8] text-black text-xs font-extrabold cursor-pointer transition-all"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BILLING MODAL ───────────────────────────────────────── */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 dark:text-gray-100">Billing &amp; Langganan</h3>
              <button onClick={() => setIsBillingModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900 text-slate-500 cursor-pointer"><X size={16} /></button>
            </div>

            {/* Current Plan */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Paket Aktif</p>
              <div className="grid grid-cols-3 gap-2">
                {(['Starter', 'Pro', 'Enterprise'] as const).map(plan => (
                  <button
                    key={plan}
                    onClick={() => { setBillingPlan(plan); addToast(`Paket diubah ke ${plan}`, 'success'); }}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      billingPlan === plan
                        ? 'bg-[#00A3E0] text-black border-[#00A3E0]'
                        : 'border-slate-200 dark:border-gray-800 text-slate-500 dark:text-gray-400 hover:border-[#00A3E0]/50'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Metode Pembayaran</p>
              <div className="p-3 bg-slate-50 dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={14} className="text-[#00A3E0]" />
                  <span className="text-xs font-bold text-slate-700 dark:text-gray-300">Kartu Kredit / Debit</span>
                  <span className="ml-auto px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded-full">AKTIF</span>
                </div>
                {([
                  { label: 'Nomor Kartu', key: 'cardNumber' },
                  { label: 'Pemegang', key: 'cardHolder' },
                  { label: 'Expired', key: 'expiry' },
                  { label: 'CVV', key: 'cvv' },
                ] as { label: string; key: keyof typeof paymentMethod }[]).map(f => (
                  <div key={f.key} className="flex items-center gap-2 py-1">
                    <span className="text-[10px] text-slate-400 w-24">{f.label}</span>
                    <input
                      className="flex-1 bg-transparent text-xs font-mono text-slate-600 dark:text-gray-300 focus:outline-none"
                      value={f.key === 'cvv' ? '•••' : paymentMethod[f.key]}
                      readOnly={f.key === 'cvv'}
                      onChange={e => setPaymentMethod(prev => ({ ...prev, [f.key]: e.target.value }))}
                    />
                    {f.key !== 'cvv' && <Lock size={10} className="text-slate-400" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Billing History */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Riwayat Tagihan</p>
              <div className="space-y-1.5">
                {billingHistory.map(inv => (
                  <div key={inv.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-gray-900 rounded-lg border border-slate-100 dark:border-gray-800">
                    <Download size={12} className="text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-gray-300 truncate">{inv.id}</p>
                      <p className="text-[10px] text-slate-400 truncate">{inv.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-mono font-bold text-slate-600 dark:text-gray-300">{inv.amount}</p>
                      <p className="text-[9px] text-emerald-400">{inv.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsBillingModalOpen(false)}
              className="w-full mt-5 py-2.5 rounded-xl bg-[#00A3E0] hover:bg-[#0092c8] text-black text-xs font-extrabold cursor-pointer transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
