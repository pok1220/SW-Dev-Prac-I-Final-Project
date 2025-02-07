const express = require('express')
const  {getTest} =require('../controller/test')
const router=express.Router()

 
router.route('/').get(getTest)
module.exports=router; //ให้ server.js เรียกใช้