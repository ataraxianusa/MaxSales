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
      "X-Title": "MaxSales by VOXIA"
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
    platform: "VOXIA Sales-Flow (Cloudflare Workers)",
    currentTime: new Date().toISOString()
  });
});

// 1. BRANDING
app.post("/api/generate-assets", async (c) => {
  const body = await c.req.json();
  const { productName, persona, targetMarket, mediaSpecs } = body;

  if (!productName || !persona) return c.json({ error: "Product name and Persona required." }, 400);

  const fallback = {
    assets: [
      { id: "mock_1", productName, persona, targetMarket, mediaSpecs, title: `Gaya Hidup Bersama VOXIA ${productName}`, copy: `Untuk Anda yang aktif di perkotaan. Didesain untuk ${persona}.`, ctaText: "Mulai Sekarang", type: "social-post", styleTheme: { bgGradient: "from-slate-900 to-indigo-950", primaryColor: "#0A3D62", accentColor: "#FFB400", textStyle: "font-sans" }, version: 1 },
      { id: "mock_2", productName, persona, targetMarket, mediaSpecs, title: `${productName}: Keseimbangan Sempurna`, copy: `Kemudahan hidup di perkotaan untuk ${targetMarket || "umum"}. Diskon 15%!`, ctaText: "Dapatkan Sekarang", type: "image", styleTheme: { bgGradient: "from-cyan-900 to-blue-905", primaryColor: "#00A3E0", accentColor: "#0A3D62", textStyle: "font-sans" }, version: 1 },
      { id: "mock_3", productName, persona, targetMarket, mediaSpecs, title: "Solusi Cerdas Anda", copy: `VOXIA ${productName}: kinerja optimal 10x untuk ${persona}.`, ctaText: "Tonton Video", type: "video", styleTheme: { bgGradient: "from-zinc-900 to-slate-800", primaryColor: "#FFB400", accentColor: "#00A3E0", textStyle: "font-mono" }, version: 1 }
    ]
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "stimulated-local" });

  try {
    const prompt = `Buat 3 aset kampanye digital (bahasa Indonesia) untuk: Produk=${productName}, Persona=${persona}, Target=${targetMarket||"umum"}, Media=${mediaSpecs||"Instagram/TikTok"}.
JSON: {"assets":[{"title":"judul <10 kata","copy":"naskah persuasif","ctaText":"aksi","type":"social-post|image|video","styleTheme":{"bgGradient":"tailwind","primaryColor":"#hex","accentColor":"#hex","textStyle":"tailwind"}}]}
HANYA JSON.`;

    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: prompt }
    ], { temperature: 0.8 });

    const parsed = parseJsonResponse(raw, fallback);
    const assets = (parsed.assets || []).map((a: any, i: number) => ({
      id: `ai_${Date.now()}_${i}`, productName, persona, targetMarket, mediaSpecs, version: 1, ...a
    }));
    return c.json({ assets, mode: "live-ai" });
  } catch (e: any) {
    return c.json({ ...fallback, mode: "error", message: e.message });
  }
});

// 2. STRATEGY
app.post("/api/generate-strategy", async (c) => {
  const { businessName, industry, painPoints, budget, timeline } = await c.req.json();

  const fallback = {
    blueprint: [
      { channel: "Instagram & TikTok", targetAudience: "Generasi muda 18-30", message: `Kemudahan dengan ${businessName}.`, kpi: "+20% Engagement", cta: "Kunjungi Profil", details: "Reels 15 detik 3x/minggu." },
      { channel: "Facebook Retargeting", targetAudience: "Pengunjung belum transaksi", message: "Penawaran spesial!", kpi: "3.5x ROAS", cta: "Belanja Sekarang", details: "Katalog dinamis + garansi." },
      { channel: "WhatsApp Broadcast", targetAudience: "Prospek hangat", message: `Strategi khusus ${businessName}.`, kpi: "+25% Conversion", cta: "Hubungi Agent", details: "Seri pesan hari 1-3-5." }
    ],
    budgetAllocation: [
      { name: "Direct Ads", value: 45, color: "#0A3D62" },
      { name: "KOL/Influencer", value: 25, color: "#00A3E0" },
      { name: "CRM & WA", value: 20, color: "#FFB400" },
      { name: "SEO", value: 10, color: "#475569" }
    ],
    aiReasoning: `Strategi fokus media sosial visual + automasi CRM untuk bisnis ${businessName}.`
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, id: `strat_${Date.now()}`, businessName, industry, painPoints: painPoints||[], budget: budget||10000000, timeline: timeline||"1 Bulan", createdAt: new Date().toISOString(), mode: "stimulated-local" });

  try {
    const prompt = `Blueprint kampanye untuk: Bisnis=${businessName}, Industri=${industry}, Pain=${Array.isArray(painPoints)?painPoints.join(","):painPoints||"N/A"}, Budget=Rp${budget?.toLocaleString()||"Negosiasi"}, Timeline=${timeline||"1 Bulan"}.
JSON: {"blueprint":[{"channel":"saluran","targetAudience":"target","message":"pesan","kpi":"metrik","cta":"aksi","details":"taktis"}],"budgetAllocation":[{"name":"label","value":persen,"color":"#hex"}],"aiReasoning":"penjelasan"}
Budget total 100%. HANYA JSON.`;

    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ id: `strat_${Date.now()}`, businessName, industry, painPoints: painPoints||[], budget: budget||10000000, timeline: timeline||"1 Bulan", createdAt: new Date().toISOString(), blueprint: parsed.blueprint, budgetAllocation: parsed.budgetAllocation, aiReasoning: parsed.aiReasoning, mode: "live-ai" });
  } catch (e: any) {
    return c.json({ ...fallback, id: `strat_${Date.now()}`, businessName, industry, painPoints: painPoints||[], budget: budget||10000000, timeline: timeline||"1 Bulan", createdAt: new Date().toISOString(), mode: "error", message: e.message });
  }
});

// 3. LEAD SCORE
app.post("/api/evaluate-lead-score", async (c) => {
  const { contactName, email, phone, notes, status } = await c.req.json();
  if (!contactName) return c.json({ error: "Contact name required." }, 400);

  const fallback = { score: 78, scoreExplanation: "Prospek minat tinggi. Follow-up dengan kupon diskon." };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "stimulated-local" });

  try {
    const prompt = `Evaluasi prospek CRM: Nama=${contactName}, Email=${email||"-"}, WA=${phone||"-"}, Catatan=${notes||"-"}, Status=${status||"Lead"}.
JSON: {"score":angka1-100,"scoreExplanation":"alasan + saran (Indonesia)"}
HANYA JSON.`;

    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: prompt }
    ], { temperature: 0.5 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ score: parsed.score, scoreExplanation: parsed.scoreExplanation, mode: "live-ai" });
  } catch (e: any) {
    return c.json({ ...fallback, mode: "error", message: e.message });
  }
});

// 4. COMPETITOR
app.post("/api/analyze-competitor", async (c) => {
  const { competitorUrlOrName } = await c.req.json();
  if (!competitorUrlOrName) return c.json({ error: "Competitor name required." }, 400);

  const fallback = {
    name: competitorUrlOrName,
    channelMix: [{ name: "Paid Ads", spend: 50, color: "#0A3D62" }, { name: "TikTok", spend: 30, color: "#00A3E0" }, { name: "SEO", spend: 12, color: "#FFB400" }, { name: "Email", spend: 8, color: "#475569" }],
    pricingSnapshot: [{ tier: "Basic", price: "Rp 199K/bln" }, { tier: "Pro", price: "Rp 499K/bln" }, { tier: "Enterprise", price: "Rp 1.25M/bln" }],
    metrics: { engagementRate: "4.8%", adSpendEst: "Rp 15-25jt/bln", likesTrend: [400, 480, 520, 610, 590, 720] },
    socialAdSamples: [{ headline: "Capek CRM Manual?", channels: ["Meta"], copy: "Potong waktu admin 70%!", imgPrompt: "Modern office workflow" }]
  };

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";
  if (!apiKey) return c.json({ ...fallback, mode: "stimulated-local" });

  try {
    const prompt = `Analisis kompetitor "${competitorUrlOrName}": channel mix, pricing, engagement, ad samples.
JSON: {"name":"nama","channelMix":[{"name":"label","spend":persen,"color":"#hex"}],"pricingSnapshot":[{"tier":"nama","price":"harga"}],"metrics":{"engagementRate":"%","adSpendEst":"range","likesTrend":[6 angka]},"socialAdSamples":[{"headline":"judul","channels":["platform"],"copy":"naskah","imgPrompt":"deskripsi"}]}
ChannelMix 100%. HANYA JSON.`;

    const raw = await callOpenRouter(apiKey, model, [
      { role: "system", content: JSON_SYS },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const parsed = parseJsonResponse(raw, fallback);
    return c.json({ ...parsed, mode: "live-ai" });
  } catch (e: any) {
    return c.json({ ...fallback, mode: "error", message: e.message });
  }
});

// 5. CHAT
app.post("/api/help-chat", async (c) => {
  const { messages, context } = await c.req.json();
  if (!Array.isArray(messages) || !messages.length) return c.json({ error: "Messages required." }, 400);

  const latest = messages[messages.length - 1].parts;

  const apiKey = c.env.OPENROUTER_API_KEY;
  const model = c.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";

  if (!apiKey) {
    const w = latest.toLowerCase();
    let r = "Halo! Saya VOXIA AI Assistant. Silakan tanyakan apa saja tentang strategi Sales Flow Anda!";
    if (w.includes("skor") || w.includes("crm")) r = "Skor AI VOXIA dihitung real-time berdasarkan frekuensi interaksi dan riwayat WA.";
    else if (w.includes("branding") || w.includes("aset")) r = "Gunakan tab 'Branding' untuk membuat ad copy & visual dalam sekejap!";
    else if (w.includes("strategi") || w.includes("strategy")) r = "Wizard Strategi dalam 4 tahap: pain points, funnel, kanal promosi, alokasi budget.";
    else if (w.includes("kompetitor") || w.includes("competitor")) r = "Masukkan nama kompetitor untuk analisis anggaran iklan dan bauran media.";
    else if (w.includes("cabang") || w.includes("branch")) r = "Fitur 'Branches' untuk multi-wilayah dengan peta interaktif.";
    return c.json({ reply: r, mode: "stimulated-local" });
  }

  try {
    const sys = `Anda VOXIA Sales-Flow Specialist, ahli penjualan digital, CRM, periklanan Indonesia.
Nada: profesional, taktis, bersahabat. Bahasa Indonesia. <150 kata.
Kaitkan dengan VOXIA: Branding (ad copy), Strategy (funnel+budget), CRM (AI-Score), Competitor (riset kanal), Multi-Branch (peta).
Konteks: ${JSON.stringify(context || {})}`;

    const orMsgs: { role: string; content: string }[] = [{ role: "system", content: sys }];
    for (const m of messages.slice(-10)) {
      orMsgs.push({ role: m.role === "model" ? "assistant" : "user", content: m.parts });
    }

    const reply = await callOpenRouter(apiKey, model, orMsgs, { temperature: 0.7, maxTokens: 512 });
    return c.json({ reply, mode: "live-ai" });
  } catch (e: any) {
    return c.json({ reply: `Maaf, kendala AI. ${latest.includes("skor") ? "Lead Score membantu prioritas kontak." : "Mari rancang strategi di VOXIA."}`, mode: "error", message: e.message });
  }
});

export default app;
