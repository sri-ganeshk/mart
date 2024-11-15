const jwt = require('jsonwebtoken')
const jwt_password = "password"

exports.verify = (req,res,next) =>{

    const token = req.header('auth')?.split(" ")[1];
        if(!token){
        res.status(400).json({
            msg : "no token"
        })
    }

    try{
        const decoded = jwt.verify(token,jwt_password)

        req.userId = decoded.userId; 
        next()
    }catch(error){
        res.status(400).json({
            msg :"invaild token"
        })
    }


}

exports.admin = (req,res,next) =>{
    const adminId = 2;
    if(req.userId){
        if(req.userId === adminId){
            next();
        }
        else {
            res.json({
                msg : "admins only"
            })
        }
    }
    else {
        res.status(404).json({
            msg : 'no token'
        })
    }
}