const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');

const router = express.Router();

// Get leaderboard
router.get('/', leaderboardController.getLeaderboard);

// Add earnings for a specific player
router.post('/add-earnings/:playerId', leaderboardController.addEarnings);

module.exports = router;
