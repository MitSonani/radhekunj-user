---
trigger: always_on
---

---
description: Premium fashion e-commerce visual and UX direction inspired by modern boutique storefronts
globs: ["**/*.tsx", "**/*.jsx", "**/*.css", "**/*.scss"]
alwaysApply: true
---

# Fashion E-Commerce Design Direction

The User Panel is a premium fashion e-commerce storefront.

The visual direction should be inspired by high-end boutique/fashion e-commerce websites such as:

https://vulcal.com/

Use the reference for:

- Visual hierarchy
- Product merchandising
- Collection presentation
- Category discovery
- Editorial feel
- Product photography emphasis
- Spacious layouts
- Premium shopping experience

Do NOT copy the reference website directly.

Do NOT reproduce its:
- exact layout
- exact colors
- exact typography
- exact content
- exact assets
- exact components

Create our own brand identity while following the same level of visual quality and merchandising principles.

---

# Overall Design Philosophy

The storefront should feel:

- Premium
- Elegant
- Modern
- Fashion-focused
- Editorial
- Minimal
- Spacious
- Image-driven
- Trustworthy

Avoid making the website look like a generic e-commerce template.

Avoid excessive:

- borders
- shadows
- gradients
- rounded cards
- unnecessary badges
- UI clutter
- excessive colors
- dense layouts

The product should be the visual focus.

---

# Homepage

The homepage should be designed as a merchandising experience rather than simply a list of products.

Recommended structure:

1. Header
2. Hero / Brand Campaign
3. Featured Collection
4. Shop by Category
5. Featured / Trending Products
6. Editorial / Brand Story
7. Collection Highlight
8. Promotional / Campaign Section
9. Customer/Brand Trust Section where appropriate
10. Newsletter
11. Footer

Do not force every section onto every homepage.

Sections should be included based on actual content available.

---

# Header

The header should feel premium and uncluttered.

Typical structure:

Logo
Navigation
Search
Account
Wishlist
Cart

Navigation should prioritize important shopping destinations.

Example:

Home
Collections
New Arrivals
Categories
About

Do not overcrowd the navigation.

On mobile, use a clean mobile navigation/drawer pattern.

---

# Product Discovery

Product discovery should be visual.

Prioritize:

- Large product imagery
- Clear product names
- Price
- Sale/discount information where applicable
- Minimal metadata
- Wishlist action where supported

Do not overload product cards with information.

---

# Product Cards

Create ONE reusable ProductCard component.

All product listing pages should reuse it.

ProductCard should support configurable properties such as:

- image
- product name
- price
- compare-at price
- discount
- badge
- wishlist
- product link

Do not create separate product card implementations for:

- Homepage
- Category page
- Search page
- Collection page
- Related products
- Trending products

Reuse the same component with appropriate props/configuration.

---

# Product Images

Product imagery is one of the most important elements of the storefront.

Prefer:

- Large image areas
- High-quality product images
- Consistent aspect ratios
- Minimal visual noise
- Proper object positioning
- Responsive image optimization

Avoid unnecessarily cropping important parts of clothing/products.

Use Next.js image optimization where appropriate.

---

# Collections

Collections should feel editorial rather than like plain database categories.

Use large visual collection cards where appropriate.

Example:

Collection
├── Image
├── Collection name
├── Short description
└── Shop collection CTA

Do not make every collection look like a standard product card.

---

# Category Section

The homepage should provide an easy way to discover major categories.

Example:

Shop by Category

Women
Men
New Arrivals
Ethnic Wear
Dresses
Accessories

Use visual category cards when appropriate.

Categories should be manageable from backend data rather than hardcoded throughout the application.

---

# Product Listing Pages

Use a consistent structure:

Header
→ Breadcrumb
→ Collection/Page Title
→ Optional Description
→ Search/Filters/Sort
→ Product Grid
→ Pagination
→ Footer

The product grid should be clean and spacious.

Avoid overly dense grids.

---

# Filters

Filters should not visually dominate the page.

Possible filters:

- Category
- Price
- Size
- Color
- Availability
- Collection
- Other product-specific attributes

Use a sidebar on desktop when appropriate.

Use a drawer/modal on mobile.

Use the same filter component across product listing pages.

---

# Product Details Page

Product details should prioritize the product imagery and purchasing decision.

Recommended structure:

Product Gallery
        +
Product Information

Product information may include:

- Product name
- Price
- Compare-at price
- Availability
- Variant selection
- Size selection
- Quantity
- Add to Cart
- Buy Now where applicable
- Description
- Product details
- Shipping information
- Care information

Do not put every piece of information above the fold.

Prioritize the information needed to make a purchase decision.

---

# Product Gallery

Use a reusable ProductGallery component.

Support:

- multiple images
- thumbnails where appropriate
- responsive layout
- zoom/lightbox where appropriate

The gallery should feel premium and image-focused.

---

# Typography

Use a deliberate typography hierarchy.

Typical hierarchy:

Brand / Display
→ Large editorial heading

Section heading
→ Strong but restrained

Product name
→ Clear and readable

Body
→ Comfortable reading size

Metadata
→ Smaller and subtle

Do not use many different font sizes.

Use the project's centralized typography tokens.

If the project has no typography system yet, create one rather than defining arbitrary font sizes page-by-page.

---

# Colors

Use a restrained color palette.

Prefer:

- neutral backgrounds
- strong text contrast
- subtle borders
- one primary brand accent
- carefully chosen status colors

Do not introduce random colors for individual pages.

All colors should come from centralized design tokens.

---

# Spacing

Whitespace is important.

Prefer generous spacing between:

- sections
- product cards
- headings
- images
- content blocks

Do not make the interface unnecessarily dense.

Use centralized spacing tokens.

---

# Buttons

Buttons should be simple and premium.

Prefer clear CTAs:

Shop Now
Explore Collection
Add to Cart
Buy Now
View Collection

Do not create a different button style for every section.

Use the shared Button component.

---

# Animations

Use subtle animation.

Appropriate examples:

- image hover transition
- subtle fade
- drawer transition
- modal transition
- button interaction
- page section reveal

Avoid excessive:

- bouncing
- spinning
- parallax everywhere
- large movement
- distracting animations

Animation should improve perceived quality, not distract from shopping.

Respect reduced-motion preferences.

---

# Responsive Design

Design mobile-first.

The experience must work well on:

- Mobile
- Tablet
- Desktop

Do not simply shrink the desktop layout.

For mobile:

- simplify navigation
- use appropriate drawers
- keep product images prominent
- make CTAs easy to tap
- avoid dense filter interfaces
- maintain comfortable spacing

---

# Reusable Design System

Create and reuse centralized design primitives.

Examples:

components/
├── layout/
├── navigation/
├── product/
├── collection/
├── common/
├── forms/
└── commerce/

Common components should include where needed:

- Button
- Container
- Section
- Heading
- ProductCard
- ProductGrid
- ProductPrice
- Badge
- Breadcrumb
- Modal
- Drawer
- EmptyState
- LoadingState
- ErrorState

Do not recreate these components on individual pages.

---

# Page Consistency

All pages should feel like the same brand.

Maintain consistency in:

- Header
- Footer
- Container width
- Typography
- Spacing
- Buttons
- Product cards
- Forms
- Filters
- Breadcrumbs
- Modals
- Animations

A new page should extend the existing design system rather than invent a new one.

---

# Editorial vs Functional Pages

Not every page should have the same visual density.

Marketing/editorial pages:

- Homepage
- About
- Collection landing pages

may use larger imagery and more whitespace.

Functional pages:

- Search
- Product listing
- Cart
- Checkout
- Account

should prioritize usability and clarity.

Keep the visual language consistent while allowing different content density.

---

# Accessibility

Do not sacrifice accessibility for visual design.

Ensure:

- semantic HTML
- keyboard navigation
- visible focus states
- appropriate button labels
- image alt text
- sufficient contrast
- accessible form labels
- accessible dialogs/drawers

Do not use visual styling as the only way to communicate information.

---

# SEO

Public storefront pages should be SEO-friendly.

Consider:

- semantic HTML
- meaningful page titles
- metadata
- product metadata
- descriptive URLs
- proper headings
- image alt text
- structured data where appropriate

Do not sacrifice SEO by rendering important product/content information only through client-side JavaScript when server rendering is appropriate.

---

# Important Rule

Before creating any new UI:

1. Search the existing project for a similar component.
2. Search for a similar page.
3. Reuse the existing layout.
4. Reuse existing components.
5. Reuse existing design tokens.
6. Only create something new when the existing system genuinely cannot support the requirement.

The storefront should progressively become a coherent design system, not a collection of independently designed pages.