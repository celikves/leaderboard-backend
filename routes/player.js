const express = require('express');
const { body } = require('express-validator');
const playerController = require('../controllers/playerController');

const router = express.Router();

// Player validation
const validatePlayer = [
  body('name').not().isEmpty().trim().escape(),
  body('country').not().isEmpty().trim().escape(),
];

// Routes
router.post('/add', validatePlayer, playerController.addPlayer);
router.get('/:playerId', playerController.getPlayerById);
router.put('/:playerId', playerController.updatePlayer);
router.delete('/:playerId', playerController.deletePlayer);
router.get('/', playerController.getAllPlayers);
router.get('/paginate', playerController.getPlayersWithPagination);

module.exports = router;