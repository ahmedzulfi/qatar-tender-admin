"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingDown, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTranslation } from "../lib/hooks/useTranslation";

// Mock Data
const monthlyData = [
  { month: "Jan", tenders: 245, bids: 892, revenue: 2450000, users: 1250 },
  { month: "Feb", tenders: 312, bids: 1024, revenue: 3120000, users: 1380 },
  { month: "Mar", tenders: 289, bids: 967, revenue: 2890000, users: 1420 },
  { month: "Apr", tenders: 356, bids: 1156, revenue: 3560000, users: 1580 },
  { month: "May", tenders: 423, bids: 1389, revenue: 4230000, users: 1720 },
  { month: "Jun", tenders: 398, bids: 1267, revenue: 3980000, users: 1650 },
];

const chartConfig = {
  tenders: { label: "Tenders", color: "#3b82f6" },
  bids: { label: "Bids", color: "#1d4ed8" },
  revenue: { label: "Revenue", color: "#2563eb" },
  users: { label: "Users", color: "#1e40af" },
};

const platformInsights = [
  {
    id: 1,
    title: "Peak Bidding Activity",
    description: "Construction tenders receive 40% more bids on average.",
    metric: "40%",
    trend: "up",
  },
  {
    id: 2,
    title: "User Engagement",
    description: "Average session duration increased by 15 minutes.",
    metric: "+15min",
    trend: "up",
  },
  {
    id: 3,
    title: "Revenue Growth",
    description: "Monthly revenue from bid payments trending upward.",
    metric: "+18.7%",
    trend: "up",
  },
  {
    id: 4,
    title: "KYC Processing",
    description: "Average KYC approval time reduced to 2.3 days.",
    metric: "2.3 days",
    trend: "down",
  },
];

export function DashboardCharts() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Growth & Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Growth Trends */}
        <Card className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">
              {t("platform_growth_trends")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={monthlyData}>
                <CartesianGrid stroke="#f0f4f8" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                  cursor={{
                    stroke: "#d1d5db",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tenders"
                  stroke={chartConfig.tenders.color}
                  strokeWidth={3}
                  dot={{
                    fill: chartConfig.tenders.color,
                    r: 4,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: chartConfig.tenders.color,
                    strokeWidth: 2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bids"
                  stroke={chartConfig.bids.color}
                  strokeWidth={3}
                  dot={{
                    fill: chartConfig.bids.color,
                    r: 4,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: chartConfig.bids.color,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Revenue Growth */}
        <Card className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">
              {t("revenue_growth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={monthlyData}>
                <CartesianGrid stroke="#f0f4f8" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value) => [
                    `$${(Number(value) / 1000000).toFixed(2)}M`,
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={chartConfig.revenue.color}
                  strokeWidth={3}
                  dot={{
                    fill: chartConfig.revenue.color,
                    r: 4,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: chartConfig.revenue.color,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Growth & Platform Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">
              {t("user_growth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={monthlyData}>
                <CartesianGrid stroke="#f0f4f8" strokeDasharray="4 4" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={chartConfig.users.color}
                  strokeWidth={3}
                  dot={{
                    fill: chartConfig.users.color,
                    r: 4,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: chartConfig.users.color,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Platform Insights */}
        <Card className="rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base font-semibold text-gray-800">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              {t("platform_insights_trends")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              {platformInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 text-sm">
                      {insight.title}
                    </h4>
                    <div className="flex items-center">
                      {insight.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-blue-500 mr-1" />
                      )}
                      <span
                        className={`text-sm font-bold ${
                          insight.trend === "up"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {insight.metric}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
