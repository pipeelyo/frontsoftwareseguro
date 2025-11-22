import mongoose from 'mongoose';


/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cachedConnection: typeof mongoose | null = null;

async function dbConnect() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const opts = {
      bufferCommands: false,
    };
    cachedConnection = await mongoose.connect(MONGO_URI!, opts);
    return cachedConnection;
  } catch (e) {
    throw e;
  }
}

export default dbConnect;
