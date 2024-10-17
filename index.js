const express = require('express');
const connectDB = require('./database/mongodb');
const morgan = require('morgan');
const logger = require('./logger');
const cors = require('cors');

require('dotenv').config();
// Schedule cron jobs
require('./schedulers/weeklyPrizeScheduler');
require('./schedulers/dailyDiffScheduler');

const app = express();
const PORT = process.env.PORT || 3005;

// Database connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Routes
const playerRoutes = require('./routes/player');
const leaderboardRoutes = require('./routes/leaderboard');

app.use('/api/players', playerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});