const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const PlayerSchema = new Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  country: { type: String, required: true },
  yesterdayRank: { type: Number, default: 0 },
  totalPrize: { type: Number, default: 0 }
});

PlayerSchema.index({ playerId: 1 });

module.exports = model('Player', PlayerSchema);
