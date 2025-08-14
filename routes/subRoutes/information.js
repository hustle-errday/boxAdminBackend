const express = require("express");
const router = express.Router();
const {
  getInformation,
  addInformation,
  updateInformation,
  deleteInformation,
} = require("../../controller/information");
const { body } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router.route("/get").get(getInformation);
router
  .route("/add")
  .post(
    body("image").optional().isString(),
    body("link").optional().isString(),
    body("title").notEmpty().withMessage("Гарчиг хоосон байна."),
    body("content").notEmpty().withMessage("Агуулга хоосон байна."),
    requestDataValidation,
    addInformation
  );
router
  .route("/update")
  .put(
    body("_id").isString().notEmpty().withMessage("ID хоосон байна."),
    body("image").optional().isString(),
    body("link").optional().isString(),
    body("title").notEmpty().withMessage("Гарчиг хоосон байна."),
    body("content").notEmpty().withMessage("Агуулга хоосон байна."),
    requestDataValidation,
    updateInformation
  );
router
  .route("/delete")
  .delete(
    body("_id").isString().notEmpty().withMessage("ID хоосон байна."),
    requestDataValidation,
    deleteInformation
  );

module.exports = router;
