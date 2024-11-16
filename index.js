const express = require('express')
const app = express()
const port = 3000
const{register,login} = require('./auth/authuser')
const{verify} = require('./auth/authMiddleware')
const productRoute = require('./routes/productRoutes')
const forgotRoute= require('./routes/forgotPassword')
const resetRoute = require('./routes/resetPassword')



app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(express.json());
app.post('/auth/register',register)
app.post('/auth/login',login)
app.use(productRoute)
app.use('/auth',forgotRoute)
app.use('/auth',resetRoute)

app.get('/protected', verify, (req, res) => {
    res.json({ message: 'This is a protected route', userId: req.userId });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})