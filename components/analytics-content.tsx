// app/admin/analytics/page.tsx
"use client";

import { useState, useEffect } from "react";
import { adminService, AnalyticsFilters } from "@/services/adminService";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Color palettes for charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
  "#D084C1",
  "#FF7C7C",
];

const CATEGORY_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

interface AnalyticsData {
  tendersOverTime: any[];
  bidsOverTime: any[];
  tenderSizeMetrics: any;
  awardMetrics: any[];
  timeToFirstBid: any[];
  userMetrics: any[];
  revenueOverTime: any[];
  categoryDistribution: any[];
  bidderDistribution: any[];
  userTypeDistribution: any[];
  averageBidPerCategory: any[];
  ratingMetrics: any;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    interval: "month",
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0], // Start of current year
    endDate: new Date().toISOString().split("T")[0], // Today
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAnalytics(filters);
      setAnalyticsData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics data");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleFilterChange = (key: keyof AnalyticsFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">
            Error Loading Analytics
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl">
            No analytics data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Platform Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive overview of platform performance and metrics
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interval
            </label>
            <select
              value={filters.interval}
              onChange={(e) => handleFilterChange("interval", e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAnalytics}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Tenders"
          value={analyticsData.tendersOverTime.reduce(
            (sum, item) => sum + item.total,
            0
          )}
          change={getChangePercentage(analyticsData.tendersOverTime, "total")}
        />
        <SummaryCard
          title="Total Bids"
          value={analyticsData.bidsOverTime.reduce(
            (sum, item) => sum + item.totalBids,
            0
          )}
          change={getChangePercentage(analyticsData.bidsOverTime, "totalBids")}
        />
        <SummaryCard
          title="Total Revenue"
          value={`QAR ${analyticsData.revenueOverTime
            .reduce((sum, item) => sum + item.totalRevenue, 0)
            .toLocaleString()}`}
          change={getChangePercentage(
            analyticsData.revenueOverTime,
            "totalRevenue"
          )}
        />
        <SummaryCard
          title="Active Users"
          value={analyticsData.userMetrics.reduce(
            (sum, item) => sum + item.totalActiveUsers,
            0
          )}
          change={getChangePercentage(
            analyticsData.userMetrics,
            "totalActiveUsers"
          )}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenders Over Time */}
        <ChartCard title="Tenders Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.tendersOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0088FE"
                name="Total Tenders"
              />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#00C49F"
                name="Active"
              />
              <Line
                type="monotone"
                dataKey="awarded"
                stroke="#FFBB28"
                name="Awarded"
              />
              <Line
                type="monotone"
                dataKey="closed"
                stroke="#FF8042"
                name="Closed"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bids Over Time */}
        <ChartCard title="Bids Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.bidsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalBids" fill="#0088FE" name="Total Bids" />
              <Bar
                dataKey="averageBidsPerTender"
                fill="#00C49F"
                name="Avg Bids/Tender"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Distribution */}
        <ChartCard title="Tenders by Category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.categoryDistribution}
                dataKey="tenderCount"
                nameKey="_id"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {analyticsData.categoryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Over Time */}
        <ChartCard title="Revenue Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip formatter={(value) => [`QAR ${value}`, "Revenue"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#10B981"
                name="Total Revenue"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Growth */}
        <ChartCard title="User Growth">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.userMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="individualUsers"
                stackId="a"
                fill="#0088FE"
                name="Individual"
              />
              <Bar
                dataKey="businessUsers"
                stackId="a"
                fill="#00C49F"
                name="Business"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Award Metrics */}
        <ChartCard title="Tender Award Rate">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.awardMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}%`, "Award Rate"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="awardPercentage"
                stroke="#F59E0B"
                name="Award Rate %"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Average Bid by Category */}
        <ChartCard title="Average Bid by Category">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.averageBidPerCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => [`QAR ${value}`, "Amount"]} />
              <Bar dataKey="averageBid" fill="#8884D8" name="Average Bid" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Type Distribution */}
        <ChartCard title="Tenders by User Type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.userTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="individualTenders"
                fill="#0088FE"
                name="Individual Tenders"
              />
              <Bar
                dataKey="businessTenders"
                fill="#00C49F"
                name="Business Tenders"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Rating Metrics Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Rating Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Overall Rating</h4>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-yellow-600">
                {analyticsData.ratingMetrics.overall.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">
                out of 5 stars
                <br />
                <span className="text-gray-500">
                  from {analyticsData.ratingMetrics.overall.totalReviews}{" "}
                  reviews
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">
              Top Rated Businesses by Category
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {analyticsData.ratingMetrics.businessCategoryRatings
                .slice(0, 5)
                .map((rating, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium">
                      {rating._id.business} - {rating._id.category}
                    </span>
                    <span className="text-yellow-600 font-semibold">
                      {rating.averageRating.toFixed(1)} ★
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface SummaryCardProps {
  title: string;
  value: number | string;
  change?: number;
}

function SummaryCard({ title, value, change }: SummaryCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change !== undefined && (
          <div
            className={`text-sm font-medium ${
              isPositive
                ? "text-green-600"
                : isNegative
                ? "text-red-600"
                : "text-gray-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {change}%
          </div>
        )}
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

// Helper function to calculate percentage change
function getChangePercentage(data: any[], key: string): number {
  if (data.length < 2) return 0;

  const current = data[data.length - 1][key];
  const previous = data[data.length - 2][key];

  if (!previous || previous === 0) return 0;

  return Math.round(((current - previous) / previous) * 100);
}
