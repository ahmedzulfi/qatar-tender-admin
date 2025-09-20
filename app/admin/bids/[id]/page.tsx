"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
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
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "../../../../lib/hooks/useTranslation";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBid } from "@/services/BidService";

// Types based on your schemas
interface User {
  _id: string;
  email: string;
  userType: string;
  companyName?: string;
  profile?: {
    fullName?: string;
    phone?: string;
    address?: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

interface Tender {
  _id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  contactEmail: string;
  image?: string;
  estimatedBudget: number;
  postedBy: User;
  status: "active" | "awarded" | "closed" | "rejected" | "completed";
  deadline: string;
  awardedTo?: User;
  bidCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Bid {
  _id: string;
  tender: Tender;
  bidder: User;
  amount: number;
  description: string;
  status: "submitted" | "under_review" | "rejected" | "accepted" | "completed";
  paymentStatus: "pending" | "paid" | "failed";
  paymentAmount: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BidDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const bidId = params?.id as string;

  const [bid, setBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to format date and time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };

  // Helper function to format budget for display
  const formatBudget = (budget: number) => {
    if (budget === 0) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  // Status badge component for tender
  const getTenderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("status_active")}
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
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("status_rejected")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Status badge component for bid
  const getBidStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("status_accepted")}
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Payment status badge component
  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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

  // Fetch bid details
  useEffect(() => {
    if (!bidId) {
      setError("Bid ID is required");
      setLoading(false);
      return;
    }

    const fetchBidDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getBid(bidId);
        setBid(response);
      } catch (err) {
        console.error("Error fetching bid details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load bid details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBidDetails();
  }, [bidId]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-24" />
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Details Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
              Error Loading Bid Details
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="space-y-6">
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Bid Not Found
            </h3>
            <p className="text-gray-600">
              The bid you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back_to_bids")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("bid_details")}
            </h1>
            <p className="text-gray-600 font-mono text-sm">ID: {bid._id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getBidStatusBadge(bid.status)}
          <Link href={`/admin/users/${bid.bidder._id}`} passHref>
            <Button
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
            >
              {t("view_bidder_profile")}
            </Button>
          </Link>
          <Link href={`/admin/tenders/${bid.tender._id}`} passHref>
            <Button
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
            >
              {t("view_tender")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards - Apple Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t("bid_amount")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatBudget(bid.amount)}
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
                {t("vendor")}
              </CardTitle>
              <Building className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {bid.bidder.companyName ||
                  bid.bidder.profile?.fullName ||
                  bid.bidder.email}
              </div>
              <p className="text-xs text-gray-500 mt-1 capitalize">
                {bid.bidder.userType}
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
                {t("submitted")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {formatDate(bid.createdAt)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(bid.createdAt).split(", ")[1]}
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
                {t("payment_status")}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                {getPaymentStatusBadge(bid.paymentStatus)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formatBudget(bid.paymentAmount)} paid
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bid Details - Apple Style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {t("bid_information")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t("description")}
                  </p>
                  <p className="text-gray-900">
                    {bid.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t("bid_amount")}
                  </p>
                  <p className="font-medium text-lg">
                    {formatBudget(bid.amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t("last_updated")}
                  </p>
                  <p className="font-medium">{formatDateTime(bid.updatedAt)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t("status")}</p>
                  <div className="flex items-center">
                    {getBidStatusBadge(bid.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vendor Details - Apple Style */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {t("tender_overview")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t("tender_title")}
                  </p>
                  <p className="font-medium text-lg">{bid.tender.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("estimated_budget")}
                      </p>
                      <p className="font-medium">
                        {formatBudget(bid.tender.estimatedBudget)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("deadline")}
                      </p>
                      <p className="font-medium">
                        {formatDate(bid.tender.deadline)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("posted_by")}
                      </p>
                      <p className="font-medium">
                        {bid.tender.postedBy.companyName ||
                          bid.tender.postedBy.profile?.fullName ||
                          bid.tender.postedBy.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("tender_status")}
                      </p>
                      <div className="flex items-center">
                        {getTenderStatusBadge(bid.tender.status)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("location")}
                      </p>
                      <p className="text-gray-900">{bid.tender.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("description")}
                      </p>
                      <p className="text-gray-900">
                        {bid.tender.description || "No description provided."}
                      </p>
                    </div>
                  </div>

            

                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        {t("category")}
                      </p>
                      <Badge variant="outline">
                        {bid.tender.category?.name || "General"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Tender Information */}
         
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tender Overview - Apple Style */}
    
    </motion.div>
  );
}
