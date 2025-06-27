const express = require("express");
const app = express();
const morgan = require("morgan");
const dotenv = require("dotenv");
const https = require("https");
const http = require("http");
var cors = require("cors");
const fs = require("fs");
const authRoutes = require("./routes/auth");
const mainRoutes = require("./routes/mainRoutes");
const models = require("./models/models");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swaggerDoc.json");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const { authenticateRequest } = require("./middleware/validateRequest");
const { byeParticipantNextRound } = require("./jobs/competitionJobs");
const { updateRankings } = require("./jobs/rankingJob");
const { notifAuth } = require("./config/notification");

dotenv.config({ path: "./config/config.env" });

connectDB();
notifAuth();
updateRankings();
byeParticipantNextRound();

if (process.env.NODE_ENV === "production") {
  const privatekey = fs.readFileSync("/etc/ssl/warfc/warfc.key");
  const certificate = fs.readFileSync("/etc/ssl/warfc/warfc.crt");
  const credentials = { key: privatekey, cert: certificate };

  https.createServer(credentials, app).listen(process.env.PORT, () => {
    console.log(`started on ${process.env.PORT}`);
  });
}
if (process.env.NODE_ENV === "development") {
  http.createServer(app).listen(process.env.PORT, () => {
    console.log(`started on ${process.env.PORT}`);
  });
}

app.get("/mba", async (req, res) => {
  // await models.participant.create({
  //   competitionId: "67f55be2aab43cf945946535",
  //   userId: "67ffbd286eb6b77e72d4a3c6",
  //   chargePaid: true,
  //   categoryId: "67ce56aa82dadbbe4dc92ea6",
  //   status: "approved",
  //   paidAt: "2025-04-18 12:27:26",
  // });

  // await models.match.create({
  //   competitionId: "67f55be2aab43cf945946535",
  //   categoryId: "67ce56aa82dadbbe4dc92ea6",
  //   playerOne: "685cbfbd9dc0fa219561aa5b",
  //   playerTwo: null,
  //   round: 1,
  //   matchNumber: 2,
  //   createdAt: "2025-04-19 09:22:44",
  //   winner: "685cbfbd9dc0fa219561aa5b",
  // });

  // await models.match.create({
  //   competitionId: "67f55be2aab43cf945946535",
  //   categoryId: "67ce56aa82dadbbe4dc92ea6",
  //   playerOne: null,
  //   playerTwo: "685cbfbd9dc0fa219561aa5b",
  //   round: 2,
  //   matchNumber: 1,
  //   createdAt: "2025-04-19 09:22:45",
  // });

  // const matches = await models.match
  //   .find({
  //     winner: { $exists: true, $ne: null },
  //     playerOne: { $exists: true, $ne: null },
  //     playerTwo: { $exists: true, $ne: null },
  //   })
  //   .populate("winner", "_id")
  //   .lean();

  // for (const match of matches) {
  //   const userId = await models.participant.findOne({
  //     _id: match.winner._id,
  //     competitionId: match.competitionId,
  //   });

  //   await trackScoreUpdate(match, userId.userId, 1);

  //   console.log(`✅ Logged match ${match._id}`);
  // }

  res.status(200).json({
    success: true,
  });
});

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", authRoutes);
app.use("/api", authenticateRequest, mainRoutes);
app.use(errorHandler);
