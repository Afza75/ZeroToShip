const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = 'your-secret-key-change-this-later';
const USERS_DB_PATH = path.join(__dirname, '..', 'users_db.json');

// Helper: load users from file
function loadUsers() {
  if (!fs.existsSync(USERS_DB_PATH)) return [];
  const raw = fs.readFileSync(USERS_DB_PATH);
  return JSON.parse(raw);
}


function saveUsers(users) {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
}


router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const users = loadUsers();
  const existing = users.find(u => u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User(users.length + 1, username, hashedPassword);

  users.push(newUser.toDict());
  saveUsers(users);

  res.status(201).json({ message: 'User registered successfully' });
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const users = loadUsers();
  const userData = users.find(u => u.username === username);

  if (!userData) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const validPassword = await bcrypt.compare(password, userData.hashed_password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { userId: userData.user_id, username: userData.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ message: 'Login successful', token });
});

module.exports = router;