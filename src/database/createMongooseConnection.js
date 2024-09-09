const mongoose = require('mongoose');
const envs = require('../utils/env');

const createConnection = async () => {
  try {
    await mongoose.connect(envs.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

module.exports = createConnection;
