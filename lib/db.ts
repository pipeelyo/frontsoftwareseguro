import mongoose from 'mongoose';

// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb-mongoose

// Extend the NodeJS global type to include our Mongoose connection cache
declare global {
  var _mongooseCache: {
    promise: ReturnType<typeof mongoose.connect> | null;
    conn: typeof mongoose | null;
  };
}


/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global._mongooseCache;

if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI || MONGO_URI.trim() === '' || (!MONGO_URI.startsWith('mongodb://') && !MONGO_URI.startsWith('mongodb+srv://'))) {
    // During build or if MONGO_URI is invalid, skip database connection
    console.warn('MONGO_URI is not defined, empty, or invalid. Database connection will not be established.');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}



export default dbConnect;
