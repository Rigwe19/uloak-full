# APP.md — Ulo (uloak-full) — AI primer

> One-page context for any coding agent. Read this before touching the repo — it replaces skimming the whole site.

## What it is
- **Ulo — House of Stories** (`www.uloofstories.com`, `@UloOfStories`) — private Rooms for family stories, event memories, tributes. Laravel 13 + Inertia 3 + React 19 + Tailwind 4, Herd `uloak.test`, Pest tests, Wayfinder routes.
- **Brand promise:** Every story has a home. **Campaign:** Bring every story home. *Ulo* means “house” in Igbo. House of Stories is the descriptor (26 July 2026 package).
- **Current wedge:** Wedding-First. Public brand is **Ulo**, launch product is **Ulo Wedding Room** at `/weddings` (one-off). Full monetization is live: Starter free → Full Room one-off → Family Archive recurring, 5-region pricing.

## Stack snapshot
- PHP ^8.4, `laravel/framework ^13.20`, Fortify/Sanctum/Socialite (Google/Apple) + Passkeys.
- **Brand:** Forest Black `#0E2A1A`, Story Cream `#F2EDE0`, Heritage Gold `#C9993A`; Poppins Bold/SemiBold (primary) + Lora Regular/Medium (secondary) via `vite.config.ts:14 bunny()` + `resources/css/app.css:10 --font-sans/--font-serif`; logos `public/logo*.png`, clear space = one window pane, no stretch/recolour/shadow.
- `public/images/01..10-ulo-*.jpg` are the only allowed hardcoded images (AI visualisations — replace with commissioned photography as archive grows).
- `pnpm build` is the frontend contract (manifest must list `pricing, weddings, weddings/create, checkout/status`).
- `vendor/bin/pint --dirty` and `php artisan test --compact --filter=Billing` are the gates.

## Domain truth

### Rooms (`rooms`)
- `room_type`: `general|wedding|birthday|burial|memorial|anniversary|graduation`. Only `general` is free.
- `tier_type`: `nullable` (= legacy, unlimited, pre-billing) or `starter|full_room|family_archive`.
- `status`: `draft|active|expired|archived`. New paid rooms start `Draft` → `Active` after payment.
- Billing columns: `storage_used_bytes/int 0, storage_limit_bytes, expires_at, contributions_closed_at, status, welcome_message text, wedding_dates json, referral_partner_id FK partners`. `isLegacy() = tier_type IS NULL`.
- **Paywall rule (single source: `RoomService::createRoom`)**: Dashboard/House `POST /rooms` with any `room_type` in `[wedding,burial,birthday,memorial,anniversary,graduation]` or `tier_type full_room|family_archive` → `302` to `weddings.create?type={type}` instead of creating. Only generic `general` may become Starter. The paid funnel is `WeddingsController:69` `Draft → createCheckout → gateway → verifyAndActivate`.
- `contributionsOpen()`: `status != Draft` AND `contributions_closed_at IS NULL` AND `expires_at` future AND `storage_used_bytes+1 <= storage_limit_bytes`. Middleware `contributions.open` on all `*/stories` stores returns `403 {reason: draft|closed|expired|storage_full|contribution_limit}`.

### Pricing — `config/pricing.php` is the single source
- 5 regions: `nigeria (NG, NGN ₦150,000)`, `rest_of_africa (ZA/KE/…, USD US$19)`, `uk (GB, GBP £29)`, `us_rest_of_world (US,CA,AU,NZ,SG,…, USD US$35)`, `europe (FR/DE,…, EUR €35)`. Family Archive monthly/yearly + savings in same table. Minor units (kobo/cents). `us_rest_of_world` is where **Canada** lives — no separate CA row.
- Limits: Starter `50 contribs, 1GB, 30d, individual downloads`; Full `10GB, 12mo, unlimited guests, bulk download, QR, slideshow`; Archive `25GB`.
- Detection: `PricingService::detectRegion(Request)` priority `session('pricing_region')` (manual pick) → `CF-IPCountry` → `Accept-Language` heuristic → `config.default_region=nigeria`. `PageController::weddings/pricing` + `WeddingsController::create GET` now call it and persist `session('pricing_region')`, so `?ref=` + UTM also survives. `POST` re-derives `amount/currency` server-side (`PaymentService::checkoutPrice`) — spoofing a cheaper region is allowed.
- Frontend: `RegionSelector` shows one currency per card; `pricing` strip shows `05+08` images. `weddings/create` has an **Occasion** selector (`wedding|birthday|burial|…`) defaulting from `?type=` — so **burial rooms are created at `/weddings/create?type=burial` same price as wedding**; the form posts `room_type` to `WeddingsController` which creates the draft with that type.

### Payments / Subscriptions
- `payments`: `user_id, room_id nullable, amount minor, currency CHAR(3), provider paystack|paypal|stripe, provider_reference, idempotency_key UNIQUE, status pending|successful|failed, region, partner_id, commission_amount, utm json, paid_at`. `Partner::calculateCommission` = 20% with ₦3,000 floor for NGN capped at amount.
- `subscriptions`: Family Archive (`family_monthly|yearly`, `active|past_due|canceled|expired`). `POST /billing/subscriptions` → gateway same as Full Room; `POST /billing/subscriptions/{id}/cancel` sets `cancel_at_period_end`; `POST /billing/rooms/{room}/move-to-archive` requires active subscription + ownership.
- Gateways via `Http` + manual HMAC (no new composer deps): `Paystack` NGN only, `Stripe` default elsewhere, `PayPal` selectable. `POST /webhooks/{provider}` is CSRF-exempt, verifies `x-paystack-signature`/`Stripe-Signature`/PayPal transmission before `PaymentService::verifyAndActivate` (idempotent: re-checks `pending` inside DB transaction).

## Important files
```
config/pricing.php
app/Enums/*.php, app/Models/{Room,Payment,Subscription,Partner}.php
app/Services/PricingService.php, app/Services/Billing/{PaymentService,Gateways/*}
app/Services/RoomService.php  # the paywall gate (1 Starter / general only)
app/Http/Controllers/{PageController#weddings/pricing,WeddingsController}
app/Http/Controllers/Billing/{Checkout,Webhook,Subscription}Controller
app/Http/Middleware/{TrackReferral,EnsureContributionsOpen}
resources/js/pages/{weddings.tsx,weddings/create.tsx,pricing.tsx,checkout/status.tsx}
resources/js/components/pricing/{RegionSelector,StickyCTA}
routes/web.php, routes/console.php (01:00 close-expired-starters)
tests/Feature/Billing/{Billing,ContributionGate,Referral,SubscriptionArchive,RoomCreationGate}Test.php
public/images/01..10-ulo-*.jpg
```

## Conventions / gotchas
- `room.tier_type = NULL` is **legacy unlimited** — don't mass-assign tier, let `RoomService` set it. House-member rooms count against `ownerId` quota.
- Dashboard `POST /dashboard/rooms` with `room_type=wedding` must **302 to weddings.create?type=wedding** (not validation error). Same for `birthday/burial…` → `weddings.create?type=…`. Price cards’ *Create a Full Room* already goes to `weddings/create`.
- `pricing`’s Family Archive buttons hit `POST /billing/subscriptions` → JSON `authorization_url` → `window.location`; they require `auth` or redirect to `register?tier=…&region=…`.
- `GET /weddings/create` is `auth`; `POST` is `auth` (no `verified`) so email verification doesn’t block checkout. `GET /weddings` itself is public.
- Navbar is `Weddings | Pricing | How Ulo Works | …` (was 4 generic anchors).
- Pre-existing test failures on `main` (Cloudinary `App\Media\Cloudinary\*` stubs, `profile.edit` route) are **unrelated** to billing — `pest --filter=Billing` must stay **44/44**.

## Commands
```
composer run dev          # Herd: queue, pail, reverb, vite
php artisan migrate --seed  # seeds DEMOPLAN/ULOSTUDIO partners
php artisan test --filter=Billing
vendor/bin/pint --dirty
pnpm run build
php artisan route:list | grep -E 'weddings|pricing|billing|webhooks'
```

## What not to do
- Don’t hardcode a region default in controllers (`PageController::weddings` already uses `detectRegion`, `WeddingsController::create GET` was recently fixed from `'uk'`).
- Don’t add a new composer dep for payments without approval — gateways stay `Http`.
- Don’t reintroduce unsplash/hero-*.webp — the 10 local images are the only approved hardcoded visuals.
- Don’t let `room_type burial|birthday|…` be created as Starter via `RoomService` — it must throw and the controller must redirect to the paid funnel.
- Don’t stretch/recolour/logo-on-busy/shadow the Ulo logo; use stacked for square/portrait, horizontal for headers, mark alone only when brand is already identified.

> **Doc rule (AGENTS.md):** after any feature/billing/route/env/arch/brand/setup change, update `README.md` and `APP.md` in sync with `config/pricing.php`, `app/Services/RoomService.php`, `routes/web.php`, and the current brand package.

*Read this + `config/pricing.php:1` + `app/Services/RoomService.php:23` and you have the product.*
