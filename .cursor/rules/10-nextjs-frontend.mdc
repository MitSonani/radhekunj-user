---
alwaysApply: true
---
---
description: Backend API consumption rules for the User Panel
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

# API Consumption Rules

The Backend is the source of truth.

Never invent:

- API endpoints
- Request fields
- Response fields
- Enum values
- Business statuses
- Pagination structures
- Error structures

Before implementing an API integration:

1. Inspect the backend API contract.
2. Check shared contracts if available.
3. Check authentication requirements.
4. Check authorization requirements.
5. Check request schema.
6. Check response schema.
7. Check pagination/filtering/sorting behavior.
8. Search for existing API consumers.

---

# API Architecture

Prefer:

Component
→ Hook
→ Service/API Client
→ Backend

Do not scatter raw fetch/axios calls throughout components.

Use the existing API client if one exists.

Centralize:

- Base URL
- Authentication handling
- Headers
- Error handling
- Request configuration

---

# Backend Is Authoritative

Never trust frontend calculations for:

- Product price
- Discount
- Tax
- Shipping
- Cart total
- Order total
- Inventory
- Coupon validity
- Payment status

Frontend calculations are only for display/UX.

The backend must recalculate authoritative values.

---

# Authentication

Protected API requests must use the application's established authentication mechanism.

Do not invent a separate authentication mechanism for one feature.

Handle:

- expired authentication
- unauthorized responses
- logout/session expiry

consistently with the existing application.

---

# API Errors

Handle relevant API errors explicitly.

Examples:

400 → Invalid request

401 → Authentication required/expired

403 → Permission denied

404 → Resource not found

409 → Conflict

422 → Validation/business validation failure

429 → Rate limited

500 → Unexpected server error

Do not treat every response as success.

---

# API Changes

If the backend API changes:

1. Check shared contracts.
2. Search User Panel consumers.
3. Update affected types.
4. Update affected API services.
5. Update affected UI.
6. Check error handling.
7. Check tests.

Do not assume an API change affects only one file.