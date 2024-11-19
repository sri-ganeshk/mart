const bcrypt = require('bcrypt') 
const { PrismaClient } = require('@prisma/client')
const express = require('express')
const router = express.Router()
const prisma = new PrismaClient()

exports.resetpass = async (req,res)=>{
    const {token} = req.params
    const {password} = req.body
    try{
        const user = await prisma.user.findFirst({
            where : {
                resetPasswordToken : token,
                resetPasswordExpires :{
                    gte : new Date()
                }
            }
        })
        if(!user){
            return res.status(404).json({
                msg:'no token '
            })
        }
        const hashedPassword = await bcrypt.hash(password,9)
        await prisma.user.update({
            where :{
                id : user.id,
            },
            data:{
                password: hashedPassword,
                resetPasswordToken : null,
                resetPasswordExpires : null
            }
        })
        res.status(200).json({ msg: 'Password successfully reset' });
    }
    catch(error){
        res.status(500).json({
            msg1 : 'failed to reset pasword',
            msg : error.message,
        })
    }
}
