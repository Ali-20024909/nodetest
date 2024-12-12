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

