#!/usr/bin/env node
/**
 * Test the exact REST API write the extension uses
 */
const FIREBASE_API_KEY = "AIzaSyAj7-7d1ez68B4J4pHxZyz_Er4SOXiYuJ8";
const REFRESH_TOKEN = "AMf-vByOTzKwCa8OYnjihVgPICO2_h8iZ9GKkfvbXx2D3Jstv9DDV4cXqcPRAt6yZyuxbJsG63utuNAs0d_i9vx6xb3qoYWE5WZAFeEsujzkSeddWPpwhoNtTQPfqTDiyVMyc2ivADH1-cmKOEt_5a1nh-y0R652HxE-PWKGbuXf31ylZtz0YTgtGAubhqQcWs4IMfnFSx3D";
const PROJECT = "flowpulse-dc45a";

async function test() {
  // Step 1: Get fresh token via refresh
  console.log("1. Refreshing token...");
  const tokenRes = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token: REFRESH_TOKEN }),
    }
  );
  const tokenData = await tokenRes.json();
  if (tokenData.error) {
    console.log("TOKEN_ERROR:", JSON.stringify(tokenData.error, null, 2));
    return;
  }
  console.log("   TOKEN OK, uid:", tokenData.user_id);
  const uid = tokenData.user_id;
  const token = tokenData.id_token;

  // Step 2: Write a test doc using the EXACT same REST API as the extension
  console.log("\n2. Writing test activityLog via REST batchWrite...");
  const now = new Date().toISOString();
  const docId = `test-${Date.now()}`;

  const writes = [
    {
      update: {
        name: `projects/${PROJECT}/databases/(default)/documents/users/${uid}/activityLogs/${docId}`,
        fields: {
          url: { stringValue: "https://github.com/test" },
          domain: { stringValue: "github.com" },
          title: { stringValue: "Test Page" },
          category: { stringValue: "productive" },
          startTime: { timestampValue: now },
          endTime: { timestampValue: now },
          duration: { integerValue: "10" },
        },
      },
    },
  ];

  const writeRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:batchWrite`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ writes }),
    }
  );

  console.log("   WRITE_STATUS:", writeRes.status);
  const writeData = await writeRes.json();
  console.log("   WRITE_RESPONSE:", JSON.stringify(writeData, null, 2));

  // Step 3: Verify by reading it back
  console.log("\n3. Reading back the document...");
  const readRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/users/${uid}/activityLogs/${docId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log("   READ_STATUS:", readRes.status);
  if (readRes.ok) {
    const readData = await readRes.json();
    console.log("   READ_DOC:", JSON.stringify(readData, null, 2));
  } else {
    console.log("   READ_ERROR:", await readRes.text());
  }
}

test().catch((e) => console.error(e));
