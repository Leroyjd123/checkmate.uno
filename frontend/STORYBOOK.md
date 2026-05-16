# Storybook - UI Component Library & Design Testing

**Status:** ✅ Set up and running  
**Purpose:** Isolated component testing, design system review, and visual QA  
**Access:** http://localhost:6006

---

## Quick Start

```bash
npm run storybook
```

Storybook will launch on **http://localhost:6006** with all component stories.

---

## What's Included

### ✅ Components Created (Phase 1)

1. **Button** (`src/components/Button.tsx`)
   - Variants: primary, secondary, danger, success
   - Sizes: sm, md, lg
   - States: normal, disabled, hover
   - Stories: [Primary, Secondary, Danger, Success, Small, Large, Disabled, AllVariants]

2. **Card** (`src/components/Card.tsx`)
   - Optional title support
   - Custom width via className
   - Stories: [Simple, WithTitle, WithLongContent, CustomWidth]

3. **Input** (`src/components/Input.tsx`)
   - Label support
   - Error state with message
   - Disabled state
   - Stories: [Simple, WithLabel, WithError, Disabled, RoomCode, PasswordInput]

4. **PowerCard** (`src/components/PowerCard.tsx`)
   - All 8 card types with unique colors:
     - Skip Turn (purple)
     - Reverse Move (red)
     - Extra Move (blue)
     - Teleport (cyan)
     - Shield (green)
     - Sacrifice (orange)
     - Wild Swap (yellow)
     - Freeze (blue-gray)
   - Click handler for use
   - Disabled state
   - Stories: [SkipTurn, ReverseMove, ExtraMove, Teleport, Shield, Sacrifice, WildSwap, Freeze, Disabled, AllCards]

5. **ChessBoard** (`src/components/ChessBoard.tsx`)
   - 8x8 interactive board
   - FEN notation support
   - Square click handling
   - Legal moves highlighting (green rings)
   - Selected piece highlighting (yellow ring)
   - Stories: [StartingPosition, MidGame, EndGame, WithLegalMoves, WithSelectedSquare, Interactive]

---

## Storybook File Structure

```
frontend/
├── .storybook/
│   ├── main.ts                    # Storybook config (stories location, addons)
│   └── preview.ts                 # Global preview config (styles, decorators)
├── src/
│   └── components/
│       ├── Button.tsx             # Component implementation
│       ├── Button.stories.tsx      # Component stories
│       ├── Card.tsx
│       ├── Card.stories.tsx
│       ├── ChessBoard.tsx
│       ├── ChessBoard.stories.tsx
│       ├── Input.tsx
│       ├── Input.stories.tsx
│       ├── PowerCard.tsx
│       ├── PowerCard.stories.tsx
│       └── index.ts               # Component exports
```

---

## Using Storybook for Design Testing

### 1. **Component Review**
   - View all variants and states
   - Check dark/light mode rendering
   - Verify responsive behavior
   - Test hover/active states

### 2. **Visual QA**
   - Inspect color consistency
   - Check spacing and alignment
   - Verify typography
   - Test accessibility features

### 3. **Cross-Browser Testing**
   - Storybook runs in browser
   - Test across Chrome, Firefox, Safari
   - Mobile device testing via ngrok or local network

### 4. **Collaborative Design Reviews**
   - Share Storybook via ngrok: `ngrok http 6006`
   - Team can review without cloning repo
   - Quick feedback loop

---

## Story Naming Convention

Each component has multiple stories showcasing different states:
- Default/Primary state
- Size/variant combinations
- Error states
- Disabled states
- Interactive examples with hooks
- Gallery views (AllVariants, AllCards)

Format: `src/components/ComponentName.stories.tsx`

---

## Adding New Components

1. Create component file: `src/components/MyComponent.tsx`
2. Create story file: `src/components/MyComponent.stories.tsx`
3. Import story example:
   ```tsx
   import type { Meta, StoryObj } from '@storybook/react';
   import { MyComponent } from './MyComponent';

   const meta = {
     title: 'Components/MyComponent',
     component: MyComponent,
     tags: ['autodocs'],
   } satisfies Meta<typeof MyComponent>;

   export default meta;
   type Story = StoryObj<typeof meta>;

   export const Primary: Story = {
     args: { /* your props */ },
   };
   ```
4. Restart Storybook - stories auto-discover

---

## Theme Support in Storybook

All components support:
- **Light mode** (default)
- **Dark mode** (dark: prefixes via Tailwind)

Storybook preview wraps stories in dark theme decorator. Toggle dark mode in Storybook UI.

---

## Available Addons

- **Essentials** - Controls, Actions, Docs, Viewport
- **Links** - Navigate between stories
- **Interactions** - User interaction testing

---

## Next Steps

### Phase 2 Components (Planned)
- [ ] GameBoard (with drag-and-drop)
- [ ] GameHeader (with player info, turn indicator)
- [ ] GameSidebar (with cards panel)
- [ ] Modal (for dialogs)
- [ ] Toast (for notifications)
- [ ] Badge (for status)
- [ ] Spinner (for loading)

---

## Commands

```bash
# Start Storybook dev server
npm run storybook

# Build Storybook for deployment
npm run build-storybook

# Run Storybook tests (Vitest)
npm run test

# Run Vitest in watch mode
npm run test:watch
```

---

## Troubleshooting

**Storybook won't start?**
- Run `npm install --legacy-peer-deps` to resolve dependency conflicts
- Check port 6006 is not in use: `npx kill-port 6006`

**Components not showing?**
- Ensure `.stories.tsx` files are in `src/components/`
- Check main.ts has correct stories pattern: `'../src/**/*.stories.{js,jsx,ts,tsx}'`

**Dark mode not working?**
- Verify Tailwind CSS is imported in preview.ts: `import "../src/app/globals.css"`
- Check `dark:` prefixes in component classes

---

## Design Review Checklist

Use this when testing components in Storybook:

- [ ] All variants render correctly
- [ ] Dark mode looks good
- [ ] Colors match design tokens
- [ ] Text is readable (contrast ratio > 4.5:1)
- [ ] Spacing is consistent
- [ ] Borders/shadows are clean
- [ ] Hover states are visible
- [ ] Disabled state is clear
- [ ] No console errors
- [ ] Responsive at mobile/tablet/desktop

---

**Last Updated:** May 16, 2026  
**Status:** Phase 1 - 5 Core Components Ready for Design Review
