# PHP backend (authority layer)

All course-required backend behavior is implemented here: **MongoDB** access, **PHP sessions** (`PHPSESSID`), **admin auth**, **catalog reads**, **admin product CRUD**, **session cart**, **checkout** (orders + stock decrement).

## Setup

```bash
cd php
composer install
```

### Environment variables (local dev)

**Next.js** loads **`.env.local`** from the **repo root** automatically. **PHP does not** — the built-in server only sees the process environment unless you export variables in the shell.

This project loads the same files at PHP startup (see **`include/load-env.php`**, called from **`include/app.php`** after Composer autoload):

1. **`.env`** in the **repository root** (parent of the `php/` folder), if present.
2. **`.env.local`** in the same place, if present (overrides **`.env`** for local-only secrets).

Values are applied with **vlucas/phpdotenv** (`createUnsafeMutable` + `putenv`) so **`getenv('MONGODB_URI')`** and **`$_ENV`** match what you use in **`.env.local`**. You do **not** need to `set` / `export` `MONGODB_URI` in PowerShell for `npm run dev:full` as long as the file exists and is readable.

In **production**, configure the real web server or process manager to set `MONGODB_URI` (and optional `GP_COOKIE_SECURE`, `NODE_ENV`); the dotenv files are optional if the host already injects the environment.

### Run the built-in server

From repo root: `npm run php:server` (uses **`C:\xampp\php\php.exe`** on Windows so PATH is not required; change `package.json` if your PHP lives elsewhere). Or manually:

```powershell
cd C:\Projects\web\php
php -S 127.0.0.1:8080 -t public
```

Run **`npm run dev:full`** to start Next + PHP together via `concurrently`.

## Next.js integration

The Next dev server rewrites **`/backend/*`** → **`PHP_BACKEND_URL`** (default `http://127.0.0.1:8080`). The browser calls **`/backend/auth/login.php`**, **`/backend/cart/get.php`**, etc.; Next proxies to PHP so cookies stay **same-site** with the UI origin.

Set in `.env.local`:

- `PHP_BACKEND_URL=http://127.0.0.1:8080` — used by **Next server-side** `fetch()` in RSC (`src/lib/php-server-fetch.ts`) and must match the rewrite target in `next.config.ts`.

## Endpoints (summary)

| Area | Script | Methods |
|------|--------|---------|
| Auth (unified login) | `auth/login.php`, `auth/customer-login.php` | POST JSON — same logic; sets `gp_user_*`, checkout mirrors, **`admin_*` if role admin |
| Auth (register) | `auth/register.php` | POST JSON — creates **`users`** row (`password_hash`), signs in |
| Auth | `auth/logout.php`, `auth/customer-logout.php` | POST — clear identity keys; **keeps** `gp_cart` |
| Auth (admin probe) | `auth/me.php` | GET — **`authenticated` true only for Mongo `role: admin`** (middleware) |
| Auth (storefront) | `auth/customer-me.php` | GET — `{ authenticated, email?, role? }` |
| Support | `support/ticket.php` | POST JSON — public ticket create → **`supportTickets`** |
| Admin | `admin/support-tickets.php` | GET `?q=`, PATCH JSON `{ id, status }` |
| Catalog | `catalog/products.php` | GET |
| Catalog | `catalog/product.php` | GET |
| Catalog | `catalog/related.php` | GET |
| Catalog | `catalog/categories.php` | GET — `{ categories: string[] }` |
| Admin | `admin/products.php` | GET, POST |
| Admin | `admin/product.php` | GET, PATCH, DELETE |
| Admin | `admin/upload-image.php` | POST `multipart/form-data` field **`file`** (JPEG/PNG/WebP/GIF, max 5MB) |
| Admin | `admin/orders.php` | GET — order summaries (newest first) |
| Admin | `admin/order.php` | GET `?id=`, PATCH JSON `{ id, status }` — detail + workflow status |
| Storefront | `orders/mine.php` | GET — current user’s order summaries (**401** if guest) |
| Storefront | `orders/detail.php` | GET `?id=` — one order (**403** if not owned) |
| Cart | `cart/get.php` | GET |
| Cart | `cart/add.php`, `update.php`, `remove.php`, `clear.php` | POST JSON |
| Checkout | `checkout/place.php` | POST JSON — **requires** storefront checkout session (see `gp_require_checkout_customer` in `app.php`); writes **`orders`** + stock decrement |

Shared code: `php/include/app.php`, `php/include/cart.php`, `php/include/load-env.php`.
