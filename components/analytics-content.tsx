"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "../lib/hooks/useTranslation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Users,
  FileText,
  Gavel,
  DollarSign,
  Download,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { adminService, PlatformAnalytics } from "@/services/adminService";
import { useAuth } from "@/context/AuthContext";

// Types for analytics data
interface PlatformStats {
  totalTenders: number;
  totalUsers: number;
  activeTenders: number;
  completedTenders: number;
  pendingBids: number;
  successfulBids: number;
  failedBids: number;
  totalRevenue: number;
  platformFees: number;
  newUsersToday: number;
  tendersPostedToday: number;
  bidsSubmittedToday: number;
}

interface DailyAnalytics {
  date: string;
  usersCreated: number;
  tendersPosted: number;
  bidsPlaced: number;
  paymentsProcessed: number;
  revenue: number;
}

interface CategoryDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface BidSuccessRate {
  totalBids: number;
  acceptedBids: number;
  rejectedBids: number;
  successRate: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  profit: number;
}

interface TenderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

interface UserGrowthData {
  month: string;
  newUsers: number;
  retainedUsers: number;
}

interface BidAnalysis {
  avgBidValue: number;
  minBid: number;
  maxBid: number;
  mostActiveCategory: string;
  bidConversionRate: number;
}

export default function AnalyticsContent() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState("6months");
  const [activeTab, setActiveTab] = useState("overview");

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getPlatformAnalytics();

      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch analytics data");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Export data as CSV
  const exportCSV = () => {
    if (!analytics) return;

    const headers = ["Metric", "Value"];
    let rows = [];

    // Add summary stats
    rows.push(["Total Users", analytics.stats.totalUsers]);
    rows.push(["Active Tenders", analytics.stats.activeTenders]);
    rows.push(["Completed Tenders", analytics.stats.completedTenders]);
    rows.push(["Pending Bids", analytics.stats.pendingBids]);
    rows.push(["Successful Bids", analytics.stats.successfulBids]);
    rows.push(["Total Revenue", analytics.stats.totalRevenue]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `analytics-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-QA", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get color based on index for charts
  const getChartColor = (index: number) => {
    const colors = [
      "#3b82f6", // blue-500
      "#10b981", // green-500
      "#f59e0b", // amber-500
      "#ef4444", // red-500
      "#8b5cf6", // violet-500
      "#ec4899", // pink-500
      "#06b6d4", // cyan-500
    ];
    return colors[index % colors.length];
  };

  // Load analytics data on mount
  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Loading Analytics...
            </h1>
            <p className="text-gray-600">
              Please wait while we gather your platform insights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50"
            >
              <CardHeader>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card
              key={i}
              className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50"
            >
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("platform_analytics")}
            </h1>
            <p className="text-gray-600">
              {t("comprehensive_insights_and_reporting")}
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={loadAnalytics}
            variant="outline"
            className="border-red-200 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6"></div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600">
            Please check back later. Platform analytics will be available soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">
                {t("total_users")}
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {analytics.stats.totalUsers}
            </div>
            <div className="text-sm text-blue-600 mt-1">
              {analytics.stats.newUsersToday} {t("new_today")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">
                {t("active_tenders")}
              </CardTitle>
              <FileText className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {analytics.stats.activeTenders}
            </div>
            <div className="text-sm text-green-600 mt-1">
              {analytics.stats.tendersPostedToday} {t("posted_today")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">
                {t("successful_bids")}
              </CardTitle>
              <Gavel className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {analytics.stats.successfulBids}
            </div>
            <div className="text-sm text-purple-600 mt-1">
              {analytics.stats.bidsSubmittedToday} {t("submitted_today")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-700">
                {t("total_revenue")}
              </CardTitle>
              <DollarSign className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {formatCurrency(analytics.stats.totalRevenue)}
            </div>
            <div className="text-sm text-orange-600 mt-1">
              {formatCurrency(analytics.stats.platformFees)}{" "}
              {t("fees_collected")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <TabsList className="grid w-fit grid-cols-5 bg-gray-100/50 rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm"
            >
              {t("overview")}
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm"
            >
              {t("users")}
            </TabsTrigger>
            <TabsTrigger
              value="tenders"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm"
            >
              {t("tenders")}
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm"
            >
              {t("bids")}
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 py-2 text-sm"
            >
              {t("revenue")}
            </TabsTrigger>
          </TabsList>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48 h-10 border-0 bg-white shadow-sm rounded-xl">
              <SelectValue placeholder={t("select_time_range")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-0 shadow-lg">
              <SelectItem value="1month">{t("last_month")}</SelectItem>
              <SelectItem value="3months">{t("last_3_months")}</SelectItem>
              <SelectItem value="6months">{t("last_6_months")}</SelectItem>
              <SelectItem value="1year">{t("last_year")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Growth */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("platform_growth_overview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.daily.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name === "usersCreated" ? "New Users" : name,
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="usersCreated"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="New Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="tendersPosted"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.4}
                      name="Tenders Posted"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue vs Bids */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("revenue_vs_bids_correlation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Revenue"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Platform Fees"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("tender_categories_distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.categories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#3b82f6"
                      dataKey="count"
                      label={({ name, percent = 0 }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {analytics.categories.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getChartColor(index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, `${name}`]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tender Status */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("tender_status_breakdown")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.tenderStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#3b82f6"
                      dataKey="count"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {analytics.tenderStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getChartColor(index)}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, `${name}`]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("user_growth_analysis")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="New Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="retainedUsers"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.4}
                      name="Retained Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Verified vs Non-Verified */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("verified_vs_nonverified_users")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Verified",
                          value: analytics.stats.totalUsers * 0.6,
                        },
                        {
                          name: "Pending Verification",
                          value: analytics.stats.totalUsers * 0.2,
                        },
                        {
                          name: "Unverified",
                          value: analytics.stats.totalUsers * 0.2,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#3b82f6"
                      dataKey="value"
                      label={({ name, percent = 0 }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {["#22c55e", "#facc15", "#ef4444"].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
            <CardHeader>
              <CardTitle>{t("daily_user_activity")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.daily.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="usersCreated"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="New Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="bidsPlaced"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Bids Placed"
                  />
                  <Line
                    type="monotone"
                    dataKey="tendersPosted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Tenders Posted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tenders Tab */}
        <TabsContent value="tenders">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tenders by Category */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("tender_categories_by_month")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.daily.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {analytics.categories.slice(0, 4).map((category, index) => (
                      <Area
                        key={category.name}
                        type="monotone"
                        dataKey="tendersPosted"
                        stackId="1"
                        stroke={getChartColor(index)}
                        fill={getChartColor(index)}
                        fillOpacity={0.8 - index * 0.1}
                        name={category.name}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tender Success Rate */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("tender_success_rate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.daily.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tendersPosted"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Published"
                    />
                    <Line
                      type="monotone"
                      dataKey="paymentsProcessed"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
            <CardHeader>
              <CardTitle>{t("tender_performance_metrics")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-800 mb-1">
                    {t("avg_duration")}
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    14 {t("days")}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-800 mb-1">
                    {t("completion_rate")}
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {analytics.bidSuccess.successRate}%
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-800 mb-1">
                    {t("avg_bids_per_tender")}
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {analytics.stats.totalTenders > 0
                      ? Math.round(
                          analytics.stats.pendingBids /
                            analytics.stats.totalTenders
                        )
                      : 0}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-sm text-orange-800 mb-1">
                    {t("most_active_category")}
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {analytics.bidAnalysis.mostActiveCategory}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bids Tab */}
        <TabsContent value="bids">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Bid Volume */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("monthly_bid_volume")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.daily.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bidsPlaced" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bid Success Rate */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("bid_success_rate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Accepted",
                          value: analytics.bidSuccess.acceptedBids,
                        },
                        {
                          name: "Rejected",
                          value: analytics.bidSuccess.rejectedBids,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#3b82f6"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
            <CardHeader>
              <CardTitle>{t("bid_analysis")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-800 mb-1">
                    {t("avg_bid_value")}
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(analytics.bidAnalysis.avgBidValue)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-800 mb-1">
                    {t("min_bid")}
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(analytics.bidAnalysis.minBid)}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-800 mb-1">
                    {t("max_bid")}
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatCurrency(analytics.bidAnalysis.maxBid)}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-sm text-orange-800 mb-1">
                    {t("conversion_rate")}
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {analytics.bidAnalysis.bidConversionRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Over Time */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("revenue_over_time")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "Amount",
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Total Revenue"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.4}
                      name="Platform Fees"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <CardHeader>
                <CardTitle>{t("payment_methods")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Tap Gateway",
                          value: analytics.stats.totalRevenue * 0.8,
                        },
                        {
                          name: "Bank Transfer",
                          value: analytics.stats.totalRevenue * 0.15,
                        },
                        {
                          name: "Wallet",
                          value: analytics.stats.totalRevenue * 0.05,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#3b82f6"
                      dataKey="value"
                      label={({ name, percent = 0 }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "Amount",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
            <CardHeader>
              <CardTitle>{t("revenue_summary")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-800 mb-1">
                    {t("total_revenue")}
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(analytics.stats.totalRevenue)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-800 mb-1">
                    {t("platform_fees")}
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(analytics.stats.platformFees)}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-800 mb-1">
                    {t("avg_transaction_value")}
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatCurrency(
                      analytics.stats.totalRevenue /
                        (analytics.stats.pendingBids +
                          analytics.stats.successfulBids)
                    )}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-sm text-orange-800 mb-1">
                    {t("success_rate")}
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {analytics.bidSuccess.successRate}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
