const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const TOPIC = "motion";

const SHARED_SECRET = "KokoMunya44";

exports.motion = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Use POST");

    const { secret } = req.body || {};
    if (secret !== SHARED_SECRET) return res.status(401).send("Unauthorized");

    const message = {
      topic: TOPIC,
      notification: {
        title: "Motion detected 🚨",
        body: "ESP32 PIR triggered",
      },
      data: {
        type: "motion",
        ts: String(Date.now()),
      },
    };

    await admin.messaging().send(message);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

exports.subscribe = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).send("Use POST");

    const { secret, token } = req.body || {};
    if (secret !== SHARED_SECRET) return res.status(401).send("Unauthorized");
    if (!token) return res.status(400).send("Missing token");

    await admin.messaging().subscribeToTopic([token], TOPIC);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});