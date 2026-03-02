const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ─── Database ──────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/menu',    require('./routes/menu'));
app.use('/api/orders',  require('./routes/orders'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/admin',   require('./routes/admin'));

// ─── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: '🍔 BITEHAUS API is running', version: '1.0.0' });
});

// ─── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BITEHAUS server running on http://localhost:${PORT}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
});
