// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const currencyRoutes = require('./routes/currencyRoutes');

// dotenv.config();
// const app = express();

// // Middleware
// app.use(bodyParser.json());
// app.use('/api/currencies', currencyRoutes);
// app.use(express.static('public'));

// // MongoDB Connection
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));

// // Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// DOM Elements
const elements = {
  emailInput: document.getElementById('emailInput'),
  passwordInput: document.getElementById('passwordInput'),
  continueButton: document.getElementById('continueButton'),
  loadingOverlay: document.getElementById('loadingOverlay')
};

// API Configuration
const API_URL = 'http://localhost:3000'; // Update this with your actual API URL

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  setupAuthListeners();
  setupPasswordToggle();
  
  // Check for existing token
  const token = localStorage.getItem('authToken');
  if (token) {
      window.location.href = 'index.html';
  }
});