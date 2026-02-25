// backend/routes/quotation.routes.js
const express = require('express');
const router = express.Router();
const Quotation = require('../models/Quotation');

// CREATE
router.post('/', async (req, res) => {
  try {
    const quotation = await Quotation.create(req.body);
    console.log('✅ Quotation created:', quotation.quotation_number);
    res.status(201).json(quotation);
  } catch (err) {
    console.error('❌ Create quotation error:', err);
    res.status(400).json({ message: err.message });
  }
});

// GET (pagination + search + status filter)
router.get('/', async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim()  || '';
    const status = req.query.status?.trim()  || '';

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { quotation_number: { $regex: search, $options: 'i' } },
        { customer_name:    { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Quotation.find(query).sort({ created_date: -1 }).skip((page - 1) * limit).limit(limit),
      Quotation.countDocuments(query),
    ]);

    console.log(`📦 Found ${data.length} quotations (page ${page})`);
    res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('❌ Get quotations error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET by ID
router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    console.log('✅ Quotation updated:', quotation.quotation_number);
    res.json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    console.log('✅ Quotation deleted:', quotation.quotation_number);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;