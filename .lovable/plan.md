# Navy + Neutral Theme Refresh

Shift the app's palette away from the current indigo/violet-on-off-white scheme to a clean, professional **neutral background paired with a high-contrast navy brand color**. All work stays in the design-token layer so every screen updates consistently without touching feature logic.

## What changes

All edits happen in `src/styles.css`, which already drives colors through semantic tokens (`--primary`, `--background`, `--sidebar`, gradients, shadows). Components read these tokens, so no component files need editing.

### Light mode
- **Background**: crisp off-white / very light gray neutral (`oklch(~0.98 0.003 250)`).
- **Cards / popovers**: pure white for subtle lift against the neutral background.
- **Primary (brand navy)**: deep navy (`oklch(~0.35 0.09 255)`) with white foreground for high contrast on buttons, active states, links.
- **Ring / focus**: navy to match primary.
- **Secondary / muted / accent**: soft cool-gray neutrals so navy stays the single dominant accent.

### Dark mode
- **Background**: dark neutral gray (`oklch(~0.20 0.01 255)`), not blue-black.
- **Cards**: slightly lighter dark gray.
- **Primary**: a brighter, legible navy/steel-blue (`oklch(~0.60 0.12 255)`) so it reads as navy but stays visible on dark surfaces, with dark foreground.

### Sidebar
- Deep navy sidebar (`oklch(~0.25 0.07 255)`) in both modes, with light foreground and a navy-tinted active/primary state — reinforcing navy as the brand color.

### Gradients & shadows
- `--gradient-primary` / `--gradient-accent`: retune to navy-based blends (deep navy → steel blue) instead of violet/magenta, so the WelcomeGate splash, brand icon, and accent surfaces match.
- `--shadow-glow`: switch the glow tint to navy.
- `--chart-*`: shift to a navy-anchored, professional palette (navy, steel blue, slate, muted teal, warm neutral) for analytics.

## Out of scope
- No layout, component, or feature-logic changes.
- Typography (Plus Jakarta Sans) stays as-is.

## Verification
- Type-check/build passes.
- Spot-check Dashboard, WelcomeGate splash, sidebar active state, and a form (buttons/inputs) in both light and dark mode via the preview to confirm navy contrast and neutral backgrounds read correctly.
