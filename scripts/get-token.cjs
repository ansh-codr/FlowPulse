const path = require("path");
const admin = require("firebase-admin");
const sa = require(path.join(__dirname, "..", "service-account.json"));
admin.initializeApp({ credential: admin.credential.cert(sa) });

async function main() {
  const customToken = await admin.auth().createCustomToken("24GSYbfrI0UuEeNweA4nl70pxyq1");
  
  // Exchange custom token for ID token via REST
  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyAj7-7d1ez68B4J4pHxZyz_Er4SOXiYuJ8`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = await resp.json();
  console.log("ID_TOKEN:" + data.idToken);
  console.log("REFRESH_TOKEN:" + data.refreshToken);
  console.log("EXPIRES_IN:" + data.expiresIn);
}

main().catch(console.error);
