import React from "react";
import { BookOpen, Cloud, Code, GitFork, Save, Info, Terminal, Settings } from "lucide-react";

export default function TechnicalDocs() {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const cfWorkerCode = `import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${apiKey}\`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://maxsales.qzz.io",
      "X-Title": "MaxxSales by VOXIA"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(\`OpenRouter \${response.status}: \${errBody}\`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

function parseJsonResponse(rawText: string, fallbackJson: any): any {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('\`\`\`json')) clean = clean.substring(7);
    else if (clean.startsWith('\`\`\`')) clean = clean.substring(3);
    if (clean.endsWith('\`\`\`')) clean = clean.substring(0, clean.length - 3);
    return JSON.parse(clean.trim());
  } catch {
    try {
      const i = rawText.indexOf('{');
      const j = rawText.lastIndexOf('}');
      if (i !== -1 && j !== -1) return JSON.parse(rawText.substring(i, j + 1));
    } catch {}
    return fallbackJson;
  }
}

const JSON_SYS = "Anda selalu merespon dalam format JSON yang valid. Tanpa markdown, tanpa penjelasan.";

app.get("/api/status", (c) => {
  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  const enabled = !!(apiKey && apiKey.startsWith("sk-or-"));
  return c.json({
    status: "online",
    aiEnabled: enabled,
    model: enabled ? model : "simulator",
    provider: enabled ? "OpenRouter" : "local-simulation",
    platform: "MaxxSales MVP (Cloudflare Workers)",
    currentTime: new Date().toISOString()
  });
});

app.post("/api/generate-content-text", async (c) => {
  const { dna, headline, promoPrice, normalPrice, hook, cta, urgency } = await c.req.json();
  const fallback = { headline: headline || "Promo Spesial!", subheadline: "Dapatkan produk berkualitas!", priceDisplay: \`Rp \${(normalPrice||399000).toLocaleString()}\`, promoDisplay: \`Rp \${(promoPrice||299000).toLocaleString()}\`, ctaText: cta||"Beli Sekarang", urgencyText: urgency||"Terbatas!", caption: \`Promo spesial! \${headline||"Jangan lewatkan"} harga spesial hanya Rp \${(promoPrice||299000).toLocaleString()}. #Promo #Sale\`, hashtags: ["#Promo","#Sale","#Fashion"], watermark: "MaxxSales AI" };
  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });
  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: \`Buat konten promosi fashion: produk=\${dna?.productName||"Produk"}, brand=\${dna?.brand||"Brand"}, headline=\${headline||"Promo"}, harga=Rp\${normalPrice||399000}/Rp\${promoPrice||299000}. JSON: {\"headline\":\"judul\",\"subheadline\":\"sub\",\"priceDisplay\":\"Rp X\",\"promoDisplay\":\"Rp Y\",\"ctaText\":\"aksi\",\"urgencyText\":\"urgensi\",\"caption\":\"caption 2-3 kalimat\",\"hashtags\":[\"#tag\"],\"watermark\":\"MaxxSales AI\"} HANYA JSON.\` }
    ], { temperature: 0.8 });
    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch { return c.json({ ...fallback, mode: "error" }); }
});

app.post("/api/strategy-forge", async (c) => {
  const { dna, optimismLevel } = await c.req.json();
  const fallback = { synopsis: \`Strategi \${dna?.productName||"produk"} - \${optimismLevel||"Moderat"}. Fokus penguatan brand.\`, pillars: [{ areaName: "Brand Awareness", title: "Penguatan Brand Digital", description: "Bangun kesadaran via konten visual.", actionSteps: ["Konten reels 3x/minggu","Kolaborasi influencer","Konsistensi warna brand"] }] };
  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });
  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: \`Strategi bisnis untuk: produk=\${dna?.productName||"Produk"}, brand=\${dna?.brand||"Brand"}, kategori=\${dna?.category||"Fashion"}, target revenue=Rp\${(dna?.targetMonthlyRevenue||50000000).toLocaleString()}, channel=\${dna?.activeSocialMedia?.join(",")||"Instagram, TikTok"}, optimisme=\${optimismLevel||"Moderat"}. JSON: {\"synopsis\":\"ringkasan\",\"pillars\":[{\"areaName\":\"area\",\"title\":\"judul\",\"description\":\"deskripsi\",\"actionSteps\":[\"langkah\"]}]} Minimal 5 pillars. HANYA JSON.\` }
    ], { temperature: 0.7 });
    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ synopsis: parsed.synopsis, pillars: parsed.pillars, mode: "live-ai" });
  } catch { return c.json({ ...fallback, mode: "error" }); }
});

app.post("/api/daily-pulse", async (c) => {
  const { dna } = await c.req.json();
  const fallback = { briefing: \`Selamat pagi, \${dna?.brand||"Pejuang UKM"}! Fokus interaksi pelanggan hari ini! 💪\`, leadsCount: 5, competitorUpdate: \`\${dna?.biggestCompetitor||"Kompetitor"} sedang aktif promo.\`, salesPercentage: 42 };
  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });
  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: \`Morning briefing energetik untuk: brand=\${dna?.brand||"UKM"}, produk=\${dna?.productName||"Produk"}, target=Rp\${dna?.targetMonthlyRevenue||50000000}, kompetitor=\${dna?.biggestCompetitor||"Kompetitor"}. JSON: {\"briefing\":\"pesan 2-3 kalimat dg semangat + emoji\",\"leadsCount\":angka 3-12,\"competitorUpdate\":\"update kompetitor\",\"salesPercentage\":angka 30-70} HANYA JSON.\` }
    ], { temperature: 0.8 });
    const parsed = parseJsonResponse(raw, fallback);
    return c.json(parsed, mode: "live-ai" });
  } catch { return c.json({ ...fallback, mode: "error" }); }
});

app.post("/api/analyze-competitor", async (c) => {
  const { competitorName, dna } = await c.req.json();
  const fallback = { name: competitorName, strengths: "Lokasi strategis & pelanggan setia.", weaknesses: "Kurang aktif digital.", opportunities: "Ekspansi via TikTok Shop.", threats: "Brand serupa harga murah.", estimatedRevenue: "Rp 50-100jt/bln" };
  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });
  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: \`Analisis SWOT kompetitor: nama=\${competitorName}, produk_kita=\${dna?.productName||"Produk"}, brand_kita=\${dna?.brand||"Brand"}. JSON: {\"name\":\"nama\",\"strengths\":\"kekuatan\",\"weaknesses\":\"kelemahan\",\"opportunities\":\"peluang\",\"threats\":\"ancaman\",\"estimatedRevenue\":\"estimasi\"} HANYA JSON.\` }
    ], { temperature: 0.7 });
    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch { return c.json({ ...fallback, mode: "error" }); }
});

app.post("/api/chat", async (c) => {
  const { messages, dna } = await c.req.json();
  if (!Array.isArray(messages) || !messages.length) return c.json({ error: "Messages required." }, 400);
  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) {
    let reply = "Halo! Saya MaxxSales AI Co-pilot. Silakan tanya apa saja!";
    return c.json({ reply, mode: "simulated" });
  }
  try {
    const sys = \`Anda MaxxSales AI Co-pilot untuk UKM Indonesia. Fitur: DNA Canvas, Competitor War Room, Customer Insight, Strategy Fusion, Content Generator, Daily Pulse. Nada profesional-ramah. Bahasa Indonesia. <150 kata. Konteks: \${JSON.stringify({ brand: dna?.brand, product: dna?.productName })}\`;
    const orMsgs: { role: string; content: string }[] = [{ role: "system", content: sys }];
    for (const m of messages.slice(-10)) {
      const text = m.parts || m.content || "";
      if (text.trim()) orMsgs.push({ role: m.role === "model" ? "assistant" : "user", content: text });
    }
    const reply = await callOpenRouter(apiKey, model, orMsgs, { temperature: 0.7, maxTokens: 512 });
    return c.json({ reply, mode: "live-ai" });
  } catch { return c.json({ reply: "Maaf, kendala koneksi AI. Silakan coba lagi.", mode: "error" }); }
});

export default app;`;

  const githubActionsYaml = `# Alur Kerja Deployment GitHub Pages
name: Deploy MaxxSales Client

on:
  push:
    branches: [ "main" ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Production react Client
        run: npm run build
        env:
          VITE_CF_WORKER_URL: \${{ secrets.VITE_CF_WORKER_URL }}

      - name: Upload Static Web Artifacts
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-300">
      
      {/* Page Title Header */}
      <div className="flex items-center space-x-3 border-b pb-5 border-neutral-200 dark:border-[#262626]">
        <div className="p-2.5 rounded bg-neutral-100 dark:bg-[#161616] border border-neutral-200 dark:border-[#262626] text-neutral-900 dark:text-white">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-light tracking-tight flex items-center space-x-2 text-neutral-900 dark:text-white">Dokumentasi Teknis & Panduan Integrasi</h1>
          <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
            Panduan lengkap penerapan program cloud-native biaya $0 menggunakan Cloudflare Worker & GitHub Pages.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] text-xs sm:text-sm flex items-start space-x-3 text-neutral-750 dark:text-[#A3A3A3] leading-relaxed">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-neutral-500" />
        <div>
          <strong className="font-bold text-neutral-900 dark:text-white font-mono uppercase text-[10px] tracking-wider block mb-1">PROGRAM INFRASTRUKTUR $0 (ZERO COST PLAN)</strong>
          Untuk menghindari sewa server bulanan yang membebani UKM, infrastruktur MaxxSales dibagi menjadi dua komponen: berkas antarmuka statis di-host di <strong>GitHub Pages (Gratis)</strong>, dan pemrosesan AI dijalankan via <strong>Cloudflare Workers (Gratis s.d 100.000 request/hari)</strong> menghubungkan API OpenRouter DeepSeek.
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-6">
        
        {/* Step 1: Cloudflare Worker Code */}
        <div className="rounded border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden">
          <div className="p-5 border-b border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-neutral-500" />
              <h2 className="text-sm font-semibold font-mono uppercase tracking-wide">1. Kode Proxy AI: Cloudflare Worker (JavaScript)</h2>
            </div>
            <button
              id="btn-copy-worker"
              onClick={() => copyToClipboard(cfWorkerCode, "worker")}
              className="px-3.5 py-1.5 rounded text-xs font-mono bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black hover:bg-neutral-900 dark:hover:bg-white flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{copiedSection === "worker" ? "Tersalin!" : "Salin Kode Worker"}</span>
            </button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
              Buat worker baru di dasbor Cloudflare Anda, beri nama <code className="px-1.5 py-0.5 rounded font-mono bg-neutral-100 dark:bg-[#262626]">maxxsales-ai-proxy</code>. Jangan lupa tambahkan Environment Variable bernama <code className="px-1.5 py-0.5 rounded font-mono bg-neutral-100 dark:bg-[#262626] text-neutral-900 dark:text-white font-semibold border border-neutral-200 dark:border-transparent">OPENROUTER_API_KEY</code> di menu Settings Worker Anda untuk menempelkan kunci API OpenRouter Anda.
            </p>
            <div className="relative">
              <pre className="p-4 rounded bg-neutral-950 text-neutral-300 text-xs font-mono overflow-x-auto max-h-80 select-all border border-[#262626]">
                {cfWorkerCode}
              </pre>
            </div>
          </div>
        </div>

        {/* Step 2: GitHub Pages deployment guide */}
        <div className="rounded border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden">
          <div className="p-5 border-b border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <GitFork className="w-4 h-4 text-neutral-500" />
              <h2 className="text-sm font-semibold font-mono uppercase tracking-wide">2. Alur Pembagian Otomatis: GitHub Actions CI/CD (YAML)</h2>
            </div>
            <button
              id="btn-copy-github-yml"
              onClick={() => copyToClipboard(githubActionsYaml, "yaml")}
              className="px-3.5 py-1.5 rounded text-xs font-mono bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black hover:bg-neutral-900 dark:hover:bg-white flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{copiedSection === "yaml" ? "Tersalin!" : "Salin File YAML"}</span>
            </button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
              Buat berkas baru di direktori proyek Anda dengan nama <code className="px-1.5 py-0.5 rounded font-mono bg-neutral-100 dark:bg-[#262626]">.github/workflows/deploy.yml</code>. Setiap kali melaksanakan komando <code className="px-1 py-0.5 font-mono bg-neutral-100 dark:bg-[#262626]">git push origin main</code>, GitHub akan mengompilasi program React statis secara otomatis dan meluncurkannya ke GitHub Pages pemilik repo.
            </p>
            <div className="relative">
              <pre className="p-4 rounded bg-neutral-950 text-neutral-300 text-xs font-mono overflow-x-auto max-h-80 select-all border border-[#262626]">
                {githubActionsYaml}
              </pre>
            </div>
          </div>
        </div>

        {/* Step 3: Local Command checklist */}
        <div className="rounded border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] p-5 space-y-4">
          <div className="flex items-center space-x-2 text-neutral-850 dark:text-white pb-2 border-b border-neutral-150 dark:border-[#262626]">
            <Terminal className="w-4 h-4 text-neutral-400" />
            <h3 className="font-semibold text-xs font-mono uppercase tracking-wider">Perintah Terminal Berguna (Cheatsheet)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded border bg-neutral-50 dark:bg-neutral-950/20 border-neutral-200 dark:border-[#262626] space-y-1.5">
              <i className="not-italic text-neutral-800 dark:text-white font-bold font-mono uppercase text-[9px]">Menjalankan Lokal (Dev Server)</i>
              <code className="block font-mono bg-neutral-100 dark:bg-neutral-900 p-2 rounded text-neutral-850 dark:text-white">
                npm run dev
              </code>
              <p className="text-[10px] text-neutral-450 dark:text-neutral-500">Menjalankan Express backend + Vite dev server bersamaan di Port 3000.</p>
            </div>

            <div className="p-3.5 rounded border bg-neutral-50 dark:bg-neutral-950/20 border-neutral-200 dark:border-[#262626] space-y-1.5">
              <i className="not-italic text-neutral-800 dark:text-white font-bold font-mono uppercase text-[9px]">Menguji Bundling Produksi</i>
              <code className="block font-mono bg-neutral-100 dark:bg-neutral-900 p-2 rounded text-neutral-850 dark:text-white">
                npm run build
              </code>
              <p className="text-[10px] text-neutral-450 dark:text-neutral-500">Merangkum React client menjadi file HTML/JS statis di folder dist/.</p>
            </div>
          </div>
        </div>

        {/* Step 4: Configuration parameters */}
        <div className="rounded border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] p-5 space-y-4">
          <div className="flex items-center space-x-2 text-neutral-850 dark:text-white pb-2 border-b border-neutral-150 dark:border-[#262626]">
            <Settings className="w-4 h-4 text-neutral-400" />
            <h3 className="font-semibold text-xs font-mono uppercase tracking-wider">Pengaturan Variabel Lingkungan (.env)</h3>
          </div>
          <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
            Variabel lingkungan berikut wajib dipersiapkan untuk menjalankan fungsi AI Server Proxy secara mulus:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-[#262626] font-mono text-[10px] uppercase text-neutral-450 tracking-wider">
                  <th className="py-2">Kunci Variabel</th>
                  <th className="py-2">Lokasi</th>
                  <th className="py-2">Kelebihan / Fungsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-[#262626]">
                <tr>
                  <td className="py-3 font-mono font-semibold text-neutral-800 dark:text-neutral-200">OPENROUTER_API_KEY</td>
                  <td className="py-3 text-neutral-500">Server .env / Worker Secret</td>
                  <td className="py-3 text-[#A3A3A3]">Kunci API OpenRouter untuk pemrosesan AI. Model: openai/gpt-oss-120b:free.</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-semibold text-neutral-800 dark:text-neutral-200">OPENROUTER_API_KEY</td>
                  <td className="py-3 text-neutral-500">Cloudflare Worker Secret</td>
                  <td className="py-3 text-[#A3A3A3]">Kunci api OpenRouter eksternal untuk pemrosesan AI berkelanjutan biaya $0.</td>
                </tr>
                <tr>
                  <td className="py-3 font-mono font-semibold text-neutral-800 dark:text-neutral-200">VITE_CF_WORKER_URL</td>
                  <td className="py-3 text-neutral-500">GitHub Secrets / .env</td>
                  <td className="py-3 text-[#A3A3A3]">Alamat endpoint worker yang telah Anda deploy di Cloudflare portal.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
