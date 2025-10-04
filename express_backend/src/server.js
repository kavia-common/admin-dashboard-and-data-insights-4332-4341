require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

(async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} signal received: closing HTTP server`);
      server.close(async () => {
        console.log('HTTP server closed');
        try {
          await disconnectDB();
          console.log('MongoDB disconnected');
        } catch (e) {
          console.error('Error while disconnecting MongoDB', e);
        } finally {
          process.exit(0);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    module.exports = server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
