# Ulo — House of Stories — Mobile API

> Base URL `https://{APP_URL}/api/v1` — Sanctum bearer — JSON only. Mirror of `routes/api.php` + web domain truth (`config/pricing.php`, `RoomService`, `DashboardService`). Keep in sync with `openapi.json`.

---

## 1. Conventions

- **Versioning:** `/api/v1` — never break without new version.
- **Auth:** `Authorization: Bearer <sanctum_token>` (`POST /login` via Fortify returns token — store in `expo-secure-store`, attach in `src/lib/api/client.ts`). Public routes: `GET /pricing`, `GET /share/rooms/{slug}`.
- **Headers:** `Accept: application/json`, `Content-Type: application/json` (multipart for uploads).
- **Errors:** Laravel shape
  ```json
  { "message": "The given data was invalid.", "errors": { "name": ["The name field is required."] } }
  ```
  `401` unauthenticated, `403` forbidden / contributions closed, `402` requires checkout, `404` not found, `422` validation, `429` throttle.
- **Resources:** All list/detail responses wrap `{ "data": ... }`. Paginated uses Laravel `data/meta/links`; cursor uses `{ data, pagination: { next_cursor, per_page } }` or `{ data, next_cursor, has_more }` for feed.
- **Uploads:** `thumbnail`, `media_items[]`, `file`, `media_files[]` → `multipart/form-data` → stored via `MediaManager` (Cloudinary/public disk) → response returns `file_url` + `thumbnail` absolute URLs.

Re-validate on backend — mobile never calculates fees/storage.

---

## 2. Auth

### `GET /api/v1/me` — auth:sanctum
Returns `UserResource`.

### `POST /api/v1/logout` — auth:sanctum
Deletes `currentAccessToken`. Clear TanStack cache + SecureStore client-side.

> Login itself is Fortify `POST /login` (web guard) or `POST /api/login` if exposed — mobile must use `EXPO_PUBLIC_API_URL + /login` → returns `token`. Follow existing Fortify flow; do not invent `POST /api/v1/login`.

---

## 3. Dashboard & Analytics (mobile home `index.tsx` Stitch `c598b3c` / `6deff95`)

### `GET /api/v1/dashboard` — auth:sanctum — `V1DashboardController@index` → `DashboardService::getDashboardData()`
```json
{
  "data": {
    "rooms": [ RoomResource ],
    "events": [ { "id": 1, "title": "...", "stories_count": 3 } ],
    "recent_stories": [ StoryResource ],
    "stats": [
      { "name": "Photos", "icon": "Camera", "count": 12 },
      { "name": "Videos", "icon": "Video", "count": 4 }
    ],
    "house_members": [ HouseMemberResource ],
    "notifications": []
  }
}
```
Query key: `['dashboard']` — staleTime 60s.

### `GET /api/v1/analytics` — auth:sanctum
```json
{ "data": { "creatorStats": { "views": 123, "period": "30d", ... } } }
```
`analytics` screen `*_aggregation->creatorStats(user, start, end)`.

---

## 4. Rooms (member vault)

### `GET /api/v1/rooms` — auth:sanctum — paginate 20
`RoomResource` collection (includes `stories_count`, `remaining_storage_bytes`, `contributions_open`). Hook: `useRooms()` `['rooms']`.

### `GET /api/v1/rooms/{room}` — auth:sanctum — `V1RoomController@show` slug
```json
{
  "data": {
    "room": RoomResource,
    "stories": [ StoryResource ],
    "tributes": [ TributeResource ],
    "candles": [ CandleResource ]
  }
}
```
Key: `['rooms', slug]`. Use for `rooms/[slug].tsx` Stitch `45ae96` / `40c614`.

### `POST /api/v1/rooms` — auth:sanctum — `StoreRoomRequest`
- Body (`multipart` if files): `name*`, `description`, `privacy* public|private`, `room_type general|wedding|birthday|burial|memorial|anniversary|graduation`, `tier_type starter|full_room|family_archive`, `thumbnail image ≤5MB`, `enable_tributes? bool`, `enable_candle_lighting? bool`, `tribute_name`, `tribute_song mp3/wav/ogg ≤10MB`, `media_items[] jpg/png/webp/mp4/mov/webm ≤10MB each`, `start_date, end_date`, `client_id`.
- **Paywall:** if `room_type ∈ [wedding,birthday,burial,memorial,anniversary,graduation]` or `tier_type === full_room|family_archive` → `402 { message, requires_checkout: true, room_type }` — call `POST /billing/checkout` instead of creating free. Only `general` creates free `starter` (1 active, 50 contributions, 1GB, 30d).
- `201 { data: RoomResource }`. Invalidates `['rooms']`.

### `PUT|PATCH /api/v1/rooms/{room}` — auth:sanctum — `UpdateRoomRequest`
Same fields + `existing_media_urls` JSON string + `media_files[]`. Returns `RoomResource`.

### `DELETE /api/v1/rooms/{room}` — auth:sanctum — owner only `403` else.

---

## 5. Stories & Reels

### `GET /api/v1/rooms/{room}/stories` — auth:sanctum — cursor 24
`StoryResource` cursor paginate — `['rooms', slug, 'stories']`.

### `POST /api/v1/rooms/{room}/stories` — auth:sanctum + `contributions.open` + `throttle:guest-media`
`StoreStoryRequest`: `title* 255`, `description ≤5000`, `type* photo|video|audio|document`, `file file ≤50MB`, `thumbnail image`, `tags[] ≤32`, `assets[]`, `follow_up_to story_id`. If `contributionBlockReason !== null` → `403 { reason: draft|closed|expired|storage_full }`. `201 StoryResource`. Invalidate `['rooms', slug, 'stories']`.

### `GET /api/v1/stories/{story}` — auth:sanctum — `uuid` route
`StoryResource` (with `user.name`, `file_url`, `thumbnail` absolute).

### `DELETE /api/v1/stories/{story}` — auth:sanctum — owner / room owner else `403`.

### `GET /api/v1/stories/{story}/processing-status` — auth:sanctum
```json
{ "is_processing": true, "assets": [ { "media_uuid": "...", "status": "processing" } ] }
```
Poll until `false`.

### Feed / Reels — vertical TikTok `777562f`

#### `GET /api/v1/rooms/{room}/feed` — auth:sanctum — `?cursor=&limit=10`
```json
{
  "data": [ { "id": 1, "uuid": "...", "title": "...", "file_url": "https://...", "thumbnail": "...", "author": "...", "likes_count": 3, "comments_count": 1, "is_liked": false } ],
  "next_cursor": 12,
  "has_more": true
}
```
#### `GET /api/v1/feed?room=&cursor=` — legacy same.

TanStack infinite query `['rooms', slug, 'feed']`.

---

## 6. Search (`search.tsx` pill + chips)

### `GET /api/v1/search?q=&type=all|rooms|stories|tributes` — auth:sanctum — `SearchRequest`
```json
{ "data": { "rooms": [RoomResource], "stories": [StoryResource], "query": "burial" } }
```
Key `['search', q, type]`. Empty `204` or `data.rooms=[]`.

---

## 7. Notifications (`notifications.tsx`)

### `GET /api/v1/notifications` — auth:sanctum — paginate 20
`NotificationResource[]` with `data/read_at/created_at`.

### `POST /api/v1/notifications/{id}/read` — auth:sanctum → `NotificationResource`.

### `POST /api/v1/notifications/read-all` — auth:sanctum.

Keys `['notifications']`, invalidate after `read-all`.

---

## 8. House Access (family vault `house/access.tsx` `1c9d78` + `house/settings.tsx` `81c16cd`)

### `POST /api/v1/house/verify` — auth:sanctum — `{ token: "64hex" }`
```json
{
  "data": {
    "house_member": HouseMemberResource,
    "owner": { "id": 1, "name": "..." },
    "rooms": [ RoomResource ]
  }
}
```
`404` invalid/expired. Backend authoritative — never trust client token decode.

### `GET /api/v1/house/members` — auth:sanctum — owner’s list.
### `POST /api/v1/house/members` — auth:sanctum `{ name*, email* }` → `201 HouseMemberResource`.
### `DELETE /api/v1/house/members/{houseMember}` — `403` if not owner.

Deep link: `ulo://house/<64hex>` dev + `https://app.ulo.house/house/<token>` prod universal — extract token → `POST /house/verify`.

---

## 9. Billing — multi-region, idempotent, polling (checkout `de2a64`)

### `GET /api/v1/pricing` — public — `PricingService::allRegionPricing()`
```json
{
  "data": {
    "nigeria": { "key": "nigeria", "label": "Nigeria", "currency": "NGN", "full_room": 15000000, "full_room_formatted": "₦150,000", "family_monthly": 350000, "family_monthly_formatted": "₦3,500", "family_yearly": 3500000, "yearly_savings": 700000 },
    "rest_of_africa": { "full_room": 19000, "full_room_formatted": "$190", ... },
    "uk": { "full_room": 29000, "full_room_formatted": "£290", ... },
    "us_rest_of_world": { "full_room": 35000, "full_room_formatted": "$350", ... },
    "europe": { "full_room": 35000, "full_room_formatted": "€350", ... }
  }
}
```
Amounts minor units (÷100). Single currency per visitor — savings `12*monthly - yearly`. Pricing funnel `pricing.tsx` `f10eb7`.

### `POST /api/v1/billing/checkout` — auth:sanctum — `CheckoutRequest`
Body: `room_id? int`, `region* nigeria|rest_of_africa|uk|us_rest_of_world|europe`, `tier* starter|full_room|family_archive|family_monthly|family_yearly`, `provider? paystack|paypal|stripe`, `ref_code?`.
Flow (`PaymentService::createCheckout`):
- Resolves room ownership (`403` if not own draft).
- Computes server-side `amount/currency` via `PricingService::checkoutPrice(region, tier)` — never trust client amount.
- Creates `Payment` `status=pending` with `idempotency_key` + `provider_reference` (Stripe `session_id`, Paystack `reference`).
- If `amount===0` (starter free) → `201 { data: PaymentResource, free: true }`.
- Else `gatewayFor(provider)->initialize(payment)` → `201 { data: PaymentResource, authorization_url, reference }`. Open `authorization_url` in WebView/Browser. On failure `500` → set `failed`.

### `GET /api/v1/billing/payments/{payment}/status` — auth:sanctum — poll every 3s
```json
{ "data": { "id": 12, "status": "pending|successful|failed", "provider": "paystack", "amount": 35000, "currency": "USD", "provider_reference": "...", "paid_at": "2026-09-08T..." } }
```
`403` if not own payment. Show `Checking every 3s — do not close` + gold 2px bar.

### `POST /api/v1/billing/payments/{payment}/verify` — auth:sanctum — `{ reference? }`
Idempotently `verifyAndActivate(payment, reference)` → webhook authoritative. Returns fresh `PaymentResource`. On `successful` navigate to `rooms/[slug]` else `pricing` error.

> Web still has `GET /checkout/{payment}` Inertia + `GET /billing/callback/{provider}` redirects — mobile uses JSON `status/verify` only.

---

## 10. Guest Share — public (no auth)

### `GET /api/v1/share/rooms/{slug}` — public
```json
{
  "data": {
    "room": RoomResource,
    "stories": [ StoryResource ],
    "pagination": { "next_cursor": "ey...", "per_page": 24 }
  }
}
```
2-col grid `32px` rounded, contribution gate `reason` if closed — show `Ask owner` banner or `Contribute` gold pill.

> Legacy web `GET /share/rooms/{slug}` renders HTML; mobile uses this JSON. Same `RoomService::getRoomDetails` shape.

---

## 11. Likes & Comments

### `POST /api/v1/stories/{story}/likes` — auth:sanctum — toggles, returns `{ liked: bool, likes_count }`.
### `GET /api/v1/stories/{story}/likes/status` — auth:sanctum — `{ liked, likes_count }`.

Comments: web `POST /dashboard/stories/{story}/comments` (Inertia) — mobile can reuse same path or expose `POST /api/v1/stories/{story}/comments` later (not versioned yet — use web path with Sanctum bearer via Inertia XHR).

---

## 12. Resources — Field Inventory

**RoomResource**: `id, slug, name, description, room_type (general|wedding|birthday|burial|memorial|anniversary|graduation), tier_type, status, privacy, thumbnail absolute, tribute_name, enable_tributes, enable_candle_lighting, storage_used_bytes, storage_limit_bytes, remaining_storage_bytes, expires_at, contributions_closed_at, contributions_open bool, contribution_block_reason draft|closed|expired|storage_full|null, created_at, updated_at, stories_count, tributes_count, photos_count, videos_count, creator{id,name}`.

**StoryResource**: `id, uuid, title, description, type, thumbnail absolute, file_url absolute, duration, assets, created_at "M d, Y", user "Name"`. `FeedStory` adds `author, date, tags[], likes_count, comments_count`.

**PaymentResource**: `id, status pending|successful|failed, provider paystack|stripe|paypal, amount minor, currency NGN|USD|GBP|EUR, region, provider_reference, room{id,slug,name}, paid_at, created_at`.

**HouseMemberResource**: `id, name, email, avatar, bio, position, created_at` (token hidden).

**TributeResource**: `id, room_id, name, message, images[], video, audio, is_approved, created_at`.

**CandleResource**: `id, room_id, name, message, is_approved, created_at`.

**UserResource**: `id, name, email, profile_photo_url, is_admin, email_verified_at`.

**NotificationResource**: `id, type, data, read_at, created_at`.

---

## 13. Mobile TanStack Mapping

| Screen (Stitch) | Hook | Key |
|---|---|---|
| Dashboard `c598b3c` | `useDashboard()` | `['dashboard']` |
| Room Detail `45ae96` | `useRoom(slug)` | `['rooms', slug]` |
| Stories infinite | `useRoomStories(slug)` | `['rooms', slug, 'stories']` |
| Feed/Reels `777562f` | `useRoomFeed(slug)` | `['rooms', slug, 'feed']` |
| Search | `useSearch(q,type)` | `['search', q, type]` |
| Notifications | `useNotifications()` | `['notifications']` |
| Analytics | `useAnalytics()` | `['analytics']` |
| House verify | `useHouseVerify(token)` | `['house', token]` |
| Pricing | `usePricing()` | `['pricing']` |
| Checkout status poll | `usePaymentStatus(id)` refetch 3s | `['payments', id, 'status']` |

Invalidate `['rooms']` after create/update, `['rooms', slug]` after story contribute.

---

## 14. curl Examples

```bash
# Dashboard
curl -H "Authorization: Bearer $TOKEN" $API/api/v1/dashboard

# Create general room (free)
curl -X POST -H "Authorization: Bearer $TOKEN" -F "name=The Heritage Hall" -F "privacy=private" -F "room_type=general" $API/api/v1/rooms

# Paid occasion → 402 then checkout
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"room_id":1,"region":"us_rest_of_world","tier":"full_room","provider":"stripe"}' \
  $API/api/v1/billing/checkout

# Poll status
curl -H "Authorization: Bearer $TOKEN" $API/api/v1/billing/payments/12/status

# Guest share (public)
curl $API/api/v1/share/rooms/the-heritage-hall-abc123
```

---

> After any API change update `openapi.json` + this file + `APP.md`/`README.md` pricing block.
