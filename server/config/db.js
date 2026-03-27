const mongoose = require('mongoose');

/**
 * Connect to Persistent MongoDB using connection string
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartwaste';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected securely to:', uri.split('@').pop().split('?')[0]);
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };
