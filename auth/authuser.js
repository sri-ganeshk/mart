const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const prisma = new (require ('@prisma/client').PrismaClient)()


const jwt_password = "password"

exports.register =async (req,res) =>{
    const {email,password,name} = req.body

    const hashPassword = await bcrypt.hash(password,9)

    try{
        const user = await  prisma.user.create({
            data:{
                email,
                password : hashPassword,
                name
    
            }
        })

        const token = jwt.sign({userId : user.id},jwt_password,{expiresIn : "7d"})


        res.status(200).json({
            msg :"sucess!",
            token : token
        })
    } catch(error){
        res.status(400).json({
            error : error
        })
    }

}


exports.login = async (req,res) =>{
    const {email,password}=req.body

    try{
        const user = await prisma.user.findUnique({where :{email}})

        if(user && await bcrypt.compare(password,user.password)){
            const token = jwt.sign({userId : user.id},jwt_password,{expiresIn : "7d"})

            res.json({
                token: token,
                id : user.id
            })

        }else{
            res.status(400).json({
                msg :"incorrect data"
            })
        }     
    }catch(error){
        res.status(500).json({
            msg : error
        })
        
    }
} 

