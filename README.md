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

---

*Older handoff notes were folded into those files; this README is just the short version for someone cloning the project cold.*
