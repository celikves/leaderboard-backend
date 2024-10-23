const redisClient = require('../database/redis');
const playerService = require('./playerService');


async function getLeaderboard(playerId) {
    try {
        const leaderboardData = await redisClient.zRangeWithScores('leaderboard_earnings', 0, -1);

        leaderboardData.reverse();

        const top100Data = leaderboardData.slice(0, 100);
        let leaderboard = [];

        for (let i = 0; i < top100Data.length; i++) {
            const playerId = top100Data[i].value;
            const earnings = parseFloat(top100Data[i].score);

            const playerDetails = await playerService.getPlayerById(playerId);
            const dailyDiff = await getDailyDiff(playerId, playerDetails.yesterdayRank);

            leaderboard.push({
                playerId,
                earnings,
                rank: i + 1,
                name: playerDetails ? playerDetails.name : 'Unknown',
                country: playerDetails ? playerDetails.country : 'Unknown',
                dailyDiff: dailyDiff ? parseInt(dailyDiff) : 0
            });
        }

        if (playerId) {
            const playerRank = await getPlayerRank(playerId);
            if (playerRank !== null && playerRank >= 100) {
                const rangeStart = Math.max(0, playerRank - 3);
                const rangeEnd = Math.min(playerRank + 2, leaderboardData.length - 1);

                const surroundingData = leaderboardData.slice(rangeStart, rangeEnd + 1);

                for (let i = 0; i < surroundingData.length; i++) {
                    const playerId = surroundingData[i].value;
                    const earnings = parseFloat(surroundingData[i].score);

                    if (leaderboard.find(player => player.playerId === playerId)) {
                        continue;
                    }

                    const playerDetails = await playerService.getPlayerById(playerId);
                    const dailyDiff = await getDailyDiff(playerId, playerDetails.yesterdayRank);

                    leaderboard.push({
                        playerId,
                        earnings,
                        rank: rangeStart + i + 1,
                        name: playerDetails ? playerDetails.name : 'Unknown',
                        country: playerDetails ? playerDetails.country : 'Unknown',
                        dailyDiff: dailyDiff ? parseInt(dailyDiff) : 0
                    });
                }
            }
        }

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        throw error;
    }
}

async function getTop100Players() {
    try {
        const leaderboardData = await redisClient.zRangeWithScores('leaderboard_earnings', 0, -1);

        leaderboardData.reverse();

        leaderboardData.splice(100);

        const leaderboard = [];
        for (let i = 0; i < leaderboardData.length; i++) {
            const playerId = leaderboardData[i].value;

            leaderboard.push({
                playerId
            });
        }

        return leaderboard;
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        throw error;
    }
}

async function addEarnings(playerId, earnings) {
    const player = await playerService.getPlayerById(playerId);
    if (player == null) {
        return {
            message: 'Player does not exist in the database'
        };
    }

    await redisClient.zIncrBy('leaderboard_earnings', earnings, playerId);

    const currentRank = await getPlayerRank(playerId);

    if (currentRank === null) {
        return {
            message: 'Player is not in the leaderboard'
        };
    }
    return {
        currentRank,
    };
}

async function getPlayerRank(playerId) {
    const rank = await redisClient.zRevRank('leaderboard_earnings', playerId);
    if (rank === null) {
        return null;
    }

    return rank + 1;
}

async function resetEarnings() {
    try {
        await playerService.updateAllPlayers({ yesterdayRank: 0 });
        const leaderboardData = await redisClient.zRangeWithScores('leaderboard_earnings', 0, -1);

        for (let i = 0; i < leaderboardData.length; i++) {
            const playerId = leaderboardData[i].value;
            await redisClient.zAdd('leaderboard_earnings', { score: 0, value: playerId });
        }

        console.log('All player earnings have been reset to 0.');
    } catch (error) {
        console.error('Error resetting player earnings:', error);
    }
}

async function getDailyDiff(playerId, yesterdayRank) {
    const currentRank = await getPlayerRank(playerId);
    if (currentRank === null || yesterdayRank === null || yesterdayRank === 0) {
        return 0;
    }

    if (yesterdayRank === currentRank) {
        return 0;
    }

    return yesterdayRank - currentRank;
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
    addEarnings,
    getPlayerRank,
    resetEarnings,
    calculateTotalPrize,
    getLeaderboard,
    getTop100Players
};
