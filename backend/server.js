const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT;

// Import routes
const sensorRoutes = require('./routes/sensor');
const authRoutes = require('./routes/auth');

// MongoDB Connection - Using environment variable
const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl, {
  family: 4,                     // 🔥 fixes DNS issue
  serverSelectionTimeoutMS: 5000 // prevents hanging
})
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.log("MongoDB error ❌", err));

// Middleware
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log('📥 Backend Request:', {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Control data storage
let controlData = {
    pump: false,
    fan: 0
};

// Use routes
app.use('/api/sensor', sensorRoutes);
app.use('/api', authRoutes);

// Control API (legacy - for ESP32)
app.post('/api/control', (req, res) => {
    controlData = req.body;
    res.send("Control updated");
});

app.get('/api/control', (req, res) => {
    res.json(controlData);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
