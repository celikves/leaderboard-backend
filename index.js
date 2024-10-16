// index.js
// const express = require('express');
// const connectDB = require('./db');
// require('dotenv').config(); // If you are using environment variables

// const app = express();

// // Connect to MongoDB
// connectDB();

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require('express');
const connectDB = require('./db');
require('dotenv').config();
const morgan = require('morgan');
const logger = require('./logger');

const app = express();

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Middleware to parse JSON request bodies
app.use(express.json()); // This will allow your app to parse incoming JSON requests

// Connect to MongoDB
connectDB();

const playerRoutes = require('./routes/player');
app.use('/players', playerRoutes);


app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import your routes here (example: users)
// const userRoutes = require('./routes/user');
// app.use('/users', userRoutes); // Uncomment once you add your routes

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

