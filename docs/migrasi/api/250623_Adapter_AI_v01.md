# Desain Adapter AI Multi-Provider
**Versi:** v01 | **Tanggal:** 2025-06-23 | **Klasifikasi:** Internal

---

## 1. Latar Belakang

Saat ini MaxSales menggunakan OpenRouter sebagai satu-satunya AI provider dengan fallback ke mode simulasi. Untuk migrasi ke Azure, perlu desain adapter yang:

1. Mendukung multiple AI providers (OpenRouter, Azure OpenAI, simulation)
2. Mudah ditambah provider baru
3. Handling rate limit, timeout, retry secara konsisten
4. Monitoring token usage dan cost per request

---

## 2. Arsitektur Adapter

```
┌─────────────────────────────────────────────────────────┐
│                    AI ADAPTER LAYER                        │
│                                                           │
│  ┌─────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │  OpenRouter  │  │  Azure     │  │  Simulation       │  │
│  │  Provider    │  │  OpenAI    │  │  Provider         │  │
│  │              │  │  Provider  │  │  (Fallback)       │  │
│  │  Primary     │  │  Optional  │  │  Dev/Testing      │  │
│  └──────┬───────┘  └─────┬──────┘  └────────┬─────────┘  │
│         │                │                   │            │
│         └────────────────┼───────────────────┘            │
│                          │                                │
│                    ┌─────┴──────┐                         │
│                    │  Factory   │                         │
│                    │  Pattern   │                         │
│                    └─────┬──────┘                         │
│                          │                                │
│                    ┌─────┴──────┐                         │
│                    │  Consumer  │                         │
│                    │  (Functions)│                        │
│                    └────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Interface & Implementasi

### 3.1 Base Interface

```typescript
// /shared/ai-adapter.ts

interface AIRequest {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface AIResponse {
  content: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  latency: number; // ms
  provider: string;
}

interface AIProvider {
  readonly name: string;
  isAvailable(): boolean;
  generate(request: AIRequest): Promise<AIResponse>;
  generateStream?(request: AIRequest): AsyncIterable<string>;
}
```

### 3.2 OpenRouter Provider

```typescript
class OpenRouterProvider implements AIProvider {
  name = 'openrouter';
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private defaultModel = 'openai/gpt-oss-120b:free';

  isAvailable(): boolean {
    return !!process.env.OPENROUTER_API_KEY;
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://maxsales.qzz.io',
      },
      body: JSON.stringify({
        model: request.model || this.defaultModel,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      }),
      signal: AbortSignal.timeout(60000), // 60s timeout
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const latency = Date.now() - start;

    return {
      content: data.choices[0].message.content,
      model: data.model,
      tokensIn: data.usage?.prompt_tokens || 0,
      tokensOut: data.usage?.completion_tokens || 0,
      latency,
      provider: this.name,
    };
  }
}
```

### 3.3 Azure OpenAI Provider

```typescript
class AzureOpenAIProvider implements AIProvider {
  name = 'azure-openai';
  private endpoint: string;
  private apiVersion = '2024-06-01';

  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || '';
  }

  isAvailable(): boolean {
    return !!(process.env.AZURE_OPENAI_KEY && this.endpoint);
  }

  async generate(request: AIRequest): Promise<AIResponse> {
    const start = Date.now();
    const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';
    const url = `${this.endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${this.apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_KEY!,
      },
      body: JSON.stringify({
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const latency = Date.now() - start;

    return {
      content: data.choices[0].message.content,
      model: deploymentName,
      tokensIn: data.usage?.prompt_tokens || 0,
      tokensOut: data.usage?.completion_tokens || 0,
      latency,
      provider: this.name,
    };
  }
}
```

### 3.4 Simulation Provider

```typescript
class SimulationProvider implements AIProvider {
  name = 'simulation';

  isAvailable(): boolean { return true; }

  async generate(request: AIRequest): Promise<AIResponse> {
    // Simulasi delay 500-1500ms
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));

    const lastMessage = request.messages[request.messages.length - 1].content;

    // Return mock response based on intent detection
    return {
      content: this.generateMock(lastMessage),
      model: 'simulation-v1',
      tokensIn: 0,
      tokensOut: 0,
      latency: Date.now() - Date.now() + 500,
      provider: this.name,
    };
  }

  private generateMock(userMessage: string): string {
    // Pattern matching untuk return mock yang relevan
    if (userMessage.includes('headline') || userMessage.includes('caption'))
      return JSON.stringify({ headlines: [...], captions: [...] });
    if (userMessage.includes('strategy'))
      return JSON.stringify({ strategies: [...] });
    return 'Simulated AI response';
  }
}
```

---

## 4. Factory Pattern

```typescript
type ProviderType = 'openrouter' | 'azure-openai' | 'simulation';

export function createAIProvider(preferred?: ProviderType): AIProvider {
  if (preferred === 'azure-openai') {
    const azure = new AzureOpenAIProvider();
    if (azure.isAvailable()) return azure;
  }

  if (preferred !== 'simulation') {
    const openrouter = new OpenRouterProvider();
    if (openrouter.isAvailable()) return openrouter;
  }

  return new SimulationProvider();
}
```

---

## 5. Prompt Template Management

```typescript
// /shared/prompts.ts

export const Prompts = {
  generateContent: {
    headline: (product: string, audience: string, goals: string[]) => ({
      role: 'system' as const,
      content: `Kamu adalah ahli copywriting. Buat headline menarik untuk:
Produk: ${product}
Target Audiens: ${audience}
Tujuan: ${goals.join(', ')}

Berikan 5 headline dalam format JSON array.`
    }),
    caption: (product: string, audience: string) => ({
      role: 'system' as const,
      content: `Buat caption media sosial yang engaging untuk: ${product}`
    })
  },

  strategyForge: {
    system: (data: BusinessCanvasData) => ({
      role: 'system' as const,
      content: `Kamu adalah konsultan bisnis. Analisis bisnis berikut:
Nama: ${data.basicInfo?.businessName}
Deskripsi: ${data.basicInfo?.description}
Industri: ${data.basicInfo?.industry}

Beri output JSON dengan strategi untuk 11 area bisnis.`
    })
  },

  chat: {
    system: (data: BusinessCanvasData, competitors: CompetitorIntel[], segments: CustomerSegment[]) => ({
      role: 'system' as const,
      content: buildChatSystemPrompt(data, competitors, segments)
    })
  }
};
```

---

## 6. Monitoring & Observability

Setiap AI call harus mencatat:

```typescript
interface AIAuditLog {
  timestamp: string;
  endpoint: string;        // Endpoint yang dipanggil
  provider: string;        // openrouter | azure-openai | simulation
  model: string;           // Model yang digunakan
  tokensIn: number;
  tokensOut: number;
  latency: number;         // ms
  success: boolean;
  error?: string;
  cost: number;            // Estimasi biaya
}

// Implementasi logging
export async function withAILogging(
  endpoint: string,
  fn: () => Promise<AIResponse>
): Promise<AIResponse> {
  const start = Date.now();
  try {
    const result = await fn();
    logToCosmos({
      timestamp: new Date().toISOString(),
      endpoint,
      provider: result.provider,
      model: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      latency: result.latency,
      success: true,
      cost: estimateCost(result.provider, result.tokensIn, result.tokensOut),
    });
    return result;
  } catch (err) {
    logToCosmos({
      timestamp: new Date().toISOString(),
      endpoint,
      provider: 'unknown',
      model: 'unknown',
      tokensIn: 0,
      tokensOut: 0,
      latency: Date.now() - start,
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      cost: 0,
    });
    throw err;
  }
}
```

---

## 7. Cost Estimation per Provider

| Provider | Input (per 1K token) | Output (per 1K token) |
|----------|---------------------|----------------------|
| OpenRouter (free models) | $0.00 | $0.00 |
| OpenRouter (GPT-4o) | $0.0025 | $0.0100 |
| Azure OpenAI (GPT-4o) | $0.0025 | $0.0100 |
| Azure OpenAI (GPT-4o-mini) | $0.00015 | $0.00060 |

---

## 8. Retry & Error Handling Strategy

| Error | Retry? | Strategy |
|-------|--------|----------|
| 429 Rate Limit | Ya, 3x | Exponential backoff (1s, 2s, 4s) |
| 5xx Server Error | Ya, 2x | Wait 1s, then retry |
| Timeout (>60s) | Tidak | Return error to client |
| Network Error | Ya, 2x | Wait 500ms, then retry |
| Invalid Response | Tidak | Return simulation fallback |

---

## 9. Migration Plan

1. **Phase 1:** Buat interface dan OpenRouterAdapter (hari 1)
2. **Phase 2:** Buat SimulationAdapter (hari 1)
3. **Phase 3:** Refactor semua endpoint pake adapter (hari 2-3)
4. **Phase 4:** Tambah AzureOpenAIAdapter + logging (hari 4-5)
5. **Phase 5:** Monitoring dashboard via Application Insights (hari 6-7)

---

*Dokumen desain AI adapter — komponen kunci migrasi ke Azure*
