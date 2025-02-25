const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  streamKey: { type: String, required: true, unique: true },
  hlsPath: { type: String }, // Path to stored HLS files
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stream', streamSchema);