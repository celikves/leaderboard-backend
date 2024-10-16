const express = require('express');
const { body, validationResult } = require('express-validator');
const Player = require('../models/Player');
const router = express.Router();
const mongoose = require('mongoose');

const validatePlayer = [
  body('playerId').notEmpty().trim().escape(),
  body('name').notEmpty().trim().escape(),
  body('country').notEmpty().trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const missingFields = errors.array().map((error) => error.param);
      return res.status(400).json({
        message: 'Missing required field(s)',
        fields: missingFields,
      });
    }
    next();
  }
];

router.post(
  '/add',
  [
    body('name').not().isEmpty().trim().escape(),
    body('country').not().isEmpty().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const missingFields = errors.array().map((error) => error.path);

      return res.status(400).json({
        message: 'Missing required field(s)',
        fields: missingFields
      });
    }

    const { name, country } = req.body;

    try {
      // let existingPlayer = await Player.findOne({ playerId });
      // if (existingPlayer) {
      //   return res.status(400).json({ message: 'Player with this ID already exists' });
      // }

      const newPlayer = new Player({
        name,
        country,
      });

      await newPlayer.save();

      res.status(201).json({ 
        message: 'Player added successfully!', 
        player: newPlayer,
        playerId: newPlayer._id
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/:playerId', async (req, res) => {
  const { playerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    return res.status(400).json({ message: 'Invalid playerId format' });
  }

  try {
    const player = await Player.findById(playerId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
