const express = require('express');
const router = express.Router();
const { verify, admin } = require('../auth/authMiddleware');
const prisma = new (require('@prisma/client').PrismaClient)();


// adding review to a product

router.post('/product/:id/review', verify, async (req, res) => {
    const { id } = req.params;
    const { rating, review } = req.body;
    const product = await prisma.product.findUnique({
        where: {
            id: parseInt(id)
        }
    });
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const newReview = await prisma.review.create({
        data: {
            rating: parseInt(rating),
            productId : parseInt(id),
            userId: req.userId,
            comment: review,
        }
    });
    res.json(newReview);
});

// get all reviews of a product
router.get('/product/:id/review', async (req, res) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
        where: {
            id: parseInt(id)
        }
    });
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    const reviews = await prisma.review.findMany({
        where: {
            productId: parseInt(id)
        }
    });
    res.json(reviews);
});



module.exports = router;