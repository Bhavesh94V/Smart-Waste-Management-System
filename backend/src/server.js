import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize environment variables
dotenv.config();

// Import PostgreSQL connection ONLY
import { initializePostgres } from './config/database.js';

// Import all models so they get registered with Sequelize (tables created on sync)
import './models/User.js';
import './models/PickupRequest.js';
import './models/Payment.js';
import './models/Bin.js';
import './models/Complaint.js';
import './models/SystemSettings.js';
import './models/AuditLog.js';
import './models/CollectorRoute.js';
import './models/IoTSensorData.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import citizenRoutes from './routes/citizen.routes.js';
import collectorRoutes from './routes/collector.routes.js';
import adminRoutes from './routes/admin.routes.js';
import iotRoutes from './routes/iot.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { authenticateToken } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ============ MIDDLEWARE ============
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173', 'https://SmartWasteManagementAPI.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(morgan('combined'));
app.use(requestLogger);

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/citizen', authenticateToken, citizenRoutes);
app.use('/api/collector', authenticateToken, collectorRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/iot', iotRoutes);

// ============ 404 ============
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ============ ERROR HANDLER ============
app.use(errorHandler);

// ============ DATABASE INITIALIZATION ============
async function initializeDatabases() {
  try {
    console.log('🔄 Initializing PostgreSQL...');
    await initializePostgres();
    console.log('✅ PostgreSQL connected successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// ============ SERVER STARTUP ============
async function startServer() {
  try {
    await initializeDatabases();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║  Smart Waste Management Backend API                    ║
║  Server running on: http://localhost:${PORT}           ║
║  Environment: ${process.env.NODE_ENV}                   ║
╚════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;
