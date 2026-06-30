const mongoose = require('mongoose');
require('dotenv').config(); // Make sure this is at the top of your file

const db = process.env.MONGO_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(db);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};
module.exports = connectDB;
