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
import { useAuth } from "@/context/AuthContext";

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
        {/*
        
          <div className="inline-flex flex-col justify-start items-start overflow-hidden">
          <div className="self-stretch bg-Color-Scheme-1-Background flex flex-col justify-start items-center overflow-hidden">
            <div className="self-stretch h-16 px-16 flex flex-col justify-center items-center overflow-hidden">
              <div className="self-stretch inline-flex justify-between items-center overflow-hidden">
                <div className="flex justify-start items-start">
                  <div
                    data-alternate="False"
                    className="w-20 h-9 relative overflow-hidden"
                  >
                    <div className="w-16 h-9 left-[6.67px] top-0 absolute overflow-hidden">
                      <div className="w-5 h-4 left-[50.82px] top-[10.87px] absolute bg-Color-Neutral-Darkest" />
                      <div className="w-5 h-6 left-[34.33px] top-[11.32px] absolute bg-Color-Neutral-Darkest" />
                      <div className="w-5 h-4 left-[18.55px] top-[10.87px] absolute bg-Color-Neutral-Darkest" />
                      <div className="w-5 h-4 left-0 top-[10.24px] absolute bg-Color-Neutral-Darkest" />
                      <div className="w-4 h-2.5 left-[1.15px] top-0 absolute bg-Color-Neutral-Darkest" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-6">
                  <div
                    data-alternate="False"
                    data-icon-position="No icon"
                    data-small="True"
                    data-style="Primary"
                    className="px-2.5 py-1 bg-Color-Matisse outline outline-1 outline-Color-Matisse flex justify-center items-center gap-2"
                  >
                    <div className="justify-start text-Color-White text-base font-medium font-['Inter'] leading-6">
                      Search
                    </div>
                  </div>
                  <div className="p-3 flex justify-start items-start">
                    <div className="w-6 h-6 relative overflow-hidden">
                      <div className="w-4 h-3 left-[4px] top-[6px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-center gap-20">
              <div className="w-full max-w-[768px] flex flex-col justify-start items-center gap-8">
                <div className="self-stretch flex flex-col justify-start items-center gap-6">
                  <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-7xl font-medium font-['Outfit'] leading-[86.40px]">
                    Digitize Qatar's tendering landscape
                  </div>
                  <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-lg font-normal font-['Inter'] leading-7">
                    Streamline your procurement with a secure digital platform
                    that connects businesses and contractors seamlessly. Manage
                    tenders, receive verified bids, and track projects with
                    precision.
                  </div>
                </div>
                <div className="inline-flex justify-start items-start gap-4">
                  <div
                    data-alternate="False"
                    data-icon-position="No icon"
                    data-small="False"
                    data-style="Primary"
                    className="px-3 py-1.5 bg-Color-Matisse outline outline-1 outline-Color-Matisse flex justify-center items-center gap-2"
                  >
                    <div className="justify-start text-Color-White text-base font-medium font-['Inter'] leading-6">
                      Post a tender
                    </div>
                  </div>
                  <div
                    data-alternate="False"
                    data-icon-position="No icon"
                    data-small="False"
                    data-style="Secondary"
                    className="px-3 py-1.5 bg-Opacity-Neutral-Darkest-5/5 outline outline-1 outline-Opacity-Transparent/0 flex justify-center items-center gap-2"
                  >
                    <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                      Explore tenders
                    </div>
                  </div>
                </div>
              </div>
              <img
                className="self-stretch h-[720px]"
                src="https://placehold.co/1280x720"
              />
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-center gap-20">
              <div className="w-full max-w-[768px] flex flex-col justify-start items-center gap-8">
                <div className="self-stretch flex flex-col justify-start items-center gap-6">
                  <div className="self-stretch flex flex-col justify-start items-center gap-4">
                    <div className="inline-flex justify-start items-center">
                      <div className="text-center justify-start text-Color-Scheme-1-Text text-base font-semibold font-['Inter'] leading-6">
                        GoTenderly
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-center gap-6">
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[62.40px]">
                        Trusted by Qatar's leading businesses
                      </div>
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-lg font-normal font-['Inter'] leading-7">
                        We simplify complex tender processes with cutting-edge
                        technology and robust security measures.
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch py-2 inline-flex justify-center items-start gap-8 flex-wrap content-start">
                    <div
                      data-alternate="False"
                      data-logo="2"
                      className="w-36 h-14 relative overflow-hidden"
                    >
                      <div className="w-32 h-6 left-[2.50px] top-[16.75px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                    <div
                      data-alternate="False"
                      data-logo="1"
                      className="w-36 h-14 relative overflow-hidden"
                    >
                      <div className="w-32 h-9 left-[4px] top-[10.50px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                    <div
                      data-alternate="False"
                      data-logo="2"
                      className="w-36 h-14 relative overflow-hidden"
                    >
                      <div className="w-32 h-6 left-[2.50px] top-[16.75px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                    <div
                      data-alternate="False"
                      data-logo="1"
                      className="w-36 h-14 relative overflow-hidden"
                    >
                      <div className="w-32 h-9 left-[4px] top-[10.50px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                  </div>
                </div>
                <div className="inline-flex justify-start items-center gap-6">
                  <div
                    data-alternate="False"
                    data-icon-position="No icon"
                    data-small="False"
                    data-style="Secondary"
                    className="px-3 py-1.5 bg-Opacity-Neutral-Darkest-5/5 outline outline-1 outline-Opacity-Transparent/0 flex justify-center items-center gap-2 overflow-hidden"
                  >
                    <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                      Learn more
                    </div>
                  </div>
                  <div
                    data-alternate="False"
                    data-icon-position="Trailing"
                    data-small="False"
                    data-style="Link"
                    className="flex justify-center items-center gap-2 overflow-hidden"
                  >
                    <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                      Get started
                    </div>
                    <div className="w-6 h-6 relative overflow-hidden">
                      <div className="w-1.5 h-3 left-[8.51px] top-[6.17px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-center gap-20">
              <div className="w-full max-w-[768px] flex flex-col justify-start items-center gap-4">
                <div className="inline-flex justify-start items-center">
                  <div className="text-center justify-start text-Color-Scheme-1-Text text-base font-semibold font-['Inter'] leading-6">
                    Process
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-center gap-6">
                  <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[62.40px]">
                    How tender management works
                  </div>
                  <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-lg font-normal font-['Inter'] leading-7">
                    Our streamlined system connects you directly with vetted
                    professionals. Each tender becomes a strategic opportunity
                    for business growth.
                  </div>
                </div>
              </div>
              <div className="self-stretch bg-Color-Scheme-1-Foreground outline outline-1 outline-Color-Scheme-1-Border/20 inline-flex justify-start items-start overflow-hidden">
                <div className="flex-1 self-stretch max-w-[480px] border-r border-Color-Scheme-1-Border/20 inline-flex flex-col justify-start items-start">
                  <div className="self-stretch flex-1 px-8 py-6 border-b border-Color-Scheme-1-Border/20 flex flex-col justify-center items-start gap-4">
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                      Post your tender
                    </div>
                  </div>
                  <div className="self-stretch flex-1 px-8 py-6 border-b border-Color-Scheme-1-Border/20 flex flex-col justify-center items-start gap-4">
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                      Receive verified proposals
                    </div>
                  </div>
                  <div className="self-stretch flex-1 px-8 py-6 border-b border-Color-Scheme-1-Border/20 flex flex-col justify-center items-start gap-4">
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                      Complete tender process with confidence
                    </div>
                  </div>
                  <div className="self-stretch flex-1 px-8 py-6 border-b border-Color-Scheme-1-Border/20 flex flex-col justify-center items-start gap-4">
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                      Tender launch
                    </div>
                  </div>
                  <div className="self-stretch flex-1 px-8 py-6 border-Color-Scheme-1-Border/20 flex flex-col justify-center items-start gap-4">
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                      Bid evaluation
                    </div>
                  </div>
                </div>
                <div className="w-[800px] h-96 inline-flex flex-col justify-start items-start">
                  <div className="w-[800px] p-16 flex flex-col justify-center items-start gap-8">
                    <div className="self-stretch flex flex-col justify-start items-start gap-6">
                      <div className="w-12 h-12 relative overflow-hidden">
                        <div className="w-9 h-10 left-[6px] top-[4px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                      <div className="self-stretch flex flex-col justify-start items-start gap-6">
                        <div className="self-stretch justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[52.80px]">
                          Post your tender
                        </div>
                        <div className="self-stretch justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                          Launch your tender with precision
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch inline-flex justify-start items-center gap-6">
                      <div
                        data-alternate="False"
                        data-icon-position="No icon"
                        data-small="False"
                        data-style="Secondary"
                        className="px-3 py-1.5 bg-Opacity-Neutral-Darkest-5/5 outline outline-1 outline-Opacity-Transparent/0 flex justify-center items-center gap-2 overflow-hidden"
                      >
                        <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                          Start
                        </div>
                      </div>
                      <div
                        data-alternate="False"
                        data-icon-position="Trailing"
                        data-small="False"
                        data-style="Link"
                        className="flex justify-center items-center gap-2 overflow-hidden"
                      >
                        <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                          Explore
                        </div>
                        <div className="w-6 h-6 relative overflow-hidden">
                          <div className="w-1.5 h-3 left-[8.51px] top-[6.17px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-start gap-20">
              <div className="self-stretch inline-flex justify-start items-start gap-20">
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-8">
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="inline-flex justify-start items-center">
                      <div className="justify-start text-Color-Scheme-1-Text text-base font-semibold font-['Inter'] leading-6">
                        Features
                      </div>
                    </div>
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[62.40px]">
                      Tender search and discovery
                    </div>
                  </div>
                  <div className="inline-flex justify-start items-center gap-6">
                    <div
                      data-alternate="False"
                      data-icon-position="No icon"
                      data-small="False"
                      data-style="Secondary"
                      className="px-3 py-1.5 bg-Opacity-Neutral-Darkest-5/5 outline outline-1 outline-Opacity-Transparent/0 flex justify-center items-center gap-2 overflow-hidden"
                    >
                      <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                        Search
                      </div>
                    </div>
                    <div
                      data-alternate="False"
                      data-icon-position="Trailing"
                      data-small="False"
                      data-style="Link"
                      className="flex justify-center items-center gap-2 overflow-hidden"
                    >
                      <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                        Explore
                      </div>
                      <div className="w-6 h-6 relative overflow-hidden">
                        <div className="w-1.5 h-3 left-[8.51px] top-[6.17px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch inline-flex justify-start items-start gap-10">
                    <div className="inline-flex flex-col justify-start items-center gap-4">
                      <div className="w-12 h-12 relative overflow-hidden">
                        <div className="w-9 h-10 left-[6px] top-[4px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                      <div className="w-24 h-0 origin-top-left rotate-90 bg-Color-Scheme-1-Border/20 outline outline-2 outline-offset-[-1px] outline-Color-Scheme-1-Border/20"></div>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-xl font-medium font-['Outfit'] leading-8">
                        Tender search and discovery
                      </div>
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Find relevant opportunities across multiple industries
                        and sectors
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-10">
                    <div className="inline-flex flex-col justify-start items-center gap-4">
                      <div className="w-12 h-12 relative overflow-hidden">
                        <div className="w-9 h-10 left-[6px] top-[4px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                      <div className="w-24 h-0 origin-top-left rotate-90 bg-Color-Scheme-1-Border/20 outline outline-2 outline-offset-[-1px] outline-Color-Scheme-1-Border/20"></div>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-xl font-medium font-['Outfit'] leading-8">
                        Bid management system
                      </div>
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Tender discovery made simple with intelligent search
                        algorithms
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-10">
                    <div className="inline-flex flex-col justify-start items-center gap-4">
                      <div className="w-12 h-12 relative overflow-hidden">
                        <div className="w-9 h-10 left-[6px] top-[4px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                      <div className="w-24 h-0 origin-top-left rotate-90 bg-Color-Scheme-1-Border/20 outline outline-2 outline-offset-[-1px] outline-Color-Scheme-1-Border/20"></div>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-xl font-medium font-['Outfit'] leading-8">
                        KYC verification process
                      </div>
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Comprehensive bid tracking and management in one
                        centralized platform
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-10">
                    <div className="inline-flex flex-col justify-start items-center gap-4">
                      <div className="w-12 h-12 relative overflow-hidden">
                        <div className="w-9 h-10 left-[6px] top-[4px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-xl font-medium font-['Outfit'] leading-8">
                        Real-time communication platform
                      </div>
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Robust verification process ensuring contractor
                        credibility and trust
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-center gap-20">
              <div className="w-full max-w-[768px] flex flex-col justify-start items-center gap-4">
                <div className="inline-flex justify-start items-center">
                  <div className="text-center justify-start text-Color-Scheme-1-Text text-base font-semibold font-['Inter'] leading-6">
                    Benefits
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-center gap-6">
                  <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[62.40px]">
                    Simplified sourcing strategy
                  </div>
                  <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-lg font-normal font-['Inter'] leading-7">
                    Empowering businesses and contractors with smart solutions
                  </div>
                </div>
              </div>
              <div className="self-stretch inline-flex justify-start items-center gap-12">
                <div className="flex-1 inline-flex flex-col justify-start items-center gap-16">
                  <div className="self-stretch flex flex-col justify-start items-center gap-6">
                    <div className="w-12 h-12 relative">
                      <div className="w-10 h-11 left-[3.70px] top-[2.32px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-center gap-4">
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                        Transforming tender experiences
                      </div>
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Unlock strategic procurement with intelligent digital
                        solutions
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-center gap-6">
                    <div className="w-12 h-12 relative">
                      <div className="w-9 h-9 left-[5.70px] top-[5.69px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-center gap-4">
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                        Transparent bidding opportunities
                      </div>
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Empower your business through transparent, efficient
                        tender management
                      </div>
                    </div>
                  </div>
                </div>
                <img
                  className="w-[540px] h-[540px]"
                  src="https://placehold.co/540x540"
                />
                <div className="flex-1 inline-flex flex-col justify-start items-center gap-16">
                  <div className="self-stretch flex flex-col justify-start items-center gap-6">
                    <div className="w-12 h-12 relative">
                      <div className="w-9 h-9 left-[5.76px] top-[4.95px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-center gap-4">
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                        Redefine business opportunities
                      </div>
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Navigate complex procurement landscapes with precision
                        and confidence
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-center gap-6">
                    <div className="w-12 h-12 relative">
                      <div className="w-8 h-[3.42px] left-[7.70px] top-[5.69px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-center gap-4">
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                        Accelerate project success
                      </div>
                      <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Transform tender processes into strategic growth
                        opportunities for businesses and contractors
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="inline-flex justify-start items-center gap-6">
                <div
                  data-alternate="False"
                  data-icon-position="No icon"
                  data-small="False"
                  data-style="Secondary"
                  className="px-3 py-1.5 bg-Opacity-Neutral-Darkest-5/5 outline outline-1 outline-Opacity-Transparent/0 flex justify-center items-center gap-2 overflow-hidden"
                >
                  <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                    Explore
                  </div>
                </div>
                <div
                  data-alternate="False"
                  data-icon-position="Trailing"
                  data-small="False"
                  data-style="Link"
                  className="flex justify-center items-center gap-2 overflow-hidden"
                >
                  <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                    Connect
                  </div>
                  <div className="w-6 h-6 relative overflow-hidden">
                    <div className="w-1.5 h-3 left-[8.51px] top-[6.17px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-start gap-20">
              <div className="self-stretch flex flex-col justify-start items-center">
                <div className="w-full max-w-[768px] flex flex-col justify-start items-center gap-6">
                  <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[62.40px]">
                    Platform preview
                  </div>
                  <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-lg font-normal font-['Inter'] leading-7">
                    Experience GoTenderly's intuitive interface
                  </div>
                </div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-12">
                <div className="inline-flex justify-start items-start gap-8">
                  <img
                    className="w-[1120px] h-[720px]"
                    src="https://placehold.co/1120x720"
                  />
                  <img
                    className="w-[1120px] h-[720px]"
                    src="https://placehold.co/1120x720"
                  />
                  <img
                    className="w-[1120px] h-[720px]"
                    src="https://placehold.co/1120x720"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-start gap-20">
              <div className="self-stretch inline-flex justify-start items-center gap-20">
                <img
                  className="flex-1 h-[640px]"
                  src="https://placehold.co/600x640"
                />
                <div className="flex-1 inline-flex flex-col justify-start items-start gap-8 overflow-hidden">
                  <div className="inline-flex justify-start items-start gap-1 overflow-hidden">
                    <div className="w-5 h-5 bg-Color-Scheme-1-Text" />
                    <div className="w-5 h-5 bg-Color-Scheme-1-Text" />
                    <div className="w-5 h-5 bg-Color-Scheme-1-Text" />
                    <div className="w-5 h-5 bg-Color-Scheme-1-Text" />
                    <div className="w-5 h-5 bg-Color-Scheme-1-Text" />
                  </div>
                  <div className="self-stretch justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in eros elementum tristique. Duis
                    cursus, mi quis viverra ornare, eros dolor interdum nulla,
                    ut commodo diam libero vitae erat."
                  </div>
                  <div className="inline-flex justify-start items-center gap-5">
                    <div className="inline-flex flex-col justify-start items-start">
                      <div className="justify-start text-Color-Scheme-1-Text text-base font-semibold font-['Inter'] leading-6">
                        Ahmed Hassan
                      </div>
                      <div className="justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        CEO, Al Noor Construction
                      </div>
                    </div>
                    <div className="w-16 h-0 origin-top-left rotate-90 outline outline-1 outline-offset-[-0.50px] outline-Color-Scheme-1-Border/20"></div>
                    <div
                      data-alternate="False"
                      data-logo="2"
                      className="w-28 h-12 relative overflow-hidden"
                    >
                      <div className="w-28 h-5 left-[2.14px] top-[14.36px] absolute bg-Color-Scheme-1-Text" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-start gap-20">
              <div className="self-stretch inline-flex justify-start items-start gap-20">
                <div className="flex-1 max-w-[768px] inline-flex flex-col justify-start items-start gap-4">
                  <div className="inline-flex justify-start items-center">
                    <div className="text-center justify-start text-Color-Scheme-1-Text text-base font-semibold font-['Inter'] leading-6">
                      Pricing
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-6">
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[62.40px]">
                      Simple tender access
                    </div>
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-lg font-normal font-['Inter'] leading-7">
                      Transparent pricing model designed for Qatar's digital
                      tender marketplace with flexible entry options.
                    </div>
                  </div>
                  <div className="self-stretch pt-8 flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-Color-Scheme-1-Text text-xl font-medium font-['Outfit'] leading-8">
                      Trusted by Qatar's leading procurement professionals
                    </div>
                    <div className="self-stretch py-2 inline-flex justify-start items-start gap-8 flex-wrap content-start">
                      <div
                        data-alternate="False"
                        data-logo="1"
                        className="w-24 h-10 relative overflow-hidden"
                      >
                        <div className="w-24 h-6 left-[2.86px] top-[7.50px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                      <div
                        data-alternate="False"
                        data-logo="2"
                        className="w-24 h-10 relative overflow-hidden"
                      >
                        <div className="w-24 h-4 left-[1.79px] top-[11.96px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                      <div
                        data-alternate="False"
                        data-logo="1"
                        className="w-24 h-10 relative overflow-hidden"
                      >
                        <div className="w-24 h-6 left-[2.86px] top-[7.50px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                      <div
                        data-alternate="False"
                        data-logo="2"
                        className="w-24 h-10 relative overflow-hidden"
                      >
                        <div className="w-24 h-4 left-[1.79px] top-[11.96px] absolute bg-Color-Scheme-1-Text" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-8 bg-Color-Scheme-1-Foreground outline outline-1 outline-offset-[-1px] outline-Color-Scheme-1-Border/20 inline-flex flex-col justify-start items-start gap-8">
                  <div className="self-stretch inline-flex justify-between items-start">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-3xl font-medium font-['Outfit'] leading-10">
                        Tender entry
                      </div>
                      <div className="self-stretch justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                        Flexible digital tender access
                      </div>
                    </div>
                    <div className="justify-start text-Color-Scheme-1-Text text-7xl font-medium font-['Outfit'] leading-[86.40px]">
                      100
                    </div>
                  </div>
                  <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-Color-Scheme-1-Border/20"></div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                      Includes
                    </div>
                    <div className="self-stretch py-2 flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch inline-flex justify-start items-start gap-6">
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Secure bid submission access
                            </div>
                          </div>
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Verified professional contractor profiles
                            </div>
                          </div>
                        </div>
                        <div className="self-stretch inline-flex justify-start items-start gap-6">
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Encrypted payment transaction gateway
                            </div>
                          </div>
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Real-time bid tracking system
                            </div>
                          </div>
                        </div>
                        <div className="self-stretch inline-flex justify-start items-start gap-6">
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Instant communication channels
                            </div>
                          </div>
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Comprehensive tender performance analytics
                            </div>
                          </div>
                        </div>
                        <div className="self-stretch inline-flex justify-start items-start gap-6">
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Direct professional support access
                            </div>
                          </div>
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Monthly tender opportunity insights
                            </div>
                          </div>
                        </div>
                        <div className="self-stretch inline-flex justify-start items-start gap-6">
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Strategic bid placement tools
                            </div>
                          </div>
                          <div className="flex-1 flex justify-start items-start gap-4">
                            <div className="w-6 h-6 relative overflow-hidden">
                              <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                            </div>
                            <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                              Clear and transparent fee structure
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-start gap-6">
                        <div className="flex-1 flex justify-start items-start gap-4">
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                          </div>
                          <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                            Feature text goes here
                          </div>
                        </div>
                        <div className="flex-1 flex justify-start items-start gap-4">
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                          </div>
                          <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                            Feature text goes here
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-start gap-6">
                        <div className="flex-1 flex justify-start items-start gap-4">
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                          </div>
                          <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                            Feature text goes here
                          </div>
                        </div>
                        <div className="flex-1 flex justify-start items-start gap-4">
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                          </div>
                          <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                            Feature text goes here
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-start gap-6">
                        <div className="flex-1 flex justify-start items-start gap-4">
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                          </div>
                          <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                            Feature text goes here
                          </div>
                        </div>
                        <div className="flex-1 flex justify-start items-start gap-4">
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                          </div>
                          <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                            Feature text goes here
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-start gap-6">
                        <div className="flex-1 flex justify-start items-start gap-4">
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                          </div>
                          <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                            Feature text goes here
                          </div>
                        </div>
                        <div className="flex-1 flex justify-start items-start gap-4">
                          <div className="w-6 h-6 relative overflow-hidden">
                            <div className="w-4 h-3 left-[4.06px] top-[6.30px] absolute bg-Color-Scheme-1-Text border border-Color-Scheme-1-Text" />
                          </div>
                          <div className="flex-1 justify-start text-Color-Scheme-1-Text text-base font-normal font-['Inter'] leading-6">
                            Feature text goes here
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-Color-Scheme-1-Border/20"></div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div
                      data-alternate="False"
                      data-icon-position="No icon"
                      data-small="False"
                      data-style="Primary"
                      className="self-stretch px-3 py-1.5 bg-Color-Matisse outline outline-1 outline-Color-Matisse inline-flex justify-center items-center gap-2"
                    >
                      <div className="justify-start text-Color-White text-base font-medium font-['Inter'] leading-6">
                        Start bidding
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-28 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-20 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-start gap-20">
              <div className="self-stretch inline-flex justify-start items-start gap-16">
                <div className="flex-1 inline-flex flex-col justify-start items-center gap-8">
                  <div className="w-12 h-12 relative">
                    <div className="w-10 h-6 left-[3.70px] top-[11.80px] absolute bg-Color-Scheme-1-Text" />
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-6">
                    <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[62.40px]">
                      Your tender revolution starts
                    </div>
                    <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-lg font-normal font-['Inter'] leading-7">
                      Simplify complex procurement with a platform that turns
                      challenges into strategic opportunities for Qatar's
                      businesses.
                    </div>
                  </div>
                  <div className="inline-flex justify-start items-start gap-4">
                    <div
                      data-alternate="False"
                      data-icon-position="No icon"
                      data-small="False"
                      data-style="Primary"
                      className="px-3 py-1.5 bg-Color-Matisse outline outline-1 outline-Color-Matisse flex justify-center items-center gap-2"
                    >
                      <div className="justify-start text-Color-White text-base font-medium font-['Inter'] leading-6">
                        Activate
                      </div>
                    </div>
                    <div
                      data-alternate="False"
                      data-icon-position="No icon"
                      data-small="False"
                      data-style="Secondary"
                      className="px-3 py-1.5 bg-Opacity-Neutral-Darkest-5/5 outline outline-1 outline-Opacity-Transparent/0 flex justify-center items-center gap-2"
                    >
                      <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                        Discover
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 inline-flex flex-col justify-start items-center gap-8">
                  <div className="w-12 h-12 relative">
                    <div className="w-10 h-11 left-[3.70px] top-[2.32px] absolute bg-Color-Scheme-1-Text" />
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-6">
                    <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-5xl font-medium font-['Outfit'] leading-[62.40px]">
                      Empower your vision
                    </div>
                    <div className="self-stretch text-center justify-start text-Color-Scheme-1-Text text-lg font-normal font-['Inter'] leading-7">
                      Break through traditional barriers and create seamless
                      connections between businesses and contractors.
                    </div>
                  </div>
                  <div className="inline-flex justify-start items-start gap-4">
                    <div
                      data-alternate="False"
                      data-icon-position="No icon"
                      data-small="False"
                      data-style="Primary"
                      className="px-3 py-1.5 bg-Color-Matisse outline outline-1 outline-Color-Matisse flex justify-center items-center gap-2"
                    >
                      <div className="justify-start text-Color-White text-base font-medium font-['Inter'] leading-6">
                        Transform
                      </div>
                    </div>
                    <div
                      data-alternate="False"
                      data-icon-position="No icon"
                      data-small="False"
                      data-style="Secondary"
                      className="px-3 py-1.5 bg-Opacity-Neutral-Darkest-5/5 outline outline-1 outline-Opacity-Transparent/0 flex justify-center items-center gap-2"
                    >
                      <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                        Explore
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="self-stretch px-16 py-20 bg-Color-Scheme-1-Background flex flex-col justify-start items-center gap-12 overflow-hidden">
            <div className="w-full max-w-[1280px] flex flex-col justify-start items-start gap-20">
              <div className="self-stretch flex flex-col justify-start items-start gap-12">
                <div className="self-stretch inline-flex justify-between items-start">
                  <div className="flex-1 max-w-[560px] inline-flex flex-col justify-start items-start gap-6">
                    <div
                      data-alternate="False"
                      className="w-20 h-9 relative overflow-hidden"
                    >
                      <div className="w-16 h-9 left-[6.67px] top-0 absolute overflow-hidden">
                        <div className="w-5 h-4 left-[50.82px] top-[10.88px] absolute bg-Color-Neutral-Darkest" />
                        <div className="w-5 h-6 left-[34.33px] top-[11.32px] absolute bg-Color-Neutral-Darkest" />
                        <div className="w-5 h-4 left-[18.55px] top-[10.88px] absolute bg-Color-Neutral-Darkest" />
                        <div className="w-5 h-4 left-0 top-[10.24px] absolute bg-Color-Neutral-Darkest" />
                        <div className="w-4 h-2.5 left-[1.15px] top-0 absolute bg-Color-Neutral-Darkest" />
                      </div>
                    </div>
                    <div className="inline-flex justify-center items-start gap-8">
                      <div className="justify-start text-Color-Scheme-1-Text text-sm font-semibold font-['Inter'] leading-5">
                        Link One
                      </div>
                      <div className="justify-start text-Color-Scheme-1-Text text-sm font-semibold font-['Inter'] leading-5">
                        Link Two
                      </div>
                      <div className="justify-start text-Color-Scheme-1-Text text-sm font-semibold font-['Inter'] leading-5">
                        Link Three
                      </div>
                      <div className="justify-start text-Color-Scheme-1-Text text-sm font-semibold font-['Inter'] leading-5">
                        Link Four
                      </div>
                      <div className="justify-start text-Color-Scheme-1-Text text-sm font-semibold font-['Inter'] leading-5">
                        Link Five
                      </div>
                    </div>
                  </div>
                  <div className="w-96 inline-flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch justify-start text-Color-Scheme-1-Text text-base font-semibold font-['Inter'] leading-6">
                      Subscribe
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      <div className="self-stretch h-12 inline-flex justify-start items-start gap-4">
                        <div
                          data-alternate="False"
                          data-type="Default"
                          className="flex-1 p-3 outline outline-1 outline-Color-Neutral-Darkest flex justify-start items-center gap-2"
                        >
                          <div className="flex-1 justify-start text-black/60 text-base font-normal font-['Inter'] leading-6">
                            Enter your email
                          </div>
                        </div>
                        <div
                          data-alternate="False"
                          data-icon-position="No icon"
                          data-small="False"
                          data-style="Secondary"
                          className="px-3 py-1.5 bg-Opacity-Neutral-Darkest-5/5 outline outline-1 outline-Opacity-Transparent/0 flex justify-center items-center gap-2"
                        >
                          <div className="justify-start text-Color-Neutral-Darkest text-base font-medium font-['Inter'] leading-6">
                            Subscribe
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch h-4 inline-flex justify-start items-start gap-1">
                        <div className="justify-start text-Color-Scheme-1-Text text-xs font-normal font-['Inter'] leading-4">
                          By subscribing you agree to with our
                        </div>
                        <div className="justify-start">
                          <span class="text-Color-Scheme-1-Text text-xs font-normal font-['Roboto'] underline leading-4">
                            P
                          </span>
                          <span class="text-Color-Scheme-1-Text text-xs font-normal font-['Inter'] underline leading-4">
                            rivacy Polic
                          </span>
                          <span class="text-Color-Scheme-1-Text text-xs font-normal font-['Roboto'] underline leading-4">
                            y
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-12">
                  <img
                    className="self-stretch h-44"
                    src="https://placehold.co/1280x174"
                  />
                  <div className="self-stretch flex flex-col justify-start items-start gap-8">
                    <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-Color-Scheme-1-Border/20"></div>
                    <div className="self-stretch h-5 inline-flex justify-between items-start">
                      <div className="flex justify-start items-start gap-6">
                        <div className="justify-start text-Color-Scheme-1-Text text-sm font-normal font-['Inter'] underline leading-5">
                          Privacy Policy
                        </div>
                        <div className="justify-start text-Color-Scheme-1-Text text-sm font-normal font-['Inter'] underline leading-5">
                          Terms of Service
                        </div>
                        <div className="justify-start text-Color-Scheme-1-Text text-sm font-normal font-['Inter'] underline leading-5">
                          Cookies Settings
                        </div>
                      </div>
                      <div className="justify-start text-Color-Scheme-1-Text text-sm font-normal font-['Inter'] leading-5">
                        © 2024 Relume. All rights reserved.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        */}
      </TooltipProvider>
    </PageTransitionWrapper>
  );
}
