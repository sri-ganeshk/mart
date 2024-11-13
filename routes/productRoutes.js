const express = require('express')
const router=express.Router()
const { verify,admin } = require('../auth/authMiddleware')
const prisma = new (require('@prisma/client').PrismaClient)()


router.post('/post-products', verify,admin,async (req,res) =>{
    const { name,description,price } = req.body
    try{
        const product = await prisma.Product.create({
            data :{
                name,
                description,
                price,
            }
        })
        res.status(200).json(product)
    }catch(error){
       res.status(400).json(error)
    }
})

router.get('/product/:id',async (req,res) =>{
    const  {id }= req.params;
    const productId = await prisma.product.findUnique({ where: { id:parseInt(id)} });
    if(productId) {
        res.json(productId)
    }
    else {
        res.status(401).json({
            msg : "id not found"
        })
    }
})

module.exports = router
