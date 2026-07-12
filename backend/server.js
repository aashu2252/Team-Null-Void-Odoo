require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const roleRoutes = require('./routes/role.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/error.middleware');
const setupSwagger = require('./config/swagger');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);

// Root Status Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Online',
    message: 'TransitOps ERP Backend API is fully operational.',
    version: '1.0.0'
  });
});

// Error Middleware
app.use(errorHandler);

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, () => {
  console.log('Server running...');
});
