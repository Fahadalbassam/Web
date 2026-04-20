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
| Legacy JWT `src/middleware.ts` | Removed earlier; **current** `src/middleware.ts` probes PHP **`auth/me.php`** and, for denials, **`auth/customer-me.php`** to choose **`/?login=1`** vs **`/`** (no JWT). |
| `src/lib/admin-auth.ts`, JWT / `gpc_admin` | Removed — auth is PHP session only. |
| `src/lib/repositories/*` | Removed — no Node Mongo access from app routes. |
| `jose` npm dependency | Removed. |

---

## 3. Frontend → PHP mapping

**Browser (client):** base **`/backend/`** via `phpBrowserUrl()` in `src/lib/php-backend.ts`. Next **`rewrites`** `/backend/:path*` → `${PHP_BACKEND_URL}/:path*`.

**Server (RSC):** `src/lib/php-server-fetch.ts` → `${PHP_BACKEND_URL}${path}`; forwards **`Cookie`** header when calling admin routes.

| UI / behavior | Calls |
|---------------|--------|
| Unified login (storefront + same credentials as admin staff) | `POST /backend/auth/login.php`, `POST /backend/auth/customer-login.php` (same server logic) |
| Registration | `POST /backend/auth/register.php` → inserts **`users`** then signs in |
| Admin logout / storefront logout | `POST /backend/auth/logout.php`, `POST /backend/auth/customer-logout.php` (both clear the same identity keys; cart **`gp_cart`** preserved) |
| Admin session check (middleware + `AdminSessionProvider`) | `GET /backend/auth/me.php` — **`authenticated: true` only if DB `role === "admin"`** |
| Storefront session + role | `GET /backend/auth/customer-me.php` — **`authenticated`**, **`userId`**, **`email`**, **`role`** (`user` \| `admin`) |
| Catalog categories | `GET /backend/catalog/categories.php` |
| Admin image upload | `POST /backend/admin/upload-image.php` (multipart `file`; requires admin session) |
| Support form | `POST /backend/support/ticket.php` (public; optional **`userId`** from session) |
| Admin support list / status | `GET /backend/admin/support-tickets.php?q=`, `PATCH` JSON `{ id, status }` |
| Home / shop / PDP data (RSC) | `phpServerFetch` → `/catalog/products.php`, `/catalog/product.php`, `/catalog/related.php` |
| Admin list / dashboard (RSC) | `GET /backend/admin/products.php` (cookie forwarded) |
| Admin edit load (RSC) | `GET /backend/admin/product.php?id=` |
| Admin save (form) | `POST /backend/admin/products.php`, `PATCH /backend/admin/product.php?id=` |
| Admin delete (table) | `DELETE /backend/admin/product.php?id=` |
| Admin orders (RSC + client) | `GET /backend/admin/orders.php`, `GET /backend/admin/order.php?id=`, `PATCH /backend/admin/order.php` JSON `{ id, status }` |
| Customer orders | `GET /backend/orders/mine.php`, `GET /backend/orders/detail.php?id=` (storefront session + ownership) |
| Cart | `GET/POST /backend/cart/*.php` |
| Checkout | `POST /backend/checkout/place.php` (requires checkout identity in session) |

---

## 4. MongoDB collections

| Collection | Purpose |
|------------|---------|
| `products` | Catalog: `name`, `slug`, `brand`, `category`, `partNumber`, `price`, `stockQty`, `description`, `image`, `published`, `createdAt`, `updatedAt`, optional `compatibility`. |
| `users` | Storefront accounts: `email`, `passwordHash` (**`password_hash()` / `password_verify()` only**), `role` (`user` \| `admin`), `createdAt`, `updatedAt`. |
| `admins` | **Legacy / seed path:** same shape as typical staff rows (`email`, `passwordHash`, `role: "admin"`). **`gp_find_auth_doc_by_email`** checks **`users` first**, then **`admins`**, so seeded staff keep working without manual migration. New registrations go to **`users`**. |
| `categories` | Canonical category labels (`name`, timestamps). Seeded by `npm run db:seed-admins`; merged in API with distinct `products.category`. |
| `orders` | **Final schema** — see §4b. Created by **`checkout/place.php`**; listed/updated via **`orders/*`** (customer) and **`admin/orders.php`** / **`admin/order.php`** (staff). Legacy docs may still use field **`lines`** instead of **`items`** (read APIs normalize). |
| `supportTickets` | `name`, `email`, `subject`, `message`, `status` (`open` \| `in_progress` \| `closed`), `createdAt`, `updatedAt`, optional `userId`. |

---

## 4b. Orders collection — final schema

**Writer:** `checkout/place.php` (logged-in checkout session only). **Readers:** `orders/mine.php`, `orders/detail.php`, `admin/orders.php`, `admin/order.php`.

| Field | Type | Notes |
|-------|------|--------|
| `_id` | ObjectId | Order id (hex string in JSON APIs). |
| `userId` | string | Storefront account id (`users` / unified session). |
| `userEmail` | string | Normalized account email from session (authoritative ownership). |
| `customerName` | string | Checkout form full name (duplicate of `customer.fullName` for indexing/display). |
| `customer` | object | `fullName`, `email`, `phone` from checkout form. |
| `shipping` | object | `line1`, `line2`, `city`, `state`, `postal`. |
| `items` | array | Order lines (legacy docs: **`lines`**). Each element: `productId`, `slug`, `name`, `image`, `unitPrice`, `quantity`, `lineTotal`. |
| `subtotal` | number | Sum of line totals (currently equals `total`; no tax/shipping fee in this beta). |
| `total` | number | Charged total (SAR). |
| `status` | string | One of: **`pending`**, **`confirmed`**, **`processing`**, **`shipped`**, **`delivered`**, **`cancelled`**. New orders start **`pending`**. |
| `createdAt` | UTCDateTime | Insert time. |
| `updatedAt` | UTCDateTime | Last update (status changes from admin). |

**Order status model:** scalar string only; admin updates via **`PATCH admin/order.php`**. Invalid PATCH values are rejected (HTTP 400).

**Guest checkout:** **Not allowed.** `gp_require_checkout_customer()` returns **401** if session lacks checkout identity; storefront UI gates **`/checkout`** behind sign-in. Session cart **`gp_cart`** is unchanged by login/register/logout so guests can add to cart, sign in, then check out.

**Checkout identity + contact email:** `checkout/place.php` stores authoritative **`userId`** / **`userEmail`** from the PHP session. The JSON **`customer.email`** field must **match** the session account email (normalized); otherwise the request fails with **400** so an order cannot be attributed to another address while signed in.

**Cart / session / checkout flow:** Cart lines are **`{ slug, quantity }`** in `$_SESSION['gp_cart']`. **`cart/get.php`** hydrates from **`products`** via **`gp_cart_hydrate()`** (quantities capped by live stock). Storefront **`CartProvider`** waits for the first **`cart/get.php`** response before showing empty states; after successful **`customer-login.php`** / **`register.php`**, the client dispatches **`gp-cart-refresh`** so the UI re-fetches lines without a full reload (same PHP session). **`checkout/place.php`** re-hydrates, decrements **`stockQty`** per line with rollback on failure, inserts **`orders`**, clears session cart, sets optional **`gp_last_order_id`** cookie.

**Admin order visibility:** **`admin/orders.php`** lists recent orders (summary). **`admin/order.php?id=`** returns full detail; **`PATCH`** updates **`status`** / **`updatedAt`**. Protected by **`gp_require_admin()`**.

**User order history:** **`orders/mine.php`** returns summaries for the authenticated storefront user (Mongo query + **`gp_order_user_can_view`**). **`orders/detail.php?id=`** returns one order or **403** if not owned. Guests receive **401** and are prompted to sign in on **`/orders`**.

---

## 5. Auth model (chosen approach)

- **Single PHP session bucket** (`PHPSESSID`). Canonical keys: **`gp_user_id`**, **`gp_user_email`**, **`gp_user_role`**. Checkout reuse: **`gp_checkout_customer_id`** / **`gp_checkout_customer_email`** mirror the same identity after login.
- **Legacy compatibility:** **`admin_id`** / **`admin_email`** are still set when **`role === "admin"`** so older assumptions remain valid; **`gp_require_admin()`** resolves the account by id from **`users`** or **`admins`** and requires **`role === "admin"`** in MongoDB.
- **Passwords:** Stored only as **`passwordHash`** from PHP **`password_hash()`**; verification via **`password_verify()`**. Never returned to the client.
- **Admin gating:** Next **`middleware`** and **`auth/me.php`** grant **`authenticated: true`** only for **`role === "admin"`** in MongoDB. Normal **`role === "user"`** accounts may sign in on the storefront but **`me.php`** reports not authenticated for admin routes, so **`/admin/*`** (except the compatibility **`/admin/login`** stub) is blocked. Guests are redirected to **`/?login=1`** (storefront **`AuthModal`**); signed-in non-admins are redirected to **`/`**. PHP admin APIs use **`gp_require_admin()`** (same rule).

---

## 6. Sessions & cookies

- **PHP session cookie:** `PHPSESSID` — **HttpOnly**, **SameSite=Lax**, **Secure** when `NODE_ENV=production` or `GP_COOKIE_SECURE=1`.
- **Unified identity:** Set by **`auth/login.php`**, **`auth/customer-login.php`**, and **`auth/register.php`** via **`gp_commit_login_session()`** in **`php/include/app.php`**.
- **Admin probe:** **`auth/me.php`** validates **`gp_user_*`** (or legacy **`admin_*`**) against MongoDB; responds **`authenticated: false`** for signed-in **non-admin** users without destroying their storefront session.
- **Cart:** `$_SESSION['gp_cart']` — unchanged by auth logout (identity keys cleared only).
- **Past purchase hint:** **`gp_last_order_id`** cookie set by **`checkout/place.php`**.

---

## 7. Product publish / “latest listings” rule

- **Storefront visibility:** **`gp_match_published_catalog()`** — documents are listed unless **`published === false`** (missing field still surfaces, matching legacy data).
- **Ordering:** **`catalog/products.php`** uses **`sort: { createdAt: -1 }`** for listings. Home uses **`?published=1&limit=4`** — newest published-first slice for “Latest arrivals.”

---

## 8. Course alignment (honest status)

| Requirement | Status |
|-------------|--------|
| Products from DB via backend | **Yes — PHP** reads/writes MongoDB. |
| PHP sessions / cookies | **Yes** — unified identity + cart. |
| Admin auth | **Yes — PHP** `password_verify` + MongoDB `role === admin`. |
| Storefront accounts | **Yes —** `users` collection + **`auth/register.php`**. |
| Admin CRUD | **Yes — PHP** `admin/products.php`, `admin/product.php`. |
| Cart / checkout backend | **Yes — PHP** cart endpoints + `checkout/place.php` (stock decrement, order insert). |
| JS validation | **Ready** — forms keep HTML5 `required`; client can add layers without layout changes. |
| Node as live backend | **No** — intentionally removed from auth/admin/catalog/cart/checkout paths. |

---

## 9. Environment

| Variable | Who reads it |
|----------|----------------|
| `MONGODB_URI` | PHP (`gp_require_env`), Node seed scripts — **local dev:** also loaded into PHP via **`php/include/load-env.php`** from repo-root **`.env`** / **`.env.local`** (dotenv) so `php -S` does not require shell exports |
| `PHP_BACKEND_URL` | Next (`next.config.ts` rewrites, `php-server-fetch.ts`) — default `http://127.0.0.1:8080` |
| `ADMIN_SEED_PASSWORD_FAHAD`, `ADMIN_SEED_PASSWORD_OBAI` | **`scripts/seed-admins.mjs`** only (upserts admins + default `categories` docs) |

---

## 10. Running locally

**Single command (recommended):** `npm run dev:full` — runs Next dev server and the PHP built-in server together (`concurrently`).

**Or two terminals:**

1. **PHP:** `npm run php:server` — uses **`C:\xampp\php\php.exe`** (see `package.json`; avoids missing `php` on PATH).
2. **Next:** `npm run dev` — `.env.local` must include **`PHP_BACKEND_URL=http://127.0.0.1:8080`** so RSC can reach PHP.

---

## 11. Limits (unchanged engineering facts)

- **Checkout concurrency:** Stock updates use per-line rollback on failure mid-loop; not a full MongoDB transaction (**Partial** — acceptable for beta; not serializable inventory).

---

## 12. Final truth audit (labels: Working / Partial / Not Done / Blocked)

| Topic | Status | Notes |
|--------|--------|--------|
| Products from database (catalog + admin) | **Working** | PHP reads/writes `products`; storefront uses published filter where applicable. |
| PDP quantity handling | **Working** | Client respects stock from hydrated cart lines; PHP rejects over-stock on checkout. |
| Cart icon / count | **Working** | `CartProvider` syncs from `cart/get.php`. |
| Guest cart | **Working** | Session cart; no login required to add/update. |
| Storefront login / logout / register | **Working** | **`auth/register.php`** creates **`users`**; **`customer-login.php`** matches **`login.php`**; **`customer-me.php`** returns **`userId`**, **`email`**, **`role`**; **`CustomerAuthProvider`**. Logout clears identity keys only; cart preserved. |
| Admin login / logout | **Working** | Same credentials as storefront when staff exists in **`users`** or **`admins`** with **`role: admin`**. **`logout.php`** / **`customer-logout.php`** clear the same identity keys. **`me.php`** = admin-only probe for middleware. |
| Admin route protection (Next `/admin/*`) | **Working** | **`src/middleware.ts`** checks **`me.php`**; guests → **`/?login=1`**, signed-in non-admins → **`/`**; **`/admin/login`** is a compatibility stub. **`AdminAccessGate`** mirrors redirects via **`customer-me.php`**. PHP **`gp_require_admin`** + DB role on every admin API. |
| Non-admin users blocked from `/admin` | **Working** | **`auth/me.php`** is false for **`role: user`**; middleware sends them to **`/`**; PHP **`gp_require_admin`** on APIs. |
| Support tickets | **Working** | **`support/ticket.php`** inserts **`supportTickets`**; **`admin/support-tickets.php`** lists + PATCH status (admin session). |
| Milestone preview catalog (`public/images` synthesis) | **Removed** | **`preview-local-inventory.ts`** + **`storefront-catalog.ts`** deleted; home/shop are DB-only with empty states. |
| Admin add / modify / delete / search | **Working** | CRUD on `admin/products.php` + `admin/product.php`; table search hits **`?q=`** server-side (debounced). |
| Admin seed (two staff emails) | **Working** | **`npm run db:seed-admins`** upserts **`fahad2albassam@gmail.com`** + **`obayyassine@gmail.com`** when env passwords set; also ensures default **`categories`** docs. |
| Product publish → home / shop | **Working** | Storefront shows parts where **`published !== false`** (`gp_match_published_catalog()`), sorted by **`createdAt` desc** in `catalog/products.php`; home uses `?published=1&limit=4`. |
| PDP by slug | **Working** | `catalog/product.php?slug=` |
| Checkout after login (continue flow) | **Working** | Modal `openLogin("/checkout")` + `StorefrontAuthModalProvider` redirect; cart unchanged in session. |
| Checkout contact email = session account | **Working** | `checkout/place.php` returns **400** if JSON `customer.email` ≠ session email; UI uses read-only session email. |
| Cart UI hydration (no false “empty” flash) | **Working** | `CartProvider.hydrated` + loading states on `/cart` and `/checkout`. |
| Checkout modify lines / clear cart / place order | **Working** | Cart PHP + `checkout/place.php` with auth gate. |
| Stock decrement after buy | **Working** | In `checkout/place.php` loop with rollback on failure. |
| Cookies / continuation (`PHPSESSID`, `gp_last_order_id`) | **Working** | Standard session; last-order cookie set on success (HttpOnly false by design there). |
| Past purchases / order history UI | **Working** | `/orders` uses **`orders/mine.php`** + **`orders/detail.php`**; `gp_last_order_id` cookie still set on checkout success. |
| Admin orders list + status updates | **Working** | **`/admin/orders`**, **`admin/orders.php`**, **`PATCH admin/order.php`**. |
| Order document schema (items + status + user linkage) | **Working** | **`place.php`** writes **`userId`**, **`userEmail`**, **`items`** (with **`image`**), **`subtotal`**, **`status`**, **`updatedAt`**. Legacy **`lines`** normalized on read. |
| JS validation beyond HTML5 | **Partial** | `required` on forms; no extra schema layer. |
| Product detail help popup | **Not Done** | No dedicated PHP-backed help widget (static UI only if present). |
| Contact map / live location | **Partial** | Support page uses placeholder / static patterns (no live map API in this pass). |
| Product image storage (path / filename) | **Working** | DB string passed through; `resolvePartImageSrc` maps **`/uploads/...`** → **`/backend/uploads/...`** so Next/Image hits the PHP-served file via rewrite. |
| Binary image upload to server | **Partial / Working (local)** | **`admin/upload-image.php`** accepts multipart `file` (JPEG/PNG/WebP/GIF, max 5MB), writes **`php/public/uploads/`**, returns JSON `{ path: "/uploads/..." }`. Production CDN / hardening not in scope. |
| Category source (admin Select) | **Working** | **`catalog/categories.php`** — union of **`categories.name`** and distinct **`products.category`**; fallback `["General"]` if empty. |
| Dedicated `customers` collection name | **Not Done** | Storefront accounts use the **`users`** collection; staff may remain only in **`admins`** until migrated. |
