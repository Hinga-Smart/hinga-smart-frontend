/**
 * API utility functions for communicating with the Flask backend
 * All routes are proxied through Express server at /api/*
 */

const API_BASE_URL = ""; // Empty string means use relative URLs (works with Express proxy)

/**
 * Get all sensors
 */
export async function getSensors() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sensors`);
    if (!response.ok) {
      // If error, try to parse error message
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch sensors: ${response.status}`);
      } catch (e) {
        throw new Error(`Failed to fetch sensors: ${response.status}`);
      }
    }
    const data = await response.json();
    // Always return an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error in getSensors:", error);
    // Return empty array on error so UI doesn't break
    return [];
  }
}

/**
 * Add a new sensor
 */
export async function addSensor(data: {
  sensor_id: number;
  sensor_name: string;
  location?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/sensor/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.status || "Failed to add sensor");
  }

  return response.json();
}

/**
 * Update a sensor
 */
export async function updateSensor(
  sensorId: number,
  data: {
    sensor_name?: string;
    location?: string;
    active?: boolean;
  }
) {
  const response = await fetch(`${API_BASE_URL}/api/sensor/update/${sensorId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.status || "Failed to update sensor");
  }

  return response.json();
}

/**
 * Get latest moisture reading
 */
export async function getLatestData(sensorId?: number) {
  const url = sensorId
    ? `${API_BASE_URL}/api/latest?sensor_id=${sensorId}`
    : `${API_BASE_URL}/api/latest`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest data: ${response.status}`);
  }
  return response.json();
}

/**
 * Get all moisture readings
 */
export async function getAllData(sensorId?: number) {
  const url = sensorId
    ? `${API_BASE_URL}/api/all?sensor_id=${sensorId}`
    : `${API_BASE_URL}/api/all`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch all data: ${response.status}`);
  }
  return response.json();
}

/**
 * Submit moisture data (for IoT devices or manual entry)
 */
export async function submitSensorData(data: {
  sensor_id: number;
  moisture: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.status || "Failed to submit sensor data");
  }

  return response.json();
}

/**
 * Download CSV export
 */
export async function downloadCSV(sensorId?: number): Promise<Blob> {
  const url = sensorId
    ? `${API_BASE_URL}/api/download-excel?sensor_id=${sensorId}`
    : `${API_BASE_URL}/api/download-excel`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.status}`);
  }
  return response.blob();
}

