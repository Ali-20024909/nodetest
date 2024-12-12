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

function setupPasswordToggle() {
  const passwordInput = document.getElementById('passwordInput');
  const toggleButton = document.querySelector('.password-toggle');
  const toggleIcon = toggleButton.querySelector('i');

  toggleButton.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;

      if (type === 'password') {
          toggleIcon.className = 'fas fa-eye';
          toggleButton.classList.remove('showing');
      } else {
          toggleIcon.className = 'fas fa-eye-slash';
          toggleButton.classList.add('showing');
      }

      passwordInput.focus();
  });
}
function setupAuthListeners() {
  elements.continueButton.addEventListener('click', handleLogin);
  elements.passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
  });
}

async function handleLogin() {
  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value;

  if (!email || !password) {
      alert('Please enter both email and password');
      return;
  }

  showLoading(true);

    try {
        // Try to login
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw { code: data.error };
        }
