"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Users, FileText, Gavel, CheckCircle, AlertCircle } from "lucide-react";
import { adminService } from "@/services/adminService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChartDataPoint {
  date: string;
  newUsers: number;
  newTenders: number;
  newBids: number;
  completedTenders: number;
  rejectedTenders: number;
  activeTenders: number;
  pendingKYCs: number;
}

interface OverviewStats {
  totalUsers: number;
  totalTenders: number;
  totalBids: number;
  activeUsers: number;
  pendingKYCs: number;
  completedTenders: number;
  rejectedTenders: number;
  activeTenders: number;
}

const formatDateLabel = (date: Date): string =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const toISODate = (date: Date): string => date.toISOString().split("T")[0];

export default function AdminOverviewChart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch main collections
        const [usersRes, tendersRes, bidsRes] = await Promise.all([
          adminService.getUsers({ limit: 1000, page: 1 }),
          adminService.getTenders({ limit: 1000, page: 1 }),
          adminService.getBids({ limit: 1000, page: 1 }),
        ]);

        if (
          !usersRes.success ||
          !tendersRes.success ||
          !bidsRes.success ||
          !Array.isArray(usersRes.data.users)
        ) {
          throw new Error("Invalid data format from API");
        }

        const users = usersRes.data.users;
        const tenders = tendersRes.data.tenders || [];
        const bids = bidsRes.data.bids || [];

        // Compute totals
        const totalUsers = users.length;
        const totalTenders = tenders.length;
        const totalBids = bids.length;

        const activeUsers = users.filter(
          (u: any) => u.isVerified === true
        ).length;
        const pendingKYCs = users.filter((u: any) => !u.isVerified).length;
        const completedTenders = tenders.filter(
          (t: any) => t.status === "completed"
        ).length;
        const rejectedTenders = tenders.filter(
          (t: any) => t.status === "rejected"
        ).length;
        const activeTenders = tenders.filter(
          (t: any) => t.status === "open" || t.status === "active"
        ).length;

        setStats({
          totalUsers,
          totalTenders,
          totalBids,
          activeUsers,
          pendingKYCs,
          completedTenders,
          rejectedTenders,
          activeTenders,
        });

        // === Chart Data (Last 7 Days) ===
        const today = new Date();
        const dateMap: Record<string, ChartDataPoint> = {};

        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const iso = toISODate(date);
          dateMap[iso] = {
            date: formatDateLabel(date),
            newUsers: 0,
            newTenders: 0,
            newBids: 0,
            completedTenders: 0,
            rejectedTenders: 0,
            activeTenders: 0,
            pendingKYCs: 0,
          };
        }

        // Group users by creation date
        users.forEach((user: any) => {
          const iso = toISODate(new Date(user.createdAt));
          if (dateMap[iso]) {
            dateMap[iso].newUsers++;
            if (!user.isVerified) dateMap[iso].pendingKYCs++;
          }
        });

        // Group tenders
        tenders.forEach((tender: any) => {
          const iso = toISODate(new Date(tender.createdAt));
          if (dateMap[iso]) {
            dateMap[iso].newTenders++;
            if (tender.status === "completed") dateMap[iso].completedTenders++;
            if (tender.status === "rejected") dateMap[iso].rejectedTenders++;
            if (tender.status === "open" || tender.status === "active")
              dateMap[iso].activeTenders++;
          }
        });

        // Group bids
        bids.forEach((bid: any) => {
          const iso = toISODate(new Date(bid.createdAt));
          if (dateMap[iso]) {
            dateMap[iso].newBids++;
          }
        });

        setChartData(Object.values(dateMap));
      } catch (err: any) {
        console.error("Error fetching admin overview:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-800">Platform Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl shadow-sm border border-gray-200 bg-white/70 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-gray-800">Platform Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-red-600 font-medium">
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 bg-white/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Platform Overview
          </CardTitle>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300"
          >
            Last 7 Days
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6 rounded-full bg-gray-100/80 p-1">
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full text-gray-700"
            >
              Stats
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full text-gray-700"
            >
              Users
            </TabsTrigger>
            <TabsTrigger
              value="tenders"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full text-gray-700"
            >
              Tenders
            </TabsTrigger>
            <TabsTrigger
              value="bids"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-full text-gray-700"
            >
              Bids
            </TabsTrigger>
          </TabsList>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Total Users</span>
                </div>
                <div className="font-semibold text-blue-700 text-lg">
                  {stats?.totalUsers.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-600">Active Users</span>
                </div>
                <div className="font-semibold text-green-700 text-lg">
                  {stats?.activeUsers.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-gray-600">
                    User Pending KYCs
                  </span>
                </div>
                <div className="font-semibold text-amber-700 text-lg">
                  {stats?.pendingKYCs.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Gavel className="w-4 h-4 text-orange-600" />
                  <span className="text-xs text-gray-600">Total Bids</span>
                </div>
                <div className="font-semibold text-orange-700 text-lg">
                  {stats?.totalBids.toLocaleString()}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  name="New Users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="pendingKYCs"
                  name="Pending KYCs"
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Tenders Tab */}
          <TabsContent value="tenders">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newTenders"
                  name="New Tenders"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="activeTenders"
                  name="Active"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="completedTenders"
                  name="Completed"
                  stroke="#059669"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="rejectedTenders"
                  name="Rejected"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Bids Tab */}
          <TabsContent value="bids">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="newBids"
                  name="New Bids"
                  stroke="#f97316"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
