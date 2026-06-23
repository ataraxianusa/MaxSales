import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

// OpenRouter call helper
async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
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
    throw new Error(`OpenRouter ${response.status}: ${errBody}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

// Parse JSON from AI response
function parseJsonResponse(rawText: string, fallbackJson: any): any {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) clean = clean.substring(7);
    else if (clean.startsWith('```')) clean = clean.substring(3);
    if (clean.endsWith('```')) clean = clean.substring(0, clean.length - 3);
    clean = clean.trim();
    return JSON.parse(clean);
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

// ── ROUTES ──

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

// 1. GENERATE CONTENT TEXT
app.post("/api/generate-content-text", async (c) => {
  const { dna, headline, promoPrice, normalPrice, hook, cta, urgency } = await c.req.json();

  const fallback = {
    headline: headline || "Promo Spesial!",
    subheadline: "Dapatkan produk berkualitas!",
    priceDisplay: `Rp ${(normalPrice || 399000).toLocaleString()}`,
    promoDisplay: `Rp ${(promoPrice || 299000).toLocaleString()}`,
    ctaText: cta || "Beli Sekarang",
    urgencyText: urgency || "Terbatas!",
    caption: `Promo spesial! ${headline || "Jangan lewatkan"} harga spesial hanya Rp ${(promoPrice || 299000).toLocaleString()}. #Promo #Sale`,
    hashtags: ["#Promo", "#Sale", "#Fashion"],
    watermark: "MaxxSales AI"
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });

  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Buat konten promosi fashion: produk=${dna?.productName || "Produk"}, brand=${dna?.brand || "Brand"}, headline=${headline || "Promo"}, harga=Rp${normalPrice || 399000}/Rp${promoPrice || 299000}. JSON: {"headline":"judul","subheadline":"sub","priceDisplay":"Rp X","promoDisplay":"Rp Y","ctaText":"aksi","urgencyText":"urgensi","caption":"caption 2-3 kalimat","hashtags":["#tag"],"watermark":"MaxxSales AI"} HANYA JSON.` }
    ], { temperature: 0.8 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 2. STRATEGY FORGE
app.post("/api/strategy-forge", async (c) => {
  const { dna, optimismLevel } = await c.req.json();

  const fallback = {
    synopsis: `Strategi ${dna?.productName || "produk"} - ${optimismLevel || "Moderat"}. Fokus penguatan brand.`,
    pillars: [{ areaName: "Brand Awareness", title: "Penguatan Brand Digital", description: "Bangun kesadaran via konten visual.", actionSteps: ["Konten reels 3x/minggu", "Kolaborasi influencer", "Konsistensi warna brand"] }]
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });

  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Strategi bisnis untuk: produk=${dna?.productName || "Produk"}, brand=${dna?.brand || "Brand"}, kategori=${dna?.category || "Fashion"}, target revenue=Rp${(dna?.targetMonthlyRevenue || 50000000).toLocaleString()}, channel=${dna?.activeSocialMedia?.join(",") || "Instagram, TikTok"}, optimisme=${optimismLevel || "Moderat"}. JSON: {"synopsis":"ringkasan","pillars":[{"areaName":"area","title":"judul","description":"deskripsi","actionSteps":["langkah"]}]} Minimal 5 pillars. HANYA JSON.` }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ synopsis: parsed.synopsis, pillars: parsed.pillars, mode: "live-ai" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 3. DAILY PULSE
app.post("/api/daily-pulse", async (c) => {
  const { dna } = await c.req.json();

  const fallback = {
    briefing: `Selamat pagi, ${dna?.brand || "Pejuang UKM"}! Fokus interaksi pelanggan hari ini! 💪`,
    leadsCount: 5,
    competitorUpdate: `${dna?.biggestCompetitor || "Kompetitor"} sedang aktif promo.`,
    salesPercentage: 42
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });

  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Morning briefing energetik untuk: brand=${dna?.brand || "UKM"}, produk=${dna?.productName || "Produk"}, target=Rp${dna?.targetMonthlyRevenue || 50000000}, kompetitor=${dna?.biggestCompetitor || "Kompetitor"}. JSON: {"briefing":"pesan 2-3 kalimat dg semangat + emoji","leadsCount":angka 3-12,"competitorUpdate":"update kompetitor","salesPercentage":angka 30-70} HANYA JSON.` }
    ], { temperature: 0.8 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 4. ANALYZE COMPETITOR
app.post("/api/analyze-competitor", async (c) => {
  const { competitorName, dna } = await c.req.json();
  if (!competitorName) return c.json({ error: "Competitor name required." }, 400);

  const fallback = {
    name: competitorName,
    strengths: "Lokasi strategis & pelanggan setia.",
    weaknesses: "Kurang aktif digital.",
    opportunities: "Ekspansi via TikTok Shop.",
    threats: "Brand serupa harga murah.",
    estimatedRevenue: "Rp 50-100jt/bln"
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });

  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Analisis SWOT kompetitor: nama=${competitorName}, produk_kita=${dna?.productName || "Produk"}, brand_kita=${dna?.brand || "Brand"}. JSON: {"name":"nama","strengths":"kekuatan","weaknesses":"kelemahan","opportunities":"peluang","threats":"ancaman","estimatedRevenue":"estimasi"} HANYA JSON.` }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 5. CHAT — AI Co-pilot
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
    const sys = `Anda MaxxSales AI Co-pilot untuk UKM Indonesia. Fitur: DNA Canvas, Competitor War Room, Customer Insight, Strategy Fusion, Content Generator, Daily Pulse. Nada profesional-ramah. Bahasa Indonesia. <150 kata. Konteks: ${JSON.stringify({ brand: dna?.brand, product: dna?.productName })}`;

    const orMsgs: { role: string; content: string }[] = [{ role: "system", content: sys }];
    for (const m of messages.slice(-10)) {
      const text = m.parts || m.content || "";
      if (text.trim()) orMsgs.push({ role: m.role === "model" ? "assistant" : "user", content: text });
    }

    const reply = await callOpenRouter(apiKey, model, orMsgs, { temperature: 0.7, maxTokens: 512 });
    return c.json({ reply, mode: "live-ai" });
  } catch {
    return c.json({ reply: "Maaf, kendala koneksi AI. Silakan coba lagi.", mode: "error" });
  }
});

export default app;
