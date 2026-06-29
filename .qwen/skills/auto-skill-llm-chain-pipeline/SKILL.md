---
name: llm-chain-pipeline
description: Design 3-chain LLM pipelines that produce constrained, grounded output — Analyze → Plan → Write — with temperature locking, fallback simulators, and provider-agnostic dependency injection. Use when building AI features that must generate tactical/executable results instead of theoretical/verbose responses.
source: auto-skill
extracted_at: '2026-06-25T07:10:00.000Z'
---

# Multi-Chain LLM Pipeline Design

## When to Use

When you need LLM output that is **constrained, tactical, and grounded** — not theoretical, verbose, or academic. Works for: business strategy generators, daily briefing tools, coaching assistants, any domain where the AI must produce executable steps rather than essays.

## The 3-Chain Pattern

Each chain's output feeds directly into the next. Each chain has its own system prompt role and output format.

```
Chain 1: ANALYZER   →  "What is the single most critical thing?"
           System role: Sharp analyst, no theory, no jargon
           Output: Structured JSON (gap, impact, urgency)

Chain 2: PLANNER     →  "Based on that, what 2-3 things do I DO?"
           System role: Field coach, instructions only
           Output: Structured JSON (action steps, must start with active verbs)

Chain 3: WRITER      →  "Give me ready-to-use output in the final format."
           System role: Content creator, ready-to-send
           Output: Final user-facing format (Markdown, HTML, etc.)
```

## Key Constraints for Reliability

### 1. Dynamic Temperature Per Chain
Each chain uses a different temperature based on its output type:
- **Chain 1 (GapAnalyzer):** 0.2 — JSON output harus konsisten & predictable
- **Chain 2 (ExecutionPlan):** 0.35 — Instruksi butuh variasi kata kerja aktif
- **Chain 3 (CommsWriter):** 0.7 — Copywriting butuh bahasa natural, bukan robotik

**Why:** The Analyzer and Planner chains output JSON that the next chain consumes. If temperature is too high (0.7+), the JSON wraps in markdown fences or includes explanatory text, breaking the parser. The Writer chain at 0.25 produces robotic, repetitive templates — 0.7 makes it sound like a real Pengusaha talking to customers.

### 2. Strict System Prompt Rules
Each chain's system prompt must enumerate **forbidden behaviors**, not just desired output:
- Forbidden: theory, frameworks, jargon, bullet points starting with "pertimbangkan" or "evaluasi"
- Required: active verbs, concrete numbers, specific channels

The Planner chain's "active verb rule" is critical — without it, LLMs default to passive suggestions. Enumerating allowed verbs (`Cek, Hubungi, Kirim, Foto, Hitung`) in the system prompt is more effective than just saying "use active verbs."

### 3. Fallback Simulator
Always provide a `generateFallback()` function that produces valid output from the input data alone — no LLM call. This serves two purposes:
- **Dev/CI**: the app works without an API key
- **Prod resilience**: if the LLM call fails, the user still gets something useful (not an error page)

The fallback should use the same output format as the live chain, with `mode: "simulated"` metadata to distinguish.

### 4. Provider-Agnostic Dependency Injection
Define a `LlmCaller` type and inject it — never hardcode a provider:

```typescript
type LlmCaller = (
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: { temperature?: number; maxTokens?: number },
) => Promise<{ content: string; tokensUsed: number }>;
```

This makes the pipeline testable (mock the caller), portable across providers (OpenAI, Anthropic, OpenRouter, local), and independent of any SDK.

### 5. Edge Case Audit Before Commit
After writing the pipeline, manually trace through edge cases before pushing:
- Empty input arrays (`competitors: []` → crashes on `[0]` access)
- Missing optional fields (`daily?` → template literal produces "undefined")
- JSON parsing failure (LLM returns markdown-wrapped JSON → `extractJson` fallback needed)

The pattern: write the pipeline → run `tsc --noEmit` → manually audit edge cases → fix → commit.

## Implementation Template

```typescript
// Chain 1: The Analyzer
const gap = await llm([
  { role: "system", content: ANALYZER_SYSTEM },  // role + forbidden list + JSON output format
  { role: "user", content: buildAnalyzerPrompt(input) },  // raw data from upstream
], { temperature: 0.2, maxTokens: 256 });

// Chain 2: The Planner
const plan = await llm([
  { role: "system", content: PLANNER_SYSTEM },    // action verb rule + JSON output format
  { role: "user", content: buildPlannerPrompt(input, gap) }, // gap from chain 1
], { temperature: 0.35, maxTokens: 256 });

// Chain 3: The Writer
const output = await llm([
  { role: "system", content: WRITER_SYSTEM },      // persona + final format spec
  { role: "user", content: buildWriterPrompt(input, gap, plan) }, // gap + plan from chains 1 & 2
], { temperature: 0.7, maxTokens: 512 });

return { markdown: output.content.trim(), meta: { ... } };
```

## Token Budget

| Chain | maxTokens | Rationale |
|---|---|---|
| Analyzer | 256 | Only needs ~100 tokens for the JSON gap object |
| Planner | 256 | 2-3 steps × ~50 tokens each |
| Writer | 512 | Full markdown with templates needs more room |
| **Total** | **~1024** | ~3× cheaper than a single 2048-token call producing unfiltered output |

## Frontend Integration: Wiring Chain Output to UI

### The "Hardcoded → AI-Generated" Migration Pattern

When retrofitting an existing UI to consume chain output, replace hardcoded content element by element — not all at once:

| UI Element | Before | After (from chain) |
|---|---|---|
| Checklist items | 5 hardcoded `{ id, text, done, category }` objects | Parsed from Chain 2 numbered list items |
| Briefing paragraph | Static motivational text | Section 1 gap analysis |
| Market radar | One hardcoded sentence | First sentence of gap analysis |
| *(none)* | — | Section 3 comms templates (new box) |

### Markdown Output Parser

When the final Writer chain outputs Markdown with 3 `###`-delimited sections, parse it client-side:

```typescript
function parseTacticalMarkdown(md: string) {
  const blocks = md.split(/^### /m);
  const sec1 = blocks.find(b => b.startsWith("1.")) ?? "";
  const sec2 = blocks.find(b => b.startsWith("2.")) ?? "";
  const sec3 = blocks.find(b => b.startsWith("3.")) ?? "";

  // Section 1: strip header line, remainder is gap text
  const gapText = sec1.split("\n").slice(1).join("\n").trim();

  // Section 2: parse numbered items → checklist objects
  const steps = sec2.split("\n")
    .filter(l => /^\d+\.\s/.test(l.trim()))
    .map((line, i) => ({
      id: `tactical-${i}`,
      text: line.replace(/^\d+\.\s+/, "").trim(),
      done: false,
      category: "Eksekusi",
    }));

  // Section 3: extract code blocks → copyable templates
  const codeBlocks = sec3.match(/```[\s\S]*?```/g) ?? [];
  const waTemplate = codeBlocks[0]?.replace(/```/g, "").trim() ?? "";
  const socialCopy = codeBlocks.length > 1
    ? codeBlocks[1].replace(/```/g, "").trim()
    : "";

  return { gapText, steps, waTemplate, socialCopy };
}
```

Key decisions:
- Split by `###` not `##` — each section is a level-3 heading
- Use regex `/^\d+\.\s/` for numbered list detection — resilient to leading whitespace
- Code blocks are copyable templates — add a clipboard button in the UI
- Steps become checklist items directly — no transformation needed

### Stripping LLM Markdown Artifacts from Parsed Text

LLM output for numbered action items often includes inline markdown formatting:
- `**Cek** semua DM...` (bold action verb)
- `*Hubungi* pelanggan...` (italic emphasis)
- `` `WA` channel `` (inline code)

These look broken in UI checklist items. Strip them client-side:

```typescript
const cleaned = line
  .replace(/^\d+\.\s+/, "")          // strip "1. "
  .replace(/\*\*(.+?)\*\*/g, "$1")   // strip **bold**
  .replace(/\*(.+?)\*/g, "$1")        // strip *italic*
  .replace(/`(.+?)`/g, "$1")          // strip `code`
  .trim();

// Bonus: extract first word as dynamic category tag
const category = cleaned.split(/\s+/)[0]?.replace(/[.:,;!?]/g, "") || "Eksekusi";
```

The order matters: strip the numbered prefix first, then strip formatting markers. The non-greedy `.+?` quantifier prevents over-matching when multiple formatting spans exist on one line.

### State-to-Input Mapping (buildTacticalInput pattern)

Existing app state (Zustand, React Context, Redux) rarely matches the chain's input interface exactly. Build a mapper function that:

1. **Extracts** from existing state (competitors array, segments array, DNA object)
2. **Derives** missing fields (top segment by percentage, churn segment by risk level)
3. **Defaults** fields that don't exist yet in the data model
4. **Guards** against empty arrays (competitors may be `[]`)

```typescript
function buildTacticalInput() {
  const topSegment = [...segments].sort((a, b) => b.percentage - a.percentage)[0];
  const churnSegment = segments.find(s => s.risk === "High");

  return {
    warRoom: {
      competitors: competitors
        .filter(c => c.name?.trim())
        .map(c => ({
          name: c.name,
          biggestWeakness: c.weaknesses || "-",
          priceGap: c.averagePrice || "-",
          blindSpot: c.opportunities || "-",
        })),
      // ...
    },
    customerInsight: {
      topSegment: topSegment?.name || "Pelanggan Setia",
      churnRiskSegment: churnSegment?.name || "Belum teridentifikasi",
      // Fields that don't exist in current data model → reasonable defaults:
      topComplaint: "Butuh variasi produk & respon cepat",
      topDesire: "Produk eksklusif dengan harga kompetitif",
    },
  };
}
```

## Domain-Persona Constraints in System Prompts

When the target user persona differs from the LLM's default assumptions, enumerate **forbidden terminology** explicitly in every chain's system prompt:

```
ATURAN KETAT:
- DILARANG menyebut "UMKM", "UKM", "Usaha Kecil", "Mikro", atau istilah pengkerdilan lainnya.
- Gunakan "Pengusaha", "Pelaku Usaha", "Bisnis Anda", atau sebut langsung nama brand.
```

This is more effective than positive framing alone ("address them as entrepreneurs") because LLMs default to common patterns they've seen in training data. Explicit forbidden-word lists override those defaults.

Apply this constraint to:
- All system prompts in every chain
- All user prompt templates
- The fallback simulator output
- Any UI-facing labels or helper text
- **Audit beyond prompts**: scan ALL files, not just prompt strings — UI warning text, component labels, and onboarding copy can harbor forbidden terms (e.g., "UKM" was found in `BusinessCanvas.tsx` warning text, not in any prompt). Do a `grep` across the entire codebase for each forbidden term after any major feature addition.

## Precision Data Enrichment — Minimal Fields, Maximum Impact

### The Problem

After deploying the chain pipeline, the AI output is correctly formatted but **generic** — it doesn't reference the user's actual business rhythm. The LLM can't know *when* the user's peak sales hours are or *which* channel converts best unless that data is explicitly injected into the prompts.

### The "P1 Data Enrichment" Pattern

Identify 2-3 fields that, when added, **noticeably sharpen** the AI's recommendations. Rank by impact-to-effort ratio:

| Priority | Data | Why It Matters | Effort |
|---|---|---|---|
| P1 | Peak sales hours + top converting channel | AI knows *when* and *where* to execute | 2 new string fields in DNA |
| P2 | Customer objections + recent questions | AI writes personalized templates, not generic | Form input in dashboard |
| P3 | Seasonal calendar + business cycle | AI aligns strategy with real-world timing | Auto-detect from date |

Start with P1. Two string fields in the DNA interface produce a disproportionate precision improvement because they answer the two questions every execution step needs: *when?* and *where?*

### Injection Points

Once the fields exist in the interface, inject them at 3 levels:

1. **System prompts** — add constraint rules (e.g., "Perhitungkan jam sibuk dan channel konversi tertinggi", "Prioritaskan eksekusi di jam sibuk")
2. **User prompt builders** — inject the actual values as context lines (`Jam Sibuk: ${dna.peakHours}`)
3. **Execution planner prompt** — explicitly tell the LLM to prioritize: `"Prioritaskan di ${channel} pada jam ${hours}."`

### Example Output Change

**Before** (without data):
> Cek semua DM dan komentar di Instagram yang belum dibalas — reply personal dengan penawaran.

**After** (with peakHours='09:00-11:00', topConvertingChannel='WhatsApp DM'):
> Cek semua DM di WhatsApp DM pada jam 09:00-11:00 — reply personal dengan penawaran.

The difference: the second version is **immediately actionable** — the user doesn't need to decide *when* or *where*, the AI already matched the recommendation to their actual business rhythm.

### Adding Fields Without Breaking Existing Code

1. Add optional fields with sensible defaults in the interface and default data function
2. Use `||` fallbacks in all prompt builders (`dna.peakHours || "09:00-11:00"`)
3. Update the fallback simulator to reference the new fields
4. Existing stored data with missing fields → defaults kick in automatically (no migration needed)

## Dual-Backend Deployment Pitfall

### The Problem

Projects with a dev server (`server.ts` via Express/Vite) AND a separate production backend (`worker.ts` via Cloudflare Workers) silently drift out of sync. Adding a route to `server.ts` makes it work in `npm run dev` — but the route is **missing** in production.

**Symptom:** The feature works perfectly in local dev. After merge + deploy, the frontend calls the new API endpoint, gets a 404, and the `fetch()` fails silently. UI stays on old state with zero error feedback.

**Detection:** `curl` the production worker URL directly after deploy:

```bash
curl -s https://<worker>.workers.dev/api/<new-route> | head
```

If it returns HTML (404 page) or an unexpected response, the route is missing from the worker.

### The Fix Workflow

1. **Check what backend serves production** — `wrangler.toml` → `main = "worker.ts"` means the Worker is production, not `server.ts`
2. **Add the route to both files** — `server.ts` (dev) AND `worker.ts` (prod)
3. **Import strategy for Workers** — Cloudflare Workers bundle with esbuild, so relative `.ts` imports work: `import { ... } from "./src/module.ts"`
4. **Adapter pattern for LlmCaller** — the worker's `callOpenRouter(apiKey, model, msgs, opts)` has a different signature than `server.ts`'s `callOpenRouter(msgs, opts)`. Create a thin adapter:

```typescript
// Inside worker route handler
const llmAdapter: LlmCaller = async (messages, options) => {
  const content = await callOpenRouter(apiKey, model, messages, options);
  return { content, tokensUsed: 0 };
};
const briefing = await generateTacticalBriefing(input, llmAdapter);
```

5. **Deploy the worker manually** — GitHub Actions deploys the frontend (GitHub Pages) automatically, but the Worker requires `wrangler deploy` separately unless a CI step is configured for it.

### Post-Deploy Verification

After `wrangler deploy`, curl the endpoint with a minimal payload to confirm:
- Route returns 200 (not 404)
- `mode` field is `"live-ai"` (with API key) or `"simulated"` (without)
- Markdown output has all expected sections

```bash
curl -s -X POST https://<worker>.workers.dev/api/<route> \
  -H "Content-Type: application/json" \
  -d '{
    "dna":{"brand":"Test","productName":"Test","category":"Test","advantages":"Test","normalPrice":100000,"targetMonthlyRevenue":50000000,"activeSocialMedia":["Instagram"],"businessContact":"-","peakHours":"09:00","topConvertingChannel":"WA"},
    "warRoom":{"competitors":[{"name":"Test","biggestWeakness":"-","priceGap":"-","blindSpot":"-"}],"topMarketThreat":"-","untappedOpportunity":"-"},
    "customerInsight":{"topSegment":"Test","topComplaint":"-","topDesire":"-","churnRiskSegment":"-","avgTransactionGap":"-"}
  }' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('mode'), '| sections:', d['markdown'].count('###'))"
```

Expected output: `live-ai | sections: 3` (or `simulated | sections: 3` without API key).

If the output is HTML or an error page → the route is missing from the worker → add it to `worker.ts` and re-deploy.

## Terminology Audit: Global `grep` → `sed` → `grep` Cycle

### When to Run

After implementing a new feature or adding a new persona constraint (e.g., "zero X/Y/Z terminology"), audit the ENTIRE codebase — not just prompt files. Forbidden terms lurk in UI labels, fallback strings, tooltip text, and onboarding copy where they're invisible to prompt-only audits.

### The Cycle

```bash
# Step 1: grep for forbidden terms across ALL source files
grep -rn "\bX\b|\bY\b" --include="*.ts" --include="*.tsx" src/

# Step 2: sed batch replace with context-aware substitutions
sed -i \
  -e 's/specific old text/specific new text/g' \
  -e 's/another pattern/replacement/g' \
  file1.ts file2.ts

# Step 3: grep again to verify zero remaining (except intentional exceptions)
grep -rn "\bX\b|\bY\b" --include="*.ts" --include="*.tsx" src/
```

### What to Audit

| Layer | Where Terms Hide |
|---|---|
| System prompts | `SYSTEM = "..."` strings |
| User prompt templates | `build*Prompt()` functions |
| Fallback generators | `generateFallback*()` strings |
| UI labels | `<span>`, `<p>`, `<h*>` text content |
| UI placeholders | `placeholder="..."` attributes |
| Demo/example data | `default*()` functions |
| Tooltip/onboarding text | `UserTour.tsx`, tooltip content |
| Technical documentation | `TechnicalDocs.tsx`, embedded code examples |
| Footer text | `<footer>` inline strings |

### Intentional Exceptions

Not every match is a violation. Document which are intentional:
- **Enforcement rules**: `"DILARANG menyebut X"` — these teach the LLM what NOT to say
- **Legal classifications**: `legalStatus: ["X"]` — government/official category labels
- **Analytical terms**: "mikro" in "target segmentasi mikro" — technical, not demeaning

### Post-Audit Verification

After batch replacement, run `tsc --noEmit` to catch any sed-induced syntax errors (e.g., replacing a term inside a template literal that broke the string). Then deploy the worker if backend files changed.

## UX: Distinguishing First-Time Setup from Re-Edit

### The Problem

A form/component serves two modes: **first-time onboarding** and **re-editing existing data**. But the UI uses the same button text, heading, and badge for both:

- "Aktifkan 5 Fitur Utama" → button text doesn't communicate "save" when re-editing
- "INITIAL ONBOARDING STAGE" → badge is misleading when user is just editing
- No explanation of auto-save behavior → user asks "do I need to click save?"

### The `isReEditing` Pattern

Track whether data has EVER been saved before (not just whether it's currently filled):

```typescript
// Track both current state AND history
const [isDnaFilled, setIsDnaFilled] = useState(() => localStorage.getItem("filled") === "true");
const [wasEverFilled, setWasEverFilled] = useState(() => localStorage.getItem("filled") !== null);

const handleSave = () => {
  localStorage.setItem("filled", "true");
  setIsDnaFilled(true);
  setWasEverFilled(true);  // ← marks history
};

const handleResetForEdit = () => {
  setIsDnaFilled(false);        // show the form again
  // wasEverFilled stays TRUE   // → re-edit mode detected in UI
};
```

Then pass `isReEditing={wasEverFilled}` as a prop and branch all UI text:

| Element | First-Time | Re-Edit |
|---|---|---|
| Badge | "★ INITIAL ONBOARDING" | "✎ EDIT MODE" |
| Heading | "Lengkapi Data Anda" | "Sesuaikan Data Anda" |
| Button | "Aktifkan Fitur Utama" | "Simpan Perubahan" |
| Info text | "Isi sekali untuk mengaktifkan..." | "Perubahan tersimpan otomatis..." |

### UI Count Consistency

When adding a feature that increases a feature/module/tab count, update ALL references:
- Setup wizard button text: "Aktifkan **5** Fitur Utama" → "Aktifkan **6** Fitur Utama"
- Onboarding description: "mengaktifkan seluruh taktik analisis dari **5** Fitur Utama"
- JSX comments: `/* The **5** main features unlocked interface */`

A single missed reference creates inconsistency: the wizard says "6 Fitur" but the description says "5 Fitur."

## Edge Case Audit Checklist

After writing the pipeline, manually trace before committing:
- [ ] Empty arrays (`competitors: []` → `[0]` access crashes)
- [ ] Missing optional fields (`daily?` → template literal shows "undefined")
- [ ] JSON parsing failure (LLM wraps JSON in markdown fences → `extractJson` fallback)
- [ ] State variables not destructured from context/hook (`competitors` exists in store but not in component destructuring)
- [ ] Markdown formatting markers in parsed UI text (`**bold**`, `*italic*`, `` `code` `` → strip before rendering)
- [ ] Fallback simulator produces valid output with same structure as live chain
- [ ] `tsc --noEmit` passes (zero type errors)
- [ ] Import path resolution: `.js` extension → `.ts` source works with `tsx` (dev) and `esbuild --bundle` (prod)