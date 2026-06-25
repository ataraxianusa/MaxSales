import React from "react";
import { Sparkles, KeyRound, Mail, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Silakan masukkan email dan password valid.");
      return;
    }

    setLoading(true);
    // Simulate high-contrast professional transition
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 850);
  };

  const handleQuickLogin = () => {
    setEmail("pengusaha.sukses@maxxsales.com");
    setPassword("password123");
  };

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 transition-colors duration-300 bg-white dark:bg-[#050505]">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="w-full max-w-md p-6 sm:p-8 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] shadow-sm relative z-10 transition-all duration-300">
        
        {/* App identity mark */}
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 rounded bg-[#171717] dark:bg-[#E5E5E5] text-white dark:text-black mb-3 items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-light tracking-tight text-neutral-900 dark:text-white">
            Masuk ke <span className="font-semibold text-neutral-800 dark:text-[#E5E5E5]">MaxxSales AI</span>
          </h2>
          <p className="text-[11px] text-neutral-400 dark:text-[#737373] mt-1 font-mono uppercase tracking-wider">
            Sistem Saraf AI Penjualan untuk Pengusaha
          </p>
        </div>

        {/* Quick Credentials hint card */}
        <div className="p-3.5 mb-6 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] text-[11px] text-neutral-600 dark:text-[#A3A3A3] space-y-2">
          <div className="flex items-center space-x-1.5 font-bold tracking-wide uppercase text-neutral-850 dark:text-white font-mono text-[9px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Akses Masuk Cepat</span>
          </div>
          <p className="leading-relaxed">
            Gunakan email bebas atau klik tombol pengisian otomatis untuk mencicipi demo siap pakai.
          </p>
          <button
            type="button"
            id="btn-quick-fill-login"
            onClick={handleQuickLogin}
            className="text-[10px] font-mono hover:underline font-bold text-neutral-900 dark:text-white block pt-1"
          >
            → Klik disini untuk Isian Otomatis
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded border border-red-500/20 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-[#737373] mb-1.5 font-bold">
              Alamat E-mail Bisnis
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-450 dark:text-[#737373]" />
              <input
                id="inp-login-email"
                type="email"
                placeholder="misal: pengusaha@namausaha.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none text-neutral-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-[#737373] mb-1.5 font-bold">
              Password Pengaman
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 w-4 h-4 text-neutral-450 dark:text-[#737373]" />
              <input
                id="inp-login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded border bg-transparent border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none text-neutral-900 dark:text-white"
                required
              />
            </div>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 rounded text-xs font-semibold bg-neutral-950 dark:bg-[#E5E5E5] text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-white flex items-center justify-center space-x-2 transition-colors disabled:opacity-75 focus:outline-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memvalidasi Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk ke AI Core</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
