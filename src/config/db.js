import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);
mongoose.set('bufferTimeoutMS', 500);

/**
 * Safely migrate legacy unconditional unique indexes on schools and users
 * to partial unique indexes ({ isDeleted: false }).
 */
export const syncDatabaseIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    // 1. Schools collection index migration
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.includes('schools')) {
      const schoolCollection = db.collection('schools');
      const schoolIndexes = await schoolCollection.indexes();

      for (const idx of schoolIndexes) {
        // Drop legacy non-partial schoolCode_1 unique index
        if (idx.name === 'schoolCode_1' && idx.unique && !idx.partialFilterExpression) {
          logger.info('🔄 Dropping legacy non-partial index schoolCode_1 on schools...');
          await schoolCollection.dropIndex('schoolCode_1');
        }
        // Drop legacy non-partial email_1 index if it conflicts with partial unique index
        if (idx.name === 'email_1' && !idx.partialFilterExpression) {
          logger.info('🔄 Dropping legacy non-partial index email_1 on schools...');
          await schoolCollection.dropIndex('email_1');
        }
      }
    }

    // 2. Users collection index migration
    if (collectionNames.includes('users')) {
      const userCollection = db.collection('users');
      const userIndexes = await userCollection.indexes();

      for (const idx of userIndexes) {
        // Drop legacy non-partial email_1 unique index
        if (idx.name === 'email_1' && idx.unique && !idx.partialFilterExpression) {
          logger.info('🔄 Dropping legacy non-partial index email_1 on users...');
          await userCollection.dropIndex('email_1');
        }
      }
    }

    // 3. Build/recreate partial unique indexes defined in Mongoose schemas
    if (mongoose.models.School) {
      await mongoose.models.School.createIndexes();
    }
    if (mongoose.models.User) {
      await mongoose.models.User.createIndexes();
    }

    logger.info('✅ Partial unique indexes verified and synchronized.');
  } catch (error) {
    logger.warn(`⚠️ Safe index sync notice: ${error.message}`);
  }
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    await syncDatabaseIndexes();
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB disconnected');
};
