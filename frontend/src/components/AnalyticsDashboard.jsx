import { useEffect, useState } from "react";
import { getAnalyticsOverview, getAnalyticsTrends } from "../services/api";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// ✅ Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const o = await getAnalyticsOverview();
        const t = await getAnalyticsTrends();
        setOverview(o.data);
        setTrends(t.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-blue-600">Loading analytics...</p>;
  if (!overview) return <p className="text-red-600">No analytics data available</p>;

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-100 p-4 rounded text-center">
          <p className="text-lg font-semibold">Total</p>
          <p className="text-xl">{overview.total}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded text-center">
          <p className="text-lg font-semibold">Completed</p>
          <p className="text-xl text-green-600">{overview.completed}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded text-center">
          <p className="text-lg font-semibold">Pending</p>
          <p className="text-xl text-yellow-600">{overview.pending}</p>
        </div>
      </div>

      {/* ✅ Status Breakdown Pie Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Status Breakdown</h3>
        <Pie
          data={{
            labels: ["Pending", "In Progress", "Completed"],
            datasets: [
              {
                data: [overview.pending, overview.inProgress, overview.completed],
                backgroundColor: ["#f59e0b", "#3b82f6", "#10b981"],
              },
            ],
          }}
        />
      </div>

      {/* ✅ Weekly Trends Line Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Weekly Trends</h3>
        <Line
          data={{
            labels: trends.map((t) => t.week),
            datasets: [
              {
                label: "Completed",
                data: trends.map((t) => t.completed),
                borderColor: "#10b981",
                backgroundColor: "#10b981",
                fill: false,
              },
              {
                label: "Overdue",
                data: trends.map((t) => t.overdue),
                borderColor: "#ef4444",
                backgroundColor: "#ef4444",
                fill: false,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
