import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartDataPoint {
  timestamp: string;
  moisture: number;
  time?: string;
}

interface MoistureChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  sensorName?: string;
}

export function MoistureChart({
  data,
  loading = false,
  sensorName = "Sensor"
}: MoistureChartProps) {
  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-lg border border-gray-200">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-white rounded-lg border border-gray-200">
        <div className="text-gray-400">No historical data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Moisture Trend - {sensorName}
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            stroke="#d1d5db"
          />
          <YAxis
            domain={[0, 1000]}
            label={{ value: "Moisture Level", angle: -90, position: "insideLeft" }}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            stroke="#d1d5db"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "#f3f4f6" }}
            formatter={(value) => [
              `${typeof value === "number" ? value : value}`,
              "Moisture",
            ]}
            cursor={{ stroke: "#3b82f6", strokeWidth: 2 }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
            formatter={() => "Moisture Level"}
          />
          <Line
            type="monotone"
            dataKey="moisture"
            stroke="#3b82f6"
            dot={false}
            strokeWidth={3}
            isAnimationActive={true}
            animationDuration={1000}
            fillOpacity={1}
            fill="url(#colorMoisture)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
