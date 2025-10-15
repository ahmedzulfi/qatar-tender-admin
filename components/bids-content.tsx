"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "../lib/hooks/useTranslation";
import {
  Search,
  Eye,
  Building,
  Gavel,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart2,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { adminService } from "@/services/adminService";

// Types
interface Bid {
  _id: string;
  tender: {
    _id: string;
    title: string;
  };
  bidder: {
    _id: string;
    email: string;
    userType: string;
    companyName?: string;
  };
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  documents?: Array<{
    name: string;
    url: string;
  }>;
  flagged?: boolean;
}

interface BidListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tenderId?: string;
}

export function BidsContent() {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tenderFilter, setTenderFilter] = useState<string>("all");
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBids: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [sortField, setSortField] = useState<
    keyof Bid | "amount" | "createdAt"
  >("createdAt");
  const [sortDirection, setSortDirection] = useState<
    "ascending" | "descending"
  >("descending");

  // State for KPI data (separate from paginated bids)
  const [kpiData, setKpiData] = useState({
    totalValue: 0,
    averageBid: 0,
    highestBid: 0,
    lowestBid: 0,
    bidTrend: "neutral" as "increasing" | "decreasing" | "neutral",
    activeBids: 0,
    acceptedBids: 0,
    rejectedBids: 0,
    totalBidders: 0,
    totalBidsCount: 0,
  });
  const [kpiLoading, setKpiLoading] = useState<boolean>(true);

  // Fetch bids data for table (paginated)
  const fetchBids = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);

    try {
      const params: BidListParams = {
        page,
        limit,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        tenderId: tenderFilter !== "all" ? tenderFilter : undefined,
      };

      const response = await adminService.getBids(params);

      if (response.success && response.data) {
        let fetchedBids = response.data.bids || [];

        // Apply client-side sorting
        fetchedBids = fetchedBids.sort((a, b) => {
          let aValue =
            sortField === "amount" ? a.amount : a[sortField as keyof Bid];
          let bValue =
            sortField === "amount" ? b.amount : b[sortField as keyof Bid];

          if (aValue < bValue) {
            return sortDirection === "ascending" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortDirection === "ascending" ? 1 : -1;
          }
          return 0;
        });

        setBids(fetchedBids);
        setPagination({
          currentPage: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          totalBids: response.data.pagination?.totalBids || 0,
          hasNext: response.data.pagination?.hasNext || false,
          hasPrev: response.data.pagination?.hasPrev || false,
        });
      } else {
        setError("Failed to fetch bids data");
        setBids([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalBids: 0,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError("Failed to load bids data");
      setBids([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalBids: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch KPI data (all bids, no pagination)
  const fetchKpiData = async () => {
    setKpiLoading(true);

    try {
      // Fetch all bids without pagination for KPI calculations
      const allBidsResponse = await adminService.getBids({ limit: 1000 }); // Adjust limit as needed

      if (allBidsResponse.success && allBidsResponse.data) {
        const allBids = allBidsResponse.data.bids || [];

        // Calculate KPI metrics from all bids
        const activeBids = allBids.filter(
          (bid) => bid.status === "submitted" || bid.status === "under_review"
        ).length;
        const acceptedBids = allBids.filter(
          (bid) => bid.status === "accepted"
        ).length;
        const rejectedBids = allBids.filter(
          (bid) => bid.status === "rejected"
        ).length;

        const bidAmounts = allBids
          .map((bid) => bid.amount)
          .filter((amount) => amount > 0);
        const totalValue = bidAmounts.reduce((sum, amount) => sum + amount, 0);
        const averageBid =
          bidAmounts.length > 0 ? totalValue / bidAmounts.length : 0;
        const highestBid = bidAmounts.length > 0 ? Math.max(...bidAmounts) : 0;
        const lowestBid = bidAmounts.length > 0 ? Math.min(...bidAmounts) : 0;

        // Calculate bid trend (simplified - in a real app, you'd compare with previous period)
        const bidTrend =
          activeBids > acceptedBids
            ? "increasing"
            : acceptedBids > rejectedBids
            ? "decreasing"
            : "neutral";

        const totalBidders = new Set(allBids.map((bid) => bid.bidder?._id))
          .size;
        const totalBidsCount = allBids.length;

        setKpiData({
          totalValue,
          averageBid,
          highestBid,
          lowestBid,
          bidTrend,
          activeBids,
          acceptedBids,
          rejectedBids,
          totalBidders,
          totalBidsCount,
        });
      }
    } catch (err) {
      console.error("Error fetching KPI data:", err);
    } finally {
      setKpiLoading(false);
    }
  };

  // Get unique tenders for filter
  const getUniqueTenders = () => {
    const tenderMap = new Map<string, string>();
    bids.forEach((bid) => {
      if (bid.tender?._id && bid.tender?.title) {
        tenderMap.set(bid.tender._id, bid.tender.title);
      }
    });
    return Array.from(tenderMap.entries()).map(([id, title]) => ({
      id,
      title,
    }));
  };

  // Handle sorting change
  const handleSortChange = (value: string) => {
    const [field, direction] = value.split(":");
    setSortField(field as keyof Bid | "amount" | "createdAt");
    setSortDirection(direction as "ascending" | "descending");
  };

  // Status badge component - Updated to show "Active" for pending review
  const getStatusBadge = (status: string, flagged?: boolean) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return (
          <Badge className="bg-green-100/80 text-green-700 hover:bg-green-100 transition-colors">
            {t("status_accepted")}
          </Badge>
        );
      case "submitted":
      case "under_review":
        return (
          <Badge className="bg-blue-100/80 text-blue-700 hover:bg-blue-100 transition-colors">
            {t("status_active")} {/* Changed from "Submitted" to "Active" */}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100/80 text-red-700 hover:bg-red-100 transition-colors">
            {t("status_rejected")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100/80 text-gray-700">
            {status}
          </Badge>
        );
    }
  };

  // Status icon component
  const getStatusIcon = (status: string, flagged?: boolean) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "submitted":
      case "under_review":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchBids(page, 10);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    fetchBids(1, 10);
  }, [searchTerm, statusFilter, tenderFilter, sortField, sortDirection]);

  // Fetch KPI data on component mount
  useEffect(() => {
    fetchKpiData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton for Filters */}
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-[180px]" />
              <Skeleton className="h-10 w-full sm:w-[200px]" />
            </div>

            {/* Skeleton for Table */}
            <div className="rounded-lg border border-gray-100/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    {[...Array(7)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50">
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Skeleton for Pagination */}
            <div className="flex items-center justify-between mt-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center space-x-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-8 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error Loading Bids
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => fetchBids(1, 10)} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Apple-style KPI Cards - Now showing data for ALL bids */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Bid Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kpiLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  formatAmount(kpiData.totalValue)
                )}
              </div>
              <div className="flex items-center mt-2">
                {kpiLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <>
                    {kpiData.bidTrend === "increasing" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : kpiData.bidTrend === "decreasing" ? (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-400 mr-1" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        kpiData.bidTrend === "increasing"
                          ? "text-green-600"
                          : kpiData.bidTrend === "decreasing"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {kpiData.bidTrend === "increasing"
                        ? "Increasing"
                        : kpiData.bidTrend === "decreasing"
                        ? "Decreasing"
                        : "Stable"}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Bid Amount
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kpiLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  formatAmount(kpiData.averageBid)
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {kpiLoading ? (
                  <Skeleton className="h-3 w-32" />
                ) : (
                  <>
                    Min: {formatAmount(kpiData.lowestBid)} | Max:{" "}
                    {formatAmount(kpiData.highestBid)}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Bids
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kpiLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  kpiData.activeBids
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {kpiLoading ? (
                  <Skeleton className="h-3 w-24" />
                ) : (
                  `${
                    Math.round(
                      (kpiData.activeBids / kpiData.totalBidsCount) * 100
                    ) || 0
                  }% of total`
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Unique Bidders
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kpiLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  kpiData.totalBidders
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {kpiLoading ? (
                  <Skeleton className="h-3 w-24" />
                ) : (
                  `${
                    Math.round(
                      (kpiData.totalBidders / kpiData.totalBidsCount) * 100
                    ) || 0
                  }% participation`
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div> */}

      {/* Apple-style Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <CardHeader className="border border-gray-100/50">
          <CardTitle className="text-xl mt-5 ps-3 pb-0 font-semibold text-gray-900">
            {t("bid_management")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_bids_vendors_tenders")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_status")}</SelectItem>
                <SelectItem value="submitted">
                  {t("status_active")}
                </SelectItem>{" "}
                {/* Changed to Active */}
                <SelectItem value="accepted">{t("status_accepted")}</SelectItem>
                <SelectItem value="rejected">{t("status_rejected")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tenderFilter} onValueChange={setTenderFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_tender")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_tenders")}</SelectItem>
                {getUniqueTenders().map((tender) => (
                  <SelectItem key={tender.id} value={tender.id}>
                    {tender.title.length > 30
                      ? `${tender.title.substring(0, 30)}...`
                      : tender.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sorting Selector */}
            <Select
              value={`${sortField}:${sortDirection}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("sort_by")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt:descending">
                  {t("newest_first")}
                </SelectItem>
                <SelectItem value="createdAt:ascending">
                  {t("oldest_first")}
                </SelectItem>
                <SelectItem value="amount:descending">
                  {t("highest_amount")}
                </SelectItem>
                <SelectItem value="amount:ascending">
                  {t("lowest_amount")}
                </SelectItem>
                <SelectItem value="tender.title:ascending">
                  {t("tender_a_to_z")}
                </SelectItem>
                <SelectItem value="tender.title:descending">
                  {t("tender_z_to_a")}
                </SelectItem>
                <SelectItem value="bidder.email:ascending">
                  {t("vendor_a_to_z")}
                </SelectItem>
                <SelectItem value="bidder.email:descending">
                  {t("vendor_z_to_a")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apple-style Bids Table - Removed sortable headers */}
          <div className="rounded-lg border border-gray-100/50 overflow-hidden bg-white/80 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                  <TableHead className="w-32">{t("bid_details")}</TableHead>
                  <TableHead>{t("tender")}</TableHead>
                  <TableHead>{t("vendor")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("submitted")}</TableHead>
                  <TableHead className="w-32">{t("status")}</TableHead>
                  <TableHead className="w-20">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="text-gray-500">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No bids found</p>
                        <p className="text-sm">
                          Try adjusting your filters or search term
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  bids.map((bid) => (
                    <TableRow
                      key={bid._id}
                      className="hover:bg-gray-50/50 cursor-pointer border-b border-gray-100/50 transition-colors group"
                    >
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(bid.status, bid.flagged)}
                          <div className="ml-2">
                            <div className="font-medium text-gray-900 text-sm">
                              {bid._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <Link
                            href={`/admin/tenders/${bid.tender?._id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                          >
                            {bid.tender?.title || "N/A"}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {bid.tender?._id?.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {bid.bidder?.companyName ||
                                bid.bidder?.email ||
                                "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {bid.bidder?.userType || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {formatAmount(bid.amount)}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {formatDate(bid.createdAt)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(bid.status, bid.flagged)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0  group-hover:opacity-100 transition-opacity"
                            >
                              <span className="sr-only">Open menu</span>
                              <Clock className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <Link href={`/admin/bids/${bid._id}`} passHref>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("view_details")}
                              </DropdownMenuItem>
                            </Link>
                            {bid.documents && bid.documents.length > 0 && (
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                {t("view_documents")}
                              </DropdownMenuItem>
                            )}
                            {/* Removed Accept Bid and Reject Bid options as requested */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Apple-style Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2 py-4 bg-gray-50/50 rounded-lg">
              <div className="text-sm text-gray-600">
                Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
                {Math.min(pagination.currentPage * 10, pagination.totalBids)} of{" "}
                {pagination.totalBids} bids
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map(
                    (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={
                            pagination.currentPage === page
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={
                            pagination.currentPage === page
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                          }
                        >
                          {page}
                        </Button>
                      );
                    }
                  )}
                  {pagination.totalPages > 5 && (
                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                  )}
                  {pagination.totalPages > 5 && (
                    <Button
                      variant={
                        pagination.currentPage === pagination.totalPages
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      className={
                        pagination.currentPage === pagination.totalPages
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      }
                    >
                      {pagination.totalPages}
                    </Button>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </motion.div>

      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-white/90 backdrop-blur-xl border border-gray-100/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {t("upload_documents")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("upload_additional_documents_for_this_bid")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="document-upload"
                className="text-sm font-medium text-gray-700"
              >
                {t("select_documents")}
              </Label>
              <Input
                id="document-upload"
                type="file"
                multiple
                className="mt-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <Label
                htmlFor="document-notes"
                className="text-sm font-medium text-gray-700"
              >
                {t("add_any_notes_about_these_documents")}
              </Label>
              <Textarea
                id="document-notes"
                placeholder={t("add_any_notes_about_these_documents")}
                className="mt-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors resize-none"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setUploadDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              {t("upload_documents")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
