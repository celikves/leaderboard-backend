const redisClient = require('../database/redis');
const playerService = require('./playerService');


// Get the top players from Redis (Leaderboard)
async function getTopPlayers(limit) {
    try {
        const leaderboardData = await redisClient.zRange('leaderboard_earnings', 0, limit - 1, { REV: true, WITHSCORES: true });

        const leaderboard = [];
        for (let i = 0; i < leaderboardData.length; i += 2) {
            const playerId = leaderboardData[i];
            const earnings = parseFloat(leaderboardData[i + 1]);

            const playerDetails = await playerService.getPlayerById(playerId);

            leaderboard.push({
                playerId,
                earnings,
                rank: i / 2 + 1,
                name: playerDetails ? playerDetails.name : 'Unknown',
                country: playerDetails ? playerDetails.country : 'Unknown'
            });
        }

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw error; 
    }
}

// Add earnings for a player in Redis
async function addEarnings(playerId, earnings) {
    await redisClient.zAdd('leaderboard_earnings', { score: earnings, value: playerId });

    const currentRank = await redisClient.zRevRank('leaderboard_earnings', playerId);

    if (currentRank !== null) {
        const player = await playerService.getPlayerById(playerId);

        if (player && player.yesterdayRank !== undefined) {
            const dailyDiff = player.yesterdayRank - currentRank;

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

async function storeDailyDiff(playerId, dailyDiff) {
    await redisClient.set(`${playerId}:dailyDiff`, dailyDiff);
}

async function getPlayerRank(playerId) {
    return redisClient.zRevRank('leaderboard_earnings', playerId);
}

async function resetEarnings() {
    return redisClient.del('leaderboard_earnings');
}

async function calculateTotalPrize() {
    const earnings = await redisClient.zRangeWithScores('leaderboard_earnings', 0, -1);
    let totalEarnings = 0;

    earnings.forEach(player => {
        totalEarnings += player.score;
    });

    const totalPrize = totalEarnings * 0.02;
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
