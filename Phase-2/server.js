const express = require('express');
const authRoutes = require('./routes/auth');
const authGuard = require('./middleware/authGuard');

const app = express();
const PORT = 4000;

app.use(express.json());

app.use('/', authRoutes);

// A placeholder protected route to prove the gatekeeper works
app.get('/protected-test', authGuard, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, you are authenticated!` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});