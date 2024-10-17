const leaderboardService = require('../services/leaderboardService');
const logger = require('../logger');


// Get the leaderboard with optional playerId for surrounding ranks
const getLeaderboard = async (req, res) => {
    try {
        const { playerId } = req.query; // Optional playerId parameter

        // Fetch top 100 players
        const top100 = await leaderboardService.getTopPlayers(100);

        // If playerId is provided, calculate surrounding players
        if (playerId) {
            const playerRank = await leaderboardService.getPlayerRank(playerId);
            if (playerRank >= 100) {
                const start = Math.max(0, playerRank - 3);
                const end = playerRank + 2;
                const surroundingPlayers = await leaderboardService.getTopPlayers(start, end);
                return res.json({ top100, surroundingPlayers });
            }
        }

        console.log('Top 100:', top100);

        res.json({ top100 });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send('Failed to retrieve leaderboard.');
    }
};
// Add earnings for a player
const addEarnings = async (req, res) => {
    const { playerId } = req.params;  // playerId from request params
    const { earnings } = req.body;

    if (!playerId || !earnings || isNaN(earnings)) {
        return res.status(400).json({ message: 'Invalid playerId or earnings value' });
    }

    try {
        const result = await leaderboardService.addEarnings(playerId, earnings);

        if (result.currentRank !== undefined && result.dailyDiff !== undefined) {
            logger.info(`Earnings updated for player ${playerId}: ${earnings}, Rank: ${result.currentRank}, Daily Diff: ${result.dailyDiff}`);
            return res.status(200).json({
                message: `Earnings updated for player ${playerId}`,
                earnings,
                currentRank: result.currentRank,
                dailyDiff: result.dailyDiff
            });
        } else {
            return res.status(500).json({ message: 'Failed to update daily diff' });
        }
    } catch (error) {
        logger.error(`Error adding earnings for player ${playerId}: ${error.message}`);
        res.status(500).json({ message: 'Failed to update earnings' });
    }
};

module.exports = {
    getLeaderboard,
    addEarnings,
};