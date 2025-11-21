import { RequestHandler } from "express";

const FLASK_API = "https://hinga-smart-server.vercel.app";

export const handleSensors: RequestHandler = async (_req, res) => {
  try {
    const response = await fetch(`${FLASK_API}/sensors`);
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Flask API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.status || errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      console.error("Flask API error:", errorMessage);
      // Return empty array if 404 or if database has no sensors
      if (response.status === 404 || response.status === 500) {
        return res.status(200).json([]);
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    // Ensure we always return an array
    res.status(200).json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error fetching sensors:", error);
    // Return empty array instead of error so frontend can handle gracefully
    res.status(200).json([]);
  }
};

export const handleAddSensor: RequestHandler = async (req, res) => {
  try {
    const response = await fetch(`${FLASK_API}/sensor/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status || `Flask API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error adding sensor:", error);
    const message =
      error instanceof Error ? error.message : "Failed to add sensor";
    res.status(400).json({ status: message });
  }
};

export const handleLatest: RequestHandler = async (req, res) => {
  try {
    const sensorId = req.query.sensor_id;
    const url = sensorId
      ? `${FLASK_API}/latest?sensor_id=${sensorId}`
      : `${FLASK_API}/latest`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Flask API error: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching latest data:", error);
    res.status(500).json({ error: "Failed to fetch latest data" });
  }
};

export const handleData: RequestHandler = async (req, res) => {
  try {
    const sensorId = req.query.sensor_id;
    const url = sensorId
      ? `${FLASK_API}/all?sensor_id=${sensorId}`
      : `${FLASK_API}/all`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Flask API error: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching all data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};

export const handleUpdateSensor: RequestHandler = async (req, res) => {
  try {
    const sensorId = req.params.sensor_id;
    const response = await fetch(`${FLASK_API}/sensor/update/${sensorId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status || `Flask API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error updating sensor:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update sensor";
    res.status(400).json({ status: message });
  }
};

export const handleSensorData: RequestHandler = async (req, res) => {
  try {
    const response = await fetch(`${FLASK_API}/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status || `Flask API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error recording sensor data:", error);
    const message =
      error instanceof Error ? error.message : "Failed to record sensor data";
    res.status(400).json({ status: message });
  }
};

export const handleDownloadExcel: RequestHandler = async (req, res) => {
  try {
    const sensorId = req.query.sensor_id;
    const url = sensorId
      ? `${FLASK_API}/all?sensor_id=${sensorId}`
      : `${FLASK_API}/all`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Flask API error: ${response.status}`);
    }
    const data = (await response.json()) as Array<{
      sensor_id: number;
      moisture: number;
      timestamp: string;
      state: string;
    }>;

    // Convert to CSV format
    const csvHeader = "Timestamp,Sensor ID,Moisture,State\n";
    const csvRows = data
      .map((item) => {
        const date = new Date(item.timestamp).toLocaleString();
        return `"${date}",${item.sensor_id},${item.moisture},${item.state}`;
      })
      .join("\n");

    const csv = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=moisture_data_${sensorId || "all"}.csv`
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error generating CSV:", error);
    res.status(500).json({ error: "Failed to generate CSV" });
  }
};
