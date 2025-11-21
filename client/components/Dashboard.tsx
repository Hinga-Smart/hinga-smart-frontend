import { useEffect, useState, useRef } from "react";
import { Download, Eye, Plus, BarChart3 } from "lucide-react";
import { MoistureChart } from "./MoistureChart";
import { StatCard } from "./StatCard";
import { AddSensorForm } from "./AddSensorForm";
import { SensorAnalytics } from "./SensorAnalytics";

import * as api from "@/lib/api";

interface Sensor {
  sensor_id: number;
  sensor_name: string;
  location: string;
  installed_at: string;
  active: boolean;
}

interface MoistureData {
  id?: number;
  sensor_id: number;
  moisture: number;
  state: string;
  timestamp: string;
}

interface ChartDataPoint {
  timestamp: string;
  moisture: number;
  time: string;
}

const getStateColor = (
  state: string
): "from-red-500 to-red-600" | "from-yellow-500 to-yellow-600" | "from-green-500 to-green-600" => {
  const upperState = state?.toUpperCase() || "MODERATE";
  if (upperState === "DRY") return "from-red-500 to-red-600";
  if (upperState === "WET") return "from-green-500 to-green-600";
  return "from-yellow-500 to-yellow-600";
};

const getStateIcon = (state: string): string => {
  const upperState = state?.toUpperCase() || "MODERATE";
  if (upperState === "DRY") return "🌵";
  if (upperState === "WET") return "💧";
  return "🌱";
};

export function Dashboard() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [latestData, setLatestData] = useState<MoistureData | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [sensorsLoading, setSensorsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSensors = async () => {
    try {
      setSensorsLoading(true);
      const data = (await api.getSensors()) as Sensor[];
      setSensors(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !selectedSensor) {
        setSelectedSensor(data[0]);
      }
    } catch (error) {
      console.error("Error fetching sensors:", error);
      setSensors([]);
      // Don't show error to user, just empty state is fine
    } finally {
      setSensorsLoading(false);
    }
  };

  const fetchLatestData = async (sensorId: number) => {
    try {
      const data = (await api.getLatestData(sensorId)) as MoistureData;
      if (data && data.sensor_id) {
        setLatestData(data);
        setHasData(true);
      } else {
        setLatestData(null);
        setHasData(false);
      }
    } catch (error) {
      console.error("Error fetching latest data:", error);
      setLatestData(null);
      setHasData(false);
    }
  };

  const fetchChartData = async (sensorId: number) => {
    try {
      const data = (await api.getAllData(sensorId)) as Array<{
        sensor_id: number;
        moisture: number;
        timestamp: string;
        state: string;
      }>;

      if (Array.isArray(data) && data.length > 0) {
        const processedData: ChartDataPoint[] = data.map((item) => {
          const date = new Date(item.timestamp);
          const timeStr = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return {
            timestamp: item.timestamp,
            moisture: item.moisture,
            time: timeStr,
          };
        });

        setChartData(processedData);
      } else {
        // Set empty array so chart shows "No historical data available" message
        setChartData([]);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      // Set empty array on error so chart still renders with empty state message
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async (sensorId: number) => {
    setLoading(true);
    await Promise.all([fetchLatestData(sensorId), fetchChartData(sensorId)]);
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  useEffect(() => {
    if (selectedSensor) {
      fetchAllData(selectedSensor.sensor_id);

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setInterval(() => {
        fetchAllData(selectedSensor.sensor_id);
      }, 30000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [selectedSensor]);

  const handleDownloadExcel = async () => {
    if (!selectedSensor) return;
    try {
      const blob = await api.downloadCSV(selectedSensor.sensor_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moisture_data_sensor_${selectedSensor.sensor_id}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  const handleViewJSON = async () => {
    if (!selectedSensor) return;
    try {
      const data = await api.getLatestData(selectedSensor.sensor_id);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error viewing JSON:", error);
    }
  };

  if (showAnalytics && selectedSensor) {
    return (
      <div>
        <button
          onClick={() => setShowAnalytics(false)}
          className="fixed top-4 left-4 z-40 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
        >
          ← Back to Dashboard
        </button>
        <SensorAnalytics sensor={selectedSensor} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <img 
                  src="/hinga-logo.png" 
                  alt="HingaSmart Logo" 
                  className="h-16 w-16 object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  HingaSmart
                </h1>
                <p className="text-gray-600 text-sm">
                  Real-time soil moisture monitoring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddSensor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-semibold text-sm"
              >
                <Plus size={18} />
                Add Sensor
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sensor Selection */}
        <div className="mb-8 bg-white rounded-lg shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-gray-900">
              Select Sensor
            </label>
            {selectedSensor && (
              <button
                onClick={() => setShowAnalytics(true)}
                className="flex items-center gap-2 px-3 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-semibold"
              >
                <BarChart3 size={16} />
                View Analytics
              </button>
            )}
          </div>
          {sensorsLoading ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
          ) : sensors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 font-semibold">No sensors available</p>
              <p className="text-gray-500 text-sm mt-2">
                Click "Add Sensor" to create your first sensor
              </p>
            </div>
          ) : (
            <select
              value={selectedSensor?.sensor_id || ""}
              onChange={(e) => {
                const sensor = sensors.find(
                  (s) => s.sensor_id === parseInt(e.target.value)
                );
                if (sensor) setSelectedSensor(sensor);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {sensors.map((sensor) => (
                <option key={sensor.sensor_id} value={sensor.sensor_id}>
                  {sensor.sensor_name}
                  {sensor.location ? ` - ${sensor.location}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedSensor && (
          <>
            {/* Latest Stats Section */}
            {hasData && latestData ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Current Status - {selectedSensor.sensor_name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    label="Latest Moisture"
                    value={latestData.moisture}
                    unit="%"
                    icon="💧"
                    gradient="from-blue-500 to-blue-600"
                  />
                  <StatCard
                    label="Current State"
                    value={latestData.state}
                    icon={getStateIcon(latestData.state)}
                    gradient={getStateColor(latestData.state)}
                  />
                  <StatCard
                    label="Last Updated"
                    value={new Date(latestData.timestamp).toLocaleTimeString()}
                    icon="⏰"
                    gradient="from-purple-500 to-purple-600"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800">
                  No data available for this sensor yet. Data will appear as readings are recorded.
                </p>
              </div>
            )}

            {/* Download & Export Section */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Download & Export
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownloadExcel}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:shadow-lg active:scale-95"
                  >
                    <Download size={20} />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={handleViewJSON}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:shadow-lg active:scale-95"
                  >
                    <Eye size={20} />
                    <span>View Latest JSON</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  ✨ Data auto-refreshes every 30 seconds
                </p>
              </div>
            </div>

            {/* Chart Section - Always show when sensor is selected */}
            <div className="mb-8">
              <MoistureChart
                data={chartData}
                loading={loading}
                sensorName={selectedSensor.sensor_name}
              />
            </div>
          </>
        )}
      </main>

      {/* Add Sensor Modal */}
      {showAddSensor && (
        <AddSensorForm
          onClose={() => setShowAddSensor(false)}
          onSuccess={fetchSensors}
        />
      )}
    </div>
  );
}
