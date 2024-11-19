const nodemailer = require("nodemailer");
const express = require('express');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const router = express.Router()
require('dotenv').config();
const crypto = require('crypto');


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

exports.forgetpass = async (req,res) =>{
    const {email} = req.body;
    try{
      const user = await prisma.user.findUnique({
        where : {
            email : email,
        }
      })
      if(!user) {
        return res.status(404).json({
            msg : 'maul not found'
        })
      }
      const token = crypto.randomBytes(32).toString('hex')
      const exp=new Date(Date.now()+3600000)
      await prisma.user.update({
        where :{
            email : email,
        },
        data:{
            resetPasswordToken : token,
            resetPasswordExpires : exp,
        }
      })
      const mailInfo = {
        to : user.email,
        from : process.env.EMAIL_USER,
        subject : 'reset password',
        text : `reset your password at https://cautious-space-funicular-g4qxqwvjvq76fwrg5-3000.app.github.dev/reset-password/${token}`
      }
      transporter.sendMail(mailInfo,(e)=>{
        if(e) return res.status(404).json({
            msg : e.message,
        })
        res.status(200).json({
            msg:'pasword reseted'
        })
      })
    }
    catch(error){
        res.status(400).json({
            msg :'error resetpassword',
            error:error.message
        })
    }
  }