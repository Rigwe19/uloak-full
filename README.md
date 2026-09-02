# Ulo — House of Stories

> **Brand promise:** Every story has a home. **Campaign line:** Bring every story home. Private digital Rooms for family stories, event memories and tributes.

This is **Uloak Full** — the Laravel + Inertia + React codebase that powers `www.uloofstories.com` (`@UloOfStories`). The repo started from `laravel/react-starter-kit` but today is a full product: rooms, tributes, media pipeline (Cloudinary), **multi-region pricing & paywall**, and the **Wedding-First acquisition wedge** (`/weddings`).

## Brand — House of Stories (approved 26 July 2026)

| Item | Value |
|---|---|
| Brand name | **Ulo** |
| Descriptor | **House of Stories** |
| Meaning | *Ulo* means “house” in Igbo |
| Promise | Every story has a home. |
| Campaign | Bring every story home. |
| Website | `www.uloofstories.com` |
| Handle | `@UloOfStories` |

**Colour system:** Forest Black `#0E2A1A` — Story Cream `#F2EDE0` — Heritage Gold `#C9993A` (see `resources/css/app.css:74` — `:root --bg-dark/--accent-gold`, `[data-theme='light']` uses Story Cream). **Typography:** Poppins Bold / SemiBold (primary, `--font-sans`) via `vite.config.ts:14 bunny('Poppins')` + Lora Regular / Medium (secondary, `--font-serif`) via `bunny('Lora')`. Logo family, app icon and 10 cinematic brand-visualisation images live in `public/images/01..10-ulo-*.jpg` plus `public/logo*.png` — keep clear space = one window pane, no stretch/recolour/shadow, mark alone only when brand is already identified.

> **Image note:** `public/images/01..10` are AI-generated visualisations, not documentary photos — replace with commissioned photography as the real archive grows. **Legal note:** confirm domain/social/trademark clearance before launch — the guide is not legal clearance.

> **Doc rule (AGENTS.md):** after any feature/billing/route/env/arch/brand/setup change, keep `README.md` and `APP.md` in sync with `config/pricing.php`, `app/Services/RoomService.php`, `routes/web.php`, and the current brand package.

---

## 1) Stack

| Layer | Tech | Version |
|---|---|---|
| Language | PHP | ^8.4 (prod 8.4+, CI 8.4/8.5) |
| Framework | Laravel | ^13.20 |
| Auth | Fortify + Sanctum + Socialite (Google/Apple) + Passkeys | 1.34 / 4.0 / 5.27 |
| Frontend | React + Inertia | 19.2 / 3.0 |
| Styling | Tailwind CSS | 4.0 |
| Build | Vite + Wayfinder | 8.0 / 0.1.14 |
| Media | Cloudinary PHP 3.1, Intervention Image 4, laravel-ffmpeg 8.9 | — |
| Realtime | Reverb + Laravel Echo 2.4 | 1.11 |
| Tests | Pest + PHPUnit + Mockery | 4.7 / 12.x |
| Code style | Pint + Prettier + ESLint | — |

Package manager `pnpm` for JS, `composer` for PHP. Served locally via **Laravel Herd** (`uloak.test`) or Sail.

---

## 2) Quick start

```bash
# 1. install
composer install
pnpm install

# 2. env
cp .env.example .env
php artisan key:generate

# 3. db (sqlite for local is fine, mysql in prod)
touch database/database.sqlite  # or set DB_ vars in .env
php artisan migrate --seed

# 4. run (one cmd, 5 processes)
composer run dev
# or without Sail/Herd helper:
composer run herd
```

`.env` keys you care about for billing:

```env
APP_URL=http://uloak.test
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
PAYPAL_WEBHOOK_ID=...
# Cloudinary / AWS / Mail / Socialite same as before
```

---

## 3) Domain model

- **User** — `users` (`is_admin`, `role=business_admin`, `house_*` fields). HasMany `createdRooms`, `payments`, `subscriptions`.
- **Room** — `rooms`. Core entity. Columns that matter for billing:
  - `room_type` — `general|birthday|burial|wedding|anniversary|memorial|graduation` (occasion)
  - `tier_type` — `nullable` (legacy), `starter|full_room|family_archive`
  - `status` — `draft|active|expired|archived`
  - `storage_used_bytes`, `storage_limit_bytes`, `expires_at`, `contributions_closed_at`
  - `referral_partner_id` (FK `partners`), `welcome_message` (text), `wedding_dates` (json)
  - Legacy rows have `tier_type = NULL` → `isLegacy() === true` → unlimited, never gated.
- **Media / Story** — `media.size` summed via `Room::stories()->with Media`; global rollup `cloudinary_usage`.
- **Payment** — `payments` (`user_id`, `room_id nullable`, `amount` minor units, `currency CHAR(3)`, `provider enum paystack|paypal|stripe`, `provider_reference`, `idempotency_key UNIQUE`, `status pending|successful|failed`, `region enum`, `partner_id`, `commission_amount minor`, `utm json`, `paid_at`).
- **Subscription** — `subscriptions` (`user_id`, `tier family_monthly|family_yearly`, `status active|past_due|canceled|expired`, `current_period_start/end`, `cancel_at_period_end bool`, provider refs, `region/currency`).
- **Partner** — `partners` (`name, ref_code UNIQUE, commission_rate decimal(5,2) default 20.00, is_active`). `calculateCommission(minor, currency)` enforces ₦3,000 floor for NGN, capped at payment amount.

---

## 4) Pricing & paywall (current reality)

### Tiers

| Tier | Limit | Cost |
|---|---|---|
| **Starter (free)** | 1 active Starter per `user.id`, 50 contributions, 1 GB, 30 days, individual downloads only | Free, no card |
| **Full Room (one-off)** | 10 GB, 12 months online, unlimited guests/contribs within 10 GB, bulk download, QR, slideshow, personalised cover. **One payment per Room/occasion.** Completed Full Rooms can be moved into an active Family Archive. | Regional price (below) |
| **Family Archive (recurring)** | 25 GB pooled, whole-family no per-person fee, admin-controlled, cancel-anytime (access to period end) | Monthly / Yearly per region, renews until canceled |

### Region matrix — `config/pricing.php` (minor units, single currency per card)

| Location | Full/Wedding Room | Family Monthly | Family Yearly | Yearly save |
|---|---|---|---:|---|
| Nigeria | ₦15,000 (1_500_000) | ₦3,500 | ₦35,000 | ₦7,000 |
| Rest of Africa | US$19 | US$4.99 | US$49 | US$10.88 |
| UK | £29 | £7.99 | £79 | £16.88 |
| US / Rest of world | US$35 | US$9.99 | US$99 | US$20.88 |
| Europe | €35 | €9.99 | €99 | €20.88 |

`geo_countries` in `config/pricing.php:28` drives `PricingService::detectRegion()` (`CF-IPCountry` → `session('pricing_region')` → `config.default_region=nigeria`). `us_rest_of_world` now includes `US,CA,AU,NZ,SG,…` so **Canada → US$35**, not Nigeria. Manual `RegionSelector` always wins over detection. `POST /billing/*` re-derives `amount/currency` server-side — spoofing a cheaper region is allowed and handled.

### Paywall

- Only `room_type=general` is free via **Dashboard → Create Room** (`RoomService::createRoom` assigns Starter limits, enforces 1-active-Starter per owner). Any `room_type` in `[wedding,birthday,burial,memorial,anniversary,graduation]` or `tier_type full_room|family_archive` on that endpoint **302s to `weddings.create?type={type}`** (wedding included) instead of a 422. House-member creation counts against the house `ownerId` quota.
- **Weddings** funnel is the only writer of paid occasion rooms: `GET /weddings/create` (`auth`) shows an occasion selector (Wedding/Birthday/Burial/Memorial/Anniversary/Graduation) → `POST /weddings/create` creates `status=Draft, tier_type=NULL` → `PaymentService::createCheckout` (server-side price) → gateway `initialize` → `Inertia::location(authorization_url)`.
- `verifyAndActivate` is **idempotent** (re-checks `pending` inside DB transaction, `idempotency_key UNIQUE`).
- Contribution gate `EnsureContributionsOpen:contributions.open` on all `*/stories` stores (`share`, `dashboard`, `house`, `family`) returns `403 {reason: draft|closed|expired|storage_full|contribution_limit}` and the frontend shows `UpgradePrompt`.
- Daily `01:00` `rooms:close-expired-starters`, generic starter hard-blocks when `storage_used_bytes + 1 > limit`.

### Gateways

- `Paystack` for `NGN` (Nigeria), `Stripe` for every other region (default), `PayPal` as selectable alternative. No new composer deps — all via `Http` + manual webhook HMAC (`x-paystack-signature` SHA512, `Stripe-Signature` SHA256, PayPal transmission verify).

---

## 5) Key routes

```
GET  /                         → welcome (hero carousel 01/03/10, 5 Room cards)
GET  /weddings                 → PageController@weddings  (12-section launch page)
GET  /weddings/create          → WeddingsController@create  auth  (form: title, couple names, wedding_dates json, occasion selector, order summary)
POST /weddings/create          → WeddingsController@create  auth  (draft + Payment + gateway redirect)
GET  /pricing                  → PageController@pricing  (3 cards, RegionSelector, visual strip 05+08)
POST /billing/checkout         → CheckoutController@store  auth  (room_id nullable)
GET  /billing/callback/{provider}
GET  /billing/payments/{payment}/status
POST /billing/subscriptions    → SubscriptionController@store  (Family Archive)
GET  /billing/subscriptions
POST /billing/subscriptions/{id}/cancel
POST /billing/rooms/{room}/move-to-archive
POST /webhooks/{provider}      → WebhookController  (CSRF-exempt, HMAC verified)
POST /analytics/event          → logs {event, properties, ref, utm}
GET  /share/rooms/{slug}/stories  (contributions.open)
```

Navbar now ships `Weddings | Pricing | How Ulo Works | Ulo Studio | About`.

---

## 6) Recent frontend pages

- `welcome` — hero carousel now local `01-team-studio, 03-family-reunion, 10-corporate-gala` (was hero-*.webp), card grid 02/03/04/07/09, about band `06-uniform-lifestyle`.
- `weddings` — 12-section spec-faithful launch page, price from `region.full_room_formatted`, sticky mobile CTA `Create Wedding Room • {price}`.
- `weddings/create` — occasion dropdown (so **burial/birthday/etc. all go through the same paid funnel**: `/weddings/create?type=burial` pre-selects Burial, same checkout price).
- `pricing` — strip `05-merchandise-family + 08-event-kit`, 3 cards, private-by-default, FAQ 12, `RegionSelector` + `StickyCTA → /weddings/create`.
- `checkout/status` — polls `GET /billing/payments/{id}/status` every 3s; all pages ship `05,08` etc. so every `public/images/01..10` appears at least once site-wide. `pnpm build` manifest confirms `weddings, weddings/create, pricing, checkout/status`.

Images live in `public/images/01-ulo-team-studio.jpg … 10-ulo-corporate-gala.jpg` (80–210K each). No unsplash remains.

---

## 7) Test & quality

```bash
vendor/bin/pint --dirty              # Laravel Pint (php style)
pnpm run types:check                 # tsc --noEmit (0 errors on new billing/pricing/weddings pages)
pnpm run build                       # vite 37s, chunks: weddings 24k, pricing 28k
php artisan test --compact           # Pest; 42–44 billing+gate tests green (pre-existing 35 unrelated failures remain from incomplete Cloudinary/Media stubs — verified by stashing billing changes and re-running)
php vendor/pestphp/pest/bin/pest --filter=Billing
```

New suites: `tests/Feature/Billing/{BillingTest,ContributionGateTest,ReferralTest,SubscriptionArchiveTest,RoomCreationGateTest}`.

---

## 8) Project structure (billing-relevant)

```
config/pricing.php            # single source of truth for matrix + limits
app/Enums/{Region,RoomTier,RoomStatus,PaymentProvider,PaymentStatus,SubscriptionTier,SubscriptionStatus}.php
database/migrations/2026_08_26_14*  # partners, add_billing_columns_to_rooms, payments, subscriptions
app/Models/{Partner,Payment,Subscription}.php  (+ Room billing helpers)
database/factories/{Partner,Payment,Subscription,Room}Factory.php
database/seeders/PartnerSeeder.php
app/Services/{PricingService,Billing/{PaymentService,Gateways/{Paystack,Stripe,PayPal}Gateway}}
app/Http/Controllers/{PageController#weddings+#pricing,WeddingsController}
app/Http/Controllers/Billing/{Checkout,Webhook,Subscription}Controller
app/Http/Middleware/{TrackReferral,EnsureContributionsOpen}
app/Console/Commands/CloseExpiredStarterRooms.php
resources/js/pages/{weddings.tsx,weddings/create.tsx,pricing.tsx,checkout/status.tsx}
resources/js/components/pricing/{RegionSelector,PricingCards,StickyCTA,UpgradePrompt}.tsx
```

Follow existing conventions: `php artisan make:* --no-interaction`, `vendor/bin/pint --dirty --format agent` before finalizing PHP changes.

---

## 9) Operations

- `artisan migrate --seed` also seeds `DEMOPLAN, ULOSTUDIO` partners.
- Partner URLs: `/weddings?ref={ref_code}` → `TrackReferral` (global `web` middleware) writes `session('referral_code')` + `ulo_ref` cookie (30d) + `session('utm')`; `PaymentService` stamps `partner_id, commission_amount, utm` at `createCheckout`; visible in `payments.commission_amount` (minor units, 20 % with ₦3k floor capped at payment).
- Webhooks are CSRF-exempt (`bootstrap/app.php: validateCsrfTokens except webhooks/*`), verify HMAC before `verifyAndActivate`, always respond `200` on unknown payment to avoid retry storms.
- Demo data: `RoomTributeSeeder` + factories remain; `CloudinaryUsage` still daily rollup.

---

## 10) Known limitations / next

- Pre-existing test failures (Cloudinary `App\Media\Cloudinary\*` classes not yet implemented) are unrelated to billing — they fail on `main` without this branch.
- Geo IP falls back to Nigeria on `CF-IPCountry=XX` or local dev lacking Cloudflare; manual selector always available.
- Starter copy says “voice notes” but voice is only live via `tributes.audio` today — weddings page omits voice from the advertised list until verified.
- House-member `tier_type` counting is per `ownerId`; multi-house edge cases not yet audited.

---

*Last updated 2026-08-27. Masters: Laravel 13, Inertia 3, React 19, Tailwind 4.*
