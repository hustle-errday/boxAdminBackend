const express = require("express");
const router = express.Router();

const authRoutes = require("./subRoutes/auth");

router.use("/", authRoutes);

module.exports = router;
