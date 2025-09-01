const express = require("express");
const router = express.Router();
const {
  getAllAthletes,
  getAllCoaches,
  getAllUsers,
  updateUser,
} = require("../../controller/users");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/all")
  .get(
    query("page").isNumeric().notEmpty(),
    query("searchBy").isString().optional(),
    requestDataValidation,
    getAllUsers
  );
router
  .route("/coaches")
  .get(
    query("page").isNumeric().notEmpty(),
    query("searchBy").isString().optional(),
    requestDataValidation,
    getAllCoaches
  );
router
  .route("/athletes")
  .get(
    query("page").isNumeric().notEmpty(),
    query("searchBy").isString().optional(),
    requestDataValidation,
    getAllAthletes
  );
router
  .route("/update")
  .put(
    body("_id").isMongoId().notEmpty(),
    body("phoneNo").isString().notEmpty(),
    body("firstName").isString().optional(),
    body("lastName").isString().optional(),
    body("registrationNumber").isString().optional(),
    body("sex").isString().optional(),
    body("club").isString().optional(),
    body("height").isNumeric().optional(),
    body("weight").isNumeric().optional(),
    body("birthDate").isString().optional(),
    body("imageUrl").isString().optional(),
    requestDataValidation,
    updateUser
  );

module.exports = router;
