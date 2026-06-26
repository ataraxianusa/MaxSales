import React from "react";
import { ArrowLeft, Building2, MapPin, Globe, Mail, Phone } from "lucide-react";

interface AboutPageProps {
  onBack: () => void;
}

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Tentang Kami</h1>
          <div className="w-12 h-1 bg-emerald-500 rounded-full"></div>
        </div>

        {/* Company Info */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">PT. Gen Indo Kreatif</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              PT. Gen Indo Kreatif adalah perusahaan teknologi yang berpusat di Surabaya, Indonesia. 
              Kami berkomitmen untuk memberdayakan UMKM dan pengusaha lokal melalui solusi berbasis 
              kecerdasan buatan (AI) yang praktis dan mudah digunakan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Visi Kami</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Menjadi mitra teknologi terpercaya bagi pengusaha Indonesia dalam mengoptimalkan 
              penjualan dan pertumbuhan bisnis melalui solusi AI yang terjangkau dan efektif.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Misi Kami</h2>
            <ul className="space-y-3 text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                <span>Menyediakan solusi AI yang mudah diakses oleh UMKM Indonesia</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                <span>Membantu pengusaha membuat keputusan bisnis berbasis data</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></span>
                <span>Mendukung pertumbuhan ekonomi digital Indonesia</span>
              </li>
            </ul>
          </section>

          {/* Contact Info */}
          <section className="p-6 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#111111]">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Hubungi Kami</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span>PT. Gen Indo Kreatif</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Surabaya, Jawa Timur, Indonesia</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>www.maxxsales.id</span>
              </div>
              <div className="flex items-center space-x-3 text-neutral-600 dark:text-neutral-400">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>support@maxxsales.id</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
