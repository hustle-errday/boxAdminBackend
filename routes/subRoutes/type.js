const express = require("express");
const router = express.Router();
const {
  createType,
  deleteType,
  getTypeList,
  updateType,
} = require("../../controller/type");
const { body } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/create")
  .post(
    body("name").notEmpty().withMessage("Нэр хоосон байна."),
    body("description").optional(),
    requestDataValidation,
    createType
  );
router.route("/get").get(getTypeList);
router
  .route("/update")
  .put(
    body("_id").isString().notEmpty(),
    body("name").notEmpty().withMessage("Нэр хоосон байна."),
    body("description").optional(),
    requestDataValidation,
    updateType
  );
router
  .route("/delete")
  .delete(body("_id").isString().notEmpty(), requestDataValidation, deleteType);

module.exports = router;
