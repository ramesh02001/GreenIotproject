import React, { useState, useEffect, useCallback } from "react";
import "./App.css"; // Import CSS file

const App = () => {
  const [latestData, setLatestData] = useState(null);
  const [allData, setAllData] = useState([]);
  const [actions, setActions] = useState([]);
  const [temperature, setTemperature] = useState(22); // Default temperature

  // Fetch latest sensor data
  const fetchLatestData = async () => {
    try {
      const response = await fetch("http://localhost:3002/latest-data", {
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      setLatestData(result.data);
    } catch (error) {
      console.error("Error fetching latest data:", error);
    }
  };

  // Fetch all sensor data
  const fetchAllData = async () => {
    try {
      const response = await fetch("http://localhost:3002/all-data", {
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      setAllData(result.data);
    } catch (error) {
      console.error("Error fetching all data:", error);
    }
  };

  // Memoize generateData using useCallback
  const generateData = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3002/generate-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      setActions(result.actions);
      fetchLatestData(); // Refresh latest data after generating new data
    } catch (error) {
      console.error("Error generating data:", error);
    }
  }, []); // Empty dependency array to ensure generateData function stays the same across renders

  // Handle temperature increase or decrease
  const increaseTemperature = () => setTemperature((prev) => prev + 1);
  const decreaseTemperature = () => setTemperature((prev) => prev - 1);

  // Function to determine the color for the temperature button
  const getTemperatureColor = (temp) => {
    if (temp > 30) return "red";   // High temperature
    if (temp < 20) return "blue";  // Low temperature
    return "green";  // Moderate temperature
  };

  // Function to render temperature control button based on temperature status
  const renderTemperatureButton = () => {
    if (latestData) {
      const isTemperatureNormal = latestData.temperature === temperature;
      
      if (isTemperatureNormal) {
        return <p className="normal-temp-msg">Temperature is Normal</p>;
      } else if (latestData.temperature > temperature) {
        return (
          <button
            onClick={increaseTemperature}
            className={`temp-btn ${getTemperatureColor(temperature)}`}
          >
            Increase
          </button>
        );
      } else {
        return (
          <button
            onClick={decreaseTemperature}
            className={`temp-btn ${getTemperatureColor(temperature)}`}
          >
            Decrease
          </button>
        );
      }
    }
    return null; // Return null if no temperature data is available
  };

  useEffect(() => {
    generateData(); // Generate data automatically on mount
    fetchLatestData();
    fetchAllData();
  }, [generateData]); // Add generateData to dependency array

  return (
    <div className="app">
      <h1 className="title">Sensor Data Dashboard</h1>
      <button onClick={generateData} className="generate-btn">Generate Sensor Data</button>

      {/* Show Temperature Control */}
      <div className="temperature-control">
        <h3>Temperature: {latestData ? latestData.temperature : temperature}°C</h3>
        {renderTemperatureButton()}
      </div>

      {/* Display Latest Data */}
      <h2>Latest Data</h2>
      {latestData ? (
        <div className="sensor-data">
          <p><strong>Temperature:</strong> {latestData.temperature}°C</p>
          <p><strong>Humidity:</strong> {latestData.humidity}%</p>
          <p><strong>Soil Moisture:</strong> {latestData.soilMoisture}%</p>
          <p><strong>Daylight:</strong> {latestData.daylight}</p>
          <p><strong>Created At:</strong> {new Date(latestData.createdAt).toLocaleString()}</p>
        </div>
      ) : (
        <p>No data available</p>
      )}

      {/* Display Actions */}
      <h2>Actions</h2>
      <ul className="actions-list">
        {actions.length > 0 ? (
          actions.map((action, index) => (
            <li key={index}>{action}</li>
          ))
        ) : (
          <p>No actions to display</p>
        )}
      </ul>

      {/* Display All Data */}
      <h2>All Data</h2>
      {allData.length > 0 ? (
        <div className="all-data">
          {allData.map((data, index) => (
            <div key={index} className="sensor-data">
              <p><strong>Temperature:</strong> {data.temperature}°C</p>
              <p><strong>Humidity:</strong> {data.humidity}%</p>
              <p><strong>Soil Moisture:</strong> {data.soilMoisture}%</p>
              <p><strong>Daylight:</strong> {data.daylight}</p>
              <p><strong>Created At:</strong> {new Date(data.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default App;
