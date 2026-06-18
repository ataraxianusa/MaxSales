/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarketingAsset, RecommendationStrategy, Contact, CompetitorData, Branch } from './types';

export const INITIAL_MARKETING_ASSETS: MarketingAsset[] = [
  {
    id: 'asset_hq_1',
    productName: 'SaaS CRM Pro',
    persona: 'Pebisnis Retail / UKM lokal berkembang.',
    targetMarket: 'Jabodetabek & Surabaya',
    mediaSpecs: 'Instagram Feed Post (1:1)',
    title: 'Kelola Prospek Toko Tanpa Ribet',
    copy: 'Capek balas WhatsApp satu per satu? VOXIA mengotomatisasi pengiriman brosur, pencatatan penawaran, dan pemantauan prospek secara otomatis seketika dalam satu aplikasi cerdas.',
    ctaText: 'Coba Gratis 14 Hari',
    type: 'social-post',
    styleTheme: {
      bgGradient: 'from-slate-900 to-indigo-950',
      primaryColor: '#0A3D62',
      accentColor: '#FFB400',
      textStyle: 'font-sans font-bold text-white'
    },
    timestamp: '2026-06-15 14:32',
    version: 1
  },
  {
    id: 'asset_hq_2',
    productName: 'SaaS CRM Pro',
    persona: 'Manajer Penjualan Korporat B2B.',
    targetMarket: 'Nasional',
    mediaSpecs: 'TikTok Video Script & Banner (9:16)',
    title: 'Naikkan Tim Sales Hingga 150%',
    copy: 'Jangan biarkan leads berharga dingin karena admin telat merespons. Dengan AI Lead-Scoring terpadu VOXIA, dorong closing tim sales Anda otomatis pada target bernilai tinggi.',
    ctaText: 'Mulai Konsultasi Gratis',
    type: 'social-post',
    styleTheme: {
      bgGradient: 'from-cyan-950 via-sky-900 to-indigo-950',
      primaryColor: '#00A3E0',
      accentColor: '#0A3D62',
      textStyle: 'font-sans text-stone-100'
    },
    timestamp: '2026-06-16 09:12',
    version: 2
  }
];

export const INITIAL_STRATEGY: RecommendationStrategy = {
  id: 'strat_hq_preset',
  businessName: 'Mentari Busana',
  industry: 'Fashion / Retail Muslimah',
  painPoints: ['Konversi iklan Instagram rendah', 'Biaya perolehan pelanggan (CAC) mahal', 'Admin kewalahan follow up'],
  funnelSteps: [
    { id: '1', label: 'Awareness', active: true, details: 'Iklan Reels dengan tren gaya hidup hijab modern.' },
    { id: '2', label: 'Consideration', active: true, details: 'Unduh katalog gratis bonus voucher diskon via WA.' },
    { id: '3', label: 'Conversion', active: true, details: 'Follow-up otomatis WA dalam 3 menit jika registrasi.' },
    { id: '4', label: 'Retention', active: false, details: 'Broadcast update model baru bulanan khusus member.' }
  ],
  budget: 15000000,
  timeline: '3 Bulan',
  blueprint: [
    {
      channel: 'Instagram Reels & IG Shopping',
      targetAudience: 'Wanita Muslimah urban umur 23-35 tahun, pengikut tren outfit modern.',
      message: 'Cantik seketika dalam kenyamanan optimal. Dapatkan koleksi Mentari Busana yang adem sepanjang hari.',
      kpi: 'Engagement Rate > 5% & CTR > 3%',
      cta: 'Belanja Koleksi Terbaru',
      details: 'Fokus pada micro-influencer lokal yang membuat video unboxing transisi cepat pakaian kasual.'
    },
    {
      channel: 'Facebook Carousel Catalog Ads',
      targetAudience: 'Pengunjung website yang mengeklik halaman detail koleksi gamis premium 14 hari terakhir.',
      message: 'Khusus Hijab Forward! Amankan stok gamis limited edition gratis bross dan tas serut premium.',
      kpi: '3.8x Return on Ad Spend (ROAS)',
      cta: 'Dapatkan Diskon 20%',
      details: 'Gunakan foto slide detail kualitas jahitan super rapi dan sertifikat bahan anti-lecek.'
    },
    {
      channel: 'WhatsApp Automation Sales Flow',
      targetAudience: 'Lead masuk dari form download katalog yang berskor AI > 70.',
      message: 'Terima kasih telah menyukai koleksi kami. Admin kami siap membantu pengukuran ukuran pakaian Anda!',
      kpi: '85% tingkat respons, Rasio penutupan (closing) > 18%',
      cta: 'Ukur Pakaianku Sekarang',
      details: 'Pengiriman panduan ukuran baju otomatis interaktif dengan tombol drop-down WA.'
    }
  ],
  budgetAllocation: [
    { name: 'Direct Ads (Meta)', value: 45, color: '#0A3D62' },
    { name: 'KOL / Influencer', value: 25, color: '#00A3E0' },
    { name: 'WhatsApp Sales Channel', value: 20, color: '#FFB400' },
    { name: 'Kreatif & Desain', value: 10, color: '#475569' }
  ],
  aiReasoning: 'Mengingat tingginya keterikatan wanita muslimah pada visual tren outfit selebgram, alokasi anggaran didominasi promosi Meta-Ads tertarget (45%) disusul kolaborasi konten kreator lokal (25%). Automasi tindak lanjut WhatsApp 20% mengamankan tingkat konversi prospek baru agar tidak menguap sia-sia.',
  createdAt: '2026-06-17 11:45'
};

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'contact_1',
    name: 'Andini Putri',
    email: 'andini.p@gmail.com',
    phone: '08123456789',
    status: 'Lead',
    lastInteraction: '2026-06-17 15:30',
    score: 88,
    scoreExplanation: 'Sangat prospektif. Mengisi kuesioner profil busana, mengeklik daftar tautan ukuran, dan menanyakan harga reseller lewat tombol WhatsApp 15 menit lalu.',
    segment: 'Reseller List',
    tags: ['Hot Lead', 'Interaksi Hari Ini', 'Fashionista'],
    notes: 'Tertarik membeli paket bundel reseller Mentari Busana. Menanyakan apakah ada subsidi ongkos kirim antarpulau.',
    activityHistory: [
      { date: '17 Jun 2026', title: 'Pre-sale Chat WA', desc: 'Menanyakan skema komisi reseller.', type: 'whatsapp' },
      { date: '17 Jun 2026', title: 'Lead Scored by AI', desc: 'AI menetapkan skor 88 berdasarkan kecepatan tanggapan.', type: 'system' },
      { date: '16 Jun 2026', title: 'Landing Page Visit', desc: 'Mengisi form download katalog Mentari Gamis.', type: 'web' }
    ],
    scoreHistory: [45, 50, 52, 60, 58, 65, 75, 88]
  },
  {
    id: 'contact_2',
    name: 'Budi Hartono',
    email: 'budi.hartono99@yahoo.com',
    phone: '08571212394',
    status: 'Customer',
    lastInteraction: '2026-06-16 10:15',
    score: 95,
    scoreExplanation: 'Telah melakukan pembelian pertamanya 2 hari lalu senilai Rp 1.500.000 dengan status pembayaran lunas. Penilaian loyalitas sangat prima.',
    segment: 'Kolektor Gamis',
    tags: ['Loyal', 'Kolektor Gamis'],
    notes: 'Kualitas pengemasan dipuji. Meminta didaftarkan ke grup member prioritas untuk pemesanan model terbatas lebih awal.',
    activityHistory: [
      { date: '16 Jun 2026', title: 'Payment Confirmed', desc: 'Sistem menyinkronkan pelunasan invoice Mentari-0921.', type: 'payment' },
      { date: '15 Jun 2026', title: 'Check Out Order', desc: 'Membeli Gamis Premium Sutra El-Zahra ukuran XL.', type: 'web' }
    ],
    scoreHistory: [80, 82, 85, 85, 90, 92, 95, 95]
  },
  {
    id: 'contact_3',
    name: 'Citra Kirana',
    email: 'citra.kirana@icloud.com',
    phone: '08198765432',
    status: 'Churn Risk',
    lastInteraction: '2026-05-12 11:20',
    score: 35,
    scoreExplanation: 'Skor menurun drastis karena tidak membuka pesan siaran WhatsApp bulanan selama 2 kali berturut-turut dan kunjungan profil terakhir tercatat lebih dari 30 hari lalu.',
    segment: 'Casual Buyers',
    tags: ['Inactive', 'Butuh Re-engagement'],
    notes: 'Pernah mengeluhkan keterlambatan waktu pengantaran kargo pada April lalu.',
    activityHistory: [
      { date: '12 May 2026', title: 'Promo WhatsApp Ignored', desc: 'Mengabaikan siaran promosi koleksi Idul Adha.', type: 'whatsapp' },
      { date: '15 Apr 2026', title: 'Support Ticket', desc: 'Mengeluhkan pengiriman ekspedisi terlambat 4 hari.', type: 'support' }
    ],
    scoreHistory: [85, 80, 70, 65, 50, 42, 38, 35]
  },
  {
    id: 'contact_4',
    name: 'Dedi Kurniawan',
    email: 'dedi_kurnia@outlook.com',
    phone: '08139898112',
    status: 'Lead',
    lastInteraction: '2026-06-17 18:45',
    score: 62,
    scoreExplanation: 'Prospek hangat (Warm). Mengunduh brosur diskon 10% namun belum meregistrasikan no ponselnya pada automasi WhatsApp.',
    segment: 'Retail Prospect',
    tags: ['Warm Lead', 'Interaksi Hari Ini'],
    notes: 'Menyarankan brosur dikirim otomatis ulang ke alamat emailnya besok pagi.',
    activityHistory: [
      { date: '17 Jun 2026', title: 'Email Brosur Sent', desc: 'Mengirimkan brosur fisik digital via email robot.', type: 'email' }
    ],
    scoreHistory: [50, 53, 53, 58, 60, 60, 58, 62]
  }
];

export const INITIAL_COMPETITORS: CompetitorData[] = [
  {
    id: 'comp_1',
    name: 'Zahra Muslimah Store',
    url: 'www.zahramuslimah.com',
    channelMix: [
      { name: 'Instagram & Facebook Paid Ads', spend: 55, color: '#0A3D62' },
      { name: 'TikTok Creator Marketplace', spend: 25, color: '#00A3E0' },
      { name: 'Shopee Affiliate & Program Live', spend: 15, color: '#FFB400' },
      { name: 'Google Search Ads (SEO)', spend: 5, color: '#475569' }
    ],
    pricingSnapshot: [
      { tier: 'Kerudung Instan Premium', price: 'Rp 69.000' },
      { tier: 'Tunik Daily Kasual', price: 'Rp 149.000' },
      { tier: 'Gamis Signature Silk', price: 'Rp 399.000' }
    ],
    metrics: {
      engagementRate: '5.2% (Sangat Aktif)',
      adSpendEst: 'Rp 20.000.000 – Rp 35.000.000 / bln',
      likesTrend: [350, 420, 500, 490, 610, 750]
    },
    socialAdSamples: [
      {
        headline: 'Promo Cuci Gudang Tengah Tahun Zahra!',
        channels: ['Meta Ads', 'Instagram Stories'],
        copy: 'Jangan sampai kehabisan gamis harian katun jepang yang super adem! Ratusan testimoni bintang 5 membuktikan nyaman dipakai seharian di rumah maupun kantor. Dapatkan promo buy 2 get 1 free!',
        imgPrompt: 'Two elegant models wearing colorful modern pastel hijabs, laughing in front of a minimalist aesthetic cafe storefront.'
      },
      {
        headline: 'Tampil Anggun Tanpa Gerah',
        channels: ['TikTok Shop Video Ads'],
        copy: 'Gamis Signature dengan satin silk asli yang mengalir lembut tapi tidak membentuk tubuh. Bebas ongkir hanya saat live streaming hari ini pukul 19:00 WIB!',
        imgPrompt: 'Close up of smooth premium satin fabric folds, soft warm dramatic lighting, studio background.'
      }
    ]
  },
  {
    id: 'comp_2',
    name: 'Al-Madina Hijab Hub',
    url: 'www.almadinahub.id',
    channelMix: [
      { name: 'Instagram & Facebook Paid Ads', spend: 35, color: '#0A3D62' },
      { name: 'TikTok Creator Marketplace', spend: 40, color: '#00A3E0' },
      { name: 'Shopee Affiliate & Program Live', spend: 15, color: '#FFB400' },
      { name: 'Google Search Ads (SEO)', spend: 10, color: '#475569' }
    ],
    pricingSnapshot: [
      { tier: 'Khimar Elegan Instan', price: 'Rp 85.000' },
      { tier: 'Abaya Signature Arab', price: 'Rp 279.000' },
      { tier: 'Mukena Sutra Renda', price: 'Rp 450.000' }
    ],
    metrics: {
      engagementRate: '3.9% (Normal)',
      adSpendEst: 'Rp 12.000.000 – Rp 18.000.000 / bln',
      likesTrend: [280, 260, 310, 390, 440, 480]
    },
    socialAdSamples: [
      {
        headline: 'Koleksi Safira Abaya Arab Premium',
        channels: ['Instagram Post Feed'],
        copy: 'Diproduksi langsung oleh pengrajin lokal berstandar butik Timur Tengah. Renda hitam eksklusif memberikan sentuhan elegan untuk acara formal maupun harian Anda. Hubungi WhatsApp Admin kami sekarang.',
        imgPrompt: 'Elegant model in an embroidered high-contrast black Saudi style kaftan standing under stone arches, cinematic look.'
      }
    ]
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch_1',
    name: 'VOXIA HQ - Jakarta Pusat',
    city: 'Jakarta Pusat',
    sales: 145000000,
    leads: 1240,
    usageCount: 82,
    status: 'excellent',
    coords: { x: 35, y: 55 },
    customSettings: {
      syncWithHQ: true,
      localPromosEnabled: false
    }
  },
  {
    id: 'branch_2',
    name: 'VOXIA Outlet - Surabaya Selatan',
    city: 'Surabaya',
    sales: 89000000,
    leads: 670,
    usageCount: 45,
    status: 'excellent',
    coords: { x: 74, y: 68 },
    customSettings: {
      syncWithHQ: true,
      localPromosEnabled: true
    }
  },
  {
    id: 'branch_3',
    name: 'VOXIA Distrik - Bandung Dago',
    city: 'Bandung',
    sales: 52000000,
    leads: 480,
    usageCount: 12,
    status: 'warning',
    coords: { x: 42, y: 62 },
    customSettings: {
      syncWithHQ: false,
      localPromosEnabled: true
    }
  },
  {
    id: 'branch_4',
    name: 'VOXIA Pop-up - Medan Sunggal',
    city: 'Medan',
    sales: 18000000,
    leads: 190,
    usageCount: 8,
    status: 'critical',
    coords: { x: 15, y: 35 },
    customSettings: {
      syncWithHQ: true,
      localPromosEnabled: false
    }
  }
];
