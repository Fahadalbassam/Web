# Database + backend audit — Gulf Parts Co (web)

**Authority:** **PHP** (`php/public/`, `php/include/`) is the **only** backend for auth, sessions, catalog API, admin CRUD, cart, and checkout. **Next.js** is the UI shell; it does **not** expose Route Handlers for those behaviors anymore.

---

## 1. Stack split

| Layer | Role |
|-------|------|
| **Next.js 16** + TypeScript + shadcn/ui | UI only — Server Components call PHP via `PHP_BACKEND_URL`; client components call **`/backend/...`** (rewritten to PHP). |
| **PHP 8.1+** + Composer `mongodb/mongodb` | Reads/writes **MongoDB**, **`session_start()`**, JSON APIs. |
| **MongoDB** | Single database (`MONGODB_URI`; DB name from path e.g. `carparts_catalog`). |
| **Node** (`mongodb` npm package) | **Dev tooling only**: `scripts/seed-admins.mjs`, `scripts/ensure-indexes.mjs`, `scripts/mongo-ping.mjs` — **not** in the live request path. |

---

## 2. Removed / replaced (no competing truth)

| Removed / replaced | Notes |
|---------|-------|
| `src/app/api/admin/**` | Deleted — admin/auth/crud no longer on Next. |
| Legacy JWT `src/middleware.ts` | Removed earlier; **current** `src/middleware.ts` only probes PHP `auth/me.php` for `/admin/*` (no JWT). |
| `src/lib/admin-auth.ts`, JWT / `gpc_admin` | Removed — auth is PHP session only. |
| `src/lib/repositories/*` | Removed — no Node Mongo access from app routes. |
| `jose` npm dependency | Removed. |

---

## 3. Frontend → PHP mapping

**Browser (client):** base **`/backend/`** via `phpBrowserUrl()` in `src/lib/php-backend.ts`. Next **`rewrites`** `/backend/:path*` → `${PHP_BACKEND_URL}/:path*`.

**Server (RSC):** `src/lib/php-server-fetch.ts` → `${PHP_BACKEND_URL}${path}`; forwards **`Cookie`** header when calling admin routes.

| UI / behavior | Calls |
|---------------|--------|
| Admin login | `POST /backend/auth/login.php` |
| Admin logout | `POST /backend/auth/logout.php` |
| Admin session check | `GET /backend/auth/me.php` (200 + JSON; validates Mongo admin + role) |
| Catalog categories | `GET /backend/catalog/categories.php` |
| Admin image upload | `POST /backend/admin/upload-image.php` (multipart `file`; requires admin session) |
| Storefront sign-in (checkout) | `POST /backend/auth/customer-login.php`, `GET /backend/auth/customer-me.php`, `POST /backend/auth/customer-logout.php` |
| Home / shop / PDP data (RSC) | `phpServerFetch` → `/catalog/products.php`, `/catalog/product.php`, `/catalog/related.php` |
| Admin list / dashboard (RSC) | `GET /backend/admin/products.php` (cookie forwarded) |
| Admin edit load (RSC) | `GET /backend/admin/product.php?id=` |
| Admin save (form) | `POST /backend/admin/products.php`, `PATCH /backend/admin/product.php?id=` |
| Admin delete (table) | `DELETE /backend/admin/product.php?id=` |
| Cart | `GET/POST /backend/cart/*.php` |
| Checkout | `POST /backend/checkout/place.php` (requires storefront checkout session) |

---

## 4. MongoDB collections

| Collection | Purpose |
|------------|---------|
| `products` | Catalog (slug unique recommended — `scripts/ensure-indexes.mjs`). |
| `admins` | `email`, `passwordHash` (bcrypt), `role`. |
| `categories` | Canonical category labels (`name`, timestamps). Seeded by `npm run db:seed-admins`; merged in API with distinct `products.category`. |
| `orders` | Created by **`checkout/place.php`** with lines, customer, shipping, `total`. |

---

## 5. Sessions & cookies

- **PHP session cookie:** `PHPSESSID` — **HttpOnly**, **SameSite=Lax**, **Secure** when `NODE_ENV=production` or `GP_COOKIE_SECURE=1`.
- **Admin panel:** `$_SESSION['admin_id']`, `$_SESSION['admin_email']` set by **`auth/login.php`**; each admin API re-validates **`role === "admin"`** in MongoDB (`gp_require_admin` in `app.php`). **`auth/me.php`** performs the same DB + email match check so the browser and Next **middleware** do not trust session keys alone.
- **Storefront checkout identity:** `$_SESSION['gp_checkout_customer_id']`, `$_SESSION['gp_checkout_customer_email']` set by **`auth/customer-login.php`** or alongside admin login in **`auth/login.php`**. **Beta note:** credentials are verified against the same **`admins`** collection (there is no separate `customers` collection yet).
- **Cart:** `$_SESSION['gp_cart']` — array of `{ slug, quantity }` (see `php/include/cart.php`).
- **Past purchase hint:** **`gp_last_order_id`** cookie set by **`checkout/place.php`** (not HttpOnly — readable for simple “last order” UX if extended).

---

## 6. Course alignment (honest status)

| Requirement | Status |
|-------------|--------|
| Products from DB via backend | **Yes — PHP** reads/writes MongoDB. |
| PHP sessions / cookies | **Yes** — `PHPSESSID`, admin + cart session. |
| Admin auth | **Yes — PHP** `password_verify` on `admins`. |
| Admin CRUD | **Yes — PHP** `admin/products.php`, `admin/product.php`. |
| Cart / checkout backend | **Yes — PHP** cart endpoints + `checkout/place.php` (stock decrement, order insert). |
| JS validation | **Ready** — forms keep HTML5 `required`; client can add layers without layout changes. |
| Node as live backend | **No** — intentionally removed from auth/admin/catalog/cart/checkout paths. |

---

## 7. Environment

| Variable | Who reads it |
|----------|----------------|
| `MONGODB_URI` | PHP (`gp_require_env`), Node seed scripts |
| `PHP_BACKEND_URL` | Next (`next.config.ts` rewrites, `php-server-fetch.ts`) — default `http://127.0.0.1:8080` |
| `ADMIN_SEED_PASSWORD_FAHAD`, `ADMIN_SEED_PASSWORD_OBAI` | **`scripts/seed-admins.mjs`** only (upserts admins + default `categories` docs) |

---

## 8. Running locally

**Single command (recommended):** `npm run dev:full` — runs Next dev server and the PHP built-in server together (`concurrently`).

**Or two terminals:**

1. **PHP:** `npm run php:server` — uses **`C:\xampp\php\php.exe`** (see `package.json`; avoids missing `php` on PATH).
2. **Next:** `npm run dev` — `.env.local` must include **`PHP_BACKEND_URL=http://127.0.0.1:8080`** so RSC can reach PHP.

---

## 9. Limits (unchanged engineering facts)

- **Checkout concurrency:** Stock updates use per-line rollback on failure mid-loop; not a full MongoDB transaction (**Partial** — acceptable for beta; not serializable inventory).

---

## 10. Final truth audit (labels: Working / Partial / Not Done / Blocked)

| Topic | Status | Notes |
|--------|--------|--------|
| Products from database (catalog + admin) | **Working** | PHP reads/writes `products`; storefront uses published filter where applicable. |
| PDP quantity handling | **Working** | Client respects stock from hydrated cart lines; PHP rejects over-stock on checkout. |
| Cart icon / count | **Working** | `CartProvider` syncs from `cart/get.php`. |
| Guest cart | **Working** | Session cart; no login required to add/update. |
| Storefront login / logout | **Working** | `customer-*` PHP endpoints + `CustomerAuthProvider`; refresh uses `customer-me.php`. |
| Admin login / logout | **Working** | `auth/login.php` / **`logout.php` (POST only)**; clears admin + checkout identity, **`session_regenerate_id`**, preserves cart. **`me.php`** returns HTTP 200 + `{ authenticated }` (DB-validated). |
| Admin route protection (Next `/admin/*` except login) | **Working** | **`src/middleware.ts`** redirects to `/admin/login` when PHP `me.php` reports `authenticated: false`; **`AdminAccessGate`** is defense in depth. PHP `gp_require_admin` + DB role on every admin API. |
| Accounts with `role !== "admin"` in `admins` | **Working** (reject) | Logins and `gp_require_admin` reject non-admin documents; only seeded admin role is in use today. |
| Admin add / modify / delete / search | **Working** | CRUD on `admin/products.php` + `admin/product.php`; table search hits **`?q=`** server-side (debounced). |
| Admin seed (two staff emails) | **Working** | **`npm run db:seed-admins`** upserts **`fahad2albassam@gmail.com`** + **`obayyassine@gmail.com`** when env passwords set; also ensures default **`categories`** docs. |
| Product publish → home / shop | **Working** | Storefront shows parts where **`published !== false`** (`gp_match_published_catalog()`), sorted by **`createdAt` desc** in `catalog/products.php`; home uses `?published=1&limit=4`. |
| PDP by slug | **Working** | `catalog/product.php?slug=` |
| Checkout after login (continue flow) | **Working** | Modal `openLogin("/checkout")` + `StorefrontAuthModalProvider` redirect; cart unchanged in session. |
| Checkout modify lines / clear cart / place order | **Working** | Cart PHP + `checkout/place.php` with auth gate. |
| Stock decrement after buy | **Working** | In `checkout/place.php` loop with rollback on failure. |
| Cookies / continuation (`PHPSESSID`, `gp_last_order_id`) | **Working** | Standard session; last-order cookie set on success (HttpOnly false by design there). |
| Past purchases / order history UI | **Not Done** | `gp_last_order_id` exists; `/orders` is not wired to PHP order list. |
| JS validation beyond HTML5 | **Partial** | `required` on forms; no extra schema layer. |
| Product detail help popup | **Not Done** | No dedicated PHP-backed help widget (static UI only if present). |
| Contact map / live location | **Partial** | Support page uses placeholder / static patterns (no live map API in this pass). |
| Product image storage (path / filename) | **Working** | DB string passed through; `resolvePartImageSrc` maps **`/uploads/...`** → **`/backend/uploads/...`** so Next/Image hits the PHP-served file via rewrite. |
| Binary image upload to server | **Partial / Working (local)** | **`admin/upload-image.php`** accepts multipart `file` (JPEG/PNG/WebP/GIF, max 5MB), writes **`php/public/uploads/`**, returns JSON `{ path: "/uploads/..." }`. Production CDN / hardening not in scope. |
| Category source (admin Select) | **Working** | **`catalog/categories.php`** — union of **`categories.name`** and distinct **`products.category`**; fallback `["General"]` if empty. |
| Separate `customers` collection | **Not Done** | Storefront auth reuses `admins` for this beta. |
