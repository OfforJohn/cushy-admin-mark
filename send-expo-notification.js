// @ts-nocheck
const express = require("express");

const app = express();
app.use(express.json());

const expoTokens = new Set();

app.post("/register", (req, res) => {
  const { token } = req.body;
  if (!token || !token.startsWith("ExponentPushToken")) {
    return res.status(400).json({ error: "Invalid Expo token" });
  }
  expoTokens.add(token);
  console.log("📲 Registered devices:", expoTokens.size);
  res.json({ success: true });
});

app.post("/send", async (req, res) => {
  const { title, body, data } = req.body;

  const messages = [...expoTokens].map(token => ({
    to: token,
    sound: "default",
    title: title || "Hello 👋",
    body: body || "Broadcast from Render",
    data: data || {},
  }));

  if (!messages.length) {
    return res.json({ sent: 0 });
  }

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  const responseData = await response.json();
  res.json({ sent: messages.length, data: responseData });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Expo Push Server running on port ${PORT}`);
});
