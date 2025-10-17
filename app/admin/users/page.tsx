"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Building,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Types based on your schemas
interface User {
  _id: string;
  email: string;
  userType: "individual" | "business" | "admin";
  isVerified: boolean;
  isDocumentVerified?: "Not Submitted" | "pending" | "verified" | "rejected";
  companyName?: string;
  profile?: {
    fullName?: string;
    phone?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
  isBanned?: boolean;
}

export default function UsersPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
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
            {t("unactive")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("status_rejected")}
          </Badge>
        );
      case "banned":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("status_banned")}
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

  const getUserTypeBadge = (userType: string) => {
    switch (userType?.toLowerCase()) {
      case "individual":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {t("user_individual")}
          </Badge>
        );
      case "business":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t("user_business")}
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            {t("user_admin")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{userType}</Badge>;
    }
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await adminService.getUsers({
          page: currentPage,
          limit: usersPerPage,
        });

        if (response.success && response.data) {
          // ✅ Exclude admin users
          const nonAdminUsers = response.data.users.filter(
            (user: { userType: string; }) => user.userType !== "admin"
          );

          setUsers(nonAdminUsers);
          setFilteredUsers(nonAdminUsers);
          setTotalPages(response.data.pagination?.totalPages || 1);
          setTotalUsers(response.data.pagination?.totalUsers || 0);
        } else {
          throw new Error("Failed to fetch users");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Apply filters
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.profile?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "banned") {
        result = result.filter((user) => user.isBanned);
      } else {
        result = result.filter(
          (user) =>
            user.isVerified.toString() === statusFilter && !user.isBanned
        );
      }
    }

    // Apply KYC filter
    if (kycFilter !== "all") {
      result = result.filter(
        (user) => (user.isDocumentVerified || "Not Submitted") === kycFilter
      );
    }

    // Apply user type filter (still allows custom filters)
    if (userTypeFilter !== "all") {
      result = result.filter((user) => user.userType === userTypeFilter);
    }

    // ✅ Ensure admin users are excluded from filtered list too
    result = result.filter((user) => user.userType !== "admin");

    setFilteredUsers(result);
  }, [searchTerm, statusFilter, kycFilter, userTypeFilter, users]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
          <Skeleton className="h-10 w-full sm:w-[180px]" />
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
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Table Skeleton */}
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
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
      <div className="space-y-6">
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error Loading Users
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
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
      className="space-y-6"
    >
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
                {totalUsers}
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
                {t("verified_users")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.isVerified).length}
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
                {t("pending_verification")}
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter((u) => !u.isVerified).length}
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
                {t("kyc_pending")}
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.isDocumentVerified === "pending").length}
              </div>
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
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_users")}
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
                <SelectItem value="true">{t("active")}</SelectItem>
                <SelectItem value="false">{t("unactive")}</SelectItem>
                <SelectItem value="banned">{t("status_banned")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_kyc")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_kyc_statuses")}</SelectItem>
                <SelectItem value="verified">{t("kyc_verified")}</SelectItem>
                <SelectItem value="pending">{t("kyc_pending")}</SelectItem>
                <SelectItem value="rejected">{t("kyc_rejected")}</SelectItem>
                <SelectItem value="Not Submitted">
                  {t("kyc_not_submitted")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_user_types")}</SelectItem>
                <SelectItem value="individual">
                  {t("user_individual")}
                </SelectItem>
                <SelectItem value="business">{t("user_business")}</SelectItem>
                <SelectItem value="admin">{t("user_admin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </motion.div>

      {/* Users Table - Apple Style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <CardHeader className="border py-3 border-gray-100/50">
          <CardTitle className="text-xl font-semibold text-gray-900">
            {t("user_list")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                  <TableHead className="w-1/4">{t("user")}</TableHead>
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
                      className="border-b  border-gray-100/50 hover:bg-gray-50/50 transition-colors group"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.companyName ||
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
                      <TableCell>{getUserTypeBadge(user.userType)}</TableCell>
                      <TableCell>
                        {getStatusBadge(
                          user.isVerified ? "verified" : "pending",
                          user.isBanned
                        )}
                      </TableCell>
                      <TableCell>
                        {getKycStatusBadge(
                          user.isDocumentVerified || "Not Submitted"
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/users/${user._id}`} passHref>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="group-hover:opacity-100 transition-opacity"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t("view")}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - Apple Style */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100/50 bg-gray-50/50 rounded-b-2xl">
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
                      variant={
                        currentPage === totalPages ? "default" : "outline"
                      }
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
