const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PlayerSchema = new Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  country: { type: String, required: true },
  totalEarnings: { type: Number, default: 0 },
  weeklyEarnings: { type: Number, default: 0 },
  rank: { type: Number, default: null },
  dailyDiff: { type: Number, default: 0 }
});

module.exports = model('Player', PlayerSchema);
