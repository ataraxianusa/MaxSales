import React from "react";
import { Sparkles, Sun, Moon, Menu, X } from "lucide-react";

interface HeaderProps {
  currentTab: "landing" | "login" | "dashboard";
  setTab: (tab: "landing" | "login" | "dashboard") => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  brandName?: string;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function Header({ currentTab, setTab, darkMode, setDarkMode, brandName, isLoggedIn, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (id: string) => {
    if (currentTab !== "landing") {
      setTab("landing");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300 border-neutral-200 dark:border-[#262626] bg-white/95 dark:bg-[#0A0A0A]/95">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand ID */}
          <button 
            id="btn-nav-logo"
            onClick={() => {
              setTab("landing");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} 
            className="flex items-center space-x-3 text-left focus:outline-none focus:ring-1 focus:ring-neutral-400 p-1 shrink-0"
          >
            <div className="w-6 h-6 bg-neutral-900 dark:bg-[#E5E5E5] rounded-sm flex items-center justify-center text-white dark:text-black">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                MAXX<span className="text-neutral-500 dark:text-[#A3A3A3]">SALES</span>
              </span>
              <p className="text-[9px] font-mono leading-none text-neutral-400 dark:text-[#737373]">
                SISTEM OPERASI PERTUMBUHAN BISNIS • MVP v0.4
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 mx-auto">
            <button onClick={() => handleNavClick('dna-canvas')} className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-ai-violet dark:hover:text-ai-violet transition-colors">
              Cara Kerja
            </button>
            <button onClick={() => handleNavClick('pricing')} className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-ai-violet dark:hover:text-ai-violet transition-colors">
              Harga & Akses
            </button>
            <button onClick={() => handleNavClick('faq')} className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-ai-violet dark:hover:text-ai-violet transition-colors">
              FAQ
            </button>
          </nav>

          {/* Right Utilities (Theme Selector + Access Support / Logout) */}
          <div className="flex items-center space-x-3 ml-auto shrink-0">
            <button
              id="btn-toggle-theme"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
              aria-label={darkMode ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-mono font-bold tracking-wide focus:outline-none bg-neutral-100 border-neutral-200 hover:border-neutral-300 text-neutral-800 dark:bg-[#151515] dark:border-[#262626] dark:hover:border-[#383838] dark:text-[#E5E5E5] shadow-sm cursor-pointer"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden lg:inline leading-none text-[9px] font-extrabold uppercase text-amber-500">TERANG</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <span className="hidden lg:inline leading-none text-[9px] font-extrabold uppercase text-indigo-500">GELAP</span>
                </>
              )}
            </button>

            {isLoggedIn && onLogout && (
              <>
                <div className="hidden sm:block h-4 w-[1px] bg-neutral-200 dark:bg-[#262626]"></div>
                <button
                  id="btn-nav-logout"
                  onClick={onLogout}
                  className="hidden sm:block px-3 py-1.5 rounded border border-neutral-300 dark:border-[#262626] font-mono text-[10px] uppercase font-bold text-neutral-700 dark:text-[#E5E5E5] hover:bg-neutral-50 dark:hover:bg-[#1C1C1C] transition-colors"
                >
                  Keluar
                </button>
              </>
            )}

            {!isLoggedIn && (
              <>
                <div className="hidden sm:block h-4 w-[1px] bg-neutral-200 dark:bg-[#262626]"></div>
                <button
                  id="btn-nav-login-direct"
                  onClick={() => setTab("login")}
                  className="hidden sm:block px-3 py-1.5 rounded font-mono text-[10px] uppercase font-bold text-white dark:text-black bg-neutral-950 dark:bg-[#E5E5E5] hover:bg-neutral-800 dark:hover:bg-white transition-colors"
                >
                  Masuk
                </button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#0A0A0A]">
          <div className="px-6 py-4 space-y-4">
            <button onClick={() => handleNavClick('dna-canvas')} className="block w-full text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Cara Kerja
            </button>
            <button onClick={() => handleNavClick('pricing')} className="block w-full text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Harga & Akses
            </button>
            <button onClick={() => handleNavClick('faq')} className="block w-full text-left text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              FAQ
            </button>
            <hr className="border-neutral-200 dark:border-[#262626]" />
            {!isLoggedIn ? (
              <button
                onClick={() => { setTab("login"); setMobileMenuOpen(false); }}
                className="block w-full py-2 rounded text-center font-mono text-[11px] uppercase font-bold text-white dark:text-black bg-neutral-950 dark:bg-[#E5E5E5]"
              >
                Masuk / Login
              </button>
            ) : (
              <button
                onClick={() => { onLogout && onLogout(); setMobileMenuOpen(false); }}
                className="block w-full py-2 rounded border border-neutral-300 dark:border-[#262626] text-center font-mono text-[11px] uppercase font-bold text-neutral-700 dark:text-[#E5E5E5]"
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
