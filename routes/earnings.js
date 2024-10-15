const express = require('express');
const Player = require('../models/Player');
const router = express.Router();

router.post('/earnings', async (req, res) => {
  const { playerId, earnings } = req.body;

  try {
    const player = await Player.findOne({ playerId });
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    player.totalEarnings += earnings;
    player.weeklyEarnings += earnings;
    await player.save();

    res.json({ message: 'Earnings updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
