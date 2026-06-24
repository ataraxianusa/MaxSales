import React from "react";
import { GeneratedContentText } from "../types";
import { API_BASE } from "../api";
import { useChain } from "../store/ChainContext";
import AIFeedback from "./AIFeedback";
import { Image as ImageIcon, Upload, Download, Copy, RefreshCw, Layers, Eye, Smartphone, Check, Loader2 } from "lucide-react";

type AspectRatioType = "feed" | "story" | "whatsapp";

export default function ContentGenerator() {
  const { dna, segments, strategyOutput } = useChain();
  // Input states
  const [promo, setPromo] = React.useState("Flash Sale 30% Terbatazs!");
  const [hook, setHook] = React.useState("Model sutra asli yang adem dipakai seharian!");
  const [cta, setCta] = React.useState("Beli Sekarang");
  const [urgency, setUrgency] = React.useState("Hari Ini Saja");
  const [customCta, setCustomCta] = React.useState("");
  const [promoPrice, setPromoPrice] = React.useState(279000);
  const [normalPrice, setNormalPrice] = React.useState(dna.normalPrice || 399000);
  
  // Image states
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Active view tab
  const [activeFormat, setActiveFormat] = React.useState<AspectRatioType>("feed");
  const [loading, setLoading] = React.useState(false);
  const [copiedText, setCopiedText] = React.useState(false);

  // AI Generated output text state
  const [generatedText, setGeneratedText] = React.useState<GeneratedContentText>({
    headline: `${dna.productName} — Flash Sale!`,
    subheadline: dna.advantages ? dna.advantages.split(',')[0] : "Bahan sutra premium yang flowy",
    priceDisplay: `Rp ${promoPrice.toLocaleString("id-ID")}`,
    promoDisplay: `Hemat 30%`,
    ctaText: "Beli Sekarang",
    urgencyText: "Hari Ini Saja!",
    caption: `🔥 FLASH SALE TERBATAS! 🔥\n\nDapatkan ${dna.productName} dari brand ${dna.brand || "kami"} sekarang juga!\n\nKenapa harus memilih kami:\n✓ Model terbatas & eksklusif\n✓ Sutra premium impor yang adem dipakai seharian!\n\nHubungi kami segera sebelum kehabisan stok!`,
    hashtags: ["#ootdhijab", "#outfitmuslimah", "#gamispremium", "#elzahra"],
    watermark: `@${(dna.brand || "toko").toLowerCase().replace(/\s+/g, "_")}`
  });

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Default preset image if none is uploaded
  const loadDefaultMockProduct = () => {
    // Elegant off-white placeholder with stylish color blocks to overlay text on safely
    setImageSrc("https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1080");
  };

  React.useEffect(() => {
    loadDefaultMockProduct();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAIContentGeneration = async () => {
    setLoading(true);
    try {
      const highRiskSegments = segments
        .filter((s) => s.risk === "High")
        .map((s) => ({ name: s.name, behavior: s.channel }));

      const response = await fetch(`${API_BASE}/api/generate-content-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna,
          headline: promo,
          normalPrice,
          promoPrice,
          hook,
          cta: cta === "Custom" ? customCta : cta,
          urgency,
          targetSegments: highRiskSegments,
          activeStrategies: strategyOutput?.pillars?.slice(0, 3).map((p) => p.title) ?? [],
        }),
      });
      const data = await response.json();
      if (data) {
        setGeneratedText(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Canvas drawing effect with debounce to prevent re-render cascade
  React.useEffect(() => {
    const timer = setTimeout(() => drawCanvas(), 300);
    return () => clearTimeout(timer);
  }, [generatedText, imageSrc, activeFormat, promoPrice, normalPrice]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set height based on selected Format
    // Feed 1:1 format (1080x1080)
    // Story 9:16 format (1080x1920)
    let width = 1080;
    let height = 1080;

    if (activeFormat === "story") {
      height = 1920;
    } else if (activeFormat === "whatsapp") {
      width = 800;
      height = 800;
    }

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background color (stylish charcoal or warm slate)
    ctx.fillStyle = "#171717";
    ctx.fillRect(0, 0, width, height);

    const renderOverlayAndText = () => {
      // 1. Draw elegant dark gradient overlay at the bottom so text is highly readable
      const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(0.3, "rgba(0, 0, 0, 0.7)");
      gradient.addColorStop(0.85, "rgba(0, 0, 0, 0.95)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Text Content (Headline, Subheadline, Normal price, Promo price, CTA button, Watermark)
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "top";

      // Scale calculations for font based on story vs feed
      const fScale = activeFormat === "story" ? 1.4 : 1.0;

      // Brand Title Tag
      ctx.fillStyle = "#a3a3a3"; // neutral-400
      ctx.font = `bold ${Math.round(26 * fScale)}px Inter, system-ui, sans-serif`;
      ctx.fillText((dna.brand || "EL-ZAHRA BOUTIQUE").toUpperCase(), 60, height - 370 * fScale);

      // Promo/Diskon Highlight Bag
      ctx.fillStyle = "#ffffff";
      ctx.font = `black ${Math.round(48 * fScale)}px Inter, system-ui, sans-serif`;
      ctx.fillText(generatedText.headline, 60, height - 315 * fScale);

      // Subheadline Keunggulan
      ctx.fillStyle = "#e5e5e5"; // neutral-200
      ctx.font = `400 ${Math.round(24 * fScale)}px Inter, system-ui, sans-serif`;
      ctx.fillText(generatedText.subheadline, 60, height - 250 * fScale);

      // Prices (Draw Normal Price struck-through, and Promo price in bright white)
      ctx.fillStyle = "#737373"; // neutral-500
      ctx.font = `500 ${Math.round(28 * fScale)}px Inter, system-ui, sans-serif`;
      const normPriceText = `Normal: Rp ${normalPrice.toLocaleString("id-ID")}`;
      ctx.fillText(normPriceText, 60, height - 200 * fScale);
      
      // Draw strikeout on Normal price
      const normTextWidth = ctx.measureText(normPriceText).width;
      ctx.strokeStyle = "#ef4444"; // red strike
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(60, height - 186 * fScale);
      ctx.lineTo(60 + normTextWidth, height - 186 * fScale);
      ctx.stroke();

      // Promo Price
      ctx.fillStyle = "#ffffff"; // Monochrome high-contrast
      ctx.font = `bold ${Math.round(38 * fScale)}px Inter, system-ui, sans-serif`;
      ctx.fillText(`PROMO: Rp ${promoPrice.toLocaleString("id-ID")} (${generatedText.promoDisplay || "Hemat"})`, 60, height - 160 * fScale);

      // Urgency text
      ctx.fillStyle = "#a3a3a3"; // neutral-400
      ctx.font = `italic bold ${Math.round(24 * fScale)}px Inter, system-ui, sans-serif`;
      ctx.fillText(`⏰ ${generatedText.urgencyText.toUpperCase()}`, 60, height - 110 * fScale);

      // CTA Button Box at bottom-right (Sharp and rectangle)
      const btnX = width - 360;
      const btnY = height - 150 * fScale;
      const btnW = 300;
      const btnH = 65 * fScale;

      ctx.fillStyle = "#ffffff"; // solid white block
      ctx.beginPath();
      ctx.rect(btnX, btnY, btnW, btnH);
      ctx.fill();

      // CTA Text
      ctx.fillStyle = "#111111"; // deep black text inside button
      ctx.font = `bold ${Math.round(24 * fScale)}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(generatedText.ctaText.toUpperCase(), btnX + btnW / 2, btnY + btnH / 2);

      // Footer Watermark @account
      ctx.fillStyle = "#525252"; // neutral-600
      ctx.font = `bold 20px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(generatedText.watermark, width - 60, height - 40);

      // Reset textAlign & Baseline
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
    };

    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw image keeping ratio fitting/covering the canvas
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;
        let drawWidth, drawHeight, drawX, drawY;

        if (imgRatio > canvasRatio) {
          drawHeight = height;
          drawWidth = height * imgRatio;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgRatio;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        // Now render gradients & text overlay on top of product image
        renderOverlayAndText();
      };
      
      // If image is a local base64, load directly. Otherwise we use the safety referrer policy image
      img.src = imageSrc;
    } else {
      // Just fallback blocks with text
      renderOverlayAndText();
    }
  };

  const downloadOverlayImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save to device
    const link = document.createElement("a");
    link.download = `maxxsales_${activeFormat}_${dna.productName.toLowerCase().replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyCaptionText = () => {
    const fullCaption = `${generatedText.caption}\n\n${generatedText.hashtags.join(" ")}`;
    navigator.clipboard.writeText(fullCaption);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro header */}
      <div className="border-b pb-4 border-neutral-200 dark:border-[#262626]">
        <h2 className="text-xl font-light tracking-tight flex items-center space-x-2 text-neutral-900 dark:text-white">
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-[#E5E5E5]"></span>
          <span>Content Generator with Photo Overlay</span>
        </h2>
        <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
          Upload foto polos produk dari Smartphone, ketik detail diskon promo, rilis templat visual beresolusi tinggi beserta taktik tulisan pancingan sekejap!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR: INPUT CONTROL (5 Columns) */}
        <div className="lg:col-span-5 p-5 bg-white dark:bg-[#111111] border rounded border-neutral-200 dark:border-[#262626] space-y-4">
          <h3 className="text-xs font-bold font-mono tracking-wider text-neutral-850 dark:text-white flex items-center space-x-1.5 border-b pb-2">
            <Layers className="w-3.5 h-3.5 text-neutral-400" />
            <span>KONTROL PARAMETER KAMPANYE</span>
          </h3>

          {/* Photo upload zone */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373]">1. UNGGAH FOTO PRODUK (SMARTPHONE/KAMERA) *</label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed rounded p-4 text-center cursor-pointer hover:border-neutral-900 dark:hover:border-white transition-colors border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/20"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*" 
              />
              <Upload className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
              <p className="text-[10px] text-neutral-600 dark:text-neutral-450">Drag & Drop foto atau klik untuk memilih file</p>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); loadDefaultMockProduct(); }}
                className="text-[9px] text-neutral-900 dark:text-[#E5E5E5] underline mt-1 font-mono block mx-auto"
              >
                Gunakan Contoh Foto Sutra El-Zahra
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-neutral-150 dark:border-neutral-800">
            {/* Promo Inputs */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">2. JENIS PROMO / DISKON HEADLINE *</label>
              <input
                id="inp-prom-text"
                type="text"
                placeholder="misal: Flash Sale Diskon 30%!"
                value={promo}
                onChange={e => setPromo(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            {/* Price Adjusters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">HARGA NORMAL (RP)</label>
                <input
                  id="inp-prom-normalPrice"
                  type="number"
                  value={normalPrice}
                  onChange={e => setNormalPrice(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">HARGA PROMO (RP)</label>
                <input
                  id="inp-prom-promoPrice"
                  type="number"
                  value={promoPrice}
                  onChange={e => setPromoPrice(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>
            </div>

            {/* Hook text */}
            <div>
              <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">3. HOOK PANCINGAN KEUNGGULAN</label>
              <textarea
                id="inp-prom-hook"
                placeholder="Bahan sutra impor adem sejuk di kulit sekelas produk mall..."
                value={hook}
                onChange={e => setHook(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
              />
            </div>

            {/* CTA and Urgency */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">4. CTA BUTTON</label>
                <select
                  id="inp-prom-cta"
                  value={cta}
                  onChange={e => setCta(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border rounded bg-transparent border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                >
                  {["Beli Sekarang", "Order Lewat WA", "Shop Now", "Swipe Up", "Custom"].map(item => (
                    <option key={item} value={item} className="bg-white dark:bg-neutral-900 text-black dark:text-white">{item}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-450 dark:text-[#737373] mb-1">5. URGENSI WAKTU</label>
                <select
                  id="inp-prom-urgency"
                  value={urgency}
                  onChange={e => setUrgency(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border rounded bg-transparent border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                >
                  {["Hari Ini Saja", "Stok Terbatas", "Kuota 10 Orang", "Tanpa Urgensi"].map(u => (
                    <option key={u} value={u} className="bg-white dark:bg-neutral-900 text-black dark:text-white">{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom CTA textbox */}
            {cta === "Custom" && (
              <div>
                <label className="block text-[10px] font-mono font-semibold text-neutral-400 mb-1">TULIS CTA KUSTOM ANDA</label>
                <input
                  id="inp-prom-customCta"
                  type="text"
                  placeholder="Kunjungi Toko"
                  value={customCta}
                  onChange={e => setCustomCta(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded border bg-transparent border-neutral-350 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
              </div>
            )}

            {/* Re-generate button utilizing proxy endpoint */}
            <div className="pt-3 border-t border-[#262626]">
              <button
                id="btn-trigger-content-ai"
                onClick={triggerAIContentGeneration}
                disabled={loading}
                className="w-full py-3 rounded text-xs font-semibold bg-neutral-950 text-white dark:bg-[#E5E5E5] dark:text-black hover:bg-neutral-900 dark:hover:bg-white transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Generate Ulang Teks dengan AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* COMPOSITOR / PREVIEW AREA (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Format Tabs switcher */}
          <div className="flex border-b border-neutral-200 dark:border-[#262626] gap-1 pb-1">
            {[
              { type: "feed", label: "Instagram Feed (1:1)", icon: Eye },
              { type: "story", label: "Stories/Reels (9:16)", icon: Smartphone },
              { type: "whatsapp", label: "WhatsApp Catalog (1:1)", icon: ImageIcon }
            ].map(f => {
              const IconComp = f.icon;
              const isActive = activeFormat === f.type;
              return (
                <button
                  id={`btn-format-switch-${f.type}`}
                  key={f.type}
                  onClick={() => setActiveFormat(f.type as AspectRatioType)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-mono transition-colors border-b-2 ${
                    isActive
                      ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white font-bold"
                      : "border-transparent text-neutral-500 hover:text-neutral-850"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Aspect Ratio Canvas Live visualizer */}
            <div className="md:col-span-7 flex flex-col items-center justify-center">
              <div className="rounded overflow-hidden border border-neutral-300 dark:border-[#262626] bg-[#111111] text-white w-full max-w-sm max-h-[480px]">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-auto object-contain max-h-[440px]" 
                  title="Materi Banner Hasil MaxxSales"
                />
              </div>

              {/* Download trigger */}
              <button
                id="btn-download-overlay"
                onClick={downloadOverlayImage}
                className="w-full max-w-sm mt-3 py-2.5 rounded text-xs font-semibold text-white bg-neutral-950 dark:text-black dark:bg-[#E5E5E5] hover:bg-neutral-900 dark:hover:bg-white flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar Materi (PNG)</span>
              </button>
            </div>

            {/* AI Caption & hashtags side-panel */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-4 rounded border bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#262626] space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#262626] pb-2">
                  <span className="text-[9px] font-bold font-mono text-neutral-450 dark:text-[#737373] uppercase">Salinan Tulisan Promosi</span>
                  <button
                    id="btn-copy-caption"
                    onClick={copyCaptionText}
                    className="p-1 px-2 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-[10px] font-mono text-neutral-600 dark:text-neutral-300 flex items-center space-x-1"
                  >
                    {copiedText ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText ? "Tersalin!" : "Salin Teks"}</span>
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto text-xs whitespace-pre-wrap leading-relaxed text-neutral-700 dark:text-[#A3A3A3] font-sans">
                  {generatedText.caption}
                  
                  <div className="mt-3 text-neutral-400 dark:text-neutral-500 font-mono text-[9px]">
                    {generatedText.hashtags.join(" ")}
                  </div>

                  <AIFeedback promptType="content" responseId={`content-${Date.now()}`} />
                </div>
              </div>

              <div className="p-3.5 rounded border border-dashed border-neutral-200 dark:border-[#262626] text-[10px] text-neutral-500 leading-normal bg-neutral-50 dark:bg-[#111111]">
                📌 <strong className="font-semibold text-neutral-800 dark:text-neutral-300 font-mono">Tips Optimasi:</strong> Format stories 9:16 sangat ideal diunggah ke Reels Instagram atau TikTok Stories. Jangan lupa selipkan tautan (link) bio pendaftaran pemesanan di stiker tautan Stories demi konversi optimal!
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
