# CarPart / Gulf Parts Co (web)

This is a CarPart Project.

## Fahad — Frontend

Customer-facing and admin UIs for **Gulf Parts Co**: a restrained, automotive-focused parts storefront built with **Next.js App Router**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui**, and **next-themes**.

### What shipped

- **Theme system:** Semantic CSS variables (`background`, `foreground`, `surface`, `surface-2`, `surface-3`, `card`, `muted`, `primary`, etc.) in `src/app/globals.css`, mapped through Tailwind `@theme inline`. Dark mode uses **neutral graphite** surfaces for cards and chrome (no cool-tinted panels). Light mode keeps a warm **eggshell** page background. Navbar and footer stay on a distinct **surface** layer. A **theme toggle** lives in the customer header (and admin header).
- **Branding:** Navbar shows **G**; footer and metadata use **Gulf Parts Co**; customer-facing copy no longer references the old placeholder store name.
- **Home:** Hero carousel (max **3** slides) with **dots and light chevrons below** the slide (controls not stacked on imagery); **Brands We Cover** section with a seamless, perspective **icon strip** (ready to swap for real logos via `src/lib/mock/brands.ts`); featured `ProductCard` row and CTAs unchanged in flow.
- **Shared components:** `src/components/site/` — layout chrome (`SiteHeader`, `SiteFooter`, `MobileNav`), marketing (`PageSection`, `SectionHeading`, `PageIntro`, `HeroCarousel`, `BrandStrip`, `CTASection`), commerce (`ProductCard`, `EmptyState`), and customer auth (`AuthModal`, `UserMenu`, `ThemeToggle`). shadcn primitives live in `src/components/ui/`.
- **Shop:** **Sticky**, height-by-content filter sidebar on desktop; catalog **pagination** (9 per page) with shadcn **`Pagination`** + **`Button`**, integrated with search/sort/filters.
- **Customer pages:** Home, shop with filters/sort/pagination, product detail (`/shop/[slug]`), cart, checkout, support (form + contact + map placeholder), orders, and settings. Mock catalog and cart/checkout flows are **UI-only** (local state / mock data).
- **Admin area (Phase 13):** Mock **staff session** (`AdminSessionProvider`, separate from customer auth) gates the **Admin panel** link in the avatar **`DropdownMenu`** (`/admin/dashboard` when signed in, else `/admin/login`). Admin chrome uses the shadcn **`Sidebar`** (desktop) with **Sheet**-powered mobile navigation, sticky inset header + **ThemeToggle**, and **Alert Dialog** sign-out. **`/admin/login`** is a focused **`Card`** + **`Input`** / **`Label`** / **`Button`** form. **`/admin/dashboard`** shows **`Card`** KPIs, **`Badge`** / **`Separator`**, quick actions, and a short recent list. **`/admin/products`** uses the official **Data Table** pattern (**`@tanstack/react-table`** + shadcn **`Table`**), search **`Input`**, row **`DropdownMenu`**, **`Badge`** status, **`AlertDialog`** delete, and shadcn **`Pagination`** when needed. **`/admin/products/new`** and **`/admin/products/[id]/edit`** share **`AdminProductForm`** built from **`Card`**, **`Input`**, **`Label`**, **`Textarea`**, **`Select`**, **`Checkbox`**, **`Separator`**, and **`Button`**, including an image file field placeholder and optional fitment fields. **Frontend-only** — ready for backend integration without changing routes.
- **Consistency:** Dialog / dropdown-menu / sheet patterns for auth, account menu, and mobile nav; one card/button/input language; `ProductCard` reused on home, shop, related rows, and PDP. Shop and PDP include **loading skeletons**; global **404** at `src/app/not-found.tsx`.

### Customer vs admin

The **customer** experience uses the `(customer)` layout with `CustomerProviders` (mock sign-in + cart). **Admin** routes omit that shell and use `AdminLayoutShell` plus the dedicated login screen so **customer and staff sign-in are never merged**. Staff demo state persists separately via **`AdminSessionProvider`** in the root `Providers` tree.

### Tracking

See **`tracker.md`** for phase-by-phase completion, touched files, and theme/architecture notes (including **Phase 12** customer refinement and **Phase 13** admin shell details).
