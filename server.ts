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

const isRealAiEnabled = !!(OPENROUTER_API_KEY && OPENROUTER_API_KEY !== "" && OPENROUTER_API_KEY.startsWith("sk-or-"));

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
function parseGeminiJson(rawText: string, fallbackJson: any): any {
  try {
    let clean = rawText.trim();
    // remove markdown wrappers
    if (clean.startsWith('```json')) {
      clean = clean.substring(7);
    } else if (clean.startsWith('```')) {
      clean = clean.substring(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.substring(0, clean.length - 3);
    }
    clean = clean.trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("VOXIA Backend: JSON parsing failed. Attempting regular extract.", e);
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
        const jsonSubstring = rawText.substring(startIndex, endIndex + 1);
        return JSON.parse(jsonSubstring);
      }
    } catch (innerErr) {
      console.error("VOXIA Backend: Extraction parsing failed as well.", innerErr);
    }
    return fallbackJson;
  }
}

// -- API ROUTES --

// Endpoint to check status and active mode
app.get("/api/status", (req, res) => {
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
        id: "mock_asset_1",
        productName,
        persona,
        targetMarket,
        mediaSpecs,
        title: `Gaya Hidup Masa Kini Bersama VOXIA ${productName}`,
        copy: `Untuk Anda yang aktif di perkotaan dan menyukai efisiensi kelas dunia. Didesain khusus mencakup seluruh kebutuhan ${persona} masa kini. Jangan lewatkan penawaran terbatas khusus minggu ini.`,
        ctaText: "Mulai Sekarang",
        type: "social-post",
        styleTheme: {
          bgGradient: "from-slate-900 to-indigo-950",
          primaryColor: "#0A3D62",
          accentColor: "#FFB400",
          textStyle: "font-sans leading-relaxed tracking-normal"
        },
        version: 1
      },
      {
        id: "mock_asset_2",
        productName,
        persona,
        targetMarket,
        mediaSpecs,
        title: `${productName}: Keseimbangan Sempurna Aktivitas Anda`,
        copy: `Menemukan keseimbangan terbaik di tengah dinamika hidup di perkotaan menjadi semakin mudah. Dibuat dengan formula ramah pengguna untuk target pasar ${targetMarket || "umum"}. Gunakan diskon peluncuran 15% hari ini!`,
        ctaText: "Dapatkan Sekarang",
        type: "image",
        styleTheme: {
          bgGradient: "from-cyan-900 via-sky-950 to-blue-905",
          primaryColor: "#00A3E0",
          accentColor: "#0A3D62",
          textStyle: "font-sans font-medium"
        },
        version: 1
      },
      {
        id: "mock_asset_3",
        productName,
        persona,
        targetMarket,
        mediaSpecs,
        title: "Temukan Solusi Cerdas Anda",
        copy: `Kenapa memilih yang biasa jika VOXIA ${productName} bisa memberikan kinerja optimal 10x lipat? Dirancang presisi demi melayani ${persona} secara tak terbatas.`,
        ctaText: "Tonton Promo Video",
        type: "video",
        styleTheme: {
          bgGradient: "from-zinc-900 to-slate-800",
          primaryColor: "#FFB400",
          accentColor: "#00A3E0",
          textStyle: "font-mono"
        },
        version: 1
      }
    ]
  };

  if (!isRealAiEnabled) {
    // Simulator flow
    return res.json({
      ...defaultMockResponse,
      mode: "stimulated-local"
    });
  }

  try {
    const prompt = `Anda adalah Direktur Kreatif & AI Copywriter Senior VOXIA.
Hasilkan 3 variasi aset kampanye pemasaran digital berkualitas tinggi dalam bahasa Indonesia untuk:
- Nama Produk: ${productName}
- Persona Pengguna Utama: ${persona}
- Target Pasar / Demografi: ${targetMarket || "Masayarakat umum perkotaan"}
- Spesifikasi Media / Format Utama: ${mediaSpecs || "Instagram / TikTok feeds"}

Hasilkan respons dalam format JSON STRICT yang memiliki properti:
{
  "assets": [
    {
      "title": "Judul copy ad utama yang memikat (kurang dari 10 kata)",
      "copy": "Naskah iklan promosi lengkap, persuasif, menarik (2-3 kalimat)",
      "ctaText": "Tombol aksi (e.g., 'Beli Sekarang', 'Mulai Konsultasi')",
      "type": "Jenis media: pilih salah satu dari 'social-post' atau 'image' atau 'video' atau 'copy'",
      "styleTheme": {
        "bgGradient": "Pilih gradient Tailwind yang mewah",
        "primaryColor": "Hex color yang kontras",
        "accentColor": "Warna aksen pembeda",
        "textStyle": "Gaya teks Tailwind"
      }
    }
  ]
}

Berikan response HANYA berupa JSON tanpa penjelasan tambahan agar dapat di-parse secara otomatis.`;

    const raw = await callOpenRouter([
      { role: "system", content: "Anda selalu merespon dalam format JSON yang valid. Tanpa markdown, tanpa penjelasan." },
      { role: "user", content: prompt }
    ], { temperature: 0.8 });

    const parsed = parseGeminiJson(raw, defaultMockResponse);
    const finalAssets = parsed.assets.map((asset: any, idx: number) => ({
      id: `ai_asset_${Date.now()}_${idx}`,
      productName,
      persona,
      targetMarket,
      mediaSpecs,
      version: 1,
      ...asset
    }));

    return res.json({ assets: finalAssets, mode: "live-ai" });
  } catch (error: any) {
    console.error("VOXIA Backend error:", error);
    return res.status(200).json({
      ...defaultMockResponse,
      mode: "stimulated-local-error-fallback",
      message: error.message
    });
  }
});
  }

  try {
    const prompt = `Anda adalah Direktur Kreatif & AI Copywriter Senior VOXIA.
Hasilkan 3 variasi aset kampanye pemasaran digital berkualitas tinggi dalam bahasa Indonesia untuk:
- Nama Produk: ${productName}
- Persona Pengguna Utama: ${persona}
- Target Pasar / Demografi: ${targetMarket || "Masayarakat umum perkotaan"}
- Spesifikasi Media / Format Utama: ${mediaSpecs || "Instagram / TikTok feeds"}

Hasilkan respons dalam format JSON STRICT yang memiliki properti:
{
  "assets": [
    {
      "title": "Judul copy ad utama yang memikat (kurang dari 10 kata)",
      "copy": "Naskah iklan promosi lengkap, persuasif, menarik (2-3 kalimat)",
      "ctaText": "Tombol aksi (e.g., 'Beli Sekarang', 'Mulai Konsultasi')",
      "type": "Jenis media: pilih salah satu dari 'social-post' atau 'image' atau 'video' atau 'copy'",
      "styleTheme": {
        "bgGradient": "Pilih gradient Tailwind yang mewah (e.g. 'from-blue-900 to-cyan-900', 'from-[#0A3D62] to-[#00A3E0]')",
        "primaryColor": "A hex color yang kontras dan serasi (e.g. '#0A3D62', '#00A3E0')",
        "accentColor": "Warna aksen pembeda yang mencolok (e.g. '#FFB400')",
        "textStyle": "Gaya teks umum Tailwind (e.g. 'font-sans font-bold')"
      }
    }
  ]
}

Beri response HANYA berupa JSON tanpa penjelasan tambahan agar dapat di-parse secara otomatis.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = parseGeminiJson(response.text || "", defaultMockResponse);
    // Add dynamic attributes
    const finalAssets = parsed.assets.map((asset: any, idx: number) => ({
      id: `ai_asset_${Date.now()}_${idx}`,
      productName,
      persona,
      targetMarket,
      mediaSpecs,
      version: 1,
      ...asset
    }));

    return res.json({ assets: finalAssets, mode: "live-ai" });
  } catch (error: any) {
    console.error("VOXIA Backend error:", error);
    return res.status(200).json({
      ...defaultMockResponse,
      mode: "stimulated-local-error-fallback",
      message: error.message
    });
  }
});

// 2. STRATEGY - ENGINE RECOMMENDATION WIZARD
app.post("/api/generate-strategy", async (req, res) => {
  const { businessName, industry, painPoints, budget, timeline } = req.body;

  const defaultMockStrategy = {
    blueprint: [
      {
        channel: "Instagram & TikTok Organic Content",
        targetAudience: "Generasi muda urban berusia 18-30 tahun, peduli tren gaya hidup mandiri.",
        message: `Tunjukkan betapa mudahnya kehidupan sehari-hari jika dibantu oleh keunggulan produk ${businessName}.`,
        kpi: "20% peningkatan Follower & Engagement Rate bulanan",
        cta: "Kunjungi Bio Profil untuk info diskon",
        details: "Membuat video pendek reels 15-detik seminggu 3 kali yang membandingkan tantangan sebelum dan sesudah menggunakan produk."
      },
      {
        channel: "Facebook & Instagram Retargeting Ads",
        targetAudience: "Pengunjung website yang memasukkan barang ke keranjang namun belum bertransaksi.",
        message: "Jangan ragu lagi! Amankan penawaran spesial sekarang dan dapatkan gratis ongkir seluruh Indonesia.",
        kpi: "3.5x Return on Ad Spend (ROAS)",
        cta: "Belanja Sekarang",
        details: "Gunakan visual katalog dinamis yang menonjolkan jaminan garansi 1 tahun serta ulasan positif bintang lima."
      },
      {
        channel: "WhatsApp Broadcast & Automation",
        targetAudience: "Database prospek hangat yang masuk dari form kampanye landing page.",
        message: `Halo Kak, terima kasih telah mendaftar. Berikut Blueprint strategi khusus ${businessName} untuk Anda!`,
        kpi: "+25% Conversion Rate dari pendaftaran ke penjualan",
        cta: "Hubungi CRM Agent",
        details: "Kirim serangkaian pesan bertahap (hari ke-1: salam perkenalan, hari ke-3: testimoni, hari ke-5: penawaran kupon spesial)."
      }
    ],
    budgetAllocation: [
      { name: "Direct Ads (FB/IG)", value: 45, color: "#0A3D62" },
      { name: "KOL / Influencer", value: 25, color: "#00A3E0" },
      { name: "CRM & WA Automation", value: 20, color: "#FFB400" },
      { name: "Search & SEO Engine", value: 10, color: "#475569" }
    ],
    aiReasoning: `Berdasarkan kendala utama berupa pemasaran yang kurang terarah dan data anggaran senilai Rp ${budget?.toLocaleString() || "5.000.000"}, kami menyarankan strategi bercabang yang berfokus kuat pada media sosial visual digabungkan dengan automasi penawaran CRM. Fokus ads 45% memastikan aliran prospek baru tetap tinggi, sementara follow-up cepat via WA meningkatkan retensi penjualan.`
  };

  if (!isRealAiEnabled) {
    return res.json({
      ...defaultMockStrategy,
      id: `strat_${Date.now()}`,
      businessName,
      industry,
      painPoints: painPoints || [],
      budget: budget || 10000000,
      timeline: timeline || "1 Bulan",
      createdAt: new Date().toISOString(),
      mode: "stimulated-local"
    });
  }

  try {
    const prompt = `Anda adalah Konsultan Strategi Bisnis AI VOXIA.
Hasilkan Blueprint Kampanye Pemasaran Digital komprehensif untuk bisnis berikut:
- Nama Bisnis: ${businessName}
- Sektor Industri: ${industry}
- Hambatan Utama (Pain Points): ${Array.isArray(painPoints) ? painPoints.join(", ") : painPoints}
- Total Anggaran: Rp ${budget ? budget.toLocaleString() : "Negosiasi"}
- Jangka Waktu (Timeline): ${timeline}

Hasilkan data dalam format JSON STRICT yang memiliki properti persis seperti berikut:
{
  "blueprint": [
    {
      "channel": "Nama Media / Saluran Iklan",
      "targetAudience": "Deskripsi target pemirsa spesifik",
      "message": "Pesan utama atau copy andalan",
      "kpi": "Metrik keberhasilan utama",
      "cta": "Call to action yang kuat",
      "details": "Langkah action konkret untuk operasional taktis"
    }
  ],
  "budgetAllocation": [
    { "name": "FB/IG Ads", "value": 40, "color": "#0A3D62" },
    { "name": "CRM Automation", "value": 30, "color": "#00A3E0" },
    { "name": "Content Creation", "value": 20, "color": "#FFB400" },
    { "name": "Lainnya", "value": 10, "color": "#475569" }
  ],
  "aiReasoning": "Paragraf ringkasan penjelasan taktis mengapa alokasi ini dirancang demikian"
}

Pastikan properti "budgetAllocation" bernilai total persis 100%. Berikan HANYA respons JSON mentah.`;

    const raw = await callOpenRouter([
      { role: "system", content: "Anda selalu merespon dalam format JSON yang valid. Tanpa markdown, tanpa penjelasan." },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const parsed = parseGeminiJson(raw, defaultMockStrategy);

    return res.json({
      id: `strat_${Date.now()}`,
      businessName,
      industry,
      painPoints: painPoints || [],
      budget: budget || 10000000,
      timeline: timeline || "1 Bulan",
      createdAt: new Date().toISOString(),
      blueprint: parsed.blueprint,
      budgetAllocation: parsed.budgetAllocation,
      aiReasoning: parsed.aiReasoning,
      mode: "live-ai"
    });
  } catch (error: any) {
    console.error("VOXIA Strategy Backend Error:", error);
    return res.status(200).json({
      ...defaultMockStrategy,
      id: `strat_${Date.now()}`,
      businessName,
      industry,
      painPoints: painPoints || [],
      budget: budget || 10000000,
      timeline: timeline || "1 Bulan",
      createdAt: new Date().toISOString(),
      mode: "stimulated-local-error-fallback",
      message: error.message
    });
  }
});

// 3. CRM - EVALUATE LEAD SCORE
app.post("/api/evaluate-lead-score", async (req, res) => {
  const { contactName, email, phone, notes, status } = req.body;

  const defaultMockScore = {
    score: 78,
    scoreExplanation: "Prospek ini menunjukkan minat tinggi karena telah mengunduh materi promosi dan menanyakan ketersediaan produk, namun agak lambat merespons pesan WhatsApp terakhir. Direkomendasikan melakukan follow-up dengan penawaran kupon diskon gratis ongkir."
  };

  if (!contactName) {
    return res.status(400).json({ error: "Contact name is required." });
  }

  if (!isRealAiEnabled) {
    return res.json({
      ...defaultMockScore,
      mode: "stimulated-local"
    });
  }

  try {
    const prompt = `Anda adalah Model Analitik Lead-Scoring CRM VOXIA.
Evaluasi prospek berikut dan tentukan angka AI Lead Score (1-100) serta penjelasan singkat (1-2 kalimat):
- Nama Kontak: ${contactName}
- Email: ${email || "Tidak ada"}
- No Handphone/WA: ${phone || "Tidak ada"}
- Catatan Interaksi: ${notes || "Tidak ada catatan aktivitas"}
- Status saat ini: ${status || "Lead"}

Hasilkan respons JSON STRICT:
{
  "score": 85,
  "scoreExplanation": "Alasan detail dalam bahasa Indonesia mengenai pemberian skor tersebut, serta saran tindakan CRM berikutnya."
}

Kirimkan JSON tanpa teks pembuka/penutup.`;

    const raw = await callOpenRouter([
      { role: "system", content: "Anda selalu merespon dalam format JSON yang valid. Tanpa markdown, tanpa penjelasan." },
      { role: "user", content: prompt }
    ], { temperature: 0.5 });

    const parsed = parseGeminiJson(raw, defaultMockScore);
    return res.json({
      score: parsed.score,
      scoreExplanation: parsed.scoreExplanation,
      mode: "live-ai"
    });
  } catch (err: any) {
    console.error("VOXIA Evaluation Score Error:", err);
    return res.json({
      ...defaultMockScore,
      mode: "stimulated-local-error",
      message: err.message
    });
  }
});

// 4. COMPETITOR - SCRAPE & BREAKDOWN ANALYSIS
app.post("/api/analyze-competitor", async (req, res) => {
  const { competitorUrlOrName } = req.body;

  if (!competitorUrlOrName) {
    return res.status(400).json({ error: "Competitor Url or Name is required." });
  }

  const defaultMockCompetitor = {
    name: competitorUrlOrName,
    channelMix: [
      { name: "Paid Ads (Meta)", spend: 50, color: "#0A3D62" },
      { name: "TikTok Ads", spend: 30, color: "#00A3E0" },
      { name: "SEO & Content", spend: 12, color: "#FFB400" },
      { name: "Email Marketing", spend: 8, color: "#475569" }
    ],
    pricingSnapshot: [
      { tier: "Paket Dasar", price: "Rp 199.000 / bln" },
      { tier: "Paket Profesional", price: "Rp 499.000 / bln" },
      { tier: "Paket Premium Enterprise", price: "Rp 1.250.000 / bln" }
    ],
    metrics: {
      engagementRate: "4.8% (Tinggi)",
      adSpendEst: "Rp 15.000.000 - Rp 25.000.000 / bln",
      likesTrend: [400, 480, 520, 610, 590, 720]
    },
    socialAdSamples: [
      {
        headline: "Capek Manajemen Prospek Manual?",
        channels: ["Meta", "Instagram"],
        copy: "Gabung sekarang dengan ribuan pemilik usaha yang berhasil memotong waktu operasional admin CRM hingga 70%. Coba demo gratis!",
        imgPrompt: "A sleek modern office workflow showing automated connection nodes connecting easily in bright UI color scheme."
      },
      {
        headline: "Solusi All-in-One Paling Hemat",
        channels: ["TikTok", "Google"],
        copy: "Kenapa bayar banyak aplikasi terpisah kalau ada satu solusi serba lengkap? Klik tombol di bawah untuk kupon diskon 20%!",
        imgPrompt: "A happy minimalist merchant using a smartphone in an open retail shop, vector flat clean UI design elements."
      }
    ]
  };

  if (!isRealAiEnabled) {
    return res.json({
      ...defaultMockCompetitor,
      mode: "stimulated-local"
    });
  }

  try {
    const prompt = `Anda adalah Ahli Intelijen Pasar & Analisis Kompetitor VOXIA.
Lakukan analisis mendalam terhadap kompetitor: "${competitorUrlOrName}".
Prediksikan bauran saluran iklan mereka, struktur harga, engagement metrics, dan ad copy.

Hasilkan respons berformat JSON STRICT:
{
  "name": "Nama Resmi Kompetitor",
  "channelMix": [
    { "name": "Paid Ads (Meta)", "spend": 45, "color": "#0A3D62" },
    { "name": "TikTok Ads", "spend": 35, "color": "#00A3E0" },
    { "name": "Lainnya", "spend": 20, "color": "#FFB400" }
  ],
  "pricingSnapshot": [
    { "tier": "Nama Paket 1", "price": "Harga Estimasi" },
    { "tier": "Nama Paket 2", "price": "Harga Estimasi" }
  ],
  "metrics": {
    "engagementRate": "3.2%",
    "adSpendEst": "Rp 10jt - Rp 20jt/bln",
    "likesTrend": [200, 240, 280, 310, 290, 350]
  },
  "socialAdSamples": [
    {
      "headline": "Headline iklan",
      "channels": ["Platform"],
      "copy": "Copywriting iklan",
      "imgPrompt": "Deskripsi visual"
    }
  ]
}

Pastikan "channelMix" totalnya 100%. Keluarkan HANYA JSON.`;

    const raw = await callOpenRouter([
      { role: "system", content: "Anda selalu merespon dalam format JSON yang valid. Tanpa markdown, tanpa penjelasan." },
      { role: "user", content: prompt }
    ], { temperature: 0.7 });

    const parsed = parseGeminiJson(raw, defaultMockCompetitor);
    return res.json({
      ...parsed,
      mode: "live-ai"
    });
  } catch (err: any) {
    console.error("VOXIA Competitor Analytics Error:", err);
    return res.json({
      ...defaultMockCompetitor,
      mode: "stimulated-local-error",
      message: err.message
    });
  }
});

// 5. CHATBOT HELP - AI ADVISOR EXPLAIN
app.post("/api/help-chat", async (req, res) => {
  const { messages, context } = req.body; // messages array: { role: 'user'|'model', parts: '...' }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages list is required." });
  }

  const latestUserText = messages[messages.length - 1].parts;

  if (!isRealAiEnabled) {
    // Return simple intelligent system simulation answers code
    const words = latestUserText.toLowerCase();
    let reply = "Halo! Saya adalah VOXIA AI Assistant. Saya siap membantu Anda mengoptimalkan kampanye, menyusun riset branding, menghitung skor otomatis CRM prospek, hingga sinkronisasi aset antarcabang. Silakan tanyakan apa saja mengenai strategi Sales Flow Anda.";

    if (words.includes("skor") || words.includes("crm") || words.includes("score")) {
      reply = "Di VOXIA, Skor AI dihitung secara real-time berdasarkan frekuensi interaksi prospek, riwayat klik WhatsApp, serta nilai transaksi potensial yang dimasukkan dalam catatan CRM. Prospek berskor di atas 80 sangat direkomendasikan langsung didorong automasi penawaran.";
    } else if (words.includes("branding") || words.includes("asset") || words.includes("aset")) {
      reply = "Gunakan tab 'Branding' untuk membuat ad copy interaktif dan visual dalam sekejap! Cukup isi nama produk dan audiens persona Gen-Z atau ibu rumah tangga, lalu klik 'Generate'. Sistem kami akan berdiskusi dengan AI dan mengompilasi ad copy lengkap dengan visual background estetik.";
    } else if (words.includes("strategy") || words.includes("blueprint") || words.includes("strategi")) {
      reply = "Wizard Strategi VOXIA dirancang dalam 4 tahap untuk memetakan pain points pemasaran, membuat bagan alir visual corong prospek Anda, lalu merumuskan tabel detail kanal promosi dan alokasi bujet media sosial yang optimal.";
    } else if (words.includes("competitor") || words.includes("kompetitor") || words.includes("brand")) {
      reply = "Dapatkan bocoran taktik kompetitor Anda di menu 'Competitor'. Cukup masukkan tautan web atau nama kompetitor Anda, dan AI akan menganalisis perkiraan anggaran iklan bulanan, contoh tulisan iklan terkuat mereka, serta bauran media yang mereka optimalkan.";
    } else if (words.includes("cabang") || words.includes("branch") || words.includes("outlet")) {
      reply = "Fitur 'Branches' kami mempermudah pengelolaan multi-wilayah. Pemilik dapat mengawasi total leads nasional di dashboard peta, sekaligus menentukan apakah kampanye pemasaran baru disinkronisasi ke seluruh cabang secara serentak atau berbeda per wilayah.";
    }

    return res.json({
      reply,
      mode: "stimulated-local"
    });
  }

  try {
    const systemPrompt = `Anda adalah VOXIA Sales-Flow Specialist, asisten AI ramah, proaktif, dan ahli dalam bidang penjualan digital, CRM, periklanan, dan manajemen cabang bisnis lokal di Indonesia.
Jawab pertanyaan dari pebisnis pengguna VOXIA dengan nada yang profesional, berwibawa, penuh strategi, taktis, namun bersahabat.
Gunakan bahasa Indonesia yang mengalir dengan baik. Selalu kaitkan jawaban dengan kapabilitas dashboard VOXIA apabila relevan:
- Menu Branding: untuk meluncurkan ad copy andalan & visual terarah berdasarkan foto produk.
- Menu Strategy: sebagai perancang sales funnel modular visual & kalkulasi pie chart alokasi budget.
- Menu CRM: alat pelacak database pelanggan yang menghitung AI-Score prospek otomatis & automasi no-code.
- Menu Competitor: riset mandiri kanal media pesaing secara visual.
- Menu Multi-Branch: sinkronisasi aset promosi wilayah HQ ke cabang lokal lewat peta interaktif.

Konteks aktif: ${JSON.stringify(context || {})}
Jawab dalam kurang dari 150 kata.`;

    // Build messages array for OpenRouter
    const orMessages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt }
    ];

    // Add conversation history (last 10 messages max)
    const historyMessages = messages.slice(-10);
    for (const msg of historyMessages) {
      orMessages.push({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.parts
      });
    }

    const reply = await callOpenRouter(orMessages, { temperature: 0.7, maxTokens: 512 });

    return res.json({
      reply,
      mode: "live-ai"
    });
  } catch (err: any) {
    console.error("VOXIA Chat Assistant Error:", err);
    return res.status(200).json({
      reply: `Maaf, terjadi kendala saat menghubungi AI. Mari saya jawab secara mandiri: ${latestUserText.includes("skor") ? "Lead Score VOXIA membantu Anda memprioritaskan kontak dengan niat beli paling tinggi berdasarkan analisis otomatis percakapan WhatsApp." : "Mari kita rancang aset iklan dan strategi saluran penjualan terbaik di platform VOXIA Anda."}`,
      mode: "stimulated-local-error",
      message: err.message
    });
  }
});


// Serve static frontend assets in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  // Vite dev mode integration pipeline
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

// Bind to port 3000 on host 0.0.0.0
app.listen(PORT, "0.0.0.0", () => {
  console.log(`===========================================================`);
  console.log(`🚀 VOXIA Sales-Flow started on http://localhost:${PORT}`);
  console.log(`===========================================================`);
});
