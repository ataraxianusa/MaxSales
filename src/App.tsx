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
  Moon
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
        />

        {/* RIGHT MAIN CORE CONTAINER (Header Top bar + Selected Content view) */}
        <main className="flex-1 flex flex-col min-w-0 transition-all pb-20 lg:pb-6">
          
          {/* HEADER TOP BAR CONTAINER */}
          <header className="h-16 border-b border-slate-200 dark:border-gray-850 bg-white/95 dark:bg-[#07090d]/90 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 select-none">
            {/* Left title section logo indicator */}
            <div className="flex items-center gap-2">
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
                { keys: 'Alt + 2', desc: 'Akses Branding Asset Generator AI' },
                { keys: 'Alt + 3', desc: 'Akses Strategy Recommendation Engine' },
                { keys: 'Alt + 4', desc: 'Buka CRM Customer Automations' },
                { keys: 'Alt + 5', desc: 'Buka Competitor Intelligence Scraper' },
                { keys: 'Alt + 6', desc: 'Akses Sebaran Multi-Cabang Wilayah' },
                { keys: 'Alt + S', desc: 'Fokuskan kursor ke pencarian global' },
                { keys: 'Alt + C', desc: 'Togel dialog asisten Chatbot AI' },
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

      {/* FLOATING AI CHATBOT ADVISOR DOOR */}
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
                  <h4 className="text-xs font-extrabold uppercase leading-none tracking-tight">VOXIA Advisor Desk</h4>
                  <span className="text-[8px] font-mono text-cyan-300 uppercase block mt-0.5">Asisten Pintar Penjualan</span>
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
                    <span>Asisten sedang merumuskan jawaban...</span>
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
            addToast(isChatOpen ? 'Asisten ditutup.' : 'Sales Advisor AI siap melayani!', 'success');
          }}
          className="w-12 h-12 rounded-full bg-[#00A3E0] hover:bg-[#0092c8] text-white shadow-2xl flex items-center justify-center cursor-pointer transition-transform hover:scale-115 active:scale-95"
          title="Tanya Asisten Advisor AI (Alt+C)"
        >
          {isChatOpen ? <X size={20} /> : <MessageSquare size={20} />}
        </button>
      </div>

    </div>
  );
}
