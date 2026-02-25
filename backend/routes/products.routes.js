// backend/routes/products.routes.js
const express = require('express');
const Product = require('../models/Product');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

/**
 * GET all products
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log(`📦 Found ${products.length} products`);
    res.json(products);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('❌ Error fetching product:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * BULK INSERT products — ต้องอยู่ก่อน POST / เสมอ
 */
router.post('/bulk', async (req, res) => {
  try {
    console.log(`📥 POST /api/products/bulk — ${req.body.length} items`);

    const products = req.body.map(p => ({
      name:        p.name,
      description: p.description || '',
      unit:        p.unit || 'ชิ้น',
      price:       parseFloat(p.price),
      margin:      0,
    }));

    const result = await Product.insertMany(products);
    console.log(`✅ Bulk inserted ${result.length} products`);

    res.status(201).json({ inserted: result.length });
  } catch (err) {
    console.error('❌ Bulk insert error:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * CREATE product with image upload
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('📥 POST /api/products');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    const productData = {
      name:        req.body.name,
      description: req.body.description || '',
      unit:        req.body.unit,
      price:       parseFloat(req.body.price),
      margin:      0,
    };

    if (req.file) {
      productData.imageUrl      = req.file.path;
      productData.imagePublicId = req.file.filename;
      console.log('✅ Image uploaded to Cloudinary:', req.file.path);
    }

    const product = await Product.create(productData);
    console.log('✅ Product created:', product._id);

    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Error creating product:', err);
    res.status(500).json({
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
});

/**
 * UPDATE product
 */
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('📝 PUT /api/products/:id');

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name        = req.body.name        || product.name;
    product.description = req.body.description !== undefined ? req.body.description : product.description;
    product.unit        = req.body.unit        || product.unit;
    product.price       = req.body.price       ? parseFloat(req.body.price) : product.price;
    product.margin      = 0;

    if (req.file) {
      if (product.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(product.imagePublicId);
          console.log('🗑️ Old image deleted from Cloudinary');
        } catch (err) {
          console.warn('Warning: Could not delete old image:', err.message);
        }
      }
      product.imageUrl      = req.file.path;
      product.imagePublicId = req.file.filename;
      console.log('✅ New image uploaded to Cloudinary');
    }

    await product.save();
    console.log('✅ Product updated:', product._id);

    res.json(product);
  } catch (err) {
    console.error('❌ Error updating product:', err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE product
 */
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/products/:id');

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
        console.log('✅ Image deleted from Cloudinary');
      } catch (err) {
        console.warn('Warning: Could not delete image:', err.message);
      }
    }

    await product.deleteOne();
    console.log('✅ Product deleted:', req.params.id);

    res.status(204).send();
  } catch (err) {
    console.error('❌ Error deleting product:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;