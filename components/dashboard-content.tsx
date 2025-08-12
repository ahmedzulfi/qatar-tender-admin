"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Gavel, UserCheck, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard-charts"

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
]

const platformInsights = [
  {
    id: 1,
    title: "Peak Bidding Activity",
    description: "Construction tenders receive 40% more bids on average",
    metric: "40%",
    trend: "up",
  },
  {
    id: 2,
    title: "User Engagement",
    description: "Average session duration increased by 15 minutes",
    metric: "+15min",
    trend: "up",
  },
  {
    id: 3,
    title: "Revenue Growth",
    description: "Monthly revenue from bid payments trending upward",
    metric: "+18.7%",
    trend: "up",
  },
  {
    id: 4,
    title: "KYC Processing",
    description: "Average KYC approval time reduced to 2.3 days",
    metric: "2.3 days",
    trend: "down",
  },
]

export function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsData.map((item) => (
          <Card key={item.title} className="shadow-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.title}</CardTitle>
              <item.icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{item.value}</div>
              <div className="flex items-center">
                {item.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {item.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Platform Insights */}
      <div className="space-y-8">
        <DashboardCharts />

        {/* Platform Insights - Replaced Upcoming Deadlines */}
        <Card className="shadow-0">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              Platform Insights & Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platformInsights.map((insight) => (
                <div key={insight.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                    <div className="flex items-center">
                      {insight.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-blue-500 mr-1" />
                      )}
                      <span
                        className={`text-sm font-bold ${insight.trend === "up" ? "text-green-600" : "text-blue-600"}`}
                      >
                        {insight.metric}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
