const S3ClientClass = require('../cloud/s3'); 
const s3Client = new S3ClientClass();
const crypto = require('crypto');


class CloudService {
  getKeyName(){
    const imageKey = crypto.randomBytes(32).toString("hex");
    return imageKey
  }

  uploadImageToCloud= async (buffer, mimetype, imageKey)=> {
    try {
      if(!imageKey){ // check null undefined or empty strings
        imageKey = this.getKeyName()
      }

      await s3Client.uploadFile(buffer, imageKey, mimetype);
      const url = await s3Client.createSignedURL(imageKey)
      return {
        imageKey, //เก็บ แค่อันนี้พอ
        url //gen ใหม่ทุกครั้ง
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  deleteImageCloud= async (key)=>{
        try {
            await s3Client.deleteFile(key)
            return {
                success: true
            }
        }catch(err){
            throw new Error(err)
        }
  }
  getSignedUrlImageCloud= async(key)=>{
    try{
        const url = await s3Client.createSignedURL(key);
        return url
    }catch(err){
        throw new Error(err)
    }
  }
  getUrlWithImageNameAndUploadToCloud= async(buffer, mimetype, imageKey)=>{
        try{
        console.log('imageKey', imageKey)
        const {url, imageKey : imageName} = await this.uploadImageToCloud(buffer, mimetype, imageKey)
        return {
            url,
            imageName //get imageName in case of sending invalid imageKey or don't need to check user imageKeys
        }
        }catch(err){
        throw new Error(err)
        }
  }
}

module.exports = CloudService;