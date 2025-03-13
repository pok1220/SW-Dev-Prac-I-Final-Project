const express = require('express')
const { getRestaurants,getRestaurant,postRestaurant,putRestaurant,deleteRestaurant } = require('../controller/restaurant');

const router=express.Router()

const appointmentRouter = require('./appointments');

const {protect,authorize} = require('../middleware/auth')
//Include other resource
// const appointmentRouter= require('./appointment')

router.use('/:restaurantId/appointments/',appointmentRouter); //ใช้ use เพราะ เราไม่ได้ใช้ route ตรงๆ restaurant GET PUT แบบนั้น

router.route('/').get(getRestaurants).post(protect,authorize('admin'),postRestaurant) //protect ก่อนแล้ว authorize ตามต้องใส่ตามลำดับด้วย
router.route('/:id').get(getRestaurant).put(protect,authorize('admin'),putRestaurant).delete(protect,authorize('admin'),deleteRestaurant)
module.exports=router; //ให้ server.js เรียกใช้