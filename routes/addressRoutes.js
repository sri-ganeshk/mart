const express = require('express');
const router = express.Router();
const { verify, admin } = require('../auth/authMiddleware');
const prisma = new (require('@prisma/client').PrismaClient)();


//fetching address

router.get('/get-address', verify, async (req, res) => {
    try {
        const address = await prisma.address.findMany({
            where: {
                userId: req.userId,
            }
        })
        res.json(address);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            "msg": error.message
        })
    }
})



//posting address
router.post('/post-address', verify, async (req, res) => {
    const { doorNumber, streetName, landMark, city, state, pincode } = req.body
    try {
        const address =await  prisma.address.create({
            data: {
                doorNumber,
                streetName,
                landMark,
                city,
                state,
                pincode: parseInt(pincode),
                userId: req.userId
            }
        })
        res.status(201).json(address)
    }
    catch (error) {
        console.log(error)
        res.json({
            "error": error.message.details
        })
    }

})

//updating the address

router.put('/update-address/:id',verify,async (req,res)=>{
    const { doorNumber, streetName, landMark, city, state, pincode } = req.body
    const addressId = parseInt(req.params.id)
    try{
       const address = await prisma.address.findUnique({
        where : {
            id : addressId,
        }
       })
       if(!address || address.userId !== req.userId) return res.status(403).json({
        msg : "unauthrized"
       })
       const updateAddress = await prisma.address.update({
        where : {
            id : addressId,
        },
        data :{
            doorNumber,
            state,
            streetName,
            landMark,
            city,
            pincode : parseInt(pincode)
        }
       })
       res.json(updateAddress)
    }
    catch(error){
        console.log(error)
        res.json({
            "msg" : error
        })
    }
})

module.exports = router