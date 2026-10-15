## ROLE
You are a Senior Full-Stack Engineer (Node.js/TypeScript) experienced in building production e-commerce platforms on the Cloudflare ecosystem (Pages, Workers, D1, KV, R2, Queues).

## OBJECTIVE
Implement the band merchandise website based on the design specified in the `.pen` canvas file (pen.dev). Faithfully adhere to the design tokens, components, and layout from the design file (colors, fonts, spacing, borders, Neo Brutalism hard shadows, desktop 1440px breakpoint, and mobile 390px breakpoint). Refer to the "Design System Documentation" at the bottom of the `.pen` file as the single source of truth for tokens and UI components.

## TECH STACK (Required, Full Node.js / TypeScript, Cloudflare Compatible)
- Language: Strict TypeScript across the entire codebase
- Frontend: React + Vite + React Router, Tailwind CSS (tokens mapped from design to tailwind config / CSS variables), deployed to Cloudflare Pages
- Backend API: Hono on Cloudflare Workers (or Pages Functions), validated with Zod schemas
- Database: Cloudflare D1 + Drizzle ORM (migrations managed via wrangler)
- Cache and Configuration: Cloudflare KV (rate limiting, catalog caching)
- Product Assets: Cloudflare R2 (or static assets for development)
- Email: Resend (REST/SDK fetch-compatible)
- Payment: Midtrans Snap
- Tooling: pnpm, wrangler, Vitest, ESLint, Prettier
- CRITICAL: Cloudflare Workers is not a standard Node.js runtime. Avoid packages that depend on Node-native modules (`fs`, `net`, `http`). For Midtrans, do not use the `midtrans-client` package. Call the Midtrans REST API directly using `fetch` with Basic Authentication (server key). Use the standard Web Crypto API for hashing instead of Node's `crypto` module.

## CORE REQUIREMENT: PURE GUEST CHECKOUT (NO LOGIN)
- Zero account registration, login, or password management.
- Cart state is maintained on the client (localStorage/Zustand) and strictly re-validated on the server during checkout (pricing, inventory availability, and totals are ALWAYS computed server-side; client prices are never trusted).
- Checkout form collects essential information only: full name, email, WhatsApp/phone number, delivery address (province, city, district, postal code, full street address), and optional notes.
- Upon order creation, customers receive an order number and a tracking link with a random token (e.g., `/order/:orderNumber?token=xxxx`). The order tracking page is accessible only with a valid matching token.
- Public "Track Order" page: allows order status lookup using order number and email address.

## FEATURES
1. Catalog: product listings, category filters, product details (variants, sizes, colors, real-time stock levels).
2. Cart: add items, adjust quantities, remove items, validate stock, animated thrown projectile micro-interactions.
3. Checkout: guest form, order summary, multi-courier selection, flat rate and free shipping thresholds.
4. Payment: QRIS, Bank Virtual Accounts (BCA, Mandiri, BNI, BRI, Permata, CIMB), and PayLater options (GoPay Later, Kredivo, Akulaku, SPayLater), with simulated development mode and Midtrans Snap production support.
5. Transactional email notifications via Resend (with local console/database logger for development).
6. Order status tracking: pending, paid, failed, expired, cancelled, shipped, and completed.
7. Lightweight Admin Portal: view orders, filter by status, update courier tracking numbers, protected by a single secret key header (`X-Admin-Token`).

## DATABASE (D1, Minimal Schema)
- Tables: `products`, `product_variants` (SKU, stock, price), `orders` (order_number, access_token, status, total, customer details, address), `order_items` (snapshot of item name, variant, and purchase price), `payments` (provider, transaction_id, status, payment_type, raw payload), `email_logs`, and `webhook_events` (for idempotency).
- Order statuses: `pending` -> `paid` | `failed` | `expired` | `cancelled` -> `shipped` -> `completed`.
- Atomic stock reservation when an order is created (`pending`), with automatic rollback if failed, expired, or cancelled. Prevent overselling using atomic SQL update queries on D1.

## PAYMENT: DUAL MODES (CONFIGURED VIA PAYMENT_MODE)
Implement a `PaymentProvider` abstraction with two implementations: `MidtransProvider` and `SimulatedProvider`, selected via `PAYMENT_MODE=simulated|midtrans`.

### Simulated Mode (Default in Development)
- After clicking "Place Order", the user is redirected to the Neo Brutalist payment simulation page (`/dev/pay/:orderNumber`).
- Displays order summary and interactive payment simulators for QRIS, Bank Virtual Accounts, and PayLater.
- Actions execute the exact same state machine transition logic as real webhook handlers to ensure consistent email delivery and inventory updates.
- Clear banner indicates "DEV MODE - SIMULATED PAYMENT".
- Development payment endpoints must return HTTP 404 when `PAYMENT_MODE != simulated` or `ENVIRONMENT=production`.

### Midtrans Mode (Sandbox and Production)
- Server initializes Snap transactions (`/snap/v1/transactions`) and returns token/redirect URL for the Snap modal.
- Webhook endpoint `POST /api/payments/midtrans/notification`:
  - Verifies signature: SHA512(order_id + status_code + gross_amount + SERVER_KEY) using Web Crypto with constant-time comparison.
  - Re-verifies status against the Midtrans Status API before updating orders.
  - Idempotent: duplicate webhook events must not trigger duplicate emails or duplicate stock modifications (enforced via `webhook_events`).
  - Mapping: `settlement`/`capture(accept)` -> `paid`; `deny`/`cancel` -> `failed`/`cancelled`; `expire` -> `expired`; `pending` -> `pending`.
- Unique order identifier per payment attempt; provides a retry payment option for failed/pending orders.

## EMAIL (Resend)
- `EmailService` abstraction with Resend provider, including a development fallback that logs emails to console and `email_logs` table when `RESEND_API_KEY` is empty.
- Responsive HTML email templates matching Neo Brutalist design tokens (`#F8EDE3`, `#DFD3C3`, `#D0B8A8`, `#85586F`, bold borders).
- Supported email triggers:
  1. Order Created / Awaiting Payment (includes payment and tracking links)
  2. Payment Successful (item summary, order totals, shipping address, tracking link)
  3. Payment Failed / Expired (includes retry payment link)
  4. Order Shipped (courier name and tracking number)
- Dispatched asynchronously using `ctx.waitUntil()` or Cloudflare Queues with error logging. Email failures must never abort a checkout transaction.

## SECURITY AND CODE QUALITY
- All secrets (`MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `RESEND_API_KEY`, `ADMIN_SECRET_KEY`) managed via wrangler secrets / `.dev.vars`, never committed or exposed to the frontend (except public client keys).
- Strict Zod schema validation across all API endpoints; sanitized outputs.
- Rate limiting on checkout and order lookup endpoints (via KV or Cloudflare Rate Limiting).
- Hardened security headers, strict CORS, zero client-side credit card data storage.
- Centralized error handling, standardized API responses, structured logging.
- Accessibility: WCAG AA contrast compliance, distinct focus states, full keyboard navigation.
- Responsive layout following desktop and mobile specifications in the `.pen` file.

## PROJECT STRUCTURE (pnpm Monorepo)
- `apps/web`: React + Vite SPA, deployed to Cloudflare Pages
- `apps/api`: Hono API, deployed to Cloudflare Workers
- `packages/shared`: Shared TypeScript types, Zod schemas, and design constants
- `migrations/`: D1 SQL migrations and seed scripts
- Configurations: `wrangler.toml` per app, `.dev.vars.example`, `README.md`

## WORKFLOW
1. Scaffold project structure, configure wrangler, local D1 database, migrations, and seed scripts.
2. Implement design tokens and UI components derived from the `.pen` file.
3. Build user-facing pages: Home, Shop, Product Detail, Cart, Checkout, Order Tracking, Order Lookup, Dev Pay Simulator, and Admin.
4. Implement API endpoints: products, checkout, payment simulation, webhooks, and order tracking.
5. Implement Resend email delivery with local fallback logger.
6. Write unit and integration tests (Vitest) covering totals calculation, atomic inventory management, status transitions, signature checks, and webhook idempotency.
7. Validate the entire local workflow with `wrangler dev` in simulated mode.
8. Document setup, environment variables, Midtrans sandbox onboarding, Cloudflare deployment steps, and pre-launch checklists in `README.md` and `DEPLOYMENTS.md`.

## OUTPUT
Production-ready code with complete implementations (no placeholders or truncated snippets). Provide clear setup instructions, environment variable specifications, and deployment runbooks.