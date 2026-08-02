# Phase 4 — Static Visual Presentation Layer

## Tech Stack
Plain HTML5 and CSS3 (CSS Grid and Flexbox), no JavaScript, no framework — as required by the brief, this phase is built entirely with static mock data and no connection to the Phase 2/3 server.

## What I Built

### `marketplace.html` — Trading Board Marketplace View
A gallery-style grid of item listing cards, laid out using **CSS Grid** (`grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`), so cards automatically reflow into as many columns as fit the screen width. Each card shows:
- A visual placeholder for the item (emoji icon standing in for a photo)
- A status badge ("Open" in green, "Traded" in red)
- Title and description
- A "Make an Offer" button

The page also includes a status filter dropdown and a search input at the top — both marked `disabled` in HTML, since the brief specifically calls for "unhooked form selectors": elements that are visually present but not wired to any real filtering logic yet.

### `dashboard.html` — Negotiation Status Dashboard
A separate page listing active negotiations, each showing the post being negotiated, the other party's name, the current offer terms, and — the core requirement — a colored status badge:
- 🟡 **"Your Turn"** — yellow badge with a glow effect (`box-shadow`), shown when the mock data represents the current user needing to act
- 🔴 **"Waiting for Peer"** — red badge, shown when it's the other person's turn

These badges are a direct visual representation of the `turn_holder_id` concept built and tested in Phase 3, but here they're driven by hardcoded mock values rather than live data from the server.

### `styles.css`
Shared stylesheet for both pages: CSS Grid for the marketplace, Flexbox for the dashboard's card list, and a small shared color system for status badges (green/red for post status, yellow/red for turn status).

## Approach
Since this phase explicitly requires "static mock data before connecting live server systems," neither page fetches anything from the Phase 2/3 backend. All post and negotiation data is hardcoded directly into the HTML, standing in for what would eventually come from `GET /api/posts` and the offers data built in Phase 3. This mirrors a real frontend development practice: building and reviewing the visual layer in isolation before wiring it to live data.

## What I Learned
- How CSS Grid's `auto-fill` and `minmax()` work together to build a responsive card gallery without media queries
- The purpose of building a "static" UI phase separately from a "connected" one — validating layout and visual design before adding data-fetching complexity
- How to represent a backend state (turn_holder_id) purely through visual design choices (badge color, glow effect) so it communicates status at a glance

## Output
Screenshots of both rendered pages (marketplace grid and negotiation dashboard with visible badges) are included in the Output folder.