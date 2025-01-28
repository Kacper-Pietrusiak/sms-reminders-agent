const { google } = require("googleapis");
const fs = require("fs");

const authorize = () => {
  const credentials = JSON.parse(fs.readFileSync("credentials.json"));
  const { client_secret, client_id, redirect_uris } = credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  const token = JSON.parse(fs.readFileSync("token.json"));
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
};

const addEvent = async (event) => {
  const auth = authorize();
  const calendar = google.calendar({ version: "v3", auth });

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    console.log("Wydarzenie dodane do Kalendarza Google:", response.data);
  } catch (error) {
    console.error("Błąd podczas dodawania wydarzenia:", error.message);
  }
};

module.exports = { addEvent };
