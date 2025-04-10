const mongoose = require('mongoose');

/**
 * Connects to MongoDB database
 * @returns {Promise} MongoDB connection promise
 */
const connectToMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Rethrow to stop app if DB connection fails
  }
};

module.exports = { connectToMongoDB }; 