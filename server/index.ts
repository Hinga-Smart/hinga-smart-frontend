import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  handleLatest,
  handleData,
  handleDownloadExcel,
  handleSensors,
  handleAddSensor,
  handleUpdateSensor,
  handleSensorData,
} from "./routes/moisture";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Moisture sensor API routes (proxy to Flask backend)
  app.get("/api/sensors", handleSensors);
  app.post("/api/sensor/add", handleAddSensor);
  app.put("/api/sensor/update/:sensor_id", handleUpdateSensor);
  app.post("/api/data", handleSensorData);
  app.get("/api/latest", handleLatest);
  app.get("/api/all", handleData);
  app.get("/api/download-excel", handleDownloadExcel);

  return app;
}
