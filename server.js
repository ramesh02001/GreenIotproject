const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parses application/json
app.use(bodyParser.urlencoded({ extended: true })); // Parses form data

// Database connection
mongoose.connect('mongodb://localhost:27017/Mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

// Schema for storing sensor data
const sensorDataSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  soilMoisture: Number,
  daylight: String,
  createdAt: { type: Date, default: Date.now },
});

const SensorData = mongoose.model("SensorData", sensorDataSchema);

// Threshold values for comparison
const THRESHOLDS = {
  temperature: 30, // Temperature threshold in Celsius
  humidity: 40,    // Minimum humidity threshold in percentage
  daylight: "LOW", // Trigger artificial lighting when daylight is LOW
};

// Helper function to generate random sensor data
const generateSensorData = () => ({
  temperature: parseFloat((Math.random() * 15 + 20).toFixed(2)), // 20°C to 35°C
  humidity: parseFloat((Math.random() * 40 + 30).toFixed(2)),    // 30% to 70%
  soilMoisture: parseFloat((Math.random() * 50 + 50).toFixed(2)), // 50% to 100%
  daylight: Math.random() > 0.5 ? "HIGH" : "LOW",                // Randomly HIGH or LOW
});

// API to generate and store sensor data with comparison logic
app.post("/generate-data", async (req, res) => {
  try {
    const data = generateSensorData();
    const newData = new SensorData(data);
    await newData.save();

    const actions = [];
    if (data.temperature > THRESHOLDS.temperature) {
      actions.push("Fan motor activated for cooling");
    }
    if (data.humidity < THRESHOLDS.humidity) {
      actions.push("Irrigation system triggered");
    }
    if (data.daylight === THRESHOLDS.daylight) {
      actions.push("Artificial lighting turned on");
    }

    res.status(201).json({ message: "Sensor data generated", data, actions });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate data" });
  }
});

// API to fetch the latest sensor data
app.get("/latest-data", async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ createdAt: -1 });
    if (!latestData) return res.status(404).json({ error: "No data found" });
    res.status(200).json({ data: latestData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// API to fetch all sensor data
app.get("/all-data", async (req, res) => {
  try {
    const allData = await SensorData.find().sort({ createdAt: -1 });
    res.status(200).json({ data: allData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start server
const PORT = 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
