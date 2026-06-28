const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let isMongoConnected = false;
const dataDir = path.join(__dirname, '../data');

// Ensure data directory exists for JSON fallback
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log('No MONGODB_URI found in environment variables. Falling back to local JSON database.');
    return { isMongoConnected: false };
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000 // Timeout after 2 seconds for faster local fallback
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    isMongoConnected = true;
    return { isMongoConnected: true };
  } catch (error) {
    console.log('\n==================================================');
    console.log('DATABASE MODE: Local JSON Files (Fallback)');
    console.log('Notice: Could not connect to local MongoDB server.');
    console.log('The application will use the local JSON file database.');
    console.log('\nTo use a live MongoDB cluster (e.g. MongoDB Atlas):');
    console.log('  1. Add your connection URI to `backend/.env` (MONGODB_URI)');
    console.log('  2. Ensure your user/password are correct in the URI');
    console.log('  3. In MongoDB Atlas, whitelist IP address 0.0.0.0/0 (or your current IP)');
    console.log('==================================================\n');
    isMongoConnected = false;
    return { isMongoConnected: false };
  }
};

const getDBType = () => isMongoConnected;

module.exports = { connectDB, getDBType, dataDir };
