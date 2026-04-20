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

ER diagram: 
<img width="1600" height="1499" alt="image" src="https://github.com/user-attachments/assets/4564803b-7357-428e-a5c0-d337469b8f4f" />
