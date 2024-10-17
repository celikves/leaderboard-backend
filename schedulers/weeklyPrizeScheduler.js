const cron = require('node-cron');
const leaderboardService = require('../services/leaderboardService');
const playerService = require('../services/playerService');
const logger = require('../logger');

// Cronjob to run every Sunday at 23:59:59
cron.schedule('59 59 23 * * 0', async () => {  // Run every Sunday at 23:59:59
    logger.info('Running weekly prize pool distribution...');

    try {
        const { totalPrize } = await leaderboardService.calculateTotalPrize();

        const top100 = await leaderboardService.getTopPlayers(100);

        if (!top100 || top100.length < 2) {
            logger.warn("Not enough players in the leaderboard.");
            return;
        }

        logger.info(`Total Prize (2%): ${totalPrize}`);

        const prizeDistribution = {
            1: 0.20,
            2: 0.15,
            3: 0.10 
        };

        let remainingPool = totalPrize;

        for (let i = 0; i < 3; i++) {
            const playerId = top100[i].playerId;
            const prize = totalPrize * prizeDistribution[i + 1];
            remainingPool -= prize;

            await playerService.updatePlayer(playerId, { $inc: { totalPrize: prize } });
            logger.info(`Player ${playerId} awarded ${prize} for position ${i + 1}`);
        }

        let descendingPercentage = 0.05;
        const percentageDecrement = (0.05 - 0.001) / 96;

        for (let i = 3; i < top100.length; i++) {
            const playerId = top100[i].playerId;
            const prize = remainingPool * descendingPercentage;
            descendingPercentage -= percentageDecrement;

            await playerService.updatePlayer(playerId, { $inc: { totalPrize: prize } });
        }

        await leaderboardService.resetEarnings();
        // TODO : Store all players in the leaderboard 
        // await leaderboardService.storeAllPlayers();
        logger.info('Weekly prize pool distribution complete, earnings reset.');

    } catch (error) {
        logger.error(`Error during prize pool distribution: ${error.message}`);
    }
});
