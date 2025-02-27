const express = require("express");
const router = express.Router();
const {
  getAllAthletes,
  getAllCoaches,
  getAllUsers,
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

module.exports = router;
