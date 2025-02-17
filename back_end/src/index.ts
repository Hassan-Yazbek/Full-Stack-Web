// backend/index.ts
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import passport from './config/passportConfig';
import accountRoutes from './routes/accountRoutes';
import taskRoutes from './routes/taskRoutes';
import inboxRoutes from './routes/inboxRoutes';
import teamRoutes from './routes/teamRoutes';
import todayRoutes from './routes/todayRoutes';
import http from 'http';
import { attachWebSocketServer } from './wsServer';

dotenv.config();

const app = express();

// Database pool setup
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  next();
});

pgPool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));

// CORS configuration
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
console.log('🌍 CORS configured for http://localhost:3000');

// Session configuration
const PgSessionStore = pgSession(session);
app.use(session({
  store: new PgSessionStore({ pool: pgPool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: 'lax',
  },
}));
console.log('🛠️ Session middleware initialized');

// Middleware
app.use(express.json());

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());
console.log('🔑 Passport authentication initialized');

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/today', todayRoutes);

// Debugging route to check sessions
app.get('/session-check', (req, res) => {
  console.log('🕵️‍♂️ Session data:', req.session);
  res.json(req.session);
});

import 'express-session';

declare module 'express-session' {
  export interface SessionData {
    user?: {
      id: string;
      email: string;
      name: string;
      last: string;
    };
    passport?: {
      user: {
        id: string;
        email: string;
        name: string;
        last: string;
      };
    };
  }
}

declare module 'express' {
  interface Request {
    session: import('express-session').Session & import('express-session').SessionData;
  }
}

// Create an HTTP server from the Express app
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Attach the WebSocket server to the same HTTP server
attachWebSocketServer(server);

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
