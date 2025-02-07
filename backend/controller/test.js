//Put Model file


//@desc Get all Test
//@route GET /api/v1/test
//@access Public
exports .getTest=async (req,res,next)=>{
    try{
        res.status(200).json({success:true})
    }
    catch{
        res.status(400).json({success:false})
    }
}
