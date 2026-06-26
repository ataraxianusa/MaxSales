import React from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface LegalPageProps {
  onBack: () => void;
}

export default function RiskDisclosure({ onBack }: LegalPageProps) {
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Pernyataan Risiko</h1>
          <p className="text-sm text-neutral-500">Terakhir diperbarui: 26 Juni 2026</p>
          <div className="w-12 h-1 bg-emerald-500 rounded-full mt-4"></div>
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 mb-8 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Penting untuk Dibaca</h3>
            <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
              Layanan ini menggunakan kecerdasan buatan (AI) yang menghasilkan rekomendasi berdasarkan data yang Anda masukkan. Hasil dapat bervariasi dan tidak menjamin keberhasilan bisnis.
            </p>
          </div>
        </div>

        <div className="space-y-8 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">1. Batasan AI</h2>
            <p>MaxxSales menggunakan model bahasa AI untuk menghasilkan analisis, rekomendasi, dan konten. Perlu dipahami bahwa:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>AI menghasilkan prediksi berdasarkan pola data, bukan kepastian</li>
              <li>Rekomendasi AI harus dievaluasi dan disesuaikan dengan kondisi bisnis Anda</li>
              <li>AI dapat menghasilkan informasi yang tidak akurat atau tidak lengkap</li>
              <li>Keputusan bisnis akhir tetap menjadi tanggung jawab Anda</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">2. Risiko Penggunaan</h2>
            <p>Penggunaan layanan ini memiliki risiko termasuk namun tidak terbatas pada:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Keputusan bisnis berdasarkan data yang tidak sepenuhnya akurat</li>
              <li>Ketergantungan berlebihan pada rekomendasi AI</li>
              <li>Perubahan kondisi pasar yang tidak terprediksi</li>
              <li>Persaingan bisnis yang dinamis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">3. Tidak Ada Jaminan Hasil</h2>
            <p>PT. Gen Indo Kreatif tidak menjamin:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Peningkatan penjualan atau pendapatan</li>
              <li>Keberhasilan strategi bisnis yang direkomendasikan</li>
              <li>Akurasi analisis kompetitor atau pasar</li>
              <li>Ketersediaan layanan tanpa gangguan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">4. Tanggung Jawab Pengguna</h2>
            <p>Sebagai pengguna, Anda bertanggung jawab untuk:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Memverifikasi keakuratan data yang dimasukkan</li>
              <li>Mengevaluasi rekomendasi AI sebelum mengambil keputusan</li>
              <li>Mencari nasihat profesional jika diperlukan</li>
              <li>Menggunakan layanan ini sebagai alat bantu, bukan satu-satunya dasar keputusan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">5. Keterbatasan Tanggung Jawab</h2>
            <p>Dalam batas yang diizinkan oleh hukum, PT. Gen Indo Kreatif tidak bertanggung jawab atas:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Kerugian langsung atau tidak langsung</li>
              <li>Kehilangan keuntungan atau pendapatan</li>
              <li>Kehilangan data atau bisnis</li>
              <li>Dampak dari keputusan bisnis yang diambil berdasarkan layanan ini</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">6. Data dan Privasi</h2>
            <p>Data bisnis Anda disimpan lokal di browser Anda. Kami tidak bertanggung jawab atas kehilangan data akibat:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Penghapusan cache atau cookie browser</li>
              <li>Perangkat yang hilang atau rusak</li>
              <li>Akses tidak sah ke perangkat Anda</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">7. Perubahan Layanan</h2>
            <p>Kami berhak mengubah, menangguhkan, atau menghentikan layanan ini kapan saja tanpa pemberitahuan sebelumnya.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">8. Persetujuan</h2>
            <p>Dengan menggunakan MaxxSales, Anda mengakui telah membaca, memahami, dan setuju untuk terikat oleh Pernyataan Risiko ini.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">9. Kontak</h2>
            <p>Jika Anda memiliki pertanyaan tentang Pernyataan Risiko ini, silakan hubungi kami di support@maxxsales.id</p>
          </section>
        </div>
      </div>
    </div>
  );
}
