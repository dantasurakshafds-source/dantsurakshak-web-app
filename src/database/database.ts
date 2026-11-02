import mongoose from "mongoose";

//@ts-expect-error ignore this message
let cached = global.mongoose;

if (!cached) {
   //@ts-expect-error ignore this message

  cached = global.mongoose = { conn: null, promise: null };
}

export async function dbConnect(): Promise<typeof mongoose> {
  let MONGODB_URI = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();

  // Strip accidental surrounding single or double quotes
  MONGODB_URI = MONGODB_URI.replace(/^["']|["']$/g, '').trim();

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in your .env file');
  }

  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    console.error(`Invalid MONGODB_URI scheme in environment: "${MONGODB_URI.substring(0, 25)}..."`);
    throw new Error(`Invalid scheme in MONGODB_URI. Expected string starting with "mongodb://" or "mongodb+srv://", but got: "${MONGODB_URI.substring(0, 25)}..."`);
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
    };
 
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error);
      throw error;
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

 
declare global {
  let mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}