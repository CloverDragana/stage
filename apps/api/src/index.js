const express = require('express');
const cors = require('cors');
const { verifyToken } = require('@your-project/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Auth middleware
app.use('/api', verifyToken);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/profiles', require('./routes/profiles'));

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});