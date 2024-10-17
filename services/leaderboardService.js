const redisClient = require('../database/redis');
const playerService = require('./playerService');


// Get the top players from Redis (Leaderboard)
async function getTopPlayers(limit) {
    try {
        const leaderboardData = await redisClient.zRange('leaderboard_earnings', 0, limit - 1, { REV: true, WITHSCORES: true });

        console.log('Leaderboard data:', leaderboardData);

        const leaderboard = [];
        for (let i = 0; i < leaderboardData.length; i += 2) {
            const playerId = leaderboardData[i];
            const earnings = parseFloat(leaderboardData[i + 1]);

            // Fetch player details from MongoDB
            const playerDetails = await playerService.getPlayerById(playerId);

            leaderboard.push({
                playerId,
                earnings,
                rank: i / 2 + 1, // Calculate the rank based on the index
                name: playerDetails ? playerDetails.name : 'Unknown',
                country: playerDetails ? playerDetails.country : 'Unknown'
            });
        }

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error; // Rethrow or handle as appropriate
    }
}

// Add earnings for a player in Redis
async function addEarnings(playerId, earnings) {
    // Add earnings in Redis
    await redisClient.zAdd('leaderboard_earnings', { score: earnings, value: playerId });

    // After adding earnings, fetch the new rank
    const currentRank = await redisClient.zRevRank('leaderboard_earnings', playerId);
    console.log('Current rank:', currentRank);

    if (currentRank !== null) {
        // Fetch yesterdayRank from MongoDB
        const player = await playerService.getPlayerById(playerId);

        if (player && player.yesterdayRank !== undefined) {
            const dailyDiff = player.yesterdayRank - currentRank;  // Calculate the daily diff

            // Store dailyDiff in Redis
            await storeDailyDiff(playerId, dailyDiff);

            return {
                currentRank,
                dailyDiff
            };
        }
    }

    return {
        message: 'Error calculating rank or dailyDiff'
    };
}

// Store dailyDiff in Redis
async function storeDailyDiff(playerId, dailyDiff) {
    await redisClient.set(`${playerId}:dailyDiff`, dailyDiff);
}

// Get a player's current rank
async function getPlayerRank(playerId) {
    return redisClient.zRevRank('leaderboard_earnings', playerId);
}

// Reset earnings (for cron job)
async function resetEarnings() {
    return redisClient.del('leaderboard_earnings');
}

// Calculate total prize (2% of total earnings)
async function calculateTotalPrize() {
    const earnings = await redisClient.zRangeWithScores('leaderboard_earnings', 0, -1);
    let totalEarnings = 0;

    earnings.forEach(player => {
        totalEarnings += player.score;
    });

    const totalPrize = totalEarnings * 0.02;  // 2% of total earnings
    return { totalPrize };
}

module.exports = {
    getTopPlayers,
    addEarnings,
    getPlayerRank,
    resetEarnings,
    calculateTotalPrize,
    storeDailyDiff
};
