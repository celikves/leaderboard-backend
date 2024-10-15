const express = require('express');
const Player = require('../models/Player');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const topPlayers = await Player.find().sort({ weeklyEarnings: -1 }).limit(100);
    res.json(topPlayers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
