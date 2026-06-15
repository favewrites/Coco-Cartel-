// ============================================
// COCO CARTEL - MAIN SERVER FILE
// ============================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coco-cartel')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/products', require('./backend/routes/products'));
app.use('/api/orders', require('./backend/routes/orders'));
app.use('/api/cart', require('./backend/routes/cart'));
app.use('/api/wishlist', require('./backend/routes/wishlist'));
app.use('/api/admin', require('./backend/routes/admin'));
app.use('/api/flutterwave', require('./backend/routes/flutterwave'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Coco Cartel API is running' });
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});