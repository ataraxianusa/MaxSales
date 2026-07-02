# Plan: Xendit Payment + Promo Code System v02

## Business Rules

### Diskon vs Komisi
| Komponen | Siapa | Contoh |
|----------|-------|--------|
| **Diskon** | User (potongan harga) | 20% → user bayar Rp239.200 |
| **Komisi** | Partner (bagian dari yang user bayar) | 10% → partner dapat Rp23.920 |

### Format Kode Promo
```
[INFLUENCER][DISKON]
BUNGA20      → BUNGA + 20% diskon
SAMPOERNA15  → SAMPOERNA + 15% diskon
VIP100K      → VIP + Rp100.000 diskon
FLASH30      → FLASH + 30% diskon (internal, tidak ada komisi)
```

---

## Data Models

### PartnerProfile (Cosmos DB `partner-profiles`) — BARU
```typescript
{
  id: string;
  // Data Pribadi/Organisasi
  name: string;                    // "Bunga Putri" / "Sampoerna Foundation"
  type: "personal" | "organization";
  email: string;
  phone: string;                   // HP/WA aktif
  address?: string;
  
  // PIC (untuk organisasi)
  picName?: string;
  picPhone?: string;
  picEmail?: string;
  
  // Rekening Bank (manual transfer)
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  
  // E-Wallet (untuk disbursement)
  ovoPhone?: string;
  gopayPhone?: string;
  
  // Metadata
  promoCode: string;               // Auto-generated: "BUNGA20"
  discountPercent: number;         // 20
  commissionPercent: number;       // 10 (komisi partner)
  totalEarning: number;
  totalPayout: number;
  pendingPayout: number;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}
```

### PromoCode (tetap)
```typescript
{
  id: string;
  code: string;                    // "BUNGA20"
  type: "internal" | "partner";
  discount: number;                // 20 (untuk user)
  discountType: "percent" | "nominal";
  commissionRate: number;          // 10 (komisi partner, 0 untuk internal)
  partnerName?: string;            // "BUNGA"
  maxUsage: number;
  currentUsage: number;
  totalRevenue: number;
  totalPartnerPayout: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}
```

### Payment (tetap, tambah komisi)
```typescript
{
  id: string;
  userId: string;
  amount: number;                  // Yang user bayar
  originalAmount: number;          // Harga normal
  promoCode?: string;
  discount?: number;               // Diskon untuk user
  promoType?: "internal" | "partner";
  commissionAmount?: number;       // Komisi untuk partner
  partnerName?: string;
  status: "pending" | "paid" | "expired" | "failed";
  xenditInvoiceId: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}
```

### PartnerPayout (tetap)
```typescript
{
  id: string;
  partnerName: string;
  partnerContact: string;
  promoCode: string;
  amount: number;
  status: "pending" | "paid" | "processing";
  paidAt?: string;
  paidBy?: string;
  notes?: string;
  createdAt: string;
}
```

---

## Super Admin Dashboard

### Tab 1: Partner Management
- List semua partner (bukan promo codes)
- Klik partner → detail profile + promo code
- Form buat partner baru:
  - Data pribadi/organisasi
  - PIC (jika organisasi)
  - Rekening bank
  - E-wallet (OVO/GoPay)
  - Diskon % + Komisi %
  - **Kode promo auto-generated** dari nama partner
- Export CSV/Excel

### Tab 2: Promo Codes
- List semua kode (internal + partner)
- Usage stats per kode

### Tab 3: Payouts
- Pending payouts per partner
- Mark as paid
- Export payout report

---

## Auto-Generate Kode Promo

**Logic:**
```
Input: nama = "Bunga Putri", diskon = 20
Output: kode = "BUNGA20"

Input: nama = "Sampoerna Foundation", diskon = 15
Output: kode = "SAMPOERNA15"

Input: nama = "Kopi Kenangan", diskon = 25
Output: kode = "KOPI25"
```

**Rules:**
1. Ambil kata pertama dari nama (huruf kapital)
2. Tambah angka diskon
3. Jika sudah ada → tambah suffix (BUNGA20-2, BUNGA20-3)

---

## Export CSV/Excel

### Waktu Operasional: WIB (UTC+7)
Semua tanggal dan waktu di-export dalam format WIB:
- Cutoff settlement: 00:00 WIB tanggal 1 bulan berikutnya
- Deadline pembayaran: 23:59 WIB tanggal 5 bulan berikutnya
- Format tanggal: `DD/MM/YYYY HH:MM WIB`

### 3 Jenis Export

#### 1. Export Semua Partner
Button: "Export Semua Partner"

| Kolom | Contoh | Sumber |
|-------|--------|--------|
| Kode Promo | BUNGA20 | PartnerProfile |
| Nama Partner | Bunga Putri | PartnerProfile |
| Tipe | Personal | PartnerProfile |
| Email | bunga@email.com | PartnerProfile |
| WA | 08123456789 | PartnerProfile |
| Bank | BCA | PartnerProfile |
| No Rekening | 1234567890 | PartnerProfile |
| Nama Rekening | Bunga Putri | PartnerProfile |
| OVO | 08123456789 | PartnerProfile |
| GoPay | 08123456789 | PartnerProfile |
| Diskon % | 20% | PartnerProfile |
| Komisi % | 10% | PartnerProfile |
| Join Date | 15/06/2026 | PartnerProfile |
| Total Transaksi | 35 | Aggregated |
| Total Revenue | Rp8.372.000 | Aggregated |
| Total Earning | Rp837.200 | Aggregated |
| Total Payout | Rp598.000 | Aggregated |
| Pending | Rp239.200 | Aggregated |
| Status | Active | PartnerProfile |

#### 2. Export Transaksi Periode
Button: "Export Transaksi" + pilih bulan/tahun

| Kolom | Contoh | Sumber |
|-------|--------|--------|
| ID Transaksi | INV-001 | Payment |
| Tanggal | 15/06/2026 14:30 WIB | Payment.paidAt |
| User | Rina Sari | Payment.userId → User |
| Kode Promo | BUNGA20 | Payment.promoType |
| Harga Normal | Rp299.000 | Payment.originalAmount |
| Diskon | 20% | Payment.discount |
| Yang Dibayar | Rp239.200 | Payment.amount |
| Komisi Partner | Rp23.920 | Payment.commissionAmount |
| Partner | BUNGA | Payment.partnerName |
| Metode Bayar | QRIS | Payment.paymentMethod |
| Status | Paid | Payment.status |

#### 3. Export Settlement Report
Button: "Export Settlement" + pilih periode

| Kolom | Contoh | Sumber |
|-------|--------|--------|
| Partner | Bunga Putri | PartnerSettlement |
| Periode | 01/06/2026 - 30/06/2026 | PartnerSettlement |
| Jumlah Transaksi | 15 | PartnerSettlement |
| Total Revenue | Rp3.588.000 | PartnerSettlement |
| Total Komisi | Rp358.800 | PartnerSettlement |
| Deadline | 05/07/2026 23:59 WIB | PartnerSettlement |
| Status | Pending | PartnerSettlement |
| Tanggal Bayar | - | PartnerSettlement.paidAt |
| Dibayar Oleh | - | PartnerSettlement.paidBy |

### Implementasi Export

```typescript
// Server-side: Azure Function
app.post("/api/partner-export", async (c) => {
  const { type, periodStart?, periodEnd? } = await c.req.json();
  
  let data: any[];
  let filename: string;
  
  switch (type) {
    case "partners":
      data = await queryAllPartnerProfiles();
      filename = `partner-list-${formatDate(now())}.csv`;
      break;
    case "transactions":
      data = await queryPayments({ periodStart, periodEnd, promoType: "partner" });
      filename = `transaksi-${periodStart}-${periodEnd}.csv`;
      break;
    case "settlements":
      data = await querySettlements({ periodStart, periodEnd });
      filename = `settlement-${periodStart}-${periodEnd}.csv`;
      break;
  }
  
  const csv = convertToCSV(data);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
});
```

### Frontend: Export Button di Admin

```tsx
// 3 tombol export di header admin
<button onClick={() => handleExport("partners")}>Export Semua Partner</button>
<button onClick={() => handleExport("transactions")}>Export Transaksi</button>
<button onClick={() => handleExport("settlements")}>Export Settlement</button>
```

---

## Settlement System

### Flow Settlement

```
Tanggal 1 bulan berikutnya (auto-trigger via Azure Timer):
    ↓
System auto-cutoff: transaksi 1-30/31 bulan lalu
    ↓
Hitung total komisi per partner:
  - BUNGA: 15 transaksi × Rp23.920 = Rp358.800
  - SAMPOERNA: 50 transaksi × Rp1.196.000
    ↓
Generate settlement report
    ↓
Deadline bayar: tanggal 5 bulan berikutnya
```

### PartnerSettlement (Cosmos DB `partner-settlements`) — BARU

```typescript
{
  id: string;
  partnerName: string;
  periodStart: string;      // "2026-06-01"
  periodEnd: string;        // "2026-06-30"
  totalTransactions: number;
  totalRevenue: number;     // Total yang user bayar
  totalCommission: number;  // Komisi partner
  status: "pending" | "processing" | "paid" | "overdue";
  deadline: string;         // "2026-07-05" (5 hari setelah cutoff)
  paidAt?: string;
  paidBy?: string;
  notes?: string;
  createdAt: string;
}
```

### Join Date

Partner mendapat `joinDate` otomatis saat admin buat partner baru:

```typescript
joinDate: string;  // Auto-generated: new Date().toISOString()
```

**Kegunaan join date:**
- Settlement period pertama: Partner join 15 Juni → periode pertama 15-30 Juni (partial)
- Audit trail: Kapan partner mulai aktif
- Reporting: "Partner aktif > 6 bulan"
- Masa depan: Tier system / loyalty program

### Auto-Cutoff Logic (WIB / UTC+7)

```typescript
// Azure Timer Trigger: 0 17 * * * (17:00 UTC = 00:00 WIB)
// Check: apakah hari ini hari terakhir bulan?
function runSettlement() {
  const nowWIB = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const isLastDay = nowWIB.getDate() === getDaysInMonth(nowWIB.getMonth() + 1, nowWIB.getFullYear());
  
  if (!isLastDay) return; // Skip if not last day of month
  
  const lastMonth = getPreviousMonth(nowWIB);
  const periodStart = firstDayOfMonth(lastMonth);
  const periodEnd = lastDayOfMonth(lastMonth);
  
  // Query all paid partner transactions in period
  const transactions = queryPayments({
    periodStart,
    periodEnd,
    promoType: "partner",
    status: "paid"
  });
  
  // Group by partnerName
  const partnerGroups = groupBy(transactions, "partnerName");
  
  // Create settlement record per partner
  for (const [partner, txs] of Object.entries(partnerGroups)) {
    const totalCommission = txs.reduce((s, t) => s + (t.commissionAmount || 0), 0);
    const totalRevenue = txs.reduce((s, t) => s + t.amount, 0);
    
    createSettlement({
      partnerName: partner,
      periodStart,
      periodEnd,
      totalTransactions: txs.length,
      totalRevenue,
      totalCommission,
      deadline: addDays(firstDayOfMonth(now()), 5), // Tanggal 5 bulan berikutnya
      status: "pending",
      createdAt: now()
    });
  }
}
```

### Admin Settlement Dashboard

| Kolom | Contoh |
|-------|--------|
| Partner | Bunga Putri |
| Periode | 1-30 Juni 2026 |
| Transaksi | 15 |
| Revenue | Rp3.588.000 |
| Komisi | Rp358.800 |
| Deadline | 5 Juli 2026 |
| Status | Pending / Paid / Overdue |

### Payment Deadline Rules

| Hari | Status | Aksi |
|------|--------|------|
| 1-5 bulan berikutnya | Pending | Admin proses manual transfer |
| 6+ bulan berikutnya | Overdue | Alert ke admin + notifikasi ke partner |
| Setelah bayar | Paid | Record paidAt, paidBy |

### Export Settlement Report

Format CSV/Excel untuk partner:
| Kolom | Contoh |
|-------|--------|
| Periode | Juni 2026 |
| Jumlah Transaksi | 15 |
| Total Revenue | Rp3.588.000 |
| Total Komisi | Rp358.800 |
| Status | Pending |
| Deadline | 5 Juli 2026 |

---

## Execution Order

| # | Phase | File/Dir |
|---|-------|----------|
| 1 | PartnerProfile type + Cosmos container | `src/types.ts`, `infra/main.bicep` |
| 2 | PartnerSettlement type + Cosmos container | `src/types.ts`, `infra/main.bicep` |
| 3 | partner-manage function | `api/src/functions/partner-manage/` |
| 4 | Auto-generate kode promo logic | `api/src/shared/promo-generator.ts` |
| 5 | settlement-cron function (Timer Trigger) | `api/src/functions/settlement-cron/` |
| 6 | partner-export function (CSV) | `api/src/functions/partner-export/` |
| 7 | AdminPromos → AdminPartners redesign | `src/pages/AdminPromos.tsx` |
| 8 | PartnerProfile form (lengkap) | `src/pages/AdminPromos.tsx` |
| 9 | Settlement tab + export | `src/pages/AdminPromos.tsx` |
| 10 | Export CSV/Excel button | `src/pages/AdminPromos.tsx` |
| 11 | Xendit integration | (sudah ada plan sebelumnya) |
