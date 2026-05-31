import 'dotenv/config';
import express from 'express';
import router from './router/router';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth';
import cors from 'cors';
import { origins } from './utils/origins';
import { globalLimiter } from './middleware/rateLimiter';
const port = process.env.PORT || 3000;

const app = express();

// Trust proxy for correct rate limiting when behind reverse proxies (like Render, Vercel, Cloudflare, etc.)
app.set('trust proxy', 1);

const corsOptions = {
  origin: origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-Better-Auth-CSRF',
  ],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());
app.use('/api/v1', globalLimiter, router);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the XContext API' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${process.env.BETTER_AUTH_URL}`);
});
