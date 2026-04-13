#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <WiFiClientSecure.h>

// WiFi Configuration
const char* ssid = "Manas Phone";
const char* password = "12345667";

// Server URLs
String server = "https://smart-plant-monitor.onrender.com/api/sensor";
String controlUrl = "https://smart-plant-monitor.onrender.com/api/control";

// Pin Definitions
#define DHT_PIN 4
#define DHT_TYPE DHT22
#define SOIL_PIN 34
#define LIGHT_PIN 33
#define PUMP_PIN 25
#define FAN_PIN 18

// Sensor Objects
DHT dht(DHT_PIN, DHT_TYPE);

// Control Variables
bool autoMode = true;
bool manualPumpState = false;
int fanSpeed = 0;

// Sensor Data Structure
struct SensorData {
  float temperature;
  float humidity;
  int soilMoisture;
  int lightLevel;
};

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(SOIL_PIN, INPUT);
  pinMode(LIGHT_PIN, INPUT);
  
  // Initialize sensors
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi Connected!");
  Serial.println("IP Address: " + WiFi.localIP().toString());
  
  // Initialize outputs to OFF
  digitalWrite(PUMP_PIN, LOW);
  digitalWrite(FAN_PIN, LOW);
}

void loop() {
  // Read sensor data
  SensorData data = readSensors();
  
  // Smart automation logic
  if (autoMode) {
    runSmartAutomation(data);
  }
  
  // Send sensor data to server
  sendSensorData(data);
  
  // Check for manual control commands
  checkControlCommands();
  
  delay(5000); // Send data every 5 seconds
}

SensorData readSensors() {
  SensorData data;
  
  // Read DHT22 sensor
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  
  // Read analog sensors
  int soilRaw = analogRead(SOIL_PIN);
  data.soilMoisture = map(soilRaw, 4095, 1450, 0, 100); // 4095(dry)->0%, 1450(wet)->100%
  data.soilMoisture = constrain(data.soilMoisture, 0, 100); // Ensure 0-100 range
  data.lightLevel = map(analogRead(LIGHT_PIN), 0, 4095, 0, 20000);
  
  // Print sensor values for debugging
  Serial.printf("Raw ADC: %d, Mapped Soil: %d%%, Temp: %.1f°C, Humidity: %.1f%%, Light: %d lux\n",
                soilRaw, data.soilMoisture, data.temperature, data.humidity, data.lightLevel);
  
  return data;
}

void runSmartAutomation(SensorData data) {
  // Smart Watering System
  if (data.soilMoisture < 30) {
    Serial.println("🌱 AUTO: Soil moisture low - Starting water pump");
    digitalWrite(PUMP_PIN, HIGH);
    delay(3000); // Water for 3 seconds
    digitalWrite(PUMP_PIN, LOW);
    Serial.println("💧 AUTO: Watering completed");
  }
  
  // Smart Cooling System
  if (data.temperature > 35) {
    Serial.println("🌡️ AUTO: Temperature high - Starting fan");
    analogWrite(FAN_PIN, 200); // 80% fan speed
  } else if (data.temperature > 30) {
    analogWrite(FAN_PIN, 128); // 50% fan speed
  } else {
    analogWrite(FAN_PIN, 0);   // Fan off
  }
  
  // Light-based automation (for artificial lighting if needed)
  if (data.lightLevel < 5000) {
    Serial.println("💡 AUTO: Low light detected - Consider grow lights");
  }
}

void sendSensorData(SensorData data) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure *client = new WiFiClientSecure();
    client->setInsecure(); // Skip certificate validation for HTTPS
    HTTPClient https;
    https.begin(*client, server);
    https.addHeader("Content-Type", "application/json");
    
    // Create JSON document
    DynamicJsonDocument doc(1024);
    doc["temperature"] = data.temperature;
    doc["humidity"] = data.humidity;
    doc["soilMoisture"] = data.soilMoisture; // Send as soilMoisture for backend
    doc["lightLevel"] = data.lightLevel;     // Send as lightLevel for backend
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    Serial.print("📤 Sending JSON: ");
    Serial.println(jsonString);
    
    // Send HTTPS POST request
    int httpCode = https.POST(jsonString);
    
    Serial.print("🌐 HTTP Response Code: ");
    Serial.println(httpCode);
    
    String response = https.getString();
    Serial.print("📡 Server Response: ");
    Serial.println(response);
    
    if (httpCode > 0) {
      Serial.println("✅ Data sent successfully to server");
    } else {
      Serial.print("❌ Failed to send data. Error: ");
      Serial.println(https.errorToString(httpCode));
    }
    
    Serial.println("🏁 Data send complete");
    https.end();
  }
}

void checkControlCommands() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure *client = new WiFiClientSecure();
    client->setInsecure(); // Skip certificate validation for HTTPS
    HTTPClient https;
    https.begin(*client, controlUrl);
    int httpResponseCode = https.GET();
    
    Serial.print("🎮 Control Response Code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == 200) {
      String payload = https.getString();
      Serial.print("🎮 Control Payload: ");
      Serial.println(payload);
      
      // Parse JSON response
      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        // Manual override controls
        if (doc.containsKey("pump")) {
          manualPumpState = doc["pump"];
          Serial.println("🔧 Manual pump override: " + String(manualPumpState ? "ON" : "OFF"));
          digitalWrite(PUMP_PIN, manualPumpState ? HIGH : LOW);
        }
        
        if (doc.containsKey("fan")) {
          fanSpeed = doc["fan"];
          Serial.println("🔧 Manual fan override: " + String(fanSpeed) + "%");
          analogWrite(FAN_PIN, map(fanSpeed, 0, 100, 0, 255));
        }
        
        if (doc.containsKey("autoMode")) {
          autoMode = doc["autoMode"];
          Serial.println("Auto mode: " + String(autoMode ? "ENABLED" : "DISABLED"));
        }
      }
    }
    
    Serial.println("🎮 Control check complete");
    https.end();
  }
}
