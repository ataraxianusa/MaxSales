import React from "react";
import { MessageSquare, X, Send, Bot, User, ArrowUpRight, HelpCircle, AlertCircle, Loader2 } from "lucide-react";
import { BusinessCanvasData } from "../types";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface FloatingChatbotProps {
  dna: BusinessCanvasData;
}

export default function FloatingChatbot({ dna }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "initial-1",
      sender: "bot",
      text: `Halo! Saya MaxxSales Co-pilot AI. Ada yang bisa saya bantu terkait strategi penjualan, memetakan kompetitor, konten promosi, atau optimasi harian bisnis ${dna.brand || "Anda"}?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showHint, setShowHint] = React.useState<boolean>(true);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Hide badge hint automatically after 10 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Build conversation history for the backend
      const chatHistory = messages.slice(-6).map(m => ({
        role: m.sender === "bot" ? "assistant" : "user",
        content: m.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            ...chatHistory,
            { role: "user", content: textToSend }
          ],
          dna: {
            brand: dna.brand,
            productName: dna.productName,
            price: dna.normalPrice ? `Rp ${dna.normalPrice.toLocaleString()} (${dna.priceRange || "Sedang"})` : (dna.priceRange || "Sedang"),
            advantage: dna.advantages,
            targetMarket: `${dna.genders?.join(', ') || "Semua Gender"}, ${dna.ages?.join(', ') || "Semua Umur"}, ${dna.locations?.join(', ') || "Semua Lokasi"}`
          }
        })
      });

      if (!response.ok) {
        throw new Error("Gagal memperoleh respons dari server.");
      }

      const data = await response.json();
      
      const botMsg: Message = {
        id: `msg-${Date.now()}-bot`,
        sender: "bot",
        text: data.reply || "Maaf, saya tidak dapat memahami maksud Anda saat ini. Coba tanyakan hal lainnya.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-error`,
        sender: "bot",
        text: "Koneksi asisten sedang sibuk. Namun Anda dapat membaca tips panduan di form DNA Canvas atau mencoba kembali sebentar lagi.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const handleQuickQuestion = (q: string) => {
    handleSendMessage(q);
  };

  const suggestions = [
    { label: "Trik Promosi 📢", text: "Bagaimana cara terbaik mempromosikan produk kami ke target pasar?" },
    { label: "Hadapi Pesaing ⚔️", text: "Apa strategi terbaik untuk merebut pembeli dari kompetitor lokal?" },
    { label: "Cari Konsumen 🎯", text: "Sebutkan cara praktis agar kami bisa menjangkau dan memikat calon pelanggan ideal." },
    { label: "Mulai Hari Ini ⚡", text: "Berikan saya 3 aksi nyata jualan yang wajib saya lakukan hari ini." }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Indicator Hint Bubble */}
      {showHint && !isOpen && (
        <div className="mb-3 mr-1 flex items-center bg-neutral-950 dark:bg-white text-white dark:text-black py-2 px-3 rounded shadow-lg text-[11px] font-mono animate-bounce relative max-w-xs">
          <div className="absolute right-4 bottom-[-4px] w-2 h-2 bg-neutral-950 dark:bg-white rotate-45"></div>
          <span className="mr-2">Tanya Trik Marketing? 👇</span>
          <button 
            id="btn-close-chat-hint"
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(false);
            }}
            className="hover:opacity-75 transition-opacity"
            aria-label="Tutup Hint"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating launcher trigger button */}
      <button
        id="btn-trigger-floating-chat"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowHint(false);
        }}
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
          isOpen 
            ? "bg-red-500 hover:bg-red-650 text-white" 
            : "bg-emerald-500 hover:bg-emerald-600 text-white"
        }`}
        aria-label="Toggle Co-pilot Chat"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Floating Chat container panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] max-h-[500px] bg-white dark:bg-[#0D0D0D] border border-neutral-200 dark:border-[#262626] rounded shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          
          {/* Panel Header */}
          <div className="p-3 bg-neutral-950 dark:bg-[#161616] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <h3 className="text-xs font-bold font-mono tracking-wide">MAXXSALES AI CO-PILOT</h3>
                <p className="text-[9px] text-neutral-400 dark:text-[#A3A3A3] font-mono">Expert UKM Assistant</p>
              </div>
            </div>
            <button
              id="btn-minimize-chat"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
              aria-label="Sembunyikan Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Business State context badge */}
          <div className="px-3 py-1.5 bg-neutral-50 dark:bg-[#131313] border-b border-neutral-200 dark:border-[#262626] flex items-center justify-between text-[9px] text-neutral-500 dark:text-[#A3A3A3] font-mono">
            <span>Usaha Anda: <strong className="text-neutral-700 dark:text-neutral-300">{dna.brand || "Belum diset"}</strong></span>
            <span>Target: <strong className="text-neutral-700 dark:text-neutral-300 truncate max-w-[100px] block">{dna.locations && dna.locations.length > 0 ? dna.locations[0] : "Semua Wilayah"}</strong></span>
          </div>

          {/* Messages layout */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white dark:bg-[#080808] min-h-[220px]">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-1.5 animate-fade-in`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-[#1A1A1A] border border-neutral-200 dark:border-[#333333] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded px-3 py-2 text-xs leading-relaxed ${
                    isBot 
                      ? "bg-neutral-100 dark:bg-[#161616] text-neutral-800 dark:text-[#E2E2E2]" 
                      : "bg-neutral-900 dark:bg-white text-white dark:text-black font-medium"
                  }`}>
                    {msg.text}
                    <div className={`text-[8px] font-mono mt-1 text-right ${isBot ? "text-neutral-400 dark:text-[#7F7F7F]" : "text-neutral-300 dark:text-neutral-600"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start items-center gap-2 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-neutral-100 dark:bg-[#1A1A1A] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                </div>
                <div className="bg-neutral-100 dark:bg-[#161616] rounded px-3 py-2 text-[10px] font-mono text-neutral-400 dark:text-[#7A7A7A] flex items-center space-x-1">
                  <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                  <span>Sedang memikirkan strategi jitu...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugested quick questions */}
          <div className="p-2 border-t border-neutral-100 dark:border-[#1F1F1F] bg-neutral-50 dark:bg-[#0A0A0A] space-y-1">
            <span className="text-[8px] font-mono text-neutral-450 dark:text-[#737373] uppercase tracking-wider block px-1">Rekomendasi Pertanyaan Taktis:</span>
            <div className="flex flex-wrap gap-1">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  id={`btn-chat-suggest-${idx}`}
                  disabled={loading}
                  onClick={() => handleQuickQuestion(s.text)}
                  className="text-[9px] font-mono bg-white dark:bg-[#151515] hover:bg-neutral-100 dark:hover:bg-[#202020] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#2A2A2A] rounded px-2 py-1 flex items-center space-x-0.5 max-w-full text-left truncate transition-colors disabled:opacity-50"
                >
                  <span>{s.label}</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Form input messaging */}
          <form 
            onSubmit={handleSubmit}
            className="p-3 border-t border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#0E0E0E] flex items-center gap-2"
          >
            <input
              id="inp-chat-message"
              type="text"
              placeholder="Tanyakan trik marketing / penjualan..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs bg-neutral-50 dark:bg-[#151515] border border-neutral-300 dark:border-[#262626] focus:border-neutral-900 dark:focus:border-white focus:outline-none rounded px-3 py-2 text-neutral-900 dark:text-white"
            />
            <button
              id="btn-chat-send"
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2 rounded bg-neutral-950 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors disabled:opacity-40"
              aria-label="Kirim Pesan"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
