const mongoose = require('mongoose');

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dekkal';
    await mongoose.connect(uri);
    console.log('MongoDB connecté ->', uri);
  } catch (err) {
    console.error('Erreur de connexion MongoDB :', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
