import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes'
import reportRoutes from './routes/report.routes';
import settingRoutes from './routes/setting.routes';
import { initializeDefaultSettings } from './controllers/setting.controller';

// Routes
import shipmentRoutes from './routes/shipment.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('MongoDB connected');
    // Initialize default settings
    initializeDefaultSettings();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/shipments', shipmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'OceanTrackers API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
