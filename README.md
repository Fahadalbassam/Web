# CarPart / Gulf Parts Co (web)

This is a CarPart Project.

## Fahad — Frontend / backend integration (handoff)

**Gulf Parts Co** is a car-parts storefront and admin console: **Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui** for UI, **PHP 8.x + Composer `mongodb/mongodb`** as the **only** live backend for auth, cart, catalog API, admin CRUD, and checkout, backed by **MongoDB**.

### Integration summary

- **PHP-first wiring is in place:** the browser calls **`/backend/*`** (rewritten in `next.config.ts` to `PHP_BACKEND_URL`). Server Components use **`src/lib/php-server-fetch.ts`** and **`src/lib/catalog-fetch.ts`** for catalog and admin reads. **No Next Route Handlers** act as authority for those domains.
- **shadcn admin + storefront UI is preserved:** the approved **Sidebar**, **Data Table** (`@tanstack/react-table` + `Table`), forms, dialogs, pagination, and cards are unchanged in layout; only data targets and guards were wired to PHP.
- **Local development:** run **`npm run dev:full`** to start **Next** and the **PHP built-in server** together. `npm run php:server` uses **`C:\xampp\php\php.exe`** explicitly (see `package.json`) so Windows PATH does not need `php`. Put **`MONGODB_URI`** and **`PHP_BACKEND_URL=http://127.0.0.1:8080`** in **`.env.local`** at the **repo root** (same file Next uses). **PHP** loads **`.env`** then **`.env.local`** from that root via **`php/include/load-env.php`** + **vlucas/phpdotenv** so the backend sees **`MONGODB_URI`** without manual shell exports.
- **Admin accounts:** `npm run db:seed-admins` upserts **`fahad2albassam@gmail.com`** and **`obayyassine@gmail.com`** when **`ADMIN_SEED_PASSWORD_FAHAD`** and **`ADMIN_SEED_PASSWORD_OBAI`** are set (Node script only; **no plaintext passwords in git**). The same command ensures default rows in the **`categories`** collection for the admin category picker.
- **Auth (unified):** Passwords are stored with PHP **`password_hash()`** and verified with **`password_verify()`** (no custom salting). **Storefront UX:** **`AuthModal`** (**`components/site/auth-modal.tsx`**) is the primary flow — **login** and **register** share one shadcn **Dialog** (text-link switches: “New? Register here” / “Already have an account? Login here”), calling **`customer-login.php`** / **`register.php`** via **`CustomerAuthProvider`**. The standalone **`/register`** route still exists but is secondary. **Registration** — **`POST /backend/auth/register.php`** creates a row in **`users`** and signs the browser in. **Login** — **`auth/customer-login.php`** matches **`auth/login.php`** server logic (**`users`** then **`admins`**). Session keys **`gp_user_*`** + checkout mirrors; **`admin_*`** when **`role: admin`**. **`auth/me.php`** (admin-only probe) and **`customer-me.php`** (storefront + role) stay aligned; PHP normalizes Mongo **`_id`** from JSON-expanded docs so session user ids are always real hex strings, not **`"Array"`**. **`Logout`** clears identity keys; **`gp_cart`** unchanged.
- **Admin access:** After any successful login, users with **`role: admin`** open **`/admin/*`**. **Middleware** checks **`me.php`**; guests hitting admin routes are sent to **`/?login=1`** (opens the same **`AuthModal`**), and signed-in non-admins are sent to **`/`**. **`/admin/login`** is a compatibility stub with links to the storefront sign-in — not a separate credential system.
- **Support tickets:** The support form **`POST`s** to **`support/ticket.php`** → MongoDB **`supportTickets`**. Admins review under **`/admin/support`** (**`admin/support-tickets.php`**).
- **Cart & checkout:** Guest **add-to-cart** uses PHP session cart. **Checkout requires** storefront sign-in; after login, **`openLogin("/checkout")`** returns the user to checkout without losing the cart. **`checkout/place.php`** enforces checkout session server-side.
- **Catalog:** Published products appear on **home** (`fetchPublishedParts` → `catalog/products.php?published=1&limit=4`), **shop**, and **PDP** only from MongoDB via PHP (**no** merged preview/dev arrays on live routes). Storefront visibility uses **`gp_match_published_catalog()`** — documents are hidden only when **`published === false`**. Listings sort by **`createdAt` descending**. **`resolvePartImageSrc`** maps **`/uploads/...`** to **`/backend/uploads/...`** for **`admin/upload-image.php`** output.
- **Empty states:** If the database has no published products, **home** and **shop** show stable empty UI (dashed panels / copy) without fake cards.
- **Home “Brands We Cover” strip:** Logos load from **`public/images/brandlogos/`** (discovered at runtime on the server), infinite CSS marquee with subtle perspective, **`prefers-reduced-motion`** static layout, and **`next/image`**.

### Customer vs admin

- **Customer** routes use **`CustomerProviders`** (real storefront session via PHP `customer-*` endpoints).
- **Admin** uses **`AdminLayoutShell`** and **`AdminSessionProvider`**; staff sign in through the storefront **`AuthModal`**, then open **Admin** from the account menu when **`role === "admin"`**.

### Environment

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB (PHP + seed scripts). |
| `PHP_BACKEND_URL` | e.g. `http://127.0.0.1:8080` — Next rewrites + RSC server fetch. |
| `ADMIN_SEED_PASSWORD_FAHAD`, `ADMIN_SEED_PASSWORD_OBAI` | Optional — **`scripts/seed-admins.mjs`** only. |

### Tracking & audit

- **`tracker.md`** — phase history and **final stabilization** notes (files, decisions, remaining issues).
- **`DATABASE_AUDIT.md`** — schema, endpoint map, auth model, and **final truth audit** (Working / Partial / Not Done / Blocked).
- **`php/README.md`** — PHP setup and endpoint list.

### Next teammate / backlog (honest)

- **Order history / `/orders`:** not wired to PHP list APIs (**Not Done** in audit).
- **Migrating seeded staff from `admins`-only into `users`** if you want a single collection only (runtime already checks both).
- **Production-grade uploads** (virus scan, ACL, CDN) beyond the current **PHP `public/uploads`** + **`admin/upload-image.php`** flow.
- **Richer client-side validation** (optional polish on top of HTML5 `required`).

---

## Fahad — Frontend (historical product note)

Customer-facing and admin UIs for **Gulf Parts Co**: restrained automotive storefront built with **Next.js App Router**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, and **next-themes**. Branding: navbar **G**, footer **Gulf Parts Co**, neutral dark “graphite” cards. Shop: sticky filters, pagination (9 per page). See **`tracker.md`** for full phase checklist (Phases 1–13 UI milestones).
