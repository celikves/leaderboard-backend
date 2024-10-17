const cron = require('node-cron');
const playerService = require('../services/playerService');
const leaderboardService = require('../services/leaderboardService');
const logger = require('../logger');

// Cronjob to run every day at 23:59:59 to store yesterday's rank in MongoDB
cron.schedule('59 59 23 * * *', async () => {
    logger.info('Running daily rank capture...');

    try {
        // Fetch all players from MongoDB
        const players = await playerService.getAllPlayers();

        for (let player of players) {
            const playerId = player.playerId;

            // Get the player's current rank from Redis
            const currentRank = await leaderboardService.getPlayerRank(playerId);

            if (currentRank !== null) {
                // Store yesterdayRank in MongoDB for the player using playerId
                await playerService.updatePlayer(playerId, { yesterdayRank: currentRank });

                logger.info(`Player ${playerId} yesterdayRank updated: ${currentRank}`);
            }
        }

        logger.info('Daily rank capture complete.');
    } catch (error) {
        logger.error(`Error running daily rank capture: ${error.message}`);
    }
});