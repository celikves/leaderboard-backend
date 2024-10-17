const cron = require('node-cron');
const leaderboardService = require('../services/leaderboardService');
const playerService = require('../services/playerService');
const logger = require('../logger');

// Cronjob to run every Sunday at 23:59:59
cron.schedule('59 59 23 * * 0', async () => {  // Run every Sunday at 23:59:59
    logger.info('Running weekly prize pool distribution...');

    try {
        // Calculate the total prize pool (2% of total earnings)
        const { totalPrize } = await leaderboardService.calculateTotalPrize();

        // Fetch the top 100 players
        const top100 = await leaderboardService.getTopPlayers(100);

        if (!top100 || top100.length < 2) {
            logger.warn("Not enough players in the leaderboard.");
            return;
        }

        logger.info(`Total Prize (2%): ${totalPrize}`);

        // Top 3 prize distribution
        const prizeDistribution = {
            1: 0.20, // 20% for 1st
            2: 0.15, // 15% for 2nd
            3: 0.10  // 10% for 3rd
        };

        let remainingPool = totalPrize;

        // Distribute prizes for 1st, 2nd, and 3rd place
        for (let i = 0; i < 3; i++) {
            const playerId = top100[i].playerId;
            const prize = totalPrize * prizeDistribution[i + 1];
            remainingPool -= prize;

            // Update player with prize in MongoDB
            await playerService.updatePlayer(playerId, { $inc: { totalPrize: prize } });
            logger.info(`Player ${playerId} awarded ${prize} for position ${i + 1}`);
        }

        // Distribute remaining pool to players ranked 4th-100th
        let descendingPercentage = 0.05; // Start with 5% for 4th place
        const percentageDecrement = (0.05 - 0.001) / 96;  // Decrement progressively from 4th to 100th

        for (let i = 3; i < top100.length; i++) {
            const playerId = top100[i].playerId;
            const prize = remainingPool * descendingPercentage;
            descendingPercentage -= percentageDecrement;

            // Update player with prize in MongoDB
            await playerService.updatePlayer(playerId, { $inc: { totalPrize: prize } });
        }

        // Reset earnings after prize pool distribution
        await leaderboardService.resetEarnings();
        // TODO : Store all players in the leaderboard 
        // await leaderboardService.storeAllPlayers();
        logger.info('Weekly prize pool distribution complete, earnings reset.');

    } catch (error) {
        logger.error(`Error during prize pool distribution: ${error.message}`);
    }
});
