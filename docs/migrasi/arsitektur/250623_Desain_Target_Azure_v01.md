# Desain Arsitektur Target Azure
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Arsitektur Target

```
┌──────────────────────────────────────────────────────────────┐
│                        Azure Front Door                         │
│                   (CDN + WAF + SSL Termination)                  │
└──────────┬───────────────────────────────────┬─────────────────┘
           │                                   │
           ▼                                   ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│ Azure Static Web Apps│    │   Azure API Management        │
│   (Frontend React)   │    │   (API Gateway + Rate Limit)   │
└──────────────────────┘    └───────────┬──────────────────┘
                                        │
                                        ▼
                          ┌──────────────────────────────┐
                          │   Azure Functions             │
                          │   (Node.js 20 - TypeScript)   │
                          │   ┌──────────────────────┐   │
                          │   │ HTTP Trigger:         │   │
                          │   │ /status (GET)         │   │
                          │   │ /generate-content     │   │
                          │   │ /strategy-forge       │   │
                          │   │ /daily-pulse          │   │
                          │   │ /analyze-competitor   │   │
                          │   │ /analyze-segments     │   │
                          │   │ /chat (POST)          │   │
                          │   └──────────────────────┘   │
                          └───────────┬──────────────────┘
                                      │
                                      ▼
               ┌─────────────────────────────────────────┐
               │         Azure Cosmos DB (NoSQL)           │
               │  ┌────────────┐ ┌──────────┐ ┌────────┐ │
               │  │ Canvas     │ │Competitor│ │Segment │ │
               │  │ Container  │ │Container │ │Container│ │
               │  └────────────┘ └──────────┘ └────────┘ │
               └─────────────────────────────────────────┘
                                      │
                                      ▼
               ┌─────────────────────────────────────────┐
               │      Azure OpenAI / OpenRouter           │
               │      (Multi-Provider AI Adapter)         │
               └─────────────────────────────────────────┘
```

---

## 2. Azure Services yang Digunakan

### 2.1 Compute & Hosting

| Service | Tujuan | SKU Rekomendasi | Estimasi Biaya/bln |
|---------|--------|-----------------|-------------------|
| Azure Functions | Backend API (7 endpoints) | Consumption Plan | ~$0 (free grant) |
| Azure Static Web Apps | React frontend hosting | Standard | ~$9 |
| Azure API Management | API gateway, rate limiting | Consumption | ~$0.30/1K calls |

### 2.2 Data & Storage

| Service | Tujuan | SKU Rekomendasi | Estimasi Biaya/bln |
|---------|--------|-----------------|-------------------|
| Azure Cosmos DB | Database NoSQL (canvas, competitor, segment) | Serverless | ~$5-15 |
| Azure Blob Storage | File/content storage | Cool - LRS | ~$1 |
| Azure Cache for Redis | Session & response caching | Basic 250MB | ~$15 |

### 2.3 AI & Intelligence

| Service | Tujuan | SKU Rekomendasi | Estimasi Biaya/bln |
|---------|--------|-----------------|-------------------|
| OpenRouter API | Primary AI (unified adapter) | Pay-per-token | ~$5-20 (exisiting) |
| Azure OpenAI (opsional) | Secondary AI provider | Pay-as-you-go | ~$10-30 |

### 2.4 Security & Networking

| Service | Tujuan | SKU Rekomendasi | Estimasi Biaya/bln |
|---------|--------|-----------------|-------------------|
| Azure Key Vault | Secrets management (API keys, connection strings) | Standard | ~$0.03/10K ops |
| Azure Front Door | CDN, WAF, SSL, global load balancing | Standard | ~$35 |
| Azure AD B2C | User authentication (future) | P1 | ~$0 |

### 2.5 Monitoring & DevOps

| Service | Tujuan | SKU Rekomendasi | Estimasi Biaya/bln |
|---------|--------|-----------------|-------------------|
| Azure Monitor | Telemetry, alerts | Pay-as-you-go | ~$3 |
| Application Insights | APM, tracing, exceptions | Pay-as-you-go | ~$5 |
| Log Analytics | Log aggregation | Per GB ingested | ~$2 |

---

## 3. Komponen Detail

### 3.1 Azure Functions

```typescript
// Struktur Function App
/maxsales-api
  /src
    /functions
      status.ts        // GET  /api/status
      generate-content.ts  // POST /api/generate-content-text
      strategy-forge.ts    // POST /api/strategy-forge
      daily-pulse.ts       // POST /api/daily-pulse
      analyze-competitor.ts // POST /api/analyze-competitor
      analyze-segments.ts  // POST /api/analyze-segments
      chat.ts              // POST /api/chat
    /shared
      ai-adapter.ts    // Unified AI provider adapter
      models.ts       // Type definitions
      utils.ts        // Helper functions
      cosmos-client.ts // Cosmos DB client wrapper
    index.ts          // Entry point
```

**Konfigurasi:**
- Runtime: Node.js 20 LTS
- Trigger: HTTP (semua endpoint)
- Authentication: Function Key + API Management
- CORS: Terbatas ke domain frontend

### 3.2 Azure Cosmos DB

```json
// Database: maxsales-db
// Throughput: Serverless (pay-per-request)

// Container 1: canvas
{
  "id": "canvas",
  "partitionKey": "/userId",
  "uniqueKeys": [{"paths": ["/id"]}]
  // Document: { id, userId, businessData, createdAt, updatedAt }
}

// Container 2: competitors  
{
  "id": "competitors",
  "partitionKey": "/canvasId",
  // Document: { id, canvasId, competitors[], createdAt, updatedAt }
}

// Container 3: segments
{
  "id": "segments",
  "partitionKey": "/canvasId",
  // Document: { id, canvasId, segments[], createdAt, updatedAt }
}

// Container 4: generations
{
  "id": "generations",
  "partitionKey": "/canvasId",
  "ttl": 2592000, // 30 days auto-expire
  // Document: { id, canvasId, type, prompt, response, createdAt }
}
```

### 3.3 AI Adapter

```typescript
interface AIProvider {
  name: string;
  generate(prompt: string, options: AIOptions): Promise<AIResponse>;
  isAvailable(): boolean;
  getCost(): number;
}

// Providers yang didukung:
// 1. OpenRouter (default, active)
// 2. Azure OpenAI (fallback, future)
// 3. Local Simulation (fallback, when no API key)
```

---

## 4. Networking Design

```
Azure Front Door (maxsales.qzz.io)
  ├── /api/* → Azure API Management → Azure Functions
  ├── /* → Azure Static Web Apps (React SPA)
  └── WAF Rules: SQL Injection, XSS, Rate Limiting

VNet Integration (for Functions):
  └── Private Endpoints:
      ├── Cosmos DB
      ├── Key Vault
      └── Redis Cache
```

---

## 5. Data Migration Strategy

### 5.1 Fase Migrasi Data

| Fase | Data | Dari | Ke | Metode |
|------|------|------|----|--------|
| 1 | Business Canvas | localStorage | Cosmos DB (canvas container) | Bulk import script |
| 2 | Competitors | localStorage | Cosmos DB (competitors container) | Bulk import script |
| 3 | Segments | localStorage | Cosmos DB (segments container) | Bulk import script |
| 4 | Generation History | In-memory | Cosmos DB (generations container) | Auto-save on generate |

### 5.2 Schema Mapping

```typescript
// Current (localStorage) → Target (Cosmos DB)

interface CanvasDocument {
  id: string;                    // UUID generated
  userId: string;                // partition key
  businessData: BusinessCanvasData; // full canvas data
  competitors: CompetitorIntel[];
  segments: CustomerSegment[];
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  metadata: {
    version: number;
    lastAiCall: string;
    totalGenerations: number;
  };
}
```

---

## 6. Non-Functional Requirements

| Requirement | Target | Azure Capability |
|-------------|--------|------------------|
| Availability | 99.95% | Azure Functions SLA: 99.95% |
| Latency API | < 500ms | Front Door caching + Functions Premium |
| Scalability | Auto-scale 0-100 instances | Consumption Plan auto-scale |
| Data Durability | 99.999% | Cosmos DB multi-region writes |
| Security | ISO 27001, GDPR | Azure Policy + Defender |
| DR | RTO < 1 jam, RPO < 15 menit | Active geo-replication |
| Backup | Daily automated | Cosmos DB automatic backup |

---

## 7. Perbandingan: Current vs Target

| Aspek | Current (Cloudflare) | Target (Azure) |
|-------|---------------------|----------------|
| Runtime | Edge Workers (isolated) | Node.js 20 (full compatibility) |
| Database | None (ephemeral) | Cosmos DB (persistent, globally distributed) |
| AI Provider | OpenRouter only | Multi-provider adapter |
| API Gateway | None | API Management + Front Door |
| Monitoring | None | App Insights + Azure Monitor |
| Security | Basic CORS | WAF, DDoS Protection, Private Endpoints |
| CI/CD | GitHub Pages | GitHub Actions + Azure DevOps |
| Cost | ~$0 (Workers free tier) | ~$80-120/month (estimated) |
| Developer Experience | Dual codebase | Single codebase, local emulator |

---

*Dokumen ini adalah blueprint arsitektur target migrasi MaxSales ke Azure*
*Referensi: Azure Architecture Center, Well-Architected Framework*
