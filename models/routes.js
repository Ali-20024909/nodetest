const express = require('express');
const router = express.Router();
const CurrencyPair = require('../models/CurrencyPair');

// Create
router.post('/add', async (req, res) => {
  try {
    const { baseCurrency, targetCurrency, exchangeRate } = req.body;
    const newPair = new CurrencyPair({ baseCurrency, targetCurrency, exchangeRate });
    await newPair.save();
    res.json({ message: 'Currency pair added successfully!', data: newPair });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read
router.get('/list', async (req, res) => {
  try {
    const pairs = await CurrencyPair.find();
    res.json(pairs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
