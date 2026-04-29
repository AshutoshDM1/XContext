import 'dotenv/config';
import express from 'express';
import router from './router/router';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth';
import cors from 'cors';
import { origins } from './utils/origins';
const port = process.env.PORT || 3000;

const app = express();

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
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json());
app.use('/api/v1', router);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the XContext API' });
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
