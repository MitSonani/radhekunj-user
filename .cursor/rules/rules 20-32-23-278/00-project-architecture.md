---
alwaysApply: true
---
---
description: Core architecture rules for the e-commerce User Panel
alwaysApply: true
---

# User Panel Architecture

This repository is the customer-facing Next.js application.

Responsibilities:

- Product browsing
- Product search and filtering
- Product details
- Cart UI
- Checkout UI
- Customer authentication UI
- Customer profile
- Customer addresses
- Customer order history
- Wishlist where applicable
- Calling backend APIs

The User Panel must NOT:

- Access PostgreSQL directly
- Contain backend business logic
- Calculate authoritative prices
- Calculate authoritative discounts
- Determine payment success
- Determine inventory availability
- Perform authorization
- Store backend secrets
- Store payment provider secret keys

The Backend is the source of truth for business logic.

Architecture:

UI
→ Hooks / Services
→ API Client
→ Backend API

Keep responsibilities separated.

Components should focus on presentation and user interaction.

Hooks should manage reusable client-side behavior.

Services/API clients should communicate with the backend.

Do not put business logic directly into large UI components.

Before implementing a new feature:

1. Inspect the existing project structure.
2. Search for similar functionality.
3. Reuse existing components/services/hooks where appropriate.
4. Follow existing naming conventions.
5. Check the backend API contract.
6. Check shared contracts if available.

Do not perform unrelated refactoring while implementing a feature.

Do not create duplicate utilities, components, API clients, or services when an existing implementation can be reused.