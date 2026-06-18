/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppTab } from '../types';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  Users,
  TrendingUp,
  MapPin,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  CreditCard,
  Home
} from 'lucide-react';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
  userProfile?: {
    name: string;
    email: string;
    avatar: string;
    role: string;
    phone: string;
    company: string;
  };
  onEditProfile?: () => void;
  onViewBilling?: () => void;
  onBackToLanding?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  theme,
  setTheme,
  addToast,
  userProfile,
  onEditProfile,
  onViewBilling,
  onBackToLanding
}: SidebarProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard' as AppTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'branding' as AppTab, label: 'Branding AI', icon: Sparkles },
    { id: 'strategy' as AppTab, label: 'Strategy AI', icon: Compass },
    { id: 'crm' as AppTab, label: 'CRM Leads', icon: Users },
    { id: 'competitor' as AppTab, label: 'Competitor', icon: TrendingUp },
    { id: 'branches' as AppTab, label: 'Multi-Branch', icon: MapPin },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r h-screen sticky top-0 bg-[#ffffff] dark:bg-[#07090d] border-slate-200 dark:border-gray-850 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Upper Brand Info */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-gray-850">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#00A3E0] flex items-center justify-center text-[#07090d] font-bold text-lg shadow-md">
                V
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-[#00A3E0]">
                  VOXIA
                </span>
                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                  MaxSales
                </span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-lg bg-[#00A3E0] flex items-center justify-center text-[#07090d] mx-auto font-bold text-lg">
              V
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-gray-900 text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00A3E0]/10 text-[#00A3E0] font-bold border-l-2 border-[#00A3E0] rounded-l-none'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-900/60 dark:hover:text-white'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-[#00A3E0]' : ''} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Lower Toolbar / Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-gray-850 space-y-2">
          {/* Back to Landing Page button */}
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#00A3E0]/10 text-slate-600 dark:text-gray-400 hover:text-[#00A3E0] cursor-pointer transition-all border border-transparent hover:border-[#00A3E0]/30"
              title="Kembali ke Halaman Muka"
            >
              <Home size={15} className="flex-shrink-0" />
              {!collapsed && <span className="font-medium">Kembali ke Beranda</span>}
            </button>
          )}

          {/* Theme switcher toggle button */}
          <button
            onClick={() => {
              const nextTheme = theme === 'dark' ? 'light' : 'dark';
              setTheme(nextTheme);
              addToast(`Tema diubah ke ${nextTheme.toUpperCase()}!`, 'success');
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-gray-900/60 text-slate-600 dark:text-gray-400 cursor-pointer transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            title="Ubah tema"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? <Moon size={15} className="text-amber-400" /> : <Sun size={15} className="text-amber-500" />}
              {!collapsed && (
                <span className="font-medium text-slate-700 dark:text-gray-300">
                  {theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
                </span>
              )}
            </div>
            {!collapsed && (
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono bg-slate-150/50 dark:bg-slate-800/60 text-slate-400">
                Alt+T
              </span>
            )}
          </button>

          {/* User profile dropdown drawer */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-900 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <img
                  src={userProfile?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full ring-2 ring-[#00A3E0]/30 object-cover"
                />
                {!collapsed && (
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-800 dark:text-gray-200 truncate max-w-[130px]">
                      {userProfile?.name || "Zahra Admin"}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-gray-500 truncate max-w-[130px]">
                      {userProfile?.email || "invezthink@gmail.com"}
                    </span>
                  </div>
                )}
              </div>
            </button>

            {profileDropdownOpen && !collapsed && (
              <div className="absolute bottom-12 left-0 w-full bg-white dark:bg-[#111827] rounded-lg shadow-xl border border-slate-200 dark:border-gray-800 py-1.5 z-50 text-xs">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onEditProfile) onEditProfile();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-900 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <User size={13} /> Edit Profile
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    if (onViewBilling) onViewBilling();
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-900 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <CreditCard size={13} /> Billing
                </button>
                <div className="border-t border-slate-200 dark:border-gray-800 my-1"></div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    addToast('Sesi Berakhir: Anda keluar aman dari dasbor.', 'warning');
                  }}
                  className="w-full text-left px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <LogOut size={13} /> Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (below 768px screen size) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#07090d] border-t border-gray-850 flex items-center justify-around px-2 py-1 z-40 select-none shadow-lg">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center h-full px-2 py-1 space-y-0.5 cursor-pointer ${
                isActive ? 'text-[#00A3E0]' : 'text-gray-500'
              }`}
            >
              <Icon size={18} className={isActive ? 'scale-110 drop-shadow-md' : ''} />
              <span className="text-[10px] font-bold truncate max-w-[65px]">{item.label}</span>
            </button>
          );
        })}
        {/* Back to landing on mobile */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex flex-col items-center justify-center h-full px-2 py-1 space-y-0.5 cursor-pointer text-gray-500 hover:text-[#00A3E0]"
          >
            <Home size={18} />
            <span className="text-[10px] font-bold">Beranda</span>
          </button>
        )}
      </div>
    </>
  );
}
