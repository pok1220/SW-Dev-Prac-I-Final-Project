const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } =  require("@aws-sdk/s3-request-presigner")

 

class S3ClientClass {
    // #client
    // :S3Client;
    // #bucketName; 
    // :string;
  
    constructor() {
      this.bucketName = process.env.BUCKET_NAME;
      const region = process.env.BUCKET_REGION;
      const accessKeyId = process.env.ACCESS_KEY;
      const secretAccessKey = process.env.SECRET_ACCESS_KEY;
      const sessionToken = process.env.SESSION_TOKEN;
  
      this.client = new S3Client({
        region: region,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
          sessionToken: sessionToken,
        }
      });
    }
    // const sendTokenResponse=(user,statusCode,res)=>{
        // exports.getMe=async(req,res,next)=>{
    uploadFile=async (fileBuffer, fileName, mimetype)=> {
      console.log("cloud check")
      const params = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype,
      };
  
      const command = new PutObjectCommand(params);
      return this.client.send(command);
    }
  

    createSignedURL=async(key)=>{
      const params = {
        Bucket: this.bucketName,
        Key: key
      };
      const command = new GetObjectCommand(params);
      const expireTime = 3600;
      const url = await getSignedUrl(this.client, command, {
        expiresIn: expireTime
      });
      return url;
    }
  

    deleteFile=async (key)=> {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };
  
      const command = new DeleteObjectCommand(params);
      return this.client.send(command);
    }
  }
  
  
  module.exports = S3ClientClass;
