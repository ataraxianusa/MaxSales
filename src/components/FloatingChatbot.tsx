import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { MessageSquare, X, Send, Bot, User, ArrowUpRight, HelpCircle, AlertCircle, Loader2 } from "lucide-react";
import { BusinessCanvasData } from "../types";
import { API_BASE } from "../api";

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
      text: dna.brand
        ? `Halo! Saya MaxxSales Co-pilot AI. Ada yang bisa saya bantu terkait strategi penjualan, memetakan kompetitor, konten promosi, atau optimasi harian bisnis ${dna.brand}?`
        : `Halo! Saya MaxxSales Co-pilot AI. Untuk mendapatkan saran personal, silakan isi DNA Business Canvas terlebih dahulu. Atau tanya apa saja tentang fitur MaxxSales!`,
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

      const response = await fetch(`${API_BASE}/api/chat`, {
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
        <div className="mb-3 mr-1 flex items-center bg-biru text-white py-2.5 px-4 rounded-xl shadow-lg text-[11px] font-mono animate-bounce relative max-w-xs border border-stone-border">
          <div className="absolute right-4 bottom-[-4px] w-2 h-2 bg-biru border-r border-b border-stone-border rotate-45"></div>
          <span className="mr-2">Tanya Trik Marketing? 👇</span>
          <button 
            id="btn-close-chat-hint"
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(false);
            }}
            className="hover:opacity-75 transition-opacity cursor-pointer"
            aria-label="Tutup Hint"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating launcher trigger button (Frap button) */}
      <button
        id="btn-trigger-floating-chat"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowHint(false);
        }}
        className={`btn-sb-frap hover:scale-105 active:scale-95 flex items-center justify-center transition-all ${
          isOpen 
            ? "bg-red-600 text-white shadow-none" 
            : "bg-hijau text-white"
        }`}
        aria-label="Toggle Co-pilot Chat"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Floating Chat container panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[90vw] max-w-[580px] min-w-[320px] max-h-[70vh] min-h-[400px] bg-white dark:bg-charcoal-surface border border-neutral-250 dark:border-stone-border card-sb flex flex-col overflow-hidden animate-fade-in shadow-2xl">
          
          {/* Panel Header (House Green background) */}
          <div className="p-3.5 bg-biru text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emas animate-pulse"></div>
              <div>
                <h3 className="text-xs font-bold font-body tracking-wider text-white">MAXXSALES AI CO-PILOT</h3>
                <p className="text-[9px] text-white/70 font-mono">Expert Business Assistant</p>
              </div>
            </div>
            <button
              id="btn-minimize-chat"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Sembunyikan Chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Business State context badge */}
          <div className="px-3.5 py-2 bg-krem dark:bg-dark-krem border-b border-neutral-250 dark:border-stone-border flex items-center justify-between text-[9px] text-ink/60 dark:text-dark-text/60 font-mono">
            <span>Usaha Anda: <strong className="text-ink dark:text-dark-text font-bold">{dna.brand || "Belum diset"}</strong></span>
            <span>Target: <strong className="text-ink dark:text-dark-text font-bold truncate max-w-[100px] block">{dna.locations && dna.locations.length > 0 ? dna.locations[0] : "Semua Wilayah"}</strong></span>
          </div>

          {/* Messages layout */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fcfbfa] dark:bg-space-dark min-h-[220px]">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-2.5 animate-fade-in`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-krem dark:bg-dark-krem border border-neutral-250 dark:border-stone-border flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-hijau dark:text-emas" />
                    </div>
                  )}
                  
                  <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isBot 
                      ? "max-w-[95%] bg-white dark:bg-charcoal-surface text-ink dark:text-dark-text border border-neutral-250 dark:border-stone-border/60 shadow-xs" 
                      : "max-w-[85%] bg-hijau text-white font-medium shadow-sm"
                  }`}>
                    {isBot ? (
                      <div className="text-xs leading-relaxed overflow-x-auto [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-1 [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:pl-4 [&_li]:my-0.5 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:font-bold [&_strong]:text-ink dark:[&_strong]:text-white [&_code]:bg-neutral-200/60 dark:[&_code]:bg-space-dark [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_code]:font-mono [&_pre]:bg-neutral-250 dark:[&_pre]:bg-space-dark [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:text-[10px] [&_pre]:font-mono [&_pre]:mt-1.5 [&_pre]:mb-1.5 [&_pre]:overflow-x-auto [&_hr]:border-t [&_hr]:border-neutral-300 dark:[&_hr]:border-stone-border [&_hr]:my-2 [&_a]:text-hijau dark:[&_a]:text-emas [&_a]:underline [&_a]:hover:no-underline [&_blockquote]:border-l-2 [&_blockquote]:border-hijau dark:[&_blockquote]:border-emas [&_blockquote]:pl-3 [&_blockquote]:my-1.5 [&_blockquote]:italic [&_blockquote]:text-ink/65 dark:[&_blockquote]:text-dark-text/65 [&_h1]:text-sm [&_h1]:font-bold [&_h1]:my-1.5 [&_h2]:text-xs [&_h2]:font-bold [&_h2]:my-1 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:my-1 [&_table]:min-w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:my-2 [&_table]:text-xs [&_thead]:bg-krem dark:[&_thead]:bg-dark-krem [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-bold [&_th]:whitespace-nowrap [&_th]:border [&_th]:border-neutral-250 dark:[&_th]:border-stone-border [&_td]:px-2 [&_td]:py-1 [&_td]:border [&_td]:border-neutral-250 dark:[&_td]:border-stone-border [&_td]:whitespace-normal [&_td]:break-words [&_tr]:border-b [&_tr]:border-neutral-250 dark:[&_tr]:border-stone-border [&_tr]:even:bg-neutral-100/50 dark:[&_tr]:even:bg-[#141414]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-xs">{msg.text}</p>
                    )}
                    <div className={`text-[8px] font-mono mt-1.5 text-right ${isBot ? "text-ink/40 dark:text-dark-text/40" : "text-white/70"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-6 h-6 rounded-full bg-hijau text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold text-[10px]">
                      ME
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start items-center gap-2.5 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-krem dark:bg-dark-krem flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-hijau animate-spin" />
                </div>
                <div className="bg-white dark:bg-charcoal-surface border border-neutral-250 dark:border-stone-border/60 rounded-xl px-4 py-2.5 text-[10px] font-mono text-ink/50 dark:text-dark-text/50 flex items-center space-x-1.5 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-hijau" />
                  <span>Sedang meracik strategi jitu...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested quick questions (Pill style buttons) */}
          <div className="p-3 border-t border-neutral-200 dark:border-stone-border bg-[#faf9f8] dark:bg-dark-krem/40 space-y-1.5">
            <span className="text-[8px] font-mono text-ink/40 dark:text-dark-text/40 uppercase tracking-widest block px-1">Rekomendasi Pertanyaan Taktis:</span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  id={`btn-chat-suggest-${idx}`}
                  disabled={loading}
                  onClick={() => handleQuickQuestion(s.text)}
                  className="text-[9px] font-body bg-white dark:bg-charcoal-surface hover:bg-neutral-50 dark:hover:bg-biru text-hijau dark:text-emas border border-hijau/30 dark:border-emas/20 rounded-full px-3 py-1 flex items-center space-x-1 max-w-full text-left truncate transition-colors disabled:opacity-50 cursor-pointer shadow-xs font-bold"
                >
                  <span>{s.label}</span>
                  <ArrowUpRight className="w-2.5 h-2.5 text-hijau/60 dark:text-emas/60 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Form input messaging */}
          <form 
            onSubmit={handleSubmit}
            className="p-3.5 border-t border-neutral-200 dark:border-stone-border bg-white dark:bg-charcoal-surface flex items-center gap-2"
          >
            <input
              id="inp-chat-message"
              type="text"
              placeholder="Tanyakan trik marketing / penjualan..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs bg-[#fdfdfc] dark:bg-space-dark border border-neutral-300 dark:border-stone-border focus:border-hijau dark:focus:border-emas focus:outline-none rounded-xl px-3.5 py-2.5 text-ink dark:text-dark-text transition-colors"
            />
            <button
              id="btn-chat-send"
              type="submit"
              disabled={loading || !inputText.trim()}
              className="btn-sb btn-sb-primary p-2 w-9 h-9 flex items-center justify-center shrink-0 disabled:opacity-40 cursor-pointer"
              aria-label="Kirim Pesan"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
