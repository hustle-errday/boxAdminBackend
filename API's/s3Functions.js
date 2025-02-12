const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const uploadImage = async (file) => {
  return new Promise(async (resolve) => {
    try {
      const s3 = new S3Client({
        region: process.env.BUCKET_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });

      const imgKey = `${Date.now()}_${file.originalname}`;
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: imgKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${imgKey}`;
      resolve({ success: true, imageUrl: url });
    } catch (err) {
      console.log(err);
      resolve({ success: false });
    }
  });
};

const deleteImage = async (imgUrl) => {
  const s3 = new S3Client({
    region: process.env.BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const urlParts = imgUrl.split("/");
  const key = urlParts[urlParts.length - 1];

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);

  await s3.send(command);
};

module.exports = { uploadImage, deleteImage };
