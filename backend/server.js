const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const ouRoutes = require('./routes/ous');
const divisionRoutes = require('./routes/divisions');
const credentialRoutes = require('./routes/credentials');
const usersRoute = require('./routes/users');

const verifyRole = require('./middleware/verifyRoles')
const verifyToken = require('./middleware/verifyToken')

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// CORS setup - Allow requests from React frontend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add any other methods you're using
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers you are sending
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ous', ouRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/credentials', verifyToken, credentialRoutes);
app.use('/api/users', verifyToken, verifyRole(['admin']), usersRoute); // Only admins can manage users

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Default Route
app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
