#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>


const char* ssid = "555555555";
const char* password = "87654321";

#define PIR_PIN 27
#define BUZZER_PIN 26

const char* dbUrl = "https://iot-malik-peco-default-rtdb.europe-west1.firebasedatabase.app";
const char* secret = "KokoMunya44";


bool motionSent = false;
unsigned long lastSent = 0;
const unsigned long cooldownMs = 7000;

bool systemOn = true;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(300); 
  }
}


void beepOnce1s() {
  digitalWrite(BUZZER_PIN, HIGH); 
  delay(1000);                    
  digitalWrite(BUZZER_PIN, LOW);  
}

bool sendMotionToDb(){
  if(WiFi.status() != WL_CONNECTED)
  return false;

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient https;

  String url = String(dbUrl) + "/events/motion.json";

  https.begin(client, url);
  https.addHeader("Content-Type", "application/json");

  unsigned long now = millis();
  String body = String("{\"type\":\"motion\",\"ts\":") + now + ",\"secret\":\"" + secret + "\"}";

  int code = https.PUT(body);
  https.end();

  return (code >= 200 && code < 300);
}


void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient https;

  String url = String(dbUrl) + "/device/status.json";
  https.begin(client, url);
  https.addHeader("Content-Type", "application/json");

  unsigned long now = millis();

  String body = String("{\"lastSeen\":") + now + "}";

  https.PUT(body);
  https.end();
}

void setup() {

  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  connectWiFi();
}


String httpGet(const String& url) {
  if (WiFi.status() != WL_CONNECTED) return "";

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient https;

  https.begin(client, url);
  int code = https.GET();
  String payload = (code > 0) ? https.getString() : "";
  https.end();
  return payload;
}

void loop() {
  int motion = digitalRead(PIR_PIN);
  unsigned long now = millis();

  if(motion == HIGH && systemOn)
  {
    if(!motionSent && (now-lastSent >= cooldownMs)) {
      beepOnce1s();
      sendMotionToDb();

      motionSent = true;
      lastSent = now;
    }
  }
  else{
    motionSent = false;
  }
  delay(50);

  static unsigned long lastHeartbeat = 0;
if (millis() - lastHeartbeat > 5000) {
  sendHeartbeat();
  lastHeartbeat = millis();
}

static unsigned long lastCheck = 0;

if (millis() - lastCheck > 1000) {
  lastCheck = millis();

  String url = String(dbUrl) + "/device/beep.json";
  String response = httpGet(url);

  
}
}
