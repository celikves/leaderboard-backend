const express = require('express');
const { body, validationResult } = require('express-validator');
const Player = require('../models/Player');
const router = express.Router();

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
    body('playerId').not().isEmpty().trim().escape(),
    body('name').not().isEmpty().trim().escape(),
    body('country').not().isEmpty().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    console.log(validationResult(req));
    if (!errors.isEmpty()) {
      const missingFields = errors.array().map((error) => error.path);

      return res.status(400).json({
        message: 'Missing required field(s)',
        fields: missingFields
      });
    }

    const { playerId, name, country } = req.body;

    try {
      let existingPlayer = await Player.findOne({ playerId });
      if (existingPlayer) {
        return res.status(400).json({ message: 'Player with this ID already exists' });
      }

      const newPlayer = new Player({
        playerId,
        name,
        country,
      });

      await newPlayer.save();

      res.status(201).json({ message: 'Player added successfully!', player: newPlayer });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
