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
  - `kind` — `root|branch|person|event` (structural purpose; `App\Enums\RoomKind`). Pre-existing rows are `event`.
  - `person_id` — nullable FK `people`, UNIQUE (max one Person Room per person). Only `kind=person` carries it.
  - `tier_type` — `nullable` (legacy **or structural**), `starter|full_room|family_archive`
  - `status` — `draft|active|expired|archived`
  - `storage_used_bytes`, `storage_limit_bytes`, `expires_at`, `contributions_closed_at`
  - `referral_partner_id` (FK `partners`), `welcome_message` (text), `wedding_dates` (json)
  - Legacy rows have `tier_type = NULL` → `isLegacy() === true` → unlimited, never gated. Structural rooms (`kind=root|branch|person`) are also `tier_type=NULL` (free infrastructure, no expiry) but are identified by `kind`, not legacy status — the Starter 1-room limit counts `kind=event` rows only.
  - Person-room scope: `kind=person` requires `person_id` inside the owner's linkable scope (`App\Services\PersonScope`: owned/created people or explicit `edit` grant — same relations `PersonPolicy::edit` uses). Enforced in `RoomService`, not just request validation.
  - **Access control** — `App\Policies\RoomPolicy` gates dashboard/API room `view|update|delete`. `view/update` = creator or `room_user` pivot member; `delete/manage` = creator only. `DashboardService` and API `index` only return the user’s own/member rooms (never all active rooms). Bulk `download-media` accepts an authenticated owner/member OR a house-member session. Public `/share/rooms/{slug}` stays slug-accessible by design.
- **Media / Story** — `media.size` summed via `Room::stories()->with Media`; global rollup `cloudinary_usage`. Structured people tagging lives in `person_story_links(role=mentioned)` via `person_ids[]` on every story path (`StoryService::syncTaggedPeople`, scope asserted pre-create); `stories.tags` stays free-form. Person Rooms surface direct + linked stories through `PersonArchiveService::storiesQuery` (grouped, deduped, no copies) on all show/feed/index surfaces, with `archive` meta on payloads. Story payloads carry `tagged_people[]` (frontend `TaggedPeople` links to the Person Room or profile).
- **Payment** — `payments` (`user_id`, `room_id nullable`, `tier` purchased key nullable, `amount` minor units, `currency CHAR(3)`, `provider enum paystack|paypal|stripe`, `provider_reference`, `idempotency_key UNIQUE`, `status pending|successful|failed`, `region enum`, `partner_id`, `creator_profile_id nullable`, `subscription_id nullable`, `commission_amount minor`, `utm json`, `paid_at`).
- **Subscription** — `subscriptions` (`user_id`, `referred_creator_profile_id nullable`, `tier family_monthly|family_yearly|viewer_monthly|viewer_yearly|viewer_vip_monthly|viewer_vip_yearly`, `status active|past_due|canceled|expired`, `current_period_start/end`, `cancel_at_period_end bool`, provider refs, `region/currency`). Created idempotently by `PaymentService::activateSubscription()` on webhook/callback (previously never created in production).
- **CreatorProfile** — `creator_profiles` (`user_id UNIQUE`, `creator_type normal|vip`, `ref_code UNIQUE`, `commission_rate nullable override`, `is_approved_vip bool`, `payout_details json`). Every creator gets a `?ref=` link; VIP requires admin approval.
- **CreatorEarning** — `creator_earnings` (`creator_profile_id`, `payment_id UNIQUE`, `subscription_id nullable`, `viewer_user_id`, `amount_minor`, `currency`, `split_pct`, `status pending|available|paid`, `paid_at`). One row per paid viewer subscription (Normal 70% / VIP 80% defaults in `config/pricing.php:creator`). Payouts are manual in v1 (admin marks paid).
- **Story visibility** — `stories.visibility normal|vip` (default normal). Only approved VIP creators may publish `vip`; VIP stories are pushed in the featured feed.
- **Partner** — `partners` (`name, ref_code UNIQUE, commission_rate decimal(5,2) default 20.00, is_active`). `calculateCommission(minor, currency)` enforces ₦3,000 floor for NGN, capped at payment amount.

---

## 4) Pricing & paywall (current reality)

### Tiers

| Tier | Limit | Cost |
|---|---|---|
| **Starter (free)** | 1 active Starter per `user.id`, 50 contributions, 1 GB, 30 days, individual downloads only | Free, no card |
| **Full Room (one-off)** | 10 GB, 12 months online, unlimited guests/contribs within 10 GB, bulk download, QR, slideshow, personalised cover. **One payment per Room/occasion.** Completed Full Rooms can be moved into an active Family Archive. | Regional price (below) |
| **Family Archive (recurring)** | 25 GB pooled, whole-family no per-person fee, admin-controlled, cancel-anytime (access to period end) | Monthly / Yearly per region, renews until canceled |
| **Viewer Standard (recurring)** | Watch all **normal** creator stories platform-wide. Creator earns 70% when you subscribe via their link/page. | Nigeria ₦2,000/mo · ₦20,000/yr; UK £4.99/mo · £49/yr; US $5.99/mo · $59/yr; EU €5.99/mo · €59/yr; Rest of Africa $2.99/mo · $29/yr |
| **Viewer VIP (recurring)** | Everything in Viewer **plus VIP stories** pushed in the featured feed (`/watch/featured`). Creator earns 80%. | Nigeria ₦3,500/mo · ₦35,000/yr; UK £7.99/mo · £79/yr; US $9.99/mo · $99/yr; EU €9.99/mo · €99/yr; Rest of Africa $4.99/mo · $49/yr |

### Region matrix — `config/pricing.php` (minor units, single currency per card)

| Location | Full/Wedding Room | Family Monthly | Family Yearly | Yearly save |
|---|---|---|---:|---|
| Nigeria | ₦150,000 (15_000_000) | ₦3,500 | ₦35,000 | ₦7,000 |
| Rest of Africa | US$19 | US$4.99 | US$49 | US$10.88 |
| UK | £29 | £7.99 | £79 | £16.88 |
| US / Rest of world | US$35 | US$9.99 | US$99 | US$20.88 |
| Europe | €35 | €9.99 | €99 | €20.88 |

`geo_countries` in `config/pricing.php:28` drives `PricingService::detectRegion()` (`CF-IPCountry` → `session('pricing_region')` → `config.default_region=nigeria`). `us_rest_of_world` now includes `US,CA,AU,NZ,SG,…` so **Canada → US$35**, not Nigeria. Manual `RegionSelector` always wins over detection. `POST /billing/*` re-derives `amount/currency` server-side — spoofing a cheaper region is allowed and handled.

### Paywall

- Only `room_type=general` is free via **Dashboard → Create Room** (`RoomService::createRoom` assigns Starter limits, enforces 1-active-Starter per owner over `kind=event` rows only). Any `room_type` in `[wedding,birthday,burial,memorial,anniversary,graduation]` or `tier_type full_room|family_archive` on that endpoint **302s to `weddings.create?type={type}`** (wedding included) instead of a 422 — unless `kind` is `root|branch|person`, which skip the paywall entirely (`tier_type=NULL`, no expiry). House-member creation counts against the house `ownerId` quota.
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
POST /billing/subscriptions    → SubscriptionController@store  (Family Archive + Viewer Standard/VIP; accepts ref_code, attributes creator)
GET  /billing/subscriptions
POST /billing/subscriptions/{id}/cancel
POST /billing/rooms/{room}/move-to-archive
GET  /creators/{refCode}         → CreatorController@show  (public creator page, subscribe via ?ref= link)
POST /creators                   → CreatorController@store  auth  (become Normal creator, get ref link)
GET  /watch                     → WatchController@index  auth+viewer  (normal feed + VIP featured block for VIP viewers)
GET  /watch/featured            → WatchController@featured  auth+viewer:vip  (VIP-only push feed)
GET  /admin/creators            → CreatorAdminController@index  admin  (profiles + earnings)
POST /admin/creators/{profile}/approve|revoke
POST /admin/creator-earnings/{earning}/pay
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
- `pricing` — strip `05-merchandise-family + 08-event-kit`, 3 cards + **Viewer Standard / Viewer VIP cards** (region-aware, `?ref=` preserved into `POST /billing/subscriptions`), private-by-default, FAQ 12, `RegionSelector` + `StickyCTA → /weddings/create`.
- `watch/index` — viewer feed (`viewer` middleware): normal stories + VIP featured block for VIP viewers.
- `watch/featured` — VIP-only push feed (`viewer:vip` middleware).
- `creators/show` — public creator page with `Subscribe via my link → /pricing?ref=CODE`.
- `admin/creators` — approve/revoke VIP + mark earnings paid.
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

New suites: `tests/Feature/Billing/{BillingTest,ContributionGateTest,ReferralTest,SubscriptionArchiveTest,RoomCreationGateTest,CreatorEconomyTest}` (CreatorEconomyTest: viewer pricing, creator attribution, subscription+earning activation + idempotency, StoryPolicy gating, `viewer:vip` middleware, creator ref checkout).

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
