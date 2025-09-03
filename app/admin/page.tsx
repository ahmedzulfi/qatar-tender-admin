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
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ProtectedRoute } from "@/components/auth-guard";

// Mock Data
const analyticsData = [
  {
    title: "Total Tenders",
    value: "3,421",
    change: "+8.2%",
    trend: "up",
    icon: FileText,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    title: "Total Bids",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Gavel,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Revenue",
    value: "1.28M QAR",
    change: "+18.7%",
    trend: "up",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Active Users",
    value: "8,932",
    change: "+5.3%",
    trend: "up",
    icon: Users,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "Pending KYCs",
    value: "247",
    change: "+15.3%",
    trend: "up",
    icon: UserCheck,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

// Mock Table Data
const usersTable = [
  {
    id: 1,
    name: "Ahmed Al-Mansoori",
    role: "Bidder",
    status: "Active",
    kyc: "Approved",
    lastLogin: "2h ago",
  },
  {
    id: 2,
    name: "Fatima Al-Hassan",
    role: "Supplier",
    status: "Active",
    kyc: "Pending",
    lastLogin: "1d ago",
  },
  {
    id: 3,
    name: "Khalid Bin Ali",
    role: "Admin",
    status: "Inactive",
    kyc: "Approved",
    lastLogin: "3d ago",
  },
  {
    id: 4,
    name: "Layla Al-Saeed",
    role: "Bidder",
    status: "Active",
    kyc: "Approved",
    lastLogin: "5h ago",
  },
];

const tendersTable = [
  {
    id: 1,
    title: "Construction of Dubai Metro Line 8",
    category: "Infrastructure",
    status: "Open",
    bids: 45,
    deadline: "Jul 15",
  },
  {
    id: 2,
    title: "Cloud Migration for Ministry of Health",
    category: "IT",
    status: "Closed",
    bids: 23,
    deadline: "Jun 20",
  },
  {
    id: 3,
    title: "Smart City IoT Sensors",
    category: "Technology",
    status: "Open",
    bids: 12,
    deadline: "Aug 1",
  },
];

const bidsTable = [
  {
    id: 1,
    tender: "Metro Line 8",
    bidder: "Al-Falcon Co.",
    amount: "2.4M QAR",
    status: "Submitted",
    date: "Jul 10",
  },
  {
    id: 2,
    tender: "Cloud Migration",
    bidder: "TechNova Inc.",
    amount: "1.8M QAR",
    status: "Withdrawn",
    date: "Jul 5",
  },
  {
    id: 3,
    tender: "IoT Sensors",
    bidder: "SensorPro Ltd.",
    amount: "3.1M QAR",
    status: "Under Review",
    date: "Jul 8",
  },
];

export default function page() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("users");

  const renderTable = () => {
    if (activeTab === "users") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Last Login</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersTable.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.kyc === "Approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.kyc}
                  </span>
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (activeTab === "tenders") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Deadline</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tendersTable.map((tender) => (
              <TableRow key={tender.id}>
                <TableCell className="font-medium">{tender.title}</TableCell>
                <TableCell>{tender.category}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      tender.status === "Open"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {tender.status}
                  </span>
                </TableCell>
                <TableCell>{tender.bids}</TableCell>
                <TableCell>{tender.deadline}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (activeTab === "bids") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tender</TableHead>
              <TableHead>Bidder</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bidsTable.map((bid) => (
              <TableRow key={bid.id}>
                <TableCell className="font-medium">{bid.tender}</TableCell>
                <TableCell>{bid.bidder}</TableCell>
                <TableCell>{bid.amount}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      bid.status === "Submitted"
                        ? "bg-green-100 text-green-800"
                        : bid.status === "Under Review"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {bid.status}
                  </span>
                </TableCell>
                <TableCell>{bid.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 font-sans">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {analyticsData.map((item) => (
          <Card
            key={item.title}
            className={`${item.bg} rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 leading-tight">
                {item.title}
              </CardTitle>
              <div
                className={`${item.color} bg-white/70 p-2 rounded-lg shadow-sm mt-2`}
              >
                <item.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {item.value}
              </div>
              <div className="flex items-center space-x-1">
                {item.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    item.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.change}
                </span>
                <span className="text-sm text-gray-500">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full-Width Chart */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          {t("platform_growth_trends")}
        </h2>
        <DashboardCharts />
      </div>

      {/* Tabs & Table Section */}
      <Card className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <Tabs
          defaultValue="users"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b border-gray-100">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 rounded-lg text-sm font-medium"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="tenders"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 rounded-lg text-sm font-medium"
            >
              Tenders
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 rounded-lg text-sm font-medium"
            >
              Bids
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="p-6">
            {renderTable()}
          </TabsContent>
          <TabsContent value="tenders" className="p-6">
            {renderTable()}
          </TabsContent>
          <TabsContent value="bids" className="p-6">
            {renderTable()}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
