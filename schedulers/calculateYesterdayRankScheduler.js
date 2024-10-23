const cron = require('node-cron');
const playerService = require('../services/playerService');
const leaderboardService = require('../services/leaderboardService');
const logger = require('../logger');

cron.schedule('59 59 23 * * 1-6', async () => {
    await calculateYesterdayRank();
});

async function calculateYesterdayRank() {
    logger.info('Running daily rank capture...');

    try {
        const players = await playerService.getAllPlayers();

        for (let player of players) {
            const playerId = player.playerId.toString();

            const currentRank = await leaderboardService.getPlayerRank(playerId);

            if (currentRank !== null) {
                await playerService.updatePlayer(playerId, { yesterdayRank: currentRank });
                logger.info(`Player ${playerId} yesterdayRank updated: ${currentRank}`);
            }
        }

        logger.info('Daily rank capture complete.');
    } catch (error) {
        logger.error(`Error running daily rank capture: ${error.message}`);
    }
}

module.exports = {
    calculateYesterdayRank,
};