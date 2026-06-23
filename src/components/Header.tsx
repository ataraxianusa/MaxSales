import React from "react";
import { Sparkles, Sun, Moon, BookOpen, Layers, Layout, Menu, X, User } from "lucide-react";

interface HeaderProps {
  currentTab: "landing" | "login" | "dashboard" | "docs";
  setTab: (tab: "landing" | "login" | "dashboard" | "docs") => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  brandName?: string;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function Header({ currentTab, setTab, darkMode, setDarkMode, brandName, isLoggedIn, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 border-neutral-200 dark:border-[#262626] bg-white/95 dark:bg-[#0A0A0A]/95">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand ID */}
          <button 
            id="btn-nav-logo"
            onClick={() => setTab("landing")} 
            className="flex items-center space-x-3 text-left focus:outline-none focus:ring-1 focus:ring-neutral-400 p-1"
          >
            <div className="w-6 h-6 bg-neutral-900 dark:bg-[#E5E5E5] rounded-sm flex items-center justify-center text-white dark:text-black">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                MAXX<span className="text-neutral-500 dark:text-[#A3A3A3]">SALES</span>
              </span>
              <p className="text-[9px] font-mono leading-none text-neutral-400 dark:text-[#737373]">
                {brandName || "AI Business Brain"} • MVP v0.4
              </p>
            </div>
          </button>

          {/* Right Utilities (Theme Selector + Access Support / Logout) */}
          <div className="flex items-center space-x-4 ml-auto">
            <button
              id="btn-toggle-theme"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
              aria-label={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-mono font-bold tracking-wide focus:outline-none bg-neutral-100 border-neutral-200 hover:border-neutral-350 text-neutral-800 dark:bg-[#151515] dark:border-[#262626] dark:hover:border-[#383838] dark:text-[#E5E5E5] shadow-xs cursor-pointer"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden leading-none xs:inline text-[9px] font-extrabold uppercase text-amber-500">TERANG</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <span className="hidden leading-none xs:inline text-[9px] font-extrabold uppercase text-indigo-500">GELAP</span>
                </>
              )}
            </button>

            {isLoggedIn && onLogout && (
              <>
                <div className="h-4 w-[1px] bg-neutral-200 dark:bg-[#262626]"></div>
                <button
                  id="btn-nav-logout"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded border border-neutral-300 dark:border-[#262626] font-mono text-[10px] uppercase font-bold text-neutral-700 dark:text-[#E5E5E5] hover:bg-neutral-50 dark:hover:bg-[#1C1C1C] transition-colors"
                >
                  Keluar
                </button>
              </>
            )}

            {!isLoggedIn && (
              <>
                <div className="h-4 w-[1px] bg-neutral-200 dark:bg-[#262626]"></div>
                <button
                  id="btn-nav-login-direct"
                  onClick={() => setTab("login")}
                  className="px-3 py-1.5 rounded font-mono text-[10px] uppercase font-bold text-white dark:text-black bg-neutral-950 dark:bg-[#E5E5E5] hover:bg-neutral-850 dark:hover:bg-white transition-colors"
                >
                  Masuk
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
