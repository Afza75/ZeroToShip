const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-this-later';

function authGuard(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Malformed token' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // attach decoded user info to the request
    next(); // proceed to the actual route
  });
}

module.exports = authGuard;