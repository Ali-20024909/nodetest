const express = require('express');
const router = express.Router();
const CurrencyPair = require('./CurrencyPair');

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

// Update
router.put('/update/:id', async (req, res) => {
  try {
    const updatedPair = await CurrencyPair.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Currency pair updated!', data: updatedPair });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/delete/:id', async (req, res) => {
  try {
    await CurrencyPair.findByIdAndDelete(req.params.id);
    res.json({ message: 'Currency pair deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
