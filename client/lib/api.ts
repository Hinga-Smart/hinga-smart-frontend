// API base URL - use environment variable or default to deployed backend
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://hinga-smart-server.vercel.app";

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.status || errorData.error || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Handle network errors (CORS, connection issues, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Failed to connect to server. This is likely a CORS issue. Please ensure your Flask backend has CORS enabled."
      );
    }
    throw error;
  }
}

// Sensor management
export async function getSensors() {
  return apiRequest("/sensors");
}

export async function addSensor(data: {
  sensor_id: number;
  sensor_name: string;
  location?: string;
}) {
  return apiRequest("/sensor/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSensor(
  sensorId: number,
  data: { sensor_name?: string; location?: string }
) {
  return apiRequest(`/sensor/update/${sensorId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Moisture data
export async function getLatestData(sensorId: number) {
  return apiRequest(`/latest?sensor_id=${sensorId}`);
}

export async function getAllData(sensorId: number) {
  return apiRequest(`/all?sensor_id=${sensorId}`);
}

export async function submitData(data: {
  sensor_id: number;
  moisture: number;
  state?: string;
}) {
  return apiRequest("/data", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Download CSV
export async function downloadCSV(sensorId: number): Promise<Blob> {
  const url = `${API_BASE_URL}/all?sensor_id=${sensorId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download CSV: ${response.status}`);
  }

  const data = await response.json() as Array<{
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
  return new Blob([csv], { type: "text/csv" });
}

