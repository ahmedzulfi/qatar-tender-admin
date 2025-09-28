"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Eye,
  Building,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Download,
  RefreshCw,
  ArrowRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { verifyUserDocuments } from "@/services/verificationService";

// Types based on your schemas
interface User {
  _id: string;
  email: string;
  userType: "individual" | "business" | "admin";
  isVerified: boolean;
  isDocumentVerified?: "Not Submitted" | "pending" | "verified" | "rejected";
  isBanned?: boolean;
  banReason?: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    fullName?: string;
    phone?: string;
    address?: string;
    companyName?: string;
    commercialRegistrationNumber?: string;
    nationalId?: string;
    nationalIdFront?: string;
    nationalIdBack?: string;
  };
  // Documents are now directly on the user object
  documents?: {
    nationalId?: string;
    nationalIdFront?: string;
    nationalIdBack?: string;
    commercialRegistrationNumber?: string;
    commercialRegistrationDoc?: string;
  };
}

interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  userType?: string;
  isDocumentVerified?: string;
}

export function KycContent() {
  const { t } = useTranslation();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  const formatBudget = (budget: number) => {
    if (budget === 0) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const getStatusBadge = (status: string, isBanned?: boolean) => {
    if (isBanned) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          {t("status_banned")}
        </Badge>
      );
    }

    switch (status.toLowerCase()) {
      case "active":
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("status_active")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t("status_pending")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("status_rejected")}
          </Badge>
        );
      case "awarded":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {t("status_awarded")}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t("status_completed")}
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t("status_closed")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getKycStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("kyc_verified")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t("kyc_pending")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("kyc_rejected")}
          </Badge>
        );
      case "not submitted":
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t("kyc_not_submitted")}
          </Badge>
        );
    }
  };

  const getBidStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("status_awarded")}
          </Badge>
        );
      case "submitted":
      case "under_review":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {t("status_submitted")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("status_rejected")}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t("status_completed")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t("status_pending")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("payment_paid")}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            {t("payment_pending")}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("payment_failed")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Normalize document field (handle arrays and strings)
  const normalizeDocField = (field: string | string[] | undefined | null): string | null => {
    if (!field) return null;
    if (Array.isArray(field)) {
      return field[0] || null;
    }
    return field;
  };

  // Open document in new tab
  const openDocument = (rawField: string | string[] | undefined | null) => {
    const url = normalizeDocField(rawField);
    if (url) {
      window.open(url, "_blank");
    }
  };

  // Check if business documents are complete
  const isBusinessDocsComplete = (user: User) => {
    const num = user.documents?.commercialRegistrationNumber;
    const doc = normalizeDocField(user.documents?.commercialRegistrationDoc);
    return Boolean(num && num.toString().trim() !== "" && doc);
  };

  // Check if individual documents are complete
  const isIndividualDocsComplete = (user: User) => {
    const id = user.documents?.nationalId;
    const front = normalizeDocField(user.documents?.nationalIdFront);
    const back = normalizeDocField(user.documents?.nationalIdBack);
    return Boolean(id && id.toString().trim() !== "" && front && back);
  };

  // Handle document verification
  const handleVerifyDocument = async (userId: string, status: "verified" | "rejected") => {
    setActionLoading(true);
    try {
      const payload = { status };
      if (status === "rejected" && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await verifyUserDocuments(
        userId,
        status,
        status === "rejected" ? rejectionReason : undefined
      );

      if (response.success) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, isDocumentVerified: status } 
            : user
        ));
        
        setFilteredUsers(prev => prev.map(user => 
          user._id === userId 
            ? { ...user, isDocumentVerified: status } 
            : user
        ));
        
        // Close dialog
        setSelectedUser(null);
        setRejectionReason("");
        setApprovalNotes("");
      }
    } catch (err) {
      console.error("Error verifying document:", err);
      setError(
        err instanceof Error ? err.message : "Failed to verify document"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: UserListParams = {
          page: currentPage,
          limit: usersPerPage,
          search: searchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          userType: typeFilter !== "all" ? typeFilter : undefined,
          isDocumentVerified: kycFilter !== "all" ? kycFilter : undefined,
        };

        const response = await adminService.getUsers(params);

        if (response.success && response.data) {
          setUsers(response.data.users || []);
          setFilteredUsers(response.data.users || []);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalUsers(response.data.pagination?.totalUsers || 0);
        } else {
          throw new Error("Failed to fetch users data");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load users data"
        );
        setUsers([]);
        setFilteredUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, typeFilter, kycFilter]);

  // Apply client-side filters
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.profile?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => {
        if (statusFilter === "active") {
          return user.isVerified && !user.isBanned;
        }
        if (statusFilter === "banned") {
          return user.isBanned;
        }
        if (statusFilter === "pending") {
          return !user.isVerified;
        }
        return false;
      });
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((user) => user.userType === typeFilter);
    }

    // Apply KYC filter
    if (kycFilter !== "all") {
      result = result.filter((user) => user.isDocumentVerified === kycFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, statusFilter, typeFilter, kycFilter, users]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-24" />
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        {/* Filters Skeleton */}
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-[180px]" />
              <Skeleton className="h-10 w-full sm:w-[180px]" />
              <Skeleton className="h-10 w-full sm:w-[180px]" />
            </div>
            
            {/* Table Skeleton */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    {[...Array(6)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50">
                      {[...Array(6)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between mt-6">
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
      <div className="space-y-6 p-4 sm:p-6">
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              {t("error_loading_users")}
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              {t("retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("user_management")}
          </h1>
          <p className="text-gray-600">
            {t("manage_all_users_in_the_system")}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Apple Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("total_users")}
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("all_registered_users")}
              </p>
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
                {t("active_users")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isVerified && !u.isBanned).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("verified_and_active")}
              </p>
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
                {t("pending_verification")}
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter(u => !u.isVerified).length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("awaiting_email_verification")}
              </p>
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
                {t("kyc_pending")}
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.isDocumentVerified === "pending").length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("awaiting_document_verification")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters - Apple Style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <CardHeader className="border-b border-gray-100/50">
          <CardTitle className="text-xl font-semibold text-gray-900">
            {t("filter_users")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_users_emails_names")}
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
                <SelectItem value="all">{t("all_statuses")}</SelectItem>
                <SelectItem value="active">{t("status_active")}</SelectItem>
                <SelectItem value="banned">{t("status_banned")}</SelectItem>
                <SelectItem value="pending">{t("status_pending")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_types")}</SelectItem>
                <SelectItem value="individual">{t("user_individual")}</SelectItem>
                <SelectItem value="business">{t("user_business")}</SelectItem>
                <SelectItem value="admin">{t("user_admin")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_kyc")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_kyc_statuses")}</SelectItem>
                <SelectItem value="pending">{t("kyc_pending")}</SelectItem>
                <SelectItem value="verified">{t("kyc_verified")}</SelectItem>
                <SelectItem value="rejected">{t("kyc_rejected")}</SelectItem>
                <SelectItem value="Not Submitted">
                  {t("kyc_not_submitted")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table - Apple Style */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("kyc_status")}</TableHead>
                  <TableHead>{t("joined")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="text-gray-500">
                        <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">
                          {t("no_users_found")}
                        </p>
                        <p className="text-sm">
                          {t("adjust_filters_or_search")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user._id}
                      className="border-b border-gray-100/50 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.profile?.companyName ||
                                user.profile?.fullName ||
                                user.email}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {user.userType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.userType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          user.isVerified ? "verified" : "pending",
                          user.isBanned
                        )}
                      </TableCell>
                      <TableCell>
                        {getKycStatusBadge(user.isDocumentVerified || "Not Submitted")}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t("view_details")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-gray-900">
                                {t("user_details")}
                              </DialogTitle>
                              <DialogDescription className="text-gray-600">
                                {t("view_and_manage_user_information")}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                {/* User Information Card */}
                                <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                  <CardHeader>
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                      {t("user_information")}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="flex items-center space-x-3">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            {t("name")}
                                          </p>
                                          <p className="font-medium">
                                            {selectedUser.profile?.fullName ||
                                              selectedUser.profile?.companyName ||
                                              selectedUser.email}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-3">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            {t("email")}
                                          </p>
                                          <p className="font-medium">
                                            {selectedUser.email}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            {t("phone")}
                                          </p>
                                          <p className="font-medium">
                                            {selectedUser.profile?.phone || "N/A"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-start space-x-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            {t("address")}
                                          </p>
                                          <p className="text-gray-900">
                                            {selectedUser.profile?.address || "Not provided"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-3">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            {t("join_date")}
                                          </p>
                                          <p className="font-medium">
                                            {formatDate(selectedUser.createdAt)}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-3">
                                        <CheckCircle className="h-5 w-5 text-gray-400" />
                                        <div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            {t("account_status")}
                                          </p>
                                          <div className="flex items-center">
                                            {getStatusBadge(
                                              selectedUser.isVerified ? "verified" : "pending",
                                              selectedUser.isBanned
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-gray-400" />
                                        <div>
                                          <p className="text-sm text-gray-600 mb-1">
                                            {t("kyc_status")}
                                          </p>
                                          <div className="flex items-center">
                                            {getKycStatusBadge(
                                              selectedUser.isDocumentVerified || "Not Submitted"
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {selectedUser.isBanned && selectedUser.banReason && (
                                        <div className="flex items-start space-x-3">
                                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                          <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                              {t("ban_reason")}
                                            </p>
                                            <p className="text-red-600 font-medium">
                                              {selectedUser.banReason}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* User Type Specific Details */}
                                <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                  <CardHeader>
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                      {selectedUser.userType === "business"
                                        ? t("business_details")
                                        : selectedUser.userType === "individual"
                                        ? t("individual_details")
                                        : t("admin_details")}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-6">
                                    {selectedUser.userType === "business" && (
                                      <>
                                        <div className="flex items-center space-x-3">
                                          <Building className="h-5 w-5 text-gray-400" />
                                          <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                              {t("company_name")}
                                            </p>
                                            <p className="font-medium">
                                              {selectedUser.profile?.companyName || "N/A"}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                          <FileText className="h-5 w-5 text-gray-400" />
                                          <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                              {t("commercial_registration_number")}
                                            </p>
                                            <p className="font-medium">
                                              {selectedUser.documents?.commercialRegistrationNumber || "N/A"}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                          <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-900">
                                              {t("commercial_registration_doc")}
                                            </h3>
                                            {selectedUser.documents?.commercialRegistrationDoc ? (
                                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                {t("document_uploaded")}
                                              </Badge>
                                            ) : (
                                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                                {t("document_not_uploaded")}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              {selectedUser.documents?.commercialRegistrationDoc ? (
                                                <div className="aspect-video bg-white rounded mb-3 flex items-center justify-center border border-gray-200">
                                                  <FileText className="h-8 w-8 text-red-600" />
                                                </div>
                                              ) : (
                                                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                                                  <FileText className="h-8 w-8 text-gray-300" />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex flex-col space-y-2 ml-4">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                                disabled={!selectedUser.documents?.commercialRegistrationDoc}
                                                onClick={() => openDocument(selectedUser.documents?.commercialRegistrationDoc)}
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                {t("view")}
                                              </Button>
                                              <a
                                                href={selectedUser.documents?.commercialRegistrationDoc || "#"}
                                                download
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                onClick={(e) => {
                                                  if (!selectedUser.documents?.commercialRegistrationDoc) {
                                                    e.preventDefault();
                                                  }
                                                }}
                                              >
                                                <Download className="h-3 w-3 mr-1" />
                                                {t("download")}
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    )}

                                    {selectedUser.userType === "individual" && (
                                      <>
                                        <div className="flex items-center space-x-3">
                                          <FileText className="h-5 w-5 text-gray-400" />
                                          <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                              {t("national_id")}
                                            </p>
                                            <p className="font-medium">
                                              {selectedUser.documents?.nationalId || "N/A"}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                          <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-900">
                                              {t("national_id_front")}
                                            </h3>
                                            {selectedUser.documents?.nationalIdFront ? (
                                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                {t("document_uploaded")}
                                              </Badge>
                                            ) : (
                                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                                {t("document_not_uploaded")}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              {selectedUser.documents?.nationalIdFront ? (
                                                <div className="aspect-video bg-white rounded mb-3 flex items-center justify-center border border-gray-200">
                                                  <FileText className="h-8 w-8 text-red-600" />
                                                </div>
                                              ) : (
                                                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                                                  <FileText className="h-8 w-8 text-gray-300" />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex flex-col space-y-2 ml-4">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                                disabled={!selectedUser.documents?.nationalIdFront}
                                                onClick={() => openDocument(selectedUser.documents?.nationalIdFront)}
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                {t("view")}
                                              </Button>
                                              <a
                                                href={selectedUser.documents?.nationalIdFront || "#"}
                                                download
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                onClick={(e) => {
                                                  if (!selectedUser.documents?.nationalIdFront) {
                                                    e.preventDefault();
                                                  }
                                                }}
                                              >
                                                <Download className="h-3 w-3 mr-1" />
                                                {t("download")}
                                              </a>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                          <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-medium text-gray-900">
                                              {t("national_id_back")}
                                            </h3>
                                            {selectedUser.documents?.nationalIdBack ? (
                                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                {t("document_uploaded")}
                                              </Badge>
                                            ) : (
                                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                                {t("document_not_uploaded")}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              {selectedUser.documents?.nationalIdBack ? (
                                                <div className="aspect-video bg-white rounded mb-3 flex items-center justify-center border border-gray-200">
                                                  <FileText className="h-8 w-8 text-red-600" />
                                                </div>
                                              ) : (
                                                <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                                                  <FileText className="h-8 w-8 text-gray-300" />
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex flex-col space-y-2 ml-4">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                                disabled={!selectedUser.documents?.nationalIdBack}
                                                onClick={() => openDocument(selectedUser.documents?.nationalIdBack)}
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                {t("view")}
                                              </Button>
                                              <a
                                                href={selectedUser.documents?.nationalIdBack || "#"}
                                                download
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                onClick={(e) => {
                                                  if (!selectedUser.documents?.nationalIdBack) {
                                                    e.preventDefault();
                                                  }
                                                }}
                                              >
                                                <Download className="h-3 w-3 mr-1" />
                                                {t("download")}
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    )}

                                    {selectedUser.userType === "admin" && (
                                      <>
                                        <div className="text-center py-8 text-gray-500">
                                          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                          <p className="text-lg font-medium">
                                            {t("admin_user")}
                                          </p>
                                          <p className="text-sm">
                                            {t("admin_accounts_do_not_require_documents")}
                                          </p>
                                        </div>
                                      </>
                                    )}

                                    {/* KYC Verification Actions */}
                                    {selectedUser.isDocumentVerified === "pending" && (
                                      <div className="border-t border-gray-100/50 pt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                          {t("kyc_verification_actions")}
                                        </h3>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                          <Button
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors"
                                            onClick={() => handleVerifyDocument(selectedUser._id, "verified")}
                                            disabled={actionLoading}
                                          >
                                            {actionLoading ? (
                                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                            )}
                                            {t("approve_kyc")}
                                          </Button>

                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                variant="destructive"
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                disabled={actionLoading}
                                              >
                                                {actionLoading ? (
                                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                  <XCircle className="h-4 w-4 mr-2" />
                                                )}
                                                {t("reject_kyc")}
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                              <AlertDialogHeader>
                                                <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                                                  {t("reject_kyc_request")}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription className="text-gray-600">
                                                  {t("please_provide_reason_for_rejection")}
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <div className="py-4">
                                                <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                                                  {t("rejection_reason")}
                                                </label>
                                                <textarea
                                                  id="rejection-reason"
                                                  placeholder={t("enter_reason_for_rejection")}
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                  rows={4}
                                                />
                                              </div>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel
                                                  onClick={() => setRejectionReason("")}
                                                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                                >
                                                  {t("cancel")}
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                  className="bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                  onClick={() => handleVerifyDocument(selectedUser._id, "rejected")}
                                                  disabled={actionLoading}
                                                >
                                                  {actionLoading ? (
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                  ) : (
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                  )}
                                                  {t("reject_request")}
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3">
                                  <Link href={`/admin/users/${selectedUser._id}`} passHref>
                                    <Button
                                      variant="outline"
                                      className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      {t("view_full_user_profile")}
                                    </Button>
                                  </Link>
                                  <Button onClick={() => setSelectedUser(null)}>
                                    {t("close")}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - Apple Style */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2 py-4 bg-gray-50/50 rounded-lg">
              <div className="text-sm text-gray-600">
                {t("showing")}{" "}
                <span className="font-medium">
                  {(currentPage - 1) * usersPerPage + 1}
                </span>{" "}
                {t("to")}{" "}
                <span className="font-medium">
                  {Math.min(currentPage * usersPerPage, totalUsers)}
                </span>{" "}
                {t("of")} <span className="font-medium">{totalUsers}</span>{" "}
                {t("users")}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                >
                  {t("previous")}
                </Button>
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                        }
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="px-3 py-1 text-sm text-gray-500">...</span>
                  )}
                  {totalPages > 5 && (
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      className={
                        currentPage === totalPages
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      }
                    >
                      {totalPages}
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                >
                  {t("next")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </motion.div>
    </motion.div>
  );
}