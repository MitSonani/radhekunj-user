---
trigger: always_on
---

---
description: Brand color palette and visual design system for the User Panel
globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "**/*.scss"]
alwaysApply: true
---

# Brand Design System

The User Panel must NOT use a generic black-and-white e-commerce color scheme.

The primary brand direction is based on a rich, deep green.

The overall visual identity should feel:

- Premium
- Elegant
- Natural
- Modern
- Fashion-forward
- Warm
- Sophisticated

The green should be the recognizable brand color.

---

# Primary Brand Color

Use a deep, rich green as the primary brand color.

Primary:

#164A35

This is the main brand green.

Use it for:

- Primary buttons
- Important CTAs
- Active navigation states
- Selected states
- Important links
- Brand accents
- Promotional elements where appropriate

Do NOT use the primary green everywhere.

It should remain an accent and brand identifier.

---

# Supporting Green Colors

Use a small green scale instead of creating random green shades.

Suggested palette:

Primary Green:
#164A35

Dark Green:
#0F3326

Medium Green:
#28624A

Soft Green:
#DDEBE3

Very Soft Green:
#F0F6F2

These colors should be centralized as design tokens.

Do not hardcode different green values throughout individual components.

---

# Background

Do NOT use pure white as the only background.

Use a warm off-white / cream base.

Primary background:

#FAF9F5

Secondary background:

#F3F5F0

Card/surface background:

#FFFFFF

The overall page should feel warm rather than stark.

---

# Text Colors

Do NOT use pure black (#000000) for all text.

Use deep neutral tones.

Primary text:

#1C2822

Secondary text:

#56625C

Muted text:

#7A837E

This creates a softer premium appearance.

---

# Borders

Use subtle neutral/green-tinted borders.

Default border:

#DDE3DE

Soft border:

#E8ECE8

Do not use heavy black borders.

Borders should generally be subtle.

---

# Accent Color

Use a restrained warm accent that complements deep green.

Preferred accent:

#C49A5A

This is a muted warm gold.

Use it sparingly for:

- Premium badges
- Small decorative accents
- Special collection labels
- Important promotional details

Do NOT use gold as a primary UI color.

Green remains the primary brand identity.

---

# Color Hierarchy

The approximate visual hierarchy should be:

Deep Green
        ↓
Warm Cream / Off-White
        ↓
White
        ↓
Dark Neutral Text
        ↓
Muted Neutral
        ↓
Soft Green
        ↓
Muted Gold Accent

The design should feel predominantly green + warm neutral.

---

# Avoid

Do NOT use:

- Pure black as the primary brand color
- Pure white + black as the main visual system
- Neon green
- Bright lime green
- Highly saturated green
- Multiple unrelated accent colors
- Purple unless explicitly required
- Blue unless required for system/status purposes
- Random gradients
- Random color values

Avoid generic SaaS-style color palettes.

---

# Buttons

Primary button:

Background:
#164A35

Text:
#FFFFFF

Hover:
#0F3326

Secondary button:

Background:
transparent or #F0F6F2

Text:
#164A35

Border:
#164A35

Use existing shared Button components.

Do not create page-specific button colors.

---

# Navigation

The navigation should remain clean and elegant.

Default:

Text:
#1C2822

Active/hover:

#164A35

Avoid making every navigation item green.

Use green to communicate interaction/state.

---

# Product Cards

Product cards should remain visually clean.

Do not place large colored backgrounds behind every product.

Prefer:

Warm/off-white page background
+
White or subtle surface
+
Deep green typography/interaction
+
Minimal accent

The product image should remain the visual focus.

---

# Product Price

Regular price:

#1C2822

Sale price:

#164A35

Compare-at/original price:

#7A837E

Discount indicator:

Use the green palette or muted accent where appropriate.

Do not make discount labels excessively bright.

---

# Status Colors

Business status colors may use additional colors when necessary.

For example:

Success:
Use a suitable green variation.

Warning:
Use a warm amber/yellow.

Error:
Use a restrained red.

Info:
Use a suitable blue if required.

These functional colors are exceptions to the brand palette.

Do not force every status into green.

---

# Sections

Use alternating subtle surfaces to create hierarchy.

Example:

Hero:
#F0F6F2

Product sections:
#FAF9F5

Product cards:
#FFFFFF

Editorial section:
#164A35

Footer:
#0F3326

Do not make every section a different color.

Use background changes sparingly.

---

# Hero Section

The hero should strongly establish the brand.

Possible direction:

Warm cream/soft green background
+
Large fashion/product imagery
+
Deep green typography
+
Deep green CTA

Avoid a generic:

black background
+
white text
+
white button

hero.

---

# Dark Sections

Dark green may be used for:

- Footer
- Newsletter section
- Brand story
- Premium campaign sections
- Selected promotional sections

Use:

#0F3326

instead of pure black.

Text on dark green should generally be:

#FFFFFF

or a very light warm neutral.

---

# Design Tokens

Create centralized CSS variables/design tokens.

Example:

:root {
  --color-primary: #164A35;
  --color-primary-dark: #0F3326;
  --color-primary-medium: #28624A;

  --color-background: #FAF9F5;
  --color-background-soft: #F3F5F0;
  --color-surface: #FFFFFF;

  --color-text: #1C2822;
  --color-text-secondary: #56625C;
  --color-text-muted: #7A837E;

  --color-border: #DDE3DE;
  --color-border-soft: #E8ECE8;

  --color-green-soft: #DDEBE3;
  --color-green-light: #F0F6F2;

  --color-accent: #C49A5A;
}

Use the project's existing styling system if one already exists.

Do not duplicate these variables in individual components.

---

# Color Usage Principle

The website should NOT look:

black + white + occasional green.

It should look:

deep green + warm cream + soft green + white + restrained neutral + small warm accent.

Green should feel like part of the brand identity rather than an afterthought.

---

# Consistency

Every new page must use the same color system.

Before introducing a new color:

1. Check existing design tokens.
2. Check whether an existing color already serves the purpose.
3. Reuse the existing token if possible.
4. Only introduce a new color when there is a genuine design requirement.

Never hardcode arbitrary colors inside individual pages/components.

---

# Final Visual Direction

Target visual feeling:

Premium fashion boutique
+
Deep natural green
+
Warm cream
+
Editorial photography
+
Generous whitespace
+
Minimal UI
+
Subtle gold accent

Do NOT default to:

Black
+
White
+
Gray

as the primary design system.