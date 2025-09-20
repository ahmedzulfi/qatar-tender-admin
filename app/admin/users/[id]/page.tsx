"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building,
  Calendar,
  DollarSign,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Eye,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "../../../../lib/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { profileApi } from "@/services/profileApi";
import { getUserBidsByAdmin } from "@/services/BidService";
import { getUserTenders } from "@/services/tenderService";

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
}

interface Profile {
  _id: string;
  user: string;
  phone: string;
  address: string;
  userType: "individual" | "business" | "admin";
  rating: number;
  ratingCount: number;
  fullName?: string;
  nationalId?: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
  companyName?: string;
  companyEmail?: string;
  personalEmail?: string;
  companyDesc?: string;
  contactPersonName?: string;
  commercialRegistrationNumber?: string;
  commercialRegistrationDoc?: string;
  adminName?: string;
  adminPosition?: string;
  createdAt: string;
  updatedAt: string;
}

interface Tender {
  _id: string;
  title: string;
  description: string;
  category: { _id: string; name: string };
  location: string;
  contactEmail: string;
  image?: string;
  estimatedBudget: number;
  postedBy: string;
  status: "active" | "awarded" | "closed" | "rejected" | "completed";
  deadline: string;
  createdAt: string;
  updatedAt: string;
  bidCount?: number;
}

interface Bid {
  _id: string;
  tender: string;
  bidder: string;
  amount: number;
  description: string;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "under_review"
    | "submitted"
    | "completed";
  paymentStatus: "pending" | "completed" | "failed";
  paymentAmount: number;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserWithProfile {
  user: User;
  profile: Profile;
}

export default function UserProfile() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("service-providing");
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [userWithProfile, setUserWithProfile] =
    useState<UserWithProfile | null>(null);
  const [userBids, setUserBids] = useState<Bid[]>([]);
  const [userTenders, setUserTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // Fetch user data and profile
  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch user data
        const userResponse = await adminService.getUsers({
          limit: 1,
          _id: userId,
        });

        if (!userResponse.success || !userResponse.data.users?.length) {
          throw new Error("User not found");
        }

        const userData = userResponse.data.users[0];

        // Fetch profile data
        const profileData = await profileApi.getProfileById(userId);
        console.log("Fetched profile data:", profileData);
        setUserWithProfile({
          user: userData,
          profile: profileData,
        });

        // Fetch user's bids
        try {
          const bidsResponse = await getUserBidsByAdmin(userId);

          if (bidsResponse) {
            setUserBids(bidsResponse || []);
          }
        } catch (bidsError) {
          console.warn("Could not fetch user bids:", bidsError);
          setUserBids([]);
        }

        // Fetch user's tenders (posted by this user)
        try {
          const tendersResponse = await getUserTenders(userId);

          if (tendersResponse) {
            setUserTenders(tendersResponse);
          }
        } catch (tendersError) {
          console.warn("Could not fetch user tenders:", tendersError);
          setUserTenders([]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

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
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-0">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <Card className="shadow-0">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Card className="shadow-0">
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error Loading User Profile
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

  if (!userWithProfile) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Card className="shadow-0">
          <CardContent className="py-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              User Not Found
            </h3>
            <p className="text-gray-600">
              The user profile you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { user, profile } = userWithProfile;

  // Calculate analytics for service providing tab
  const getServiceProvidingAnalytics = () => {
    const completedProjects = userBids.filter(
      (bid) => bid.status === "completed"
    ).length;
    const totalBids = userBids.length;
    const successfulBids = userBids.filter(
      (bid) => bid.status === "accepted" || bid.status === "completed"
    ).length;
    const totalValue = userBids.reduce((sum, bid) => sum + bid.amount, 0);

    return [
      {
        title: t("completed_projects"),
        value: completedProjects,
        icon: FileText,
      },
      {
        title: t("total_bids"),
        value: totalBids,
        icon: Building,
      },
      {
        title: t("success_rate"),
        value:
          totalBids > 0
            ? `${Math.round((successfulBids / totalBids) * 100)}%`
            : "0%",
        icon: DollarSign,
        color: "text-green-600",
      },
      {
        title: t("total_value"),
        value: formatBudget(totalValue),
        icon: DollarSign,
      },
    ];
  };

  // Calculate analytics for project posting tab
  const getProjectPostingAnalytics = () => {
    const totalTenders = userTenders.length;
    const activeTenders = userTenders.filter(
      (tender) => tender.status === "active"
    ).length;
    const completedTenders = userTenders.filter(
      (tender) => tender.status === "completed"
    ).length;
    const totalValue = userTenders.reduce(
      (sum, tender) => sum + (tender.estimatedBudget || 0),
      0
    );

    return [
      {
        title: t("total_tenders"),
        value: totalTenders,
        icon: FileText,
      },
      {
        title: t("active_tenders"),
        value: activeTenders,
        icon: Building,
      },
      {
        title: t("completed_tenders"),
        value: completedTenders,
        icon: DollarSign,
        color: "text-green-600",
      },
      {
        title: t("total_value"),
        value: formatBudget(totalValue),
        icon: DollarSign,
      },
    ];
  };

  const getAnalyticsCards = () => {
    if (activeTab === "service-providing") {
      return getServiceProvidingAnalytics();
    } else {
      return getProjectPostingAnalytics();
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* User Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back_to_users")}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.companyName ||
                profile.fullName ||
                profile.adminName ||
                user.email}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">
                ID: {user._id} • {t(`user_${user.userType}`)}
              </p>
              <div className="flex items-center space-x-1">
                <div className="flex">{renderStars(profile.rating || 0)}</div>
                <span className="text-sm font-medium">
                  {profile.rating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-sm text-gray-500">
                  ({profile.ratingCount || 0} {t("reviews")})
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {getStatusBadge(
            user.isVerified ? "verified" : "pending",
            user.isBanned
          )}
          {getKycStatusBadge(user.isDocumentVerified || "Not Submitted")}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {getAnalyticsCards().map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="shadow-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    card.color || "text-gray-900"
                  }`}
                >
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="service-providing"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="service-providing">
            {t("service_providing")}
          </TabsTrigger>
          <TabsTrigger value="project-posting">
            {t("project_posting")}
          </TabsTrigger>
          <TabsTrigger value="profile-documents">
            {t("profile_documents")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service-providing" className="space-y-6">
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>{t("bids_made")}</CardTitle>
            </CardHeader>
            <CardContent>
              {userBids.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium">No bids found</p>
                  <p className="text-sm">
                    This user hasn't submitted any bids yet
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("project_title")}</TableHead>
                      <TableHead>{t("bid_amount")}</TableHead>
                      <TableHead>{t("date_submitted")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("payment_status")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userBids.map((bid) => (
                      <TableRow key={bid._id}>
                        <TableCell className="font-medium">
                          {/* We would need to fetch tender details to show title */}
                          Bid #{bid._id.substring(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatBudget(bid.amount)}
                        </TableCell>
                        <TableCell>{formatDate(bid.createdAt)}</TableCell>
                        <TableCell>{getBidStatusBadge(bid.status)}</TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(bid.paymentStatus)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/bids/${bid._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              {t("view_details")}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project-posting" className="space-y-6">
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>{t("posted_tenders")}</CardTitle>
            </CardHeader>
            <CardContent>
              {userTenders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-medium">No tenders found</p>
                  <p className="text-sm">
                    This user hasn't posted any tenders yet
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("project_title")}</TableHead>
                      <TableHead>{t("date_posted")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("bids_received")}</TableHead>
                      <TableHead>{t("budget")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTenders.map((tender) => (
                      <TableRow key={tender._id}>
                        <TableCell className="font-medium">
                          {tender.title}
                        </TableCell>
                        <TableCell>{formatDate(tender.createdAt)}</TableCell>
                        <TableCell>{getStatusBadge(tender.status)}</TableCell>
                        <TableCell>{tender.bidCount || 0}</TableCell>
                        <TableCell className="font-medium">
                          {formatBudget(tender.estimatedBudget)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/tenders/${tender._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              {t("view_details")}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile-documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card className="shadow-0">
              <CardHeader>
                <CardTitle>{t("user_profile")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("basic_information")}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {user.userType === "business"
                            ? t("company_name")
                            : user.userType === "individual"
                            ? t("full_name")
                            : t("admin_name")}
                        </p>
                        <p className="font-medium">
                          {profile.companyName ||
                            profile.fullName ||
                            profile.adminName ||
                            "N/A"}
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
                          {profile.companyEmail ||
                            profile.personalEmail ||
                            user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {t("phone")}
                        </p>
                        <p className="font-medium">{profile.phone || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {t("address")}
                        </p>
                        <p className="text-gray-900">
                          {profile.address || "Not provided"}
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
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Type Specific Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {user.userType === "business"
                      ? t("business_details")
                      : user.userType === "individual"
                      ? t("individual_details")
                      : t("admin_details")}
                  </h3>
                  <div className="space-y-4">
                    {user.userType === "business" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {t("company_name")}
                            </p>
                            <p className="font-medium">
                              {profile.companyName || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {t("contact_person")}
                            </p>
                            <p className="font-medium">
                              {profile.contactPersonName || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {t("company_email")}
                            </p>
                            <p className="font-medium">
                              {profile.companyEmail || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {t("company_description")}
                            </p>
                            <p className="text-gray-900">
                              {profile.companyDesc || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {user.userType === "individual" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {t("full_name")}
                            </p>
                            <p className="font-medium">
                              {profile.fullName ||
                                profile.contactPersonName ||
                                "N/A"}
                            </p>
                          </div>
                        </div>

                   
                      </>
                    )}

                    {user.userType === "admin" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {t("admin_name")}
                            </p>
                            <p className="font-medium">
                              {profile.adminName || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {t("position")}
                            </p>
                            <p className="font-medium">
                              {profile.adminPosition || "N/A"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          {t("account_status")}
                        </p>
                        <div className="flex items-center">
                          {getStatusBadge(
                            user.isVerified ? "verified" : "pending",
                            user.isBanned
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
                            user.isDocumentVerified || "Not Submitted"
                          )}
                        </div>
                      </div>
                    </div>

                    {user.isBanned && user.banReason && (
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            {t("ban_reason")}
                          </p>
                          <p className="text-red-600 font-medium">
                            {user.banReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card className="shadow-0">
              <CardHeader>
                <CardTitle>{t("kyc_documents")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("document_name")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.userType === "business" && (
                      <>
                        <TableRow>
                          <TableCell className="font-medium">
                            {t("commercial_registration")}
                          </TableCell>
                          <TableCell>
                            {profile.commercialRegistrationNumber ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                {t("document_provided")}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                {t("document_not_provided")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {profile.commercialRegistrationDoc ? (
                              <Button variant="outline" size="sm">
                                {t("view")}
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                {t("not_available")}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            {t("commercial_registration_document")}
                          </TableCell>
                          <TableCell>
                            {profile.commercialRegistrationDoc ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                {t("document_uploaded")}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                {t("document_not_uploaded")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {profile.commercialRegistrationDoc ? (
                              <Button variant="outline" size="sm">
                                {t("view")}
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                {t("not_available")}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      </>
                    )}

                    {user.userType === "individual" && (
                      <>
                        <TableRow>
                          <TableCell className="font-medium">
                            {t("national_id")}
                          </TableCell>
                          <TableCell>
                            {profile.nationalId ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                {t("document_provided")}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                {t("document_not_provided")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {profile.nationalId ? (
                              <Button variant="outline" size="sm">
                                {t("view")}
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                {t("not_available")}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            {t("national_id_front")}
                          </TableCell>
                          <TableCell>
                            {profile.nationalIdFront ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                {t("document_uploaded")}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                {t("document_not_uploaded")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {profile.nationalIdFront ? (
                              <Button variant="outline" size="sm">
                                {t("view")}
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                {t("not_available")}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">
                            {t("national_id_back")}
                          </TableCell>
                          <TableCell>
                            {profile.nationalIdBack ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                {t("document_uploaded")}
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                {t("document_not_uploaded")}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {profile.nationalIdBack ? (
                              <Button variant="outline" size="sm">
                                {t("view")}
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                {t("not_available")}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      </>
                    )}

                    {user.userType === "admin" && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-gray-500"
                        >
                          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                          <p>{t("no_documents_required_for_admin")}</p>
                        </TableCell>
                      </TableRow>
                    )}

                    {user.userType !== "business" &&
                      user.userType !== "individual" &&
                      user.userType !== "admin" && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-8 text-gray-500"
                          >
                            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                            <p>{t("no_documents_available")}</p>
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
