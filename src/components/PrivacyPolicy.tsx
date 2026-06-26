import React from "react";
import { ArrowLeft } from "lucide-react";

interface LegalPageProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: LegalPageProps) {
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Kebijakan Privasi</h1>
          <p className="text-sm text-neutral-500">Terakhir diperbarui: 26 Juni 2026</p>
          <div className="w-12 h-1 bg-emerald-500 rounded-full mt-4"></div>
        </div>

        <div className="space-y-8 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan informasi berikut:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Informasi Akun:</strong> Nama, alamat email, dan foto profil dari akun Google Anda</li>
              <li><strong>Data Bisnis:</strong> Informasi produk, kompetitor, dan data bisnis lainnya yang Anda masukkan</li>
              <li><strong>Data Penggunaan:</strong> Informasi tentang bagaimana Anda menggunakan Layanan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">2. Penggunaan Informasi</h2>
            <p>Kami menggunakan informasi yang dikumpulkan untuk:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Menyediakan dan memelihara Layanan</li>
              <li>Meningkatkan dan mengoptimalkan Layanan</li>
              <li>Menganalisis penggunaan Layanan</li>
              <li>Mengirimkan komunikasi terkait Layanan</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">3. Penyimpanan Data</h2>
            <p>Data Anda disimpan secara lokal di browser Anda menggunakan localStorage. Kami tidak menyimpan data bisnis Anda di server kami. Data hanya dikirim ke API AI (OpenRouter) saat Anda meminta analisis atau generate konten.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">4. Berbagi Informasi</h2>
            <p>Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi dengan:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Penyedia layanan AI (OpenRouter) untuk memproses permintaan Anda</li>
              <li>Pihak berwenang jika diwajibkan oleh hukum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">5. Keamanan Data</h2>
            <p>Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi Anda. Namun, tidak ada metode transmisi internet atau penyimpanan elektronik yang 100% aman.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">6. Hak Anda</h2>
            <p>Anda memiliki hak untuk:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Mengakses data pribadi Anda</li>
              <li>Memperbaiki data yang tidak akurat</li>
              <li>Menghapus data Anda dari Layanan</li>
              <li>Membatalkan langganan Anda</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">7. Cookie</h2>
            <p>Kami menggunakan cookie dan teknologi serupa untuk meningkatkan pengalaman Anda menggunakan Layanan. Anda dapat mengontrol cookie melalui pengaturan browser Anda.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">8. Perubahan Kebijakan</h2>
            <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diposting di halaman ini dengan tanggal yang diperbarui.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">9. Kontak</h2>
            <p>Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di support@maxxsales.id</p>
          </section>
        </div>
      </div>
    </div>
  );
}
