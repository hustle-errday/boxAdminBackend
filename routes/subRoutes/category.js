const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategoryList,
  getCategoryListByCategory,
  updateCategory,
  deleteCategory,
} = require("../../controller/category");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/create")
  .post(
    body("typeId").isMongoId().notEmpty(),
    body("name").isString().notEmpty(),
    body("sex").notEmpty(),
    body("age").notEmpty(),
    body("weight").notEmpty(),
    body("height").optional(),
    requestDataValidation,
    createCategory
  );
router
  .route("/get")
  .get(
    query("typeId").isMongoId().notEmpty(),
    requestDataValidation,
    getCategoryList
  );
router
  .route("/more")
  .get(
    query("competitionId").isMongoId().notEmpty(),
    requestDataValidation,
    getCategoryListByCategory
  );
router
  .route("/update")
  .put(
    body("_id").isMongoId().notEmpty(),
    body("name").isString().notEmpty(),
    body("sex").notEmpty(),
    body("age").notEmpty(),
    body("weight").notEmpty(),
    body("height").optional(),
    requestDataValidation,
    updateCategory
  );
router
  .route("/delete")
  .delete(
    body("_id").isMongoId().notEmpty(),
    requestDataValidation,
    deleteCategory
  );

module.exports = router;
