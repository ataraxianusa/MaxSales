---
name: motion-landing-animations
description: Motion/React landing page animation & layout patterns — scroll reveals, interactive checklists, CTA shimmers, hover lifts, emoji loops, copy feedback, 2-col hero balancing, section merging. Use when building animated landing/sales pages with the motion library (v12+ / Framer Motion successor) in React + Tailwind projects.
source: auto-skill
extracted_at: '2026-06-25T08:31:44.138Z'
---

# Motion/React Landing Page Animation Patterns

## When to Use

- Building animated landing page sections (hero, showcase, cards, CTAs)
- Adding scroll-triggered reveals to sections below the fold
- Making checklist/todo items interactive with micro-animations
- Adding hover lift, shimmer, or pulse effects to cards and buttons
- Working with the `motion` npm package (Framer Motion v12+/successor)

---

## 1. Critical Import Gotcha

```tsx
// ❌ WRONG — no named export 'motion'
import { motion } from "motion";

// ✅ CORRECT — use the /react subpath
import { motion } from "motion/react";
```

The `motion` package (npm, v12+) splits its exports. The React component wrapper lives at `motion/react`. The root export is the imperative animation API.

---

## 2. Scroll-Triggered Reveals (`whileInView`)

Use when a section is below the fold and should animate in as the user scrolls to it.

```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.6 }}
>
  {/* content */}
</motion.div>
```

| Prop | Purpose |
|---|---|
| `initial` | Invisible state before scroll |
| `whileInView` | Target state when element enters viewport |
| `viewport.once: true` | Play animation only the first time (avoid re-triggering on scroll-back) |
| `viewport.margin` | Trigger earlier (negative = "already X px inside viewport"). `"-80px"` means "when element is 80px past the bottom edge" |
| `transition.duration` | Speed of the reveal (0.4–0.7s feels natural) |

**Staggered pair:** For side-by-side cards, slide them in from opposite directions:

```tsx
{/* Left card */}
<motion.div
  initial={{ opacity: 0, x: -30 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, margin: "-60px" }}
  transition={{ duration: 0.5, delay: 0.1 }}
/>

{/* Right card — slightly later */}
<motion.div
  initial={{ opacity: 0, x: 30 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: true, margin: "-60px" }}
  transition={{ duration: 0.5, delay: 0.25 }}
/>
```

---

## 3. Card Hover Lift with Colored Shadow

```tsx
<motion.div
  whileHover={{
    y: -4,
    boxShadow: "0 20px 40px -12px rgba(52,211,153,0.15)"  // emerald glow
  }}
  className="... shadow-xl shadow-black/30 transition-shadow duration-300"
>
```

- Combine `whileHover` with Tailwind's `transition-shadow` on the class for smooth exit
- Use different colored shadows per card type (emerald for primary, cyan for secondary, purple for accent)
- `y: -4` is subtle — don't go above -6 or it looks floaty

---

## 4. Interactive Checklist with Animated Toggle

State-driven: checking an item triggers a bounce animation on the checkbox.

```tsx
const [checklist, setChecklist] = useState([
  { id: 1, label: "Task one", done: true },
  { id: 2, label: "Task two", done: false },
]);

const toggleChecklist = (id: number) => {
  setChecklist(prev => prev.map(item =>
    item.id === id ? { ...item, done: !item.done } : item
  ));
};

// In JSX:
{checklist.map(item => (
  <motion.label
    key={item.id}
    whileHover={{ scale: 1.01, x: 2 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => toggleChecklist(item.id)}
    className={item.done
      ? "bg-emerald-500/5 border-emerald-500/15"
      : "border-neutral-800 bg-[#0a0a0a] hover:bg-amber-500/5"
    }
  >
    {/* Animated checkbox — bounces when toggled on */}
    <motion.div
      animate={item.done ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.3 }}
      className={item.done
        ? "bg-emerald-500 border-emerald-500"
        : "border-neutral-700 bg-transparent"
      }
    >
      {item.done && <Check className="w-3 h-3 text-black" />}
    </motion.div>

    {/* Text — strikethrough when done */}
    <span className={item.done
      ? "text-neutral-500 line-through"
      : "text-white font-medium"
    }>
      {item.label}
    </span>
  </motion.label>
))}
```

Key points:
- Use `animate` on the checkbox div **only when done** to trigger the keyframe
- `scale: [1, 1.2, 1]` = bounce in, bounce back — quick and satisfying
- `whileTap: scale 0.99` gives tactile press feedback
- `whileHover` with `x: 2` gives a subtle rightward nudge

---

## 5. CTA Shimmer Sweep

A pseudo-element that sweeps a white gradient across the button on hover. Pure CSS, no JS.

```tsx
<button className="group relative ... overflow-hidden">
  {/* Shimmer sweep — hidden off-screen, slides in on hover */}
  <span className="absolute inset-0 w-full h-full
    bg-gradient-to-r from-transparent via-white/20 to-transparent
    -translate-x-full group-hover:translate-x-full
    transition-transform duration-700 ease-in-out"
  />
  <span className="relative z-10 flex items-center gap-2">
    CTA Text
  </span>
</button>
```

| Property | Role |
|---|---|
| `overflow-hidden` on button | Clips the sweep to button bounds |
| `via-white/20` | Brightness of the shimmer stripe |
| `-translate-x-full` → `translate-x-full` | Sweeps left-to-right |
| `duration-700` | ~0.7s feels premium; faster = glitchy, slower = sluggish |
| `z-10` on content | Keeps text above the shimmer layer |

---

## 6. Emoji Floating / Rocking Loops

Small emoji icons that animate infinitely to draw attention without being distracting.

```tsx
{/* Vertical float — up and down */}
<motion.span
  animate={{ y: [0, -4, 0] }}
  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
  className="text-lg"
>
  🚀
</motion.span>

{/* Gentle rock — slight rotation */}
<motion.span
  animate={{ rotate: [0, -8, 8, 0] }}
  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
  className="text-lg"
>
  💬
</motion.span>
```

- Keep amplitude small: `y: [0, -4, 0]` (4px), `rotate: [0, -8, 8, 0]` (8°)
- Duration 2.5–3s feels natural — not too fast, not sleepy
- `delay` on the second card's emoji so they don't move in sync

---

## 7. Copy-to-Clipboard Feedback

Button that briefly shows "Tersalin!" (Copied!) with a green state before reverting.

```tsx
const [copied, setCopied] = useState(false);

const handleCopy = () => {
  setCopied(true);
  setTimeout(() => setCopied(false), 1800);
};

<motion.button
  whileTap={{ scale: 0.96 }}
  onClick={handleCopy}
  className={copied
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : "bg-cyan-500/15 text-cyan-400 border-cyan-500/25 hover:bg-cyan-500/25"
  }
>
  {copied
    ? <><Check className="w-3 h-3" /> Tersalin!</>
    : <><Copy className="w-3 h-3" /> Salin Teks</>
  }
</motion.button>
```

- 1800ms timeout is enough to read the feedback, short enough not to linger
- Green success state replaces the original color — clear state change
- `whileTap` adds tactile confirmation

---

## 8. Pulse Opacity for "Live" Indicators

Footer text or status badges that subtly pulse to suggest "this is live / updating."

```tsx
<motion.p
  animate={{ opacity: [0.6, 1, 0.6] }}
  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  className="text-[10px] text-neutral-500"
>
  ⚡ Template diperbarui otomatis setiap pagi oleh AI
</motion.p>
```

- Opacity range 0.6 → 1 → 0.6 is subtle — don't go below 0.4
- Duration 2s: faster looks like a glitch, slower is invisible

---

## Anti-Patterns to Avoid

- **Don't animate everything.** Pick 2–3 key moments per section. Over-animation kills credibility.
- **Don't use `whileInView` above the fold.** Hero sections should use `animate` with CSS `animation-delay` or `transition.delay` since they're visible on load.
- **Don't nest motion elements deeply.** Each `motion.*` creates a Framer Motion node. For lists, only wrap the container if items are static.
- **`viewport.once: true`** is almost always right for landing pages. Without it, scrolling back up re-triggers animations and annoys users.

---

## 9. 2-Column Hero Layout (Text Left + Visual Right)

### When to Use

When the landing page hero is a long vertical stack (badge → headline → sub-text → CTAs → trust signals → preview cards) and the page feels too tall before the user sees any product value. Restructure into a side-by-side layout: **left = text content, right = interactive product preview/mockup**.

### The Layout

```
┌──────────────────────────────────────────────────┐
│  🟢 Badge (centered, full-width above grid)      │
├───────────────────────┬──────────────────────────┤
│  LEFT (text)          │  RIGHT (preview mockup)   │
│  - Headline           │  - Compact Daily Pulse    │
│  - Sub-headline       │    checklist card         │
│  - CTA buttons        │  - Interactive toggles    │
│  - Trust signals      │  - Animated emoji         │
│                       │  - Footer stats           │
├───────────────────────┴──────────────────────────┤
│  Below: standalone card (Amunisi/Copy templates) │
└──────────────────────────────────────────────────┘
```

### Implementation

```tsx
<div className="relative max-w-6xl mx-auto mb-10 pt-4">

  {/* Badge — centered, full width, ABOVE the grid */}
  <div className="flex justify-center mb-6 ...">
    <div className="inline-flex ... rounded-full ...">...</div>
  </div>

  {/* 2-Column Grid — kicks in at lg breakpoint */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

    {/* LEFT: Text content */}
    <div className="text-center lg:text-left">
      <h1 className="text-4xl sm:text-5xl lg:text-6xl ...">...</h1>
      <p className="text-sm sm:text-base text-neutral-400 ...">...</p>
      {/* CTAs — left-aligned on desktop */}
      <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
        <button>Primary CTA</button>
        <button>Secondary CTA</button>
      </div>
      {/* Trust signals — left-aligned on desktop */}
      <motion.div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 ...">
        ...
      </motion.div>
    </div>

    {/* RIGHT: Product preview / mockup */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] overflow-hidden shadow-xl"
    >
      {/* Compact card — same components, smaller text/padding */}
    </motion.div>

  </div>
</div>
```

### Key Descope Decisions

When moving an element from below-the-fold into the hero's right column:

1. **Make it compact** — reduce font sizes (`text-sm` → `text-xs`), padding (`px-5 py-4` → `px-4 py-3`), and icons
2. **Remove secondary text** — the description line under each checklist item can go; keep only the action label
3. **Shorten the footer** — `"2/3 tugas selesai hari ini"` → `"2/3 tugas"`
4. **One card only** — don't stack multiple cards in the right column; pick the most visually compelling one

### Alignment Handling

| Element | Mobile | Desktop (lg+) |
|---|---|---|
| Badge | `justify-center` | `justify-center` (always centered) |
| Headline | `text-center` | `lg:text-left` |
| Sub-text | `text-center` | `lg:text-left` |
| CTA row | `items-center` | `lg:items-start` |
| Trust signals | `justify-center` | `lg:justify-start` |
| Mockup card | Full width | `max-w-[440px]` natural |

### Removing Redundancy

After moving the mockup into the hero, the original below-the-fold showcase section now has a **duplicate card**. Remove it:

- If the section had 2 cards (Daily Pulse + Amunisi), keep only the one NOT in the hero
- Update the section header text to reflect what remains
- Change the layout from 2-column grid to a single centered `max-w-2xl`

### Post-Restructure Verify

1. `tsc --noEmit` passes
2. No orphaned `lg:col-span-*` classes on cards no longer in a grid
3. No duplicate React keys from cloned components
4. The old `animate-fade-in` class on the hero wrapper is removed (now handled by grid's `motion.div` children)

---

## 10. Proportion Rebalancing (Reverse the Compact Strategy)

### When to Use

The user placed a mockup card in the hero right column using the compact approach (Section 9), but now complains the **left text is too big and the right card is too small** — the proportions look unbalanced. The compact strategy was too aggressive; reverse it selectively.

### Diagnosis

The problem is usually **vertical mismatch**: the left column has a tall headline + long paragraph + multiple CTAs, while the right column has a tiny card that doesn't fill the height. The grid's `items-center` centers the small card vertically, leaving empty space above and below.

### Fix: Three Levers

**Lever 1 — Shrink the left text**
```tsx
// BEFORE (too big)
<h1 className="lg:text-6xl xl:text-7xl ...">
<p className="text-sm sm:text-base ...">   ← 2 sizes, long paragraph

// AFTER (balanced)
<h1 className="lg:text-5xl xl:text-6xl ...">  ← drop one size step
<p className="text-sm ... max-w-md">           ← single size, tighter copy
```

Also tighten the copy itself — remove filler words, merge sentences:
```
BEFORE: "MaxxSales adalah Sistem Operasi Pertumbuhan Bisnis berbasis AI yang dirancang khusus untuk Pengusaha Taktis — mengubah data penjualan, intelijen kompetitor, dan insight pasar menjadi langkah eksekusi harian yang langsung bisa dikerjakan."

AFTER:  "MaxxSales — Sistem Operasi Pertumbuhan Bisnis berbasis AI untuk Pengusaha Taktis. Ubah data penjualan & intelijen pasar jadi langkah eksekusi harian."
```

**Lever 2 — Enlarge the right card**
```tsx
// Reverse every compact decision from Section 9:
// BEFORE (too compact)
className="px-4 py-3"           // small padding
className="text-base"           // small emoji
className="text-xs sm:text-sm"  // small heading
className="w-3.5 h-3.5"        // small checkbox
className="text-xs leading-snug"// small label text
// no description text

// AFTER (balanced)
className="px-5 py-4"           // restore padding
className="text-xl"             // bigger emoji
className="text-sm sm:text-base"// bigger heading
className="w-4 h-4"            // restore checkbox size
className="text-sm"            // restore label size
<p>{item.desc}</p>             // restore description line
```

**Lever 3 — Use `items-stretch` instead of `items-center`**
```tsx
// BEFORE — cards centered, empty space above/below
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

// AFTER — cards stretch to fill height
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
```

Then add `flex flex-col flex-1` to the checklist body to push the footer to the bottom:
```tsx
<div className="p-4 sm:p-5 space-y-3 flex-1">
  {/* checklist items */}
</div>
```

### Before/After Checklist

| Aspect | Too Compact | Balanced |
|---|---|---|
| Left h1 size | `6xl` / `7xl` | `5xl` / `6xl` |
| Left paragraph | 3 lines, verbose | 2 lines, tight |
| Left CTA padding | `px-8 py-3.5` | `px-7 py-3` |
| Right card padding | `px-4 py-3` | `px-5 py-4` |
| Right emoji size | `text-base` | `text-xl` |
| Right heading | `text-xs sm:text-sm` | `text-sm sm:text-base` |
| Right checkbox | `w-3.5 h-3.5` | `w-4 h-4` |
| Right label text | `text-xs` no desc | `text-sm` + desc |
| Grid alignment | `items-center` | `items-stretch` |
| Checklist body | `p-3 space-y-2` | `p-5 space-y-3 flex-1` |

---

## 11. Merging Stacked Sections into a 2-Col Row

### When to Use

The landing page has two separate sections stacked vertically (e.g., "Amunisi Komunikasi" card + "Dashboard Preview" card), each with its own header, taking up too much vertical space. Merge them into a single 2-column grid row under one shared header.

### Pattern

```
BEFORE (stacked — too tall):          AFTER (2-col — compact):
┌──────────────────────────┐          ┌──────────────────────────┐
│ ✦ Show, Don't Just Tell  │          │ ✦ Show, Don't Just Tell  │
│ Amunisi Komunikasi       │          │ Tools Andalan Bisnis     │
│ ┌──────────────────┐     │          ├────────────┬─────────────┤
│ │ 💬 WA Blast      │     │          │ 💬 Amunisi │ Dashboard   │
│ │ 📋 Salin         │     │          │ WA Blast   │ [Tabs]      │
│ │ 💜 IG Caption    │     │          │ IG Caption │ [Viewport]  │
│ │ 📋 Salin         │     │          │ [Salin]    │             │
│ └──────────────────┘     │          ├────────────┴─────────────┤
│                          │          └──────────────────────────┘
│ ✦ INTUITIVE PREVIEW      │
│ Sekilas Cockpit...       │
│ ┌──────────────────┐     │
│ │ [Tabs]           │     │
│ │ [Viewport]       │     │
│ └──────────────────┘     │
└──────────────────────────┘
```

### Implementation

**Step 1 — Unify the header**
Remove individual section headers. Create one shared header above the grid:

```tsx
<div className="max-w-6xl mx-auto mb-20">
  <motion.div ... className="text-center mb-6">
    <span>✦ Show, Don't Just Tell ✦</span>
    <h2>Tools Andalan Bisnis Anda</h2>  {/* generic, covers both */}
  </motion.div>
```

**Step 2 — Wrap both cards in a grid**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

  {/* LEFT: Amunisi Komunikasi */}
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    ...
    className="rounded-2xl border border-cyan-500/20 bg-[#0c0c0c] ..."
  >
    {/* full card content */}
  </motion.div>

  {/* RIGHT: Dashboard Preview */}
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.15 }}  {/* slight stagger */}
    className="border border-neutral-800 bg-[#0c0c0c] rounded-2xl ..."
  >
    {/* dashboard content — tabs + viewport */}
  </motion.div>

</div>
</div>  {/* closes the outer wrapper */}
```

**Step 3 — Remove old wrapper divs**
The old sections each had their own `className="max-w-4xl mx-auto mb-20"` wrappers. Remove those — the grid now handles layout. Strip individual `{/* Section header */}` motion.divs.

**Step 4 — Adjust stagger delays**
Left card: `delay: 0` (default). Right card: `delay: 0.15`. This creates a cascade effect.

**Step 5 — Close the grid correctly**
If the right column contains deeply nested markup (like a tabbed dashboard with its own div layers), double-check:
```tsx
</motion.div>   {/* closes RIGHT card */}
</div>           {/* closes grid */}
</div>           {/* closes outer wrapper */}
```

### Common Pitfall

When the right column's content originally came from a section with its own outer `<div className="border...">` wrapper, that wrapper becomes redundant. Remove it and let the `motion.div` be the new outer container. Otherwise you get double borders and misaligned shadows.

### Verify
1. `tsc --noEmit` — nested motion.divs with missing closers will error
2. No orphan `max-w-4xl mx-auto` wrappers inside the grid
3. No `lg:col-span-*` classes remain on cards (they're grid siblings now, not grid children)
4. Header text covers both cards generically (not "Lihat Amunisi" when the right is a dashboard)