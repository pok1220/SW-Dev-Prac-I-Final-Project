const express= require('express')
const {sendEmail}=require('../controller/mail')


const router = express.Router();

const {protect} = require('../middleware/auth');

router.post('/', sendEmail);
 

module.exports=router;