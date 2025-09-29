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

dotenv.config({ path: "./config/configProduction.env" });

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
  const theCompetition = await models.competition
    .findOne({ _id: "68b1e13945b2dc047d6c2fe0" })
    .lean();

  const categories = theCompetition.categories;

  for (let i = 0; i < categories.length; i++) {
    const ranking = await models.ranking
      .find({ categoryId: categories[i]._id })
      .lean();

    for (let j = 0; j < ranking.length; j++) {
      const userId = await models.user
        .findOne({ _id: ranking[j].userId })
        .lean();

      if (userId) {
        console.log("Find ", userId.lastName);
      }
      if (!userId) {
        const user = await models.participant
          .findOne({
            _id: ranking[j].userId,
          })
          .populate("userId")
          .lean();

        if (user) {
          console.log("Find participant ", user._id, user.userId._id);

          const activity = await models.rankingActivity
            .find({ userId: user._id })
            .lean();

          if (activity.length > 0) {
            for (let k = 0; k < activity.length; k++) {
              await models.rankingActivity.updateOne(
                { _id: activity[k]._id },
                { userId: user.userId._id }
              );
            }
          }

          await models.ranking.updateOne(
            { _id: ranking[j]._id },
            { userId: user.userId._id }
          );
        }
      }
    }
  }

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
