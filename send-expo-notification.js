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

/* ------------------ IN-APP (RICH BANNER) ------------------ */

app.post("/send-in-app", async (req, res) => {
  const {
    title,
    subtitle,
    description,
    icon,
    backgroundColor,
    image,
    badges,
    features,
    cta,
    route,
    url,
  } = req.body;

  // Only include non-null values
  const notificationData = {
    type: "IN_APP",
    title: title || "Notification",
    ...(subtitle && { subtitle }),
    ...(description && { description }),
    ...(icon && { icon }),
    ...(backgroundColor && { backgroundColor }),
    ...(image && { image }),
    ...(badges && Array.isArray(badges) && { badges }),
    ...(features && Array.isArray(features) && { features: JSON.stringify(features) }),
    ...(cta && { cta: JSON.stringify(cta) }),
    ...(route && { route }),
    ...(url && { url }),
  };

  const messages = [...expoTokens].map((token) => ({
    to: token,
    sound: null,
    priority: "high",
    data: notificationData,
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




/* ------------------ EXAMPLE ENDPOINTS FOR TESTING ------------------ */

// Test rich green banner
app.post("/test/logistics-banner", async (req, res) => {
  const messages = [...expoTokens].map((token) => ({
    to: token,
    sound: null,
    priority: "high",
    data: {
      type: "IN_APP",
      title: "New Logistics Feature",
      subtitle: "Send packages faster",
      description: "Experience lightning-fast package delivery with real-time tracking",
      icon: "truck",
      backgroundColor: "green",
      badges: JSON.stringify(["New", "Available Now"]),
      features: JSON.stringify([
        { icon: "truck", text: "Express Delivery", color: "#10B981" },
        { icon: "shield", text: "Full Coverage", color: "#3B82F6" },
        { icon: "lightning", text: "Real-time Tracking", color: "#F59E0B" },
        { icon: "star", text: "Dedicated Support", color: "#8B5CF6" },
      ]),
      cta: JSON.stringify({ text: "Explore Features", icon: "arrow-forward" }),
      route: "/(logistics)",
    },
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  const responseData = await response.json();
  res.json({ sent: messages.length, data: responseData });
});

// Test rich purple banner
app.post("/test/wallet-banner", async (req, res) => {
  const messages = [...expoTokens].map((token) => ({
    to: token,
    sound: null,
    priority: "high",
    data: {
      type: "IN_APP",
      title: "Wallet Upgrade Available",
      subtitle: "Enhanced features unlocked",
      description: "Enjoy seamless transactions with new payment methods",
      icon: "wallet",
      backgroundColor: "purple",
      badges: JSON.stringify(["Premium", "Limited Offer"]),
      features: JSON.stringify([
        { icon: "send", text: "Send Globally", color: "#8B5CF6" },
        { icon: "shield", text: "Bank-Level Security", color: "#6366F1" },
        { icon: "discount", text: "Zero Fees", color: "#A855F7" },
        { icon: "heart", text: "Rewards Program", color: "#D946EF" },
      ]),
      cta: JSON.stringify({ text: "Upgrade Now", icon: "arrow-forward" }),
      route: "/(wallet)",
    },
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  const responseData = await response.json();
  res.json({ sent: messages.length, data: responseData });
});

// Test rich blue banner
app.post("/test/promo-banner", async (req, res) => {
  const messages = [...expoTokens].map((token) => ({
    to: token,
    sound: null,
    priority: "high",
    data: {
      type: "IN_APP",
      title: "Special Promotion",
      subtitle: "Limited time only",
      description: "Get up to 50% off on your next purchase",
      icon: "gift",
      backgroundColor: "blue",
      badges: JSON.stringify(["50% OFF", "Ends Today"]),
      features: JSON.stringify([
        { icon: "discount", text: "50% Discount", color: "#2563EB" },
        { icon: "gift", text: "Free Shipping", color: "#0EA5E9" },
        { icon: "star", text: "Loyalty Points", color: "#06B6D4" },
      ]),
      cta: JSON.stringify({ text: "Claim Offer", icon: "gift" }),
      route: "/",
    },
  }));

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
