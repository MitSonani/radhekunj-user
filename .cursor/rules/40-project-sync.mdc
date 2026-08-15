---
alwaysApply: true
---
---
description: Synchronization rules between User Panel, Admin Panel, Backend and shared contracts
alwaysApply: true
---

# Multi-Repository Synchronization

This platform consists of:

1. User Panel - Next.js
2. Admin Panel - Next.js
3. Backend - Node.js
4. PostgreSQL
5. Optional shared contracts package

The Backend owns business logic.

The User Panel and Admin Panel are API consumers.

---

# Shared Contracts

If a shared contracts package exists, use it.

Do not independently recreate:

- DTOs
- API response types
- API request types
- Business enums
- Status values

Example:

Do NOT create separate versions of:

OrderStatus
PaymentStatus
ProductStatus
UserRole

in every repository.

---

# API Changes

Before changing an API:

1. Check the backend implementation.
2. Check shared contracts.
3. Search User Panel consumers.
4. Search Admin Panel consumers.
5. Determine whether the change is breaking.
6. Update all affected consumers.

Never change an API response casually.

---

# Cross-System Features

When a feature crosses repositories, identify all affected systems.

Example:

New product field:

Database
→ Backend
→ API contract
→ User Panel
→ Admin Panel

Do not consider the feature complete if only the currently open repository was changed.

---

# Business Logic

Business logic belongs to the Backend.

Do not duplicate important business rules in the User Panel.

Examples:

- Pricing
- Discount calculation
- Coupon validation
- Tax calculation
- Inventory validation
- Order totals
- Payment verification
- Refund eligibility
- Authorization

The User Panel displays backend results.

It does not become the source of truth.