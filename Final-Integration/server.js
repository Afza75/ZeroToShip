const express = require('express');
const authRoutes = require('./routes/auth');
const tradeRoutes = require('./routes/trade');

const app = express();
app.use(express.static('public')); 
const PORT = 3000;

app.use(express.json());
app.use('/', authRoutes);
app.use('/', tradeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});