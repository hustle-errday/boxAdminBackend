const express = require("express");
const router = express.Router();
const {
  createVideo,
  getVideos,
  updateVideo,
  deleteVideo,
} = require("../../controller/video");
const { body } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/")
  .post(
    body("title").isString().notEmpty().withMessage("Гарчиг оруулна уу."),
    body("url").isString().notEmpty().withMessage("URL оруулна уу."),
    body("description").isString().optional(),
    requestDataValidation,
    createVideo
  );
router.route("/").get(getVideos);
router
  .route("/")
  .put(
    body("_id").isString().notEmpty().withMessage("Видео ID оруулна уу."),
    body("title").isString().notEmpty().withMessage("Гарчиг оруулна уу."),
    body("url").isString().notEmpty().withMessage("URL оруулна уу."),
    body("description").isString().optional(),
    requestDataValidation,
    updateVideo
  );
router
  .route("/")
  .delete(
    body("_id").isString().notEmpty().withMessage("Видео ID оруулна уу."),
    requestDataValidation,
    deleteVideo
  );

module.exports = router;
