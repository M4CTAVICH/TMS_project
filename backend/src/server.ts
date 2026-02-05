import app from './app';
import { config } from './config/env';
import prisma from './config/prisma';

const PORT = config.port;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Disconnect from database
    await prisma.$disconnect();
    console.log('Database connection closed.');

    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Rejection:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Start listening
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('Logistics Management Platform API');
      console.log('='.repeat(50));
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Server running on port: ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}${config.api.prefix}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
