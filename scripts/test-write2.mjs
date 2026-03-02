#!/usr/bin/env node
/**
 * Test different Firestore write approaches to find what works.
 */
const FIREBASE_API_KEY = "AIzaSyAj7-7d1ez68B4J4pHxZyz_Er4SOXiYuJ8";
const REFRESH_TOKEN = "AMf-vByOTzKwCa8OYnjihVgPICO2_h8iZ9GKkfvbXx2D3Jstv9DDV4cXqcPRAt6yZyuxbJsG63utuNAs0d_i9vx6xb3qoYWE5WZAFeEsujzkSeddWPpwhoNtTQPfqTDiyVMyc2ivADH1-cmKOEt_5a1nh-y0R652HxE-PWKGbuXf31ylZtz0YTgtGAubhqQcWs4IMfnFSx3D";
const PROJECT = "flowpulse-dc45a";

async function getToken() {
  const res = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token: REFRESH_TOKEN }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return { token: data.id_token, uid: data.user_id };
}

async function test() {
  const { token, uid } = await getToken();
  console.log("Token OK, uid:", uid);
  const now = new Date().toISOString();
  const docId = `test-${Date.now()}`;

  // Test 1: Regular createDocument (not batchWrite)
  console.log("\n--- Test 1: createDocument (REST create) ---");
  const createRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/users/${uid}/activityLogs?documentId=${docId}-create`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          url: { stringValue: "https://github.com/test" },
          domain: { stringValue: "github.com" },
          title: { stringValue: "Test Page" },
          category: { stringValue: "productive" },
          startTime: { timestampValue: now },
          endTime: { timestampValue: now },
          duration: { integerValue: "10" },
        },
      }),
    }
  );
  console.log("Status:", createRes.status);
  const createData = await createRes.json();
  console.log("Response:", JSON.stringify(createData, null, 2).slice(0, 300));

  // Test 2: batchWrite with update (what extension uses)
  console.log("\n--- Test 2: batchWrite with update ---");
  const batchRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:batchWrite`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        writes: [{
          update: {
            name: `projects/${PROJECT}/databases/(default)/documents/users/${uid}/activityLogs/${docId}-batch`,
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
        }],
      }),
    }
  );
  console.log("Status:", batchRes.status);
  const batchData = await batchRes.json();
  console.log("Response:", JSON.stringify(batchData, null, 2).slice(0, 300));

  // Test 3: batchWrite but with duration as doubleValue
  console.log("\n--- Test 3: batchWrite with doubleValue duration ---");
  const batch3Res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:batchWrite`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        writes: [{
          update: {
            name: `projects/${PROJECT}/databases/(default)/documents/users/${uid}/activityLogs/${docId}-batch3`,
            fields: {
              url: { stringValue: "https://github.com/test" },
              domain: { stringValue: "github.com" },
              title: { stringValue: "Test Page" },
              category: { stringValue: "productive" },
              startTime: { timestampValue: now },
              endTime: { timestampValue: now },
              duration: { doubleValue: 10 },
            },
          },
        }],
      }),
    }
  );
  console.log("Status:", batch3Res.status);
  const batch3Data = await batch3Res.json();
  console.log("Response:", JSON.stringify(batch3Data, null, 2).slice(0, 300));

  // Test 4: Simplified rules test - write to dailyStats (which has no field validation)
  console.log("\n--- Test 4: Write to dailyStats (no field validation) ---");
  const statsRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/users/${uid}/dailyStats/test-date`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: { test: { stringValue: "hello" } },
      }),
    }
  );
  console.log("Status:", statsRes.status);
  const statsData = await statsRes.json();
  console.log("Response:", JSON.stringify(statsData, null, 2).slice(0, 300));
}

test().catch((e) => console.error(e));
