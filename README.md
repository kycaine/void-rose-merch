# DEMO
hit me : https://voidrose.reternia.com

# VOID/ROSE Band Merchandise - E-Commerce (Neo Brutalism)

Official e-commerce website for the band merchandise of **VOID/ROSE** ("WEAR THE NOISE"), built on the **Serverless Cloudflare Ecosystem** (Pages, Workers, D1 Database, KV), Hono, React, Tailwind CSS, Zod, Drizzle ORM, Midtrans Snap, and Resend.

The application follows the Neo Brutalism design specification from the `.pen` canvas design file (pen.dev):
- **Colors**: `$bg` (`#F8EDE3`), `$surface` (`#DFD3C3`), `$accent-2` (`#D0B8A8`), `$brand` (`#85586F`), `$ink` (`#1A1A1A`), `$white` (`#FFFFFF`).
- **Typography**: Display: `Archivo Black`, Body: `Space Grotesk`, Mono/Price/Tag: `Space Mono`.
- **Borders**: Sharp `3px` / `4px` solid `#1A1A1A` with zero border radius (square edges).
- **Hard Shadows**: Zero-blur hard drop shadows (`3px`, `4px`, `6px`, `8px`, `10px`).
- **Components**: Continuous looping marquee strip, rotated sticker badges (-3 deg to +4 deg), variant and size selector, quantity stepper, quick-add cards, pure guest checkout, tokenized order tracking links, and a lightweight admin management portal.

---

## Project Structure (pnpm Monorepo)

```
merch-band/
├── apps/
│   ├── api/                     # Backend API (Hono on Cloudflare Workers)
│   │   ├── migrations/          # D1 SQL migrations (Initial schema and seed data)
│   │   ├── scripts/seed.mjs     # Local / remote database seeder helper
│   │   ├── src/
│   │   │   ├── db/schema.ts     # Drizzle ORM Schema (SQLite/D1)
│   │   │   ├── routes/          # Endpoints: products, checkout, payments, orders, admin
│   │   │   ├── services/        # OrderService, PaymentService, MidtransProvider, EmailService
│   │   │   └── index.ts         # Hono entrypoint (CORS, Rate Limiting, Health Check)
│   │   ├── wrangler.toml        # Workers, D1 binding, and KV binding configuration
│   │   └── .dev.vars            # Local environment secrets (Midtrans, Resend, Admin Key)
│   │
│   └── web/                     # Frontend (React + Vite + React Router, Tailwind CSS)
│       ├── public/assets/       # Official SVG product artwork and tour ticket graphics
│       ├── src/
│       │   ├── components/      # Navbar, Footer, Button, Badge, ProductCard, MarqueeStrip, FloatingCart, TicketModal
│       │   ├── pages/           # Home, Shop, ProductDetail, Cart, Checkout, DevPay, OrderTracking, OrderLookup, Admin
│       │   ├── store/           # Zustand client state (cartStore, languageStore, flyCartStore)
│       │   ├── i18n/            # Full bilingual dictionaries (English and Indonesian)
│       │   ├── lib/api.ts       # Typed client API with resilient fallback handling
│       │   └── index.css        # Neo Brutalist design system classes, thrown cart animations
│       ├── tailwind.config.js   # Mapped design tokens
│       └── vite.config.ts       # Vite configuration with /api proxy to Worker (:8787)
│
├── packages/
│   └── shared/                  # Shared Domain Types, Zod Schemas, and Constants
│
├── tests/                       # Vitest test suite (totals, atomic stock, idempotency, etc.)
├── .dev.vars.example            # Environment variables template
└── README.md
```

---

## Key Features

### 1. Pure Guest Checkout (No Login Required)
- Zero account creation, registration, or customer login barriers.
- Cart state lives on the client (Zustand + localStorage) and is **always validated server-side** at checkout. Client-side prices are never trusted.
- Streamlined checkout form: full name, email address, WhatsApp/phone number, delivery address (province, city, district, postal code, full street address), and optional order notes.
- Each order generates a unique `orderNumber` (e.g., `VR-116431-667`) and an unpredictable 32-character random `accessToken`.
- The order status page (`/order/:orderNumber?token=...`) requires the matching token to access order details.
- A public **"Track Order"** lookup page (`/check-order`) allows customers to locate order progress using only their order number and email.

### 2. Dual Payment Modes (PAYMENT_MODE=simulated|midtrans)
- **Simulated Mode (Default in Development)**:
  - After placing an order, customers are directed to the `/dev/pay/:orderNumber` page designed in Neo Brutalist aesthetics.
  - Supports multiple simulated payment channels:
    - **QRIS Realtime**: Dynamic SVG QR code with live 15-minute countdown and instant payment simulation.
    - **Bank Virtual Accounts**: Dedicated accounts for BCA, Mandiri, BNI, BRI, Permata, and CIMB Niaga with one-click copy and ATM/mobile banking guides.
    - **PayLater Options**: Multi-provider simulation (GoPay Later, Kredivo, Akulaku, SPayLater) with 30-day (0% interest) or installment tenor selections.
  - Shares the **exact same** state transition and stock/email business logic as real webhooks to ensure complete testing fidelity.
  - Development payment routes strictly return **404 Not Found** when `PAYMENT_MODE != simulated` or `ENVIRONMENT=production`.
- **Midtrans Mode (Sandbox and Production)**:
  - Generates Snap transaction tokens via the Midtrans REST API (`/snap/v1/transactions`) using Basic Authentication and Web Crypto.
  - Webhook endpoint `POST /api/payments/midtrans/notification`:
    - Signature verification using SHA-512 via the Web Crypto API (`crypto.subtle.digest`) with constant-time equality checks.
    - Re-verifies transaction status against the Midtrans Status API before applying state transitions.
    - Idempotent: duplicate events never trigger duplicate stock reversals or redundant email transmissions (enforced via the `webhook_events` table).
    - Supports payment retry links for failed or expired transactions.

### 3. Atomic Stock Reservation (Oversell Prevention)
- Inventory is verified and reserved atomically in Cloudflare D1 when an order enters `pending` status:
  ```sql
  UPDATE product_variants SET stock = stock - ? WHERE id = ? AND stock >= ?
  ```
- If an order fails, expires, or gets cancelled, inventory is automatically restored to active stock.

### 4. Transactional Emails (Resend + Local Dev Logger)
- Responsive HTML email templates matching the Neo Brutalist palette (`#F8EDE3`, `#DFD3C3`, `#85586F`, bold borders):
  1. *Order Created / Awaiting Payment* (includes payment and tracking links)
  2. *Order Paid / Payment Successful* (item summary, order totals, shipping destination)
  3. *Order Failed / Expired* (includes payment retry link)
  4. *Order Shipped* (includes courier tracking number)
- **Development Mode**: When `RESEND_API_KEY` is not configured, email delivery gracefully logs payloads to the console and records entries in the `email_logs` table without failing requests.

### 5. Lightweight Admin Portal
- Accessible at `/admin`.
- Protected by a single **Secret Token** (`ADMIN_SECRET_KEY` via header `X-Admin-Token`), without requiring a separate user management system.
- Capabilities: inspect order list, filter by status (`pending`, `paid`, `shipped`, `failed`), assign courier tracking numbers, and automatically trigger shipping notification emails to buyers.

---

## Local Development Guide

### 1. Prerequisites
- Node.js v18+ (Node v20 or v24 LTS recommended)
- `pnpm` (Corepack: `corepack enable && pnpm -v`)

### 2. Dependency Installation
```bash
pnpm install
```

### 3. Local D1 Database Setup and Seeding
Initialize database tables and seed official VOID/ROSE band merchandise and tour tickets:
```bash
pnpm db:seed:local
```

### 4. Environment Variables Configuration
The local secrets file `apps/api/.dev.vars` is pre-configured for development:
```ini
PAYMENT_MODE=simulated
ENVIRONMENT=development
MIDTRANS_SERVER_KEY=SB-Mid-server-dummy-dev-key
MIDTRANS_CLIENT_KEY=SB-Mid-client-dummy-dev-key
MIDTRANS_IS_PRODUCTION=false
RESEND_API_KEY=
RESEND_FROM="VOID/ROSE Merch <merch@voidrose.com>"
APP_URL=http://localhost:5173
API_URL=http://localhost:8787
ADMIN_SECRET_KEY=void-rose-super-secret-admin-key-2026
```

### 5. Running the Development Server
Run the API Worker and Frontend development server concurrently:
```bash
# Terminal 1: Run Cloudflare Worker backend (Port 8787)
pnpm dev:api

# Terminal 2: Run Vite frontend (Port 5173)
pnpm dev:web
```

Or run all workspaces in parallel from the repository root:
```bash
pnpm dev
```

Open your browser at `http://localhost:5173`.

---

## Running the Test Suite (Vitest)

All critical domain logic is validated using Vitest:
```bash
pnpm test
```

Test coverage includes:
1. `tests/totals.test.ts`: Server-side price calculation, client tampering rejection, and free shipping over Rp 750,000 threshold.
2. `tests/stock.test.ts`: Atomic inventory reservation, oversell protection, transaction rollbacks when out of stock, and stock restoration on payment failure.
3. `tests/status.test.ts`: Order state machine transitions (`pending` -> `paid`, `pending` -> `failed`, `paid` -> `shipped`).
4. `tests/midtrans.test.ts`: SHA-512 Web Crypto hashing, constant-time signature comparison, and payload tampering protection.
5. `tests/webhook-idempotency.test.ts`: Idempotent webhook handling and prevention of duplicate inventory adjustments.

---

## Switching to Midtrans Sandbox

1. Create an account on the [Midtrans Dashboard](https://dashboard.midtrans.com) and switch to the **Sandbox** environment.
2. Navigate to **Settings -> Access Keys**:
   - Copy the **Server Key** and **Client Key**.
3. Update `apps/api/.dev.vars`:
   ```ini
   PAYMENT_MODE=midtrans
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxx
   MIDTRANS_IS_PRODUCTION=false
   ```
4. In the Midtrans Dashboard -> **Settings -> Configuration**:
   - Set **Payment Notification URL** to: `https://<worker-domain>/api/payments/midtrans/notification`.
5. Restart `pnpm dev:api`.

---

## Enabling Live Email Delivery (Resend)

1. Create an account on [Resend](https://resend.com) and generate an API key.
2. Verify your sending domain in Resend (e.g., `merch.yourdomain.com`).
3. Add the key and verified sender to `apps/api/.dev.vars`:
   ```ini
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM="VOID/ROSE Merch <merch@yourdomain.com>"
   ```

---

## Cloudflare Deployment Guide

### 1. Remote D1 Database Setup
```bash
# Create D1 database in your Cloudflare account
npx wrangler d1 create merch-band-d1

# Update database_id in apps/api/wrangler.toml with the generated ID

# Apply schema migrations and initial catalog seed to the remote database
pnpm --filter @merch-band/api db:migrate:remote
pnpm --filter @merch-band/api db:seed:remote
```

### 2. Remote KV Namespace Setup (Rate Limiting and Cache)
```bash
npx wrangler kv namespace create CACHE_KV
# Update the returned namespace ID in apps/api/wrangler.toml
```

### 3. Deploy Backend API (Cloudflare Workers)
```bash
# Set production secrets on Cloudflare Workers
npx wrangler secret put MIDTRANS_SERVER_KEY --cwd apps/api
npx wrangler secret put RESEND_API_KEY --cwd apps/api
npx wrangler secret put ADMIN_SECRET_KEY --cwd apps/api

# Deploy API Worker
pnpm --filter @merch-band/api deploy
```

### 4. Deploy Frontend (Cloudflare Pages)
```bash
# Build the production frontend bundle
pnpm --filter @merch-band/web build

# Deploy the dist directory to Cloudflare Pages
npx wrangler pages deploy apps/web/dist --project-name void-rose-merch
```

---

## Pre-Launch Checklist

- [ ] Set `PAYMENT_MODE=midtrans` and `MIDTRANS_IS_PRODUCTION=true`.
- [ ] Configure production Midtrans Server Key and Client Key via `wrangler secret put`.
- [ ] Set Midtrans Notification URL to the production Worker webhook endpoint.
- [ ] Verify DNS records (DKIM, SPF, DMARC) for the sender domain in Resend and configure `RESEND_FROM`.
- [ ] Set `ADMIN_SECRET_KEY` to a high-entropy string (32+ characters).
- [ ] Verify that `/dev/pay/*` endpoints return 404 in production mode.
- [ ] Complete at least one end-to-end test transaction using Midtrans sandbox cards or QRIS simulator.
