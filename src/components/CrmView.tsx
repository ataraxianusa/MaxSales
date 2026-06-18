/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Contact, AutomationNode } from '../types';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  MessageSquare,
  Tag,
  ChevronRight,
  UserCheck,
  Zap,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  Award,
  CircleDot,
  Trash2,
  Check,
  Send,
  Database,
  Briefcase,
  Play,
  Download
} from 'lucide-react';

interface CrmViewProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  addToast: (msg: string, type: 'success' | 'error' | 'warning') => void;
}

const renderSparkline = (history?: number[], width = 55, height = 18) => {
  if (!history || history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const points = history
    .map((val, index) => {
      const x = (index / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2; // pad 2px top/bottom
      return `${x},${y}`;
    })
    .join(' ');

  const isUp = history[history.length - 1] >= history[0];
  const strokeColor = isUp ? '#10b981' : '#f43f5e'; // emerald green or rose red

  return (
    <svg width={width} height={height} className="overflow-visible inline-block cursor-help shrink-0" title={`Trend 30 hari: ${history.join(' → ')}`}>
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={width}
        cy={height - ((history[history.length - 1] - min) / range) * (height - 4) - 2}
        r="2"
        className={isUp ? "fill-emerald-400 animate-pulse" : "fill-rose-400 animate-pulse"}
      />
    </svg>
  );
};

export default function CrmView({
  contacts,
  setContacts,
  addToast
}: CrmViewProps) {
  // Query Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Lead' | 'Qualified' | 'Won' | 'Lost' | 'Customer' | 'Churn Risk'>('All');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [scoreRange, setScoreRange] = useState<number>(0);
  const [tagFilter, setTagFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'default' | 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc'>('default');

  // Add Contact Form Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactStatus, setNewContactStatus] = useState<'Lead' | 'Qualified' | 'Won' | 'Lost' | 'Customer' | 'Churn Risk'>('Lead');
  const [newContactSegment, setNewContactSegment] = useState('Retail Prospect');
  const [newContactTags, setNewContactTags] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');

  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) {
      addToast('Nama kontak wajib diisi!', 'warning');
      return;
    }

    const tagArray = newContactTags
      ? newContactTags.split(',').map(tag => tag.trim()).filter(Boolean)
      : ['Tambah Manual'];

    const defaultScore = Math.floor(Math.random() * 30) + 45; // 45 to 75
    const seedTrend = [
      defaultScore - 8 > 0 ? defaultScore - 8 : 10,
      defaultScore - 3 > 0 ? defaultScore - 3 : 20,
      defaultScore
    ];

    const newContact: Contact = {
      id: `contact_${Date.now()}`,
      name: newContactName,
      email: newContactEmail.trim() || `${newContactName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: newContactPhone.trim() || ('0812' + Math.floor(Math.random() * 90000000 + 10000000)),
      status: newContactStatus,
      lastInteraction: 'Hari Ini',
      score: defaultScore,
      scoreHistory: seedTrend,
      scoreExplanation: 'Kontak berhasil dibuat secara manual. Silakan gunakan AI Evaluation untuk memindai kepatutan lebih presisi.',
      segment: newContactSegment,
      tags: tagArray,
      notes: newContactNotes.trim() || 'Daftar entri manual melalui form CRM.',
      activityHistory: [
        {
          date: 'Hari Ini',
          title: 'Kontak Dibuat',
          desc: 'Entri informasi kontak baru ditambahkan secara manual melalui CRM pusat.',
          type: 'system'
        }
      ]
    };

    setContacts([newContact, ...contacts]);
    addToast(`Kontak "${newContactName}" berhasil ditambahkan!`, 'success');

    // Reset states
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactStatus('Lead');
    setNewContactSegment('Retail Prospect');
    setNewContactTags('');
    setNewContactNotes('');
    setIsAddModalOpen(false);
  };

  // Selected contacts bulk list
  const [selectedContactIds, setSelectedContactIds] = useState<Record<string, boolean>>({});

  // Slide-out detailed contact panel
  const [activeContactPanel, setActiveContactPanel] = useState<Contact | null>(null);
  const [panelActiveTab, setPanelActiveTab] = useState<'overview' | 'automation' | 'notes'>('overview');

  // Notes state
  const [activeContactNotesInput, setActiveContactNotesInput] = useState('');
  // Loading evaluation indicators
  const [isEvaluatingScore, setIsEvaluatingScore] = useState(false);

  // Automation workflows representation parameters
  const [automationNodes, setAutomationNodes] = useState<AutomationNode[]>([
    { id: '1', type: 'trigger', label: 'Bila AI-Score Kontak > 80', color: 'bg-emerald-500 text-white', icon: 'zap', config: { minScore: 80 } },
    { id: '2', type: 'action', label: 'Kirim Autosilabus WhatsApp via Twilio', color: 'bg-blue-600 text-white', icon: 'message-square', config: { template: 'welcome_vocia' } },
    { id: '3', type: 'action', label: 'Beri Tag khusus: "Hot Reseller"', color: 'bg-[#FFB400] text-slate-900', icon: 'tag', config: { tag: 'Hot Reseller' } }
  ]);

  // Bulk actions triggers
  const executeBulkAction = (action: 'email' | 'tag' | 'whatsapp') => {
    const list = Object.keys(selectedContactIds).filter((k) => selectedContactIds[k]);
    if (list.length === 0) {
      addToast('Silakan centang kontak terlebih dahulu!', 'warning');
      return;
    }
    if (action === 'email') {
      addToast(`Autoposting Email Broadcast dikirim ke ${list.length} kontak!`, 'success');
    } else if (action === 'tag') {
      addToast(`Disematkan Tag "Campaign Match" ke ${list.length} kontak!`, 'success');
    } else if (action === 'whatsapp') {
      addToast(`Mengirimkan Tautan Promo WhatsApp Blast ke ${list.length} penerima.`, 'success');
    }
    setSelectedContactIds({});
  };

  const toggleSelectAll = () => {
    const allFiltered = sortedContacts;
    const isAllSelected = allFiltered.length > 0 && allFiltered.every((c) => selectedContactIds[c.id]);
    
    const updated: Record<string, boolean> = {};
    if (!isAllSelected) {
      allFiltered.forEach((c) => {
        updated[c.id] = true;
      });
    }
    setSelectedContactIds(updated);
  };

  // Evaluate lead score dynamically using live API Gemini scorer or fake backup
  const evaluateLeadScore = async (contact: Contact) => {
    setIsEvaluatingScore(true);
    addToast('Menghubungkan asisten analisis VOXIA AI...', 'success');

    try {
      const response = await fetch('/api/evaluate-lead-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contactName: contact.name,
          email: contact.email,
          phone: contact.phone,
          notes: contact.notes,
          status: contact.status
        })
      });

      const data = await response.json();

      setTimeout(() => {
        setIsEvaluatingScore(false);
        const updatedContacts = contacts.map((c) =>
          c.id === contact.id
            ? {
                ...c,
                score: data.score,
                scoreExplanation: data.scoreExplanation
              }
            : c
        );
        setContacts(updatedContacts);
        
        // Live refresh panel
        const currentRefreshed = updatedContacts.find((c) => c.id === contact.id);
        if (currentRefreshed) {
          setActiveContactPanel(currentRefreshed);
        }
        
        addToast(`Lead score berhasil dihitung: ${data.score}`, 'success');
      }, 2500);

    } catch (e) {
      console.error(e);
      setTimeout(() => {
        setIsEvaluatingScore(false);
        addToast('Gagal memproses penilaian AI. Terjadi kesalahan jaringan.', 'error');
      }, 2005);
    }
  };

  // Update notes of single contact
  const saveContactNotes = (contactId: string) => {
    if (!activeContactNotesInput.trim()) {
      addToast('Catatan tidak boleh kosong!', 'warning');
      return;
    }

    const newActivity = {
      date: 'Hari Ini',
      title: 'Catatan Admin Ditambahkan',
      desc: activeContactNotesInput,
      type: 'notes'
    };

    const updatedContacts = contacts.map((c) =>
      c.id === contactId
        ? {
            ...c,
            notes: activeContactNotesInput,
            activityHistory: [newActivity, ...c.activityHistory]
          }
        : c
    );

    setContacts(updatedContacts);
    const updatedModel = updatedContacts.find((c) => c.id === contactId);
    if (updatedModel) {
      setActiveContactPanel(updatedModel);
    }
    setActiveContactNotesInput('');
    addToast('Catatan tersimpan secara optimis!', 'success');
  };

  // Drag simulation nodes creation
  const addAutomationNode = (type: 'action' | 'condition') => {
    const freshNode: AutomationNode = {
      id: `node_${Date.now()}`,
      type,
      label: type === 'condition' ? 'Bila pembelian koleksi Abaya' : 'Kirim kupon diskon 15%',
      color: type === 'condition' ? 'bg-[#FFB400] text-slate-900 border' : 'bg-cyan-600 text-white',
      icon: type === 'condition' ? 'Layers' : 'Send',
      config: {}
    };
    setAutomationNodes([...automationNodes, freshNode]);
    addToast('Node langkah automasi baru ditarik ke kanvas!', 'success');
  };

  // Extract all unique tags
  const allTags = Array.from(
    new Set(contacts.flatMap((c) => c.tags || []))
  ).filter(Boolean);

  // Filter pipeline rulesets
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || contact.status === statusFilter;
    const matchesSegment = segmentFilter === 'All' || contact.segment === segmentFilter;
    const matchesScore = contact.score >= scoreRange;
    const matchesTag = tagFilter === 'All' || (contact.tags && contact.tags.includes(tagFilter));

    return matchesSearch && matchesStatus && matchesSegment && matchesScore && matchesTag;
  });

  // Secondary Sort pipeline
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === 'score-desc') return b.score - a.score;
    if (sortBy === 'score-asc') return a.score - b.score;
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0; // Default order
  });

  // CSV Export utility
  const exportToCSV = () => {
    if (sortedContacts.length === 0) {
      addToast('Tidak ada kontak untuk diekspor!', 'error');
      return;
    }
    const headers = ['Nama', 'Email', 'No. HP', 'Status', 'Segmen', 'Skor', 'Tag', 'Catatan', 'Interaksi Terakhir'];
    const csvRows = [headers.join(',')];

    for (const c of sortedContacts) {
      const row = [
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.email.replace(/"/g, '""')}"`,
        `"${c.phone.replace(/"/g, '""')}"`,
        `"${c.status.replace(/"/g, '""')}"`,
        `"${c.segment.replace(/"/g, '""')}"`,
        c.score,
        `"${(c.tags || []).join(', ').replace(/"/g, '""')}"`,
        `"${(c.notes || '').replace(/"/g, '""')}"`,
        `"${c.lastInteraction.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\r\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `voxia_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Berhasil mengekspor ${sortedContacts.length} kontak ke CSV!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Analytics Snapshot Header Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
            Total Kontak Terdaftar
          </span>
          <span className="text-2xl font-extrabold text-slate-850 dark:text-white mt-1 block">
            {(contacts.length + 84).toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">
             Ada kenaikan 14% dari m-lalu
          </span>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
            Konversi Pipeline
          </span>
          <span className="text-2xl font-extrabold text-[#00A3E0] mt-1 block">
            18.5%
          </span>
          <span className="text-[10px] text-slate-400 block font-medium mt-1">
            Status prima sejenis CRM raksasa
          </span>
        </div>

        <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
            Rata Waktu Tanggapan (Response Time)
          </span>
          <span className="text-2xl font-extrabold text-amber-500 mt-1 block">
            1.8 Menit
          </span>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1">
            🚀 Turun 80% berkat Automasi AI
          </span>
        </div>
      </div>

      {/* Real-time CRM Statistics Widget */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-150 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#00A3E0]/10 text-[#00A3E0]">
              <CircleDot size={15} className="animate-pulse" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-850 dark:text-white font-mono flex items-center gap-1.5">
                Widget Statistik CRM <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-mono font-bold">Real-time</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Indikator volume prospek potensial dan performa nilai evaluasi kecocokan CS.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-400">
            Terhubung & Terenkripsi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Prospek */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
                🎯 Total Prospek (Leads)
              </span>
              <span className="text-2xl font-black text-slate-850 dark:text-white mt-1 block font-mono">
                {contacts.filter(c => c.status === 'Lead').length.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[9.5px] text-slate-400 mt-2">
              Hubungan tahap awal potensial
            </p>
          </div>

          {/* Rata-rata Skor Prospek */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
                ⭐ Rata-Rata Skor Prospek
              </span>
              <span className="text-2xl font-black text-amber-500 mt-1 block font-mono">
                {contacts.length > 0 
                  ? Math.round(contacts.map(c => c.score).reduce((a, b) => a + b, 0) / contacts.length) 
                  : 0} <span className="text-[11px] text-slate-400 font-bold">PTS</span>
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-[9.5px] text-slate-400">Kualitas AI</span>
              {contacts.length > 0 && (
                <div className="h-1.5 w-16 bg-slate-150 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, Math.max(10, contacts.length > 0 
                        ? Math.round(contacts.map(c => c.score).reduce((a, b) => a + b, 0) / contacts.length) 
                        : 0))}%` 
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Qualified Hot prospects */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
                🔥 Hot Prospects (Score &gt;= 70)
              </span>
              <span className="text-2xl font-black text-rose-500 mt-1 block font-mono">
                {contacts.filter(c => c.score >= 70).length.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[9.5px] text-rose-500/90 font-medium mt-2">
              Kecocokan transaksi tinggi
            </p>
          </div>

          {/* Won prospects / Customers */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
                💼 Deals Berhasil (Won)
              </span>
              <span className="text-2xl font-black text-[#00A3E0] mt-1 block font-mono">
                {contacts.filter(c => c.status === 'Won' || c.status === 'Customer').length.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[9.5px] text-emerald-500 font-medium mt-2">
              Konversi deal lancar
            </p>
          </div>
        </div>
      </div>

      {/* Main CRM Content Table and Panel */}
      <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
        {/* Toolbar: Search input, filter buttons, bulk triggers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Input bar */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Cari prospek (nama/email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
              />
            </div>

            {/* Status filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-702 text-slate-700 dark:text-stone-300 font-semibold focus:outline-none"
            >
              <option value="All">Semua Status</option>
              <option value="Lead">Lead</option>
              <option value="Qualified">Qualified</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Customer">Customer</option>
              <option value="Churn Risk">Churn Risk</option>
            </select>

            {/* Score Filters Slider select */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg bg-orange-50/10 dark:bg-slate-900/30 text-xs">
              <span className="text-slate-400 font-bold select-none text-[10px]">Min Score:</span>
              <span className="font-mono text-[#0A3D62] dark:text-cyan-400 font-bold">{scoreRange}+</span>
              <input
                type="range"
                min="0"
                max="90"
                step="10"
                value={scoreRange}
                onChange={(e) => setScoreRange(Number(e.target.value))}
                className="w-16 h-1 bg-slate-200 rounded-lg accent-[#0A3D62]"
              />
            </div>

            {/* Filter by Tag dropdown */}
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-stone-300 font-semibold focus:outline-none focus:border-[#00A3E0]"
            >
              <option value="All">Semua Tag</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>🏷️ Tag: {tag}</option>
              ))}
            </select>

            {/* Sort Dropdown options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-950 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-stone-300 font-semibold focus:outline-none focus:border-[#00A3E0]"
            >
              <option value="default">↕️ Urutkan: Bawaan</option>
              <option value="score-desc">🔥 Skor: Tertinggi</option>
              <option value="score-asc">📉 Skor: Terendah</option>
              <option value="name-asc">🔤 Nama: A - Z</option>
              <option value="name-desc">🔤 Nama: Z - A</option>
            </select>
          </div>

          {/* Bulk triggers actionable buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => executeBulkAction('whatsapp')}
              className="px-3 py-2 border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-stone-300 text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare size={13} className="text-emerald-500" /> WhatsApp Blast
            </button>
            <button
              onClick={() => executeBulkAction('email')}
              className="px-3 py-2 border border-slate-200 dark:border-slate-705 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-stone-300 text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Mail size={13} className="text-[#00A3E0]" /> Email Broadcast
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#00A3E0] to-[#0A3D62] hover:opacity-90 active:scale-95 text-white text-[11px] font-extrabold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#00A3E0]/10 transition-all"
            >
              <Plus size={13} className="stroke-[3px]" /> Tambah Kontak
            </button>
            <button
              onClick={() => {
                const name = prompt('Masukkan nama kontak baru:');
                if (name) {
                  const newContact: Contact = {
                    id: `contact_${Date.now()}`,
                    name,
                    email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
                    phone: '0812' + Math.floor(Math.random() * 90000000 + 10000000),
                    status: 'Lead',
                    lastInteraction: 'Hari Ini',
                    score: 50,
                    scoreExplanation: 'Telah diregistrasikan. AI menyarankan analisis interaksi WA lanjutan.',
                    segment: 'Retail Prospect',
                    tags: ['Prospek Tambah Manual'],
                    notes: 'Prospek diimpor manual.',
                    activityHistory: [{ date: 'Hari Ini', title: 'Register', desc: 'Kontak berhasil diimpor manual.', type: 'system' }]
                  };
                  setContacts([newContact, ...contacts]);
                  addToast('Prospek baru berhasil diimpor!', 'success');
                }
              }}
              className="px-3 py-2 border border-slate-201 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-705 dark:text-stone-300 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Users size={12} /> Import Cepat
            </button>
            <button
              onClick={exportToCSV}
              className="px-3 py-2 border border-slate-201 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-stone-300 text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
              title="Ekspor daftar kontak saat ini ke file CSV"
            >
              <Download size={13} className="text-[#00A3E0]" /> Ekspor CSV
            </button>
          </div>
        </div>

        {/* Database List Contacts Table */}
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 text-slate-500 font-bold">
                <th className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={sortedContacts.length > 0 && sortedContacts.every((c) => selectedContactIds[c.id])}
                    onChange={toggleSelectAll}
                    className="rounded text-[#00A3E0]"
                  />
                </th>
                <th className="p-3">Nama Kontak / Label Tag</th>
                <th className="p-3">Email / HP</th>
                <th className="p-3">Status</th>
                <th className="p-3">Kelompok Segmen</th>
                <th className="p-3 text-center">AI Lead-Score</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedContacts.map((contact) => {
                const isSelected = !!selectedContactIds[contact.id];
                // Color formatting of score
                let scoreColor = 'text-green-600 font-extrabold bg-green-50 border-green-100 dark:bg-green-950/20 dark:text-green-400';
                if (contact.score < 50) {
                  scoreColor = 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400';
                } else if (contact.score < 75) {
                  scoreColor = 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400';
                }

                // Status Badger colors
                let statusBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                if (contact.status === 'Qualified') {
                  statusBadge = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                } else if (contact.status === 'Won') {
                  statusBadge = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                } else if (contact.status === 'Lost') {
                  statusBadge = 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
                } else if (contact.status === 'Customer') {
                  statusBadge = 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
                } else if (contact.status === 'Churn Risk') {
                  statusBadge = 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
                } else if (contact.status === 'Lead') {
                  statusBadge = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                }

                return (
                  <tr
                    key={contact.id}
                    onClick={() => {
                      setActiveContactPanel(contact);
                      setPanelActiveTab('overview');
                    }}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-50/10' : ''
                    }`}
                  >
                    <td
                      className="p-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContactIds({
                          ...selectedContactIds,
                          [contact.id]: !isSelected
                        });
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Controlled by outer TD element
                        className="rounded text-[#00A3E0]"
                      />
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800 dark:text-white block hover:text-[#00A3E0] transition-colors">{contact.name}</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {contact.tags && contact.tags.map((tg) => {
                          const isTagActive = tagFilter === tg;
                          return (
                            <span
                              key={tg}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTagFilter(isTagActive ? 'All' : tg);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-medium border cursor-pointer select-none transition-all duration-150 ${
                                isTagActive
                                  ? 'bg-[#00A3E0]/20 text-[#00A3E0] border-[#00A3E0]/40 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-900 hover:bg-[#00A3E0]/15 text-slate-400 hover:text-white border-transparent'
                              }`}
                              title={`Klik untuk filter tag: ${tg}`}
                            >
                              🏷️ {tg}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 font-mono">
                      {contact.phone}
                    </td>
                    <td className="p-3 text-slate-600">
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wide border ${statusBadge}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {contact.segment}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[11px] rounded-md border font-bold inline-block font-mono ${scoreColor}`}>
                          🎯 {contact.score}
                        </span>
                        {renderSparkline(contact.scoreHistory)}
                      </div>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setActiveContactPanel(contact);
                          setPanelActiveTab('overview');
                        }}
                        className="p-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-black hover:border-slate-350 dark:hover:text-stone-100 border rounded cursor-pointer transition-all"
                      >
                        Detail Drawer
                      </button>
                    </td>
                  </tr>
                );
              })}

              {sortedContacts.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan prospek dengan filter pengingat / pencarian aktif.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRM SLIDE-OUT DETAIL PLANEL */}
      {activeContactPanel && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 flex flex-col justify-between border-l border-slate-100 dark:border-slate-800 animate-slideIn">
          <div className="flex-1 overflow-y-auto space-y-5 pb-6">
            {/* Header: Avatar, Name, Score and Close Trigger */}
            <div className="flex justify-between items-start border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                  alt={activeContactPanel.name}
                  className="w-12 h-12 rounded-full border border-slate-100 object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-950 dark:text-white uppercase leading-tight">
                    {activeContactPanel.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ID Prospek: {activeContactPanel.id}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => evaluateLeadScore(activeContactPanel)}
                  disabled={isEvaluatingScore}
                  className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                  title="Recalculate lead scoring utilizing AI"
                >
                  <Sparkles size={11} className={isEvaluatingScore ? 'animate-spin' : ''} /> AI Evaluation
                </button>
                <button
                  onClick={() => setActiveContactPanel(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Inner Subtabs Overview/Automation/Notes */}
            <div className="flex border-b text-xs border-slate-100 dark:border-slate-800 my-2 bg-slate-50/40 dark:bg-slate-900/40 rounded p-1">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'automation', label: 'Automation Canvas' },
                { id: 'notes', label: 'Notes' }
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setPanelActiveTab(tb.id as any)}
                  className={`flex-1 py-1.5 rounded-md text-center font-bold font-sans transition ${
                    panelActiveTab === tb.id
                      ? 'bg-white dark:bg-slate-850 text-[#0A3D62] dark:text-cyan-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            {/* Content Tab: OVERVIEW */}
            {panelActiveTab === 'overview' && (
              <div className="space-y-4 text-xs animate-fadeIn">
                {/* Score explain widget */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400">
                    <span>AI SCORING ANALYSIS RATIONALE</span>
                    <span>SCORE: {activeContactPanel.score}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                    {activeContactPanel.scoreExplanation || "Skor sedang dalam inisiasi database."}
                  </p>
                </div>

                {activeContactPanel.scoreHistory && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#00A3E0]">
                      <span>TREN AKTIVITAS KETERIKATAN 30 HARI</span>
                      <span>{activeContactPanel.scoreHistory[activeContactPanel.scoreHistory.length - 1] >= activeContactPanel.scoreHistory[0] ? '📈 POSITIF' : '📉 MENURUN'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 p-1">
                      {renderSparkline(activeContactPanel.scoreHistory, 110, 28)}
                      <div className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal flex-1">
                        Skor keterikatan berkembang dari <strong className="font-mono">{activeContactPanel.scoreHistory[0]} pt</strong> di awal bulan menjadi <strong className="font-mono text-emerald-500 dark:text-[#00A3E0] font-bold">{activeContactPanel.scoreHistory[activeContactPanel.scoreHistory.length - 1]} pt</strong> hari ini.
                      </div>
                    </div>
                  </div>
                )}

                {/* Logistics */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">
                    Informasi Kontak
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-slate-600 font-medium">
                    <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200/50">
                      <span className="block text-[8px] text-slate-400 uppercase">E-Mail Rekanan</span>
                      <span className="truncate block font-bold mt-0.5 text-slate-950 dark:text-stone-200">{activeContactPanel.email}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200/50">
                      <span className="block text-[8px] text-slate-400 uppercase">WhatsApp No</span>
                      <span className="block font-bold mt-0.5 text-slate-950 dark:text-stone-200">{activeContactPanel.phone}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200/50">
                      <span className="block text-[8px] text-slate-400 uppercase">Segmen</span>
                      <span className="block font-bold mt-0.5 text-slate-950 dark:text-stone-200">{activeContactPanel.segment}</span>
                    </div>
                    <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200/50">
                      <span className="block text-[8px] text-slate-400 uppercase">Interaksi Terakhir</span>
                      <span className="block font-bold mt-0.5 text-slate-950 dark:text-stone-200 font-mono text-[10px]">{activeContactPanel.lastInteraction}</span>
                    </div>
                    {/* Editable status dropdown inside the slide-out panel */}
                    <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200/50">
                      <span className="block text-[8px] text-[#00A3E0] uppercase font-bold">Status Hubungan</span>
                      <select
                        value={activeContactPanel.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          const updatedContacts = contacts.map(c => c.id === activeContactPanel.id ? { ...c, status: newStatus } : c);
                          setContacts(updatedContacts);
                          setActiveContactPanel({ ...activeContactPanel, status: newStatus });
                          addToast(`Status ${activeContactPanel.name} dimutakhirkan ke ${newStatus}!`, 'success');
                        }}
                        className="w-full bg-transparent font-bold mt-0.5 text-slate-950 dark:text-stone-200 focus:outline-none cursor-pointer text-xs"
                      >
                        <option value="Lead" className="bg-slate-900 text-white">Lead</option>
                        <option value="Qualified" className="bg-slate-900 text-white">Qualified</option>
                        <option value="Won" className="bg-slate-900 text-white">Won</option>
                        <option value="Lost" className="bg-slate-900 text-white">Lost</option>
                        <option value="Customer" className="bg-slate-900 text-white">Customer</option>
                        <option value="Churn Risk" className="bg-slate-900 text-white">Churn Risk</option>
                      </select>
                    </div>
                    <div className="p-2.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200/50">
                      <span className="block text-[8px] text-slate-400 uppercase">Skor Prioritas</span>
                      <span className="block font-mono font-bold mt-0.5 text-emerald-400 text-xs">🎯 {activeContactPanel.score} Poin</span>
                    </div>
                  </div>
                </div>

                {/* List tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider pl-1 font-bold">Tags Prospek</span>
                  <div className="flex flex-wrap gap-1">
                    {activeContactPanel.tags.map((tg) => (
                      <span key={tg} className="px-2 py-0.5 rounded bg-[#0A3D62]/5 border text-[9px] text-slate-500 font-bold">
                        🏷️ {tg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timeline activity history logs */}
                <div className="space-y-3 pt-3">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-widest pl-1">
                    Kronologi Aktivitas (Interact Logs)
                  </span>

                  <div className="space-y-3 relative border-l border-slate-100 dark:border-slate-800 ml-2.5 pl-4">
                    {activeContactPanel.activityHistory.map((act, idx) => (
                      <div key={idx} className="relative text-xs">
                        {/* Dot indicator */}
                        <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-cyan-500 border-2 border-white dark:border-slate-900" />
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 font-mono">
                          <span>{act.date}</span>
                          <span className="capitalize">{act.type}</span>
                        </div>
                        <h5 className="font-bold text-slate-800 dark:text-white mt-0.5">{act.title}</h5>
                        <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5 font-medium">{act.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab: LOW CODE AUTOMATION CANVAS BUILDER */}
            {panelActiveTab === 'automation' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">LOW-CODE WORKFLOW CANVAS</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => addAutomationNode('condition')}
                      className="px-2 py-1 bg-slate-50 border hover:bg-slate-100 rounded text-[9px] font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      + Condition
                    </button>
                    <button
                      onClick={() => addAutomationNode('action')}
                      className="px-2 py-1 bg-slate-50 border hover:bg-slate-100 rounded text-[9px] font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      + Action
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-medium leading-relaxed bg-blue-50/30 p-2 border border-blue-50 rounded">
                  Sumbu diagram otomatis akan memicu pesan siaran WhatsApp begitu prospek memenuhi kondisi parameter bercetak hijau.
                </p>

                {/* Canvas visual connector lists */}
                <div className="p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/40 relative space-y-3 min-h-[220px]">
                  {automationNodes.map((nd, idx) => (
                    <div key={nd.id} className="relative">
                      {/* Connection arrow block */}
                      {idx > 0 && (
                        <div className="flex justify-center -my-2">
                          <div className="w-0.5 h-4 bg-slate-300 dark:bg-slate-800" />
                        </div>
                      )}

                      <div className={`p-3 rounded-lg flex items-center justify-between ${nd.color} shadow-sm border border-black/5`}>
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded bg-white/20">
                            <Zap size={10} />
                          </span>
                          <span className="text-xs font-bold font-sans">
                            {nd.label}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setAutomationNodes(automationNodes.filter((n) => n.id !== nd.id));
                            addToast('Node langkah automasi dicabut.', 'success');
                          }}
                          className="text-white/60 hover:text-white p-0.5 bg-black/10 hover:bg-black/20 rounded cursor-pointer"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Tab: NOTES */}
            {panelActiveTab === 'notes' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-510 block">Catatan Admin khusus</label>
                  <textarea
                    rows={4}
                    value={activeContactNotesInput}
                    onChange={(e) => setActiveContactNotesInput(e.target.value)}
                    placeholder="Masukkan ulasan baru mengenai transaksi atau pengukuran pakaian..."
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-[#0A3D62]/20 outline-none resize-none"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => saveContactNotes(activeContactPanel.id)}
                      className="px-4 py-1.5 bg-[#0A3D62] hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Send size={11} /> Simpan Catatan
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold tracking-wider">Histori Notes</span>
                  <p className="text-xs font-semibold text-slate-600 dark:text-stone-300 leading-normal bg-slate-50 p-3 rounded border font-mono">
                    "{activeContactPanel.notes || 'Belum ada ulasan catatan khusus terdaftar.'}"
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <button
              onClick={() => setActiveContactPanel(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-black hover:border-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-stone-200 text-xs font-bold rounded-lg text-center cursor-pointer border"
            >
              Tutup Drawer
            </button>
          </div>
        </div>
      )}

      {/* Renders custom Add Contact Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transition-all duration-300">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#00A3E0] uppercase block">
                  CRM Pusat VOXIA
                </span>
                <h3 className="text-base font-extrabold text-slate-850 dark:text-white font-mono flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#00A3E0]/10 text-[#00A3E0]">
                    <Plus size={16} />
                  </span>
                  Tambah Kontak Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddNewContact}>
              <div className="p-6 space-y-4 max-h-[420px] overflow-y-auto w-full">
                
                {/* Full name input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#00A3E0]/30 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp Phone */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      Nomor WhatsApp / HP
                    </label>
                    <input
                      type="tel"
                      placeholder="Contoh: 08123456789"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#00A3E0]/30 outline-none transition font-mono"
                    />
                  </div>

                  {/* Email address */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      placeholder="budi@example.com"
                      value={newContactEmail}
                      onChange={(e) => setNewContactEmail(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#00A3E0]/30 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      Status Hubungan
                    </label>
                    <select
                      value={newContactStatus}
                      onChange={(e) => setNewContactStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#00A3E0]/30 outline-none transition cursor-pointer text-slate-705 dark:text-stone-300"
                    >
                      <option value="Lead" className="bg-slate-900 text-white">Lead</option>
                      <option value="Qualified" className="bg-slate-900 text-white">Qualified</option>
                      <option value="Won" className="bg-slate-900 text-white">Won</option>
                      <option value="Lost" className="bg-slate-900 text-white">Lost</option>
                      <option value="Customer" className="bg-slate-900 text-white">Customer</option>
                      <option value="Churn Risk" className="bg-slate-900 text-white">Churn Risk</option>
                    </select>
                  </div>

                  {/* Segment Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      Kelompok Segmen
                    </label>
                    <input
                      type="text"
                      placeholder="Retail Prospect / Reseller / dll."
                      value={newContactSegment}
                      onChange={(e) => setNewContactSegment(e.target.value)}
                      className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#00A3E0]/30 outline-none transition"
                    />
                  </div>
                </div>

                {/* Tags input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                      Tag CRM (Pisahkan dengan koma)
                    </label>
                    <span className="text-[9px] text-slate-400">Contoh: Reseller, Campaign, Hot</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Hot Lead, Jabodetabek, Instagram"
                    value={newContactTags}
                    onChange={(e) => setNewContactTags(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#00A3E0]/30 outline-none transition"
                  />
                </div>

                {/* Notes input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide font-mono">
                    Catatan Khusus
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tulis detail minat produk, histori perbincangan, atau instruksi tindak lanjut..."
                    value={newContactNotes}
                    onChange={(e) => setNewContactNotes(e.target.value)}
                    className="w-full px-3.5 py-2 border rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-[#00A3E0]/30 outline-none transition resize-none text-slate-705 dark:text-stone-300"
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-end gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold bg-white dark:bg-slate-950 text-slate-650 dark:text-stone-300 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#00A3E0] to-[#0A3D62] hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md shadow-[#00A3E0]/20"
                >
                  Simpan Kontak
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

// Minimal missing component help
function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
