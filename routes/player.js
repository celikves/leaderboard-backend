const express = require('express');
const { body, validationResult } = require('express-validator');
const Player = require('../models/Player');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../logger');

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

      logger.warn(`Missing fields: ${missingFields.join(', ')}`);
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
      logger.info(`Player added: ${newPlayer._id}`);

      res.status(201).json({ 
        message: 'Player added successfully!', 
        player: newPlayer,
        playerId: newPlayer._id
      });
    } catch (error) {
      console.error(error);
      logger.error(`Server error: ${error.message}`);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/:playerId', async (req, res) => {
  const { playerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    logger.error(`Invalid playerId: ${playerId}`);
    return res.status(400).json({ message: 'Invalid playerId format' });
  }

  try {
    const player = await Player.findById(playerId);
    if (!player) {
      logger.warn(`Player not found: ${playerId}`); 
      return res.status(404).json({ message: 'Player not found' });
    }

    res.status(200).json(player);
  } catch (error) {
    console.error(error);
    logger.error(`Server error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:playerId', async (req, res) => {
  const { playerId } = req.params;
  const { name, country, totalEarnings, weeklyEarnings, rank, dailyDiff } = req.body;

  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    logger.warn(`Invalid playerId format: ${playerId}`);
    return res.status(400).json({ message: 'Invalid playerId format' });
  }

  try {
    const updatedPlayer = await Player.findByIdAndUpdate(
      playerId,
      { name, country, totalEarnings, weeklyEarnings, rank, dailyDiff },
      { new: true, runValidators: true }
    );

    if (!updatedPlayer) {
      logger.warn(`Player not found: ${playerId}`);
      return res.status(404).json({ message: 'Player not found' });
    }

    logger.info(`Player retrieved: ${playerId}`);
    res.status(200).json({ message: 'Player updated successfully', player: updatedPlayer });
  } catch (error) {
    console.error(error);
    logger.error(`Server error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:playerId', async (req, res) => {
  const { playerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    logger.warn(`Invalid playerId format: ${playerId}`);
    return res.status(400).json({ message: 'Invalid playerId format' });
  }

  try {
    const deletedPlayer = await Player.findByIdAndDelete(playerId);
    if (!deletedPlayer) {
      logger.warn(`Player not found: ${playerId}`);
      return res.status(404).json({ message: 'Player not found' });
    }

    logger.info(`Player deleted: ${playerId}`);
    res.status(200).json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const players = await Player.find();
    logger.info('Players retrieved');
    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    logger.error(`Server error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
router.get('/', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const players = await Player.find()
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Player.countDocuments();
    logger.info(`Players retrieved with pagination. Page: ${page}, Limit: ${limit}`);

    res.status(200).json({
      players,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    logger.error(`Server error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});
*/

module.exports = router;
