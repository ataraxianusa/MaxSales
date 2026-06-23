/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MaxxSales MVP Backend — Express + OpenRouter AI
 * Model: openai/gpt-oss-120b:free
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
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";

const isRealAiEnabled = !!(OPENROUTER_API_KEY && OPENROUTER_API_KEY.startsWith("sk-or-"));

if (isRealAiEnabled) {
  console.log(`MaxxSales Backend: OpenRouter AI activated (${OPENROUTER_MODEL}).`);
} else {
  console.log("MaxxSales Backend: Running in Simulation mode. (Missing OPENROUTER_API_KEY)");
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
      "X-Title": "MaxxSales by VOXIA"
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

// ── API ROUTES ──

app.get("/api/status", (_req, res) => {
  res.json({
    status: "online",
    aiEnabled: isRealAiEnabled,
    model: isRealAiEnabled ? OPENROUTER_MODEL : "simulator",
    provider: isRealAiEnabled ? "OpenRouter" : "local-simulation",
    platform: "MaxxSales MVP — AI Business Brain",
    currentTime: new Date().toISOString()
  });
});

// 1. GENERATE CONTENT TEXT — for ContentGenerator (captions, headlines, hashtags)
app.post("/api/generate-content-text", async (req, res) => {
  const { dna, headline, promoPrice, normalPrice, hook, cta, urgency } = req.body;

  const defaultMockResponse = {
    headline: headline || "Promo Spesial Akhir Pekan!",
    subheadline: `Dapatkan produk berkualitas dengan harga spesial!`,
    priceDisplay: `Rp ${(normalPrice || 399000).toLocaleString()}`,
    promoDisplay: `Rp ${(promoPrice || 299000).toLocaleString()}`,
    ctaText: cta || "Beli Sekarang",
    urgencyText: urgency || "Terbatas!",
    caption: `Promo spesial untuk Anda! ${headline || "Jangan lewatkan kesempatan ini"} harga spesial hanya Rp ${(promoPrice || 299000).toLocaleString()} (dari Rp ${(normalPrice || 399000).toLocaleString()}). ${hook || "Cocok untuk daily look Anda!"} Yuk order sekarang! #Promo #Sale #Fashion`,
    hashtags: ["#Promo", "#Sale", "#Fashion", "#Diskon", "#Belanja"],
    watermark: "MaxxSales AI",
    mode: "stimulated-local"
  };

  if (!isRealAiEnabled) {
    return res.json(defaultMockResponse);
  }

  try {
    const prompt = `Anda adalah AI Copywriter untuk bisnis UKM fashion Indonesia.
Buat konten promosi dalam Bahasa Indonesia untuk produk berikut:
- Nama Produk: ${dna?.productName || "Produk"}
- Brand: ${dna?.brand || "Brand"}
- Headline Promo: ${headline || "Promo Spesial"}
- Harga Normal: Rp ${(normalPrice || 399000).toLocaleString()}
- Harga Promo: Rp ${(promoPrice || 299000).toLocaleString()}
- Hook/Selling Point: ${hook || "Kualitas terbaik"}
- CTA: ${cta || "Beli Sekarang"}
- Urgensi: ${urgency || "Terbatas"}
- Target Market: ${dna?.genders?.join(", ") || "Semua"}, ${dna?.ages?.join(", ") || "Dewasa"}

JSON format:
{
  "headline": "judul promosi maksimal 8 kata",
  "subheadline": "sub-judul maksimal 12 kata",
  "priceDisplay": "Rp X.XXX",
  "promoDisplay": "Rp X.XXX",
  "ctaText": "teks tombol aksi",
  "urgencyText": "teks urgensi singkat",
  "caption": "caption promosi 2-3 kalimat bahasa Indonesia",
  "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
  "watermark": "MaxxSales AI"
}
HANYA JSON, tanpa penjelasan.`;

    const raw = await callOpenRouter([
      { role: "system", content: JSON_SYSTEM },
      { role: "user", content: prompt }
    ], { temperature: 0.8 });

    const parsed = parseJsonResponse(raw, defaultMockResponse);
    return res.json({ ...parsed, mode: "live-ai" });
  } catch (error: any) {
    console.error("MaxxSales Content Text Error:", error);
    return res.json({ ...defaultMockResponse, mode: "stimulated-local-error", message: error.message });
  }
});

// 2. STRATEGY FORGE — Generate 11-pillar strategy based on DNA + risk level
app.post("/api/strategy-forge", async (req, res) => {
  const { dna, optimismLevel } = req.body;

  const defaultStrategy = {
    synopsis: `Strategi bisnis untuk ${dna?.productName || "produk Anda"} dengan pendekatan ${optimismLevel || "Moderat"}. Fokus pada penguatan brand, optimalisasi media sosial, dan retensi pelanggan.`,
    pillars: [
      {
        areaName: "Brand Awareness",
        title: "Penguatan Brand di Media Digital",
        description: "Bangun kesadaran merek melalui konten visual berkualitas di Instagram dan TikTok.",
        actionSteps: ["Buat konten reels 3x seminggu", "Gunakan konsistensi warna brand", "Kolaborasi dengan micro-influencer"]
      },
      {
        areaName: "Sales Pipeline",
        title: "Optimasi Sales Funnel",
        description: "Perkuat jalur konversi dari awareness hingga pembelian.",
        actionSteps: ["Buat landing page produk", "Pasang tombol CTA di setiap konten", "Siapkan promo terbatas"]
      },
      {
        areaName: "Customer Retention",
        title: "Program Retensi Pelanggan",
        description: "Tingkatkan loyalitas pelanggan dengan program membership dan reward.",
        actionSteps: ["Buat program poin reward", "Kirim newsletter mingguan", "Adakan flash sale khusus member"]
      }
    ],
    mode: "stimulated-local"
  };

  if (!isRealAiEnabled) {
    return res.json(defaultStrategy);
  }

  try {
    const levelDesc = optimismLevel === "Konservatif" ? "aman dan terukur" :
                      optimismLevel === "Agresif" ? "ekspansif dan berani" :
                      "seimbang antara risiko dan pertumbuhan";

    const prompt = `Anda adalah Konsultan Strategi Bisnis AI untuk UKM Indonesia.
Buat strategi bisnis 11 pilar untuk bisnis berikut:
- Produk: ${dna?.productName || "Produk"}
- Brand: ${dna?.brand || "Brand"}
- Kategori: ${dna?.category || "Fashion"}
- Target Market: ${dna?.genders?.join(", ") || "Semua"}, usia ${dna?.ages?.join(", ") || "Dewasa"}
- Revenue Target: Rp ${(dna?.targetMonthlyRevenue || 50000000).toLocaleString()}/bulan
- Harga: Rp ${dna?.normalPrice || 399000}
- Margin: ${dna?.marginRange || "30-50%"}
- Channel: ${dna?.activeSocialMedia?.join(", ") || "Instagram, TikTok, WhatsApp"}

Tingkat Optimisme: ${optimismLevel || "Moderat"} (${levelDesc})

JSON format:
{
  "synopsis": "ringkasan strategi 2-3 kalimat dalam Bahasa Indonesia",
  "pillars": [
    {
      "areaName": "nama area strategi",
      "title": "judul strategi",
      "description": "deskripsi 1-2 kalimat",
      "actionSteps": ["langkah 1", "langkah 2", "langkah 3"]
    }
  ]
}
HANYA JSON, tanpa penjelasan. Minimal 5 pillars, maksimal 11 pillars.`;

    const raw = await callOpenRouter([
      { role: "system", content: JSON_SYSTEM },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, defaultStrategy);
    return res.json({ synopsis: parsed.synopsis, pillars: parsed.pillars, mode: "live-ai" });
  } catch (error: any) {
    console.error("MaxxSales Strategy Error:", error);
    return res.json({ ...defaultStrategy, mode: "stimulated-local-error", message: error.message });
  }
});

// 3. DAILY PULSE — Morning briefing for DailyPulse component
app.post("/api/daily-pulse", async (req, res) => {
  const { dna } = req.body;

  const defaultPulse = {
    briefing: `Selamat pagi, ${dna?.brand || "Pejuang UKM"}! Hari ini adalah kesempatan baru untuk mengembangkan bisnis Anda. Fokus pada interaksi dengan pelanggan di Instagram dan TikTok. Ingat, konsistensi adalah kunci! Semangat! 💪`,
    leadsCount: 5,
    competitorUpdate: `${dna?.biggestCompetitor || "Kompetitor"} sedang aktif promo di media sosial. Evaluasi strategi harga Anda.`,
    salesPercentage: 42,
    mode: "stimulated-local"
  };

  if (!isRealAiEnabled) {
    return res.json(defaultPulse);
  }

  try {
    const prompt = `Anda adalah Asisten Pribadi AI untuk pemilik bisnis UKM Indonesia.
Buat morning briefing harian yang singkat, energetik, dan memotivasi dalam Bahasa Indonesia untuk:
- Nama Brand: ${dna?.brand || "Brand UKM"}
- Produk: ${dna?.productName || "Produk"}
- Target: ${dna?.targetMonthlyRevenue ? `Rp ${dna.targetMonthlyRevenue.toLocaleString()}/bulan` : "Rp 50.000.000"}
- Kompetitor Utama: ${dna?.biggestCompetitor || "Kompetitor"}

JSON format:
{
  "briefing": "pesan semangat 2-3 kalimat, personal, energetik, dengan emoji",
  "leadsCount": angka random 3-12,
  "competitorUpdate": "update singkat tentang aktivitas kompetitor",
  "salesPercentage": angka random 30-70
}
HANYA JSON, tanpa penjelasan.`;

    const raw = await callOpenRouter([
      { role: "system", content: JSON_SYSTEM },
      { role: "user", content: prompt }
    ], { temperature: 0.8 });

    const parsed = parseJsonResponse(raw, defaultPulse);
    return res.json({
      briefing: parsed.briefing,
      leadsCount: parsed.leadsCount || defaultPulse.leadsCount,
      competitorUpdate: parsed.competitorUpdate || defaultPulse.competitorUpdate,
      salesPercentage: parsed.salesPercentage || defaultPulse.salesPercentage,
      mode: "live-ai"
    });
  } catch (error: any) {
    console.error("MaxxSales Daily Pulse Error:", error);
    return res.json({ ...defaultPulse, mode: "stimulated-local-error", message: error.message });
  }
});

// 4. ANALYZE COMPETITOR — SWOT analysis for CompetitorWarRoom
app.post("/api/analyze-competitor", async (req, res) => {
  const { competitorName, dna } = req.body;

  if (!competitorName) {
    return res.status(400).json({ error: "Competitor name is required." });
  }

  const defaultCompetitorIntel = {
    name: competitorName,
    strengths: "Memiliki lokasi strategis dan pelanggan setia.",
    weaknesses: "Kurang aktif di media sosial dan promosi digital.",
    opportunities: "Bisa memperluas pasar melalui TikTok Shop.",
    threats: "Ancaman dari brand serupa dengan harga lebih murah.",
    estimatedRevenue: "Rp 50-100jt/bulan",
    mode: "stimulated-local"
  };

  if (!isRealAiEnabled) {
    return res.json(defaultCompetitorIntel);
  }

  try {
    const prompt = `Anda adalah Analis Kompetitor AI untuk bisnis UKM Indonesia.
Lakukan analisis SWOT untuk kompetitor berikut:
- Nama Kompetitor: ${competitorName}
- Produk Kita: ${dna?.productName || "Produk"}
- Brand Kita: ${dna?.brand || "Brand"}
- Harga Kita: Rp ${dna?.normalPrice || 399000}

JSON format:
{
  "name": "${competitorName}",
  "strengths": "kekuatan kompetitor 1-2 kalimat (Indonesia)",
  "weaknesses": "kelemahan kompetitor 1-2 kalimat (Indonesia)",
  "opportunities": "peluang yang bisa kita manfaatkan 1-2 kalimat (Indonesia)",
  "threats": "ancaman dari kompetitor 1-2 kalimat (Indonesia)",
  "estimatedRevenue": "estimasi revenue"
}
HANYA JSON, tanpa penjelasan.`;

    const raw = await callOpenRouter([
      { role: "system", content: JSON_SYSTEM },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, defaultCompetitorIntel);
    return res.json({
      name: parsed.name || competitorName,
      strengths: parsed.strengths,
      weaknesses: parsed.weaknesses,
      opportunities: parsed.opportunities,
      threats: parsed.threats,
      estimatedRevenue: parsed.estimatedRevenue,
      mode: "live-ai"
    });
  } catch (error: any) {
    console.error("MaxxSales Competitor Error:", error);
    return res.json({ ...defaultCompetitorIntel, mode: "stimulated-local-error", message: error.message });
  }
});

// 5. CHAT — AI Co-pilot / FloatingChatbot
app.post("/api/chat", async (req, res) => {
  const { messages, dna } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages list is required." });
  }

  const latestUserText = messages[messages.length - 1]?.parts || messages[messages.length - 1]?.content || "";

  if (!isRealAiEnabled) {
    const words = latestUserText.toLowerCase();
    let reply = "Halo! Saya AI Co-pilot MaxxSales. Saya siap membantu Anda mengelola bisnis dengan fitur: DNA Business Canvas, Competitor War Room, Customer Insight, Strategy Fusion, Content Generator, dan Daily Sales Pulse. Silakan tanya apa saja!";

    if (words.includes("dna") || words.includes("canvas") || words.includes("bisnis")) {
      reply = "DNA Business Canvas adalah fondasi data bisnis Anda. Isi produk, target market, media channel, dan kompetitor untuk mengaktifkan semua fitur AI.";
    } else if (words.includes("kompetitor") || words.includes("competitor")) {
      reply = "Competitor War Room memungkinkan Anda menganalisis SWOT kompetitor, membandingkan brand dengan radar chart, dan menyusun strategi persaingan.";
    } else if (words.includes("customer") || words.includes("pelanggan") || words.includes("ltv") || words.includes("selemen")) {
      reply = "Customer Insight membantu Anda mengelompokkan pelanggan, menghitung Customer Lifetime Value (LTV), dan menyusun strategi retensi.";
    } else if (words.includes("strategi") || words.includes("strategy") || words.includes("forge")) {
      reply = "Strategy Fusion adalah AI Co-Pilot yang menghasilkan 11 pilar strategi bisnis berdasarkan DNA dan tingkat optimisme Anda.";
    } else if (words.includes("content") || words.includes("konten") || words.includes("promo") || words.includes("caption")) {
      reply = "Content Generator membuat overlay promo pada foto produk Anda dengan AI-generated caption dan hashtag. Pilih format Feed, Story, atau WhatsApp!";
    } else if (words.includes("pulse") || words.includes("harian") || words.includes("daily")) {
      reply = "Daily Sales Pulse adalah dashboard harian Anda — briefing pagi, checklist tugas, KPI revenue, radar leads, dan market alerts.";
    }

    return res.json({ reply, mode: "stimulated-local" });
  }

  try {
    const systemPrompt = `Anda adalah MaxxSales AI Co-pilot, asisten AI untuk pemilik UKM Indonesia yang membantu mengelola bisnis dan penjualan.

Fitur MaxxSales:
1. DNA Business Canvas: Data bisnis inti (produk, target market, channel, kompetitor)
2. Competitor War Room: Analisis SWOT + radar chart perbandingan brand
3. Customer Insight: Segmentasi pelanggan + kalkulator LTV
4. Strategy Fusion: Generator 11 pilar strategi bisnis
5. Content Generator: Overlay promo + AI caption untuk foto produk
6. Daily Sales Pulse: Dashboard harian + briefing + KPI

Nada: profesional, ramah, solutif. Gunakan bahasa Indonesia. Jawab <150 kata.

Konteks Bisnis:
${JSON.stringify({
  brand: dna?.brand,
  product: dna?.productName,
  targetRevenue: dna?.targetMonthlyRevenue,
  targetMarket: dna?.genders
}, null, 2)}`;

    const orMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt }
    ];

    for (const msg of messages.slice(-10)) {
      const text = msg.parts || msg.content || "";
      const role = msg.role === "model" ? "assistant" : "user";
      if (text.trim()) {
        orMessages.push({ role, content: text });
      }
    }

    const reply = await callOpenRouter(orMessages, { temperature: 0.7, maxTokens: 512 });
    return res.json({ reply, mode: "live-ai" });
  } catch (err: any) {
    console.error("MaxxSales Chat Error:", err);
    return res.status(200).json({
      reply: "Maaf, terjadi kendala koneksi AI. Silakan coba lagi nanti. Sementara itu, Anda bisa terus menggunakan fitur-fitur MaxxSales lainnya!",
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
    console.log("MaxxSales: Vite dev middleware attached successfully.");
  }).catch((err) => {
    console.error("MaxxSales: Failed to inject Vite Dev middleware:", err);
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`===========================================================`);
  console.log(`🚀 MaxxSales MVP started on http://localhost:${PORT}`);
  console.log(`   Model: ${isRealAiEnabled ? OPENROUTER_MODEL : "Simulation"}`);
  console.log(`===========================================================`);
});
