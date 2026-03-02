#!/usr/bin/env node
const FIREBASE_API_KEY = "AIzaSyAj7-7d1ez68B4J4pHxZyz_Er4SOXiYuJ8";
const RT = "AMf-vByOTzKwCa8OYnjihVgPICO2_h8iZ9GKkfvbXx2D3Jstv9DDV4cXqcPRAt6yZyuxbJsG63utuNAs0d_i9vx6xb3qoYWE5WZAFeEsujzkSeddWPpwhoNtTQPfqTDiyVMyc2ivADH1-cmKOEt_5a1nh-y0R652HxE-PWKGbuXf31ylZtz0YTgtGAubhqQcWs4IMfnFSx3D";
const PROJECT = "flowpulse-dc45a";

async function test() {
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "refresh_token", refresh_token: RT }),
  });
  const d = await res.json();
  const token = d.id_token, uid = d.user_id;
  const now = new Date().toISOString();

  // Test 1: commit endpoint (the proper alternative to batchWrite)
  console.log("--- Test: commit endpoint ---");
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:commit`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: `projects/${PROJECT}/databases/(default)/documents/users/${uid}/activityLogs/test-commit-${Date.now()}`,
              fields: {
                url: { stringValue: "https://test.com" },
                domain: { stringValue: "test.com" },
                title: { stringValue: "Test" },
                category: { stringValue: "productive" },
                startTime: { timestampValue: now },
                endTime: { timestampValue: now },
                duration: { integerValue: "10" },
              },
            },
            currentDocument: { exists: false },
          },
        ],
      }),
    }
  );
  console.log("Status:", r.status);
  const rd = await r.json();
  console.log(JSON.stringify(rd, null, 2).slice(0, 300));

  // Test 2: Parallel createDocument calls
  console.log("\n--- Test: Parallel createDocument calls ---");
  const promises = [1, 2, 3].map(async (i) => {
    const cr = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/users/${uid}/activityLogs?documentId=test-parallel-${Date.now()}-${i}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            url: { stringValue: `https://test${i}.com` },
            domain: { stringValue: `test${i}.com` },
            title: { stringValue: `Test ${i}` },
            category: { stringValue: "productive" },
            startTime: { timestampValue: now },
            endTime: { timestampValue: now },
            duration: { integerValue: String(i * 10) },
          },
        }),
      }
    );
    return { i, status: cr.status, ok: cr.ok };
  });
  const results = await Promise.all(promises);
  console.log("Results:", results);
}

test().catch(console.error);
