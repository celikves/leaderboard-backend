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
const connectDB = require('./db'); // Your MongoDB connection via Mongoose
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json()); // This will allow your app to parse incoming JSON requests

// Connect to MongoDB
connectDB();

const playerRoutes = require('./routes/player');  // Import player routes
app.use('/players', playerRoutes);  // Use the routes under '/players' path


// Define a simple route to test the server
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import your routes here (example: users)
// const userRoutes = require('./routes/user');
// app.use('/users', userRoutes); // Uncomment once you add your routes

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

