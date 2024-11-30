const express = require('express');
const router = express.Router();
const { verify, admin } = require('../auth/authMiddleware');
const prisma = new (require('@prisma/client').PrismaClient)();
// Create a product
router.post('/post-products', verify, admin, async (req, res) => {
    const { name, description, price, brand, stock, images, categoryId, discount } = req.body;

    try {
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                brand,
                stock: parseInt(stock),
                images,
                discount: parseFloat(discount),
                categoryId:  parseInt(categoryId) 
                 
            },
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create product', details: error.message });
    }
});

router.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true, reviews: true }, // Include related data if needed
        });
        res.json(products);
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch products', details: error.message });
    }
});

// Get a product by ID
router.get('/product/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: { category: true, reviews: true }, // Include related data if needed
        });

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ msg: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ error: 'Failed to fetch product', details: error.message });
    }
});

// Update a product
router.put('/change-product/:id', verify, admin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, categoryId, brand, stock, images, discount } = req.body;

    try {
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: parseFloat(price),
                brand,
                stock: parseInt(stock),
                images,
                discount: parseFloat(discount),
                categoryId: parseInt(categoryId),
            },
        });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update product', details: error.message });
    }
});

// Delete a product
router.delete('/delete-product/:id', verify, admin, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({ msg: 'Successfully deleted', deletedProduct });
    } catch (error) {
        res.status(400).json({ error: 'Failed to delete product', details: error.message });
    }
});

module.exports = router;
