import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import swaggerUI from 'swagger-ui-express';
import connectDB from './db/connectDB';
import router from './routes';
import { errorHandler } from './utils/errorHandlers';
import { config } from 'dotenv';

config();

const app = express();

// Swagger setup
const swaggerFile = path.join(process.cwd(), 'swagger.yaml');
const swaggerDoc = YAML.parse(fs.readFileSync(swaggerFile, 'utf8'));
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));

// Middleware
app.use(
  express.json(),
  cors({ origin: process.env.CORS_ORIGIN || '*' }),
  morgan('dev'),
);

// Routes
app.use('/api', router);

// 404
app.use((_req, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// MongoDB connect cache
let cachedDB = false;
async function connectOnce() {
  if (!cachedDB) {
    await connectDB(); // ensure MONGO_URI is set in Vercel
    cachedDB = true;
    console.log('✅ MongoDB connected');
  }
}

// Local server
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4041;
  connectOnce().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  });
}

// Serverless handler
export default async function handler(req: Request, res: Response) {
  try {
    await connectOnce();
    return app(req, res);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message || err,
    });
  }
}
