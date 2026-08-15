# ShopFront — User Panel

ShopFront is the customer-facing frontend user interface for a production e-commerce application. It handles product browsing, cart interactions, checkout flows, order history, and account profile management by consuming REST API endpoints from the central Backend service.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (v16 App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Code Style**: [Prettier](https://prettier.io/) & [ESLint](https://eslint.org/)
- **Package Manager**: `npm`

## Requirements

- **Node.js**: `20.x (LTS)` or higher
- **npm**: v10 or higher

## Installation

1. Clone the repository and navigate to the directory:
   ```bash
   cd user-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables

Copy the template env file:
```bash
cp .env.example .env.local
```

Define the variables in your `.env.local`:
- `NEXT_PUBLIC_API_URL`: The absolute URL of the backend HTTP API server (e.g., `http://localhost:5000/api/v1`).

*Note: Never place private backend secrets or credentials in browser-accessible environment variables.*

## Development & Build Commands

| Command | Action |
|:---|:---|
| `npm run dev` | Starts the Next.js local development server |
| `npm run build` | Compiles the production build (using Turbopack compiler) |
| `npm run start` | Runs the compiled production server locally |
| `npm run lint` | Inspects the codebase for ESLint violations |
| `npx prettier --check .` | Checks files formatting consistency |
| `npx prettier --write .` | Automatically formats files using Prettier |

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx            # Main root layout (Header, Main container, Footer)
│   ├── page.tsx              # Landing homepage view
│   └── globals.css           # Global Tailwind and base theme configurations
├── components/
│   ├── layout/               # Structural elements (Header, Footer, PageContainer)
│   └── common/               # Reusable UX controls (Button, Input, Loader, Error, Empty states)
├── hooks/                    # Reusable client hooks (e.g., useApi state wrapper)
├── services/
│   └── api/                  # API fetch clients (apiClient.ts, options config)
├── lib/                      # Standard utility wrappers (cn tailwind-merge helper)
├── types/                    # Common TypeScript type interfaces (API payloads, errors)
├── constants/                # Paths, endpoints and UI limits
└── config/                   # Defensive env configs
```

## Architectural Guidelines

1. **API Communications**: The User Panel must only communicate with the backend using the central `apiClient`. Direct database connections or logic redundancy (like recalculating prices or tax) are prohibited.
2. **UI Consistency**: Reuse the design tokens and layout containers defined in `globals.css` and `components/`. Do not introduce styling fragments on individual views.
3. **Accessibility (a11y)**: Use semantic HTML layout structures, label form inputs, and provide focus-visible rings for keyboard users.
# radhekunj-user
