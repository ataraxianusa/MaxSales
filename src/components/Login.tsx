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
    <div className="relative overflow-hidden min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12 transition-colors duration-300 bg-base dark:bg-space-dark">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

      <div className="w-full max-w-md p-6 sm:p-8 card-sb bg-white dark:bg-charcoal-surface border border-neutral-200/50 dark:border-stone-border shadow-sm relative z-10 transition-all duration-300">
        
        {/* App identity mark */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-full bg-[#006241] text-white dark:bg-dark-text dark:text-space-dark mb-3 items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-ink dark:text-dark-text font-body">
            Masuk ke <span className="text-[#00754A]">MaxxSales AI</span>
          </h2>
          <p className="text-[10px] text-ink/40 dark:text-dark-text/40 mt-1 font-mono uppercase tracking-wider">
            Sistem Saraf AI Penjualan untuk Pengusaha
          </p>
        </div>

        {/* Quick Credentials hint card */}
        <div className="p-4 mb-6 rounded-xl border border-neutral-200 dark:border-stone-border bg-neutral-50 dark:bg-space-dark/50 text-[11px] text-ink/70 dark:text-dark-text/70 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold tracking-wide uppercase text-[#00754A] dark:text-[#cba258] font-mono text-[9px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00754A] dark:text-[#cba258]" />
            <span>Akses Masuk Cepat</span>
          </div>
          <p className="leading-relaxed">
            Gunakan email bebas atau klik tombol pengisian otomatis untuk mencicipi demo siap pakai.
          </p>
          <button
            type="button"
            id="btn-quick-fill-login"
            onClick={handleQuickLogin}
            className="text-[10px] font-mono hover:underline font-bold text-[#00754A] dark:text-[#cba258] block pt-1 cursor-pointer"
          >
            → Klik disini untuk Isian Otomatis
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded border border-red-500/20 bg-red-500/5 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="sb-input-container">
            <input
              id="inp-login-email"
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sb-input-field pl-10"
              required
            />
            <label htmlFor="inp-login-email" className="sb-input-label pl-8">
              Alamat E-mail Bisnis
            </label>
            <Mail className="absolute left-3.5 top-[14px] w-4 h-4 text-ink/40 dark:text-dark-text/40" />
          </div>

          <div className="sb-input-container">
            <input
              id="inp-login-password"
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="sb-input-field pl-10"
              required
            />
            <label htmlFor="inp-login-password" className="sb-input-label pl-8">
              Password Pengaman
            </label>
            <KeyRound className="absolute left-3.5 top-[14px] w-4 h-4 text-ink/40 dark:text-dark-text/40" />
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            disabled={loading}
            className="btn-sb btn-sb-primary w-full mt-6 py-3 px-4 text-xs font-semibold cursor-pointer"
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
