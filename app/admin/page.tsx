"use client";

import {
  FileText,
  Users,
  Gavel,
  UserCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Plus,
  BarChart2,
  Timer,
  ClipboardList,
} from "lucide-react";
import type React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageTransitionWrapper from "@/components/animations/PageTransitionWrapper";
import AdminDetailedOverview from "@/components/animations/AdminDetailedOverview";
import AdminOverviewChart from "@/components/animations/AdminDetailedOverview";

// Types (same as before)
interface AnalyticsData {
  title: string;
  value: string;
  trend: "up" | "down";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bg: string;
}

interface User {
  _id: string;
  email: string;
  userType: string;
  isVerified: boolean;
  isBanned?: boolean;
  isDocumentVerified?: "Not Submitted" | "pending" | "verified" | "rejected";
  createdAt: string;
  lastLogin?: string;
}

interface Tender {
  _id: string;
  title: string;
  category: { name: string };
  status: string;
  bidsCount: number;
  deadline: string;
  createdAt: string;
}

interface Bid {
  _id: string;
  tender: { _id: string; title: string };
  bidder: { _id: string; email: string };
  amount: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("users");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setStatsLoading(true);
      try {
        const [usersRes, tendersRes] = await Promise.all([
          adminService.getUsers(),
          adminService.getTenders(),
        ]);

        const totalUsers =
          usersRes.success && usersRes.data && usersRes.data.pagination
            ? usersRes.data.pagination.totalUsers || 0
            : 0;

        const totalTenders =
          tendersRes.success && tendersRes.data && tendersRes.data.pagination
            ? tendersRes.data.pagination.totalTenders || 0
            : 0;

        const totalBids =
          tendersRes.success && tendersRes.data
            ? tendersRes.data.totalBids || 0
            : 0;

        const totalRevenue =
          tendersRes.success && tendersRes.data
            ? tendersRes.data.totalRevenue || 0
            : 0;

        const pendingKYCs = 0;

        const stats: AnalyticsData[] = [
          {
            title: "Total Tenders",
            value: totalTenders.toLocaleString(),
            trend: "up",
            icon: FileText,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: "Total Bids",
            value: totalBids.toLocaleString(),
            trend: "up",
            icon: Gavel,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            title: "Revenue",
            value: `${(totalRevenue / 1000000).toFixed(2)}M QAR`,
            trend: "up",
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            title: "Users",
            value: totalUsers.toLocaleString(),
            trend: "up",
            icon: Users,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
        ];

        setAnalyticsData(stats);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Fetch table data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "users") {
          const res = await adminService.getUsers({ limit: 10 });
          if (res.success) {
            setUsers(res.data.users || []);
          }
        } else if (activeTab === "tenders") {
          const res = await adminService.getTenders({ limit: 10 });
          if (res.success) {
            setTenders(res.data.tenders || []);
          }
        } else if (activeTab === "bids") {
          try {
            const bidsRes = await adminService.getBids({ limit: 10 });

            if (
              bidsRes.success &&
              bidsRes.data &&
              Array.isArray(bidsRes.data.bids)
            ) {
              const transformedBids: Bid[] = bidsRes.data.bids.map(
                (bid: any) => ({
                  _id: bid._id,
                  tender: {
                    _id: bid.tender?._id || "unknown",
                    title: bid.tender?.title || "Unknown Tender",
                  },
                  bidder: {
                    _id: bid.bidder?._id || "unknown",
                    email: bid.bidder?.email || "Unknown Bidder",
                  },
                  amount: bid.amount || 0,
                  status: bid.status || "Unknown",
                  createdAt: bid.createdAt || new Date().toISOString(),
                })
              );

              setBids(transformedBids);
            } else {
              setBids([]);
            }
          } catch (bidError) {
            console.error(
              "Error fetching bids via adminService.getBids:",
              bidError
            );
            setBids([]);
          }
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Apple-style KPI Card
  const KpiCard = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <motion.div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 transition-all duration-300 h-full group">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center transition-transform duration-300">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 tracking-wide">
            {title}
          </h3>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    </motion.div>
  );

  // Apple-style Badge Component
  const AppleBadge = ({
    variant,
    className,
    children,
  }: {
    variant?: string;
    className?: string;
    children: React.ReactNode;
  }) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200";
    if (variant === "outline") {
      return (
        <span
          className={`${baseClasses} bg-gray-50/80 text-gray-600 border border-gray-200/60 hover:bg-gray-100/80 ${className}`}
        >
          {children}
        </span>
      );
    }
    return <span className={`${baseClasses} ${className}`}>{children}</span>;
  };

  // Status badge function (updated for Apple-style)
  const getStatusBadge = (status: string, type: string) => {
    if (type === "user") {
      return (
        <AppleBadge
          className={
            status === "Active"
              ? "bg-green-100/80 text-green-700"
              : "bg-gray-100/80 text-gray-700"
          }
        >
          {status === "Active" ? "Active" : "Inactive"}
        </AppleBadge>
      );
    }

    if (type === "tender") {
      switch (status.toLowerCase()) {
        case "open":
          return (
            <AppleBadge className="bg-green-100/80 text-green-700">
              Open
            </AppleBadge>
          );
        case "closed":
          return (
            <AppleBadge className="bg-red-100/80 text-red-700">
              Closed
            </AppleBadge>
          );
        case "awarded":
          return (
            <AppleBadge className="bg-blue-100/80 text-blue-700">
              Awarded
            </AppleBadge>
          );
        case "active":
          return (
            <AppleBadge className="bg-green-100/80 text-green-700">
              Active
            </AppleBadge>
          );
        default:
          return (
            <AppleBadge className="bg-gray-100/80 text-gray-700">
              {status}
            </AppleBadge>
          );
      }
    }

    if (type === "bid") {
      // Display "Submitted" text for "Under Review" status
      const displayStatus = status === "Under Review" ? "Submitted" : status;

      switch (status) {
        case "Submitted":
        case "Under Review":
          return (
            <AppleBadge className="bg-green-100/80 text-green-700">
              {displayStatus}
            </AppleBadge>
          );
        case "Accepted":
          return (
            <AppleBadge className="bg-blue-100/80 text-blue-700">
              Accepted
            </AppleBadge>
          );
        case "Rejected":
          return (
            <AppleBadge className="bg-red-100/80 text-red-700">
              Rejected
            </AppleBadge>
          );
        default:
          return (
            <AppleBadge className="bg-gray-100/80 text-gray-700">
              {status}
            </AppleBadge>
          );
      }
    }

    if (type === "kyc") {
      switch (status) {
        case "verified":
          return (
            <AppleBadge className="bg-green-100/80 text-green-700">
              Verified
            </AppleBadge>
          );
        case "pending":
          return (
            <AppleBadge className="bg-yellow-100/80 text-yellow-700">
              Pending
            </AppleBadge>
          );
        case "rejected":
          return (
            <AppleBadge className="bg-red-100/80 text-red-700">
              Rejected
            </AppleBadge>
          );
        case "Not Submitted":
        default:
          return (
            <AppleBadge className="bg-gray-100/80 text-gray-700">
              Not Submitted
            </AppleBadge>
          );
      }
    }

    return (
      <AppleBadge className="bg-gray-100/80 text-gray-700">{status}</AppleBadge>
    );
  };

  return (
    <PageTransitionWrapper>
      <TooltipProvider>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.01 } } }}
          className="min-h-screen bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30"
        >
          <div className="mx-auto px-6 sm:px-0 lg:px-0 py-4 space-y-8">
            {/* Apple-style KPI Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {statsLoading
                ? [...Array(4)].map((_, i) => (
                    <Card
                      key={i}
                      className="rounded-xl border border-gray-200 shadow-sm"
                    >
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </CardHeader>
                      <CardContent className="pb-4">
                        <Skeleton className="h-6 w-16" />
                      </CardContent>
                    </Card>
                  ))
                : analyticsData.map((item) => (
                    <KpiCard
                      key={item.title}
                      title={item.title}
                      icon={item.icon}
                    >
                      <div className="text-2xl font-bold text-gray-900">
                        {item.value}
                      </div>
                    </KpiCard>
                  ))}
            </motion.div>
            <AdminOverviewChart />
            {/* Apple-style Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-sm border border-gray-100/50 overflow-hidden"
            >
              {/* Tab Navigation */}
              <div className="border-b border-gray-100/50 p-6 pb-0">
                <nav className="flex space-x-1 bg-gray-100/50 rounded-2xl p-1">
                  {[
                    { id: "users", label: "Users", icon: Users },
                    { id: "tenders", label: "Tenders", icon: FileText },
                    { id: "bids", label: "Bids", icon: Gavel },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                          activeTab === tab.id
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {loading ? (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4 text-lg">
                      {t("loading")}...
                    </p>
                  </div>
                ) : activeTab === "users" ? (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        User Management
                      </h3>
                      <Link
                        href="/admin/users"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 bg-blue-50/80 px-4 py-2 rounded-xl transition-colors"
                      >
                        View All
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="bg-white/90 rounded-2xl border border-gray-100/60 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100/60 bg-gray-50/50">
                            <TableHead className="font-semibold text-gray-700">
                              Email
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Type
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              KYC Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Created
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-12 text-gray-500"
                              >
                                <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p className="text-lg">No users found.</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map((user) => (
                              <TableRow
                                key={user._id}
                                className="hover:bg-gray-50/50 cursor-pointer border-gray-100/60 transition-colors"
                              >
                                <TableCell>
                                  <Link
                                    href={`/admin/users/${user._id}`}
                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                  >
                                    {user.email}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-gray-600 capitalize">
                                  {user.userType}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(
                                    user.isBanned ? "Inactive" : "Active",
                                    "user"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(
                                    user.isDocumentVerified || "Not Submitted",
                                    "kyc"
                                  )}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                  {formatDate(user.createdAt)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : activeTab === "tenders" ? (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        Tender Management
                      </h3>
                      <Link
                        href="/admin/tenders"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 bg-blue-50/80 px-4 py-2 rounded-xl transition-colors"
                      >
                        View All
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="bg-white/90 rounded-2xl border border-gray-100/60 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100/60 bg-gray-50/50">
                            <TableHead className="font-semibold text-gray-700">
                              Title
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Category
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Bids
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Created
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tenders.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-12 text-gray-500"
                              >
                                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p className="text-lg">No tenders found.</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            tenders.map((tender) => (
                              <TableRow
                                key={tender._id}
                                className="hover:bg-gray-50/50 cursor-pointer border-gray-100/60 transition-colors"
                              >
                                <TableCell>
                                  <Link
                                    href={`/admin/tenders/${tender._id}`}
                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                  >
                                    {tender.title}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                  {tender.category?.name || "General"}
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(tender.status, "tender")}
                                </TableCell>
                                <TableCell>
                                  <AppleBadge variant="outline">
                                    {tender.bidsCount || 0}
                                  </AppleBadge>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                  {formatDate(tender.createdAt)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : activeTab === "bids" ? (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        Bid Management
                      </h3>
                      <Link
                        href="/admin/bids"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 bg-blue-50/80 px-4 py-2 rounded-xl transition-colors"
                      >
                        View All
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="bg-white/90 rounded-2xl border border-gray-100/60 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100/60 bg-gray-50/50">
                            <TableHead className="font-semibold text-gray-700">
                              Tender
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Bidder
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Amount
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold text-gray-700">
                              Date
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bids.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="text-center py-12 text-gray-500"
                              >
                                <Gavel className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p className="text-lg">No bids found.</p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            bids.map((bid) => (
                              <TableRow
                                key={bid._id}
                                className="hover:bg-gray-50/50 cursor-pointer border-gray-100/60 transition-colors"
                              >
                                <TableCell>
                                  <Link
                                    href={`/admin/tenders/${bid.tender._id}`}
                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                  >
                                    {bid.tender.title}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                  {bid.bidder.email}
                                </TableCell>
                                <TableCell className="font-semibold text-gray-900">
                                  {bid.amount.toLocaleString()} QAR
                                </TableCell>
                                <TableCell>
                                  {getStatusBadge(bid.status, "bid")}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                  {formatDate(bid.createdAt)}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </TooltipProvider>
    </PageTransitionWrapper>
  );
}
