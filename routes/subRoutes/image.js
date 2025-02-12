const express = require("express");
const router = express.Router();
const { uploadImage } = require("../../controller/image");
const multer = require("multer");
const upload = multer();

router.route("/upload").post(
  upload.single("image"),
  /*
  #swagger.tags = ['Image'] 
  #swagger.summary = 'Upload image'
  #swagger.description = 'Upload image'
  #swagger.parameters['image'] = {
    in: 'formData',
    required: true,
    type: 'file',
    description: 'Image file'
  }
  */
  uploadImage
);

module.exports = router;
