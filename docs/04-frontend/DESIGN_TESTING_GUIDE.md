# Design Testing Guide - Checkmate.Uno

**Quick Access URLs:**
- 🎮 **Main App:** http://localhost:3000
- 🎨 **Component Library:** http://localhost:3000/components
- 📱 **Game (Local):** http://localhost:3000/game/local
- 🏠 **Home:** http://localhost:3000

---

## Getting Started (2 Steps)

### 1. Start the Frontend Dev Server
```bash
cd frontend
npm run dev
```
Runs on **http://localhost:3000**

### 2. Open Component Library
Navigate to **http://localhost:3000/components** in your browser

---

## Component Library Screen

The `/components` page displays:

### ✅ Buttons
- 4 Variants: Primary, Secondary, Danger, Success
- 3 Sizes: Small, Medium, Large
- States: Normal, Disabled

### ✅ Input Fields
- Label support
- Error messages
- Placeholder text
- Disabled state
- Various input types (email, password, text)

### ✅ Power Cards
- All 8 card types with unique colors:
  - 🟣 Skip Turn (Purple)
  - 🔴 Reverse Move (Red)
  - 🔵 Extra Move (Blue)
  - 🩵 Teleport (Cyan)
  - 🟢 Shield (Green)
  - 🟠 Sacrifice (Orange)
  - 🟡 Wild Swap (Yellow)
  - 🩶 Freeze (Gray-Blue)

### ✅ Chess Board
- 8x8 interactive board
- FEN notation support
- Square selection
- Legal move highlighting
- Piece display

### ✅ Card Component
- With/without title
- Flexible content
- Custom styling

---

## Design Review Checklist

Use this when testing components at http://localhost:3000/components:

### Visual Quality
- [ ] Colors match the design spec (not too bright, not too dull)
- [ ] Borders and shadows look clean
- [ ] Spacing feels balanced
- [ ] Typography is readable

### Dark Mode
- [ ] Toggle dark mode with button in top right
- [ ] Text contrast is sufficient (WCAG AA minimum)
- [ ] Colors are distinct in both modes
- [ ] No unreadable text or invisible elements

### Responsive Design
- [ ] Test at mobile (375px)
- [ ] Test at tablet (768px)
- [ ] Test at desktop (1280px)
- [ ] Components don't overflow

### Interactions
- [ ] Buttons have hover states
- [ ] Hover states are clearly visible
- [ ] Disabled buttons look disabled
- [ ] Inputs focus properly
- [ ] Click areas are large enough (44px minimum)

### Consistency
- [ ] All buttons follow same style
- [ ] All cards have consistent styling
- [ ] Spacing is uniform
- [ ] Color palette is limited and consistent

---

## Components Documentation

### Button
**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `children`: React.ReactNode

**Usage:**
```tsx
<Button variant="primary" size="md">Click Me</Button>
```

### Input
**Props:**
- `label`: string (optional)
- `error`: string (optional error message)
- `disabled`: boolean
- All HTMLInputElement props

**Usage:**
```tsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
/>
```

### PowerCard
**Props:**
- `card`: PowerCard (type, id, usedAt)
- `onClick`: () => void (optional)
- `disabled`: boolean

**Usage:**
```tsx
<PowerCard
  card={{ type: 'skip_turn', id: '1', usedAt: null }}
  onClick={() => console.log('Used card')}
/>
```

### ChessBoard
**Props:**
- `fen`: string (FEN notation, default: starting position)
- `onSquareClick`: (square: string) => void (optional)
- `selectedSquare`: string | null
- `legalMoves`: string[] (array of valid squares)

**Usage:**
```tsx
<ChessBoard
  fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  selectedSquare={selected}
  onSquareClick={setSelected}
  legalMoves={['e3', 'e4']}
/>
```

### Card
**Props:**
- `title`: string (optional)
- `children`: React.ReactNode
- `className`: string (optional)

**Usage:**
```tsx
<Card title="Game Info">
  <p>Game status: In progress</p>
</Card>
```

---

## Sharing Feedback

### Design Issues Found?
Create issues in the format:
- **Component:** Button / Input / PowerCard / ChessBoard / Card
- **Issue:** What's wrong?
- **Location:** Which variant/state?
- **Suggestion:** What would look better?

### Example
> **Component:** PowerCard
> **Issue:** Colors are too saturated and hurt the eyes
> **Location:** All cards in dark mode
> **Suggestion:** Reduce color saturation by 20%

---

## File Structure for Components

```
frontend/src/components/
├── Button.tsx              # Button component
├── Card.tsx                # Card container
├── ChessBoard.tsx          # Chess board with pieces
├── Input.tsx               # Form input field
├── PowerCard.tsx           # Power card component
└── index.ts                # Component exports

frontend/src/app/
└── components/page.tsx     # Design testing page (THIS PAGE)
```

---

## Next Steps

After design review is complete:

1. **Refine Components** - Make adjustments based on feedback
2. **Create More Components** - GameBoard, Modal, Toast, Badge, Spinner
3. **Integrate Backend** - Wire up API calls for real gameplay
4. **Build Game Flow** - Connect components into full game experience

---

## Common Tasks

### Change Button Colors
Edit: `frontend/src/components/Button.tsx`
Search: `variantClasses`

### Adjust Card Spacing
Edit: `frontend/src/components/Card.tsx`
Look for: `p-4` classes

### Modify Power Card Colors
Edit: `frontend/src/components/PowerCard.tsx`
Search: `cardColors` object

### Update Chess Board Appearance
Edit: `frontend/src/components/ChessBoard.tsx`
Look for: `bg-amber-` color classes

---

**Created:** May 16, 2026
**Status:** Ready for Design Review
**Components:** 5 Core Components (25+ Story Variants)
**Theme Support:** Light/Dark modes
**Responsive:** Mobile, Tablet, Desktop
