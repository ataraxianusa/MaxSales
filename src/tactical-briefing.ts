/**
 * MaxxSales — Tactical Briefing Generator (Prompt Chaining)
 *
 * 3-chain pipeline:
 *   Chain 1: GapAnalyzer   →  "What's the single most critical gap TODAY?"
 *   Chain 2: ExecutionPlan →  "Based on that gap, what 2-3 things do I DO?"
 *   Chain 3: CommsWriter   →  "Give me ready-to-send messages for customers."
 *
 * Temperature locked at 0.25 to suppress hallucinated theory and enforce rule adherence.
 *
 * @license SPDX-License-Identifier: Apache-2.0
 */

// ─────────────────────────────────────────────────────────────
// INPUT INTERFACES — data dari modul hulu
// ─────────────────────────────────────────────────────────────

/** Rangkuman intelijen kompetitor dari War Room */
export interface WarRoomBrief {
  competitors: {
    name: string;
    biggestWeakness: string;
    priceGap: string;
    blindSpot: string;
  }[];
  topMarketThreat: string;
  untappedOpportunity: string;
}

/** Rangkuman wawasan pelanggan dari Customer Insight */
export interface CustomerInsightBrief {
  topSegment: string;
  topComplaint: string;
  topDesire: string;
  churnRiskSegment: string;
  avgTransactionGap: string;
}

/** Konteks harian opsional */
export interface DailyContext {
  yesterdayRevenue: number;
  todayTarget: number;
  dailyAchievementPct: number;
  activeStrategies: string[];
  pendingItems: string[];
  streakDays: number;
}

/** Input gabungan dari seluruh modul hulu */
export interface TacticalBriefingInput {
  dna: {
    brand: string;
    productName: string;
    category: string;
    advantages: string;
    normalPrice: number;
    targetMonthlyRevenue: number;
    activeSocialMedia: string[];
    businessContact: string;
    peakHours: string;
    topConvertingChannel: string;
  };
  warRoom: WarRoomBrief;
  customerInsight: CustomerInsightBrief;
  daily?: DailyContext;
}

// ─────────────────────────────────────────────────────────────
// OUTPUT INTERFACE
// ─────────────────────────────────────────────────────────────

export interface TacticalBriefingOutput {
  markdown: string;
  meta: {
    model: string;
    temperature: number;
    chainLatenciesMs: number[];
    totalTokens: number;
  };
}

// ─────────────────────────────────────────────────────────────
// LLM CALLER TYPE (dependency injection)
// ─────────────────────────────────────────────────────────────

export type LlmCaller = (
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: { temperature?: number; maxTokens?: number },
) => Promise<{ content: string; tokensUsed: number }>;

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const T = 0.25;

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPTS (tiga rantai)
// ─────────────────────────────────────────────────────────────

const GAP_ANALYZER_SYSTEM = `Anda adalah Analis Bisnis Tajam untuk Pengusaha.
Anda TIDAK memberikan teori, framework, atau jargon akademis.
Anda hanya menyebutkan satu celah paling kritis yang langsung berdampak ke OMSET hari ini.

ATURAN KETAT:
- DILARANG menyebut "UMKM", "UKM", "Usaha Kecil", "Mikro", atau istilah pengkerdilan lainnya.
- Gunakan "Pengusaha", "Pelaku Usaha", "Bisnis Anda", atau sebut langsung nama brand.
- Lihat data kompetitor & pelanggan, lalu temukan celah paling konkret.
- Perhitungkan jam sibuk dan channel konversi tertinggi dalam analisis celah.
- Jelaskan dampaknya ke uang: "Jika tidak dibereskan, Anda kehilangan Rp X/minggu."
- Bahasa Indonesia lugas. Maksimal 3 kalimat.

Output HARUS JSON:
{"gap":"...","revenueImpact":"...","urgency":"sekarang|minggu-ini|bulan-ini"}`;

const EXECUTION_PLANNER_SYSTEM = `Anda adalah Pelatih Bisnis Lapangan untuk Pengusaha.
Anda hanya memberikan instruksi EKSEKUSI — tanpa teori, tanpa penjelasan panjang.

ATURAN KETAT:
- DILARANG menyebut "UMKM", "UKM", "Usaha Kecil", "Mikro".
- Setiap langkah WAJIB dimulai dengan KATA KERJA AKTIF: Cek, Hubungi, Kirim, Foto, Hitung, Catat, Tanya, Buat, Siapkan, Bandingkan.
- Hanya 2-3 langkah. Masing-masing maksimal 12 kata.
- Langkah harus bisa diselesaikan dalam 1-2 hari ke depan.
- Prioritaskan eksekusi di jam sibuk dan channel dengan konversi tertinggi.
- Tidak ada bullet "pertimbangkan" atau "evaluasi" — harus tindakan konkret.

Output HARUS JSON:
{"steps":["Kata kerja...","Kata kerja...","Kata kerja..."],"quickWin":"...","expectedOutcome":"..."}`;

const COMMS_WRITER_SYSTEM = `Anda adalah Penulis Konten Bisnis untuk Pengusaha.
Anda membuat template komunikasi SIAP PAKAI — tinggal copy-paste dan kirim.

ATURAN KETAT:
- DILARANG menyebut "UMKM", "UKM", "Usaha Kecil", "Mikro".
- Gunakan bahasa natural seperti pengusaha berbicara ke pelanggannya — bukan bahasa korporat.
- Template WhatsApp: pendek, personal, ada ajakan ringan.
- Copywriting media sosial: 1-2 kalimat pembuka + emoji natural + hashtag relevan.

Output HARUS Markdown dengan format persis berikut:

### 1. 🎯 Celah Bisnis Hari Ini
[Jelaskan celah dari sudut pandang pengusaha — efeknya ke omset. Singkat.]

### 2. ⚡ Langkah Eksekusi Strategis
[Daftar 2-3 tindakan, masing-masing DIAWALI KATA KERJA AKTIF]
1. **Kata Kerja** ...
2. **Kata Kerja** ...
3. **Kata Kerja** ...

### 3. 💬 Amunisi Komunikasi (Siap Pakai)
**Template WhatsApp:**
\`\`\`
[Template chat siap copy-paste, termasuk sapaan pembuka]
\`\`\`

**Copywriting Media Sosial:**
\`\`\`
[Caption siap copy-paste + hashtag]
\`\`\``;

// ─────────────────────────────────────────────────────────────
// USER PROMPT BUILDERS
// ─────────────────────────────────────────────────────────────

function buildCompetitorBlock(warRoom: WarRoomBrief): string {
  const top = warRoom.competitors[0];
  if (!top) {
    return `KOMPETITOR:
- Belum ada data kompetitor yang dianalisis.
- Ancaman Pasar: ${warRoom.topMarketThreat || "belum teridentifikasi"}
- Peluang Belum Digarap: ${warRoom.untappedOpportunity || "belum teridentifikasi"}`;
  }

  return `KOMPETITOR UTAMA:
- ${top.name}: Harga ${top.priceGap}, Kelemahan: ${top.biggestWeakness}
- Blind Spot Mereka: ${top.blindSpot}
- Ancaman Pasar: ${warRoom.topMarketThreat}
- Peluang Belum Digarap: ${warRoom.untappedOpportunity}`;
}

function buildGapAnalyzerPrompt(input: TacticalBriefingInput): string {
  const { dna, warRoom, customerInsight, daily } = input;

  return `DATA BISNIS HARI INI:

Brand: ${dna.brand}
Produk: ${dna.productName} (${dna.category})
Harga: Rp ${dna.normalPrice.toLocaleString()}
Target Omzet: Rp ${dna.targetMonthlyRevenue.toLocaleString()}/bln
Keunggulan: ${dna.advantages}
Jam Sibuk: ${dna.peakHours || "09:00-11:00 & 19:00-21:00"}
Channel Konversi Tertinggi: ${dna.topConvertingChannel || "WhatsApp DM"}

${buildCompetitorBlock(warRoom)}

PELANGGAN:
- Segmen Utama: ${customerInsight.topSegment}
- Keluhan #1: ${customerInsight.topComplaint}
- Keinginan Belum Terpenuhi: ${customerInsight.topDesire}
- Segmen Rawan Cabut: ${customerInsight.churnRiskSegment}
${daily ? `- Omzet Kemarin: Rp ${daily.yesterdayRevenue.toLocaleString()} | Target: Rp ${daily.todayTarget.toLocaleString()} | Capaian: ${daily.dailyAchievementPct}%` : ""}

Tugas: Identifikasi SATU celah paling kritis hari ini yang langsung berdampak ke omzet.`;
}

function buildExecutionPlannerPrompt(
  input: TacticalBriefingInput,
  gap: { gap: string; revenueImpact: string },
): string {
  return `CELAH BISNIS HARI INI:
"${gap.gap}"
Dampak ke Omzet: ${gap.revenueImpact}

Channel Aktif: ${input.dna.activeSocialMedia.join(", ")}
Jam Sibuk: ${input.dna.peakHours || "09:00-11:00 & 19:00-21:00"}
Channel Konversi Tertinggi: ${input.dna.topConvertingChannel || "WhatsApp DM"}
${input.daily ? `Item Belum Selesai Kemarin: ${input.daily.pendingItems.join("; ") || "tidak ada"}` : ""}

Tugas: Berikan 2-3 langkah eksekusi konkret (KATA KERJA AKTIF) untuk 1-2 hari ke depan. Prioritaskan di ${input.dna.topConvertingChannel || "channel konversi tertinggi"} pada jam ${input.dna.peakHours || "sibuk"}.`;
}

function buildCommsWriterPrompt(
  input: TacticalBriefingInput,
  gap: { gap: string; revenueImpact: string },
  plan: { steps: string[] },
): string {
  return `BRAND: ${input.dna.brand}
PRODUK: ${input.dna.productName}
HARGA: Rp ${input.dna.normalPrice.toLocaleString()}
KONTAK BISNIS: ${input.dna.businessContact}

CELAH HARI INI: ${gap.gap}
DAMPAK: ${gap.revenueImpact}

LANGKAH EKSEKUSI:
${plan.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Tugas: Buat template WhatsApp & copywriting media sosial SIAP PAKAI sesuai format yang ditentukan.`;
}

// ─────────────────────────────────────────────────────────────
// PARSER UTILITY
// ─────────────────────────────────────────────────────────────

function extractJson<T>(raw: string, fallback: T): T {
  try {
    const trimmed = raw.trim();
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as T;
    }
  } catch {
    /* fall through to fallback */
  }
  return fallback;
}

// ─────────────────────────────────────────────────────────────
// FALLBACK GENERATOR (simulasi lokal saat AI tidak tersedia)
// ─────────────────────────────────────────────────────────────

export function generateFallbackBriefing(
  input: TacticalBriefingInput,
): TacticalBriefingOutput {
  const { dna, warRoom, customerInsight } = input;
  const topComp = warRoom.competitors[0];

  return {
    markdown: `### 1. 🎯 Celah Bisnis Hari Ini
${dna.brand} belum memanfaatkan celah "${topComp.blindSpot}" dari ${topComp.name}. Kompetitor Anda ${topComp.biggestWeakness}, sementara pelanggan menginginkan ${customerInsight.topDesire}. Jam sibuk ${dna.peakHours || "pagi & malam"} adalah window terbaik untuk eksekusi via ${dna.topConvertingChannel || "WhatsApp"}. Jika tidak digarap minggu ini, potensi omzet Rp ${(dna.targetMonthlyRevenue * 0.12).toLocaleString()} melayang ke kompetitor.

### 2. ⚡ Langkah Eksekusi Strategis
1. **Cek** semua DM di ${dna.topConvertingChannel || "WhatsApp"} pada jam ${dna.peakHours?.split("&")[0]?.trim() || "09:00-11:00"} — reply personal dengan penawaran.
2. **Hubungi** 5 pelanggan repeat-order via chat personal, tawarkan early access produk baru.
3. **Foto** 3 varian produk dengan pencahayaan natural untuk konten story besok pagi.

### 3. 💬 Amunisi Komunikasi (Siap Pakai)
**Template WhatsApp:**
\`\`\`
Halo Kak! 🙌

Ini dari ${dna.brand}. Lagi ada koleksi baru nih yang mirip banget sama selera Kakak selama ini. Boleh saya kirim preview-nya? Siapa tau cocok ✨
\`\`\`

**Copywriting Media Sosial:**
\`\`\`
Yang bilang kualitas premium itu selalu mahal, belum ketemu ${dna.brand} 🫢

Bahan ${dna.advantages.split(",")[0]?.trim() ?? "premium"}, harga mulai Rp ${dna.normalPrice.toLocaleString()}. Worth it? Parah.

#${dna.category.replace(/\s/g, "")} #${dna.brand.replace(/\s/g, "")} #RekomendasiHariIni
\`\`\``,
    meta: {
      model: "simulator",
      temperature: T,
      chainLatenciesMs: [0, 0, 0],
      totalTokens: 0,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN FUNCTION
// ─────────────────────────────────────────────────────────────

/**
 * Menghasilkan briefing taktis harian untuk Pengusaha menggunakan 3-chain prompt.
 *
 * Chain 1 → GapAnalyzer:   identifikasi celah paling kritis
 * Chain 2 → ExecutionPlan:  langkah eksekusi konkret (kata kerja aktif)
 * Chain 3 → CommsWriter:    template WhatsApp + copywriting siap pakai
 */
export async function generateTacticalBriefing(
  input: TacticalBriefingInput,
  llm: LlmCaller,
): Promise<TacticalBriefingOutput> {
  const latencies: number[] = [];
  let totalTokens = 0;

  // ── Chain 1: Gap Analysis ──────────────────────────────────
  const t1 = Date.now();
  const gapResult = await llm(
    [
      { role: "system", content: GAP_ANALYZER_SYSTEM },
      { role: "user", content: buildGapAnalyzerPrompt(input) },
    ],
    { temperature: T, maxTokens: 256 },
  );
  latencies.push(Date.now() - t1);
  totalTokens += gapResult.tokensUsed;

  const defaultGap = {
    gap: `${input.dna.brand} kehilangan peluang omzet karena kompetitor ${input.warRoom.competitors[0]?.name ?? "utama"} masih unggul di ${input.warRoom.competitors[0]?.biggestWeakness ?? "pengalaman pelanggan"}.`,
    revenueImpact: `Estimasi potensi omzet yang belum tergarap: Rp ${(input.dna.targetMonthlyRevenue * 0.15).toLocaleString()}/bulan.`,
  };

  const gap = extractJson<{ gap: string; revenueImpact: string }>(
    gapResult.content,
    defaultGap,
  );

  // ── Chain 2: Execution Plan ────────────────────────────────
  const t2 = Date.now();
  const planResult = await llm(
    [
      { role: "system", content: EXECUTION_PLANNER_SYSTEM },
      { role: "user", content: buildExecutionPlannerPrompt(input, gap) },
    ],
    { temperature: T, maxTokens: 256 },
  );
  latencies.push(Date.now() - t2);
  totalTokens += planResult.tokensUsed;

  const plan = extractJson<{ steps: string[] }>(
    planResult.content,
    {
      steps: [
        `Cek ${input.dna.activeSocialMedia[0] ?? "media sosial"} dan balas 10 komentar pelanggan yang belum terjawab`,
        `Hubungi 5 pelanggan teratas dari segmen ${input.customerInsight.topSegment} via chat personal`,
        `Siapkan stok foto produk untuk konten besok`,
      ],
    },
  );

  // ── Chain 3: Communication Templates ───────────────────────
  const t3 = Date.now();
  const commsResult = await llm(
    [
      { role: "system", content: COMMS_WRITER_SYSTEM },
      { role: "user", content: buildCommsWriterPrompt(input, gap, plan) },
    ],
    { temperature: T, maxTokens: 512 },
  );
  latencies.push(Date.now() - t3);
  totalTokens += commsResult.tokensUsed;

  return {
    markdown: commsResult.content.trim(),
    meta: {
      model: "prompt-chain-3-step",
      temperature: T,
      chainLatenciesMs: latencies,
      totalTokens,
    },
  };
}