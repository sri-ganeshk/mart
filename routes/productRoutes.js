const express = require('express')
const router=express.Router()
const { verify,admin } = require('../auth/authMiddleware')
const { parse } = require('dotenv')
const prisma = new (require('@prisma/client').PrismaClient)()


router.post('/post-products', verify,admin,async (req,res) =>{
    const { name,description,price,brand,stock,images,category,discount } = req.body
    try{
        const product = await prisma.product.create({
            data :{
                name,
                description,
                price,
                brand,
                stock,
                images,
                category,
                discount,
            }
        })
        res.status(201).json(product)
    }catch(error){
       res.status(400).json(error)
    }
})

router.get('/product/:id',async (req,res) =>{
    const  {id }= req.params;
    const productId = await prisma.product.findUnique({ where: { id:parseInt(id) } });
    if(productId) {
        res.json(productId)
    }
    else {
        res.status(401).json({
            msg : "id not found"
        })
    }
})

router.put('/change-product/:id',verify,admin,async (req,res)=>{
    const { id } = req.params;
    const { name, description, price, category, brand, stock, images, discount } = req.body;
    const product = await prisma.product.findUnique({
        where :{
            id :parseInt(id),
        }
    })
    if(!product){
        res.status(404).json({
            msg:"idd / product not found",
        })
    }
    try{
        const updatedProduct = await prisma.product.update({
            where :{
                id : parseInt(id)
            },
            data:{
                name, 
                description, 
                price: parseFloat(price), 
                category, 
                brand, 
                stock, 
                images, 
                discount: parseFloat(discount),
            }
        })
        res.json(updatedProduct)
    }
    catch(error){
        res.status(400).json({ error: 'Failed to update product', details: error.message})
    }
    

})
router.delete('/delete-product/:id',verify,admin,async (req,res) =>{
    const {id} = req.params;
    const product = await prisma.product.findUnique({
        where :{
            id : parseInt(id)
        }
    })
    if(!product) res.json({
        msg : 'no id/product found'
    })
    try{
        await prisma.product.delete({
            where :{
                id : parseInt(id)
            }
        })
        res.status(200).json({
            msg:'succesfully deleted',
        })
    }
    catch(error){
        res.status(400).json({ error: 'Failed to delete product', details: error.message });
    }
})

module.exports = router