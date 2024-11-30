const express = require('express');
const router = express.Router();
const { verify, admin } = require('../auth/authMiddleware');
const prisma = new (require('@prisma/client').PrismaClient)();

// Create an order for a user
router.post('/order', verify, async (req, res) => {
    const userId = req.userId;
    const { items, total, dateOfDelivery, paymentReferenceId } = req.body;

    try {
        const order = await prisma.orders.create({
            data: {
                userId,
                dateOfDelivery: dateOfDelivery ? new Date(dateOfDelivery) : null,
                paymentRefrenceId: paymentReferenceId,
                orderStatus: 'PENDING', 
                items: {
                    create: items.map(item => ({
                        quantity: item.quantity,
                        productId: item.productId,
                    })),
                },
            },
        });

        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create order' });
    }
});

// Get all orders for a user
router.get('/orders', verify, async (req, res) => {
    const userId = req.userId;

    try {
        const orders = await prisma.orders.findMany({
            where: { userId },
            include: { items: true, payment: true },
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve orders' });
    }
});

// Get a specific order by ID
router.get('/order/:id', verify, async (req, res) => {
    const { id } = req.params;

    try {
        const order = await prisma.orders.findUnique({
            where: { id: parseInt(id) },
            include: { items: true, payment: true },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve order' });
    }
});
//update order confirmation (admin only)

router.put('/order/:id/confirm', verify, admin, async (req, res) => {
    const { id } = req.params;
    const { confirmation } = req.body;

    try {
        const updatedOrder = await prisma.orders.update({
            where: { id: parseInt(id) },
            data: { confirmation: confirmation },
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update order confirmation' });
    }
});

// Update order status (Admin only)
router.put('/order/:id/status', verify, admin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedOrder = await prisma.orders.update({
            where: { id: parseInt(id) },
            data: { orderStatus: status },
        });

        res.json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update order status' });
    }
});


// Update items in an order
router.put('/order/:id/items', verify, async (req, res) => {
    const { id } = req.params;
    const { items } = req.body;

    try {
        const updatedOrderItems = await prisma.$transaction(
            items.map(item =>
                prisma.orderItems.update({
                    where: { id: item.id },
                    data: { quantity: item.quantity },
                })
            )
        );

        res.json(updatedOrderItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update order items' });
    }
});


// List all orders (Admin only)
router.get('/orders/all', verify, admin, async (req, res) => {
    try {
        const orders = await prisma.orders.findMany({
            include: { items: true, payment: true },
        });

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve all orders' });
    }
});

module.exports = router;
