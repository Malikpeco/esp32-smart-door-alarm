import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyB85m_vJIlmHfVN0XtUU8uaVkmTZUHVT_E",
  authDomain: "iot-malik-peco.firebaseapp.com",
  projectId: "iot-malik-peco",
  databaseURL: "https://iot-malik-peco-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "iot-malik-peco.firebasestorage.app",
  messagingSenderId: "783271180068",
  appId: "1:783271180068:web:694edcb942e8299ec225b1"
};

const SHARED_SECRET = "KokoMunya44";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
if (!listEl || !statusEl) {
  console.error("Missing #list or #status in index.html");
}

statusEl.textContent = "OFFLINE";

let lastHeartbeatReceivedAt = 0; 

function refreshStatus() {
  const now = Date.now();
  const diff = now - lastHeartbeatReceivedAt;

  if (lastHeartbeatReceivedAt !== 0 && diff < 10000) {
    statusEl.textContent = "ONLINE";
  } else {
    statusEl.textContent = "OFFLINE";
  }
}

setInterval(refreshStatus, 1000);

const statusRef = ref(db, "device/status");

onValue(
  statusRef,
  (snap) => {
    const data = snap.val();
    if (!data) return;

    lastHeartbeatReceivedAt = Date.now();
    refreshStatus();
  },
  (err) => {
    console.error("Heartbeat listener error:", err);
    statusEl.textContent = "ERROR";
  }
);

let lastSeenTs = null;
const motionRef = ref(db, "events/motion");

onValue(
  motionRef,
  (snap) => {
    const data = snap.val();
    if (!data) return;

    if (data.secret !== SHARED_SECRET) return;

    if (lastSeenTs === data.ts) return;
    lastSeenTs = data.ts;

    const when = new Date().toLocaleString();
    const li = document.createElement("li");
    li.textContent = `Motion detected at ${when}`;

    listEl.prepend(li);
  },
  (err) => {
    console.error("Motion listener error:", err);
  }
);


const sosBtn = document.getElementById("sosBtn");
const beepRef=ref(db,"device/beep");
sosBtn.addEventListener("click",async () =>{
  await set(beepRef,1);
})
