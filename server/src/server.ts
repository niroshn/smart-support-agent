import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRouter from './routes/chat.js';
import { initializeVectorStore } from './services/vectorService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration with support for SSE
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);

    // Allow configured client URL
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000', // React dev server default
      'http://localhost:5173', // Vite default
      'http://localhost:5174', // Vite alternate
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Routes
app.use('/api', chatRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MoneyHero AI Support API',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /api/health'
    }
  });
});

// Initialize vector store and start server
async function startServer() {
  try {
    // Initialize vector store on startup
    await initializeVectorStore();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
