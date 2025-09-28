import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Container } from './src/infrastructure/Config/container.js';
import { setupRoutes } from './src/api/routes/index.js';
import { ClassificationConsumer } from './src/infrastructure/messageBroker/Classification/ClassificationConsumer.js';

async function startServer() {
  try {
    dotenv.config();

    const container = new Container();
    await container.initialize();

    const app = express();
    const PORT = process.env.PORT || 3002;

    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    const serviceOrderController = container.get('serviceOrderController');
    const authController = container.get('authController');
    app.use('/', setupRoutes(serviceOrderController, authController));

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        error: process.env.NODE_ENV === 'production'
          ? 'Something went wrong!'
          : err.message
      });
    });

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    await container.startConsumers();
    console.log('Message consumers started');

    try {
        const classificationConsumer = new ClassificationConsumer();
        await classificationConsumer.startConsuming();
        console.log('Classification consumer started');
    } catch (error) {
        console.log('⚠️ Classification consumer not available:', error.message);
    }

    await container.startScheduler();
    console.log('Material analysis scheduler started');

    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');

      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();