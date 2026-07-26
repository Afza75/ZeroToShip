# Phase 2 — Authentication & Session Guard

## Tech Stack
Node.js + Express 5, bcrypt (password hashing), jsonwebtoken (JWT auth). Tested with Thunder Client (VS Code extension) instead of Postman, due to a Postman Cloud Agent/localhost connectivity issue — Thunder Client provides equivalent local API testing functionality.

## What I Built
- `models/user.js` — User model with user_id, username, hashed_password, following the same toDict()/fromDict() serialization pattern from Phase 1
- `routes/auth.js` — /register (hashes password with bcrypt, saves to users_db.json) and /login (verifies password, issues a JWT valid for 1 hour)
- `middleware/authGuard.js` — Profile Gatekeeper middleware that checks for a valid JWT in the Authorization header before allowing access to protected routes
- `server.js` — Express server with a placeholder /protected-test route demonstrating the gatekeeper in action

## Approach
Passwords are never stored in plain text — bcrypt hashes them one-way before saving. On login, a JWT is issued containing the user's ID and username, signed with a server secret so it can't be forged. The authGuard middleware checks this token on protected routes, using next() to allow the request through only if the token is valid.

## What I Learned
- Why passwords must be hashed, not stored directly (one-way hashing vs reversible encryption)
- How JWTs work: header.payload.signature, and why the signature prevents tampering
- The difference between authentication (proving who you are, once at login) and authorization/gatekeeping (checking permission on every sensitive request afterward)
- Debugging: diagnosed a Postman Cloud Agent vs Desktop Agent localhost connectivity issue, and correctly identified a GET vs POST method mismatch from a "Cannot GET /register" error message

## Testing (via Thunder Client)
1. POST /register → 201 Created
2. POST /login → 200 OK, returns JWT
3. GET /protected-test with valid token → 200 OK, returns authenticated message
4. GET /protected-test without token → 401 Unauthorized