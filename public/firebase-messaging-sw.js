importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB85m_vJIlmHfVN0XtUU8uaVkmTZUHVT_E",
  authDomain: "iot-malik-peco.firebaseapp.com",
  projectId: "iot-malik-peco",
  storageBucket: "iot-malik-peco.firebasestorage.app",
  messagingSenderId: "783271180068",
  appId: "1:783271180068:web:694edcb942e8299ec225b1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload?.notification?.title || "Motion detected 🚨",
    { body: payload?.notification?.body || "PIR triggered" }
  );
});