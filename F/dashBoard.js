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

function formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
        return 'unknown time';
    }

    // More precise time calculations
    if (diffInSeconds < 30) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    
    // Format the date if it's older than a week
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

async function loadRecentActivity() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/dashboard/activity`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to load activity');

        const activities = await response.json();

        if (activities.length === 0) {
            elements.activityList.innerHTML = '<div class="activity-item">No recent activity</div>';
            return;
        }

        elements.activityList.innerHTML = activities.map(activity => {
            // Ensure timestamp is properly formatted
            const timestamp = activity.timestamp ? new Date(activity.timestamp).toISOString() : null;
            return `
                <div class="activity-item" data-id="${activity.id}">
                    <div class="activity-content">
                        <p>${activity.activity}</p>
                        <span class="activity-time">${timestamp ? formatRelativeTime(timestamp) : 'unknown time'}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading activity:', error);
        elements.activityList.innerHTML = '<div class="activity-item">Failed to load activity</div>';
    }
}

function confirmSignOut() {
    if (confirm("Are you sure you want to logout?")) {
        signOut(); 
    }
}
