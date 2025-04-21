require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'test-api-key';

app.use(cors());

app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }
  next();
});

app.use('/loads', require('./routes/loads'));
app.use('/verify', require('./routes/verify'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
