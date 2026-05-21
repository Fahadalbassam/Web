# Gulf Parts Co / CarPart (web)

School project for a fake car parts shop. Customers browse parts, cart, checkout, and admins manage products/orders. Nothing fancy on purpose — we just needed it to work end to end.

## What we actually used

- **Next.js** (App Router) + **TypeScript** + **Tailwind** for the storefront and admin UI. We pulled in **shadcn/ui** bits for tables, dialogs, forms, that kind of thing.
- **PHP** for the real backend: login, register, cart, catalog from Mongo, admin CRUD, checkout → orders. Sessions are PHP sessions, passwords use PHP’s `password_hash` / `password_verify`.
- **MongoDB** for all the data (users, products, orders, etc.).
- **Composer** in the `php/` folder for the MongoDB PHP driver and dotenv.

The frontend talks to PHP through **`/backend/...`**. Next rewrites those URLs to whatever is in **`PHP_BACKEND_URL`** (see `next.config.ts`), usually `http://127.0.0.1:8080`, so the browser stays on the Next origin and cookies still work.

Product images in the repo live under **`public/images/`** (and admin uploads go through PHP into **`php/public/uploads/`**). `next/image` is set up to allow the local PHP server for those.

## How we ran it locally (Windows, what we had)

1. Clone the repo, `cd` into it.
2. **Node:** `npm install`
3. **PHP deps:** `cd php` then `composer install`, then `cd ..`
4. **Env:** copy `.env.example` to **`.env.local`** in the project root (same folder as `package.json`). Put your real **`MONGODB_URI`** in there. **`PHP_BACKEND_URL=http://127.0.0.1:8080`** should match the PHP server.
5. Optional: if you need admin users in the DB, set **`ADMIN_SEED_PASSWORD_FAHAD`** and **`ADMIN_SEED_PASSWORD_OBAI`** in `.env.local` and run **`npm run db:seed-admins`** (see script / comments — don’t commit real passwords).
6. Start everything: **`npm run dev:full`** — that runs Next dev server + PHP’s built-in server together.

After that open whatever port Next prints (usually **http://localhost:3000**). PHP listens on **8080** in our setup.

### If you’re not on Windows

`package.json` has the PHP command hardcoded to **`C:\xampp\php\php.exe`** because that’s what we used. On Mac/Linux, change the **`php:server`** script to your normal `php` binary, e.g. `php -S 127.0.0.1:8080 -t php/public` from the repo root, or install PHP and point the script at it.

You can also run **two terminals**: one with `npm run dev`, one with your `php -S ... -t php/public` equivalent.

## Extra docs (more detail than this file)

- **`php/README.md`** — PHP endpoints, env loading, composer.
- **`DATABASE_AUDIT.md`** — collections, who talks to what.
- **`tracker.md`** — what we changed over time / phases.

Home page: 

<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/d4191f84-8f84-4faf-8203-cd2561806cdd" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/24833e00-c834-43d0-b025-133187ba2d02" />

Shop page: 
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/e91e0370-9d58-4821-8c68-927a9c0fe760" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/6e126ea8-c567-48cd-9c6f-3afcc72cc9a7" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/d3234a65-d4ed-43ff-bf1e-01de3cc97c52" />

cart + checkout + order:
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/2489d606-30e4-4289-a0af-8d4d0c707921" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/2c6ff482-71a4-4cd7-ad38-e3b53179ebae" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/d9bb1d89-538b-4985-ad58-2ec8ea6c5922" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/624f02fb-a561-4970-bcca-828a37cc22a8" />

preview of admin pov:
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/dc33f6bd-ce20-4cfa-a1a4-57742f748e45" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/443e64d2-0beb-450f-bc86-d6e7debec027" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/55620b2a-44c1-4328-a867-1f947aef9ae1" />

Mongodb collection: 
<img width="1731" height="1175" alt="image" src="https://github.com/user-attachments/assets/57005c24-d16a-4fb9-ba51-db9950d373c4" />

ER diagram: 
<img width="1600" height="1499" alt="image" src="https://github.com/user-attachments/assets/4564803b-7357-428e-a5c0-d337469b8f4f" />

## Final Code Cleanup

A final pass was done to make the repo submission-ready without changing storefront or admin behavior.

### Areas cleaned

- **`src/`** — Removed developer comments (`//`, `/* */`, JSX `{/* */}`) from application TypeScript/TSX; stripped leftover no-op JSX from the hero carousel.
- **Unused modules** — Deleted legacy mock catalog files, unused MongoDB helper/types under `src/lib/db`, and unused shadcn UI wrappers (`navigation-menu`, `tabs`, `sonner`).
- **Repo clutter** — Removed `_curl-cart.txt` (local curl cookie dump) and default Next.js SVGs under `public/` that were not referenced by the UI.
- **`package.json`** — Dropped direct dependencies that were unused after file removal (`sonner`, redundant `@radix-ui/react-*` packages; UI still uses the unified `radix-ui` package).

### What was removed

- Legacy **`src/lib/mock/parts.ts`** and **`src/lib/mock/brands.ts`** (live catalog is PHP + MongoDB only).
- Unused **`src/lib/mongodb.ts`** and **`src/lib/db/*`** TypeScript helpers (Node seed/index scripts talk to MongoDB directly).
- Unused UI components and temporary/debug artifacts listed above.
- Developer comments and debug-only logging in `src/` (no `console.log` / `debugger` in application code; CLI scripts under `scripts/` still print status messages).

### Required features preserved

All assignment flows remain wired as before:

- Storefront: home, shop listing, product detail (`/shop/[slug]`), cart, checkout, orders, settings, register, **contact/support** (`/support`).
- Admin: login, dashboard, product list/add/edit/delete/search, orders, support tickets.
- Backend: PHP endpoints under `php/public/`, Next rewrite to `/backend/*`, PHP session cart, customer and admin auth, checkout → MongoDB orders.
- Data/assets: `public/images/`, brand logos, hero slide config (`src/lib/mock/hero-slides.ts`), seed/index scripts (`scripts/seed-admins.mjs`, `scripts/ensure-indexes.mjs`).

### Validation

From the project root:

```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
```

- **Lint:** `npm run lint` — passed.
- **Typecheck:** `npx tsc --noEmit` — passed.
- **Build:** `npm run build` — passed (all App Router routes compiled).

End-to-end flows (browse → cart → checkout → order, admin CRUD) require **`npm run dev:full`** (or separate Next + PHP servers) and a configured **`.env.local`** with **`MONGODB_URI`**; those were verified by code review against existing PHP routes and UI pages, not re-run as a full manual QA session in this cleanup pass.

## Quantity Limit UX Helper

Shared quantity rules live in **`src/lib/quantity-helper.ts`** (`canIncreaseQuantity`, `canDecreaseQuantity`, limit messages, and `validateAddToCart`). UI uses **`QuantityStepper`** (`src/components/site/quantity-stepper.tsx`) with shadcn **Tooltip** on disabled +/- buttons (wrapped in a span so hover works when the button is disabled).

### Where it is used

- **Product detail** — `product-detail-actions.tsx`: min qty 1, max = `stockQty`, out-of-stock message, add-to-cart validation against cart + stock.
- **Cart** — `cart-view.tsx`: same min/max rules; at qty 1 the minus control is disabled with a message pointing users to **Remove**.
- **Shop cards** — `product-card-add-to-cart.tsx`: blocks add when cart already holds max stock (tooltip notice).

### Stock and minimum quantity

- Minimum order quantity is **1** everywhere; quantity cannot drop below 1 via minus (use **Remove** on the cart page).
- When `stockQty` is known, plus is disabled at stock and shows: *Only N item(s) available in stock.*
- Add-to-cart checks existing cart quantity first; at max it shows: *You already have the maximum available quantity in your cart.*
- Out-of-stock SKUs show *This product is currently out of stock.* and disable stepper + add actions.

### Testing

Verified with `npx tsc --noEmit` and `npm run build`. Manual checks (with `npm run dev:full`):

- PDP minus at qty 1 → helper, qty stays 1.
- PDP plus at stock max → helper, qty stays at max.
- Cart minus at qty 1 → helper; **Remove** still deletes the line.
- Cart plus at stock max → helper; subtotal and header cart badge still update after valid changes.
- Add-to-cart from PDP/cards does not exceed stock when the SKU is already in the cart.
