const express = require("express");
const router = express.Router();
const { login, refreshToken } = require("../../controller/auth");
const { body, query } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/login")
  .post(
    body("phoneNo").isString().notEmpty(),
    body("password").isString().notEmpty(),
    requestDataValidation,
    login
  );
router
  .route("/refresh_token")
  .get(query("refreshToken").isString(), requestDataValidation, refreshToken);

module.exports = router;
