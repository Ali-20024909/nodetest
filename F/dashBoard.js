// API Configuration
const API_URL = 'http://localhost:3000';

// DOM Elements
const elements = {
    userName: document.getElementById('userName'),
    totalRevenue: document.getElementById('totalRevenue'),
    totalClients: document.getElementById('totalClients'),
    totalProjects: document.getElementById('totalProjects'),
    completedProjects: document.getElementById('completedProjects'),
    activityList: document.getElementById('activityList')
};

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }


    