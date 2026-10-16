import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inventory_db';
  
  try {
    // Attempt connecting to the provided MongoDB URI with a short timeout
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log(`[Database] Connected successfully to MongoDB: ${mongoose.connection.host}`);
    return { isInMemory: false, uri };
  } catch (err) {
    console.warn(`[Database] Could not connect to local/external MongoDB (${err.message}).`);
    console.log('[Database] Initializing high-performance MongoDB In-Memory Server fallback...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const inMemoryUri = memoryServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to MongoDB In-Memory Server: ${inMemoryUri}`);
      return { isInMemory: true, uri: inMemoryUri };
    } catch (memErr) {
      console.error('[Database] Failed to start MongoDB In-Memory Server:', memErr.message);
      throw memErr;
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
