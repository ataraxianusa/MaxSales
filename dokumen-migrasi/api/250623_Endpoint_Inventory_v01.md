# Inventarisasi Endpoint API MaxSales
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Ringkasan Endpoint

| # | Endpoint | Method | AI Dependency | Complexity | Priority | Status Saat Ini |
|---|----------|--------|---------------|------------|----------|-----------------|
| 1 | `/api/status` | GET | Tidak | Rendah | P0 | ✅ Active |
| 2 | `/api/generate-content-text` | POST | Ya (3 prompts) | Tinggi | P0 | ✅ Active |
| 3 | `/api/strategy-forge` | POST | Ya (complex) | Sangat Tinggi | P0 | ✅ Active |
| 4 | `/api/daily-pulse` | POST | Ya (multi) | Tinggi | P0 | ✅ Active |
| 5 | `/api/analyze-competitor` | POST | Ya | Sedang | P1 | ✅ Active |
| 6 | `/api/analyze-segments` | POST | Ya | Sedang | P1 | ✅ Active |
| 7 | `/api/chat` | POST | Ya (context) | Tinggi | P0 | ✅ Active |

---

## 2. Detail Endpoint

### 2.1 GET `/api/status`

**File referensi:** worker.ts:97-110, server.ts:101-114

```typescript
// Request: none
Response: {
  status: "ok";
  aiMode: "openrouter" | "simulation";
  message: string;
  version: string;
}

// Logic:
// - Cek keberadaan OPENROUTER_API_KEY
// - Jika ada → mode "openrouter", message positif
// - Jika tidak → mode "simulation", message warning
// - Return object status

// Azure Migration: Direct port, no database needed
```

### 2.2 POST `/api/generate-content-text`

**File referensi:** worker.ts:112-147, server.ts:116-160

```typescript
// Request Body:
interface GenerateContentRequest {
  productDescription: string;
  targetAudience: string;
  contentGoals: string[];
}

// Response:
interface GeneratedContentText {
  headlines: string[];
  captions: string[];
  hashtags: string[];
  variations?: ContentVariation[];
}

// AI Prompts (3 templates):
// 1. Headline generation prompt
// 2. Caption generation prompt
// 3. Hashtag generation prompt

// Azure Migration:
// - Add caching for identical requests
// - Store generation history in Cosmos DB
// - AI adapter calls
```

### 2.3 POST `/api/strategy-forge`

**File referensi:** worker.ts:149-225, server.ts:162-260

```typescript
// Request Body:
interface StrategyForgeRequest {
  businessData: BusinessCanvasData;
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  additionalContext?: string;
}

// Response:
interface StrategyForgeResponse {
  strategies: StrategyArea[]; // 5-11 pillars
}

// Strategy Areas (11 total):
// 1. Market Positioning
// 2. Brand Identity
// 3. Customer Acquisition
// 4. Retention Strategy
// 5. Pricing Strategy
// 6. Distribution Channel
// 7. Promotion & Campaign
// 8. Product Development
// 9. Partnership Strategy
// 10. Technology Utilization
// 11. Sustainability & Growth

// Azure Migration:
// - Complex prompt: longest AI call
// - Implement streaming response (future)
// - Cache partial results
```

### 2.4 POST `/api/daily-pulse`

**File referensi:** worker.ts:227-290, server.ts:262-325

```typescript
// Request Body:
interface DailyPulseRequest {
  businessData: BusinessCanvasData;
  dailyActivities: {
    leadsCount: number;
    meetingsCount: number;
    tasksCompleted: number;
    revenueToday: number;
  };
  notes?: string;
}

// Response:
interface DailyPulseResponse {
  leadUpdates: { summary: string; suggestions: string[] };
  kpiTracker: { metrics: KPIMetric[]; healthScore: number };
  dailyBrief: { summary: string; priorities: string[]; risks: string[] };
  weatherForecast: { marketCondition: string; opportunities: string[] };
}

// Azure Migration:
// - Store daily history in Cosmos DB (time-series)
// - Enable historical trend analysis
```

### 2.5 POST `/api/analyze-competitor`

**File referensi:** worker.ts:292-330, server.ts:327-365

```typescript
// Request Body:
interface AnalyzeCompetitorRequest {
  businessData: BusinessCanvasData;
  competitors: CompetitorIntel[];
}

// Response:
interface CompetitorAnalysis {
  competitors: Array<{
    name: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    marketPosition: string;
    threatLevel: "low" | "medium" | "high";
  }>;
  recommendations: string[];
}

// Azure Migration:
// - Store competitor analysis history
// - Enable trend comparison over time
```

### 2.6 POST `/api/analyze-segments`

**File referensi:** worker.ts:332-365, server.ts:367-400

```typescript
// Request Body:
interface AnalyzeSegmentsRequest {
  businessData: BusinessCanvasData;
  segments: CustomerSegment[];
}

// Response:
interface SegmentAnalysis {
  segments: Array<{
    name: string;
    ltv: number;
    churnRisk: "low" | "medium" | "high";
    recommendations: string[];
    marketPotential: string;
  }>;
  overallRecommendations: string[];
}

// Azure Migration:
// - Store segment analysis for trend tracking
// - Cross-reference with generation history
```

### 2.7 POST `/api/chat`

**File referensi:** worker.ts:367-406, server.ts:402-441

```typescript
// Request Body:
interface ChatRequest {
  message: string;
  businessData: BusinessCanvasData;
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  conversationHistory?: ChatMessage[];
}

// Response:
interface ChatResponse {
  reply: string;
}

// System Prompt: Full context injection
// - Business profile
// - Competitor data
// - Segment data
// - Conversation history

// Azure Migration:
// - Store chat history in Cosmos DB
// - Implement conversation context window management
// - Token usage tracking
```

---

## 3. Shared Functions Analysis

### 3.1 `callOpenRouter()` - AI Provider Call

| Aspek | Detail |
|-------|--------|
| **Lokasi** | worker.ts:28-59, server.ts:30-63 |
| **Parameter** | `(messages, model?)` |
| **Return** | `Promise<string>` (raw text) |
| **Logic** | POST ke OpenRouter API → extract response text |
| **Error Handling** | Return error message string (not throw) |

### 3.2 `parseJsonResponse()` - AI Response Parser

| Aspek | Detail |
|-------|--------|
| **Lokasi** | worker.ts:61-95, server.ts:65-99 |
| **Parameter** | `(text: string): any` |
| **Return** | Parsed JSON object |
| **Logic** | Extract JSON from markdown code blocks → JSON.parse → fallback |

---

## 4. Dependency Graph

```
/status [tidak ada dependensi]
  → langsung return status

/generate-content-text
  → callOpenRouter() → parseJsonResponse()

/strategy-forge
  → [membutuhkan data dari businessData, competitors, segments]
  → callOpenRouter() (1-3 calls tergantung kompleksitas)
  → parseJsonResponse() (multi-stage)

/daily-pulse
  → callOpenRouter() (multiple prompts)
  → parseJsonResponse()

/analyze-competitor
  → callOpenRouter() (per kompetitor)
  → parseJsonResponse()

/analyze-segments
  → callOpenRouter() (per segment + overall)
  → parseJsonResponse()

/chat
  → [membutuhkan full context: businessData + competitors + segments]
  → callOpenRouter() (1 call dengan full context)
  → return plain text (no JSON parsing needed)
```

---

## 5. Request/Response Contract (untuk Test Suite)

Setiap endpoint membutuhkan test contract yang memverifikasi:
1. **Input validation** - Required fields, type checking
2. **AI response parsing** - Valid JSON, malformed JSON, empty response
3. **Error handling** - Missing API key, rate limit, timeout
4. **Response structure** - Exact field names dan tipe data

---

*Dokumen inventarisasi endpoint — baseline untuk migrasi API ke Azure Functions*
*Source: worker.ts, server.ts, src/types.ts*
