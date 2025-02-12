const express = require("express");
const router = express.Router();

const typeRoutes = require("./subRoutes/type");
const clubRoutes = require("./subRoutes/club");
const imageRoutes = require("./subRoutes/image");
const categoryRoutes = require("./subRoutes/category");
const adminRoutes = require("./subRoutes/adminAccount");
const competitionRoutes = require("./subRoutes/competition");

router.use("/type", typeRoutes);
router.use("/club", clubRoutes);
router.use("/image", imageRoutes);
router.use("/admin", adminRoutes);
router.use("/category", categoryRoutes);
router.use("/competition", competitionRoutes);

module.exports = router;
