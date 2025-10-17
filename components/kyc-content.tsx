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
  RefreshCw,
  Download,
} from "lucide-react";
import { profileApi } from "@/services/profileApi";

import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import {
  getAllVerifications,
  getPendingVerifications,
  verifyUserDocuments,
} from "@/services/verificationService";

// Types
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
}

interface KycRequest extends User {
  documentRejectionReason: "";
  documents: any;
  // Additional fields specific to KYC requests if needed
}

export default function KycVerificationPage() {
  const { t } = useTranslation();

  const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch KYC requests
  useEffect(() => {
    const fetchKycRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAllVerifications();
        console.log("KYC Requests fetched:", response);

        if (Array.isArray(response)) {
          setKycRequests(response);
          console.log(response);
          setFilteredRequests(response);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching KYC requests:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load KYC requests"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchKycRequests();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...kycRequests];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (request) =>
          request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.profile?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.profile?.companyName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (request) => request.isDocumentVerified === statusFilter
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((request) => request.userType === typeFilter);
    }

    setFilteredRequests(result);
  }, [searchTerm, statusFilter, typeFilter, kycRequests]);

  // Fetch user profile when a request is selected

  const fetchUserProfile = async (user: KycRequest) => {
    setProfileLoading(true);
    try {
      const profileResponse = await profileApi.getProfileById(user._id);
      if (profileResponse) {
        // Update the selected request with fresh profile data
        setSelectedRequest((prev) =>
          prev?._id === user._id ? { ...prev, profile: profileResponse } : prev
        );
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle document verification
  const handleVerifyDocument = async (
    userId: string,
    status: "verified" | "rejected"
  ) => {
    setActionLoading(true);
    try {
      const response = await verifyUserDocuments(
        userId,
        status,
        status === "rejected" ? rejectionReason : undefined
      );

      console.log("Verification response:", response);

      // Update local state
      setKycRequests((prev) =>
        prev.map((req) =>
          req._id === userId ? { ...req, isDocumentVerified: status } : req
        )
      );

      setFilteredRequests((prev) =>
        prev.map((req) =>
          req._id === userId ? { ...req, isDocumentVerified: status } : req
        )
      );

      // Close dialogs
      setSelectedRequest(null);
      setRejectionReason("");
    } catch (err) {
      console.error("Error verifying document:", err);
      setError(
        err instanceof Error ? err.message : "Failed to verify document"
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
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
      case "Not Submitted":
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t("kyc_not_submitted")}
          </Badge>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
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
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    {[...Array(5)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-20" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i} className="hover:bg-gray-50/50">
                      {[...Array(5)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              {t("error_loading_kyc_requests")}
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
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
      className="space-y-6  py-0"
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
                {t("total_requests")}
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {kycRequests.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("all_kyc_submissions")}
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
                {t("pending_review")}
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {
                  kycRequests.filter((r) => r.isDocumentVerified === "pending")
                    .length
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("awaiting_verification")}
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
                {t("verified_requests")}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {
                  kycRequests.filter((r) => r.isDocumentVerified === "verified")
                    .length
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("successfully_verified")}
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
                {t("rejected_requests")}
              </CardTitle>
              <XCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {
                  kycRequests.filter((r) => r.isDocumentVerified === "rejected")
                    .length
                }
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t("verification_failed")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters - Apple Style */}
      <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            {t("filter_requests")}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                <SelectItem value="pending">{t("status_pending")}</SelectItem>
                <SelectItem value="verified">{t("status_verified")}</SelectItem>
                <SelectItem value="rejected">{t("status_rejected")}</SelectItem>
                <SelectItem value="Not Submitted">
                  {t("status_not_submitted")}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_types")}</SelectItem>
                <SelectItem value="individual">
                  {t("user_individual")}
                </SelectItem>
                <SelectItem value="business">{t("user_business")}</SelectItem>
                <SelectItem value="admin">{t("user_admin")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KYC Requests Table - Apple Style */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("kyc_status")}</TableHead>
                  <TableHead>{t("submitted")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="text-gray-500">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">
                          {t("no_kyc_requests_found")}
                        </p>
                        <p className="text-sm">
                          {t("adjust_filters_or_search")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow
                      key={request._id}
                      className="border-b border-gray-100/50 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.profile?.companyName ||
                                request.profile?.fullName ||
                                request.email}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {request.userType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {request.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {request.userType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          request.isDocumentVerified || "Not Submitted"
                        )}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(request.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className=" group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedRequest(request);
                                fetchUserProfile(request); // ← pass request directly
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t("view_details")}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                            {selectedRequest && (
                              <div className="space-y-6">
                                {/* User Information - Simplified */}
                                <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                  <CardHeader>
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                      {t("user_information")}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-6">
                                    {profileLoading ? (
                                      <div className="space-y-4">
                                        {[...Array(5)].map((_, i) => (
                                          <div
                                            key={i}
                                            className="flex items-center space-x-3"
                                          >
                                            <Skeleton className="h-5 w-5 rounded-full" />
                                            <div className="flex-1">
                                              <Skeleton className="h-4 w-24 mb-2" />
                                              <Skeleton className="h-4 w-32" />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center space-x-3">
                                          <User className="h-5 w-5 text-gray-400" />
                                          <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                              {t("name")}
                                            </p>
                                            <p className="font-medium">
                                              {selectedRequest.profile
                                                ?.fullName ||
                                                selectedRequest.profile
                                                  ?.companyName ||
                                                selectedRequest.email}
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
                                              {selectedRequest.email}
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
                                              {selectedRequest.profile?.phone ||
                                                "N/A"}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                          <Building className="h-5 w-5 text-gray-400" />
                                          <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                              {selectedRequest.userType ===
                                              "business"
                                                ? t("company_name")
                                                : t("user_type")}
                                            </p>
                                            <p className="font-medium capitalize">
                                              {selectedRequest.userType}
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
                                              {selectedRequest.profile
                                                ?.address || "Not provided"}
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
                                              {formatDate(
                                                selectedRequest.createdAt
                                              )}
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
                                                selectedRequest.isVerified
                                                  ? "verified"
                                                  : "pending"
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
                                              {getStatusBadge(
                                                selectedRequest.isDocumentVerified ||
                                                  "Not Submitted"
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          <FileText className="h-5 w-5 text-gray-400" />
                                          <div>
                                            <p className="text-sm text-gray-600 mb-1">
                                              {t("rejection_reason")}
                                            </p>
                                            <div className="flex items-center text-red-500">
                                              {
                                                selectedRequest.documentRejectionReason
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        {selectedRequest.isBanned &&
                                          selectedRequest.banReason && (
                                            <div className="flex items-start space-x-3">
                                              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                              <div>
                                                <p className="text-sm text-gray-600 mb-1">
                                                  {t("ban_reason")}
                                                </p>
                                                <p className="text-red-600 font-medium">
                                                  {selectedRequest.banReason}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Documents Section - Simplified */}
                                <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                  <CardHeader>
                                    <CardTitle className="text-xl font-semibold text-gray-900">
                                      {t("documents")}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {profileLoading ? (
                                      <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                          <div
                                            key={i}
                                            className="flex items-center space-x-3"
                                          >
                                            <Skeleton className="h-5 w-5 rounded-full" />
                                            <div className="flex-1">
                                              <Skeleton className="h-4 w-24 mb-2" />
                                              <Skeleton className="h-4 w-32" />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="space-y-6">
                                        {selectedRequest.userType ===
                                          "business" && (
                                          <>
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                              <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-medium text-gray-900">
                                                  {t(
                                                    "commercial_registration_number"
                                                  )}
                                                </h3>
                                                {selectedRequest.documents
                                                  ?.commercialRegistrationNumber ? (
                                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    {t("document_provided")}
                                                  </Badge>
                                                ) : (
                                                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                                    {t("document_not_provided")}
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-sm text-gray-600 mb-3">
                                                {selectedRequest.documents
                                                  ?.commercialRegistrationNumber ||
                                                  "N/A"}
                                              </p>
                                              <div className="flex items-center space-x-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                                  disabled={
                                                    !selectedRequest.documents
                                                      ?.commercialRegistrationNumber
                                                  }
                                                  onClick={() =>
                                                    selectedRequest.documents
                                                      ?.commercialRegistrationNumber &&
                                                    alert(
                                                      `Commercial Registration Number: ${selectedRequest.documents.commercialRegistrationNumber}`
                                                    )
                                                  }
                                                >
                                                  <Eye className="h-4 w-4 mr-2" />
                                                  {t("view")}
                                                </Button>
                                              </div>
                                            </div>

                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                              <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-medium text-gray-900">
                                                  {t(
                                                    "commercial_registration_doc"
                                                  )}
                                                </h3>
                                                {selectedRequest.documents
                                                  ?.commercialRegistrationDoc ? (
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
                                                  {selectedRequest.documents
                                                    ?.commercialRegistrationDoc ? (
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
                                                    disabled={
                                                      !selectedRequest.documents
                                                        ?.commercialRegistrationDoc
                                                    }
                                                    onClick={() =>
                                                      selectedRequest.documents
                                                        ?.commercialRegistrationDoc &&
                                                      window.open(
                                                        selectedRequest
                                                          .documents
                                                          .commercialRegistrationDoc,
                                                        "_blank"
                                                      )
                                                    }
                                                  >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {t("view")}
                                                  </Button>
                                                  <a
                                                    href={
                                                      selectedRequest.documents
                                                        ?.commercialRegistrationDoc ||
                                                      "#"
                                                    }
                                                    download
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    onClick={(e) => {
                                                      if (
                                                        !selectedRequest
                                                          .documents
                                                          ?.commercialRegistrationDoc
                                                      ) {
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

                                        {selectedRequest.userType ===
                                          "individual" && (
                                          <>
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                              <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-medium text-gray-900">
                                                  {t("national_id")}
                                                </h3>
                                                {selectedRequest.documents
                                                  ?.nationalId ? (
                                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    {t("document_provided")}
                                                  </Badge>
                                                ) : (
                                                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                                    {t("document_not_provided")}
                                                  </Badge>
                                                )}
                                              </div>
                                              <p className="text-sm text-gray-600 mb-3">
                                                {selectedRequest.documents
                                                  ?.nationalId || "N/A"}
                                              </p>
                                              <div className="flex items-center space-x-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                                  disabled={
                                                    !selectedRequest.documents
                                                      ?.nationalId
                                                  }
                                                  onClick={() =>
                                                    selectedRequest.documents
                                                      ?.nationalId &&
                                                    alert(
                                                      `National ID: ${selectedRequest.documents.nationalId}`
                                                    )
                                                  }
                                                >
                                                  <Eye className="h-4 w-4 mr-2" />
                                                  {t("view")}
                                                </Button>
                                              </div>
                                            </div>

                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                              <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-medium text-gray-900">
                                                  {t("national_id_front")}
                                                </h3>
                                                {selectedRequest.documents
                                                  ?.nationalIdFront ? (
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
                                                  {selectedRequest.documents
                                                    ?.nationalIdFront ? (
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
                                                    disabled={
                                                      !selectedRequest.documents
                                                        ?.nationalIdFront
                                                    }
                                                    onClick={() =>
                                                      selectedRequest.documents
                                                        ?.nationalIdFront &&
                                                      window.open(
                                                        selectedRequest
                                                          .documents
                                                          .nationalIdFront,
                                                        "_blank"
                                                      )
                                                    }
                                                  >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {t("view")}
                                                  </Button>
                                                  <a
                                                    href={
                                                      selectedRequest.documents
                                                        ?.nationalIdFront || "#"
                                                    }
                                                    download
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    onClick={(e) => {
                                                      if (
                                                        !selectedRequest
                                                          .documents
                                                          ?.nationalIdFront
                                                      ) {
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
                                                {selectedRequest.documents
                                                  ?.nationalIdBack ? (
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
                                                  {selectedRequest.documents
                                                    ?.nationalIdBack ? (
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
                                                    disabled={
                                                      !selectedRequest.documents
                                                        ?.nationalIdBack
                                                    }
                                                    onClick={() =>
                                                      selectedRequest.documents
                                                        ?.nationalIdBack &&
                                                      window.open(
                                                        selectedRequest
                                                          .documents
                                                          .nationalIdBack,
                                                        "_blank"
                                                      )
                                                    }
                                                  >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    {t("view")}
                                                  </Button>
                                                  <a
                                                    href={
                                                      selectedRequest.documents
                                                        ?.nationalIdBack || "#"
                                                    }
                                                    download
                                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    onClick={(e) => {
                                                      if (
                                                        !selectedRequest
                                                          .documents
                                                          ?.nationalIdBack
                                                      ) {
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

                                        {selectedRequest.userType ===
                                          "admin" && (
                                          <div className="text-center py-8 text-gray-500">
                                            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                                            <p className="text-lg font-medium">
                                              {t("no_documents_required")}
                                            </p>
                                            <p className="text-sm">
                                              {t(
                                                "admin_accounts_do_not_require_documents"
                                              )}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Verification Actions - Simplified */}
                                {selectedRequest.isDocumentVerified ===
                                  "pending" && (
                                  <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                    <CardHeader>
                                      <CardTitle className="text-xl font-semibold text-gray-900">
                                        {t("verification_actions")}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex flex-col sm:flex-row gap-4">
                                        <Button
                                          className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors"
                                          onClick={() =>
                                            handleVerifyDocument(
                                              selectedRequest._id,
                                              "verified"
                                            )
                                          }
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
                                                {t(
                                                  "please_provide_reason_for_rejection"
                                                )}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <div className="py-4">
                                              <label
                                                htmlFor="rejection-reason"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                              >
                                                {t("rejection_reason")}
                                              </label>
                                              <textarea
                                                id="rejection-reason"
                                                placeholder={t(
                                                  "enter_reason_for_rejection"
                                                )}
                                                value={rejectionReason}
                                                onChange={(e) =>
                                                  setRejectionReason(
                                                    e.target.value
                                                  )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                rows={4}
                                              />
                                            </div>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel
                                                onClick={() =>
                                                  setRejectionReason("")
                                                }
                                                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                              >
                                                {t("cancel")}
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                className="bg-red-600 hover:bg-red-700 text-white transition-colors"
                                                onClick={() =>
                                                  handleVerifyDocument(
                                                    selectedRequest._id,
                                                    "rejected"
                                                  )
                                                }
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
                                    </CardContent>
                                  </Card>
                                )}

                                {/* User Profile Link */}
                                <div className="flex justify-end">
                                  <Link
                                    href={`/admin/users/${selectedRequest._id}`}
                                    passHref
                                  >
                                    <Button
                                      variant="outline"
                                      className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      {t("view_full_user_profile")}
                                    </Button>
                                  </Link>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
