'use strict';

/**
 * Database connection module using Mongoose.
 * Reads MONGODB_URI from environment variables and connects with sensible defaults.
 */

const mongoose = require('mongoose');

let isConnected = false;

// PUBLIC_INTERFACE
async function connectDB(uri) {
  /** Connect to MongoDB using Mongoose.
   * - uri: Optional MongoDB connection string. Defaults to process.env.MONGODB_URI.
   * Returns the mongoose connection.
   */
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI env var is required to connect to MongoDB.');
  }

  if (isConnected) {
    return mongoose.connection;
  }

  // Use recommended options and increase timeouts for cloud providers like Atlas
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    autoIndex: true,
  });

  isConnected = true;

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
    isConnected = false;
  });

  return mongoose.connection;
}

// PUBLIC_INTERFACE
async function disconnectDB() {
  /** Gracefully disconnect mongoose if connected. */
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};
