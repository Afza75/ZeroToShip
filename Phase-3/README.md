# Phase 3 — Listing & Negotiation Endpoints, Turn-Taking & Auto-Decline Logic

## Tech Stack
Node.js + Express, reusing the JWT authentication system and gatekeeper middleware from Phase 2, and the Post/Offer models and flat-file serialization pattern from Phase 1. Tested with Thunder Client (VS Code extension).

## What I Built

### Endpoints
- `GET /api/posts` — public route, returns all listings from `tradepost_db.json`. No authentication required, since browsing listings shouldn't require an account.
- `POST /api/offers` — protected route (behind `authGuard`). Creates a new offer on a given post. The `proposer_id` is taken from the verified JWT (`req.user.userId`), never from the request body, so a user cannot submit an offer pretending to be someone else. The initial `turn_holder_id` is set to the post's owner, since they need to respond next.
- `POST /api/offers/:id/counter` — protected route. Lets the current turn-holder update an offer's terms and flips `turn_holder_id` to the other party (whichever of proposer/post-owner isn't currently holding the turn). Rejects the request with `403` if the requester isn't the current turn-holder.
- `POST /api/offers/:id/accept` — protected route. Lets the current turn-holder accept an offer. On acceptance: the offer's status is set to "Accepted", the post's status is set to "Traded", and every other offer on the same post is automatically set to "Declined".

These last two routes (`counter`, `accept`) aren't explicitly named in the Phase 3 brief, but were added as reasonable extensions since the described business rules (turn-flipping, auto-decline) can't be triggered without some action that performs a counter or an acceptance.

### Files
- `models/post.js`, `models/offer.js`, `models/user.js` — carried over from Phase 1/2
- `routes/auth.js`, `middleware/authGuard.js` — carried over from Phase 2
- `routes/trade.js` — new file containing all four routes above and the flat-file read/write helpers (`loadPosts`, `savePosts`, `loadOffers`, `saveOffers`)

## Approach

Turn-taking is tracked using the `turn_holder_id` field on each Offer (from the Phase 1 model): it always holds the user ID of whoever needs to act next. Every counter action flips this value to the other party. Every protected trade action first checks that the requester's JWT-derived user ID matches `turn_holder_id`, rejecting with a `403` otherwise — this enforces that only the right person can act at any given moment.

Auto-decline is implemented by looping through the entire in-memory offers array on acceptance, and overriding the `status` of every offer sharing the same `post_id` (except the one just accepted) to `"Declined"`. Since there's no real database, this manual array scan is what the brief refers to as "querying the JSON array to execute auto-decline overrides."

## Test Scenario (Users, Posts, Offers)

**Seeded posts** (`tradepost_db.json`):
- Post #1 — "Guitar for trade", owned by user_id 1
- Post #2 — "Bicycle for trade", owned by user_id 2

**Registered users:**
- `noor` → user_id 1 (owns the guitar)
- `ali` → user_id 2 (owns the bicycle)
- `bilal` → user_id 3 (rival offerer, no posts owned)

**Test walkthrough:**
1. `GET /api/posts` — confirmed both seeded posts returned correctly, no auth needed.
2. `noor` logs in and submits `POST /api/offers` on Post #2 (ali's bicycle), offering a skateboard → creates Offer #2, `proposer_id: 1`, `turn_holder_id: 2` (ali, since it's now his turn to respond).
3. `ali` logs in and submits `POST /api/offers/2/counter`, asking for a helmet too → confirmed `turn_holder_id` flips from `2` to `1` (back to noor).
4. Repeated `POST /api/offers/2/counter` as `ali` immediately after → correctly rejected with `403 "It is not your turn to act on this offer"`, since it was now noor's turn, not ali's — proving the fairness check works.
5. `bilal` logs in and submits `POST /api/offers` on Post #2 as a rival, offering roller skates → creates Offer #3, `proposer_id: 3`, `turn_holder_id: 2` (ali).
6. `ali` submits `POST /api/offers/3/accept` → Offer #3 marked `"Accepted"`, Post #2 marked `"Traded"`.
7. Checked `offers_db.json` afterward: **Offer #2 (noor's rival negotiation on the same post) was automatically marked `"Declined"`**, despite nobody directly calling any endpoint on it — confirming the auto-decline logic correctly scans and overrides all rival offers on the same post the instant one is accepted.

## What I Learned
- How to enforce a stateful business rule (turn-taking) using a single field that flips between two known parties
- The difference between checking identity (JWT/authGuard, "who are you") and checking authorization for a specific action (turn-holder check, "is it your move")
- How to perform a manual "cascade update" across a flat-file array (auto-decline), which a real database would normally handle via relational queries or transactions
- Debugged an `Unexpected end of JSON input` error caused by an empty flat-file, fixed by adding an empty-string check before `JSON.parse()`
- Debugged a `req.body` undefined error caused by the request body type not being explicitly set to JSON in the REST client, which meant `Content-Type: application/json` was never sent