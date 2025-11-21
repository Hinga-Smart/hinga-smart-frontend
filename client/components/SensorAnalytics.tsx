import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Info, MapPin, Calendar, Zap } from "lucide-react";
import { StatCard } from "./StatCard";
import * as api from "@/lib/api";

interface SensorData {
  sensor_id: number;
  sensor_name: string;
  location: string;
  installed_at: string;
  active: boolean;
}

interface MoistureRecord {
  sensor_id: number;
  moisture: number;
  timestamp: string;
  state: string;
}

interface SensorAnalyticsProps {
  sensor: SensorData;
}

export function SensorAnalytics({ sensor }: SensorAnalyticsProps) {
  const [data, setData] = useState<MoistureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    min: 0,
    max: 0,
    average: 0,
    dryCount: 0,
    moderateCount: 0,
    wetCount: 0,
  });

  useEffect(() => {
    fetchSensorData();
  }, [sensor.sensor_id]);

  const fetchSensorData = async () => {
    try {
      setLoading(true);
      const records = (await api.getAllData(sensor.sensor_id)) as MoistureRecord[];
      setData(records);

      if (records.length > 0) {
        const moistureValues = records.map((r) => r.moisture);
        const min = Math.min(...moistureValues);
        const max = Math.max(...moistureValues);
        const average =
          Math.round(
            (moistureValues.reduce((a, b) => a + b, 0) / moistureValues.length) *
              100
          ) / 100;

        const dryCount = records.filter((r) => r.state === "DRY").length;
        const moderateCount = records.filter((r) => r.state === "MODERATE").length;
        const wetCount = records.filter((r) => r.state === "WET").length;

        setStats({ min, max, average, dryCount, moderateCount, wetCount });
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    return data.map((item) => {
      const date = new Date(item.timestamp);
      return {
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        moisture: item.moisture,
        state: item.state,
        timestamp: item.timestamp,
      };
    });
  };

  const getStateDistribution = () => {
    return [
      { name: "DRY", count: stats.dryCount, fill: "#ef4444" },
      { name: "MODERATE", count: stats.moderateCount, fill: "#eab308" },
      { name: "WET", count: stats.wetCount, fill: "#22c55e" },
    ].filter((item) => item.count > 0);
  };

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Sensor Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {sensor.sensor_name}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{sensor.location || "Location not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>
                Installed:{" "}
                {new Date(sensor.installed_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={18} />
              <span className={sensor.active ? "text-green-600" : "text-red-600"}>
                {sensor.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading sensor analytics...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <Info className="mx-auto text-yellow-600 mb-4" size={32} />
            <p className="text-yellow-800 font-semibold">No data available</p>
            <p className="text-yellow-700 text-sm mt-2">
              This sensor hasn't recorded any measurements yet.
            </p>
          </div>
        ) : (
          <>
            {/* Key Statistics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Moisture Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                  label="Minimum"
                  value={stats.min}
                  unit="%"
                  icon="📉"
                  gradient="from-orange-500 to-orange-600"
                />
                <StatCard
                  label="Maximum"
                  value={stats.max}
                  unit="%"
                  icon="📈"
                  gradient="from-purple-500 to-purple-600"
                />
                <StatCard
                  label="Average"
                  value={stats.average}
                  unit="%"
                  icon="📊"
                  gradient="from-blue-500 to-blue-600"
                />
                <StatCard
                  label="Total Records"
                  value={data.length}
                  icon="📝"
                  gradient="from-indigo-500 to-indigo-600"
                />
              </div>
            </div>

            {/* Line Chart */}
            <div className="mb-8 bg-white rounded-lg shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Moisture Trend Over Time
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 1000]}
                    label={{
                      value: "Moisture Level",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                    formatter={(value) => [
                      `${typeof value === "number" ? value : 0}`,
                      "Moisture",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="moisture"
                    stroke="#3b82f6"
                    fill="url(#colorMoisture)"
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* State Distribution */}
            {getStateDistribution().length > 0 && (
              <div className="mb-8 bg-white rounded-lg shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Soil State Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getStateDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f3f4f6" }}
                      formatter={(value) => [`${value} readings`, "Count"]}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {getStateDistribution().map((item, index) => (
                        <Bar
                          key={`bar-${index}`}
                          dataKey="count"
                          fill={item.fill}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* State Statistics Cards */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                State Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  label="Dry Readings"
                  value={stats.dryCount}
                  icon="🌵"
                  gradient="from-red-500 to-red-600"
                />
                <StatCard
                  label="Moderate Readings"
                  value={stats.moderateCount}
                  icon="🌱"
                  gradient="from-yellow-500 to-yellow-600"
                />
                <StatCard
                  label="Wet Readings"
                  value={stats.wetCount}
                  icon="💧"
                  gradient="from-green-500 to-green-600"
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
