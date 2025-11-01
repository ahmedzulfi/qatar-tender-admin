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

// Color palettes (unchanged logic)
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
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-lg font-medium mb-2">
            Error Loading Analytics
          </div>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Platform Analytics
        </h1>
        <p className="text-gray-500 mt-1">
          Comprehensive overview of platform performance and metrics
        </p>
      </div>

      {/* Filters - Apple-style control group */}
      <div className="bg-white rounded-xl p-5 mb-8 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full max-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <span className="self-center text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full max-w-[140px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Interval
            </label>
            <select
              value={filters.interval}
              onChange={(e) => handleFilterChange("interval", e.target.value)}
              className="w-full max-w-[160px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <ChartCard title="Tenders Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.tendersOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#007AFF"
                name="Total Tenders"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#34C759"
                name="Active"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="awarded"
                stroke="#FF9500"
                name="Awarded"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="closed"
                stroke="#FF3B30"
                name="Closed"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Bids Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.bidsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="totalBids"
                fill="#007AFF"
                name="Total Bids"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="averageBidsPerTender"
                fill="#5AC8FA"
                name="Avg Bids/Tender"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

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
                label={({ name, percent }) =>
                  `${name}: ${(percent ? percent * 100 : 0).toFixed(0)}%`
                }
                labelLine={false}
              >
                {analyticsData.categoryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip formatter={(value) => [`QAR ${value}`, "Revenue"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#34C759"
                name="Total Revenue"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Growth">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.userMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="individualUsers"
                stackId="a"
                fill="#007AFF"
                name="Individual"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="businessUsers"
                stackId="a"
                fill="#5AC8FA"
                name="Business"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tender Award Rate">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.awardMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip formatter={(value) => [`${value}%`, "Award Rate"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="awardPercentage"
                stroke="#FF9500"
                name="Award Rate %"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Bid by Category">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.averageBidPerCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="_id"
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#888"
                fontSize={12}
              />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip formatter={(value) => [`QAR ${value}`, "Amount"]} />
              <Bar
                dataKey="averageBid"
                fill="#AF52DE"
                name="Average Bid"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tenders by User Type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.userTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="individualTenders"
                fill="#007AFF"
                name="Individual Tenders"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="businessTenders"
                fill="#5AC8FA"
                name="Business Tenders"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Rating Metrics */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rating Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Overall Rating
            </h4>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-semibold text-yellow-500">
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Top Rated Businesses by Category
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {analyticsData.ratingMetrics.businessCategoryRatings
                .slice(0, 5)
                .map((rating: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="font-medium text-gray-900 truncate">
                      {rating._id.business} – {rating._id.category}
                    </span>
                    <span className="text-yellow-500 font-medium">
                      {rating.averageRating.toFixed(1)}★
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

// --- Helper Components (Apple-styled) ---

function SummaryCard({
  title,
  value,
  change,
}: {
  title: string;
  value: number | string;
  change?: number;
}) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {title}
      </h3>
      <div className="mt-1 flex items-baseline justify-between">
        <div className="text-xl font-semibold text-gray-900">{value}</div>
        {change !== undefined && (
          <div
            className={`text-xs font-medium ${
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

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="text-base font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function getChangePercentage(data: any[], key: string): number {
  if (data.length < 2) return 0;
  const current = data[data.length - 1][key];
  const previous = data[data.length - 2][key];
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}
