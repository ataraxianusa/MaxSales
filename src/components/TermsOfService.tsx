import React from "react";
import { ArrowLeft } from "lucide-react";

interface LegalPageProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Syarat & Ketentuan</h1>
          <p className="text-sm text-neutral-500">Terakhir diperbarui: 26 Juni 2026</p>
          <div className="w-12 h-1 bg-emerald-500 rounded-full mt-4"></div>
        </div>

        <div className="space-y-8 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">1. Penerimaan Syarat</h2>
            <p>Dengan mengakses dan menggunakan MaxxSales ("Layanan"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju, mohon untuk tidak menggunakan Layanan.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">2. Deskripsi Layanan</h2>
            <p>MaxxSales adalah Sistem Operasi Pertumbuhan Bisnis berbasis AI yang menyediakan fitur analisis kompetitor, insight pelanggan, strategi bisnis, generator konten, dan daily pulse untuk membantu pengusaha mengoptimalkan penjualan.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">3. Akun Pengguna</h2>
            <p>Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda dan semua aktivitas yang terjadi di bawah akun Anda. Anda harus segera memberi tahu kami jika ada penggunaan akun Anda yang tidak sah.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">4. Penggunaan yang Dilarang</h2>
            <p>Anda tidak diperbolehkan untuk:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Menggunakan Layanan untuk tujuan ilegal atau tidak sah</li>
              <li>Mencoba mendapatkan akses tidak sah ke sistem kami</li>
              <li>Mengganggu atau merusak integritas Layanan</li>
              <li>Menggunakan Layanan untuk menipu atau menyesatkan pihak lain</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">5. Hak Kekayaan Intelektual</h2>
            <p>Seluruh konten, fitur, dan fungsionalitas Layanan adalah milik PT. Gen Indo Kreatif dan dilindungi oleh hukum hak cipta, merek dagang, dan hukum kekayaan intelektual lainnya.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">6. Pembatalan</h2>
            <p>Anda dapat membatalkan langganan Anda kapan saja. Pembatalan akan berlaku pada akhir periode penagihan saat ini. Tidak ada pengembalian dana proporsional untuk periode yang belum terpakai.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">7. Batasan Tanggung Jawab</h2>
            <p>PT. Gen Indo Kreatif tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari penggunaan Layanan. Kami tidak menjamin hasil spesifik dari penggunaan Layanan.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">8. Perubahan Syarat</h2>
            <p>Kami berhak mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku efektif segera setelah diposting di Layanan. Penggunaan Layanan setelah perubahan merupakan penerimaan Anda terhadap syarat yang diperbarui.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">9. Hukum yang Berlaku</h2>
            <p>Syarat dan Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap sengketa akan diselesaikan di pengadilan yang berwenang di Surabaya, Indonesia.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">10. Kontak</h2>
            <p>Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di support@maxxsales.id</p>
          </section>
        </div>
      </div>
    </div>
  );
}
