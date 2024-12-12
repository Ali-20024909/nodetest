// const express = require('express');
// const router = express.Router();
// const CurrencyPair = require('./CurrencyPair');

// // Create
// router.post('/add', async (req, res) => {
//   try {
//     const { baseCurrency, targetCurrency, exchangeRate } = req.body;
//     const newPair = new CurrencyPair({ baseCurrency, targetCurrency, exchangeRate });
//     await newPair.save();
//     res.json({ message: 'Currency pair added successfully!', data: newPair });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Read
// router.get('/list', async (req, res) => {
//   try {
//     const pairs = await CurrencyPair.find();
//     res.json(pairs);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update
// router.put('/update/:id', async (req, res) => {
//   try {
//     const updatedPair = await CurrencyPair.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json({ message: 'Currency pair updated!', data: updatedPair });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete
// router.delete('/delete/:id', async (req, res) => {
//   try {
//     await CurrencyPair.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Currency pair deleted!' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const API_URL = 'http://localhost:3000';

// DOM Elements
const elements = {
    tableView: document.getElementById('tableView'),
    editDialog: document.getElementById('editDialog'),
    filtersGrid: document.querySelector('.filters-grid'),
    searchInput: document.getElementById('searchInput')
};
let clients = [];
let currentFilter = 'all';
let searchQuery = '';
// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    loadClients();
    setupFilterListeners();
    setupSearch();
});
function setupSearch() {
    elements.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        applyFiltersAndSearch();
    });
}

function applyFiltersAndSearch() {
    let filteredClients = clients;
    
    // Apply project type filter
    if (currentFilter !== 'all') {
        filteredClients = filteredClients.filter(client => 
            client.project_type.toLowerCase().includes(currentFilter.toLowerCase())
        );
    }
    

    // Apply search
    if (searchQuery) {
        filteredClients = filteredClients.filter(client => 
            client.name.toLowerCase().includes(searchQuery) ||
            client.contact_person.toLowerCase().includes(searchQuery)
        );
    }
    
    renderClients(filteredClients);
}

function closeEditDialog() {
    elements.editDialog.style.display = 'none';
}

async function loadClients() {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_URL}/api/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch clients');
        }

        clients = await response.json();
        renderClients(clients);
    } catch (error) {
        console.error('Error loading clients:', error);
        alert('Failed to load clients. Please try again.');
    }
}

function renderClients(clientsToRender) {
    const tableHTML = `
        <table class="clients-table">
            <thead>
                <tr>
                    <th>Company</th>
                    <th>Contact Person</th>
                    <th>Project Type</th>
                    <th>Budget</th>
                    <th>Starting Date</th>
                    <th>Deadline</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${clientsToRender.length === 0 ? 
                    `<tr><td colspan="7" class="no-results">No clients found</td></tr>` :
                    clientsToRender.map(client => `
                    <tr>
                        <td>${client.name}</td>
                        <td>${client.contact_person}</td>
                        <td>${client.project_type}</td>
                        <td>${formatCurrency(client.project_budget)}</td>
                        <td>${formatDate(client.starting_date)}</td>
                        <td>${formatDate(client.deadline)}</td>
                        <td>
                            <button onclick="editClient(${client.id})" class="edit-btn">Edit</button>
                            <button onclick="deleteClient(${client.id})" class="delete-btn">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    elements.tableView.innerHTML = tableHTML;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function setupFilterListeners() {
    const filters = ['all', 'web', 'mobile', 'desktop', 'cloud'];
    filters.forEach(filter => {
        document.querySelector(`[data-filter="${filter}"]`)?.addEventListener('click', (e) => {
            // Remove active class from all filters
            document.querySelectorAll('.filter-btn').forEach(btn => 
                btn.classList.remove('active')
            );
            // Add active class to clicked filter
            e.target.classList.add('active');
            filterClients(filter);
        });
    });
}

function filterClients(filter) {
    currentFilter = filter;
    applyFiltersAndSearch();
}

async function editClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    elements.editDialog.style.display = 'flex';
    
    // Fill the edit form with client data
    document.getElementById('editName').value = client.name;
    document.getElementById('editContact').value = client.contact_person;
    document.getElementById('editType').value = client.project_type;
    document.getElementById('editBudget').value = client.project_budget;
    document.getElementById('editStartDate').value = client.starting_date;
    document.getElementById('editDeadline').value = client.deadline;

    // Setup save handler
    document.getElementById('saveChanges').onclick = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const updatedData = {
                name: document.getElementById('editName').value,
                contact_person: document.getElementById('editContact').value,
                project_type: document.getElementById('editType').value,
                project_budget: parseFloat(document.getElementById('editBudget').value),
                starting_date: document.getElementById('editStartDate').value,
                deadline: document.getElementById('editDeadline').value
            };

            const response = await fetch(`${API_URL}/api/clients/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) throw new Error('Failed to update client');

            // Add activity for edit
            await addActivity(`Updated client: ${updatedData.name}`);

            elements.editDialog.style.display = 'none';
            loadClients();
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Failed to update client. Please try again.');
        }
    };
}