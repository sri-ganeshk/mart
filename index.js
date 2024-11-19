const express = require('express')
const app = express()
const port = 3000
const{register,login} = require('./auth/authuser')
const{verify} = require('./auth/authMiddleware')
const productRoute = require('./routes/productRoutes')
const {forgetpass}= require('./auth/forgotPassword')
const{resetpass} = require('./auth/resetPassword')




app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(express.json());
app.post('/auth/register',register)
app.post('/auth/login',login)
app.use(productRoute)
app.use('/auth/forgot-password',forgetpass)
app.use('/auth/reset-password/:token',resetpass)

app.get('/protected', verify, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.userId });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})