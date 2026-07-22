# Phase 1 — TradePost Models & Serialization

## Tech Stack
Node.js (vanilla JavaScript, no framework) — Phase 1 covers only data modeling and flat-file serialization, no server yet.

## What I Built
- `models/post.js` — Post model with post_id, title, description, owner_id, status
- `models/offer.js` — Offer model with offer_id, post_id, proposer_id, offered_item_details, turn_holder_id
- Both models implement `toDict()` (convert object → plain dictionary for JSON) and `fromDict()` (rebuild object from plain dictionary)
- `test.js` — creates sample Post/Offer objects, saves them to `tradepost_db.json`, reads the file back, and rebuilds the objects to confirm the full round-trip works

## Approach
I designed each model as a JS class, mirroring how database models work (similar to Mongoose schemas), but without a real database — just a JSON flat-file. `toDict()`/`fromDict()` act as manual translators between live JS objects and plain JSON-safe data, since class instances can't be saved to a file directly.

## What I Learned
- Why serialization is necessary (objects in memory vanish when the program stops; only files persist)
- The difference between instance methods (`toDict()`, called on an existing object) and static methods (`fromDict()`, called on the class itself to create a new object)
- How relational references work in flat-file data (Offer links back to Post via `post_id`)