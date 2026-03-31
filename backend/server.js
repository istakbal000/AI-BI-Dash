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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', queryRoutes);
app.use('/api/copilot', copilotRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
initDatabase().then(() => {
  // Start server
  app.listen(env.port, () => {
    console.log(`\n🚀 AI BI Dashboard Backend running on port ${env.port}`);
    console.log(`   Health: http://localhost:${env.port}/api/health`);
    console.log(`   API:    http://localhost:${env.port}/api\n`);
  });
});

export default app;
