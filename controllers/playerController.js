const playerService = require('../services/playerService');
const logger = require('../logger');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const addPlayer = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const missingFields = errors.array().map((error) => error.param);
        logger.warn(`Missing fields: ${missingFields.join(', ')}`);
        return res.status(400).json({
            message: 'Missing required field(s)',
            fields: missingFields
        });
    }

    const { name, country } = req.body;

    try {
        const newPlayer = await playerService.addPlayer({ name, country });
        logger.info(`Player added: ${newPlayer.playerId}`);
        res.status(201).json({
            message: 'Player added successfully!',
            player: newPlayer
        });
    } catch (error) {
        logger.error(`Server error: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPlayerById = async (req, res) => {
    const { playerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
        logger.error(`Invalid playerId: ${playerId}`);
        return res.status(400).json({ message: 'Invalid playerId format' });
    }

    try {
        const player = await playerService.getPlayerById(playerId);
        if (!player) {
            logger.warn(`Player not found: ${playerId}`);
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json(player);
    } catch (error) {
        logger.error(`Server error: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePlayer = async (req, res) => {
    const { playerId } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
        logger.error(`Invalid playerId: ${playerId}`);
        return res.status(400).json({ message: 'Invalid playerId format' });
    }

    try {
        const updatedPlayer = await playerService.updatePlayer(playerId, updates);
        if (!updatedPlayer) {
            logger.warn(`Player not found: ${playerId}`);
            return res.status(404).json({ message: 'Player not found' });
        }
        logger.info(`Player updated: ${updatedPlayer.playerId}`);
        res.status(200).json({ message: 'Player updated successfully', player: updatedPlayer });
    } catch (error) {
        logger.error(`Server error: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePlayer = async (req, res) => {
    const { playerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
        logger.error(`Invalid playerId: ${playerId}`);
        return res.status(400).json({ message: 'Invalid playerId format' });
    }

    try {
        const deletedPlayer = await playerService.deletePlayer(playerId);
        if (!deletedPlayer) {
            logger.warn(`Player not found: ${playerId}`);
            return res.status(404).json({ message: 'Player not found' });
        }
        logger.info(`Player deleted: ${deletedPlayer.playerId}`);
        res.status(200).json({ message: 'Player deleted successfully' });
    } catch (error) {
        logger.error(`Server error: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllPlayers = async (req, res) => {
    try {
        const players = await playerService.getAllPlayers();
        logger.info('Players retrieved');
        res.status(200).json(players);
    } catch (error) {
        logger.error(`Server error: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPlayersWithPagination = async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    try {
        const result = await playerService.getPlayersWithPagination(page, limit);
        logger.info(`Players retrieved with pagination. Page: ${page}, Limit: ${limit}`);
        res.status(200).json(result);
    } catch (error) {
        logger.error(`Server error: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addPlayer,
    getPlayerById,
    updatePlayer,
    deletePlayer,
    getAllPlayers,
    getPlayersWithPagination
};
