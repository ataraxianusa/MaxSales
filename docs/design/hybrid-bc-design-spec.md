# MaxxSales Hybrid Design Spec (B+C)

**Direction:** Indonesian Market Vibrancy + AI Neural Network  
**Theme:** "AI-Powered Market Intelligence"  
**Audience:** Indonesian Entrepreneurs (Pengusaha)  
**Date:** 2026-06-28  

---

## Design Thesis

MaxxSales is where **traditional Indonesian market wisdom** meets **cutting-edge AI optimization**. The visual identity should feel:

- **Culturally familiar** - Entrepreneurs feel "this is for me"
- **Technologically advanced** - Feels powerful, smart, and modern
- **Distinctively fusion** - Not generic AI startup, not old-school business

---

## Token System

### 🎨 Color Palette (6 Named Values)

| Name | Hex | Role | Inspiration |
|------|-----|------|-------------|
| `market-indigo` | #1E3A8A | Primary Brand | Indonesian batik depth, wisdom |
| `ai-violet` | #8B5CF6 | Secondary/Accent | AI intelligence, futurism |
| `data-cyan` | #06B6D4 | Data/Connections | Data flow, clarity |
| `urgent-red` | #EF4444 | Actions, CTAs | Market urgency, energy |
| `earth-terracotta` | #C2410C | Warm Accent | Earthy grounding, tradition |
| `linen-base` | #FDFBF7 | Light Background | Natural market canvas |

**Dark Mode Adjustments:**
- `space-dark`: #0A0A0A (Background)
- `charcoal-surface`: #1A1A1A (Cards/Surfaces)
- `stone-border`: #2A2A2A (Borders)

### 🔤 Typography

| Role | Font Family | Weights | Character |
|------|-------------|---------|------------|
| **Display/Headings** | Playfair Display | 400, 700, 900 | Elegant, premium, cultural |
| **Body/Text** | Inter | 300, 400, 500, 700 | Clean, modern, readable |
| **Code/Utility** | Space Mono | 400, 700 | Tech-forward, data feel |

**Type Scale:**
- H1: 3.5rem-5rem (Playfair Display Black)
- H2: 2rem-3rem (Playfair Display Bold)
- H3: 1.5rem-2rem (Inter Bold)
- Body: 1rem (Inter Regular)
- Small: 0.875rem (Inter Regular)
- Micro: 0.75rem (Space Mono)

### 📐 Layout Concept

**Philosophy:** "Market Path with Smart Connections"

- **Hero:** Asymmetric split - Market texture left, AI neural right
- **Sections:** Flow like walking through a smart market
- **Grid:** Subtle hexagonal pattern (honeycomb = AI neural + market organization)
- **Spacing:** Generous but intentional (market stalls have breathing room)

**Container:** max-w-7xl (1400px max)
**Gutter:** 1.5rem (24px) mobile, 2rem (32px) desktop

### ✨ Signature Element

**"Market Neural Network" Background**

- Subtle animated element where:
  - Batik pattern lines morph into neural network connections
  - Nodes pulse with ai-violet color on interaction
  - Lines flow like data between market stalls
- **Placement:** Hero section background, subtle opacity
- **Animation:** Slow, elegant, not distracting
- **Metaphor:** "Traditional knowledge + AI optimization = MaxxSales"

**Visual Metaphor:**
- **Nodes** = Market stalls/Businesses
- **Connections** = Sales channels/Data flow
- **Pulses** = AI insights/Opportunities

---

## Component-Specific Design

### Hero Section

**Background:** 
- Gradient: linen-base → market-indigo (top to bottom)
- Overlay: Market Neural Network pattern at 5% opacity
- Texture: Subtle paper/grain for organic feel

**Headline Treatment:**
```
Ubah Produk Biasa Jadi
[Luar Biasa]
```
- "Luar Biasa" in market-indigo with ai-violet gradient
- Playfair Display Black (900)
- Tracking: -0.02em for tight feel

**Subheadline:**
- Inter Medium
- Color: earth-terracotta (warm, inviting)
- Size: 1.25rem-1.5rem

**CTA Buttons:**
- Primary: ai-violet background, urgent-red hover
- Secondary: linen-base background, market-indigo text, ai-violet border

### Feature Showcase

**Card Design:**
- Background: charcoal-surface
- Border: 1px stone-border
- Shadow: Subtle elevation with ai-violet glow on hover
- Corner radius: 1rem (16px) - friendly but modern

**Mockup Treatment:**
- Device frames: Market-indigo with ai-violet accent
- Screen content: Warm earth tones with data-cyan highlights
- Animation: Subtle neural pulse on hover

### Trust Signals

**Visual Treatment:**
- Icons: data-cyan color
- Text: earth-terracotta
- Container: Subtle market-indigo/10 background
- Animation: Gentle pulse using ai-violet

---

## Motion & Interaction

### Animations

1. **Neural Pulse** (Signature)
   ```css
   @keyframes neural-pulse {
     0%, 100% { opacity: 0.3; transform: scale(1); }
     50% { opacity: 0.8; transform: scale(1.05); }
   }
   ```
   - Used on: CTA buttons, interactive cards
   - Color: ai-violet glow

2. **Market Flow**
   ```css
   @keyframes market-flow {
     0% { background-position: 0% 50%; }
     100% { background-position: 100% 50%; }
   }
   ```
   - Used on: Hero background gradient
   - Speed: 20s (slow, elegant)

3. **Node Connection**
   - SVG path drawing animation
   - Lines appear to connect like neural synapses
   - Color transition: market-indigo → ai-violet

### Hover States

- **Cards:** ai-violet border glow + 4px lift
- **Buttons:** Color shift + neural pulse
- **Links:** earth-terracotta → urgent-red transition
- **Icons:** Scale 1.1 + ai-violet glow

### Reduced Motion

All animations respect `prefers-reduced-motion`:
- Reduced: Opacity fades only, no movement
- Full: All animations as specified

---

## Copywriting Direction

**Tone:** 
- **Warm but Smart** - Friendly Indonesian entrepreneur voice
- **Action-Oriented** - Every sentence drives toward action
- **Benefit-Focused** - What the user gains, not what the product does

**Language:**
- Indonesian throughout
- Avoid: UMKM, UKM, Mikro (per terminology policy)
- Use: Pengusaha, Pelaku Usaha, Bisnis Anda

**Key Phrases:**
- "Strategi Jitu" (Smart Strategy)
- "Intelijen Pasar" (Market Intelligence)
- "Eksekusi Cepat" (Fast Execution)
- "Hasil Nyata" (Real Results)

---

## Accessibility

- **Color Contrast:** All text meets WCAG AA (4.5:1 minimum)
- **Focus States:** Visible ai-violet ring on keyboard navigation
- **Motion:** Respects prefers-reduced-motion
- **Semantic HTML:** Proper heading hierarchy, ARIA labels

---

## Breakpoints

| Name | Min-Width | Columns | Notes |
|------|-----------|---------|-------|
| Mobile | 0px | 1 | Stacked layout |
| Tablet | 768px | 2 | Side-by-side cards |
| Desktop | 1024px | 3-4 | Full showcase |
| Wide | 1280px | 5 | Max layout |

---

## File Changes Required

1. **src/index.css**
   - Add new color variables
   - Add new animations
   - Update existing styles

2. **src/components/LandingPage.tsx**
   - Complete redesign with new token system
   - New layout structure
   - New copy
   - New interactive elements

3. **src/main.tsx** (if needed)
   - Font imports (Playfair Display, Inter, Space Mono)

---

## Success Criteria

- [ ] Design is instantly recognizable as "not a template"
- [ ] Cultural resonance for Indonesian entrepreneurs
- [ ] Tech sophistication feels authentic, not gimmicky
- [ ] One signature element is memorable and unique
- [ ] All animations are smooth and respect reduced motion
- [ ] Responsive down to 320px
- [ ] CI/CD deployable without errors
- [ ] Zero console warnings/errors

---

**Status:** Ready for Implementation  
**Next:** Execute design in code