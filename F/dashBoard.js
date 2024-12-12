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

    try {
        // Verify token and load user data
        const userResponse = await fetch(`${API_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        loadUserData(userData);
        loadDashboardMetrics();
        loadRecentActivity();
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
});

function loadUserData(userData) {
    if (elements.userName) {
        elements.userName.textContent = userData.name || userData.email || 'User';
    }
}

async function loadDashboardMetrics() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/dashboard/metrics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load metrics');

        const metrics = await response.json();

        if (elements.totalClients) {
            elements.totalClients.textContent = metrics.totalClients;
        }
        if (elements.totalRevenue) {
            elements.totalRevenue.textContent = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(metrics.totalRevenue);
        }
        if (elements.totalProjects) {
            elements.totalProjects.textContent = metrics.totalProjects;
        }
        if (elements.completedProjects) {
            elements.completedProjects.textContent = metrics.completedProjects;
        }
    } catch (error) {
        console.error('Error loading metrics:', error);
    }
}
