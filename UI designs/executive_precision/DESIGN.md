---
name: Executive Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#5c5e68'
  on-secondary: '#ffffff'
  secondary-container: '#dedfeb'
  on-secondary-container: '#60626c'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e1e2ed'
  secondary-fixed-dim: '#c4c6d1'
  on-secondary-fixed: '#191b24'
  on-secondary-fixed-variant: '#444650'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.01em
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  mono-sm:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is a hyper-minimalist, high-end framework tailored for professional HR Management Systems. It prioritizes information density without clutter, focusing on executive clarity and functional speed. The style is **Corporate Minimalism**—stripping away decorative elements to favor structural integrity, intentional whitespace, and rigorous typographic alignment. 

The emotional response should be one of "systematic calm" and "reliable efficiency." By utilizing a restricted palette and a sharp geometric language, the interface recedes to let the data lead. There are no gradients, no blurs, and no unnecessary layers; every pixel serves a purpose in the user's workflow.

## Colors
The color strategy uses a "High-Contrast Foundation." The primary background is a cool, neutral gray to reduce eye strain during long sessions, while interactive surfaces are pure white to provide distinct "islands" of information.

- **Primary (#0F172A):** Used for navigation sidebars, primary actions, and headings to provide a solid visual anchor.
- **Surface (#FFFFFF):** Reserved for cards, data tables, and input fields.
- **Success/Warning/Error:** Used sparingly as semantic indicators. These should only appear in status chips, small icons, or thin borders to signal state without overwhelming the minimalist aesthetic.
- **Borders (#E2E8F0):** A light, consistent stroke used to define boundaries in lieu of shadows.

## Typography
This design system utilizes **Geist** for its technical precision and readability. The typographic hierarchy is strictly enforced through weight and tracking rather than just size. 

Key constraints:
- **Tight Tracking:** Headlines and displays must use negative letter spacing to feel "locked" and engineered.
- **Vertical Rhythm:** All line-heights are multiples of 4px to ensure perfect alignment with the spacing grid.
- **Labels:** Use Medium weight (500) for all form labels and small UI metadata to maintain legibility at 12px.

## Layout & Spacing
The layout follows a **Rigid Grid System**. For desktop, a 12-column grid is used with a fixed 24px gutter. All padding and margins must be increments of the 4px base unit.

- **Desktop:** 12-column grid, max-width 1440px, centered.
- **Sidebars:** Fixed width at 260px to maintain consistent navigation.
- **Alignment:** Data tables and lists must align horizontally with the typography's baseline. Use generous padding (32px+) between major sections to prevent the UI from feeling cramped.

## Elevation & Depth
Depth in this design system is achieved through **Tonal Layering** and **Low-contrast Outlines** rather than shadows. 

- **Level 0 (Background):** #F8FAFB.
- **Level 1 (Surface):** Pure #FFFFFF with a 1px border (#E2E8F0).
- **Interactive State:** On hover, surfaces do not lift; instead, the border color darkens to #CBD5E1 or a subtle inner-stroke is added.
- **Shadows:** Only used for "Floating" elements like dropdown menus or modals. Use a single, sharp 1px stroke combined with a very soft, highly diffused neutral shadow (0px 4px 20px rgba(0,0,0,0.05)).

## Shapes
The shape language is professional and architectural. A standard **8px radius** (roundedness 2) is used for all primary containers, buttons, and input fields. This provides a "technical soft" feel—approachable but strictly organized. Smaller components like chips or checkboxes may use a 4px radius to maintain visual proportion.

## Components
- **Buttons:** Solid #0F172A for primary actions with white text. Secondary buttons are white with a 1px #E2E8F0 border. No gradients or rounded-full pills; stick to the 8px radius.
- **Input Fields:** Pure white background, 1px #E2E8F0 border. Focus state is a 1px #0F172A border (no outer glow).
- **Data Tables:** The core of the HRMS. Use a 1px horizontal-only border (#F1F5F9). Header cells should be #F8FAFB with Label-md (500 weight) text in all-caps or sentence case.
- **Status Chips:** Small, 4px rounded rectangles. Use high-transparency backgrounds of the semantic colors (e.g., Emerald at 10% opacity) with full-saturation text for high legibility.
- **Cards:** White surfaces, no shadows, 1px border. Title and Action should be clearly separated by a 1px divider if the card contains complex data.
- **Navigation:** The vertical sidebar should use the Primary color (#0F172A) as the background with reduced-opacity text for inactive states and pure white for active states.