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
  if (!MONGO_URI) {
    // During build, MONGO_URI might be undefined. Return null to avoid crashing.
    if (process.env.NODE_ENV === 'production') {
      console.warn('MONGO_URI is not defined. Database connection will not be established.');
      return null;
    }
    throw new Error('Please define the MONGO_URI environment variable inside .env.local');
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
