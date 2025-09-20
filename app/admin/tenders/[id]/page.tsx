"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Building,
  Calendar,
  DollarSign,
  Users,
  FileText,
  MapPin,
  Download,
  Image as ImageIcon,
  File,
  Eye,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "../../../../lib/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { getQuestionsForTender } from "@/services/QnaService";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTenderBids } from "@/services/BidService";

// Types
interface UserRef {
  _id: string;
  email?: string;
  companyName?: string;
  name?: string;
}

interface Tender {
  _id: string;
  title: string;
  category: { _id?: string; name?: string } | string;
  status: string;
  bidCount?: number;
  deadline?: string;
  createdAt?: string;
  description?: string;
  location?: string;
  estimatedBudget?: number;
  budget?: string | number;
  postedBy?: UserRef | string;
  image?: string; // Single image/PDF field instead of documents array
  awardedTo?: UserRef | string | null;
  contactEmail?: string;
  // any other fields that exist on your schema will be shown in the JSON panel
  [key: string]: any;
}

interface Question {
  _id: string;
  question: string;
  answer?: string;
  askedBy: UserRef;
  createdAt: string;
  updatedAt?: string;
}

interface Bid {
  _id: string;
  tender: string;
  bidder: UserRef | string;
  amount: number;
  description?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface TenderDetails {
  tender: Tender;
  questions: Question[];
  bids?: Bid[];
}

export default function TenderDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const tenderId = params?.id as string;

  const [tenderDetails, setTenderDetails] = useState<TenderDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"amountAsc" | "amountDesc" | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  // Helper functions
  const resolveBudget = (tender: Tender) => {
    if (!tender) return 0;
    if (typeof tender.estimatedBudget === "number")
      return tender.estimatedBudget;
    if (tender.budget && !isNaN(Number(tender.budget)))
      return Number(tender.budget);
    if (typeof tender.budget === "string") {
      const digits = tender.budget.replace(/[^0-9.]/g, "");
      return digits ? Number(digits) : 0;
    }
    return 0;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatBudget = (budget: number) => {
    if (!budget) return t("not_specified") || "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("status_active") || "Active"}
          </Badge>
        );
      case "awarded":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {t("status_awarded") || "Awarded"}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            {t("status_completed") || "Completed"}
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {t("status_closed") || "Closed"}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {t("status_rejected") || "Rejected"}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFileType = (url?: string) => {
    if (!url) return null;
    if (url.toLowerCase().endsWith(".pdf")) return "pdf";
    if (url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/))
      return "image";
    return "unknown";
  };

  // Fetch tender, bids, questions and awardedTo user data
  useEffect(() => {
    if (!tenderId) {
      setError("Tender ID is required");
      setLoading(false);
      return;
    }

    const fetchTenderDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch a single tender first (preferred)
        let tender: Tender | null = null;
        try {
          if (adminService.getTenderById) {
            const singleResp = await adminService.getTenderById(tenderId);
            tender =
              singleResp?.data?.tender ||
              singleResp?.data ||
              singleResp?.tender ||
              null;
          } else {
            // fallback to getTenders filter
            const listResp = await adminService.getTenders({
              limit: 1,
              _id: tenderId,
            });
            tender = listResp?.data?.tenders?.[0] || null;
          }
        } catch (e) {
          console.warn(
            "Could not fetch tender via adminService.getTenderById, trying fallback",
            e
          );
        }

        if (!tender) {
          throw new Error("Tender not found");
        }

        // fetch bids
        let bids: Bid[] = [];
        try {
          const bidsResp = await getTenderBids(tenderId);
          bids =
            bidsResp?.data?.bids ||
            bidsResp?.data ||
            bidsResp?.bidsList ||
            bidsResp ||
            [];
        } catch (e) {
          console.warn("Could not fetch bids for tender", e);
        }

        // fetch questions
        let questions: Question[] = [];
        try {
          const questionsResponse = await getQuestionsForTender(tenderId);
          questions =
            questionsResponse.data ||
            questionsResponse.questions ||
            questionsResponse ||
            [];
        } catch (questionsError) {
          console.warn("Could not fetch questions for tender:", questionsError);
        }

        // fetch awardedTo full user if present (resolve ID to user object)
        let awardedUser: UserRef | null = null;
        try {
          const awardedId =
            typeof tender.awardedTo === "string"
              ? tender.awardedTo
              : tender.awardedTo?._id;
          if (awardedId) {
            if (adminService.getUser) {
              const u = await adminService.getUser(awardedId);
              awardedUser = u?.data?.user || u?.data || u || null;
            } else {
              const ru = await fetch(`/api/users/${awardedId}`);
              if (ru.ok) {
                const json = await ru.json();
                awardedUser = json?.data || json?.user || json || null;
              }
            }
          }
        } catch (e) {
          console.warn("Could not fetch awardedTo user", e);
        }

        // attach counts
        const enrichedTender = {
          ...tender,
          bidCount: bids?.length || tender.bidCount || 0,
          awardedTo: awardedUser || tender.awardedTo,
        };

        setTenderDetails({ tender: enrichedTender, questions, bids });
      } catch (err) {
        console.error("Error fetching tender details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load tender details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTenderDetails();
  }, [tenderId]);

  const sortedBids = useMemo(() => {
    if (!tenderDetails?.bids) return [];
    const list = [...tenderDetails.bids];
    if (sortBy === "amountAsc")
      list.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    else if (sortBy === "amountDesc")
      list.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    else
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    return list;
  }, [tenderDetails?.bids, sortBy]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-0">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="shadow-0">
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error Loading Tender Details
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

  if (!tenderDetails) {
    return (
      <div className="space-y-6">
        <Card className="shadow-0">
          <CardContent className="py-8 text-center">
            <div className="text-gray-400 mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Tender Not Found
            </h3>
            <p className="text-gray-600">
              The tender you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { tender, questions, bids = [] } = tenderDetails;
  const fileType = getFileType(tender.image || "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back_to_tenders") || "Back to tenders"}
          </Button>
          <div>
            <h2 className="text-2xl uppercase font-semibold">{tender.title}</h2>
            <p className="text-gray-600 font-mono text-sm">ID: {tender._id}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(tender.status)}
          {tender.postedBy && typeof tender.postedBy !== "string" && (
            <Link
              href={`/admin/users/${(tender.postedBy as UserRef)._id}`}
              passHref
            >
              <Button variant="outline">
                {t("view_profile") || "View profile"}
              </Button>
            </Link>
          )}
          <Button variant="ghost" onClick={() => setShowRaw((s) => !s)}>
            <Eye className="h-4 w-4 mr-2" /> Raw
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("budget") || "Budget"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatBudget(resolveBudget(tender))}
            </div>
            <div className="text-xs text-gray-500 mt-1">Est. Budget</div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("total_bids") || "Total bids"}
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {tender.bidCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Latest: {bids?.[0]?.amount ? formatBudget(bids[0].amount) : "-"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("submitted") || "Submitted"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">
              {formatDate(tender.createdAt)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Deadline: {formatDate(tender.deadline)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("category") || "Category"}
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">
              {typeof tender.category === "string"
                ? tender.category
                : tender.category?.name || "General"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Contact: {tender.contactEmail || "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tender Details */}
        <Card className="shadow-0">
          <CardHeader>
            <CardTitle>
              {t("tender_information") || "Tender information"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">owner</p>
                <p className="font-medium">
                  {tender.postedBy && typeof tender.postedBy !== "string"
                    ? tender.postedBy.companyName ||
                      tender.postedBy.email ||
                      tender.postedBy.name
                    : tender.postedBy || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <Badge variant="outline">
                  {typeof tender.category === "string"
                    ? tender.category
                    : tender.category?.name || "General"}
                </Badge>
              </div>
            </div>

            {tender.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{tender.location}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">
                {tender.description || "No description provided."}
              </p>
            </div>

            {tender.deadline && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Deadline</p>
                  <p className="font-medium">{formatDate(tender.deadline)}</p>
                </div>
              </div>
            )}

            {/* Award details */}
            {(tender.status === "awarded" || tender.status === "completed") && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Awarded To</p>
                {tender.awardedTo ? (
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {typeof tender.awardedTo === "string"
                          ? tender.awardedTo
                          : tender.awardedTo?.companyName ||
                            tender.awardedTo?.email ||
                            tender.awardedTo?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Awarded on:{" "}
                        {formatDate(tender.updatedAt || tender.createdAt)}
                      </p>
                    </div>
                    {typeof tender.awardedTo !== "string" &&
                      (tender.awardedTo as UserRef)?._id && (
                        <Link
                          href={`/admin/users/${
                            (tender.awardedTo as UserRef)._id
                          }`}
                        >
                          <Button variant="outline">View Contractor</Button>
                        </Link>
                      )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No awarded contractor details available
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document/Image Section */}
        <Card className="shadow-0">
          <CardHeader>
            <CardTitle>{t("attachment") || "Attachment"}</CardTitle>
          </CardHeader>
          <CardContent>
            {tender.image ? (
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                {fileType === "image" ? (
                  <>
                    <div className="w-full max-w-md aspect-video bg-white rounded-lg overflow-hidden shadow-sm mb-4">
                      <img
                        src={tender.image}
                        alt="Tender Attachment"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <a
                      href={tender.image}
                      download
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("download_image") || "Download image"}
                    </a>
                  </>
                ) : fileType === "pdf" ? (
                  <>
                    <div className="w-full max-w-md aspect-[2/3] bg-white rounded-lg overflow-hidden shadow-sm mb-4 flex items-center justify-center">
                      <div className="text-center p-6">
                        <FileText className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">
                          PDF Document
                        </p>
                        <p className="text-sm text-gray-500">
                          Click below to view
                        </p>
                      </div>
                    </div>
                    <a
                      href={tender.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <File className="h-4 w-4 mr-2" />
                      {t("view_pdf") || "View PDF"}
                    </a>
                  </>
                ) : (
                  <>
                    <div className="w-full max-w-md aspect-video bg-white rounded-lg overflow-hidden shadow-sm mb-4 flex items-center justify-center">
                      <div className="text-center p-6">
                        <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900">
                          Attachment
                        </p>
                        <p className="text-sm text-gray-500">
                          File type: Unknown
                        </p>
                      </div>
                    </div>
                    <a
                      href={tender.image}
                      download
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("download_file") || "Download file"}
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <File className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-sm">No attachment available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Questions & Answers Section */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="questions">
            {t("questions_answers") || "Questions & Answers"}
          </TabsTrigger>
          <TabsTrigger value="bids">Bids</TabsTrigger>
        </TabsList>

        {/* Questions Tab */}
        <TabsContent value="questions">
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>
                {t("questions_answers") || "Questions & Answers"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-sm">No questions asked yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((qa) => (
                    <div
                      key={qa._id}
                      className="border-l-4 border-blue-500 pl-4 py-2"
                    >
                      <div className="mb-3">
                        <p className="font-medium text-gray-900 mb-2">
                          Q: {qa.question}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <span>
                            Asked by:{" "}
                            {qa.askedBy?.companyName ||
                              qa.askedBy?.email ||
                              "Anonymous"}
                          </span>
                          <span>Date: {formatDate(qa.createdAt)}</span>
                        </div>
                      </div>
                      {qa.answer ? (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-gray-900 mb-2">
                            <strong>A:</strong> {qa.answer}
                          </p>
                          {qa.updatedAt && (
                            <p className="text-xs text-gray-500">
                              Answered on: {formatDate(qa.updatedAt)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-gray-900 italic">
                            Answer pending...
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bids Tab */}
        <TabsContent value="bids">
          <Card className="shadow-0">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>Bids</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={sortBy === "amountAsc" ? "secondary" : "outline"}
                    onClick={() => setSortBy("amountAsc")}
                  >
                    Amount ↑
                  </Button>
                  <Button
                    size="sm"
                    variant={sortBy === "amountDesc" ? "secondary" : "outline"}
                    onClick={() => setSortBy("amountDesc")}
                  >
                    Amount ↓
                  </Button>
                  <Button
                    size="sm"
                    variant={!sortBy ? "secondary" : "outline"}
                    onClick={() => setSortBy(null)}
                  >
                    Newest
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-sm">No bids placed yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bidder
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedBids.map((b) => (
                        <tr key={b._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {typeof b.bidder === "string"
                              ? b.bidder
                              : b.bidder?.companyName ||
                                b.bidder?.email ||
                                b.bidder?.name ||
                                "Unknown"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {formatBudget(b.amount || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {b.status || "submitted"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {b.paymentStatus || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatDate(b.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {typeof b.bidder !== "string" && b.bidder?._id ? (
                              <Link href={`/admin/users/${b.bidder._id}`}>
                                <Button size="sm" variant="outline">
                                  View Bidder
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  alert(JSON.stringify(b, null, 2))
                                }
                              >
                                View
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Raw JSON panel (toggle) */}
      {showRaw && (
        <Card className="shadow-0">
          <CardHeader>
            <CardTitle>Raw data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(tenderDetails, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
