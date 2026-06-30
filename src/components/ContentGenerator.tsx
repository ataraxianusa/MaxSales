import React from "react";
import { GeneratedContentText } from "../types";
import { API_BASE } from "../api";
import { useChain } from "../store/ChainContext";
import AIFeedback from "./AIFeedback";
import { Image as ImageIcon, Upload, Download, Copy, RefreshCw, Layers, Eye, Smartphone, Check, Loader2 } from "lucide-react";

type AspectRatioType = "feed" | "story" | "whatsapp";
type LayoutStyle = "minimal" | "bold" | "card" | "banner";

interface ContentSuggestions {
  hooks: string[];
  ctas: string[];
  captions: string[];
  promoPrices?: { label: string; value: number }[];
}

export default function ContentGenerator() {
  const { dna, segments, strategyOutput } = useChain();
  // Input states — auto-fill from DNA
  const [promo, setPromo] = React.useState(`${dna.productName} — Flash Sale!`);
  const [hook, setHook] = React.useState(dna.advantages ? dna.advantages.split(",")[0].trim() : "Model sutra asli yang adem dipakai seharian!");
  const [cta, setCta] = React.useState(dna.buyTriggers?.length ? "Custom" : "Beli Sekarang");
  const [customCta, setCustomCta] = React.useState(dna.buyTriggers?.length ? `Pesan via WA (${dna.buyTriggers[0]})` : "");
  const [urgency, setUrgency] = React.useState("Hari Ini Saja");
  const [promoPrice, setPromoPrice] = React.useState(279000);
  const [normalPrice, setNormalPrice] = React.useState(dna.normalPrice || 399000);
  
  // AI Suggestion states
  const [suggestions, setSuggestions] = React.useState<ContentSuggestions | null>(null);
  const [suggestLoading, setSuggestLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  
  // Image states
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Active view tab
  const [activeFormat, setActiveFormat] = React.useState<AspectRatioType>("feed");
  const [layoutStyle, setLayoutStyle] = React.useState<LayoutStyle>("minimal");
  const [loading, setLoading] = React.useState(false);
  const [copiedText, setCopiedText] = React.useState(false);

  // AI Generated output text state
  const [generatedText, setGeneratedText] = React.useState<GeneratedContentText>({
    headline: `${dna.productName} — Flash Sale!`,
    subheadline: dna.advantages ? dna.advantages.split(",")[0].trim() : "Bahan sutra premium yang flowy",
    priceDisplay: `Rp ${promoPrice.toLocaleString("id-ID")}`,
    promoDisplay: `Hemat 30%`,
    ctaText: "Beli Sekarang",
    urgencyText: "Hari Ini Saja!",
    caption: `🔥 FLASH SALE TERBATAS! 🔥\n\nDapatkan ${dna.productName} dari brand ${dna.brand || "kami"} sekarang juga!\n\nKenapa harus memilih kami:\n✓ Model terbatas & eksklusif\n✓ Sutra premium impor yang adem dipakai seharian!\n\nHubungi kami segera sebelum kehabisan stok!`,
    hashtags: ["#ootdhijab", "#outfitmuslimah", "#gamispremium", "#elzahra"],
    watermark: `@${(dna.brand || "toko").toLowerCase().replace(/\s+/g, "_")}`
  });

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  // Fetch AI suggestions for hooks, CTAs, captions
  const fetchSuggestions = async () => {
    setSuggestLoading(true);
    try {
      const highRiskSegments = segments
        .filter((s) => s.risk === "High")
        .map((s) => ({ name: s.name, behavior: s.channel }));

      const response = await fetch(`${API_BASE}/api/suggest-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dna,
          targetSegments: highRiskSegments,
          activeStrategies: strategyOutput?.pillars?.slice(0, 3).map((p) => p.title) ?? [],
        }),
      });
      const data = await response.json();
      if (data?.hooks) {
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestLoading(false);
    }
  };

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
  }, [generatedText, imageSrc, activeFormat, layoutStyle, promoPrice, normalPrice]);

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
      const fScale = activeFormat === "story" ? 1.4 : 1.0;

      // Helper: draw CTA button (reusable across layouts)
      const drawCTA = (x: number, y: number, w: number, h: number, radius?: number) => {
        ctx.fillStyle = "#ffffff";
        if (radius) {
          ctx.beginPath();
          ctx.roundRect(x, y, w, h, radius);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, w, h);
        }
        ctx.fillStyle = "#111111";
        ctx.font = `bold ${Math.round(22 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(generatedText.ctaText.toUpperCase(), x + w / 2, y + h / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
      };

      // Helper: draw price block
      const drawPrice = (x: number, y: number) => {
        ctx.fillStyle = "#737373";
        ctx.font = `500 ${Math.round(24 * fScale)}px Inter, system-ui, sans-serif`;
        const normPriceText = `Normal: Rp ${normalPrice.toLocaleString("id-ID")}`;
        ctx.fillText(normPriceText, x, y);
        const nw = ctx.measureText(normPriceText).width;
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y + 14 * fScale);
        ctx.lineTo(x + nw, y + 14 * fScale);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(34 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(`Rp ${promoPrice.toLocaleString("id-ID")}`, x, y + 38 * fScale);
        ctx.fillStyle = "#a3a3a3";
        ctx.font = `bold ${Math.round(18 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(generatedText.promoDisplay || "Hemat", x + ctx.measureText(`Rp ${promoPrice.toLocaleString("id-ID")}`).width + 12, y + 44 * fScale);
      };

      if (layoutStyle === "minimal") {
        // ── MINIMAL: Classic bottom gradient overlay ──
        const gradient = ctx.createLinearGradient(0, height * 0.4, 0, height);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.3, "rgba(0, 0, 0, 0.7)");
        gradient.addColorStop(0.85, "rgba(0, 0, 0, 0.95)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#a3a3a3";
        ctx.font = `bold ${Math.round(24 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText((dna.brand || "BRAND").toUpperCase(), 60, height - 380 * fScale);

        ctx.fillStyle = "#ffffff";
        ctx.font = `black ${Math.round(46 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(generatedText.headline, 60, height - 330 * fScale);

        ctx.fillStyle = "#e5e5e5";
        ctx.font = `400 ${Math.round(22 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(generatedText.subheadline, 60, height - 270 * fScale);

        drawPrice(60, height - 220 * fScale);

        ctx.fillStyle = "#a3a3a3";
        ctx.font = `italic bold ${Math.round(20 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(`⏰ ${generatedText.urgencyText.toUpperCase()}`, 60, height - 120 * fScale);

        drawCTA(width - 340, height - 110 * fScale, 280, 55 * fScale);

      } else if (layoutStyle === "bold") {
        // ── BOLD: Center text + accent color bar ──
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
        gradient.addColorStop(0.45, "rgba(0, 0, 0, 0.15)");
        gradient.addColorStop(0.55, "rgba(0, 0, 0, 0.85)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.98)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Accent bar left side
        ctx.fillStyle = "#10b981"; // emerald-500
        ctx.fillRect(0, height * 0.38, 8 * fScale, height * 0.55);

        // Brand
        ctx.fillStyle = "#10b981";
        ctx.font = `bold ${Math.round(22 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(`◆ ${(dna.brand || "BRAND").toUpperCase()}`, 40, height * 0.40);

        // Headline — large centered
        ctx.fillStyle = "#ffffff";
        ctx.font = `black ${Math.round(56 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(generatedText.headline, width / 2, height * 0.48);
        ctx.textAlign = "left";

        // Subheadline
        ctx.fillStyle = "#d4d4d4";
        ctx.font = `400 ${Math.round(22 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(generatedText.subheadline, width / 2, height * 0.54);
        ctx.textAlign = "left";

        // Price block centered
        ctx.textAlign = "center";
        ctx.fillStyle = "#737373";
        ctx.font = `500 ${Math.round(22 * fScale)}px Inter, system-ui, sans-serif`;
        const np = `Normal: Rp ${normalPrice.toLocaleString("id-ID")}`;
        ctx.fillText(np, width / 2, height * 0.62);
        const npW = ctx.measureText(np).width;
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width / 2 - npW / 2, height * 0.62 + 14 * fScale);
        ctx.lineTo(width / 2 + npW / 2, height * 0.62 + 14 * fScale);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = `black ${Math.round(42 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(`Rp ${promoPrice.toLocaleString("id-ID")}`, width / 2, height * 0.69);
        ctx.fillStyle = "#10b981";
        ctx.font = `bold ${Math.round(20 * fScale)}px Inter, system-ui, sans-serif`;
        const pp = `Rp ${promoPrice.toLocaleString("id-ID")}`;
        ctx.fillText(generatedText.promoDisplay || "Hemat", width / 2 + ctx.measureText(pp).width / 2 + 16, height * 0.70);
        ctx.textAlign = "left";

        // Urgency pill
        ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
        const urgText = `⏰ ${generatedText.urgencyText.toUpperCase()}`;
        ctx.font = `bold ${Math.round(18 * fScale)}px Inter, system-ui, sans-serif`;
        const urgW = ctx.measureText(urgText).width + 32;
        ctx.beginPath();
        ctx.roundRect(width / 2 - urgW / 2, height * 0.78, urgW, 40 * fScale, 20 * fScale);
        ctx.fill();
        ctx.fillStyle = "#10b981";
        ctx.textAlign = "center";
        ctx.fillText(urgText, width / 2, height * 0.78 + 12 * fScale);
        ctx.textAlign = "left";

        // CTA centered
        const ctaW = 300;
        const ctaH = 55 * fScale;
        drawCTA(width / 2 - ctaW / 2, height * 0.86, ctaW, ctaH, 12 * fScale);

      } else if (layoutStyle === "card") {
        // ── CARD: Frosted glass card overlay at bottom ──
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.6, "rgba(0, 0, 0, 0.6)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.85)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Glass card
        const cardX = 40;
        const cardY = height * 0.58;
        const cardW = width - 80;
        const cardH = height * 0.38;
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Brand badge inside card
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        const badgeText = (dna.brand || "BRAND").toUpperCase();
        ctx.font = `bold ${Math.round(16 * fScale)}px Inter, system-ui, sans-serif`;
        const badgeW = ctx.measureText(badgeText).width + 28;
        ctx.beginPath();
        ctx.roundRect(cardX + 24, cardY + 24, badgeW, 32 * fScale, 8);
        ctx.fill();
        ctx.fillStyle = "#e5e5e5";
        ctx.fillText(badgeText, cardX + 38, cardY + 30);

        // Headline
        ctx.fillStyle = "#ffffff";
        ctx.font = `black ${Math.round(40 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(generatedText.headline, cardX + 24, cardY + 72);

        // Subheadline
        ctx.fillStyle = "#a3a3a3";
        ctx.font = `400 ${Math.round(20 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(generatedText.subheadline, cardX + 24, cardY + 122);

        // Price
        ctx.fillStyle = "#737373";
        ctx.font = `500 ${Math.round(20 * fScale)}px Inter, system-ui, sans-serif`;
        const np2 = `Normal: Rp ${normalPrice.toLocaleString("id-ID")}`;
        ctx.fillText(np2, cardX + 24, cardY + 162);
        const np2W = ctx.measureText(np2).width;
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cardX + 24, cardY + 175 * fScale);
        ctx.lineTo(cardX + 24 + np2W, cardY + 175 * fScale);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(30 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(`Rp ${promoPrice.toLocaleString("id-ID")}`, cardX + 24, cardY + 185 * fScale);
        ctx.fillStyle = "#10b981";
        ctx.font = `bold ${Math.round(16 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(generatedText.promoDisplay || "Hemat", cardX + 24 + ctx.measureText(`Rp ${promoPrice.toLocaleString("id-ID")}`).width + 10, cardY + 191 * fScale);

        // CTA button bottom-right of card
        drawCTA(cardX + cardW - 220, cardY + cardH - 70 * fScale, 196, 48 * fScale, 10);

        // Urgency top-right of card
        ctx.fillStyle = "#a3a3a3";
        ctx.font = `italic bold ${Math.round(16 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "right";
        ctx.fillText(`⏰ ${generatedText.urgencyText.toUpperCase()}`, cardX + cardW - 24, cardY + 36);
        ctx.textAlign = "left";

      } else if (layoutStyle === "banner") {
        // ── BANNER: Diagonal top banner with overlay below ──
        // Full dark overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, width, height);

        // Diagonal accent shape at top
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height * 0.15);
        ctx.lineTo(0, height * 0.22);
        ctx.closePath();
        ctx.fill();

        // Brand in banner
        ctx.fillStyle = "#065f46";
        ctx.font = `black ${Math.round(28 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText((dna.brand || "BRAND").toUpperCase(), 60, height * 0.09);

        // Flash badge
        ctx.fillStyle = "#ffffff";
        const flashText = "⚡ FLASH SALE";
        ctx.font = `black ${Math.round(20 * fScale)}px Inter, system-ui, sans-serif`;
        const flashW = ctx.measureText(flashText).width + 32;
        ctx.beginPath();
        ctx.roundRect(width - flashW - 60, height * 0.04, flashW, 38 * fScale, 8);
        ctx.fill();
        ctx.fillStyle = "#10b981";
        ctx.fillText(flashText, width - flashW - 44, height * 0.05 + 6 * fScale);

        // Large headline below banner
        ctx.fillStyle = "#ffffff";
        ctx.font = `black ${Math.round(52 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(generatedText.headline, 60, height * 0.30);

        // Subheadline
        ctx.fillStyle = "#d4d4d4";
        ctx.font = `400 ${Math.round(22 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(generatedText.subheadline, 60, height * 0.38);

        // Accent line
        ctx.fillStyle = "#10b981";
        ctx.fillRect(60, height * 0.44, 120, 4);

        // Price block
        drawPrice(60, height * 0.50);

        // Urgency
        ctx.fillStyle = "#a3a3a3";
        ctx.font = `italic bold ${Math.round(22 * fScale)}px Inter, system-ui, sans-serif`;
        ctx.fillText(`⏰ ${generatedText.urgencyText.toUpperCase()}`, 60, height * 0.68);

        // CTA
        drawCTA(60, height * 0.76, 280, 55 * fScale, 10);

        // Bottom accent line
        ctx.fillStyle = "#10b981";
        ctx.fillRect(0, height - 6, width, 6);
      }

      // Watermark (all layouts)
      ctx.fillStyle = "#525252";
      ctx.font = `bold 18px monospace`;
      ctx.textAlign = "right";
      ctx.fillText(generatedText.watermark, width - 40, height - 24);
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
              <div className="flex gap-2">
                <input
                  id="inp-prom-text"
                  type="text"
                  placeholder="misal: Flash Sale Diskon 30%!"
                  value={promo}
                  onChange={e => setPromo(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 rounded border bg-transparent border-neutral-300 dark:border-neutral-800 focus:border-neutral-900 dark:focus:border-white focus:outline-none"
                />
                <button
                  onClick={() => {
                    const headlines = [
                      `${dna.productName || "Produk"} — Diskon Spesial!`,
                      `Flash Sale: Hemat ${Math.round((1 - promoPrice/normalPrice) * 100)}%!`,
                      `Promo Terbatas: ${dna.productName || "Produk"} Diskon Besar!`,
                      `Harga Spesial Hari Ini: ${dna.productName || "Produk"}`,
                      `Last Chance: Diskon ${dna.productName || "Produk"} Besok Berakhir!`
                    ];
                    setPromo(headlines[Math.floor(Math.random() * headlines.length)]);
                  }}
                  className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-800 text-[9px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-900 dark:hover:border-white transition-colors"
                  title="Saran AI untuk headline promo"
                >
                  ✨ AI
                </button>
              </div>
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

            {/* AI Suggestions Panel */}
            <div className="pt-2">
              <button
                id="btn-ai-suggest"
                onClick={fetchSuggestions}
                disabled={suggestLoading}
                className="group relative w-full py-3 rounded-xl text-center font-bold text-sm transition-all duration-300 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <span className="relative z-10">
                  {suggestLoading ? (
                    <span className="flex items-center justify-center space-x-2"><Loader2 className="w-4 h-4 animate-spin" /><span>AI Sedang Berpikir...</span></span>
                  ) : (
                    "Dapatkan Saran Hook, CTA & Caption dari AI"
                  )}
                </span>
              </button>
              <p className="text-[9px] text-center text-neutral-400 dark:text-neutral-500 mt-1.5 font-mono">Klik untuk dapatkan saran personal dari AI berdasarkan data bisnis Anda</p>

              {showSuggestions && suggestions && (
                <div className="mt-3 p-3 rounded border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-neutral-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold font-mono text-neutral-450 dark:text-[#737373] uppercase tracking-wider">Saran AI dari DNA Bisnis</span>
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="text-[9px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Hook Suggestions */}
                  <div>
                    <span className="text-[9px] font-mono font-semibold text-neutral-500 dark:text-neutral-500 mb-1 block">HOOK IDEA:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.hooks.map((h, i) => (
                        <button
                          key={i}
                          onClick={() => setHook(h)}
                          className={`text-[9px] px-2 py-1 rounded border transition-colors ${
                            hook === h
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white"
                              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA Suggestions */}
                  <div>
                    <span className="text-[9px] font-mono font-semibold text-neutral-500 dark:text-neutral-500 mb-1 block">CTA IDEA:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.ctas.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => { setCta("Custom"); setCustomCta(c); }}
                          className={`text-[9px] px-2 py-1 rounded border transition-colors ${
                            customCta === c && cta === "Custom"
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white"
                              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caption Suggestions */}
                  <div>
                    <span className="text-[9px] font-mono font-semibold text-neutral-500 dark:text-neutral-500 mb-1 block">CAPTION IDEA:</span>
                    <div className="space-y-1.5">
                      {suggestions.captions.map((cap, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setHook(cap.split(/[.!]/)[0]?.trim() || hook);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left text-[9px] px-2.5 py-1.5 rounded border bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors leading-relaxed"
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Promo Price Suggestions */}
                  {suggestions.promoPrices && suggestions.promoPrices.length > 0 && (
                    <div>
                      <span className="text-[9px] font-mono font-semibold text-neutral-500 dark:text-neutral-500 mb-1 block">HARGA PROMO IDEA:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.promoPrices.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setPromoPrice(p.value)}
                            className={`text-[9px] px-2 py-1 rounded border transition-colors ${
                              promoPrice === p.value
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white"
                                : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                            }`}
                          >
                            {p.label}: Rp {p.value.toLocaleString("id-ID")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
          
          {/* Format & Layout Tabs — centered */}
          <div className="flex flex-col items-center gap-3 border-b border-neutral-200 dark:border-[#262626] pb-3">
            <div className="flex gap-1">
              {[
                { type: "feed", label: "Feed (1:1)", icon: Eye },
                { type: "story", label: "Story (9:16)", icon: Smartphone },
                { type: "whatsapp", label: "WA (1:1)", icon: ImageIcon }
              ].map(f => {
                const IconComp = f.icon;
                const isActive = activeFormat === f.type;
                return (
                  <button
                    id={`btn-format-switch-${f.type}`}
                    key={f.type}
                    onClick={() => setActiveFormat(f.type as AspectRatioType)}
                    className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-mono rounded-lg transition-all ${
                      isActive
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-black shadow-sm"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Layout Style Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-neutral-400 mr-1">LAYOUT:</span>
              {[
                { type: "minimal" as LayoutStyle, label: "Minimal", icon: "◻" },
                { type: "bold" as LayoutStyle, label: "Bold", icon: "◆" },
                { type: "card" as LayoutStyle, label: "Card", icon: "▢" },
                { type: "banner" as LayoutStyle, label: "Banner", icon: "▬" },
              ].map(ls => (
                <button
                  key={ls.type}
                  onClick={() => setLayoutStyle(ls.type)}
                  className={`px-3 py-1.5 text-[10px] font-mono rounded-lg transition-all ${
                    layoutStyle === ls.type
                      ? "bg-neutral-950 text-white dark:bg-white dark:text-black shadow-sm"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="mr-1">{ls.icon}</span>{ls.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Aspect Ratio Canvas Live visualizer — full width */}
            <div className="md:col-span-12 flex flex-col items-center">
              <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#262626] bg-[#111111] text-white w-full shadow-xl shadow-black/5 dark:shadow-black/20">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-auto object-contain" 
                  title="Materi Banner Hasil MaxxSales"
                />
              </div>

              {/* Download trigger */}
              <button
                id="btn-download-overlay"
                onClick={downloadOverlayImage}
                className="w-full mt-4 py-3 rounded-xl text-xs font-semibold text-white bg-neutral-950 dark:text-black dark:bg-[#E5E5E5] hover:bg-neutral-900 dark:hover:bg-white flex items-center justify-center space-x-2 transition-all shadow-md shadow-black/10 dark:shadow-black/20"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar Materi (PNG)</span>
              </button>
            </div>

          </div>

          {/* Salinan Tulisan Promosi — full width below canvas */}
          <div className="rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-[#262626] bg-neutral-50 dark:bg-neutral-950/50">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-semibold text-neutral-800 dark:text-white tracking-tight">Salinan Tulisan Promosi</span>
              </div>
              <button
                id="btn-copy-caption"
                onClick={copyCaptionText}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all
                  bg-neutral-900 text-white hover:bg-neutral-800 
                  dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? "Tersalin!" : "Salin Teks"}</span>
              </button>
            </div>

            {/* Caption Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Caption text */}
              <div className="text-sm leading-relaxed text-neutral-700 dark:text-[#d4d4d4] font-sans whitespace-pre-wrap">
                {generatedText.caption}
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1.5">
                {generatedText.hashtags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-[10px] font-mono font-medium
                      bg-neutral-100 text-neutral-600 
                      dark:bg-neutral-800 dark:text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* AI Feedback inline */}
              <div className="pt-2 border-t border-neutral-100 dark:border-[#262626]">
                <AIFeedback promptType="content" responseId={`content-${Date.now()}`} />
              </div>
            </div>
          </div>

          {/* Tips Optimasi — full width */}
          <div className="flex items-start space-x-3 p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#111111]">
            <span className="text-lg mt-0.5">💡</span>
            <div className="text-xs text-neutral-500 dark:text-neutral-500 leading-relaxed">
              <strong className="font-semibold text-neutral-700 dark:text-neutral-300">Tips Optimasi:</strong>{" "}
              Format Stories 9:16 ideal untuk Reels Instagram atau TikTok Stories. Selipkan tautan (link) bio pendaftaran pemesanan di stiker tautan Stories demi konversi optimal!
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
