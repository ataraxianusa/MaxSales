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
  ArrowLeft
} from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('vox_theme') as 'light' | 'dark') || 'dark';
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

  // Search Query state
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);

  // Floating AI Chatbot Assistant state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState<UnifiedChatSession[]>([
    { role: 'model', parts: 'Halo! Saya VOXIA AI Sales Advisor. Tanyakan apa saja mengenai strategi penawaran, copy periklanan, atau analisis data prospek toko Anda.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcuts modal help
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // Add toast alert utility
  const addToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Keyboard shortcuts hotkey listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing shortcut if typing in standard input/textarea/select
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }

      // Alt + 1-6 to switch views
      if (e.altKey && !isNaN(Number(e.key))) {
        const num = Number(e.key);
        const tabs: AppTab[] = ['dashboard', 'branding', 'strategy', 'crm', 'competitor', 'branches'];
        if (num >= 1 && num <= 6) {
          e.preventDefault();
          const targetTab = tabs[num - 1];
          setActiveTab(targetTab);
          addToast(`Beralih ke tab: ${targetTab.toUpperCase()}!`, 'success');
        }
      }

      // Alt + S to focus search bar
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
          addToast('Fokus pencarian global diaktifkan.', 'success');
        }
      }

      // Alt + C to toggle chat bot
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsChatOpen((prev) => !prev);
      }

      // Alt + T to toggle theme
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setTheme((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark';
          addToast(`Tema diubah ke ${next.toUpperCase()}!`, 'success');
          return next;
        });
      }

      // Alt + H to show shortcut modal
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setShowShortcutHelp((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme apply side-effects
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vox_theme', theme);
  }, [theme]);

  // Chat scroll to view
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, isChatLoading]);

  // Perform chatbot help query to back-end express endpoint
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChats((prev) => [...prev, { role: 'user', parts: userMsg }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chatbot-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();
      setChats((prev) => [...prev, { role: 'model', parts: data.reply }]);
    } catch (err) {
      console.error(err);
      setChats((prev) => [...prev, { role: 'model', parts: 'Terjadi pemutusan sambungan server. Silakan hubungi admin IT VOXIA.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Perform Global keyword matching matching
  const matchingContacts = contacts.filter(
    (c) => c.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
           c.email.toLowerCase().includes(globalSearch.toLowerCase())
  );
  
  const matchingCompetitors = competitors.filter(
    (comp) => comp.name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const matchingAssets = assets.filter(
    (a) => a.productName.toLowerCase().includes(globalSearch.toLowerCase()) ||
           a.title.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const totalMatchesCount = 
    (globalSearch ? matchingContacts.length : 0) + 
    (globalSearch ? matchingCompetitors.length : 0) + 
    (globalSearch ? matchingAssets.length : 0);

  return (
    <div className={`${theme} min-h-screen font-sans bg-[#f8fafc] text-slate-800 dark:bg-[#0a0c10] dark:text-gray-200 transition-colors duration-205`}>
      {/* Upper absolute Toast notification feed container */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          let bg = 'bg-slate-800 text-white dark:bg-slate-950';
          if (toast.type === 'success') bg = 'bg-emerald-600 text-white';
          if (toast.type === 'error') bg = 'bg-rose-600 text-white animate-shake';
          if (toast.type === 'warning') bg = 'bg-amber-500 text-slate-950 font-bold';

          return (
            <div
              key={toast.id}
              className={`p-3.5 rounded-xl shadow-lg text-xs leading-normal flex justify-between items-center pointer-events-auto border border-white/10 animate-slideIn`}
            >
              <span>{toast.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-3 hover:opacity-80 p-0.5 rounded cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex relative">
        {/* LEFT COLLAPSED NAV SIDEBAR (Desktop only) */}
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
        />

        {/* RIGHT MAIN CORE CONTAINER (Header Top bar + Selected Content view) */}
        <main className="flex-1 flex flex-col min-w-0 transition-all pb-20 lg:pb-6">
          
          {/* HEADER TOP BAR CONTAINER */}
          <header className="h-16 border-b border-slate-200 dark:border-gray-850 bg-white/95 dark:bg-[#07090d]/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
            {/* Left: Back to Landing button + logo indicator */}
            <div className="flex items-center gap-2.5">
              {/* ← Kembali ke Halaman Muka */}
              <a
                href="/MaxSales/"
                title="Kembali ke Halaman Muka"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0d1117] text-slate-500 dark:text-slate-400 hover:text-[#00A3E0] hover:border-[#00A3E0] transition-colors text-xs font-semibold shrink-0"
              >
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">Beranda</span>
              </a>
              <span className="p-1 px-2.5 bg-[#00A3E0] text-black font-extrabold rounded-lg text-xs font-sans tracking-wider leading-none">
                VOXIA AI
              </span>
              <span className="text-xs font-mono font-bold text-gray-400 tracking-wider uppercase hidden sm:inline">
                / {activeTab}
              </span>
            </div>

            {/* Middle Global search bar with hover results popover */}
            <div className="relative w-64 md:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-450" size={14} />
                <input
                  id="global-search-input"
                  type="text"
                  placeholder="Cari kontak, campaign, aset (Alt+S)..."
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setIsSearchOverlayOpen(!!e.target.value.trim());
                  }}
                  onFocus={() => setIsSearchOverlayOpen(!!globalSearch.trim())}
                  className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs bg-gray-900/60 border-gray-800 dark:bg-gray-900/60 dark:border-gray-800 text-gray-200 font-medium focus:outline-none focus:border-[#00A3E0]"
                />
                {globalSearch && (
                  <button
                    onClick={() => {
                      setGlobalSearch('');
                      setIsSearchOverlayOpen(false);
                    }}
                    className="absolute right-3 top-2.5 text-slate-450 hover:text-black"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Floating Matcher Popover Grid overlay */}
              {isSearchOverlayOpen && globalSearch && (
                <div className="absolute top-11 left-0 right-0 bg-[#111827] border border-gray-800 rounded-xl shadow-2xl p-4 z-40 max-h-80 overflow-y-auto space-y-3.5 animate-fadeIn">
                  <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono uppercase font-bold border-b border-gray-800 pb-1">
                    <span>Hasil Pencarian ({totalMatchesCount} Ditemukan)</span>
                    <button onClick={() => setIsSearchOverlayOpen(false)} className="hover:text-white">Tutup</button>
                  </div>

                  {totalMatchesCount === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Tidak ada data relevan ditemukan.</p>
                  ) : (
                    <div className="space-y-3 font-sans">
                      {/* Contacts found */}
                      {matchingContacts.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1"><Users size={10}/> Prospek</span>
                          {matchingContacts.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setActiveTab('crm');
                                setIsSearchOverlayOpen(false);
                                addToast(`Terfokus ke kontak database: ${c.name}`, 'success');
                              }}
                              className="w-full text-left p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold truncate flex justify-between block cursor-pointer"
                            >
                              <span>{c.name}</span>
                              <span className="text-[10px] text-[#00A3E0] font-mono">🎯 {c.score} pt</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Competitors matched */}
                      {matchingCompetitors.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1"><Compass size={10}/> Intel Kompetitor</span>
                          {matchingCompetitors.map((comp) => (
                            <button
                              key={comp.id}
                              onClick={() => {
                                setActiveTab('competitor');
                                setIsSearchOverlayOpen(false);
                                addToast(`Terpilih riset membanding: ${comp.name}`, 'success');
                              }}
                              className="w-full text-left p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold block cursor-pointer text-slate-700 dark:text-stone-300"
                            >
                              📊 {comp.name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Assets matched */}
                      {matchingAssets.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1"><Database size={10}/> Materi Promosi</span>
                          {matchingAssets.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => {
                                setActiveTab('branding');
                                setIsSearchOverlayOpen(false);
                                addToast(`Meninjau aset: ${a.title}`, 'success');
                              }}
                              className="w-full text-left p-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold block cursor-pointer text-slate-700 dark:text-stone-300"
                            >
                              📁 {a.title} ({a.productName})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right controls: Keyboard shortcut info, notifications and quick alerts */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  const nextTheme = theme === 'dark' ? 'light' : 'dark';
                  setTheme(nextTheme);
                  addToast(`Tema diubah ke ${nextTheme.toUpperCase()}!`, 'success');
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#0d1117] text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors flex items-center justify-center shrink-0"
                title={theme === 'dark' ? 'Ubah ke Mode Terang (Alt+T)' : 'Ubah ke Mode Gelap (Alt+T)'}
              >
                {theme === 'dark' ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} className="text-[#00A3E0]" />}
              </button>

              <button
                onClick={() => setShowShortcutHelp(true)}
                className="p-1 px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#00A3E0] hover:border-slate-300 border border-slate-200 dark:border-gray-800 text-[10px] font-bold font-mono tracking-tight flex items-center gap-1 cursor-pointer shrink-0"
                title="Tampilkan Panduan Shortcut Tombol"
              >
                <Keyboard size={13} /> Alt+H Shortcuts
              </button>

              <button
                onClick={() => addToast('Notifikasi System: Seluruh jaringan multi-cabang terintegrasi prima.', 'success')}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-black relative cursor-pointer"
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-600 rounded-full" />
              </button>
            </div>
          </header>

          {/* CHOSEN COMPONENT VIEWS PORT (Dynamic Route Switches) */}
          <div className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                onSwitchTab={(t) => setActiveTab(t)}
                assets={assets}
                contacts={contacts}
                branches={branches}
                onOpenConsultant={() => setIsChatOpen(true)}
                theme={theme}
              />
            )}

            {activeTab === 'branding' && (
              <BrandingView
                assets={assets}
                setAssets={setAssets}
                addToast={addToast}
              />
            )}

            {activeTab === 'strategy' && (
              <StrategyView
                strategy={strategy}
                setStrategy={setStrategy}
                addToast={addToast}
                onPushToCrm={() => {
                  // Push target match logic to contacts list
                  const updatedContacts = contacts.map((c, i) =>
                    i === 0 ? { ...c, tags: [...new Set([...c.tags, 'Blueprint Target'])] } : c
                  );
                  setContacts(updatedContacts);
                }}
              />
            )}

            {activeTab === 'crm' && (
              <CrmView
                contacts={contacts}
                setContacts={setContacts}
                addToast={addToast}
              />
            )}

            {activeTab === 'competitor' && (
              <CompetitorView
                competitors={competitors}
                setCompetitors={setCompetitors}
                addToast={addToast}
              />
            )}

            {activeTab === 'branches' && (
              <BranchesView
                branches={branches}
                setBranches={setBranches}
                addToast={addToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on smaller viewports only) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-850 border-t border-slate-150 dark:border-slate-800 flex justify-around items-center px-2 lg:hidden z-30 select-none shadow-xl">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
          { id: 'branding', label: 'Branding', icon: '🌸' },
          { id: 'strategy', label: 'Strategy', icon: '📍' },
          { id: 'crm', label: 'CRM', icon: '👥' },
          { id: 'competitor', label: 'Intel', icon: '📊' },
          { id: 'branches', label: 'Cabang', icon: '🌐' }
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as AppTab);
                addToast(`Pindah navigasi: ${item.id.toUpperCase()}`, 'success');
              }}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                isActive
                  ? 'text-[#00A3E0] scale-110 font-bold'
                  : 'text-gray-500 hover:text-gray-200'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[9px] font-bold mt-1 tracking-tight leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* KEYBOARD SHORTCUTS INSTRUCTIONAL MODAL */}
      {showShortcutHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowShortcutHelp(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 border-b pb-2">
              <Keyboard className="text-[#0A3D62] dark:text-cyan-400" size={18} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Pintasan Keyboard (Power User)
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              {[
                { keys: 'Alt + 1', desc: 'Buka Dashboard Utama' },
                { keys: 'Alt + 2', desc: 'Akses Branding Asset Generator Voxia AI' },
                { keys: 'Alt + 3', desc: 'Akses Strategy Recommendation Engine' },
                { keys: 'Alt + 4', desc: 'Buka CRM Customer Automations' },
                { keys: 'Alt + 5', desc: 'Buka Competitor Intelligence Scraper' },
                { keys: 'Alt + 6', desc: 'Akses Sebaran Multi-Cabang Wilayah' },
                { keys: 'Alt + S', desc: 'Fokuskan kursor ke pencarian global' },
                { keys: 'Alt + C', desc: 'Togel dialog asisten Chatbot Voxia AI' },
                { keys: 'Alt + H', desc: 'Tutup / buka jendela panduan ini' }
              ].map((shortcut) => (
                <div key={shortcut.keys} className="flex justify-between items-center py-0.5 border-b border-slate-100/40">
                  <span className="text-slate-500">{shortcut.desc}</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border font-mono font-bold text-[10px] text-slate-800 dark:text-stone-200">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowShortcutHelp(false)}
                className="px-4 py-2 bg-[#0A3D62] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Pahami Pintasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👤 STATEFUL EDIT PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0f121d] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#00A3E0] uppercase block">
                  KONFIGURASI AKUN VOXIA
                </span>
                <h3 className="text-base font-black text-slate-800 dark:text-white font-mono flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#00A3E0]/10 text-[#00A3E0]">
                    <User size={16} />
                  </span>
                  Edit Profil Admin
                </h3>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              addToast('Profil berhasil diperbarui di server VOXIA!', 'success');
              setIsProfileModalOpen(false);
            }}>
              <div className="p-6 space-y-4 max-h-[440px] overflow-y-auto">
                {/* Avatar presets selection */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono block">
                    Pilih Avatar Profil Premium
                  </label>
                  <div className="flex items-center gap-3.5 py-1.5 px-3 bg-slate-50 dark:bg-slate-950/65 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <img
                      src={userProfile.avatar}
                      alt="Pratinjau Avatar"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00A3E0]"
                    />
                    <div className="flex-1">
                      <span className="text-[11px] text-slate-400 font-bold block mb-1">Preset Avatar Populer:</span>
                      <div className="flex gap-2">
                        {[
                          { name: 'Zahra Tech', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
                          { name: 'Arief Exec', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
                          { name: 'Rania Dev', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
                          { name: 'Bimo Geek', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' }
                        ].map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setUserProfile(prev => ({ ...prev, avatar: preset.url }))}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border cursor-pointer transition ${
                              userProfile.avatar === preset.url
                                ? 'bg-[#00A3E0]/15 border-[#00A3E0] text-[#00A3E0]'
                                : 'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-850 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Avatar URL input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono block">
                    Atau Input URL Foto Kustom
                  </label>
                  <input
                    type="url"
                    placeholder="Masukkan tautan gambar https://..."
                    value={userProfile.avatar}
                    onChange={(e) => setUserProfile(p => ({ ...p, avatar: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-830 dark:text-white outline-none focus:ring-1 focus:ring-[#00A3E0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      Nama Lengkap Admin <span className="text-[#00A3E0]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-1 focus:ring-[#00A3E0] outline-none"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      Alamat Email <span className="text-[#00A3E0]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-1 focus:ring-[#00A3E0] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      No. Telepon Aktif
                    </label>
                    <input
                      type="text"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-1 focus:ring-[#00A3E0] outline-none font-mono"
                    />
                  </div>

                  {/* Role field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      Jabatan Perusahaan
                    </label>
                    <input
                      type="text"
                      value={userProfile.role}
                      onChange={(e) => setUserProfile(p => ({ ...p, role: e.target.value }))}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-1 focus:ring-[#00A3E0] outline-none"
                    />
                  </div>
                </div>

                {/* Company name field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                    Nama Perusahaan / Organisasi
                  </label>
                  <input
                    type="text"
                    value={userProfile.company}
                    onChange={(e) => setUserProfile(p => ({ ...p, company: e.target.value }))}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium outline-none focus:ring-1 focus:ring-[#00A3E0]"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold bg-white dark:bg-slate-950 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#00A3E0] to-[#0A3D62] hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#00A3E0]/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💳 STATEFUL BILLING & SUBSCRIPTION HUB MODAL */}
      {isBillingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#0f121d] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden transition-all duration-300 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#00A3E0] uppercase block">
                  SISTEM PEMBAYARAN VOXIA
                </span>
                <h3 className="text-base font-black text-slate-850 dark:text-white font-mono flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <CreditCard size={16} />
                  </span>
                  Portal Langganan & Billing Premium
                </h3>
              </div>
              <button
                onClick={() => setIsBillingModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Top subscription cards comparison */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                  Pilih Paket Subscription
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'Starter', name: 'Starter Free', price: 'Rp 0', period: '/selamanya', desc: 'Sempurna untuk evaluasi awal & simulasi CRM tunggal.', color: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950', badge: 'Gratis', perks: ['10 Voxia AI Predicts harian', 'Peta cabang terintegrasi', 'Optimasi branding visual standard'] },
                    { id: 'Pro', name: 'Pro Premium', price: 'Rp 349.000', period: '/bulan', desc: 'Untuk peningkatan volume konversi prospek cepat dengan kecocokan CS teruji.', color: 'border-cyan-500 ring-2 ring-cyan-500/10 bg-cyan-500/5', badge: 'Terpopuler', perks: ['Unlimited Voxia AI evaluation', 'Analisis kompetitor mendalam', 'Email Broadcast tak terbatas', 'Dashboard trend real-time'] },
                    { id: 'Enterprise', name: 'Enterprise Partner', price: 'Rp 1.899.000', period: '/bulan', desc: 'Disesuaikan dengan korporasi berjejaring besar multi-cabang.', color: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-500/5', badge: 'Dedicated', perks: ['Sinkronisasi Pusat-Cabang HQ', 'Akses instan kustom API', '24/7 dedicated sales advisor', 'Audit branding otomatis mingguan'] }
                  ].map((plan) => {
                    const isActive = billingPlan === plan.id;
                    return (
                      <div 
                        key={plan.id}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between relative transition duration-200 ${isActive ? plan.color : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950'}`}
                      >
                        {isActive && (
                          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                            Aktif
                          </span>
                        )}
                        {!isActive && (
                          <span className="absolute top-3 right-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                            {plan.badge}
                          </span>
                        )}
                        <div>
                          <span className="text-xs font-black text-slate-800 dark:text-gray-100 font-mono block">
                            {plan.name}
                          </span>
                          <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 leading-normal font-medium h-10">
                            {plan.desc}
                          </p>
                          <div className="mt-3">
                            <span className="text-xl font-black text-slate-800 dark:text-white font-mono">{plan.price}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{plan.period}</span>
                          </div>
                          
                          <div className="border-t border-dashed border-slate-250 dark:border-slate-800 my-3"></div>
                          
                          <ul className="space-y-1.5 text-[10px]">
                            {plan.perks.map((perk, perkIdx) => (
                              <li key={perkIdx} className="flex items-center gap-1.5 text-slate-600 dark:text-gray-300 font-medium">
                                <span className="text-[#00A3E0] shrink-0 font-bold">✓</span>
                                <span className="truncate">{perk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (isActive) {
                              addToast(`Anda sudah berada di paket ${plan.name}!`, 'warning');
                              return;
                            }
                            addToast(`Sedang memproses perubahan ke paket ${plan.name}...`, 'success');
                            setTimeout(() => {
                              setBillingPlan(plan.id as any);
                              const randInvId = 'INV-2026-' + Math.floor(Math.random() * 900 + 100);
                              const newInv = {
                                id: randInvId,
                                date: 'Hari Ini',
                                amount: plan.price,
                                status: 'Lunas',
                                description: `Upgraded ke Paket Premium ${plan.name}`
                              };
                              setBillingHistory([newInv, ...billingHistory]);
                              addToast(`Sukses! Akun Anda telah beralih ke paket ${plan.name}.`, 'success');
                            }, 450);
                          }}
                          className={`mt-4 w-full py-1.5 rounded-xl font-bold font-mono text-[10.5px] cursor-pointer text-center transition ${
                            isActive
                              ? 'bg-transparent border border-[#00A3E0] text-[#00A3E0] cursor-default'
                              : 'bg-[#00A3E0] text-black hover:opacity-95'
                          }`}
                        >
                          {isActive ? 'Paket Aktif Saat Ini' : `Berlangganan ${plan.id}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Middle Section: Mock Credit Card and input form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                
                {/* Visual Premium Credit Card Display */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Pratinjau Kartu Terdaftar
                  </span>
                  <div className="relative w-full h-44 rounded-2xl bg-gradient-to-tr from-[#020617] via-[#07090d] to-[#1e1b4b] text-white p-5 flex flex-col justify-between border border-slate-800 shadow-xl overflow-hidden font-mono group select-none">
                    
                    {/* Atmospheric abstract gradients */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#00A3E0]/20 rounded-full blur-2xl group-hover:bg-[#00A3E0]/30 transition" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

                    <div className="flex justify-between items-start z-10">
                      <div>
                        <span className="text-[9px] font-black tracking-widest text-[#00A3E0]">
                          CORPORATE BLACK
                        </span>
                        <div className="flex gap-1.5 mt-2">
                          {/* Gold credit card chip mockup */}
                          <div className="w-8 h-6 rounded bg-gradient-to-tr from-amber-400 to-amber-200 border border-amber-301 flex flex-col justify-between p-1 opacity-90">
                            <div className="grid grid-cols-3 gap-0.5 h-1">
                              <div className="border-r border-b border-amber-500/40"></div>
                              <div className="border-r border-b border-amber-500/40"></div>
                              <div className="border-b border-amber-500/40"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-0.5 h-1">
                              <div className="border-r border-amber-500/40"></div>
                              <div className="border-r border-amber-500/40"></div>
                              <div></div>
                            </div>
                          </div>
                          {/* Contactless symbol */}
                          <svg className="w-4 h-5 text-slate-400 self-center" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-450 tracking-wider">
                        VISA
                      </span>
                    </div>

                    <div className="space-y-3 z-10">
                      {/* Card number display with format spacer */}
                      <span className="text-base font-bold tracking-[0.16em] block drop-shadow-md">
                        {paymentMethod.cardNumber}
                      </span>

                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-[8px] text-slate-500 block">CARD HOLDER</span>
                          <span className="text-[10px] font-bold text-slate-200 uppercase truncate max-w-[150px] block">
                            {paymentMethod.cardHolder || 'ZAHRA ADMIN'}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-[8px] text-slate-500 block">VALID THRU</span>
                            <span className="text-[10px] font-bold text-slate-200 block">
                              {paymentMethod.expiry || 'MM/YY'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-500 block">CVV</span>
                            <span className="text-[10px] font-bold text-slate-200 block">
                              {paymentMethod.cvv}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card input editable forms */}
                <div className="lg:col-span-1 border-0 lg:border-l border-slate-200 dark:border-slate-800 hidden lg:block"></div>
                <div className="lg:col-span-6 space-y-3 bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-slate-150 dark:border-slate-850">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono block">
                    Metode Pembayaran Kartu Terdaftar
                  </span>

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 uppercase block font-mono">Nomor Kartu Kredit</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4242 4242 4242 4242"
                          value={paymentMethod.cardNumber}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            let matches = val.match(/\d{4,16}/g);
                            let match = matches && matches[0] || '';
                            let parts = [];
                            for (let i=0, len=match.length; i<len; i+=4) {
                              parts.push(match.substring(i, i+4));
                            }
                            if (parts.length > 0) {
                              setPaymentMethod(prev => ({ ...prev, cardNumber: parts.join(' ') }));
                            } else {
                              setPaymentMethod(prev => ({ ...prev, cardNumber: val }));
                            }
                          }}
                          className="w-full mt-1 px-3 py-1.5 border rounded-xl text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 uppercase block font-mono">Nama Pemilik Kartu</label>
                        <input
                          type="text"
                          placeholder="Nama Sesuai Fisik Kartu"
                          value={paymentMethod.cardHolder}
                          onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardHolder: e.target.value.toUpperCase() }))}
                          className="w-full mt-1 px-3 py-1.5 border rounded-xl text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 uppercase block font-mono">Tanggal Kadaluarsa</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={paymentMethod.expiry}
                          onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiry: e.target.value }))}
                          className="w-full mt-1 px-3 py-1.5 border rounded-xl text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 uppercase block font-mono">Kode CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="992"
                          value={paymentMethod.cvv}
                          onChange={(e) => setPaymentMethod(prev => ({ ...prev, cvv: e.target.value.replace(/[^0-9]/g, '') }))}
                          className="w-full mt-1 px-3 py-1.5 border rounded-xl text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!paymentMethod.cardNumber || !paymentMethod.cardHolder) {
                            addToast('Harap lengkapi detail isian kartu kredit!', 'warning');
                            return;
                          }
                          addToast('Metode pembayaran berhasil disinkronisasi ke server aman IPS.', 'success');
                        }}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:opacity-90 rounded-xl text-white text-[10.5px] font-bold font-mono cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                      >
                        <Lock size={12} /> Perbarui Metode Pembayaran
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Invoices Table */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#00A3E0]" /> Histori Transaksi & Invoice Pembayaran
                  </h4>
                  <span className="text-[9px] bg-[#00A3E0]/15 text-[#00A3E0] px-2 py-0.5 rounded font-bold font-mono">
                    Auto-Sync
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-[11px] border-collapse bg-white dark:bg-slate-950 font-sans">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-mono text-[10px] border-b border-slate-200 dark:border-slate-800 uppercase font-black">
                        <th className="p-3">ID Invoice</th>
                        <th className="p-3">Tanggal Tagihan</th>
                        <th className="p-3">Deskripsi Transaksi</th>
                        <th className="p-3">Jumlah Biaya</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi Unduh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                      {billingHistory.map((invoice, invIdx) => (
                        <tr key={invIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 text-slate-700 dark:text-gray-300">
                          <td className="p-3 font-mono font-bold text-[#00A3E0]">{invoice.id}</td>
                          <td className="p-3 text-slate-400 font-medium">{invoice.date}</td>
                          <td className="p-3 font-semibold">{invoice.description}</td>
                          <td className="p-3 font-mono font-black">{invoice.amount}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500">
                              {invoice.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                addToast(`Menyiapkan file PDF untuk ${invoice.id}...`, 'success');
                                setTimeout(() => {
                                  addToast(`Unduhan berhasil: ${invoice.id}.pdf tersimpan ke perangkat Anda.`, 'success');
                                }, 600);
                              }}
                              className="p-1 px-2.5 bg-slate-50 hover:bg-[#00A3E0]/10 dark:bg-slate-900 hover:text-[#00A3E0] border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ml-auto animate-fadeIn"
                            >
                              <Download size={11} /> PDF Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400 font-mono font-bold flex items-center gap-1">
                <Shield size={12} className="text-emerald-500" /> Sertifikasi SSL 256-bit Enkripsi Aman
              </span>
              <button
                type="button"
                onClick={() => setIsBillingModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl font-bold text-slate-600 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-slate-850 active:scale-95 transition-all cursor-pointer text-xs"
              >
                Tutup Portal Billing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING VOXIA AI CHATBOT ADVISOR DOOR */}
      <div className="fixed bottom-20 lg:bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Chat box container window */}
        {isChatOpen && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-80 sm:w-96 h-[400px] mb-3 flex flex-col justify-between overflow-hidden relative animate-slideIn select-none">
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-[#0A3D62] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center text-slate-900">
                  <Sparkles size={11} className="animate-spin text-[#0A3D62]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase leading-none tracking-tight">VOXIA MaxSales Advisor</h4>
                  <span className="text-[8px] font-mono text-cyan-300 uppercase block mt-0.5">Asisten Voxia AI Penjualan</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-slate-300 hover:text-white cursor-pointer">
                <X size={15} />
              </button>
            </div>

            {/* Chat Body messages stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
              {chats.map((chat, idx) => {
                const isModel = chat.role === 'model';
                return (
                  <div key={idx} className={`flex ${isModel ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed font-semibold transition ${
                      isModel
                        ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none'
                        : 'bg-[#00A3E0] text-white rounded-tr-none shadow-sm'
                    }`}>
                      {chat.parts}
                    </div>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-[10px] text-slate-400">
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Voxia AI sedang merumuskan jawaban...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Footer Input bar */}
            <div className="p-3 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-1.5 items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChat();
                }}
                placeholder="Ketik ulasan pertanyaan di sini..."
                className="flex-1 px-3 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white font-medium focus:outline-none"
              />
              <button
                onClick={handleSendChat}
                className="p-2 bg-[#0A3D62] hover:bg-black rounded-xl text-white shadow-md cursor-pointer transition"
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Circular Floating action trigger button */}
        <button
          onClick={() => {
            setIsChatOpen((prev) => !prev);
            addToast(isChatOpen ? 'Asisten ditutup.' : 'Voxia AI Sales Advisor siap melayani!', 'success');
          }}
          className="w-12 h-12 rounded-full bg-[#00A3E0] hover:bg-[#0092c8] text-white shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-95"
          title="Tanya Voxia AI Advisor (Alt+C)"
        >
          {isChatOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>

    </div>
  );
}
