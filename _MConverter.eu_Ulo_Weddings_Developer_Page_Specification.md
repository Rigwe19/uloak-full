**ULO**

**WEDDINGS**

**Developer Page Specification**

Landing page, conversion flow, exact copy, analytics and MVP acceptance criteria

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>LAUNCH POSITIONING</strong></p>
<p>One wedding. One room. Everyone's memories.<br />
₦15,000 per Wedding Room • one-off payment</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Prepared for the Ulo product & development team • 24 August 2026

# 1. Purpose & launch decision {#purpose-launch-decision}

This document is the implementation handoff for the Ulo Weddings acquisition page and the user journey that begins from that page. It is intentionally specific enough for design, frontend, backend and analytics work to begin without interpreting the marketing plan.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>CORE LAUNCH DECISION</strong></p>
<p>At launch, market the product externally as “Ulo Wedding Room”, while Ulo remains the master brand. The wedding page should focus on one use case and one purchase decision, not explain every Ulo product.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Primary business objective

- Convert engaged couples (or someone buying on their behalf) into a paid Ulo Wedding Room.

- Price: ₦15,000 per Wedding Room, paid once.

- Secondary objective: allow wedding vendors/partners to refer customers and preserve attribution.

## Primary conversion

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PRIMARY CTA</strong></p>
<p>Create My Wedding Room</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Every major section should either increase confidence in this purchase or return the visitor to the primary CTA. Avoid multiple competing products or pricing tiers on this launch page.

## Recommended public URL

| **Item** | **Specification** |
|----|----|
| Landing page | /weddings |
| Optional direct checkout | /weddings/create |
| Partner/referral URLs | /weddings?ref={partner_code} |
| Campaign tracking | Preserve standard UTM parameters through checkout and room creation |

## What this page is NOT

- Not the general Ulo homepage.

- Not a feature catalogue for Family Archive, Tributes or other event types.

- Not a replacement for the photographer or videographer.

- Not a technical explanation of cloud storage or archival infrastructure.

# 2. Page architecture at a glance {#page-architecture-at-a-glance}

Recommended order, from first screen to final CTA:

| **\#** | **Section** | **Purpose** | **Main CTA** |
|----|----|----|----|
| 01 | Header / navigation | Brand confidence + clear CTA | Create My Wedding Room |
| 02 | Hero | State the problem, promise and price | Create My Wedding Room |
| 03 | Problem recognition | Make scattered guest memories feel urgent | See How It Works |
| 04 | How it works | Reduce perceived effort to three simple actions | Create My Wedding Room |
| 05 | What guests can contribute | Make the value tangible | Create My Wedding Room |
| 06 | Wedding moments / use cases | Show why guest perspectives matter | Create My Wedding Room |
| 07 | Photographer + Ulo | Remove "replacement" objection | --- |
| 08 | Guest experience | Show the QR/link contribution flow | --- |
| 09 | Privacy & control | Build trust before checkout | --- |
| 10 | Pricing | Close the purchase decision | Create My Wedding Room --- ₦15,000 |
| 11 | FAQ | Resolve final objections | Create My Wedding Room |
| 12 | Final CTA | Last conversion block | Create My Wedding Room |

## Mobile-first behaviour

- Page must be designed mobile-first. Wedding traffic is expected to arrive heavily from social, WhatsApp and QR/shared links.

- Use a sticky bottom CTA on mobile after the visitor scrolls past the hero: "Create Wedding Room • ₦15,000".

- Do not let the sticky CTA cover cookie controls, form errors, or the checkout button.

- All media should use responsive assets and lazy loading below the fold.

- Avoid autoplay audio. Any video demo should be muted by default with captions.

# 3. Header & hero --- exact launch copy {#header-hero-exact-launch-copy}

## Header

| **Element** | **Copy / behaviour** |
|----|----|
| Logo | Ulo master-brand logo. Clicking returns to main Ulo homepage. |
| Nav links | How It Works • For Wedding Vendors • FAQ |
| Primary button | Create Wedding Room |
| Mobile | Compact logo + CTA. Use menu only if needed; conversion CTA remains visible. |

## Hero copy

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>EYEBROW</strong></p>
<p>ULO WEDDINGS</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>H1</strong></p>
<p>Don’t let your wedding memories scatter.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>SUPPORTING COPY</strong></p>
<p>Your guests will capture hundreds of moments you may never see. Bring their photos, videos and stories together in one private Ulo Wedding Room.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PRICE LINE</strong></p>
<p>₦15,000 • One wedding • One payment</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PRIMARY CTA</strong></p>
<p>Create My Wedding Room</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>SECONDARY CTA</strong></p>
<p>See How It Works</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Hero visual direction

- Use an authentic Nigerian/African wedding moment or a clean product demonstration --- not generic stock imagery.

- Recommended visual story: a joyful guest captures an intimate moment while the official photographer is focused elsewhere; adjacent product UI shows that guest contribution arriving in the Wedding Room.

- Alternative: short muted loop of multiple guest perspectives converging into one Ulo Room.

- Avoid visual language that implies Ulo is replacing professional photography.

## Hero implementation notes

- Primary CTA should start the create/purchase flow immediately.

- "See How It Works" anchors to the How It Works section, not a new page.

- Display the ₦15,000 price above the fold; do not hide pricing behind a later step.

- Do not show fake review scores, fake user counts, fake wedding counts or fabricated testimonials.

# 4. Problem recognition & "How it works" {#problem-recognition-how-it-works}

## Problem section

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>SECTION HEADLINE</strong></p>
<p>Your photographer captures the official story. Your guests capture everything around it.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Suggested body copy: "The bridesmaid's video. Dad's reaction. Grandma dancing. The table that would not stop laughing. The moment someone caught from the other side of the room. After the wedding, those memories are usually scattered across WhatsApp chats, Instagram Stories and hundreds of phones. Ulo gives them one home."

## Three-step explainer

| **Step** | **Exact customer-facing copy** |
|----|----|
| 1\. Create your room | Set up your private Wedding Room and personalise it for your wedding. |
| 2\. Share one QR code or link | Put it on your programme, tables, welcome sign, WhatsApp group or screen. Guests open it from their phones. |
| 3\. Everyone contributes | Guests add the wedding memories they captured so you can experience the day from more than one perspective. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>CTA AFTER STEP 3</strong></p>
<p>Create My Wedding Room — ₦15,000</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Important product promise

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>DO NOT OVERPROMISE</strong></p>
<p>Only name contribution types that are live in the launch build. The marketing plan assumes photos, videos and story/message contributions. Voice notes should appear on the page only if the launch product genuinely supports them.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 5. What the Wedding Room should communicate {#what-the-wedding-room-should-communicate}

## Value cards

Recommended customer-facing cards. Remove any item not supported by the launch build.

| **Card** | **Customer-facing explanation** | **Launch status** |
|----|----|----|
| Photos | Guest photos that would otherwise stay on individual phones. | Required if supported in current event feature |
| Videos | Short and long guest clips from different parts of the celebration. | Required if supported in current event feature |
| Written stories / messages | Guests can add context, a memory or a message for the couple. | Confirm backend |
| Voice messages | A more personal spoken contribution from friends and family. | Only show if live at launch |
| QR / share link | A simple way for guests to reach the room from their own phones. | P0 requirement |
| Private room | The wedding has a dedicated contribution space rather than an open social feed. | P0 product promise --- confirm privacy model |

## Wedding-moment examples

Use visual examples rather than another feature list. Suggested micro-copy:

- "The moment Dad saw you dressed."

- "The cousin who caught Grandma dancing."

- "The table that filmed your entrance from a completely different angle."

- "The friends who recorded what happened while you were taking portraits."

- "The messages people wanted you to hear after the celebration."

## Recommended section headline

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>HEADLINE</strong></p>
<p>The best memory from your wedding may be on someone else’s phone.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Wedding format flexibility

Recommended product rule for Nigerian and diaspora weddings: one paid Wedding Room should represent one couple's wedding story and may cover multiple parts of that wedding (for example traditional ceremony, civil/church ceremony and reception), even when they occur on different dates. This keeps the proposition simple. If current backend billing treats these as separate events, product leadership must resolve this before the page is published.

# 6. Photographer positioning & guest contribution UX {#photographer-positioning-guest-contribution-ux}

## Photographer objection block

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>HEADLINE</strong></p>
<p>Your photographer gives you the professional story. Ulo helps you keep the guest story too.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Body copy: "Ulo is not a replacement for professional wedding photography or videography. It gives your guests one simple place to contribute the moments they captured around the official coverage."

### Why this block matters

- Prevents couples from interpreting Ulo as a cheaper substitute for their photographer.

- Makes photographers and videographers more comfortable recommending or bundling Ulo.

- Creates a clean path for the Ulo Wedding Partner programme.

## Guest contribution flow --- target experience {#guest-contribution-flow-target-experience}

| **Step** | **Guest action** | **Required interface behaviour** |
|----|----|----|
| 1 | Guest scans QR / taps share link | Room landing screen opens. |
| 2 | Guest sees couple/wedding identity | Names, cover image and short invitation to contribute. |
| 3 | Guest selects contribution action | Photo/video and any other launch-supported formats. |
| 4 | Guest sees consent / contribution notice | Guest confirms they have permission to share the material and agrees to room terms. |
| 5 | Upload / submit | Show progress, success state and retry on failure. |
| 6 | Success | Thank the guest; offer "Add another memory". |

## Guest friction requirements

- Do not require a guest to buy anything.

- Avoid mandatory account creation unless technically essential. If login is required, product leadership should reconsider because it materially increases event-day friction.

- Mobile camera-roll upload must be straightforward on iOS and Android browsers.

- Display upload progress for larger video files.

- Preserve the contribution if a temporary network error occurs where technically possible; otherwise provide a clear retry state.

# 7. Pricing & checkout specification {#pricing-checkout-specification}

## Pricing card --- exact launch copy {#pricing-card-exact-launch-copy}

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PRODUCT</strong></p>
<p>Ulo Wedding Room</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PRICE</strong></p>
<p>₦15,000</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>BILLING</strong></p>
<p>One-off payment for one Wedding Room</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

### Pricing bullets

- One private Wedding Room

- Shareable wedding link / QR access

- Guest contributions from supported media types

- No subscription for this Wedding Room

- Guests do not pay to contribute

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PRICING CTA</strong></p>
<p>Create My Wedding Room — ₦15,000</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Checkout flow --- recommended {#checkout-flow-recommended}

**1.** Visitor clicks "Create My Wedding Room".

**2.** Collect minimum room setup details: couple/room name, wedding date (or first date), account email/mobile as required by Ulo identity system, optional partner/referral code carried invisibly from URL.

**3.** Show a clear order summary: "Ulo Wedding Room --- ₦15,000 one-off".

**4.** Process payment using Ulo's approved payment provider. Do not name a payment provider on the landing page unless already selected and implemented.

**5.** On confirmed successful payment, create/activate the Wedding Room and route the owner to setup/onboarding.

**6.** Generate/share the room URL and QR asset from the owner dashboard.

## Payment states

| **State** | **Required behaviour** |
|----|----|
| Success | Activate room once payment is confirmed; show receipt/reference and continue to setup. |
| Pending | Do not activate as fully paid until provider confirmation. Explain that payment is being confirmed and allow safe refresh/recheck. |
| Failed | Show clear failure message without creating duplicate charge; allow retry. |
| Duplicate callback | Backend must be idempotent; one payment should not create multiple paid rooms. |
| Referral present | Persist attribution from landing through payment and room record. |

# 8. Wedding Room setup & suggested data requirements {#wedding-room-setup-suggested-data-requirements}

The following is a suggested product schema for the wedding experience. The development team should map it onto the existing Ulo architecture rather than create duplicate models.

## Owner-facing setup fields

| **Field** | **Required?** | **Notes** |
|----|----|----|
| Wedding Room title | Yes | Default could be "\[Name\] & \[Name\]'s Wedding". Allow editing. |
| Couple names / display names | Yes | Used in guest-facing room identity. |
| Wedding date(s) | At least one | Support multiple dates if product adopts one-room-per-wedding-story recommendation. |
| Location | Optional | City/venue text; do not require exact address. |
| Cover image | Optional but recommended | Provide safe default if omitted. |
| Welcome message | Optional | Short message shown to guests. |
| Contribution permissions | Yes / defaulted | Owner controls allowed contribution types if supported. |
| Room visibility / access mode | Yes / defaulted | Exact options depend on existing privacy system. |
| Partner attribution | Hidden | Persist partner_id/ref_code from source URL. |
| Payment status / transaction reference | System | Never editable by user. |

## Suggested core entities / attributes {#suggested-core-entities-attributes}

| **Entity** | **Suggested attributes** |
|----|----|
| WeddingRoom | room_id, owner_user_id, title, slug, date(s), location, cover_media, visibility/access mode, contribution settings, status, referral_partner_id, created_at |
| Contribution | contribution_id, room_id, contributor identity fields as permitted, type, media/content reference, caption/context, consent state, moderation/status, created_at |
| Payment | payment_id, room_id/order_id, amount, currency, provider reference, status, paid_at, idempotency/reference key |
| Partner attribution | partner_id/ref_code, source, UTM values, first_touch/last_touch policy as chosen, conversion timestamp |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PRIVACY NOTE</strong></p>
<p>Collect only the personal data needed for the experience. The exact data model, lawful basis, consent wording, retention and deletion process should be reviewed against Ulo’s privacy policy and applicable data-protection requirements before launch.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 9. Trust, privacy & FAQ copy {#trust-privacy-faq-copy}

## Privacy/trust block

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>HEADLINE</strong></p>
<p>Your wedding memories are for your people — not a public social feed.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

Suggested body copy: "Your Ulo Wedding Room is designed as a dedicated space for your wedding contributions. You control the room according to the privacy and access settings available in Ulo."

Do not publish stronger claims such as "end-to-end encrypted", "only you can ever see it", "stored forever", "unlimited storage" or "100% private" unless the product architecture and legal wording can substantiate them.

## FAQ --- approved core answers {#faq-approved-core-answers}

| **Question** | **Answer / publication note** |
|----|----|
| What is an Ulo Wedding Room? | A dedicated space for one wedding where the couple can bring together memories contributed by their guests. |
| How much does it cost? | ₦15,000 for one Wedding Room, paid once. |
| Do guests have to pay? | No. The Wedding Room purchaser pays for the room; guests are not charged to contribute. |
| Does Ulo replace my photographer or videographer? | No. Your professional team captures the official wedding story. Ulo helps you collect additional moments captured by the people who attended. |
| How do guests contribute? | They use the Wedding Room link or QR code and follow the contribution flow on their phone. |
| Can I use one room for my traditional and white wedding? | Recommended launch answer: yes, where these are parts of the same couple's wedding story. Confirm this rule in product/billing before publishing. |
| Do guests need the Ulo app? | Only publish "No app required" if the web contribution flow is confirmed in the launch build. |
| How long are my memories kept? | Do not publish a duration until the storage/retention policy is defined. |
| Can I download everything? | Only publish an answer after export/download functionality is confirmed. |
| How many guests can contribute? | Only publish an "unlimited" claim if load, abuse controls and commercial limits support it. |

# 10. Analytics & conversion measurement {#analytics-conversion-measurement}

Analytics should allow Ulo to identify which content, campaigns and partners actually produce paid Wedding Rooms. Track only what is necessary and implement consent/cookie controls as required.

## Recommended events

| **Event** | **Trigger** | **Key properties** |
|----|----|----|
| wedding_page_view | Landing page viewed | utm\_\*, ref_code, device class, landing URL |
| wedding_cta_click | Primary CTA clicked | cta_location, utm\_\*, ref_code |
| wedding_how_it_works_click | Secondary CTA clicked | source section |
| wedding_checkout_start | Create/checkout flow begins | utm\_\*, ref_code |
| wedding_setup_started | Room setup form started | ref_code |
| wedding_payment_attempt | Payment initiated | amount=15000, currency=NGN, ref_code |
| wedding_purchase | Confirmed successful purchase | room_id, amount=15000, currency=NGN, ref_code, utm\_\* |
| wedding_room_activated | Room becomes active | room_id |
| wedding_qr_generated | Owner generates/views QR | room_id |
| wedding_share_link_copied | Owner copies room link | room_id, channel if chosen |
| guest_contribution_start | Guest starts contribution | room_id, contribution_type |
| guest_contribution_success | Contribution stored successfully | room_id, contribution_type |
| guest_contribution_failed | Contribution fails | room_id, contribution_type, error_class |

## Launch dashboard KPIs

- Landing page → checkout-start conversion rate

- Checkout-start → paid conversion rate

- Paid Wedding Rooms and gross revenue

- Direct vs partner-attributed purchases

- Partner conversion rate and paid rooms per active partner

- Average contributing guests per paid room

- Contributions per wedding and contribution-type mix

- Upload failure rate

- Percentage of paid rooms that receive at least one guest contribution

# 11. Partner referrals, SEO & share metadata {#partner-referrals-seo-share-metadata}

## Partner referral requirements

- Each partner should have a unique referral identifier.

- Referral code must survive navigation, account creation/login, checkout and payment confirmation.

- Attach partner attribution to the resulting paid Wedding Room.

- Do not depend only on browser cookies; preserve referral server-side/session-side where practical and lawful.

- Define attribution window and first-touch vs last-touch rules before commission payouts begin.

- Give internal/admin users a way to audit which room came from which partner and payment.

## Recommended page metadata

| **Field** | **Recommended value** |
|----|----|
| Page title | Ulo Weddings \| One Wedding. One Room. Everyone's Memories. |
| Meta description | Bring the photos, videos and stories your guests capture into one Ulo Wedding Room. ₦15,000 one-off per wedding. |
| Canonical URL | https://uloofstories.com/weddings |
| Open Graph title | Don't let your wedding memories scatter. |
| Open Graph description | One wedding. One room. Everyone's memories. Create an Ulo Wedding Room for ₦15,000. |
| Open Graph image | Purpose-built 1200×630 launch creative; no fabricated customer claims. |

## Suggested structured content

- Product/Offer structured data may be used if implementation accurately reflects live price and availability.

- FAQ structured data should only include answers that are actually displayed and factually supported by the product.

- Keep wedding page indexable unless campaign/legal requirements dictate otherwise.

# 12. MVP priorities & acceptance criteria {#mvp-priorities-acceptance-criteria}

## P0 --- must work before launch {#p0-must-work-before-launch}

| **Area** | **Acceptance criterion** |
|----|----|
| Landing page | Responsive /weddings page with exact core proposition, price and CTAs. |
| Conversion | Primary CTA reaches create/checkout flow without dead ends. |
| Payment | ₦15,000 NGN one-off payment with reliable success/fail/pending handling and idempotency. |
| Room creation | Successful payment results in one active Wedding Room. |
| QR/link | Owner can obtain a shareable room link and QR asset. |
| Guest flow | Guest can access room and submit every contribution type advertised on the page. |
| Owner experience | Owner can view/manage received contributions according to launch permissions. |
| Privacy | Room access and contribution consent match published language. |
| Partner attribution | ref_code/UTM survives to confirmed purchase and room record. |
| Analytics | Core conversion and contribution events fire once with consistent parameters. |
| Mobile | Core guest and purchase flows tested on current iOS Safari and Android Chrome. |
| Errors | Useful upload/payment errors; no silent failures or duplicate paid-room creation. |

## P1 --- soon after launch, if not already available {#p1-soon-after-launch-if-not-already-available}

- Owner download/export workflow.

- Guest contribution moderation / hide/remove controls.

- Room themes / stronger wedding personalisation.

- Partner dashboard and automated commission reporting.

- Reminder/share templates for WhatsApp, MC announcements and wedding stationery.

- Contribution analytics for owners, e.g. number of guests and memories contributed.

## P2 --- later {#p2-later}

- Advanced memory organisation, timeline/story presentation and intelligent tagging where appropriate.

- Post-wedding pathway into Ulo Family Archive.

- Additional event-specific products after wedding-market validation.

# 13. Decisions the product team must confirm before publishing {#decisions-the-product-team-must-confirm-before-publishing}

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>BLOCKERS TO RESOLVE</strong></p>
<p>These are deliberately left unresolved rather than invented. The landing page copy must not promise them until the product team confirms the implementation.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

| **Decision** | **Question to confirm** |
|----|----|
| Contribution types | Exactly which of photos, video, text/story messages and voice notes are live at launch? |
| Guest authentication | Can guests contribute without an account/app? |
| Wedding scope | Does one ₦15,000 room cover all parts/dates of one couple's wedding story? |
| Storage limits | Any total room storage, per-file size, video length or guest/contribution limits? |
| Retention | How long is content retained? Is there an archive period or renewal requirement? |
| Export | Can owners download original files individually or in bulk? |
| Privacy model | Link-only, PIN, invite list, approval, private/public options? |
| Moderation | Can owner approve, hide or delete guest contributions? |
| Refunds | Refund/cancellation policy and failed/pending payment handling. |
| Payment provider | Which provider/methods are live for NGN checkout? |
| Partner commission | Is ₦3,000/20% the approved launch rate, and what are payout rules? |
| Legal copy | Final terms, privacy notice, contributor consent and acceptable-use wording. |

## Recommended implementation sequence

**1.** Confirm the 12 product decisions above.

**2.** Freeze the exact landing-page claims and FAQ answers.

**3.** Implement/verify the Wedding Room purchase and guest-contribution flows.

**4.** Build /weddings using the page architecture in this document.

**5.** Add attribution + analytics before public campaign traffic starts.

**6.** QA on mobile devices and real wedding-sized media uploads.

**7.** Run at least one internal test wedding end-to-end before selling publicly.

**8.** Launch with real usage, then replace placeholders with genuine case studies and testimonials only after consent.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>FINAL PRODUCT PRINCIPLE</strong></p>
<p>The page has one job: make a couple understand in seconds why guest memories scatter, show them a simple way to gather those memories, and make ₦15,000 feel like an easy wedding decision — without promising anything the product cannot deliver.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>
