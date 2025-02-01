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
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swaggerDoc.json");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const { authenticateRequest } = require("./middleware/validateRequest");

dotenv.config({ path: "./config/config.env" });

connectDB();

if (process.env.NODE_ENV === "production") {
  const privatekey = fs.readFileSync("/etc/ssl/viot.mn/viot.key");
  const certificate = fs.readFileSync("/etc/ssl/viot.mn/viot.crt");
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

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/auth", authRoutes);
app.use("/api", authenticateRequest, mainRoutes);
app.use(errorHandler);
