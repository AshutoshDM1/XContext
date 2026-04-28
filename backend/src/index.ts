import 'dotenv/config';
import express from 'express';
import router from './router/router';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth';
import cors from 'cors';
const port = process.env.PORT || 3000;

const app = express();

// Required when running behind a reverse proxy / TLS terminator (common in prod),
// otherwise secure cookies may not be set correctly.
app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://x-context.vercel.app',
  'https://xcontext.elitedev.space',
  'https://xcontext-backend.elitedev.space',
].filter(Boolean) as string[];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-Better-Auth-CSRF',
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use('/api/v1', router);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the XContext API' });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
