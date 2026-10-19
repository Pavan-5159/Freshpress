import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes';
import { errorHandler } from './middleware/errorHandler';




const app: Application = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow all localhost origins for local development
    if (origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    // Production allowed origins
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
