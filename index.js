const express = require('express');
const connectDB = require('./db');
require('dotenv').config();
const morgan = require('morgan');
const logger = require('./logger');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Middleware to parse JSON request bodies
app.use(express.json()); 

connectDB();

const playerRoutes = require('./routes/player');
app.use('/players', playerRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

