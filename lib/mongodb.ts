import mongoose, { Connection } from "mongoose";

// MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

// Validate that MONGODB_URI is defined
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

/**
 * Global type declaration to cache the Mongoose connection across hot reloads
 * in development. This prevents creating multiple connections.
 */
interface MongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

// Extend the global object to include our mongoose cache
declare global {
   
  var mongoose: MongooseCache | undefined;
}

// Initialize the cached connection object
const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

// Persist the cache in development to survive hot reloads
if (process.env.NODE_ENV !== "production") {
  global.mongoose = cached;
}

/**
 * Connects to MongoDB using Mongoose with connection caching.
 * Reuses existing connection if available, otherwise creates a new one.
 * @returns Promise resolving to the Mongoose connection
 */
async function connectToDatabase(): Promise<Connection> {
  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable buffering for better error handling
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose.connection;
    });
  }

  // Wait for connection and cache it
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
