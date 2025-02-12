const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategoryList,
  updateCategory,
} = require("../../controller/category");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/create")
  .post(
    body("typeId").isMongoId().notEmpty(),
    body("name").isString().notEmpty(),
    body("sex").optional(),
    body("age").optional(),
    body("weight").optional(),
    body("height").optional(),
    requestDataValidation,
    createCategory
  );
router
  .route("/get")
  .get(
    query("page").isNumeric().notEmpty(),
    query("typeId").isMongoId().notEmpty(),
    requestDataValidation,
    getCategoryList
  );
router
  .route("/update")
  .put(
    body("_id").isMongoId().notEmpty(),
    body("name").isString().notEmpty(),
    body("sex").optional(),
    body("age").optional(),
    body("weight").optional(),
    body("height").optional(),
    requestDataValidation,
    updateCategory
  );

module.exports = router;
