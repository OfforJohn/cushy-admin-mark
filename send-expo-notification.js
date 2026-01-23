// @ts-nocheck
const express = require("express");
const cors = require("cors");

const app = express();

/* ------------------ CORS ------------------ */

const allowedOrigins = [
  "http://localhost:5173",
  "https://cushy-adminaa.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

/* ------------------ TOKENS ------------------ */

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

app.get("/expo-tokens", (req, res) => {
  res.json({ tokens: Array.from(expoTokens) });
});

/* ------------------ SYSTEM NOTIFICATION ------------------ */

app.post("/send-system", async (req, res) => {
  const { title, body, data } = req.body;

  const messages = [...expoTokens].map((token) => ({
    to: token,
    sound: "default",
    title: title || "System Notification",
    body: body || "This is a system notification",
    data: { ...data, type: "SYSTEM" },
  }));

  if (!messages.length) return res.json({ sent: 0 });

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  const responseData = await response.json();
  res.json({ sent: messages.length, data: responseData });
});

/* ------------------ IN-APP (SILENT) ------------------ */

app.post("/send-in-app", async (req, res) => {
  const { title, body, route, url, image, extraInfo, data } = req.body;

 const messages = [...expoTokens].map((token) => ({
  to: token,
  sound: null,
  priority: "high",
  data: {
    type: "IN_APP",
    title,
    body,
    route: route || null,
    url: url || null,
    image: image || null,
    extraInfo: extraInfo || null,
  },
}));


  if (!messages.length) return res.json({ sent: 0 });

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  const responseData = await response.json();
  res.json({ sent: messages.length, data: responseData });
});



/* ------------------ START SERVER ------------------ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Expo Push Server running on port ${PORT}`);
});
