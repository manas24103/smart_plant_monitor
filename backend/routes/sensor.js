const express = require('express');
const Sensor = require('../models/Sensor');

const router = express.Router();

// POST API (ESP32 sends data here)
router.post("/", async (req, res) => {
  console.log("📥 ESP32 POST Request - Body:", req.body);
  console.log("📥 ESP32 POST Request - Headers:", req.headers);
  
  try {
    const { temperature, humidity, soilMoisture, lightLevel } = req.body;

    console.log("🔍 Parsed data:", { temperature, humidity, soilMoisture, lightLevel });
    console.log("🌱 Soil moisture type:", typeof soilMoisture, "value:", soilMoisture);

    // Validate and constrain soil moisture to 0-100 range
    let validSoilMoisture = soilMoisture;
    if (typeof soilMoisture === 'number') {
      validSoilMoisture = Math.max(0, Math.min(100, soilMoisture));
      if (validSoilMoisture !== soilMoisture) {
        console.log("🔧 Soil moisture constrained from", soilMoisture, "to", validSoilMoisture);
      }
    } else {
      console.log("❌ Invalid soil moisture type, setting to 0");
      validSoilMoisture = 0;
    }

    const newData = new Sensor({
      temperature,
      humidity,
      soil: validSoilMoisture,  // Store validated soil moisture
      light: lightLevel    // Map lightLevel -> light
    });

    await newData.save();

    console.log("✅ Data saved to MongoDB:", newData);
    console.log("📊 Total sensor documents in DB:", await Sensor.countDocuments());

    res.status(200).json({ message: "Data stored successfully" });
  } catch (err) {
    console.log("❌ POST Error:", err);
    res.status(500).json({ error: "Failed to store data" });
  }
});

// Test endpoint to verify backend is working
router.get("/test", async (req, res) => {
  const count = await Sensor.countDocuments();
  const latest = await Sensor.findOne().sort({ createdAt: -1 });
  
  res.json({
    message: "Backend is working",
    totalRecords: count,
    latestRecord: latest,
    timestamp: new Date().toISOString()
  });
});

// GET API (Frontend uses this)
router.get("/", async (req, res) => {
  console.log("📤 Frontend GET Request for sensor data");
  
  try {
    const allData = await Sensor.find().sort({ createdAt: -1 });
    const latestData = allData[0] || {};
    
    console.log("📊 Found sensor documents:", allData.length);
    console.log("📊 Latest data being sent:", latestData);
    console.log("🌱 Soil moisture in latest data:", latestData.soil, "(type:", typeof latestData.soil, ")");
    
    res.json(latestData);
  } catch (err) {
    console.log("❌ GET Error:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

module.exports = router;
