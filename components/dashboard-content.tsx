"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  Gavel,
  UserCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";

const analyticsData = [
  {
    title: "Total Tenders",
    value: "3,421",
    change: "+8.2%",
    trend: "up",
    icon: FileText,
  },
  {
    title: "Total Bids",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Gavel,
  },
  {
    title: "Revenue",
    value: "1.28M QAR", // Updated to reflect QAR and bid-based revenue
    change: "+18.7%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "8,932",
    change: "+5.3%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Pending KYCs",
    value: "247",
    change: "+15.3%",
    trend: "up",
    icon: UserCheck,
  },
  {
    title: "Platform Growth", // Replaced Support Tickets with Platform Growth
    value: "+23.4%",
    change: "This month",
    trend: "up",
    icon: TrendingUp,
  },
];


export function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsData.map((item) => (
          <Card key={item.title} className="shadow-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-neutral-800 ">
                {item.title}
              </CardTitle>
              <item.icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {item.value}
              </div>
              <div className="flex items-center">
                {item.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    item.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  from last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Platform Insights */}
      <div className="space-y-8">
        <DashboardCharts />

        {/* Platform Insights - Replaced Upcoming Deadlines */}
     
      </div>
    </div>
  );
}
