---
alwaysApply: true
---
---
description: UI consistency, shared layouts and reusable component rules for the User Panel
globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "**/*.scss"]
alwaysApply: false
---

# User Panel UI Consistency Rules

The User Panel must have a consistent visual language across the entire application.

Before creating UI for a new page, inspect existing pages and components and reuse the established design patterns.

Do NOT create a completely new layout or visual pattern for every page.

---

# Layout Consistency

Try to use the same layout structure across pages wherever the page type is similar.

Common elements such as:

- Header
- Navigation
- Footer
- Page container
- Breadcrumbs
- Page title section
- Section spacing
- Cards
- Buttons
- Forms
- Tables
- Modals
- Drawers
- Empty states
- Loading states
- Error states

should use shared components.

If a common component already exists, reuse it instead of creating another version.

---

# Reusable Components

Before creating a new component:

1. Search the existing component directory.
2. Search for similar UI already implemented.
3. Check whether an existing component can be reused.
4. Extend an existing component if the difference is small.
5. Create a new component only when the existing component is genuinely unsuitable.

Do not create duplicate components with slightly different names.

Bad:

ProductCard.tsx
ProductItem.tsx
ProductBox.tsx
ProductTile.tsx

when they represent essentially the same UI.

Prefer one reusable component with appropriate props.

---

# Common Components

Create and reuse common components for repeated UI patterns.

Examples:

```text
components/
├── layout/
│   ├── Header
│   ├── Footer
│   ├── PageContainer
│   └── Breadcrumb
│
├── common/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Modal
│   ├── Drawer
│   ├── Badge
│   ├── EmptyState
│   ├── LoadingState
│   └── ErrorState
│
├── product/
│   ├── ProductCard
│   ├── ProductGrid
│   └── ProductPrice
│
└── order/
    ├── OrderCard
    ├── OrderStatus
    └── OrderSummary