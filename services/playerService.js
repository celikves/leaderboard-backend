const Player = require('../models/Player');

// Add a new player
async function addPlayer(playerData) {
    const newPlayer = new Player(playerData);
    return await newPlayer.save();
}

// Update an existing player using playerId (custom ID)
async function updatePlayer(playerId, updates) {
    return await Player.findOneAndUpdate({ playerId }, updates, { new: true, runValidators: true });
}

// Delete a player using playerId
async function deletePlayer(playerId) {
    return await Player.findOneAndDelete({ playerId });
}

// Get a player by playerId
async function getPlayerById(playerId) {
    return await Player.findOne({ playerId });
}

// async function getPlayerById(playerId) {
//     return Player.findOne({ playerId: playerId });
// }

// Get all players
async function getAllPlayers() {
    return await Player.find();
}

// Paginated player retrieval
async function getPlayersWithPagination(page, limit) {
    const players = await Player.find()
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const count = await Player.countDocuments();
    return {
        players,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
}

module.exports = {
    addPlayer,
    updatePlayer,
    deletePlayer,
    getPlayerById,
    getAllPlayers,
    getPlayersWithPagination
};
