# Rencana Refactoring API untuk Azure Functions
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Masalah Saat Ini

Duplikasi kode hampir 100% antara `worker.ts` (Cloudflare Workers) dan `server.ts` (Express.js):

```
worker.ts (406 baris)          server.ts (621 baris)
callOpenRouter()               callOpenRouter()
parseJsonResponse()            parseJsonResponse()
generateContentText()          generateContentText()
strategyForge()                strategyForge()
dailyPulse()                   dailyPulse()
analyzeCompetitor()            analyzeCompetitor()
analyzeSegments()              analyzeSegments()
chatHandler()                  chatHandler()

Perbedaan:
- Import: Hono vs Express
- CORS: manual header vs cors() middleware
- Static files: none vs express.static
- Port: env.CLOUDFLARE_PORT vs 3001
```

**Dampak:** Setiap perubahan fitur harus dilakukan di 2 file → risiko inkonsistensi, effort double.

---

## 2. Target: Single Codebase Azure Functions

```
/maxsales-api
  ├── package.json
  ├── tsconfig.json
  ├── host.json                 // Azure Functions host config
  ├── local.settings.json       // Local emulator settings
  │
  ├── /src
  │   ├── /functions            // HTTP Trigger functions
  │   │   ├── status.ts
  │   │   ├── generate-content.ts
  │   │   ├── strategy-forge.ts
  │   │   ├── daily-pulse.ts
  │   │   ├── analyze-competitor.ts
  │   │   ├── analyze-segments.ts
  │   │   └── chat.ts
  │   │
  │   ├── /shared               // Shared utilities
  │   │   ├── ai-adapter.ts     // Multi-provider AI
  │   │   ├── cosmos-client.ts  // Cosmos DB operations
  │   │   ├── models.ts         // TypeScript interfaces
  │   │   ├── utils.ts          // Helper functions
  │   │   ├── prompts.ts        // Prompt templates
  │   │   └── config.ts         // Configuration
  │   │
  │   └── index.ts              // App entry point
  │
  └── /tests
      ├── /unit
      ├── /integration
      └── /e2e
```

---

## 3. Refactoring Tahapan

### Tahap 1: Shared Functions (Hari 1-2)

**File: `/shared/utils.ts`**
```typescript
// Ekstrak dari worker.ts dan server.ts
// Satu implementasi, semua endpoint pakai

export function parseJsonResponse(text: string): any {
  // Logic sama persis dengan current implementation
  // Cari JSON dalam markdown code blocks
  // Fallback ke JSON.parse langsung
  // Return empty object jika semua gagal
}
```

**File: `/shared/config.ts`**
```typescript
// Environment variables terpusat
export const config = {
  openRouterKey: process.env.OPENROUTER_API_KEY,
  openRouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-oss-120b:free',
  cosmosDbConn: process.env.COSMOS_DB_CONNECTION_STRING,
  appVersion: process.env.APP_VERSION || '1.0.0',
  corsOrigin: process.env.CORS_ORIGIN || 'https://maxsales.qzz.io'
};
```

### Tahap 2: AI Adapter (Hari 2-4)

**File: `/shared/ai-adapter.ts`**
```typescript
// Interface untuk multi-provider
interface AIProvider {
  name: string;
  isAvailable(): boolean;
  generate(messages: Message[], options?: AIOptions): Promise<string>;
}

// OpenRouter provider (primary)
class OpenRouterProvider implements AIProvider {
  name = 'openrouter';
  isAvailable() { return !!config.openRouterKey; }

  async generate(messages, options) {
    // Rate limiting, retry logic, timeout
    // POST ke https://openrouter.ai/api/v1/chat/completions
  }
}

// Simulation provider (fallback)
class SimulationProvider implements AIProvider {
  name = 'simulation';
  isAvailable() { return true; }
  async generate(messages, options) { return 'Simulated response'; }
}

// Factory
export function createAIProvider(): AIProvider {
  if (new OpenRouterProvider().isAvailable()) return new OpenRouterProvider();
  return new SimulationProvider();
}
```

### Tahap 3: Azure Functions (Hari 5-10)

Setiap endpoint menjadi Azure Function HTTP trigger. Contoh struktur:

**File: `/functions/status.ts`**
```typescript
import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { createAIProvider } from '../shared/ai-adapter';

const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
  const provider = createAIProvider();
  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      status: 'ok',
      aiMode: provider.name,
      message: provider.isAvailable()
        ? 'AI berjalan dengan ' + provider.name
        : 'AI berjalan dalam mode simulasi',
      version: process.env.APP_VERSION || '1.0.0'
    }
  };
};

export default httpTrigger;
```

### Tahap 4: Cosmos DB Integration (Hari 10-14)

**File: `/shared/cosmos-client.ts`**
```typescript
import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient(process.env.COSMOS_DB_CONNECTION_STRING);
const database = client.database('maxsales-db');

export const containers = {
  canvas: database.container('canvas'),
  competitors: database.container('competitors'),
  segments: database.container('segments'),
  generations: database.container('generations'),
};

// CRUD Operations
export async function saveCanvas(userId: string, data: BusinessCanvasData) {
  // Upsert to Cosmos DB
}

export async function getCanvas(userId: string): Promise<BusinessCanvasData | null> {
  // Read from Cosmos DB
}
```

---

## 4. Migration Steps untuk Setiap File

| File Saat Ini | Menjadi | Perubahan |
|---------------|---------|-----------|
| `worker.ts:1-25` | Dihapus | Diganti Azure Function imports |
| `worker.ts:28-59` | `shared/ai-adapter.ts` | AI adapter pattern |
| `worker.ts:61-95` | `shared/utils.ts` | parseJsonResponse() |
| `worker.ts:97-110` | `functions/status.ts` | Minimal changes |
| `worker.ts:112-147` | `functions/generate-content.ts` | + Cosmos save |
| `worker.ts:149-225` | `functions/strategy-forge.ts` | + Cosmos save |
| `worker.ts:227-290` | `functions/daily-pulse.ts` | + Cosmos save |
| `worker.ts:292-330` | `functions/analyze-competitor.ts` | + Cosmos save |
| `worker.ts:332-365` | `functions/analyze-segments.ts` | + Cosmos save |
| `worker.ts:367-406` | `functions/chat.ts` | + Chat history |
| `server.ts` | Dihapus | Tidak perlu lagi |
| `src/api.ts` | Frontend update | Update base URL |
| `wrangler.toml` | Dihapus | Tidak perlu lagi |

---

## 5. Testing Strategy per Tahap

| Tahap | Test | Metode |
|-------|------|--------|
| 1 | Unit test shared functions | Jest |
| 2 | Unit test AI adapter (mock providers) | Jest + nock |
| 3 | Integration test Azure Functions | Azure Functions Core Tools |
| 4 | Integration test Cosmos DB | Cosmos DB Emulator |
| All | Contract test (request/response) | Supertest + OpenAPI |

---

## 6. Risiko Refactoring

| Risiko | Mitigasi |
|--------|----------|
| API contract berubah | Contract test sebelum & sesudah |
| AI response berbeda | Snapshot test untuk sample responses |
| Cosmos DB latency | Caching + connection pooling |
| Cold start Azure Functions | Premium plan atau selalu-on |

---

*Dokumen refactoring API — bagian dari rencana migrasi MaxSales ke Azure*
