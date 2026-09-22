---
alwaysApply: true
---
---
description: Security rules for the customer-facing User Panel
alwaysApply: true
---

# User Panel Security

The frontend is NOT a security boundary.

Never assume that hiding a UI element prevents a user from performing an operation.

The Backend must enforce authentication and authorization.

---

# Secrets

Never expose:

- Database credentials
- Database connection strings
- JWT signing secrets
- Payment provider secret keys
- SMTP passwords
- Cloud private credentials
- Backend private API keys

Never commit secrets into source code.

Never place backend secrets into browser-accessible environment variables.

---

# User Data

Only display user information returned by authorized backend APIs.

Do not allow users to access another user's:

- Profile
- Address
- Cart
- Orders
- Wishlist
- Payment information

by changing an ID in the URL or request.

The backend must enforce ownership.

---

# Payments

Never consider payment successful because the browser says payment succeeded.

Payment verification belongs to the backend.

Do not expose payment provider secret keys to the frontend.

---

# Input

Treat all client-controlled values as untrusted:

- URL parameters
- Query parameters
- Form data
- Local storage
- Cookies
- Client state

Do not assume they are valid or authorized.

---

# Error Messages

Never display raw backend errors containing:

- SQL errors
- Stack traces
- Internal paths
- Secrets
- Internal service information

Use safe user-facing messages.