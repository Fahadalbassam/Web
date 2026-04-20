# Gulf Parts Co — Frontend Tracker

## Project

**Gulf Parts Co** — CIS 311 car-parts storefront beta (Next.js App Router, TypeScript, Tailwind v4, shadcn/ui, next-themes).

## Current phase

**Phase 23 — Checkout + orders finalization (Apr 2026)** — Confirmed single **`orders`** schema (§4b **`DATABASE_AUDIT.md`**), **`place.php`** enforces contact email = session account, cart/checkout wait on **`cart/get.php`** hydration (no false empty state), **`gp-cart-refresh`** after login/register for UI sync, read-only checkout email field.

---

## Phase 23 — Checkout + orders finalization (Apr 2026)

- **What changed (PHP):** **`checkout/place.php`** rejects checkout when JSON **`customer.email`** does not match the signed-in session email (normalized), keeping **`userId`** / **`userEmail`** authoritative.
- **What changed (Next):** **`CheckoutForm`** waits for both cart and auth hydration before empty/login/checkout UI; checkout **email** is read-only from session with short copy. **`CartView`** shows a loading intro until the first cart sync. **`CartProvider`** listens for **`gp-cart-refresh`**; **`CustomerAuthProvider`** dispatches it after successful login/register.
- **Decisions:** No second order model — all reads go through **`gp_order_public_array`** / **`gp_order_items_from_doc`**; legacy **`lines`** still normalized to **`items`**.
- **Files:** `php/public/checkout/place.php`, `src/app/(customer)/checkout/checkout-form.tsx`, `src/app/(customer)/cart/cart-view.tsx`, `src/providers/cart-provider.tsx`, `src/providers/customer-auth-provider.tsx`, `DATABASE_AUDIT.md`, `README.md`, `tracker.md`
- **Remaining:** No multi-document Mongo transaction for inventory; taxes/shipping fees not modeled.

---

## Phase 22 — Real checkout, orders schema, admin + customer order visibility (Apr 2026)

- **What changed (PHP):** **`gp_storefront_authenticated_user()`** centralizes DB-validated storefront identity (used by **`customer-me.php`** and order reads). Order helpers: **`gp_order_items_from_doc`** ( **`items`** vs legacy **`lines`** ), **`gp_order_public_array`**, **`gp_order_user_can_view`**, status allow-list. **`checkout/place.php`** now writes the finalized order shape and **`pending`** status. New endpoints: **`orders/mine.php`**, **`orders/detail.php`**, **`admin/orders.php`**, **`admin/order.php`** (GET + PATCH status).
- **What changed (Next):** **`CustomerAuthProvider`** exposes **`userId`**. **`OrdersView`** replaces mock **`/orders`**. **`AdminOrdersPanel`** + **`/admin/orders`** with shadcn **Table** / **Select** / **Dialog**. **`checkout-form`** prefills email; **`cart-view`** shows per-unit price. Admin sidebar adds **Orders**.
- **Decisions:** One **`orders`** collection; read path normalizes legacy **`lines`**; guest checkout remains blocked at PHP + UI; cart session survives login; ownership checks prevent cross-user detail access.
- **Files:** `php/include/app.php`, `php/public/auth/customer-me.php`, `php/public/checkout/place.php`, `php/public/orders/mine.php`, `php/public/orders/detail.php`, `php/public/admin/orders.php`, `php/public/admin/order.php`, `src/providers/customer-auth-provider.tsx`, `src/app/(customer)/orders/page.tsx`, `src/app/(customer)/orders/orders-view.tsx`, `src/app/(customer)/checkout/checkout-form.tsx`, `src/app/(customer)/cart/cart-view.tsx`, `src/lib/catalog-fetch.ts`, `src/components/admin/admin-orders-panel.tsx`, `src/app/admin/orders/page.tsx`, `src/components/admin/admin-layout-shell.tsx`, `DATABASE_AUDIT.md`, `README.md`, `php/README.md`, `tracker.md`
- **Remaining:** No full Mongo transaction for inventory; taxes/shipping fees not modeled; legacy orders without **`userId`** rely on **`userEmail`** / **`customer.email`** matching for “mine” listing.

---

## Phase 21 — Auth session correctness + admin gate + modal layout (Apr 2026)

- **What caused the storefront “still logged out” bug:** **`gp_normalize_doc()`** turns BSON **`ObjectId`** into **`{ "$oid": "…" }`**. **`gp_oid_string()`** used **`(string) $doc['_id']`**, which coerced that array to the literal **`"Array"`** (with a PHP warning), so **`gp_user_id`** in the session was wrong and **`customer-me.php`** could not resolve the user.
- **What changed (PHP):** **`gp_oid_string()`** now accepts **`ObjectId`**, extended-JSON **`$oid`**, and plain strings. Added **`gp_auth_scalar_string()`** for safe **`role`** / **`email`** reads after normalization. **`customer-me.php`** checks **`$doc === null`** before reading fields; **`me.php`** uses the same helpers.
- **What changed (admin access):** **`src/middleware.ts`** probes **`customer-me.php`** when **`me.php`** denies access: guests → **`/?login=1`** (opens **`AuthModal`** via **`StorefrontAuthDeepLinkOpener`**), signed-in non-admins → **`/`**. **`/admin/login`** is no longer the primary gate (compatibility stub + links). **`AdminAccessGate`** mirrors the same redirect rule client-side. **`AdminSessionProvider`** re-fetches **`me.php`** whenever **`pathname`** is under **`/admin`** so the navbar → admin navigation picks up a fresh session without waiting for window focus.
- **What changed (UI stability):** **`globals.css`** sets **`html { scrollbar-gutter: stable; }`** so shadcn/Radix **`Dialog`** body scroll lock does not shift the page horizontally.
- **Files:** `php/include/app.php`, `php/public/auth/customer-me.php`, `php/public/auth/me.php`, `src/middleware.ts`, `src/components/admin/admin-access-gate.tsx`, `src/components/admin/admin-layout-shell.tsx`, `src/app/admin/login/page.tsx`, `src/providers/admin-session-provider.tsx`, `src/components/customer-providers.tsx`, `src/components/site/storefront-auth-deeplink-opener.tsx`, `src/app/globals.css`, `README.md`, `DATABASE_AUDIT.md`, `tracker.md`
- **Decisions:** One login system (**`customer-login.php`** / **`login.php`**); admin access is **`role === "admin"`** from MongoDB via **`me.php`**; no duplicate admin-only credential path.

---

## Phase 20 — PHP env parity with Next `.env.local` (Apr 2026)

- **What changed:** Added **`vlucas/phpdotenv`** (`php/composer.json`). **`php/include/load-env.php`** runs **`gp_load_repo_env()`** from **`app.php`** (after Composer autoload): reads repo-root **`.env`** then **`.env.local`** with **`Dotenv::createUnsafeMutable`** + **`safeLoad()`** so **`getenv()`** / **`gp_require_env('MONGODB_URI')`** work under the PHP built-in server. Documented in **`php/README.md`** and root **`README.md`**.
- **Files:** `php/composer.json`, `php/composer.lock`, `php/include/load-env.php`, `php/include/app.php`, `php/README.md`, `README.md`, `tracker.md`
- **Decisions:** Load order matches typical Next precedence (`.env.local` overrides `.env`); production can rely on real env vars only.

---

## Phase 19 — Unified login/register popup UX (Apr 2026)

- **What changed:** **`auth-modal.tsx`** supports **`login` \| `register`** modes in the same shadcn **Dialog** (no navigation to **`/register`** from the modal). Underlined text-only switches: “New? Register here” ↔ “Already have an account? Login here”. Register adds **confirm password** with client-side match check; **`registerAccount`** / **`loginWithCredentials`** unchanged. Email preserved when switching modes; passwords cleared. **`onLoginSuccess`** still runs after either success (checkout **`openLogin(returnTo)`** preserved).
- **Files:** `src/components/site/auth-modal.tsx`, `README.md`, `tracker.md`
- **Decisions:** Default mode **login** on open; compact single-column forms; secondary **`/register`** page left in place for direct URLs only.

---

## Phase 18 — DB-only catalog + accounts + support (Apr 2026)

- **What changed:** **Unified PHP auth** in `php/include/app.php` (`gp_try_login_credentials`, `gp_commit_login_session`, `gp_find_auth_doc_by_email` / `by_id` for **`users` then `admins`**). **`auth/login.php`**, **`customer-login.php`**, **`register.php`**, **`me.php`**, **`customer-me.php`**, **`logout.php`**, **`customer-logout.php`** rewritten. **Storefront:** `CustomerAuthProvider` exposes **`role`**; **`user-menu`** shows Admin only for **`admin`**. **Removed** `src/lib/catalog/preview-local-inventory.ts` and `storefront-catalog.ts`; **home** + **shop** use only **`fetchPublishedParts`**. **Support:** `php/public/support/ticket.php`, `php/public/admin/support-tickets.php`, **`/admin/support`**, wired **`support-form.tsx`**. **Docs:** `DATABASE_AUDIT.md`, `README.md`, this file.
- **Files (main):** `php/include/app.php`, `php/public/auth/*.php`, `php/public/support/ticket.php`, `php/public/admin/support-tickets.php`, `src/app/(customer)/page.tsx`, `src/app/(customer)/shop/page.tsx`, `src/app/(customer)/register/page.tsx`, `src/app/(customer)/support/support-form.tsx`, `src/app/admin/support/page.tsx`, `src/components/admin/admin-layout-shell.tsx`, `src/components/admin/admin-support-tickets-panel.tsx`, `src/components/site/user-menu.tsx`, `src/components/site/auth-modal.tsx`, `src/components/site/product-card.tsx`, `src/lib/catalog/part.ts`, `src/lib/catalog-fetch.ts`, `src/providers/customer-auth-provider.tsx`, `DATABASE_AUDIT.md`, `README.md`, `tracker.md`
- **Decisions:** One session bucket; **`me.php`** is admin-only probe so **`role: user`** cannot open **`/admin/*`**. Preview image synthesis removed per course “database is truth.” Passwords only via **`password_hash` / `password_verify`**.
- **Remaining:** Optional migration of **`admins`** → **`users`** for a single collection (runtime already checks both). **`/orders`** is backed by **`orders/mine.php`** + **`orders/detail.php`** as of Phase 22+.

---

## Phase 17 — Preview products from `public/images/` (Apr 2026) — superseded / removed

- **What changed:** Added **`getPreviewPartsFromLocalImages()`** (`src/lib/catalog/preview-local-inventory.ts`, `server-only`) — reads **`Brake Pads`**, **`Air Filters`**, **`Batteries`**, **`Radiators`** under **`public/images/`** (case-insensitive match), skips **`brandlogos`**, builds **`Part`** rows from each image file (encoded **`/images/...`** paths, deterministic SAR-range pricing, **`stockQty`** + **`stockStatus`**, one-line descriptions, unique **`slug`** / **`id`**). **`mergePartsForHomeRow`** / **`mergePartsForShopCatalog`** (`src/lib/catalog/storefront-catalog.ts`): home **Latest arrivals** = up to **4** cards, **real API rows first** then previews to fill; shop uses **real-only** when **`published` count ≥ 8**, otherwise **pads** with non-colliding preview rows. **`Part.isPreviewCatalog`** + **`ProductCard`**: preview cards use **`object-contain`** thumbs, **`Details` → `/shop`** (no PDP 404). Home empty copy mentions preview image folders if both sources are empty.
- **Files:** `src/lib/catalog/preview-local-inventory.ts`, `src/lib/catalog/storefront-catalog.ts`, `src/lib/catalog/part.ts`, `src/components/site/product-card.tsx`, `src/app/(customer)/page.tsx`, `src/app/(customer)/shop/page.tsx`, `README.md`, `tracker.md`
- **Decisions:** Preview inventory is **explicitly temporary** (module header comments); **PHP catalog** remains source of truth for PDP/admin; **no** cart/checkout/auth changes. Shop merge threshold **8** is a simple constant for “enough real rows for a dense grid.”
- **Remaining:** Delete preview helpers and merge calls when Mongo catalog is screenshot-ready end-to-end.

---

## Phase 16 — Brand strip (logos + motion) (Apr 2026)

- **What changed:** **`BrandStrip`** now reads PNG/JPEG/SVG/WebP files from **`public/images/brandlogos/`** at build/request time (`getBrandLogoPublicPaths`), passes paths into a client **`BrandStrip`** that renders **`next/image`** in a duplicated track with **`brand-strip-scroll`** keyframes (`globals.css`). Shallow **`rotateX` / `rotateY`** + per-logo **`translateZ` / scale / opacity** for left→right depth. Edge **mask** retained. **`prefers-reduced-motion`:** static wrapped row, no marquee. Empty folder → dashed placeholder, no layout collapse.
- **Files:** `src/components/site/brand-strip.tsx`, `src/lib/brand-logos-server.ts`, `src/lib/brand-logo-utils.ts`, `src/app/globals.css`, `src/app/(customer)/page.tsx`
- **Decisions:** No visible text labels; **`sr-only`** from filename for a11y. **`coveredBrandMarks`** mock strip unused on home (file kept for reference).
- **Remaining:** None for this milestone slice.

---

## Phase 15 — Real admin setup + product publish (Apr 2026)

Single pass: seeded admins + categories, server-side admin protection, `me.php` DB validation, backend-driven categories, binary image upload to PHP `public/uploads`, home/shop publish alignment, documentation refresh.

### Phase 15 — Admin auth / session

- **What changed:** `auth/me.php` always returns **HTTP 200** + `{ authenticated, email? }`, validates Mongo admin id + **email match** + **`role === "admin"`**, clears stale session keys on mismatch. `auth/logout.php` requires **POST** (matches `AdminSessionProvider`). `gp_match_published_catalog()` centralizes storefront visibility (treat missing `published` as visible).
- **Files:** `php/public/auth/me.php`, `php/public/auth/logout.php`, `php/include/app.php`, `php/public/catalog/products.php`, `php/public/catalog/related.php`, `src/providers/admin-session-provider.tsx`
- **Decisions:** Guest admin check is a normal JSON state (not HTTP 401) so middleware and the client share one contract.
- **Remaining:** Next 16 warns the **`middleware` → `proxy` migration** is upcoming upstream; current file follows the existing convention.

### Phase 15 — Admin route protection

- **What changed:** Added **`src/middleware.ts`** — forwards `Cookie` to **`PHP_BACKEND_URL/auth/me.php`** for every `/admin/*` route except **`/admin/login`**; redirects guests to login; redirects signed-in admins away from login toward dashboard. Keeps **`AdminAccessGate`** as client defense in depth.
- **Files:** `src/middleware.ts`, `src/components/admin/admin-access-gate.tsx` (unchanged contract)
- **Decisions:** RSC never renders protected admin chrome for anonymous users when PHP is reachable; if PHP is down, middleware sends users to login (fail closed for staff routes).
- **Remaining:** Edge deployments must be able to reach the PHP origin configured in **`PHP_BACKEND_URL`**.

### Phase 15 — Seed + categories collection

- **What changed:** **`scripts/seed-admins.mjs`** now upserts default **`categories`** documents after admins. **`scripts/ensure-indexes.mjs`** adds unique index on **`categories.name`**. New **`catalog/categories.php`** merges **`categories`** + distinct **`products.category`**, with **`["General"]`** fallback. **`AdminProductForm`** loads options from that endpoint (shadcn **Select**).
- **Files:** `scripts/seed-admins.mjs`, `scripts/ensure-indexes.mjs`, `php/public/catalog/categories.php`, `src/components/admin/admin-product-form.tsx`
- **Decisions:** Category labels are data, not a hardcoded TS array.
- **Remaining:** None for milestone taxonomy.

### Phase 15 — Images + admin search

- **What changed:** **`admin/upload-image.php`** (multipart, **`gp_require_admin`**) saves under **`php/public/uploads/`**; **`.gitignore`** ignores uploaded binaries but keeps **`.gitkeep`**. **`resolvePartImageSrc`** maps **`/uploads/...`** → **`/backend/uploads/...`**. Admin products table uses **debounced** **`admin/products.php?q=`** search. Removed mock numeric stock fallbacks in the admin table when **`stockQty`** is absent.
- **Files:** `php/public/admin/upload-image.php`, `php/public/uploads/.gitkeep`, `.gitignore`, `src/lib/catalog/resolve-part-image.ts`, `src/components/admin/admin-products-data-table.tsx`, `src/components/admin/admin-product-form.tsx`
- **Decisions:** Honest split: path/URL field remains; upload is **local disk** behind PHP (not a cloud CDN).
- **Remaining:** Production file ACL, virus scanning, CDN — not implemented.

### Phase 15 — Docs

- **What changed:** **`DATABASE_AUDIT.md`**, **`README.md`**, **`php/README.md`**, this **`tracker.md`** section.
- **Files:** `DATABASE_AUDIT.md`, `README.md`, `php/README.md`, `tracker.md`

---

## Phase 14 — Final stabilization (Fahad handoff)

Single integration pass: reliable local dev, no competing backends, no live mock catalog, admin + checkout auth aligned with PHP sessions.

### Phase 14 — local run reliability

- **What changed:** `package.json` **`php:server`** uses **`C:\xampp\php\php.exe`** explicitly; added **`dev:full`** (`concurrently` + `npm run dev` + `npm run php:server`).
- **Files:** `package.json`
- **Decisions:** Windows-first explicit PHP path per machine setup; teammates without XAMPP edit `package.json` or run PHP manually.
- **Remaining:** None for the stated Windows layout.

### Phase 14 — mock / fake live data removal

- **What changed:** Confirmed **`mockParts`** is not imported by live routes; **`CustomerAuthProvider`** no longer toggles fake local login — storefront session uses **`auth/customer-*.php`**.
- **Files:** `src/providers/customer-auth-provider.tsx`, `src/lib/mock/parts.ts` (comment only), `src/components/site/auth-modal.tsx`
- **Decisions:** Hero/brands mocks remain for marketing chrome only (not inventory).
- **Remaining:** None for catalog authority.

### Phase 14 — admin seeding

- **What changed:** No logic change — **`scripts/seed-admins.mjs`** already upserts the two emails with env-only passwords and exits cleanly when env vars are missing.
- **Files:** (verified) `scripts/seed-admins.mjs`
- **Decisions:** Node seed remains a **dev tool**, not the runtime auth path.
- **Remaining:** None.

### Phase 14 — admin protection + session truth

- **What changed:** **`AdminAccessGate`** wraps all admin shell routes except login; PHP **`gp_require_admin`** now verifies MongoDB document and **`role === "admin"`** on every admin API call.
- **Files:** `src/components/admin/admin-access-gate.tsx`, `src/components/admin/admin-layout-shell.tsx`, `php/include/app.php`, `php/public/auth/login.php`
- **Decisions:** Next has no middleware by design; client gate + PHP enforcement together meet the bar.
- **Remaining:** RSC admin pages may briefly run before client redirect (empty data only).

### Phase 14 — login / logout

- **What changed:** Admin login sets checkout identity for convenience; **`auth/logout.php`** clears **admin + checkout** session keys and **`session_regenerate_id`**. Storefront **`customer-logout.php`** clears checkout keys only. **`/admin/login`** redirects to dashboard if already authenticated.
- **Files:** `php/public/auth/login.php`, `php/public/auth/logout.php`, `php/public/auth/customer-login.php`, `php/public/auth/customer-me.php`, `php/public/auth/customer-logout.php`, `src/app/admin/login/page.tsx`
- **Decisions:** Storefront sign-in reuses **`admins`** (documented in audit) until a `customers` collection exists.
- **Remaining:** Dedicated customer accounts if product requires separation from staff.

### Phase 14 — guest cart + checkout login

- **What changed:** **`checkout/place.php`** requires **`gp_require_checkout_customer()`**. **`CheckoutForm`**, **`CartView`**, **`StorefrontAuthModalProvider`**, **`AuthModal`** gate checkout and resume at **`/checkout`** after sign-in.
- **Files:** `php/public/checkout/place.php`, `src/app/(customer)/checkout/checkout-form.tsx`, `src/app/(customer)/cart/cart-view.tsx`, `src/providers/storefront-auth-modal-provider.tsx`, `src/components/site/auth-modal.tsx`, `src/components/customer-providers.tsx`, `src/components/site/site-header.tsx`
- **Decisions:** Cart stays in **`$_SESSION['gp_cart']`** across login.
- **Remaining:** None for the stated flow.

### Phase 14 — publishing + images + empty home

- **What changed:** **`resolvePartImageSrc`** + **`next.config.ts`** remote patterns for local PHP image hosts; home **Latest arrivals** min-height + dashed empty panel.
- **Files:** `src/lib/catalog/resolve-part-image.ts`, `src/components/site/product-card.tsx`, `src/app/(customer)/shop/[slug]/page.tsx`, `src/components/admin/admin-products-data-table.tsx`, `src/app/(customer)/cart/cart-view.tsx`, `next.config.ts`, `src/app/(customer)/page.tsx`
- **Decisions:** DB continues to store path or URL string; no upload pipeline in this pass.
- **Remaining:** Binary upload + production CDN URL policy.

### Phase 14 — documentation

- **What changed:** **`DATABASE_AUDIT.md`** §10 truth audit; **`README.md`** Fahad handoff; **`php/README.md`** endpoints; this **`tracker.md`** section.
- **Files:** `DATABASE_AUDIT.md`, `README.md`, `php/README.md`, `tracker.md`

---

## Database & backend integration — status snapshot

| Item | Status |
|------|--------|
| Backend authority | **PHP** (`php/public`, `php/include`) — MongoDB via Composer `mongodb/mongodb` |
| Next.js role | **UI only** — no **`src/app/api/admin/*`**, no **JWT middleware** |
| Rewrites | **`/backend/*`** → **`PHP_BACKEND_URL`** (`next.config.ts`) |
| Storefront + PDP (RSC) | **`src/lib/php-server-fetch.ts`** + **`src/lib/catalog-fetch.ts`** → PHP catalog scripts |
| Admin auth | **`POST /backend/auth/login.php`**, **`auth/me.php`**, **`auth/logout.php`** — **PHP session (`PHPSESSID`)** |
| Storefront checkout auth | **`auth/customer-login.php`**, **`customer-me.php`**, **`customer-logout.php`** |
| Admin CRUD | **`admin/products.php`**, **`admin/product.php`** — wired from **`AdminProductForm`** / data table |
| Cart | **PHP session cart** — **`cart/*.php`**, **`CartProvider`** |
| Checkout | **`checkout/place.php`** — requires checkout session; orders + stock decrement + **`gp_last_order_id`** cookie |
| DB type | **MongoDB** (`MONGODB_URI`) |
| Node scripts (non-live path) | **`scripts/seed-admins.mjs`**, **`ensure-indexes.mjs`** — optional tooling |
| Mock catalog | **`mockParts`** not used for live storefront/admin — see `src/lib/mock/parts.ts` |

**See:** `DATABASE_AUDIT.md`, `php/README.md`, `.env.example` (`PHP_BACKEND_URL`).

---

## Historical phase

**Phase 13 — Admin UI shell (shadcn Sidebar, data table, auth shell)** (complete — UI primitives unchanged; now wired to data where noted above)

## Status summary

Foundation through Phase 11 remains in place (routes, mocks, theme tokens). **Phase 12** refined customer-facing branding and shop chrome. **Phase 13** rebuilds the **admin** experience on exact shadcn **Sidebar** (desktop) with **Sheet**-backed mobile nav (via Sidebar), **TanStack Table** “data table” over shadcn **Table**, **Alert Dialog** for delete/logout, separate **mock admin session** from customer auth, and README/tracker updates — **frontend-only**, ready for API wiring.

---

## Phase checklist

### Phase 1 — Foundation and cleanup ✅

- [x] Removed default Next.js starter page.
- [x] App shell: root layout + `(customer)` layout with header/footer.
- [x] Semantic tokens in `globals.css`: `background`, `foreground`, `surface`, `surface-2`, `surface-3`, plus shadcn-aligned `card`, `muted`, `border`, `primary`, etc.
- [x] Dark default near-black; light eggshell page background; chrome uses distinct `surface`.
- [x] `next-themes` + navbar `ThemeToggle`.
- [x] UI under `src/components/ui` (shadcn) and `src/components/site` / `admin`.

**Files created/updated:** `src/app/layout.tsx`, `src/app/globals.css`, `src/components/providers.tsx`, `src/app/(customer)/layout.tsx`, `components.json`, `next.config.ts` (images), `package.json`.

**Notes:** `@custom-variant dark (&:is(.dark *));` matches shadcn + class strategy. `--font-sans` maps to Geist variables from root layout.

---

### Phase 2 — Shared reusable UI ✅

- [x] `SiteHeader`, `MobileNav`, `ThemeToggle`, `SiteFooter`
- [x] `PageSection`, `SectionHeading`, `PageIntro`
- [x] `ProductCard`, `EmptyState`
- [x] `AuthModal`, `UserMenu`
- [x] `BrandStrip`, `HeroCarousel`, `CTASection`

**Files:** `src/components/site/*`, `src/components/customer-providers.tsx`.

**Notes:** Single button system via shadcn `Button`; forms use `Input`, `Label`, `Textarea`, `Select` patterns.

---

### Phase 3 — Route scaffolding ✅

- [x] Customer: `/`, `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/support`, `/orders`, `/settings`
- [x] Admin: `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`

**Files:** `src/app/(customer)/**`, `src/app/admin/**`.

**Notes:** Route group `(customer)` preserves URLs; admin is a separate tree without customer providers.

---

### Phase 4 — Homepage ✅

- [x] Header → hero carousel (max 3 slides) → intro → brand strip → featured `ProductCard` row → shop CTA → support CTA → footer.

**Files:** `src/app/(customer)/page.tsx`, `src/lib/mock/hero-slides.ts`.

---

### Phase 5 — Shop ✅

- [x] Intro, search, filters (sidebar desktop / sheet mobile), sort, `ProductCard` grid, `EmptyState`.

**Files:** `src/app/(customer)/shop/page.tsx`, `shop-catalog.tsx`.

**Notes:** Client-side filter of `mockParts`; stock filter via `Select`. **Phase 12** adds sticky sidebar + pagination (see below).

---

### Phase 6 — Product detail ✅

- [x] Breadcrumb, image, title, brand, part #, price, stock badge, qty + add to cart, description, compatibility block, related row.

**Files:** `src/app/(customer)/shop/[slug]/page.tsx`, `product-detail-actions.tsx`.

---

### Phase 7 — Cart & checkout ✅

- [x] Cart lines, qty, remove, subtotal, checkout CTA.
- [x] Checkout: customer + address + summary + place order (clears mock cart, success state).

**Files:** `src/app/(customer)/cart/cart-view.tsx`, `checkout/checkout-form.tsx`, `src/providers/cart-provider.tsx`.

---

### Phase 8 — Customer auth / account UI ✅

- [x] Log in opens `AuthModal` (Google + email paths → mock `login()`).
- [x] Logged-in avatar + `UserMenu` (Orders, Settings, Logout).
- [x] `/orders`, `/settings` pages.

**Files:** `src/providers/customer-auth-provider.tsx`, `auth-modal.tsx`, `user-menu.tsx`, `site-header.tsx`.

---

### Phase 9 — Support ✅

- [x] Intro, contact form (name, email, subject, message), contact block, map-style placeholder.

**Files:** `src/app/(customer)/support/support-form.tsx`.

---

### Phase 10 — Admin UI shell ✅

- [x] Separate `/admin/login` (no customer modal).
- [x] Dashboard cards + quick actions; products table; shared `AdminProductForm` for new/edit.

**Files:** `src/components/admin/admin-layout-shell.tsx`, `admin-product-form.tsx`, `src/app/admin/**`.

**Note:** **Phase 13** replaces the Phase 10 sidebar markup with the official shadcn **`Sidebar`**, adds the **data table** shell, **Alert Dialog** flows, and a separate **mock admin session** — see Phase 13 for the current admin architecture.

---

### Phase 11 — Consistency & polish ✅

- [x] Shared spacing via `PageSection` density; typography hierarchy on intros/headings.
- [x] Hover/focus from shadcn tokens; responsive shop (sheet filters + stacked grid).
- [x] Dark/light verified against semantic tokens; navbar/footer `bg-surface` vs page `bg-background`.
- [x] Loading skeletons: `shop/loading.tsx`, `shop/[slug]/loading.tsx`.
- [x] Global `not-found.tsx`; dropdown/dialog/sheet use popover/card tokens.

**Files:** `src/app/not-found.tsx`, loading routes above, small a11y tweaks (`ProductCard` / PDP `alt` text).

---

### Phase 12 — Branding, layout, and shadcn consistency (refinement pass) ✅

#### 12a — Branding cleanup

- [x] Navbar brand is a single **G** (with `aria-label` for Gulf Parts Co home).
- [x] Footer and copyright use **Gulf Parts Co**; removed prior placeholder wordmark styling.
- [x] Site metadata default title / template updated to Gulf Parts Co.
- [x] Home intro and admin sidebar label no longer use the old placeholder store name in visible UI.
- [x] Support contact email updated to `support@gulfparts.co`.

**Files updated:** `src/components/site/site-header.tsx`, `src/components/site/site-footer.tsx`, `src/app/layout.tsx`, `src/app/(customer)/page.tsx`, `src/components/admin/admin-layout-shell.tsx`, `src/app/(customer)/support/support-form.tsx`.

**Notes:** README / tracker titles aligned with Gulf Parts Co; course “CarPart” repo title kept where appropriate.

#### 12b — Hero carousel cleanup

- [x] Removed in-slide `CarouselPrevious` / `CarouselNext` overlay controls.
- [x] Added subtle dot indicators plus compact ghost chevrons **below** the hero card (controls do not sit on the image).
- [x] Shortened hero copy in mocks; still max 3 slides enforced in component.

**Files updated:** `src/components/site/hero-carousel.tsx`, `src/lib/mock/hero-slides.ts`.

#### 12c — Brands We Cover strip

- [x] Section renamed to **Brands We Cover**; removed separate tinted band (“Trusted suppliers” box).
- [x] Replaced typed brand text row with neutral **Lucide** placeholder marks in a shallow 3D strip (mask + perspective); `id`/`name` retained for future real logos and `sr-only` labels.
- [x] Mock data lists 14 intended makes (Toyota … Audi) without rendering their names as the primary visual.

**Files updated:** `src/components/site/brand-strip.tsx`, `src/lib/mock/brands.ts`, `src/app/(customer)/page.tsx`.

**Files removed / replaced:** Old `brandLogos` text marks replaced by `coveredBrandMarks` + icons.

#### 12d — Product card cleanup

- [x] Dark theme **card / surface / muted / accent** tokens shifted to **neutral graphite** (removed blue-heavy 260 hue from card stack).
- [x] `ProductCard`: neutral badges, title/details links without primary-colored hover wash; footer uses muted strip; dark hover uses subtle ring instead of tinted glow.

**Files updated:** `src/app/globals.css`, `src/components/site/product-card.tsx`.

#### 12e — Shop sidebar + pagination

- [x] Desktop filter column is **sticky** (`top-24`), `self-start`, compact padding; main grid uses `items-start` so the sidebar does not stretch to full page height.
- [x] Product grid paginated (**9** per page) with shared filter/sort state; range label (“Showing x–y of z”).
- [x] Pagination UI composed from shadcn **`Pagination`** + **`Button`** (no ad-hoc markup).

**Files updated:** `src/app/(customer)/shop/shop-catalog.tsx`.

**Files created:** `src/components/ui/pagination.tsx` (shadcn registry).

#### 12f — shadcn consistency audit

- [x] Confirmed **AuthModal** → `Dialog`, **UserMenu** → `DropdownMenu`, **MobileNav** / shop filters → `Sheet`.
- [x] `MobileNav` sheet content aligned with other overlays (`border-border bg-popover`).
- [x] Checkout/support/admin forms already on shadcn inputs; no custom modal replacements required.

**Files updated:** `src/components/site/mobile-nav.tsx`.

---

### Phase 13 — Admin UI shell (Sidebar, data table, flows) ✅

Milestone-ready **admin-only** pass: customer storefront styling untouched except shared providers. Uses **exact shadcn** primitives from the registry; **no custom sidebar/table substitutes**.

#### Phase 0 — shadcn verify / add

- [x] Verified existing: `button`, `input`, `label`, `textarea`, `checkbox`, `select`, `card`, `badge`, `dropdown-menu`, `sheet`, `separator`, `table`, `pagination`.
- [x] **Added** via `npx shadcn add`: **`sidebar`** (includes **Sheet** for mobile drawer), **`alert-dialog`**, **`tooltip`**, **`use-mobile`** hook.
- [x] **Added** dependency: **`@tanstack/react-table`** for the official shadcn **Data Table** pattern.
- [x] **Decision:** Implemented the **Data Table** as **TanStack React Table + shadcn `Table`** (recommended shadcn recipe). Did **not** ship a static table-only page — the grid uses column definitions, client state, and optional pagination.

**Files created/updated:** `src/components/ui/sidebar.tsx`, `alert-dialog.tsx`, `tooltip.tsx`, `src/hooks/use-mobile.ts`, `package.json`, `package-lock.json`, `src/app/globals.css` (registry merge).

**shadcn components:** `sidebar`, `sheet` (via sidebar mobile), `alert-dialog`, `tooltip`.

#### Phase 1 — Profile dropdown admin entry

- [x] **UserMenu** (`DropdownMenu`): added **Admin panel** linking to `/admin/dashboard` when mock admin session is set, otherwise `/admin/login`. Orders / Settings / Logout unchanged.

**Files:** `src/components/site/user-menu.tsx`.

**shadcn:** `dropdown-menu`, `button`, `avatar`.

#### Phase 2 — Admin route shell

- [x] Confirmed routes: `/admin/login`, `/admin/dashboard`, `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit` under shared `src/app/admin/layout.tsx` + shell.

**Files:** `src/app/admin/layout.tsx` (unchanged contract); admin pages use consistent `max-w-*` wrappers.

#### Phase 3 — shadcn Sidebar admin shell

- [x] Replaced bespoke `<aside>` admin nav with **`SidebarProvider`**, **`Sidebar`**, **`SidebarInset`**, **`SidebarTrigger`** (mobile), menu groups, footer links.
- [x] **Mobile:** shadcn **Sidebar** uses **Sheet** internally for the drawer (no parallel custom nav).

**Files:** `src/components/admin/admin-layout-shell.tsx`.

**shadcn:** `sidebar` (+ built-in `sheet`, `tooltip` from sidebar), `alert-dialog` (logout confirm).

#### Phase 4 — Admin login

- [x] Dedicated `/admin/login` using **`Card`**, **`Input`**, **`Label`**, **`Button`**; fields **Admin ID or email** + **password**; helper copy for demo; error line placeholder.
- [x] Submit sets **mock admin session** (`AdminSessionProvider` + `localStorage`) and routes to `/admin/dashboard`.

**Files:** `src/app/admin/login/page.tsx`, `src/providers/admin-session-provider.tsx`, `src/components/providers.tsx`.

**shadcn:** `card`, `input`, `label`, `button`.

#### Phase 5 — Admin dashboard

- [x] Summary **cards**: total products, low stock count, categories count, pending changes (demo badge).
- [x] Quick actions: **Add product**, **Manage products**; small **recent products** list with **Badge** status.
- [x] Used **`Card`**, **`Button`**, **`Badge`**, **`Separator`**.

**Files:** `src/app/admin/dashboard/page.tsx`.

**shadcn:** `card`, `button`, `badge`, `separator`.

#### Phase 6 — Admin products data table

- [x] **`AdminProductsDataTable`**: `@tanstack/react-table` + shadcn **`Table`**; **`Input`** search; **`Button`** add product (page header); **`Badge`** status; **`DropdownMenu`** row actions; **`AlertDialog`** delete confirm; **`Pagination`** when page count > 1 (page size 5 for demo).
- [x] Columns: **thumb** (`next/image`), name/part #, brand, category, **mock stock qty**, price, status, actions.
- [x] Delete removes row from **client state** only (mock).

**Files:** `src/components/admin/admin-products-data-table.tsx`, `src/app/admin/products/page.tsx`.

**shadcn:** `table`, `input`, `button`, `badge`, `dropdown-menu`, `alert-dialog`, `pagination`.

#### Phase 7 — Add / edit product form

- [x] Shared **`AdminProductForm`** for new + edit on **`Card`** sections: name, brand, category, part number, slug, price, **stock qty**, status **`Select`**, **published `Checkbox`**, description **`Textarea`**, **file input** image placeholder, optional compatibility (**make / model / year**).
- [x] **`Separator`** before action row; **Save / Cancel** after cards.

**Files:** `src/components/admin/admin-product-form.tsx`, `src/app/admin/products/new/page.tsx`, `src/app/admin/products/[id]/edit/page.tsx`.

**shadcn:** `card`, `input`, `label`, `textarea`, `select`, `checkbox`, `button`, `separator`.

#### Phase 8 — Delete & logout UI

- [x] **Delete:** row **`AlertDialog`** (no `window.confirm`).
- [x] **Logout:** sidebar **Logout** opens **`AlertDialog`**, clears mock admin session, routes to `/admin/login`. Customer **Logout** in **`UserMenu`** unchanged (immediate mock customer logout).

**shadcn:** `alert-dialog`, `button`.

#### Phase 9 — Consistency pass

- [x] Admin pages use aligned **`max-w-*`**, shared heading pattern, card/table spacing, theme tokens (`background`, `sidebar`, `border`, `card`).
- [x] **Sidebar** + **Sheet** (mobile) behavior verified via shadcn Sidebar; primary actions remain **`Button`** defaults / **`outline`** secondary.
- [x] **Customer** pages and branding (**G** / **Gulf Parts Co**) not redesigned in this pass.

**shadcn:** audit confirms listed components remain registry-backed.

---

## Decisions log

- **Theme:** Class-based dark mode; default `dark`; eggshell `background` in `:root`, near-black in `.dark`; layered `surface*` for chrome and elevated panels. **Phase 12:** dark `card` / `surface-2` / `muted` / `accent` / `ring` use **achromatic** oklch (no cool indigo cast on product chrome).
- **Customer vs admin:** Customer auth + cart live in `CustomerProviders` under `(customer)` only. Admin uses dedicated login page and `AdminLayoutShell` (no `AuthModal`).
- **Data:** Central mocks in `src/lib/mock/parts.ts`, `hero-slides.ts`, `brands.ts`; images via `picsum.photos` + `next/image` remotePatterns.
- **shadcn:** Initialized with Tailwind v4 + `tw-animate-css`; primitives from registry (`radix-ui` package where generated).
- **Branding (Phase 12):** Customer navbar **G**; legal/footer naming **Gulf Parts Co**; public copy avoids the retired placeholder storefront name.
- **Admin shell (Phase 13):** Admin navigation uses shadcn **`Sidebar`** (desktop) with **Sheet** for mobile; catalog management uses **TanStack + `Table`** data table pattern. **Phase 14** replaced mock admin/customer auth with **PHP session** (`AdminSessionProvider` + `CustomerAuthProvider`).
- **Phase 14 stabilization:** Single PHP path; **`dev:full`** for local reliability; **`AdminAccessGate`** + **`gp_require_admin` DB role check**; storefront **`customer-*`** endpoints reuse **`admins`** for checkout until a dedicated customers collection ships; **`checkout/place.php`** enforces checkout session server-side.
