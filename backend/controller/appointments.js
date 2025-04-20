const Appointment = require("../models/Appointment");
const Restaurant = require("../models/Restaurant");
const { sendEmailFunction } = require('./mails');
//@desc Get all appointments
//@route GET /api/v1/appointments
//@access Public
exports.getAppointments = async(req,res,next)=>{
    let query;
    // General users can see only thier appointments
    if(req.user.role !== 'admin'){
        query=Appointment.find({user:req.user.id}).populate({
            path:'restaurant',
            select: 'name address tel'
        });
    }else{ // Admin can see all
        if(req.params.restaurantId){
            console.log(req.params.restaurantId);
            query = Appointment.find({
                restaurant: req.params.restaurantId
            }).populate({
                path:'restaurant',
                select:'name address tel'
            });
        }else{
            query=Appointment.find().populate({
            path:'restaurant',
            select:'name address tel'
            });
        }
    }
    try{
        const appointments= await query;

        res.status(200).json({
            success:true,
            count:appointments.length,
            data: appointments
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot find Appointment"
        });
    }
}

//@desc Get single  appointments
//@route GET /api/v1/appointments/:id
//@access Public
exports.getAppointment= async(req,res,next)=>{
    try{
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name address tel'
        });

        if(!appointment){
            return res.status(404).json({success:false, message:`No appointment with the id of ${req.params.id}`})
        }

        res.status(200).json({success:true, data: appointment});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message:'Cannot find appointment'})
    }
}

//@desc Add single  appointments
//@route POST /api/v1/hospitals/:hospitalId/appointments
//@access Private
exports.addAppointment= async(req,res,next)=>{
    try{
        const email=req.user.email;
        req.body.restaurant = req.params.restaurantId;

        const restuarant = await Restaurant.findById(req.params.restaurantId);
        if(!restuarant){
            return res.status(404).json({success:false, message:`No restayrant with the id of ${req.params.restaurantId}`})
        }

        //add user Id to req.body
        req.body.user = req.user.id;
        //Check for Existed appointment
        const existedAppointments = await Appointment.find({user:req.user.id});
        // If the user is not an admin, they can only create 3 appointments.
        if(existedAppointments.length>=3 && req.user.role!='admin'){
            return res.status(400).json({success:false,message:`The user with ID ${req.user.id} has already made 3 appointments`})
        }

        const appointment = await Appointment.create(req.body);
        const date= new Date(req.body.apptDate).toLocaleTimeString("en-US", {timeZone:"Asia/Bangkok", day:"numeric",month:"long",hour: "2-digit", minute: "2-digit" })
        const reqDetail={
            email: email,
            subject: "Appointment Notification",
            message: `You have just reserve ${restuarant.name} in ${date}.`
        }

        const mailResponse=await sendEmailFunction(reqDetail)
            if(mailResponse.status=="error"){
                response.status(500).json({success:false,error:response.message})
            }
        res.status(200).json({success:true, data: appointment});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, meassage:'Cannot create appointment'});

    }
}

//@desc Update  appointment
//@route PUT /api/v1/appointments/:id
//@access Private
exports.updateAppointment= async(req,res,next)=>{
    try{
        const email=req.user.email;
        let appointment = await Appointment.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name address tel'
        });

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`})
        }
        let reserveDate=appointment.apptDate;
        let restaurantName=appointment.restaurant.name;

        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to update this appointment`})
        }
        

        appointment = await Appointment.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators: true})

        const oldDate= new Date(reserveDate).toLocaleTimeString("en-US", {timeZone:"Asia/Bangkok", day:"numeric",month:"long",hour: "2-digit", minute: "2-digit" })
        const date= new Date(req.body.apptDate).toLocaleTimeString("en-US", {timeZone:"Asia/Bangkok", day:"numeric",month:"long",hour: "2-digit", minute: "2-digit" })
        const reqDetail={
            email: email,
            subject: "Appointment Notification",
            message: `You have just change ${restaurantName} from ${oldDate} to ${date}.`
        }

        const mailResponse=await sendEmailFunction(reqDetail)
            if(mailResponse.status=="error"){
                response.status(500).json({success:false,error:response.message})
            }
        res.status(200).json({success:true, data: appointment});

    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, meassage:'Cannot update appointment'});
    }
}

//@desc Delete  appointment
//@route DELETE /api/v1/appointments/:id
//@access Private
exports.deleteAppointment= async(req,res,next)=>{
    try{
        const email=req.user.email;
        let appointment = await Appointment.findById(req.params.id).populate({
            path: 'restaurant',
            select: 'name address tel'
        });

        if(!appointment){
            return res.status(404).json({success:false,message:`No appointment with the id of ${req.params.id}`})
        }
        // console.log(appointment)
        let reserveDate=appointment.apptDate;
        let restaurantName=appointment.restaurant.name;

        //Make sure user is the appointment owner
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false,message:`User ${req.user.id} is not authorized to delete this appointment`})
        }

        await appointment.deleteOne();
        const date= new Date(reserveDate).toLocaleTimeString("en-US", {timeZone:"Asia/Bangkok", day:"numeric",month:"long",hour: "2-digit", minute: "2-digit" })
        const reqDetail={
            email: email,
            subject: "Appointment Notification",
            message: `You have just delete reservation at ${restaurantName} in ${date}.`
        }
        const mailResponse=await sendEmailFunction(reqDetail)
        if(mailResponse.status=="error"){
            response.status(500).json({success:false,error:response.message})
        }

        res.status(200).json({success:true, data: {}});

    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, meassage:'Cannot delete appointment'});
    }
}