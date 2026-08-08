const express = require('express');
const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trade');
const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.static('public'));
app.use('/', authRoutes);
app.use('/', tradeRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});