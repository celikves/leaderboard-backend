const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/:playerId', leaderboardController.getLeaderboard);

router.post('/add-earnings/:playerId', leaderboardController.addEarnings);

router.post('/calculateYesterdayRanks', leaderboardController.calculateYesterdayRanks);

router.post('/weeklyPrizeDistribution', leaderboardController.weeklyPrizeSchedule);

module.exports = router;
