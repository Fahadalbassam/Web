# PHP backend (authority layer)

All course-required backend behavior is implemented here: **MongoDB** access, **PHP sessions** (`PHPSESSID`), **admin auth**, **catalog reads**, **admin product CRUD**, **session cart**, **checkout** (orders + stock decrement).

## Setup

```bash
cd php
composer install
```

Ensure `MONGODB_URI` is available to the PHP process (same connection string as Next uses in `.env.local`). On Windows PowerShell:

```powershell
$env:MONGODB_URI="mongodb+srv://..."
cd C:\Projects\web\php
php -S 127.0.0.1:8080 -t public
```

Or from repo root: `npm run php:server` (uses **`C:\xampp\php\php.exe`** on Windows so PATH is not required; change `package.json` if your PHP lives elsewhere). Run **`npm run dev:full`** to start Next + PHP together via `concurrently`.

## Next.js integration

The Next dev server rewrites **`/backend/*`** → **`PHP_BACKEND_URL`** (default `http://127.0.0.1:8080`). The browser calls **`/backend/auth/login.php`**, **`/backend/cart/get.php`**, etc.; Next proxies to PHP so cookies stay **same-site** with the UI origin.

Set in `.env.local`:

- `PHP_BACKEND_URL=http://127.0.0.1:8080` — used by **Next server-side** `fetch()` in RSC (`src/lib/php-server-fetch.ts`) and must match the rewrite target in `next.config.ts`.

## Endpoints (summary)

| Area | Script | Methods |
|------|--------|---------|
| Auth (admin panel) | `auth/login.php` | POST JSON — sets `admin_*` + checkout identity |
| Auth (admin panel) | `auth/logout.php` | POST — clears admin + checkout identity; keeps cart |
| Auth (admin panel) | `auth/me.php` | GET — 200 JSON `{ authenticated, email? }` (Mongo-validated) |
| Auth (storefront checkout) | `auth/customer-login.php` | POST JSON — checkout identity only (same `admins` verify, no `admin_id`) |
| Auth (storefront) | `auth/customer-me.php` | GET |
| Auth (storefront) | `auth/customer-logout.php` | POST |
| Catalog | `catalog/products.php` | GET |
| Catalog | `catalog/product.php` | GET |
| Catalog | `catalog/related.php` | GET |
| Catalog | `catalog/categories.php` | GET — `{ categories: string[] }` |
| Admin | `admin/products.php` | GET, POST |
| Admin | `admin/product.php` | GET, PATCH, DELETE |
| Admin | `admin/upload-image.php` | POST `multipart/form-data` field **`file`** (JPEG/PNG/WebP/GIF, max 5MB) |
| Cart | `cart/get.php` | GET |
| Cart | `cart/add.php`, `update.php`, `remove.php`, `clear.php` | POST JSON |
| Checkout | `checkout/place.php` | POST JSON — **requires** storefront checkout session (see `gp_require_checkout_customer` in `app.php`) |

Shared code: `php/include/app.php`, `php/include/cart.php`.
