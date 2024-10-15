const express = require('express');
const Player = require('../models/Player');
const router = express.Router();

router.post('/add', async (req, res) => {
  const { playerId, name, country } = req.body;
  
  try {
    const newPlayer = new Player({
      playerId,
      name,
      country
    });

    await newPlayer.save();
    res.status(201).json({ message: 'Player added successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
