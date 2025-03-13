//Put Model file
// const Appointment = require('../models/Appointment');
const Restaurant= require('../models/Restaurant');

//@desc Get all restaurants
//@route GET /api/v1/restaurants
//@access Public
exports .getRestaurants=async (req,res,next)=>{
    try{
        let query;
        const reqQuery= {...req.query} //แตก query เป็นส่วนๆ { select: 'province,address', address: { gte: 'C' } }
        // console.log(reqQuery)

        //ลบ Field ออก เพราะ จะทำ เพื่อ search ก่อน
        const removeFields=['select','sort']

        //Loop เพื่อ remove select sort
        removeFields.forEach(param=> delete reqQuery[param])
        // console.log(reqQuery) //เหลืออะไรบ้าง

        let queryStr=JSON.stringify(req.query);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte|e)\b/g,match=>`$${match}`); // ใส่ $ ให้ถูกต้องตาม syntax no sql
        query = Restaurant.find(JSON.parse(queryStr)) //.populate('appointments');//db

        //Select Field
        if(req.query.select){
            const fields=req.query.select.split(',').join(' ')
            query=query.select(fields)
        }

        //Sort Feilds
        // console.log(req.query)
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query=query.sort(sortBy);
            // console.log(sortBy) //name address
        }else{ //ไม่มีการ sort เรียงตาม createdAt
            query=query.sort('-createdAt');
        }

        //Pagination เปลี่ยนหน้าใน frontend
        const page=parseInt(req.query.page,10) ||1; // 10 นี้คือเลขฐาน 10
        const limit=parseInt(req.query.limit,10)||25; //หน้าละ 25 ตัว ถ้าไม่ระบุมา

        const startIndex=(page-1)*limit
        const endIndex=(page-1)*limit
        
        try{
            const total= await Restaurant.countDocuments();
            query=query.skip(startIndex).limit(limit); //off set ไปเริ่มที่ startIndex และ เอามา limit ตัว
            const restaurants= await query;

            //Pagination result
            const pagination={};

            if(endIndex<total){
                pagination.next={
                    page:page+1,
                    limit
                }
            }
            if(startIndex>0){
                pagination.prev={
                    page:page-1,
                    limit
                }
            }
            res.status(200).json({success:true,pagination,count:restaurants.length,data:restaurants})
        }
        catch(err){
            res.status(400).json({success:false})
        }
    }
    catch(err){
        res.status(400).json({success:false})
    }
}
//@desc Get restaurants
//@route GET /api/v1/restaurants/:id
//@access Public
exports .getRestaurant=async (req,res,next)=>{
    try{
        const restaurant= await Restaurant.findById(req.params.id);
        if(!restaurant){ //กรณีหาไม่เจอ
            return  res.status(400).json({success:false})
        }
        res.status(200).json({success:true,data:restaurant})
    }
    catch{
        res.status(400).json({success:false})
    }
}
//@desc Post restaurant
//@route POST /api/v1/restaurants
//@access Private
exports .postRestaurant= async (req,res,next)=>{
    // console.log(req.body)
    try{
        const restaurant = await Restaurant.create(req.body)
        res.status(201).json({success:true,data:restaurant})
    }catch{
        res.status(400).json({success:false,text:"created failed"})
    }
}
//@desc Update restaurant
//@route PUT /api/v1/restaurants/:id
//@access Private
exports .putRestaurant= async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        if(!restaurant){
            return res.status(400).json({success:false})
        }
        res.status(200).json({success:true, data:restaurant})
    }catch{
        res.status(400).json({success:false})
    }
}
//@desc Delete restaurant
//@route DELETE /api/v1/restaurants/:id
//@access Private
exports .deleteRestaurant=async (req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id) //หา ก่อน
        console.log(restaurant) //Print โรงพยาบาลที่ลบ
        if(!restaurant){ //กรณีไม่เจอก็ Handler  400 
            console.log("Not found")
            return res.status(400).json({success:false})
        }
        // await Appointment.deleteMany({restaurant:req.params.id}); //ลบ appointment  ทั้งหมดที่เกี่ยวกับ ร้านอาหาร นี้
        await Restaurant.deleteOne({_id:req.params.id}) //แล้วจึงลบ ร้านอาหาร.
        res.status(200).json({success:true,data:{}})
    }catch{
        res.status(400).json({success:false})
    }
}
