const express = require('express')
const dotenv = require('dotenv')
const connectDB= require('./config/db') //เรียกใช้ db

//Load env vars
dotenv.config({path:'./config/config.env'})
connectDB(); //use db

const app=express()

//Routes files
const test =require('./routes/test')


//Mount Path
app.use(express.json()) //body parser มาก่อน use api นะ!!!
app.use('/api/v1/tests',test)
const PORT=process.env.PORT || 5001;
const server= app.listen(PORT,console.log('Server running in',process.env.NODE_ENV,'mode on port',PORT));

//Handle unhandler promise rejection
process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error Message: ${err.message}`)
    server.close(()=>process.exit())
})
