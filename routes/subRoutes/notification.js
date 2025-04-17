const express = require("express");
const router = express.Router();
const {
  sendPrivateNotif,
  sendPublicNotif,
  getNotifHistory,
} = require("../../controller/notification");
const requestDataValidation = require("../../middleware/requestDataValidation");
const { body, query } = require("express-validator");

router.post(
  "/private",
  body("competitionId").isString().withMessage("Тэмцээн сонгох шаардлагатай."),
  body("title").isString().withMessage("Гарчиг оруулах шаардлагатай."),
  body("body").isString().withMessage("Мэдээлэл оруулах шаардлагатай."),
  requestDataValidation,
  sendPrivateNotif
);
router.post(
  "/public",
  body("title").isString().withMessage("Гарчиг оруулах шаардлагатай."),
  body("body").isString().withMessage("Мэдээлэл оруулах шаардлагатай."),
  requestDataValidation,
  sendPublicNotif
);
router.get(
  "/history",
  query("page").notEmpty(),
  requestDataValidation,
  getNotifHistory
);

module.exports = router;
