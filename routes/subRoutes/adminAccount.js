const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAdminList,
  resetPassword,
} = require("../../controller/adminAccount");
const { body } = require("express-validator");
const requestDataValidation = require("../../middleware/requestDataValidation");

router
  .route("/create")
  .post(
    body("username").isString().notEmpty(),
    body("phoneNo").isString().notEmpty(),
    body("password").isString().notEmpty(),
    requestDataValidation,
    createAdmin
  );
router.route("/get").get(getAdminList);
router
  .route("/update")
  .put(
    body("_id").isString().notEmpty(),
    body("phoneNo").isString().notEmpty(),
    body("password").isString().notEmpty(),
    requestDataValidation,
    resetPassword
  );

module.exports = router;
