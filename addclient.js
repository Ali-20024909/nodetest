// //const mongoose = require('mongoose');

// const uri = 'mongodb+srv://Ali:Nexus143.@clustername.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Database connected successfully!'))
//   .catch(err => console.error('Database connection error:', err));
//   const connectToDatabase = require('./models/db'); // Import the connection logic

//   // Call the connection function to test the connection
//   connectToDatabase().catch(console.error);
  // API Configuration
const API_URL = 'http://localhost:3000';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
});

function showLoading(show, loadingOverlay) {
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

async function addClient() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  const token = localStorage.getItem('authToken');