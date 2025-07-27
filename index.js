const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/", (req, res) => {
  res.send("Roblox Account Age Proxy is running!");
});

app.get("/account-age", async (req, res) => {
  const username = req.query.username;
  if (!username) {
    console.log("[DEBUG] No username provided in request.");
    return res.json({ error: "No username provided" });
  }

  try {
    console.log(`[DEBUG] Looking up username: ${username}`);

    // Step 1: Use POST to /v1/usernames/users
    const lookupUrl = "https://users.roblox.com/v1/usernames/users";
    const lookupPayload = {
      usernames: [username],
      excludeBannedUsers: false
    };
    console.log(`[DEBUG] POSTing to: ${lookupUrl}`);
    const lookupResp = await fetch(lookupUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lookupPayload)
    });
    const lookupData = await lookupResp.json();
    console.log("[DEBUG] Lookup data:", lookupData);

    if (!lookupData.data || !lookupData.data[0] || !lookupData.data[0].id) {
      console.log("[DEBUG] Username not found in Roblox API.");
      return res.json({ error: "Username not found" });
    }
    const userId = lookupData.data[0].id;

    // Step 2: Get creation date
    const detailsUrl = `https://users.roblox.com/v1/users/${userId}`;
    console.log(`[DEBUG] Requesting details at: ${detailsUrl}`);
    const detailsResp = await fetch(detailsUrl);

    if (!detailsResp.ok) {
      console.log(`[DEBUG] Failed to fetch user details. Status: ${detailsResp.status}`);
      return res.json({ error: "Failed to fetch user details from Roblox" });
    }

    const detailsData = await detailsResp.json();
    console.log("[DEBUG] Details data:", detailsData);

    if (!detailsData.created) {
      console.log("[DEBUG] Creation date not found in details.");
      return res.json({ error: "Could not get creation date" });
    }

    // Success!
    console.log(`[DEBUG] Success for ${username}: created on ${detailsData.created}, userId: ${userId}`);
    return res.json({
      username: detailsData.name,
      created: detailsData.created,
      userId: userId // <-- Send userId for avatar!
    });
  } catch (err) {
    console.error("[DEBUG] Error during fetch:", err);
    return res.json({ error: "Error connecting to Roblox API" });
  }
});

// Use default PORT or 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Roblox Account Age Proxy API running on port", PORT);
});
