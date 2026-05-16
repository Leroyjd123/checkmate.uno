# Checkmate Design Branding Guide

## Color Palette

### Primary Colors (Dark Theme)
- **Background**: Slate 950 (`#0f172a`) - Main page background
- **Surface**: Slate 900 (`#111827`) - Cards, panels, containers
- **Border**: Slate 800 (`#1e293b`) - Dividers, subtle borders
- **Text Primary**: White (`#ffffff`) - Headings, main text
- **Text Secondary**: Slate 300 (`#cbd5e1`) - Supporting text
- **Text Tertiary**: Slate 400 (`#94a3b8`) - Disabled, hints

### UNO Action Colors
These are the ONLY accent colors allowed:

1. **Green 500** (`#22c55e`)
   - Primary CTA button
   - Success states
   - Local game mode
   - Positive feedback

2. **Blue 500** (`#3b82f6`)
   - Secondary actions
   - Info states
   - Online game mode
   - Links

3. **Red 500** (`#ef4444`)
   - Danger actions
   - Error states
   - vs Computer mode
   - Negative feedback

4. **Yellow 500** (`#eab308`)
   - Warning states
   - Alerts
   - Important notices

### NO Other Colors Allowed
❌ Avoid: Purple, Orange, Cyan, Gray (use Slate instead), Pink, Brown, Amber
✅ Only: Slate, White, Green, Blue, Red, Yellow

## Component Colors

### Buttons
- **Primary**: Green-500 (`bg-green-500 hover:bg-green-400`)
- **Secondary**: Slate-800 (`bg-slate-800 hover:bg-slate-700`)
- **Danger**: Red-500 (`bg-red-500 hover:bg-red-600`)
- **Success**: Green-500 (`bg-green-500 hover:bg-green-600`)

### Cards & Containers
- **Background**: Slate-900 (`bg-slate-900`)
- **Border**: Slate-800 (`border-slate-800`)
- **Hover**: Slate-700 (optional)

### Power Cards (8 Cards, 4 Colors)
1. Skip Turn → Green-500
2. Reverse Move → Red-500
3. Extra Move → Blue-500
4. Teleport → Yellow-500
5. Shield → Green-500
6. Sacrifice → Red-500
7. Wild Swap → Blue-500
8. Freeze → Yellow-500

### Game Modes
- **Local**: Green (friendly, casual)
- **vs Computer**: Red (competitive, challenging)
- **Online**: Blue (social, multiplayer)

### Alerts & Feedback
- **Success**: Green-400 (`text-green-400`)
- **Error**: Red-400 (`text-red-400`)
- **Warning**: Yellow-400 (`text-yellow-400`)
- **Info**: Blue-400 (`text-blue-400`)

### Status Indicators
- **Active**: Green-500 (indicator light)
- **Inactive**: Slate-600 (muted)
- **Error**: Red-500 (warning light)
- **Warning**: Yellow-500 (caution light)

## Typography
- **Font**: System stack (Segoe UI, Roboto, etc.)
- **Headings**: Bold (font-bold)
- **UI Text**: Semibold (font-semibold)
- **Body**: Normal (font-normal)
- **Labels**: Medium (font-medium)

## Border Radius
- **Default**: `rounded` (0.25rem)
- **Small**: `rounded-lg` (0.5rem)
- **Medium**: `rounded-xl` (0.75rem)
- **Large**: `rounded-2xl` (1rem)

## Shadows & Effects
- **NO Shadows**: Flat design
- **Borders**: Use slate-800 for subtle definition
- **Hover**: Use brightness or color shift (no shadows)
- **Active**: Scale or color intensity change

## Input Fields
- **Background**: Slate-900
- **Border**: Slate-700
- **Focus Ring**: Blue-500
- **Error**: Red-500
- **Text**: White

## Badge Colors
- **Green**: Achievement, positive
- **Blue**: Info, neutral
- **Red**: Alert, warning
- **Yellow**: Caution
- **Slate**: Default, muted

## Dark Mode
✅ All components designed for dark theme first
✅ Dark slate background (950) as primary
✅ White text for contrast
✅ Bright accent colors for visibility

## Brand Rules
1. ✅ Dark background always (slate-950 or slate-900)
2. ✅ UNO colors only (Red, Yellow, Blue, Green)
3. ✅ White/Slate text only
4. ✅ No shadows (flat design)
5. ✅ Slate borders for definition
6. ✅ Rounded corners for modern feel
7. ❌ NO gray (use slate instead)
8. ❌ NO other colors besides UNO colors
9. ❌ NO gradients
10. ❌ NO drop shadows

## Examples

### ✅ Correct
```tsx
<button className="bg-green-500 text-white hover:bg-green-400 rounded-lg">
  Play Now
</button>

<div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
  Content here
</div>
```

### ❌ Incorrect
```tsx
// Don't use purple, orange, cyan, gray
<button className="bg-purple-500">Bad</button>
<div className="bg-gray-200">Bad</div>

// Don't use shadows
<div className="shadow-lg">Bad</div>

// Don't use gradients
<div className="bg-gradient-to-r">Bad</div>
```

---
Last updated: May 2026
