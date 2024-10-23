const Player = require('../models/Player');

async function addPlayer(playerData) {
    const newPlayer = new Player(playerData);
    return await newPlayer.save();
}

async function updatePlayer(playerId, updates) {
    return await Player.findOneAndUpdate({ playerId }, updates, { new: true, runValidators: true });
}

async function deletePlayer(playerId) {
    return await Player.findOneAndDelete({ playerId });
}

async function getPlayerById(playerId) {
    return await Player.findOne({ playerId });
}

async function getAllPlayers() {
    return await Player.find();
}

async function updateAllPlayers(updateFields) {
    return await Player.updateMany({}, { $set: updateFields });
}

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
    updateAllPlayers,
    getPlayersWithPagination
};
