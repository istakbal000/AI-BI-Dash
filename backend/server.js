import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { pool } from './config/db.js';
import queryRoutes from './routes/queryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import copilotRoutes from './routes/copilotRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initDatabase } from './initDb.js';

const app = express();

// Middleware - CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ai-bi-dash-qt9v.onrender.com',
  'https://ai-bi-dash-qt9v.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(null, true); // Allow all for now during development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: dbTest.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Simple test route (no database)
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env: {
      port: env.port,
      dbHost: env.dbHost,
      dbName: env.dbName
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', queryRoutes);
app.use('/api/copilot', copilotRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized');
    
    // Start server
    app.listen(env.port, () => {
      console.log(`\n🚀 AI BI Dashboard Backend running on port ${env.port}`);
      console.log(`   Health: http://localhost:${env.port}/api/health`);
      console.log(`   API:    http://localhost:${env.port}/api\n`);
      console.log('Environment variables:');
      console.log(`   DB_HOST: ${env.dbHost}`);
      console.log(`   DB_NAME: ${env.dbName}`);
      console.log(`   GEMINI_API_KEY: ${env.geminiApiKey ? 'SET' : 'MISSING'}`);
      console.log(`   JWT_SECRET: ${env.jwtSecret ? 'SET' : 'MISSING'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

startServer();

export default app;
