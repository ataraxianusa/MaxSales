/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat-v3-0324:free";

const isRealAiEnabled = !!(OPENROUTER_API_KEY && OPENROUTER_API_KEY.startsWith("sk-or-"));

if (isRealAiEnabled) {
  console.log(`VOXIA Backend: OpenRouter AI activated (${OPENROUTER_MODEL}).`);
} else {
  console.log("VOXIA Backend: Running in Simulation mode. (Missing OPENROUTER_API_KEY)");
}

// OpenRouter call helper (OpenAI-compatible API)
async function callOpenRouter(
  messages: { role: string; content: string }[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://maxsales.qzz.io",
      "X-Title": "MaxSales by VOXIA"
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${errBody}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

// Utility to clean model output and parse JSON robustly
function parseJsonResponse(rawText: string, fallbackJson: any): any {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) clean = clean.substring(7);
    else if (clean.startsWith('```')) clean = clean.substring(3);
    if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);
    clean = clean.trim();
    return JSON.parse(clean);
  } catch (e) {
    try {
      const braceIndex = rawText.indexOf('{');
      const bracketIndex = rawText.indexOf('[');
      let startIndex = -1;
      let endIndex = -1;
      if (braceIndex !== -1 && (bracketIndex === -1 || braceIndex < bracketIndex)) {
        startIndex = braceIndex;
        endIndex = rawText.lastIndexOf('}');
      } else if (bracketIndex !== -1) {
        startIndex = bracketIndex;
        endIndex = rawText.lastIndexOf(']');
      }
      if (startIndex !== -1 && endIndex !== -1) {
        return JSON.parse(rawText.substring(startIndex, endIndex + 1));
      }
    } catch {}
    return fallbackJson;
  }
}

// System prompt for JSON-only responses
const JSON_SYSTEM = "Anda selalu merespon dalam format JSON yang valid. Tanpa markdown, tanpa penjelasan tambahan.";

// -- API ROUTES --

app.get("/api/status", (_req, res) => {
  res.json({
    status: "online",
    aiEnabled: isRealAiEnabled,
    model: isRealAiEnabled ? OPENROUTER_MODEL : "simulator",
    provider: isRealAiEnabled ? "OpenRouter" : "local-simulation",
    platform: "VOXIA Sales-Flow One-Stop Platform",
    currentTime: new Date().toISOString()
  });
});

// 1. BRANDING - ASSET GENERATION
app.post("/api/generate-assets", async (req, res) => {
  const { productName, persona, targetMarket, mediaSpecs } = req.body;

  if (!productName || !persona) {
    return res.status(400).json({ error: "Product name and Persona are required inputs." });
  }

  const defaultMockResponse = {
    assets: [
      {
        id: "mock_asset_1", productName, persona, targetMarket, mediaSpecs,
        title: `Gaya Hidup Masa Kini Bersama VOXIA ${productName}`,
        copy: `Untuk Anda yang aktif di perkotaan dan menyukai efisiensi kelas dunia. Didesain khusus mencakup seluruh kebutuhan ${persona} masa kini. Jangan lewatkan penawaran terbatas khusus minggu ini.`,
        ctaText: "Mulai Sekarang", type: "social-post",
        styleTheme: { bgGradient: "from-slate-900 to-indigo-950", primaryColor: "#0A3D62", accentColor: "#FFB400", textStyle: "font-sans leading-relaxed tracking-normal" },
        version: 1
      },
      {
        id: "mock_asset_2", productName, persona, targetMarket, mediaSpecs,
        title: `${productName}: Keseimbangan Sempurna Aktivitas Anda`,
        copy: `Menemukan keseimbangan terbaik di tengah dinamika hidup di perkotaan menjadi semakin mudah. Dibuat dengan formula ramah pengguna untuk target pasar ${targetMarket || "umum"}. Gunakan diskon peluncuran 15% hari ini!`,
        ctaText: "Dapatkan Sekarang", type: "image",
        styleTheme: { bgGradient: "from-cyan-900 via-sky-950 to-blue-905", primaryColor: "#00A3E0", accentColor: "#0A3D62", textStyle: "font-sans font-medium" },
        version: 1
      },
      {
        id: "mock_asset_3", productName, persona, targetMarket, mediaSpecs,
        title: "Temukan Solusi Cerdas Anda",
        copy: `Kenapa memilih yang biasa jika VOXIA ${productName} bisa memberikan kinerja optimal 10x lipat? Dirancang presisi demi melayani ${persona} secara tak terbatas.`,
        ctaText: "Tonton Promo Video", type: "video",
        styleTheme: { bgGradient: "from-zinc-900 to-slate-800", primaryColor: "#FFB400", accentColor: "#00A3E0", textStyle: "font-mono" },
        version: 1
      }
    ]
  };

  if (!isRealAiEnabled) {
    return res.json({ ...defaultMockResponse, mode: "stimulated-local" });
  }

  try {
    const prompt = `Anda adalah Direktur Kreatif & AI Copywriter Senior VOXIA.
Hasilkan 3 variasi aset kampanye pemasaran digital berkualitas tinggi dalam bahasa Indonesia untuk:
- Nama Produk: ${productName}
- Persona Pengguna Utama: ${persona}
- Target Pasar: ${targetMarket || "Masyarakat umum perkotaan"}
- Spesifikasi Media: ${mediaSpecs || "Instagram / TikTok feeds"}

JSON format: { "assets": [{ "title": "judul <10 kata", "copy": "naskah persuasif 2-3 kalimat", "ctaText": "tombol aksi", "type": "social-post|image|video", "styleTheme": { "bgGradient": "tailwind gradient", "primaryColor": "#hex", "accentColor": "#hex", "textStyle": "tailwind font class" } }] }
HANYA JSON, tanpa penjelasan.`;

    const raw = await callOpenRouter([
      { role: "system", content: JSON_SYSTEM },
      { role: "user", content: prompt }
    ], { temperature: 0.8 });

    const parsed = parseJsonResponse(raw, defaultMockResponse);
    const finalAssets = (parsed.assets || []).map((a: any, i: number) => ({
      id: `ai_asset_${Date.now()}_${i}`, productName, persona, targetMarket, mediaSpecs, version: 1, ...a
    }));

    return res.json({ assets: finalAssets, mode: "live-ai" });
  } catch (error: any) {
    console.error("VOXIA Branding Error:", error);
    return res.status(200).json({ ...defaultMockResponse, mode: "stimulated-local-error-fallback", message: error.message });
  }
});

// 2. STRATEGY - ENGINE RECOMMENDATION WIZARD
app.post("/api/generate-strategy", async (req, res) => {
  const { businessName, industry, painPoints, budget, timeline } = req.body;

  const defaultMockStrategy = {
    blueprint: [
      { channel: "Instagram & TikTok Organic Content", targetAudience: "Generasi muda urban 18-30 tahun", message: `Tunjukkan kemudahan hidup dengan ${businessName}.`, kpi: "20% peningkatan Engagement", cta: "Kunjungi Profil", details: "Video reels 15 detik 3x seminggu." },
      { channel: "Facebook & Instagram Retargeting", targetAudience: "Pengunjung website yang belum transaksi", message: "Amankan penawaran spesial sekarang!", kpi: "3.5x ROAS", cta: "Belanja Sekarang", details: "Katalog dinamis dengan jaminan garansi." },
      { channel: "WhatsApp Broadcast", targetAudience: "Database prospek hangat", message: `Halo! Berikut strategi khusus ${businessName}.`, kpi: "+25% Conversion Rate", cta: "Hubungi Agent", details: "Seri pesan bertahap hari 1-3-5." }
    ],
    budgetAllocation: [
      { name: "Direct Ads (FB/IG)", value: 45, color: "#0A3D62" },
      { name: "KOL / Influencer", value: 25, color: "#00A3E0" },
      { name: "CRM & WA Automation", value: 20, color: "#FFB400" },
      { name: "Search & SEO", value: 10, color: "#475569" }
    ],
    aiReasoning: `Strategi bercabang berfokus pada media sosial visual + automasi CRM. Ads 45% menjaga aliran prospek, follow-up WA meningkatkan retensi.`
  };

  if (!isRealAiEnabled) {
    return res.json({ ...defaultMockStrategy, id: `strat_${Date.now()}`, businessName, industry, painPoints: painPoints || [], budget: budget || 10000000, timeline: timeline || "1 Bulan", createdAt: new Date().toISOString(), mode: "stimulated-local" });
  }

  try {
    const prompt = `Anda adalah Konsultan Strategi Bisnis AI VOXIA.
Blueprint Kampanye Pemasaran Digital untuk:
- Bisnis: ${businessName} | Industri: ${industry}
- Pain Points: ${Array.isArray(painPoints) ? painPoints.join(", ") : painPoints || "N/A"}
- Anggaran: Rp ${budget?.toLocaleString() || "Negosiasi"} | Timeline: ${timeline || "1 Bulan"}

JSON: { "blueprint": [{ "channel": "nama saluran", "targetAudience": "deskripsi", "message": "pesan utama", "kpi": "metrik", "cta": "aksi", "details": "langkah taktis" }], "budgetAllocation": [{ "name": "label", "value": persen, "color": "#hex" }], "aiReasoning": "penjelasan strategis" }
Total budgetAllocation harus 100%. HANYA JSON.`;

    const raw = await callOpenRouter([
      { role: "system", content: JSON_SYSTEM },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, defaultMockStrategy);
    return res.json({ id: `strat_${Date.now()}`, businessName, industry, painPoints: painPoints || [], budget: budget || 10000000, timeline: timeline || "1 Bulan", createdAt: new Date().toISOString(), blueprint: parsed.blueprint, budgetAllocation: parsed.budgetAllocation, aiReasoning: parsed.aiReasoning, mode: "live-ai" });
  } catch (error: any) {
    console.error("VOXIA Strategy Error:", error);
    return res.status(200).json({ ...defaultMockStrategy, id: `strat_${Date.now()}`, businessName, industry, painPoints: painPoints || [], budget: budget || 10000000, timeline: timeline || "1 Bulan", createdAt: new Date().toISOString(), mode: "stimulated-local-error-fallback", message: error.message });
  }
});

// 3. CRM - EVALUATE LEAD SCORE
app.post("/api/evaluate-lead-score", async (req, res) => {
  const { contactName, email, phone, notes, status } = req.body;

  const defaultMockScore = { score: 78, scoreExplanation: "Prospek menunjukkan minat tinggi. Direkomendasikan follow-up dengan penawaran kupon." };

  if (!contactName) return res.status(400).json({ error: "Contact name is required." });

  if (!isRealAiEnabled) return res.json({ ...defaultMockScore, mode: "stimulated-local" });

  try {
    const prompt = `Evaluasi prospek CRM VOXIA dan tentukan AI Lead Score (1-100):
- Nama: ${contactName} | Email: ${email || "-"} | WA: ${phone || "-"}
- Catatan: ${notes || "-"} | Status: ${status || "Lead"}

JSON: { "score": angka, "scoreExplanation": "alasan + saran tindakan" (bahasa Indonesia) }
HANYA JSON.`;

    const raw = await callOpenRouter([
      { role: "system", content: JSON_SYSTEM },
      { role: "user", content: prompt }
    ], { temperature: 0.5 });

    const parsed = parseJsonResponse(raw, defaultMockScore);
    return res.json({ score: parsed.score, scoreExplanation: parsed.scoreExplanation, mode: "live-ai" });
  } catch (err: any) {
    console.error("VOXIA Lead Score Error:", err);
    return res.json({ ...defaultMockScore, mode: "stimulated-local-error", message: err.message });
  }
});

// 4. COMPETITOR - SCRAPE & BREAKDOWN ANALYSIS
app.post("/api/analyze-competitor", async (req, res) => {
  const { competitorUrlOrName } = req.body;

  if (!competitorUrlOrName) return res.status(400).json({ error: "Competitor Url or Name is required." });

  const defaultMockCompetitor = {
    name: competitorUrlOrName,
    channelMix: [{ name: "Paid Ads (Meta)", spend: 50, color: "#0A3D62" }, { name: "TikTok Ads", spend: 30, color: "#00A3E0" }, { name: "SEO & Content", spend: 12, color: "#FFB400" }, { name: "Email Marketing", spend: 8, color: "#475569" }],
    pricingSnapshot: [{ tier: "Paket Dasar", price: "Rp 199.000/bln" }, { tier: "Paket Profesional", price: "Rp 499.000/bln" }, { tier: "Enterprise", price: "Rp 1.250.000/bln" }],
    metrics: { engagementRate: "4.8%", adSpendEst: "Rp 15-25jt/bln", likesTrend: [400, 480, 520, 610, 590, 720] },
    socialAdSamples: [
      { headline: "Capek Manajemen Prospek Manual?", channels: ["Meta", "Instagram"], copy: "Gabung sekarang dan potong waktu admin CRM hingga 70%!", imgPrompt: "Sleek modern office workflow UI" },
      { headline: "Solusi All-in-One Paling Hemat", channels: ["TikTok", "Google"], copy: "Satu solusi serba lengkap! Klik untuk diskon 20%!", imgPrompt: "Happy merchant using smartphone" }
    ]
  };

  if (!isRealAiEnabled) return res.json({ ...defaultMockCompetitor, mode: "stimulated-local" });

  try {
    const prompt = `Analisis kompetitor: "${competitorUrlOrName}".
Prediksikan channel mix, pricing, engagement, dan ad samples.

JSON: { "name": "nama", "channelMix": [{ "name": "label", "spend": persen, "color": "#hex" }], "pricingSnapshot": [{ "tier": "nama", "price": "harga" }], "metrics": { "engagementRate": "%", "adSpendEst": "range", "likesTrend": [6 angka] }, "socialAdSamples": [{ "headline": "judul", "channels": ["platform"], "copy": "naskah", "imgPrompt": "deskripsi" }] }
ChannelMix total 100%. HANYA JSON.`;

    const raw = await callOpenRouter([
      { role: "system", content: JSON_SYSTEM },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, defaultMockCompetitor);
    return res.json({ ...parsed, mode: "live-ai" });
  } catch (err: any) {
    console.error("VOXIA Competitor Error:", err);
    return res.json({ ...defaultMockCompetitor, mode: "stimulated-local-error", message: err.message });
  }
});

// 5. CHATBOT HELP - AI ADVISOR EXPLAIN
app.post("/api/help-chat", async (req, res) => {
  const { messages, context } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages list is required." });
  }

  const latestUserText = messages[messages.length - 1].parts;

  if (!isRealAiEnabled) {
    const words = latestUserText.toLowerCase();
    let reply = "Halo! Saya VOXIA AI Assistant. Saya siap membantu mengoptimalkan kampanye, branding, CRM scoring, dan manajemen cabang. Silakan tanyakan apa saja!";

    if (words.includes("skor") || words.includes("crm") || words.includes("score")) {
      reply = "Skor AI VOXIA dihitung real-time berdasarkan frekuensi interaksi, riwayat klik WA, dan nilai transaksi potensial. Prospek skor >80 direkomendasikan langsung didorong automasi penawaran.";
    } else if (words.includes("branding") || words.includes("asset") || words.includes("aset")) {
      reply = "Gunakan tab 'Branding' untuk membuat ad copy & visual dalam sekejap. Isi nama produk dan persona audiens, lalu klik 'Generate'!";
    } else if (words.includes("strategy") || words.includes("blueprint") || words.includes("strategi")) {
      reply = "Wizard Strategi VOXIA dalam 4 tahap: pain points, funnel visual, tabel kanal promosi, dan alokasi budget pie chart.";
    } else if (words.includes("competitor") || words.includes("kompetitor")) {
      reply = "Masukkan nama/URL kompetitor di menu 'Competitor' untuk analisis anggaran iklan, ad copy, dan bauran media.";
    } else if (words.includes("cabang") || words.includes("branch")) {
      reply = "Fitur 'Branches' mempermudah multi-wilayah. Pantau leads nasional dan sinkronisasi kampanye lewat peta interaktif.";
    }

    return res.json({ reply, mode: "stimulated-local" });
  }

  try {
    const systemPrompt = `Anda adalah VOXIA Sales-Flow Specialist, asisten AI ahli penjualan digital, CRM, periklanan, dan manajemen cabang bisnis Indonesia.
Nada: profesional, taktis, bersahabat. Gunakan bahasa Indonesia. Jawab <150 kata.
Kaitkan dengan kapabilitas VOXIA: Branding (ad copy), Strategy (funnel + budget), CRM (AI-Score + automasi), Competitor (riset kanal), Multi-Branch (peta interaktif).
Konteks: ${JSON.stringify(context || {})}`;

    const orMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt }
    ];

    for (const msg of messages.slice(-10)) {
      orMessages.push({ role: msg.role === "model" ? "assistant" : "user", content: msg.parts });
    }

    const reply = await callOpenRouter(orMessages, { temperature: 0.7, maxTokens: 512 });
    return res.json({ reply, mode: "live-ai" });
  } catch (err: any) {
    console.error("VOXIA Chat Error:", err);
    return res.status(200).json({
      reply: `Maaf, kendala koneksi AI. ${latestUserText.includes("skor") ? "Lead Score membantu memprioritaskan kontak berdasarkan analisis otomatis." : "Mari rancang strategi penjualan terbaik di VOXIA."}`,
      mode: "stimulated-local-error",
      message: err.message
    });
  }
});

// Serve static frontend assets in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa"
  }).then((vite) => {
    app.use(vite.middlewares);
    console.log("VOXIA: Vite dev middleware attached successfully.");
  }).catch((err) => {
    console.error("VOXIA: Failed to inject Vite Dev middleware:", err);
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`===========================================================`);
  console.log(`🚀 VOXIA Sales-Flow started on http://localhost:${PORT}`);
  console.log(`===========================================================`);
});
