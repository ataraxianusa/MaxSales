import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  generateTacticalBriefing,
  generateFallbackBriefing,
  type TacticalBriefingInput,
  type LlmCaller,
} from "./src/tactical-briefing";

type Bindings = {
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  APIFY_TOKEN: string;
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_KEY: string;
  AZURE_OPENAI_DEPLOYMENT: string;
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
    // Remove trailing commas before } or ]
    clean = clean.replace(/,\s*([\]}])/g, '$1');
    const parsed = JSON.parse(clean);
    return parsed;
  } catch {
    try {
      const i = rawText.indexOf('{');
      const j = rawText.lastIndexOf('}');
      if (i !== -1 && j !== -1 && j > i) {
        let slice = rawText.substring(i, j + 1);
        slice = slice.replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(slice);
      }
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

// 1b. SUGGEST CONTENT (Hooks, CTAs, Captions)
app.post("/api/suggest-content", async (c) => {
  const { dna, targetSegments, activeStrategies } = await c.req.json();

  const fallback = {
    hooks: [
      `${dna?.advantages?.split(",")[0] || "Kualitas premium"} — wajib punya!`,
      `Udah nyoba ${dna?.productName || "produk"} ini? `,
      `Buat kamu yang cari ${dna?.category?.toLowerCase() || "fashion"} anti mainstream!`
    ],
    ctas: [
      ...((dna?.buyTriggers || []).slice(0, 3).map((t: string) => `Pesan via WA (Klik ${t})`)),
      "Chat Admin Sekarang",
      "Lihat Katalog"
    ],
    captions: [
      `✨ ${dna?.productName || "Produk"} hadir dengan ${dna?.quality?.toLowerCase() || "kualitas premium"}! ${dna?.advantages?.split(",")[0] || ""}. Dapatkan sekarang sebelum kehabisan!`,
      `🔥 PROMO SPESIAL! ${dna?.brand || "Brand"} lagi bagi-bagi diskon buat ${dna?.productName || "produk"} favorit kamu. Stok terbatas ya!`,
      `💫 Kenapa ${dna?.productName || "produk"} ini beda dari yang lain? ${dna?.advantages?.split(",").slice(0, 2).join(" & ") || "Kualitas terjamin"}. Order sekarang!`
    ],
    promoPrices: [
      { label: "Diskon 10%", value: Math.round((dna?.normalPrice || 399000) * 0.9) },
      { label: "Diskon 15%", value: Math.round((dna?.normalPrice || 399000) * 0.85) },
      { label: "Diskon 20%", value: Math.round((dna?.normalPrice || 399000) * 0.8) },
      { label: "Diskon 25%", value: Math.round((dna?.normalPrice || 399000) * 0.75) },
      { label: "Flash Sale 30%", value: Math.round((dna?.normalPrice || 399000) * 0.7) }
    ]
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "simulated" });

  const segmentContext = Array.isArray(targetSegments) && targetSegments.length > 0
    ? targetSegments.map((s: any) => `- ${s.name}: ${s.channel || '-'}`).join("\n")
    : "";

  const strategyContext = Array.isArray(activeStrategies) && activeStrategies.length > 0
    ? activeStrategies.join(", ")
    : "";

  try {
    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Buat 5 saran konten promosi untuk produk fashion Indonesia.

KONTEKS PRODUK:
- Nama: ${dna?.productName || "Produk"}
- Brand: ${dna?.brand || "Brand"}
- Kategori: ${dna?.category || "Fashion"}
- Sub-Kategori: ${dna?.subCategory || "-"}
- Kualitas: ${dna?.quality || "Premium"}
- Keunggulan: ${dna?.advantages || "-"}
- Deskripsi: ${dna?.shortDescription || "-"}
- Harga Normal: Rp ${(dna?.normalPrice || 399000).toLocaleString()}
- Target Gender: ${dna?.genders?.join(", ") || "Semua"}
- Target Usia: ${dna?.ages?.join(", ") || "Dewasa"}
- Hobi: ${dna?.hobbies || "-"}
- Buy Triggers: ${dna?.buyTriggers?.join(", ") || "-"}
- Platform Aktif: ${dna?.activePlatforms?.join(", ") || "Instagram"}

${segmentContext ? `\nSEGMENT PRIORITAS:\n${segmentContext}` : ""}
${strategyContext ? `\nSTRATEGI AKTIF: ${strategyContext}` : ""}

INSTRUKSI:
1. Buat 5 "hooks" (kalimat pembuka menarik, max 10 kata, bahasa gaul Indonesia, memancing rasa ingin tahu)
2. Buat 5 "ctas" (call-to-action, pendek & menggoda, sesuai platform Indonesia, termasuk opsi WhatsApp)
3. Buat 5 "captions" (caption promosi 2-3 kalimat, persuasive, include emoji, sesuai karakter produk)

JSON FORMAT:
{"hooks":["hook1","hook2","hook3","hook4","hook5"],"ctas":["cta1","cta2","cta3","cta4","cta5"],"captions":["caption1","caption2","caption3","caption4","caption5"],"promoPrices":[{"label":"Diskon 10%","value":359100},{"label":"Diskon 20%","value":319200},{"label":"Flash Sale 30%","value":279300}]}
HANYA JSON.` }
    ], { temperature: 0.9 });

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
  const azureEndpoint = c.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = c.env.AZURE_OPENAI_KEY;
  const azureDeployment = c.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  if (!apiKey && !azureKey) return c.json({ ...fallback, mode: "simulated" });

  const competitorIntel = Array.isArray(competitors) && competitors.length > 0
    ? competitors.filter((c: any) => c.name?.trim()).map((c: any) =>
        `- ${c.name}: Harga ${c.averagePrice || '-'}, Kekuatan: ${c.strengths || '-'}, Kelemahan: ${c.weaknesses || '-'}`
      ).join("\n")
    : "- Tidak ada data kompetitor";

  const sysMsg = JSON_SYS;
  const userMsg = `Buat strategi bisnis 5-11 pilar untuk:
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
Minimal 5 pillars, maksimal 11 pillars. HANYA JSON.`;

  try {
    // Try Azure OpenAI first with retry
    for (let attempt = 0; attempt < 2; attempt++) {
      if (azureKey && azureEndpoint) {
        try {
          const azRes = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=2024-10-21`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "api-key": azureKey },
            body: JSON.stringify({ messages: [{ role: "system", content: sysMsg }, { role: "user", content: userMsg }], temperature: 0.7, max_completion_tokens: 2048 })
          });
          const azData = await azRes.json();
          const raw = azData.choices?.[0]?.message?.content || "";
          if (raw) {
            const parsed = parseJsonResponse(raw, fallback);
            if (parsed.pillars && parsed.pillars.length >= 3) {
              return c.json({ synopsis: parsed.synopsis, pillars: parsed.pillars, mode: "live-ai" });
            }
          }
        } catch {}
      }
      // Fallback to OpenRouter
      if (apiKey) {
        try {
          const raw = await callOpenRouter(apiKey, model, [{ role: "system", content: sysMsg }, { role: "user", content: userMsg }], { temperature: 0.7, maxTokens: 2048 });
          if (raw) {
            const parsed = parseJsonResponse(raw, fallback);
            if (parsed.pillars && parsed.pillars.length >= 3) {
              return c.json({ synopsis: parsed.synopsis, pillars: parsed.pillars, mode: "live-ai" });
            }
          }
        } catch {}
      }
      if (attempt < 1) await new Promise(r => setTimeout(r, 1500));
    }
    return c.json({ ...fallback, mode: "error" });
  } catch {
    return c.json({ ...fallback, mode: "error" });
  }
});

// 3. DAILY PULSE
app.post("/api/daily-pulse", async (c) => {
  const { dna, completedCount, activeStrategies, pendingItems, yesterdayRevenue, todayTarget, dailyAchievement } = await c.req.json();

  const fallback = {
    briefing: `Selamat pagi, ${dna?.brand || "Pejuang Bisnis"}! Fokus interaksi pelanggan hari ini! 💪`,
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
- Brand: ${dna?.brand || "Pengusaha"}
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

// 5b. WEB SCRAPE COMPETITOR — Search DuckDuckGo for competitor info
app.post("/api/scrape-competitor", async (c) => {
  const { competitorName, location } = await c.req.json();
  if (!competitorName) return c.json({ error: "Competitor name required." }, 400);

  const fallback = {
    name: competitorName,
    searchResults: [],
    socialLinks: [],
    summary: `Tidak dapat mengambil data online untuk "${competitorName}". Coba gunakan analisis manual.`,
    mode: "fallback"
  };

  try {
    // Search DuckDuckGo HTML (no API key needed)
    const query = encodeURIComponent(`${competitorName} ${location || ""} toko online instagram`);
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const html = await response.text();

    // Extract search results from HTML
    const results: { title: string; snippet: string; url: string }[] = [];
    const resultRegex = /<a rel="nofollow" class="result__a" href="([^"]*)"[^>]*>(.*?)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>(.*?)<\/a>/g;
    let match;
    while ((match = resultRegex.exec(html)) !== null && results.length < 5) {
      const url = match[1];
      const title = match[2].replace(/<[^>]*>/g, "").trim();
      const snippet = match[3].replace(/<[^>]*>/g, "").trim();
      if (title && snippet) {
        results.push({ title, snippet, url });
      }
    }

    // Extract social media links
    const socialLinks: string[] = [];
    const instagramMatch = html.match(/https?:\/\/(www\.)?instagram\.com\/[^\s"<>]+/g);
    const tiktokMatch = html.match(/https?:\/\/(www\.)?tiktok\.com\/@[^\s"<>]+/g);
    const shopeeMatch = html.match(/https?:\/\/shopee\.\w+\/[^\s"<>]+/g);
    if (instagramMatch) socialLinks.push(...instagramMatch.slice(0, 2));
    if (tiktokMatch) socialLinks.push(...tiktokMatch.slice(0, 2));
    if (shopeeMatch) socialLinks.push(...shopeeMatch.slice(0, 2));

    // Build summary from snippets
    const snippets = results.map(r => r.snippet).join(" ");
    const summary = snippets.length > 50
      ? `Ditemukan ${results.length} hasil pencarian untuk "${competitorName}". ${snippets.slice(0, 300)}...`
      : `Tidak ditemukan data signifikan untuk "${competitorName}" dari pencarian online.`;

    return c.json({
      name: competitorName,
      searchResults: results,
      socialLinks: [...new Set(socialLinks)],
      summary,
      mode: "scraped"
    });
  } catch (err) {
    return c.json({ ...fallback, error: String(err) });
  }
});

// 5c. INSTAGRAM PROFILE SCRAPE — Apify Instagram Profile Scraper
app.post("/api/instagram-scrape", async (c) => {
  const { username } = await c.req.json();
  if (!username) return c.json({ error: "Instagram username required." }, 400);

  const apifyToken = c.env.APIFY_TOKEN;
  if (!apifyToken) {
    return c.json({
      error: "Apify token not configured.",
      mode: "no-token"
    });
  }

  try {
    // Step 1: Start the actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/runs?token=${apifyToken}&timeout=120`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames: [username],
          includeAboutSection: false
        })
      }
    );

    const runData = await runResponse.json();
    console.log("[Apify IG] Run started:", runData?.data?.id, "status:", runData?.data?.status);

    const runId = runData?.data?.id;
    if (!runId) {
      return c.json({ error: "Failed to start Apify run", response: runData, mode: "error" });
    }

    // Step 2: Poll for completion (max 50 seconds / 25 attempts)
    // NOTE: Apify returns UPPERCASE status: READY, RUNNING, SUCCEEDED, FAILED, TIMED-OUT, ABORTED
    let status: string = runData?.data?.status || "RUNNING";
    let lastPollData: any = runData;
    let attempts = 0;
    const terminalStatuses = new Set(["SUCCEEDED", "FAILED", "TIMED-OUT", "ABORTED"]);
    while (!terminalStatuses.has(status) && attempts < 25) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
      );
      lastPollData = await pollRes.json();
      status = lastPollData?.data?.status || "RUNNING";
      attempts++;
      if (attempts % 5 === 0) console.log(`[Apify IG] Poll ${attempts}: status=${status}`);
    }

    if (status !== "SUCCEEDED") {
      return c.json({ error: `Apify run ended with status: ${status}`, runId, mode: "error" });
    }

    // Step 3: Get dataset items — use lastPollData for reliable dsId
    const dsId = lastPollData?.data?.defaultDatasetId || runData?.data?.defaultDatasetId;
    if (!dsId) {
      return c.json({ error: "No dataset ID found", mode: "error" });
    }

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${dsId}/items?token=${apifyToken}&limit=1&format=json`
    );
    const items = await itemsRes.json();
    console.log("[Apify IG] Items:", Array.isArray(items) ? items.length : typeof items);

    const profile = Array.isArray(items) ? items[0] : null;
    if (!profile) {
      return c.json({ error: "No Instagram profile data found", mode: "empty" });
    }

    // Extract useful data
    return c.json({
      username: profile.username || username,
      fullName: profile.fullName || "",
      biography: profile.biography || "",
      followers: profile.followersCount || 0,
      following: profile.followsCount || 0,
      posts: profile.postsCount || 0,
      isBusiness: profile.isBusinessAccount || false,
      isVerified: profile.verified || false,
      businessCategory: profile.businessCategoryName || "",
      externalUrl: profile.externalUrl || "",
      profilePicUrl: profile.profilePicUrlHD || profile.profilePicUrl || "",
      recentPosts: (profile.latestPosts || []).slice(0, 3).map((p: any) => ({
        caption: (p.caption || "").slice(0, 150),
        likes: p.likesCount || 0,
        comments: p.commentsCount || 0,
        timestamp: p.timestamp || ""
      })),
      mode: "apify"
    });
  } catch (err) {
    return c.json({ error: String(err), mode: "error" });
  }
});

// 5d. FACEBOOK PAGES SCRAPE — Apify Facebook Pages Scraper
app.post("/api/facebook-scrape", async (c) => {
  const { url } = await c.req.json();
  if (!url) return c.json({ error: "Facebook page URL required." }, 400);

  const apifyToken = c.env.APIFY_TOKEN;
  if (!apifyToken) {
    return c.json({ error: "Apify token not configured.", mode: "no-token" });
  }

  try {
    // Step 1: Start the actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~facebook-pages-scraper/runs?token=${apifyToken}&timeout=120`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startUrls: [{ url }]
        })
      }
    );

    const runData = await runResponse.json();
    console.log("[Apify FB] Run started:", runData?.data?.id, "status:", runData?.data?.status);

    const runId = runData?.data?.id;
    if (!runId) {
      return c.json({ error: "Failed to start Apify Facebook run", response: runData, mode: "error" });
    }

    // Step 2: Poll for completion (max 50 seconds / 25 attempts)
    // NOTE: Apify returns UPPERCASE status: READY, RUNNING, SUCCEEDED, FAILED, TIMED-OUT, ABORTED
    let status: string = runData?.data?.status || "RUNNING";
    let lastPollData: any = runData;
    let attempts = 0;
    const terminalStatuses = new Set(["SUCCEEDED", "FAILED", "TIMED-OUT", "ABORTED"]);
    while (!terminalStatuses.has(status) && attempts < 25) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
      );
      lastPollData = await pollRes.json();
      status = lastPollData?.data?.status || "RUNNING";
      attempts++;
      if (attempts % 5 === 0) console.log(`[Apify FB] Poll ${attempts}: status=${status}`);
    }

    if (status !== "SUCCEEDED") {
      return c.json({ error: `Apify Facebook run ended with status: ${status}`, runId, mode: "error" });
    }

    // Step 3: Get dataset items — use lastPollData for reliable dsId
    const dsId = lastPollData?.data?.defaultDatasetId || runData?.data?.defaultDatasetId;
    if (!dsId) {
      return c.json({ error: "No dataset ID found", mode: "error" });
    }

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${dsId}/items?token=${apifyToken}&limit=1&format=json`
    );
    const items = await itemsRes.json();
    console.log("[Apify FB] Items:", Array.isArray(items) ? items.length : typeof items);

    const page = Array.isArray(items) ? items[0] : null;
    if (!page) {
      return c.json({ error: "No Facebook page data found", mode: "empty" });
    }

    return c.json({
      name: page.name || "",
      url: page.url || url,
      likes: page.likes || 0,
      followers: page.followers || 0,
      rating: page.rating || 0,
      reviewCount: page.reviewCount || 0,
      email: page.email || "",
      phone: page.phone || "",
      website: page.website || "",
      address: page.address || "",
      bio: page.bio || page.about || "",
      isVerified: page.isVerified || false,
      category: page.category || "",
      recentPosts: (page.recentPosts || []).slice(0, 3).map((p: any) => ({
        text: (p.text || "").slice(0, 150),
        likes: p.likes || 0,
        comments: p.comments || 0,
        shares: p.shares || 0,
        timestamp: p.time || ""
      })),
      mode: "apify"
    });
  } catch (err) {
    return c.json({ error: String(err), mode: "error" });
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
      { role: "user", content: `Analisis data segmentasi pelanggan Pengusaha fashion Indonesia.

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

// 7. AUTO-SEGMENT — AI generate segments from DNA
app.post("/api/auto-segment", async (c) => {
  const { dna } = await c.req.json();

  const fallback = {
    segments: [
      { name: "Ibu Muda Urban", percentage: 35, channel: "Instagram DM", avgTransaction: dna?.normalPrice || 399000, frequency: "2x / bulan", risk: "Low" },
      { name: "Mahasiswi Trendi", percentage: 28, channel: "TikTok Shop", avgTransaction: Math.round((dna?.normalPrice || 399000) * 0.8), frequency: "1.5x / bulan", risk: "Medium" },
      { name: "Keluarga Modis", percentage: 22, channel: "Shopee", avgTransaction: Math.round((dna?.normalPrice || 399000) * 2), frequency: "1x / bulan", risk: "Low" },
      { name: "Reseller Arisan", percentage: 15, channel: "WhatsApp", avgTransaction: Math.round((dna?.normalPrice || 399000) * 4), frequency: "0.8x / bulan", risk: "High" }
    ],
    mode: "simulated"
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  const azureEndpoint = c.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = c.env.AZURE_OPENAI_KEY;
  const azureDeployment = c.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
  if (!apiKey && !azureKey) return c.json(fallback);

  try {
    const prompt = `Buat segmentasi pelanggan untuk bisnis fashion Indonesia.

Profil Bisnis:
- Brand: ${dna?.brand || "Brand"}
- Produk: ${dna?.productName || "Produk"}
- Kategori: ${dna?.category || "Fashion"}
- Sub-Kategori: ${dna?.subCategory || "-"}
- Kualitas: ${dna?.quality || "Premium"}
- Harga: Rp ${(dna?.normalPrice || 399000).toLocaleString()}
- Target Gender: ${dna?.genders?.join(", ") || "Semua"}
- Target Usia: ${dna?.ages?.join(", ") || "Dewasa"}
- Hobi: ${dna?.hobbies || "-"}
- Platform Aktif: ${dna?.activePlatforms?.join(", ") || "Instagram"}
- Buy Triggers: ${dna?.buyTriggers?.join(", ") || "Kualitas"}
- Target Revenue: Rp ${(dna?.targetMonthlyRevenue || 50000000).toLocaleString()}/bln

Buat 4-6 segmen pelanggan yang realistis dengan estimasi:
- Persentase pasar
- Kanal utama
- Rata-rata transaksi
- Frekuensi beli
- Resiko churn (Low/Medium/High)

JSON format:
{
  "segments": [
    {
      "name": "nama segmen (contoh: Ibu Muda Urban)",
      "percentage": 35,
      "channel": "kanal utama",
      "avgTransaction": 399000,
      "frequency": "2x / bulan",
      "risk": "Low/Medium/High"
    }
  ]
}
HANYA JSON.`;

    let raw = "";
    if (azureKey && azureEndpoint) {
      try {
        const azRes = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=2024-10-21`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "api-key": azureKey },
          body: JSON.stringify({ messages: [{ role: "system", content: JSON_SYS }, { role: "user", content: prompt }], temperature: 0.8, max_completion_tokens: 1024 })
        });
        const azData = await azRes.json();
        raw = azData.choices?.[0]?.message?.content || "";
      } catch {}
    }
    if (!raw && apiKey) {
      raw = await callOpenRouter(apiKey, model, [{ role: "system", content: JSON_SYS }, { role: "user", content: prompt }], { temperature: 0.8, maxTokens: 1024 });
    }

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ segments: parsed.segments || fallback.segments, mode: raw ? "live-ai" : "simulated" });
  } catch {
    return c.json(fallback);
  }
});

// 8. REVENUE PREDICTION — AI predict revenue per segment
app.post("/api/predict-revenue", async (c) => {
  const { dna, segments } = await c.req.json();

  const fallback = {
    predictions: segments.map((s: any) => ({
      name: s.name,
      monthlyRevenue: Math.round(s.avgTransaction * parseFloat(s.frequency) || s.avgTransaction * 2),
      annualRevenue: Math.round((s.avgTransaction * parseFloat(s.frequency) || s.avgTransaction * 2) * 12),
      growthPotential: s.risk === "Low" ? "Tinggi" : s.risk === "Medium" ? "Sedang" : "Rendah",
      action: s.risk === "High" ? "Prioritas retensi" : "Ekspansi & upsell"
    })),
    totalMonthly: segments.reduce((sum: number, s: any) => sum + (s.avgTransaction * (parseFloat(s.frequency) || 2)), 0),
    mode: "simulated"
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json(fallback);

  try {
    const segmentsJson = JSON.stringify(segments.map((s: any) => ({
      nama: s.name,
      persentase: s.percentage,
      rataTransaksi: s.avgTransaction,
      frekuensi: s.frequency,
      resiko: s.risk
    })));

    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Prediksi revenue untuk bisnis fashion Indonesia.

Profil Bisnis:
- Brand: ${dna?.brand || "Brand"}
- Produk: ${dna?.productName || "Produk"}
- Harga: Rp ${(dna?.normalPrice || 399000).toLocaleString()}
- Target Revenue: Rp ${(dna?.targetMonthlyRevenue || 50000000).toLocaleString()}/bln

Data Segmen:
${segmentsJson}

Buat prediksi revenue per segmen:
- Estimasi revenue bulanan
- Estimasi revenue tahunan
- Potensi pertumbuhan (Tinggi/Sedang/Rendah)
- Aksi prioritas

JSON format:
{
  "predictions": [
    {
      "name": "nama segmen",
      "monthlyRevenue": 15000000,
      "annualRevenue": 180000000,
      "growthPotential": "Tinggi/Sedang/Rendah",
      "action": "aksi prioritas"
    }
  ],
  "totalMonthly": 50000000,
  "recommendation": "rekomendasi strategi revenue 1-2 kalimat"
}
HANYA JSON.` }
    ], { temperature: 0.7, maxTokens: 1024 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ predictions: parsed.predictions || fallback.predictions, totalMonthly: parsed.totalMonthly || fallback.totalMonthly, mode: "live-ai" });
  } catch {
    return c.json(fallback);
  }
});

// 9. CUSTOMER CLUSTERING — AI cluster customers by behavior
app.post("/api/cluster-customers", async (c) => {
  const { dna, segments } = await c.req.json();

  const fallback = {
    clusters: [
      { name: "Budget Hunters", description: "Selalu cari diskon, harga jadi faktor utama", percentage: 30, channel: "Shopee & Marketplace", strategy: "Flash sale, voucher diskon, bundling hemat" },
      { name: "Quality Seekers", description: "Utamakan kualitas & brand, rela bayar lebih", percentage: 25, channel: "Instagram & WhatsApp", strategy: "Konten edukasi, testimoni, packaging premium" },
      { name: "Social Shoppers", description: "Terpengaruh tren & influencer, beli karena viral", percentage: 25, channel: "TikTok & Instagram", strategy: "Kolaborasi influencer, konten viral, UGC challenge" },
      { name: "Loyal Regulars", description: "Beli rutin, setia pada brand, jarang pindah", percentage: 20, channel: "WhatsApp & Direct", strategy: "Program loyalitas, early access, personal treatment" }
    ],
    mode: "simulated"
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json(fallback);

  try {
    const segmentsJson = JSON.stringify(segments.map((s: any) => ({
      nama: s.name,
      persentase: s.percentage,
      kanal: s.channel,
      rataTransaksi: s.avgTransaction,
      frekuensi: s.frequency,
      resiko: s.risk
    })));

    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: `Lakukan customer clustering untuk bisnis fashion Indonesia.

Profil Bisnis:
- Brand: ${dna?.brand || "Brand"}
- Produk: ${dna?.productName || "Produk"}
- Harga: Rp ${(dna?.normalPrice || 399000).toLocaleString()}
- Platform: ${dna?.activePlatforms?.join(", ") || "Instagram"}
- Buy Triggers: ${dna?.buyTriggers?.join(", ") || "Kualitas"}

Data Segmen:
${segmentsJson}

Buat 4-5 kluster pelanggan berdasarkan perilaku beli:
- Nama kluster (kreatif, mudah diingat)
- Deskripsi perilaku
- Persentase estimasi
- Kanal dominan
- Strategi pendekatan

JSON format:
{
  "clusters": [
    {
      "name": "nama kluster",
      "description": "deskripsi perilaku 1 kalimat",
      "percentage": 30,
      "channel": "kanal dominan",
      "strategy": "strategi pendekatan 1 kalimat"
    }
  ]
}
HANYA JSON.` }
    ], { temperature: 0.8, maxTokens: 1024 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ clusters: parsed.clusters || fallback.clusters, mode: "live-ai" });
  } catch {
    return c.json(fallback);
  }
});

// 5. CHAT — AI Co-pilot
app.post("/api/chat", async (c) => {
  const { messages, dna } = await c.req.json();
  if (!Array.isArray(messages) || !messages.length) return c.json({ error: "Messages required." }, 400);

  const azureEndpoint = c.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = c.env.AZURE_OPENAI_KEY;
  const azureDeployment = c.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";

  if (!azureKey && !apiKey) {
    let reply = "Halo! Saya MaxxSales AI Co-pilot. Silakan tanya apa saja!";
    return c.json({ reply, mode: "simulated" });
  }

  try {
    const sys = `Anda MaxxSales AI Co-pilot untuk Pengusaha Indonesia. Nada profesional-ramah. Bahasa Indonesia. <150 kata. Fokus pada SOLUSI, bukan menyebut nama brand berulang kali. Sebut brand hanya 1x di awal jika perlu, lalu fokus ke strategi dan aksi.`;

    const orMsgs: { role: string; content: string }[] = [{ role: "system", content: sys }];
    for (const m of messages.slice(-10)) {
      const text = m.parts || m.content || "";
      if (text.trim()) orMsgs.push({ role: m.role === "model" ? "assistant" : "user", content: text });
    }

    // Try Azure OpenAI first, fallback to OpenRouter
    let reply = "";
    if (azureKey && azureEndpoint) {
      try {
        const azRes = await fetch(`${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=2024-10-21`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": azureKey
          },
          body: JSON.stringify({
            messages: orMsgs,
            temperature: 0.7,
            max_completion_tokens: 512
          })
        });
        const azData = await azRes.json();
        reply = azData.choices?.[0]?.message?.content || "";
      } catch {
        // Fallback to OpenRouter
      }
    }

    if (!reply && apiKey) {
      // Retry up to 2 times on failure
      let lastError: any;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          reply = await callOpenRouter(apiKey, model, orMsgs, { temperature: 0.7, maxTokens: 512 });
          break;
        } catch (err) {
          lastError = err;
          if (attempt < 1) await new Promise(r => setTimeout(r, 1000));
        }
      }
      if (!reply) throw lastError;
    }

    if (!reply) throw new Error("No reply generated");
    return c.json({ reply, mode: "live-ai" });
  } catch {
    return c.json({ reply: "Maaf, kendala koneksi AI. Silakan coba lagi dalam beberapa saat.", mode: "error" });
  }
});

// 7. TACTICAL BRIEFING — 3-Chain Prompt
app.post("/api/tactical-briefing", async (c) => {
  const input = await c.req.json<TacticalBriefingInput>();

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";

  if (!apiKey) {
    return c.json({ ...generateFallbackBriefing(input), mode: "simulated" });
  }

  try {
    const llmAdapter: LlmCaller = async (messages, options) => {
      const content = await callOpenRouter(apiKey, model, messages, options);
      return { content, tokensUsed: 0 };
    };

    const briefing = await generateTacticalBriefing(input, llmAdapter);
    return c.json({ ...briefing, mode: "live-ai" });
  } catch (err: any) {
    console.error("Tactical Briefing Worker Error:", err);
    return c.json({
      ...generateFallbackBriefing(input),
      mode: "error",
      message: err?.message,
    });
  }
});

export default app;
