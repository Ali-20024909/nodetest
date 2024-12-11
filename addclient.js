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
  if (!token) {
    alert("You must be logged in to add clients");
    window.location.href = 'login.html';
    return;
}

 // Get form values
 const clientName = document.getElementById('clientName').value.trim();
 const clientEmail = document.getElementById('clientEmail').value.trim();
 const clientContact = document.getElementById('clientContact').value.trim();
 const projectType = document.getElementById('projectType').value.trim();
 const projectBudget = document.getElementById('projectBudget').value.trim();
 const startingDate = document.getElementById('startDate').value.trim();
 const deadline = document.getElementById('deadline').value.trim();

  // Basic validation
  if (!clientName || !clientEmail || !clientContact || !projectType || !projectBudget) {
    alert("Please fill in all required fields before submitting.");
    return;
}

showLoading(true, loadingOverlay);


try {
  const response = await fetch(`${API_URL}/api/clients`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          contactPerson: clientContact,
          projectType: projectType,
          projectBudget: parseFloat(projectBudget),
          startingDate: startingDate,
          deadline: deadline
      })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add client');
}

// Clear form fields
document.getElementById('clientName').value = '';
document.getElementById('clientEmail').value = '';
document.getElementById('clientContact').value = '';
document.getElementById('projectType').value = '';
document.getElementById('projectBudget').value = '';
document.getElementById('startDate').value = '';
document.getElementById('deadline').value = '';
document.querySelectorAll('.project-type-box').forEach(box => box.classList.remove('selected'));

alert('Client added successfully!');
