const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "token.json";

// Funkcja do autoryzacji
const authorize = () => {
  const credentials = JSON.parse(fs.readFileSync("credentials.json"));
  const { client_secret, client_id, redirect_uris } = credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Sprawdź, czy token już istnieje
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log("Token już istnieje.");
    return;
  }

  // Wygeneruj URL do autoryzacji
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Otwórz URL w przeglądarce, aby autoryzować aplikację:");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Wklej kod autoryzacyjny tutaj: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Błąd podczas uzyskiwania tokena:", err);
      oAuth2Client.setCredentials(token);

      // Zapisz token do pliku
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
      console.log("Token zapisany do pliku:", TOKEN_PATH);
    });
  });
};

// Uruchom autoryzację
authorize();
