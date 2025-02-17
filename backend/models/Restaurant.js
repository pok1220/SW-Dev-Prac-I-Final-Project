const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true,'Please add a Restaurant Name'],
        unique:true,
        trim:true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    address:{
        type:String,
        required:[true,'Please add an address']
    },
    telephoneNumber:{
        type:String,
        required: [true,"Please add your telephone number"],
        match: [
            /^\+?[0-9]{10,15}$/,
            "Phone number must contain only digits and be between 10 and 15 characters long.",
        ]
    },
    openTime:{
        type:Date,
        required: [true,"Please add your restaurant's open-time"],
    },
    closeTime:{
        type:Date,
        required: [true,"Please add your restaurant's open-time"],
    },

    // district:{
    //     type:String,
    //     required:[true,'Please add a district']
    // },
    // province:{
    //     type: String,
    //     require:[true,'Please add a province']
    // },
    // postalcode:{
    //     type:String,
    //     require:[true,'Please add a postal code'],
    //     maxlength:[5,'Postal code can not be more than 5 characters']
    // },
    // tel:{
    //     type:String
    // },
    // region:{
    //     type:String,
    //     required:[true,'Please add a region']
    // }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});


//Reverse populate with virtual
// RestaurantSchema.virtual('appointments',{
//     ref: "Appointment",
//     localField: "_id",
//     foreignField:"restaurant",
//     justOne:false
// })

module.exports=mongoose.model('Restaurant',RestaurantSchema);