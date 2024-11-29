const express = require("express");
const router = express.Router();
const { verify } = require("../auth/authMiddleware");
const prisma = new (require("@prisma/client").PrismaClient)();

router.get("/user/cart", verify, async (req, res) => {
  const userId = req.userId;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.json(cart.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch cart items" });
  }
});

router.post("/user/cart", verify, async (req, res) => {
  const userId = req.userId;
  const { productId, quantity } = req.body;

  try {
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }



    const cartItem = await prisma.cartItems.upsert({
      where: {  cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: quantity  },
      create: { cartId: cart.id, productId, quantity },
    });

    res.json(cartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add item to cart",
        error: error.message 
     });
  }
});

router.delete("/user/cart/:id", verify, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const cart = await prisma.cart.findUnique({ where: { userId } });

  const cartItem = await prisma.cartItems.findUnique({where: { id: parseInt(id) } });

  if(cartItem.cartId !== cart.id){
    return res.status(401).json({ message: "Unauthorized" });
  }


  try {
    const deletedCartItem = await prisma.cartItems.delete({
      where: { id: parseInt(id) },
    });

    res.json(deletedCartItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
});

module.exports = router;
