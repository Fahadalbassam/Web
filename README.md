# CarPart / Gulf Parts Co (web)

This is a CarPart Project.

## Fahad — Frontend / backend integration (handoff)

**Gulf Parts Co** is a car-parts storefront and admin console: **Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui** for UI, **PHP 8.x + Composer `mongodb/mongodb`** as the **only** live backend for auth, cart, catalog API, admin CRUD, and checkout, backed by **MongoDB**.

### Integration summary

- **PHP-first wiring is in place:** the browser calls **`/backend/*`** (rewritten in `next.config.ts` to `PHP_BACKEND_URL`). Server Components use **`src/lib/php-server-fetch.ts`** and **`src/lib/catalog-fetch.ts`** for catalog and admin reads. **No Next Route Handlers** act as authority for those domains.
- **shadcn admin + storefront UI is preserved:** the approved **Sidebar**, **Data Table** (`@tanstack/react-table` + `Table`), forms, dialogs, pagination, and cards are unchanged in layout; only data targets and guards were wired to PHP.
- **Local development:** run **`npm run dev:full`** to start **Next** and the **PHP built-in server** together. `npm run php:server` uses **`C:\xampp\php\php.exe`** explicitly (see `package.json`) so Windows PATH does not need `php`. `.env.local` should set **`MONGODB_URI`** and **`PHP_BACKEND_URL=http://127.0.0.1:8080`**.
- **Admin accounts:** `npm run db:seed-admins` upserts **`fahad2albassam@gmail.com`** and **`obayyassine@gmail.com`** when **`ADMIN_SEED_PASSWORD_FAHAD`** and **`ADMIN_SEED_PASSWORD_OBAI`** are set (Node script only; **no plaintext passwords in git**). The same command ensures default rows in the **`categories`** collection for the admin category picker.
- **Auth:** Admin panel uses **`auth/login.php`**, **`auth/me.php`** (200 + JSON, validates Mongo admin + role + email match), **`auth/logout.php`** (**POST**, HttpOnly `PHPSESSID`). Storefront checkout uses **`auth/customer-login.php`**, **`auth/customer-me.php`**, **`auth/customer-logout.php`** — same **`admins`** collection for this beta (no separate `customers` table yet); session keys differ so **guests cannot use admin APIs** without `admin_id`.
- **Admin protection:** **`src/middleware.ts`** redirects unauthenticated users away from **`/admin/*`** (except **`/admin/login`**) using the same **`auth/me.php`** probe + cookies; **`AdminAccessGate`** remains client-side defense in depth. PHP **`gp_require_admin`** re-checks MongoDB **`role === "admin"`** on every admin API.
- **Cart & checkout:** Guest **add-to-cart** uses PHP session cart. **Checkout requires** storefront sign-in; after login, **`openLogin("/checkout")`** returns the user to checkout without losing the cart. **`checkout/place.php`** enforces checkout session server-side.
- **Catalog:** Published products appear on **home** (`fetchPublishedParts` → `catalog/products.php?published=1&limit=4`), **shop**, and **PDP** via PHP catalog scripts. Storefront visibility uses **`gp_match_published_catalog()`** — any document where **`published` is not strictly `false`** (includes missing field). Sorting for listings is **`createdAt` descending**. **`resolvePartImageSrc`** maps **`/uploads/...`** to **`/backend/uploads/...`** so staff uploads via **`admin/upload-image.php`** render through the Next rewrite.
- **Milestone preview rows (temporary):** Next scans image files in **`public/images/`** under **`Brake Pads`**, **`Air Filters`**, **`Batteries`**, and **`Radiators`** (folder names matched case-insensitively) and synthesizes extra **`Part`** objects for the storefront only (`src/lib/catalog/preview-local-inventory.ts`). **`storefront-catalog.ts`** merges them with PHP results: **home** fills to four cards with **real parts first**; **shop** pads only when there are **fewer than eight** published parts. Preview cards link to **`/shop`** (not PDP). Remove the preview modules when the live catalog alone is enough for demos.
- **Empty states:** Home **Latest arrivals** keeps **min-height** and a dashed panel when there are zero combined rows (no PHP parts and no scannable preview images).
- **Home “Brands We Cover” strip:** Logos load from **`public/images/brandlogos/`** (discovered at runtime on the server), infinite CSS marquee with subtle perspective, **`prefers-reduced-motion`** static layout, and **`next/image`**.

### Customer vs admin

- **Customer** routes use **`CustomerProviders`** (real storefront session via PHP `customer-*` endpoints).
- **Admin** uses **`AdminLayoutShell`** and **`AdminSessionProvider`**; login is **`/admin/login`** only.

### Environment

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB (PHP + seed scripts). |
| `PHP_BACKEND_URL` | e.g. `http://127.0.0.1:8080` — Next rewrites + RSC server fetch. |
| `ADMIN_SEED_PASSWORD_FAHAD`, `ADMIN_SEED_PASSWORD_OBAI` | Optional — **`scripts/seed-admins.mjs`** only. |

### Tracking & audit

- **`tracker.md`** — phase history and **final stabilization** notes (files, decisions, remaining issues).
- **`DATABASE_AUDIT.md`** — schema, endpoint map, and **§10 truth audit** (Working / Partial / Not Done / Blocked).
- **`php/README.md`** — PHP setup and endpoint list.

### Next teammate / backlog (honest)

- **Order history / `/orders`:** not wired to PHP list APIs (**Not Done** in audit).
- **Dedicated `customers` collection** and separate storefront credentials (if required by course later).
- **Production-grade uploads** (virus scan, ACL, CDN) beyond the current **PHP `public/uploads`** + **`admin/upload-image.php`** flow.
- **Richer client-side validation** (optional polish on top of HTML5 `required`).

---

## Fahad — Frontend (historical product note)

Customer-facing and admin UIs for **Gulf Parts Co**: restrained automotive storefront built with **Next.js App Router**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, and **next-themes**. Branding: navbar **G**, footer **Gulf Parts Co**, neutral dark “graphite” cards. Shop: sticky filters, pagination (9 per page). See **`tracker.md`** for full phase checklist (Phases 1–13 UI milestones).
