# TradePost — Final Integration (Phase 5)

## Overview
TradePost is a peer-to-peer barter exchange web app where users trade items without using money. This is the final, fully integrated version, combining the data models (Phase 1), JWT authentication (Phase 2), trading/negotiation logic (Phase 3), and UI (Phase 4) into one working Express application with a live-connected frontend.

## Tech Stack
- Node.js + Express (server, REST API)
- Vanilla JavaScript (frontend, using fetch() for API calls — no framework)
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- Flat-file JSON storage (tradepost_db.json, offers_db.json, users_db.json)
- HTML5 + CSS3 (CSS Grid, Flexbox)

## How to Install and Run Locally

1. Clone the repository:
   git clone https://github.com/Afza75/ZeroToShip.git
   cd ZeroToShip/Final-Integration

2. Install dependencies:
   npm install

3. Start the server:
   node server.js

4. Open your browser to:
   http://localhost:3000/login.html

## How to Test the Full Feature Set

1. Register two different users (e.g. "ali", "sara") on the login page.
2. Log in as the first user. Visit the Marketplace — browse the seeded listings (Guitar, Bicycle).
3. Try making an offer on your own post — this is correctly blocked.
4. Make an offer on the other user's post.
5. Check "My Negotiations" — you'll see a "Waiting for Peer" badge, since it's now the other user's turn.
6. Log out, log in as the second user. Their dashboard shows "Your Turn" — they can Counter or Accept.
7. Counter the offer — the turn flips back to the first user.
8. Log back in as the first user, and Accept the offer.
9. Check the Marketplace — the post now shows "Traded" and can no longer receive offers.
10. If a rival offer exists on the same post, it is automatically marked "Declined" the moment one offer is accepted.

## Project Structure
- models/ — Post, Offer, User data models with toDict()/fromDict() serialization
- routes/ — auth.js (register/login), trade.js (posts, offers, counter, accept)
- middleware/ — authGuard.js (JWT verification middleware)
- public/ — static frontend (login.html, marketplace.html, dashboard.html, styles.css, js/auth-client.js)
- server.js — Express app entry point, serves both the API and the static frontend

## Key Design Decisions
- The JWT token is stored in the browser's localStorage after login, and attached to every protected request via the Authorization header.
- Turn-taking is enforced with a turn_holder_id field on each offer, which flips between the proposer and the post owner every time either side counters. Only the current turn holder is permitted to counter or accept.
- Accepting an offer triggers an automatic loop over all other offers on the same post, marking them "Declined" — since a post can only be traded once.
- Users cannot make an offer on their own post, preventing self-trading.
- After every write action (offer, counter, accept), the frontend reloads the page to fetch fresh data — a simple Post/Redirect/Get-style pattern that avoids showing stale state after a change.

## Known Limitations / Future Scope
- Currently uses flat JSON files instead of a real database; would not scale well with concurrent users.
- No real-time updates (e.g. WebSockets) — a user must refresh or navigate to see the other party's action.
- No image upload for listings (uses emoji placeholders).
- Could add email notifications when it becomes your turn to act on a negotiation.