const express = require('express')
const { getRestaurants,getRestaurant,postRestaurant,putRestaurant,deleteRestaurant } = require('../controller/restaurant');
const multer= require('multer')

const router=express.Router()
const storage = multer.memoryStorage()
const S3ClientClass = require('../cloud/s3'); 
const s3Client = new S3ClientClass();
const path = require('node:path');
const sharp = require('sharp');
const crypto = require('crypto');

const fileFilter = (req, file, cb) => {
    const filetypes = /png|jpeg|gif|jpg|jpeg/;
    // Check file extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // const sizeCheck = file.size < maxSize
    // console.log(file.size)
    // Check MIME type
    const mimeType = file.mimetype.startsWith('image/');
    if (extname && mimeType) {
        return cb(null, true);
    }
    else {
        return cb(new Error("Error: Only PNG, JPEG, and GIF files are allowed!"));
    }
};
const maxSize = 5 * 1024 * 1024 // bytes / 5mb
const upload = multer({
    storage: storage,
    fileFilter,
    limits : {fileSize : maxSize}
})


const appointmentRouter = require('./appointments');

const {protect,authorize} = require('../middleware/auth')

//Include other resource
// const appointmentRouter= require('./appointment')

router.use('/:restaurantId/appointments/',appointmentRouter); //ใช้ use เพราะ เราไม่ได้ใช้ route ตรงๆ restaurant GET PUT แบบนั้น

router.route('/').get(getRestaurants).post(protect,authorize('admin'),upload.single('img'),postRestaurant) //protect ก่อนแล้ว authorize ตามต้องใส่ตามลำดับด้วย


//Test Upload image
router.post('/upload', upload.single('img') ,async (req, res) => {
    try{
        console.log("route check1")
        const image = req?.file
        console.log("route check2")
        const resizeBuffer = await sharp(image?.buffer)
        .resize({
            height: 1920,
            width: 1080,
            fit: 'contain'
        })
        .toBuffer()
        console.log("route check",resizeBuffer)
        const imageName = crypto.randomBytes(32).toString('hex')
        await s3Client.uploadFile(resizeBuffer, imageName, image?.mimetype)
        res.status(201).json({success: true})
    }catch(err){
        throw new Error(err)
    }
})
router.get('/getUrl', async (req, res) => {
    try{
        const key = req.query.key
        console.log("check")
        const url = await s3Client.createSignedURL(key)
        res.status(201).json({
            success: true,
            signedUrl : url,
        })
    }catch(err){
        throw new Error(err)
    }
})

router.route('/:id').get(getRestaurant).put(protect,authorize('admin'),upload.single('img'),putRestaurant).delete(protect,authorize('admin'),deleteRestaurant)

module.exports=router;  