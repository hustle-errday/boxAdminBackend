const models = require("../models/models");
const { google } = require("googleapis");
const cron = require("node-cron");
const axios = require("axios");

let accessToken;

const notifAuth = async () => {
  console.log("Notification google auth success");

  // for sending notifications to the devices we need to authenticate with google
  const auth = new google.auth.GoogleAuth({
    keyFile: "config/boxapp-c5ab6-firebase-adminsdk-fbsvc-e14efadce9.json",
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  // here are access token
  accessToken = await client.getAccessToken();

  // google access tokens typically have an expiration time of one hour
  cron.schedule("0 * * * *", async () => {
    console.log("Refreshing Google auth token every hour");

    // here are access token
    accessToken = await client.getAccessToken();
  });
};

const sendNotification = async (token, title, incomingBody) => {
  if (!accessToken) {
    await notifAuth();
  }
  const headers = {
    Authorization: `Bearer ${accessToken.token}`,
    "Content-Type": "application/json",
  };

  const body = {
    message: {
      token: token,
      notification: {
        title: title,
        body: incomingBody,
      },
    },
  };

  // send the notification
  await axios
    .post(process.env.FCM_URL, body, { headers })
    .then((res) => {
      console.log(res.data);
    })
    .catch(async (err) => {
      // if the token is not found, we delete it from the database
      // because it's not valid anymore
      // if (
      //   err.response &&
      //   err.response.status === 404 &&
      //   err.response.statusText === "Not Found"
      // ) {
      //   // some parsing to get the token
      //   const errData = JSON.parse(err.response.config.data);
      //   const theToken = await models.notification.findOne({
      //     notifKey: errData.message.token,
      //   });
      //   if (theToken) {
      //     await models.notification.deleteOne({
      //       notifKey: errData.message.token,
      //     });
      //     console.log("deleted the token");
      //   }
      // }
    });
};

module.exports = {
  notifAuth,
  sendNotification,
};
