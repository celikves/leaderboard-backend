const leaderboardService = require('../services/leaderboardService');
const logger = require('../logger');
const calculateYesterdayRankScheduler = require('../schedulers/calculateYesterdayRankScheduler');
const weeklyPrizeScheduler = require('../schedulers/weeklyPrizeScheduler');

const getLeaderboard = async (req, res) => {
    try {
        const { playerId } = req.params;

        const leaderboard = await leaderboardService.getLeaderboard(playerId);

        return res.json({ leaderboard });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send('Failed to retrieve leaderboard.');
    }
};

const addEarnings = async (req, res) => {
    const { playerId } = req.params;
    const { earnings } = req.body;

    if (!playerId || !earnings || isNaN(earnings)) {
        return res.status(400).json({ message: 'Invalid playerId or earnings value' });
    }

    try {
        const result = await leaderboardService.addEarnings(playerId, earnings);

        if (result.currentRank !== undefined) {
            logger.info(`Earnings updated for player ${playerId}: ${earnings}, Rank: ${result.currentRank}`);
            return res.status(200).json({
                message: `Earnings updated for player ${playerId}`,
                earnings,
                currentRank: result.currentRank,
            });
        } else {
            logger.warn(`Player ${playerId} not found in the leaderboard`);
            return res.status(404).json({ message: 'Player not found in the leaderboard' });
        }
    } catch (error) {
        logger.error(`Error adding earnings for player ${playerId}: ${error.message}`);
        res.status(500).json({ message: 'Failed to update earnings' });
    }
};

const calculateYesterdayRanks = async (req, res) => {
    try {
        await calculateYesterdayRankScheduler.calculateYesterdayRank();
        return res.status(200).send('Daily rank capture complete.');
    } catch (error) {
        logger.error(`Error running daily rank capture: ${error.message}`);
        res.status(500).send('Failed to run daily rank capture.');
    }
}

const weeklyPrizeSchedule = async (req, res) => {
    try {
        await weeklyPrizeScheduler.distributeWeeklyPrizes();
        return res.status(200).send('Weekly prize pool distribution complete.');
    } catch (error) {
        logger.error(`Error during prize pool distribution: ${error.message}`);
        res.status(500).send('Failed to distribute weekly prizes.');
    }
}

module.exports = {
    getLeaderboard,
    addEarnings,
    calculateYesterdayRanks,
    weeklyPrizeSchedule,
};
