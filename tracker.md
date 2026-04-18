# Gulf Parts Co — Frontend Tracker

## Project

**Gulf Parts Co** — CIS 311 car-parts storefront beta (Next.js App Router, TypeScript, Tailwind v4, shadcn/ui, next-themes).

## Current phase

**Phase 13 — Admin UI shell (shadcn Sidebar, data table, auth shell)** (complete)

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
- **Admin shell (Phase 13):** Admin navigation uses shadcn **`Sidebar`** (desktop) with **Sheet** for mobile; catalog management uses **TanStack + `Table`** data table pattern; **mock admin session** is separate from **customer** auth (`AdminSessionProvider` vs `CustomerAuthProvider`).
