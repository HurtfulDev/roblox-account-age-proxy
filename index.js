const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/", (req, res) => {
  res.send("Roblox Account Age Proxy is running!");
});

app.get("/account-age", async (req, res) => {
  const username = req.query.username;
  if (!username) return res.json({ error: "No username provided" });

  try {
    // Step 1: Get userId by username
    const lookupResp = await fetch(`https://api.roblox.com/users/get-by-username?username=${encodeURIComponent(username)}`);
    const lookupData = await lookupResp.json();
    if (!lookupData.Id) {
      return res.json({ error: "Username not found" });
    }
    const userId = lookupData.Id;

    // Step 2: Get creation date
    const detailsResp = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    const detailsData = await detailsResp.json();
    if (!detailsData.created) {
      return res.json({ error: "Could not get creation date" });
    }

    return res.json({
      username: detailsData.name,
      created: detailsData.created,
    });
  } catch (err) {
    return res.json({ error: "Error connecting to Roblox API" });
  }
});

// Use Render's default PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Roblox Account Age Proxy API running on port", PORT);
});
