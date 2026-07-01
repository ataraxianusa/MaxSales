# Plan: Xendit Payment Integration + Promo Code System

## Context

Saat ini **tidak ada implementasi Xendit** di kedua repo. Billing UI sepenuhnya mock — klik "Upgrade" hanya toggle state React, tidak ada backend call. Plan ini membangun dari nol:

1. Xendit payment processing (Invoice API)
2. Promo code system (BUNGA20 = influencer + diskon %)
3. Cosmos DB persistence (users, payments, promo_codes)
4. Webhook handling (payment confirmation)
5. Admin dashboard untuk manage promo codes

---

## Architecture Overview

```
User klik "Beli Sekarang"
    ↓
Input kode promo (opsional): BUNGA20
    ↓
POST /api/promo/validate → { valid: true, discount: 20%, type: "percent" }
    ↓
POST /api/create-invoice → amount = Rp299.000 × (1-20%) = Rp239.200
    ↓
Xendit Invoice API → returns invoiceUrl
    ↓
User redirect ke Xendit checkout → bayar via VA/E-Wallet/QRIS
    ↓
Xendit webhook → POST /api/payment-webhook
    ↓
Backend: verify signature → update user plan → record payment → track promo usage
    ↓
User redirect balik ke app → plan = Pro
```

---

## Cosmos DB Containers ( tambah 3 )

| Container | Partition Key | TTL | Purpose |
|-----------|--------------|-----|---------|
| `users` | `/id` | - | User account + plan status |
| `payments` | `/userId` | - | Invoice & payment records |
| `promo-codes` | `/code` | - | Kode promo definition + usage |

---

## Backend: 6 Azure Functions baru

### 1. `api/src/functions/create-invoice/index.ts`

**Input:** `{ userId, email, name, promoCode? }`
**Logic:**
1. Cek user di Cosmos DB
2. Jika `promoCode` ada → validate via promo engine → hitung discounted amount
3. Call `xendit-node` Invoice.create():
   ```typescript
   Invoice.create({
     externalId: `PRO-${userId}-${Date.now()}`,
     amount: discountedAmount, // Rp239.200 jika BUNGA20
     description: `MaxxSales Pro ${promoCode ? `(${promoCode})` : ''}`,
     customer: { givenNames: name, email },
     successRedirectUrl: `${APP_URL}/billing?success=true`,
     failureRedirectUrl: `${APP_URL}/billing?success=false`,
     currency: 'IDR',
     items: [{ name: 'MaxxSales Pro (Monthly)', quantity: 1, price: discountedAmount }]
   })
   ```
4. Simpan invoice ke Cosmos DB `payments` container
5. Return `{ invoiceId, invoiceUrl, amount, originalAmount, discount }`

### 2. `api/src/functions/payment-webhook/index.ts`

**Input:** Xendit webhook payload
**Logic:**
1. Verify webhook signature (`XENDIT_WEBHOOK_TOKEN`)
2. Cek status pembayaran (PAID / EXPIRED / FAILED)
3. Jika PAID:
   - Update user plan → 'Pro' di Cosmos DB `users`
   - Update payment status di `payments`
   - Increment usage counter di `promo-codes` (jika pakai promo)
4. Return 200 OK

### 3. `api/src/functions/promo-validate/index.ts`

**Input:** `{ code: string, userId: string }`
**Logic:**
1. Cari promo code di Cosmos DB
2. Validasi:
   - Code exists?
   - Not expired?
   - Not at max usage?
   - User belum pakai code ini?
3. Return `{ valid, discount, type, message }`

**Format kode:**
```
BUNGA20    → influencer="BUNGA", discount=20%, type="percent"
RAMADHAN50 → influencer="RAMADHAN", discount=50%, type="percent"
VIP100K    → influencer="VIP", discount=100000, type="nominal"
FLASH30    → influencer="FLASH", discount=30%, type="percent"
```

### 4. `api/src/functions/promo-admin/index.ts`

**Input:** `{ action: "create"|"list"|"delete"|"toggle", data? }`
**Logic:**
- `create`: Buat promo code baru
- `list`: List semua promo codes
- `delete`: Hapus promo code
- `toggle`: Aktifkan/nonaktifkan

### 5. `api/src/functions/billing-history/index.ts`

**Input:** `{ userId }`
**Logic:**
1. Query Cosmos DB `payments` by userId
2. Return list transaksi

### 6. `api/src/functions/user-plan/index.ts`

**Input:** `{ userId }`
**Logic:**
1. Query Cosmos DB `users` by userId
2. Return `{ plan: "Free"|"Pro", expiresAt? }`

---

## Frontend Changes

### 1. Checkout Modal (ganti mock billing modal)

**File:** `src/App.tsx` — replace billing modal

```
┌─────────────────────────────────────┐
│  UPGRADE KE PRO                     │
│                                     │
│  Harga: Rp 299.000/bln             │
│  [input kode promo: BUNGA20    ]   │
│  [Gunakan]  → diskon 20% = Rp239.200│
│                                     │
│  Total: Rp 239.200                  │
│  Hemat: Rp 60.000                   │
│                                     │
│  [Bayar Sekarang]                   │
│  QRIS • GoPay • OVO • VA           │
└─────────────────────────────────────┘
```

### 2. Pricing Section (landing page)

Tambah input kode promo di pricing card:
- Input field "Punya kode promo?"
- Button "Gunakan"
- Tampilkan diskon jika valid

### 3. Admin Dashboard (baru)

Halaman `/admin/promos` untuk:
- List promo codes (code, influencer, discount, usage, expires)
- Create promo code
- Toggle active/inactive
- Delete promo code

---

## Data Models

### User (Cosmos DB `users`)
```typescript
{
  id: string;           // userId
  name: string;
  email: string;
  plan: "Free" | "Pro";
  planExpiresAt?: string;
  promoCodesUsed: string[];  // ["BUNGA20", "FLASH30"]
  createdAt: string;
  updatedAt: string;
}
```

### Payment (Cosmos DB `payments`)
```typescript
{
  id: string;           // invoiceId
  userId: string;
  amount: number;       // Rp239.200 (discounted)
  originalAmount: number; // Rp299.000
  promoCode?: string;   // "BUNGA20"
  discount?: number;    // 20
  status: "pending" | "paid" | "expired" | "failed";
  xenditInvoiceId: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}
```

### PromoCode (Cosmos DB `promo-codes`)
```typescript
{
  id: string;           // code (e.g., "BUNGA20")
  code: string;         // "BUNGA20"
  influencer: string;   // "BUNGA"
  discount: number;     // 20
  type: "percent" | "nominal";
  maxUsage: number;     // 100
  currentUsage: number; // 35
  expiresAt?: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
}
```

---

## Environment Variables

```
XENDIT_SECRET_KEY=xnd_development_...
XENDIT_WEBHOOK_TOKEN=...
APP_URL=https://maxxsales.com
```

---

## Execution Order

| Phase | What | Files |
|-------|------|-------|
| 1 | Cosmos DB containers (users, payments, promo-codes) | infra/main.bicep |
| 2 | xendit-node SDK install | api/package.json |
| 3 | create-invoice function | api/src/functions/create-invoice/ |
| 4 | payment-webhook function | api/src/functions/payment-webhook/ |
| 5 | promo-validate function | api/src/functions/promo-validate/ |
| 6 | promo-admin function | api/src/functions/promo-admin/ |
| 7 | billing-history function | api/src/functions/billing-history/ |
| 8 | user-plan function | api/src/functions/user-plan/ |
| 9 | Frontend checkout modal | src/App.tsx |
| 10 | Pricing section promo input | src/components/PricingSection.tsx |
| 11 | Admin promo dashboard | src/pages/AdminPromos.tsx (baru) |
| 12 | Xendit env vars → Key Vault | post-deploy.sh |
| 13 | Deploy & test | CI/CD |

---

## Verification

1. `npm run build` — zero errors
2. Test promo validate: `curl -X POST /api/promo-validate -d '{"code":"BUNGA20","userId":"test"}'`
3. Test create invoice: `curl -X POST /api/create-invoice -d '{"userId":"test","email":"test@test.com","promoCode":"BUNGA20"}'`
4. Test webhook: Send mock Xendit webhook → verify user plan updated
5. Test billing history: `curl /api/billing-history?userId=test`
6. Manual test: Click "Bayar Sekarang" → redirect ke Xendit → bayar → redirect balik → plan = Pro
