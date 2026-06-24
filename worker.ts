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
  const { dna, headline, promoPrice, normalPrice, hook, cta, urgency, targetSegments, activeStrategies } = await c.req.json();

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

  const segmentContext = Array.isArray(targetSegments) && targetSegments.length > 0
    ? targetSegments.map((s: any) => `- ${s.name}: Kanal ${s.behavior || '-'}`).join("\n")
    : "";

  const strategyContext = Array.isArray(activeStrategies) && activeStrategies.length > 0
    ? activeStrategies.join(", ")
    : "";

  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Buat konten promosi fashion untuk:
- Produk: ${dna?.productName || "Produk"}
- Brand: ${dna?.brand || "Brand"}
- Kategori: ${dna?.category || "Fashion"}
- Kualitas: ${dna?.quality || "Premium"}
- Keunggulan: ${dna?.advantages?.split(",")?.[0] || "Kualitas terbaik"}
- Target: ${dna?.genders?.join(", ") || "Semua"}, usia ${dna?.ages?.join(", ") || "Dewasa"}
- Headline: ${headline || "Promo"}
- Harga Normal: Rp${normalPrice || 399000}
- Harga Promo: Rp${promoPrice || 299000}
${segmentContext ? `\nSegmen Prioritas:\n${segmentContext}` : ""}
${strategyContext ? `\nStrategi Aktif: ${strategyContext}` : ""}

INSTRUKSI: Fokus retensi untuk segmen high churn risk jika ada data. Sertakan hashtag relevan.
JSON: {"headline":"judul max 8 kata","subheadline":"sub max 12 kata","priceDisplay":"Rp X.XXX","promoDisplay":"Rp Y.XXX","ctaText":"aksi","urgencyText":"urgensi","caption":"caption 2-3 kalimat","hashtags":["#tag1","#tag2","#tag3","#tag4","#tag5"],"watermark":"MaxxSales AI"} HANYA JSON.` }
    ], { temperature: 0.8 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 2. STRATEGY FORGE
app.post("/api/strategy-forge", async (c) => {
  const { dna, optimismLevel, competitors } = await c.req.json();

  const fallback = {
    synopsis: `Strategi ${dna?.productName || "produk"} - ${optimismLevel || "Moderat"}. Fokus penguatan brand.`,
    pillars: [{ areaName: "Brand Awareness", title: "Penguatan Brand Digital", description: "Bangun kesadaran via konten visual.", actionSteps: ["Konten reels 3x/minggu", "Kolaborasi influencer", "Konsistensi warna brand"] }]
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });

  const competitorIntel = Array.isArray(competitors) && competitors.length > 0
    ? competitors.filter((c: any) => c.name?.trim()).map((c: any) =>
        `- ${c.name}: Harga ${c.averagePrice || '-'}, Kekuatan: ${c.strengths || '-'}, Kelemahan: ${c.weaknesses || '-'}`
      ).join("\n")
    : "- Tidak ada data kompetitor";

  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Buat strategi bisnis 5-11 pilar untuk:
- Produk: ${dna?.productName || "Produk"}
- Brand: ${dna?.brand || "Brand"}
- Kategori: ${dna?.category || "Fashion"}
- Keunggulan: ${dna?.advantages?.split(",")?.[0] || "Kualitas unggul"}
- Target Market: ${dna?.genders?.join(", ") || "Semua"}, usia ${dna?.ages?.join(", ") || "Dewasa"}
- Harga: Rp${dna?.normalPrice || 399000}
- Margin: ${dna?.marginRange || "30-50%"}
- Revenue Target: Rp${(dna?.targetMonthlyRevenue || 50000000).toLocaleString()}/bln
- Tipe Bisnis: ${dna?.businessType || "Campuran"}
- Channel: ${dna?.activeSocialMedia?.join(",") || "Instagram, TikTok"}
- Optimisme: ${optimismLevel || "Moderat"}

Intel Kompetitor:
${competitorIntel}

INSTRUKSI: Prioritaskan strategi yang mengeksploitasi kelemahan kompetitor.

JSON: {"synopsis":"ringkasan 2-3 kalimat Bahasa Indonesia","pillars":[{"areaName":"area strategi","title":"judul","description":"deskripsi","actionSteps":["langkah 1","langkah 2","langkah 3"]}]}
Minimal 5 pillars, maksimal 11 pillars. HANYA JSON.` }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ synopsis: parsed.synopsis, pillars: parsed.pillars, mode: "live-ai" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 3. DAILY PULSE
app.post("/api/daily-pulse", async (c) => {
  const { dna, completedCount, activeStrategies, pendingItems, yesterdayRevenue, todayTarget, dailyAchievement } = await c.req.json();

  const fallback = {
    briefing: `Selamat pagi, ${dna?.brand || "Pejuang UKM"}! Fokus interaksi pelanggan hari ini! 💪`,
    leadsCount: 5,
    competitorUpdate: `${dna?.biggestCompetitor || "Kompetitor"} sedang aktif promo.`,
    salesPercentage: 42
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });

  const strategiesList = Array.isArray(activeStrategies) && activeStrategies.length > 0
    ? activeStrategies.join(", ")
    : "belum ada strategi aktif";

  const pendingList = Array.isArray(pendingItems) && pendingItems.length > 0
    ? pendingItems.join("; ")
    : "semua tugas sudah selesai";

  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Buat morning briefing energetik untuk:
- Brand: ${dna?.brand || "UKM"}
- Produk: ${dna?.productName || "Produk"}
- Keunggulan: ${dna?.advantages?.split(",")?.[0] || "Produk berkualitas"}
- Kategori: ${dna?.category || "Fashion"}
- Target Revenue: Rp${(dna?.targetMonthlyRevenue || 50000000).toLocaleString()}/bln
- Media Aktif: ${dna?.activeSocialMedia?.join(", ") || "Instagram, TikTok"}
- Kompetitor: ${dna?.biggestCompetitor || "Kompetitor"}
- Kelebihan Kompetitor: ${dna?.competitorStrengths || "-"}
- Kelemahan Kompetitor: ${dna?.competitorWeaknesses || "-"}

Strategi Aktif: ${strategiesList}
Progress Kemarin: ${completedCount || 0} item selesai
Item Belum Selesai: ${pendingList}

PENCAPAIAN OMZET:
- Omzet Kemarin: Rp ${(yesterdayRevenue || 0).toLocaleString()}
- Target Hari Ini: Rp ${(todayTarget || 0).toLocaleString()}
- Rasio: ${dailyAchievement || 0}%

INSTRUKSI:
1. Prioritaskan item yang BELUM selesai dari hari sebelumnya
2. Sebutkan strategi yang sedang aktif hari ini
3. Beri 1 quick win actionable tip
4. Jika pencapaian < 80%, sarankan strategi closing. Jika > 100%, beri selamat dan sarankan eskalasi
5. Beri semangat untuk melanjutkan streak

JSON: {"briefing":"pesan semangat 2-3 kalimat personal + emoji","leadsCount":angka 3-12,"competitorUpdate":"update aktivitas kompetitor 1-2 kalimat","salesPercentage":angka 30-70}
HANYA JSON.` }
    ], { temperature: 0.8 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 4. ANALYZE COMPETITOR
app.post("/api/analyze-competitor", async (c) => {
  const { competitorName, dna, location, averagePrice, activeChannels } = await c.req.json();
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
      { role: "user", content: `Analisis SWOT kompetitor:
- Nama: ${competitorName}
- Lokasi: ${location || "tidak diketahui"}
- Harga Rata-rata: ${averagePrice || "tidak diketahui"}
- Kanal Aktif: ${activeChannels?.length ? activeChannels.join(", ") : "tidak diketahui"}

Bandingkan dengan bisnis kita:
- Produk: ${dna?.productName || "Produk"}
- Brand: ${dna?.brand || "Brand"}
- Harga: Rp${dna?.normalPrice || 399000}
- Kategori: ${dna?.category || "Fashion"}
- Kualitas: ${dna?.quality || "Premium"}
- Keunggulan: ${dna?.advantages || "Kualitas unggul"}

JSON: {"name":"nama","strengths":"kekuatan 1-2 kalimat","weaknesses":"kelemahan 1-2 kalimat","opportunities":"peluang 1-2 kalimat","threats":"ancaman 1-2 kalimat","estimatedRevenue":"estimasi revenue"}
HANYA JSON.` }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 6. ANALYZE SEGMENTS — AI Customer Segment Analysis
app.post("/api/analyze-segments", async (c) => {
  const { dna, segments } = await c.req.json();
  if (!Array.isArray(segments) || !segments.length) {
    return c.json({ error: "Segments list required." }, 400);
  }

  const fallback = {
    insights: {
      summary: `Analisis dari ${segments.length} segmen pelanggan ${dna?.brand || "bisnis Anda"}. Setiap segmen memiliki karakteristik unik yang memerlukan pendekatan berbeda.`,
      recommendations: [
        "Fokus retensi pada segmen High-Risk dengan program loyalty diskon",
        "Tingkatkan AOV segmen Medium-Risk dengan bundling produk",
        "Manfaatkan kanal utama masing-masing segmen untuk campaign tertarget"
      ],
      segments: segments.map(s => ({
        name: s.name,
        estimatedLtv: `Rp ${(s.avgTransaction * 2 * 12).toLocaleString()}`,
        churnRisk: s.risk,
        recommendation: `Optimalkan interaksi via ${s.channel} dengan konten personal.`
      }))
    },
    mode: "simulated"
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json(fallback);

  try {
    const segmentsJson = JSON.stringify(segments.map(s => ({
      nama: s.name,
      persentase: s.percentage,
      kanal: s.channel,
      rataTransaksi: s.avgTransaction,
      frekuensi: s.frequency,
      resiko: s.risk
    })));

    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Analisis data segmentasi pelanggan UKM fashion Indonesia.

Profil Bisnis:
- Brand: ${dna?.brand || "Brand"}
- Produk: ${dna?.productName || "Produk"}
- Kategori: ${dna?.category || "Fashion"}
- Harga Produk: Rp ${(dna?.normalPrice || 399000).toLocaleString()}
- Target Revenue: Rp ${(dna?.targetMonthlyRevenue || 50000000).toLocaleString()}/bln
- Target Market: ${dna?.genders?.join(", ") || "Semua"}, usia ${dna?.ages?.join(", ") || "Dewasa"}

Data Segmen (JSON):
${segmentsJson}

Beri analisis per-segmen: estimasi LTV bulanan, resiko churn, dan rekomendasi strategi retensi dalam Bahasa Indonesia.

JSON format:
{
  "summary": "ringkasan analisis keseluruhan 2-3 kalimat",
  "recommendations": ["rekomendasi 1", "rekomendasi 2", "rekomendasi 3", "rekomendasi 4", "rekomendasi 5"],
  "segments": [
    {
      "name": "nama segmen",
      "estimatedLtv": "estimasi LTV dalam Rp",
      "churnRisk": "Low/Medium/High",
      "recommendation": "rekomendasi khusus 1-2 kalimat"
    }
  ]
}
HANYA JSON, tanpa penjelasan.` }
    ], { temperature: 0.7, maxTokens: 1024 });

    const parsed = parseJsonResponse(raw, fallback.insights);
    return c.json({ insights: parsed, mode: "live-ai" });
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
