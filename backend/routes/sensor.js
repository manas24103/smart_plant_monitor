const express = require('express');
const Sensor = require('../models/Sensor');

const router = express.Router();

// 🔥 POST API (ESP32 sends data here)
router.post("/", async (req, res) => {
  try {
    const { temperature, humidity, soilMoisture, lightLevel } = req.body;

    const newData = new Sensor({
      temperature,
      humidity,
      soil: soilMoisture,  // Map soilMoisture -> soil
      light: lightLevel    // Map lightLevel -> light
    });

    await newData.save();

    console.log("ESP32 Data:", req.body);
    console.log("Data saved to MongoDB:", newData);

    res.status(200).json({ message: "Data stored successfully" });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: "Failed to store data" });
  }
});

// 🔥 GET API (Frontend// Get sensor data (protected)
router.get("/", async (req, res) => {
  try {
    const data = await Sensor.find().sort({ createdAt: -1 }).limit(1);
    res.json(data[0] || {});
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

module.exports = router;
