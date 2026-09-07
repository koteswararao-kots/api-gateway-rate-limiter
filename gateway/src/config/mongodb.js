const { MongoClient } = require('mongodb');

const client = new MongoClient(
  process.env.MONGODB_URL || 'mongodb://localhost:27017'
);

let db;

const connectMongoDB = async () => {
  try {
    await client.connect();

    db = client.db('api_gateway');

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('MongoDB is not connected');
  }

  return db;
};

module.exports = {
  connectMongoDB,
  getDB
};