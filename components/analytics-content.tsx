"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
} from "lucide-react";

const monthlyData = [
  { month: "Jan", tenders: 45, bids: 180, revenue: 18000, users: 320 }, // Updated revenue to reflect 100 QAR per bid
  { month: "Feb", tenders: 52, bids: 210, revenue: 21000, users: 380 },
  { month: "Mar", tenders: 48, bids: 195, revenue: 19500, users: 420 },
  { month: "Apr", tenders: 61, bids: 245, revenue: 24500, users: 480 },
  { month: "May", tenders: 55, bids: 220, revenue: 22000, users: 520 },
  { month: "Jun", tenders: 67, bids: 270, revenue: 27000, users: 580 },
];

const categoryData = [
  { name: "Construction", value: 35, color: "#3b82f6" },
  { name: "Technology", value: 25, color: "#3b82f6" },
  { name: "Healthcare", value: 20, color: "#3b82f6" },
  { name: "Education", value: 12, color: "#3b82f6" },
  { name: "Others", value: 8, color: "#3b82f6" },
];

const userGrowthData = [
  { month: "Jan", businesses: 120, individuals: 200 },
  { month: "Feb", businesses: 145, individuals: 235 },
  { month: "Mar", businesses: 160, individuals: 260 },
  { month: "Apr", businesses: 180, individuals: 300 },
  { month: "May", businesses: 195, individuals: 325 },
  { month: "Jun", businesses: 220, individuals: 360 },
];

const topPerformers = [
  {
    name: "Qatar Construction Co.",
    tenders: 15,
    bids: 45,
    success: 73,
    revenue: 450000,
  },
  {
    name: "Doha Engineering Ltd.",
    tenders: 12,
    bids: 38,
    success: 68,
    revenue: 380000,
  },
  {
    name: "Al-Jazeera Trading",
    tenders: 10,
    bids: 32,
    success: 62,
    revenue: 320000,
  },
  {
    name: "Gulf Tech Solutions",
    tenders: 8,
    bids: 28,
    success: 57,
    revenue: 280000,
  },
  {
    name: "Modern Healthcare Co.",
    tenders: 7,
    bids: 25,
    success: 52,
    revenue: 250000,
  },
];

const revenueData = [
  { month: "Jan", subscription: 45000, commission: 80000, premium: 25000 },
  { month: "Feb", subscription: 48000, commission: 97000, premium: 28000 },
  { month: "Mar", subscription: 52000, commission: 83000, premium: 32000 },
  { month: "Apr", subscription: 55000, commission: 120000, premium: 35000 },
  { month: "May", subscription: 58000, commission: 102000, premium: 38000 },
  { month: "Jun", subscription: 62000, commission: 133000, premium: 42000 },
];

const userActivityData = [
  { month: "Jan", logins: 1250, registrations: 45, activeUsers: 320 },
  { month: "Feb", logins: 1480, registrations: 60, activeUsers: 380 },
  { month: "Mar", logins: 1320, registrations: 40, activeUsers: 420 },
  { month: "Apr", logins: 1650, registrations: 60, activeUsers: 480 },
  { month: "May", logins: 1580, registrations: 40, activeUsers: 520 },
  { month: "Jun", logins: 1820, registrations: 60, activeUsers: 580 },
];

const userEngagementData = [
  { category: "Daily Active", value: 65, color: "#3b82f6" },
  { category: "Weekly Active", value: 25, color: "#3b82f6" },
  { category: "Monthly Active", value: 10, color: "#3b82f6" },
];

const tenderCategoryData = [
  {
    month: "Jan",
    construction: 20,
    technology: 12,
    healthcare: 8,
    education: 5,
  },
  {
    month: "Feb",
    construction: 25,
    technology: 15,
    healthcare: 7,
    education: 5,
  },
  {
    month: "Mar",
    construction: 22,
    technology: 13,
    healthcare: 8,
    education: 5,
  },
  {
    month: "Apr",
    construction: 28,
    technology: 18,
    healthcare: 10,
    education: 5,
  },
  {
    month: "May",
    construction: 25,
    technology: 16,
    healthcare: 9,
    education: 5,
  },
  {
    month: "Jun",
    construction: 30,
    technology: 20,
    healthcare: 12,
    education: 5,
  },
];
const verificationData = [
  { name: "Verified", value: 250, color: "#22c55e" }, // Green
  { name: "Pending", value: 100, color: "#facc15" }, // Yellow
  { name: "Unverified", value: 150, color: "#ef4444" }, // Red
];

const tenderSuccessData = [
  { month: "Jan", published: 45, completed: 38, success: 84 },
  { month: "Feb", published: 52, completed: 45, success: 87 },
  { month: "Mar", published: 48, completed: 40, success: 83 },
  { month: "Apr", published: 61, completed: 55, success: 90 },
  { month: "May", published: 55, completed: 48, success: 87 },
  { month: "Jun", published: 67, completed: 60, success: 90 },
];

export function AnalyticsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header with Export Options */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("platform_analytics")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t("comprehensive_insights_and_reporting")}
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="6months">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">{t("last_month")}</SelectItem>
              <SelectItem value="3months">{t("last_3_months")}</SelectItem>
              <SelectItem value="6months">{t("last_6_months")}</SelectItem>
              <SelectItem value="1year">{t("last_year")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="users">{t("users")}</TabsTrigger>
          <TabsTrigger value="tenders">{t("tenders")}</TabsTrigger>
          <TabsTrigger value="revenue">{t("revenue")}</TabsTrigger>
          <TabsTrigger value="performance">{t("performance")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("total_platform_revenue")}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">132,000 QAR</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +12.5% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("active_tenders")}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">328</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +8.2% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("total_bids")}
                </CardTitle>
                <Gavel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,320</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +15.3% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("platform_users")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">580</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  +11.4% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("platform_growth_overview")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="bids"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("revenue_vs_bids_correlation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="bids"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("tender_categories_distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#3b82f6"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${percent && (percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("top_performing_companies")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.slice(0, 5).map((company, index) => (
                    <div
                      key={company.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{company.name}</p>
                          <p className="text-xs text-gray-500">
                            {company.success}% success rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {(company.bids * 100).toLocaleString()} QAR
                        </p>
                        <p className="text-xs text-gray-500">
                          {company.bids} bids
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("user_activity_trends")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="logins"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("verified_vs_nonverified_users")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={verificationData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#3b82f6"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${percent && (percent * 100).toFixed(0)}%`
                      }
                    >
                      {verificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("user_growth_analysis")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="businesses"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="individuals"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenders" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("tender_categories_by_month")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tenderCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="construction"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.8}
                    />
                    <Area
                      type="monotone"
                      dataKey="technology"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="healthcare"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.4}
                    />
                    <Area
                      type="monotone"
                      dataKey="education"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("tender_success_rate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tenderSuccessData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="published"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("tender_performance_metrics")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">328</div>
                  <p className="text-sm text-gray-600">{t("total_tenders")}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">286</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">42</div>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">87%</div>
                  <p className="text-sm text-gray-600">{t("success_rate")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("revenue_from_bid_payments")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} QAR`, "Revenue"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("monthly_bid_volume")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bids" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("revenue_summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    132,000 QAR
                  </div>
                  <p className="text-sm text-gray-600">
                    Total Revenue (6 months)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold">1,320</div>
                    <p className="text-xs text-gray-600">{t("total_bids")}</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold">100 QAR</div>
                    <p className="text-xs text-gray-600">{t("per_bid")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("top_performing_companies")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>{t("tenders_won")}</TableHead>
                    <TableHead>{t("total_bids")}</TableHead>
                    <TableHead>{t("success_rate")}</TableHead>
                    <TableHead>{t("revenue_generated")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformers.map((company) => (
                    <TableRow key={company.name}>
                      <TableCell className="font-medium">
                        {company.name}
                      </TableCell>
                      <TableCell>{company.tenders}</TableCell>
                      <TableCell>{company.bids}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            company.success >= 60 ? "default" : "secondary"
                          }
                        >
                          {company.success}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {company.revenue.toLocaleString()} QAR
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
