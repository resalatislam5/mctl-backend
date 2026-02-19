import express, { Express, Response } from 'express';
import cors from 'cors';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import router from './routes';
import { errorHandler } from './utils/errorHandlers';
import morgan from 'morgan';
const app: Express = express();

const file = fs.readFileSync('swagger.yaml', 'utf8');
const swaggerDocument = YAML.parse(file);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use([
  express.json(),
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  }),
  morgan('dev'),
]);

app.use('/api', router);
app.use((_req, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});
app.use(errorHandler);

export default app;
