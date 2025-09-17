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
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "../../../../lib/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Types
interface Tender {
  _id: string;
  title: string;
  category: { name: string };
  status: string;
  bidsCount: number;
  deadline: string;
  createdAt: string;
  description?: string;
  location?: string;
  estimatedBudget?: number;
  budget?: string | number;
  postedBy?: {
    _id: string;
    email: string;
    companyName?: string;
  };
  image?: string; // Single image/PDF field instead of documents array
}

interface Question {
  _id: string;
  question: string;
  answer?: string;
  askedBy: {
    _id: string;
    email: string;
    userType: string;
    companyName?: string;
  };
  askedDate: string;
  answeredDate?: string;
}

interface TenderDetails {
  tender: Tender;
  questions: Question[];
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

  // Helper function to resolve budget from tender
  const resolveBudget = (tender: Tender) => {
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
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

  // Status badge component
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
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

  // Determine file type based on URL
  const getFileType = (url: string) => {
    if (!url) return null;
    if (url.toLowerCase().endsWith(".pdf")) return "pdf";
    if (url.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|svg)$/))
      return "image";
    return "unknown";
  };

  // Fetch tender details
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
        // Fetch tender details from admin API
        const tenderResponse = await adminService.getTenders({
          limit: 1,
          _id: tenderId, // Assuming your API supports filtering by ID
        });

        if (!tenderResponse.success || !tenderResponse.data.tenders?.length) {
          throw new Error("Tender not found");
        }

        const tender = tenderResponse.data.tenders[0];

        // For questions, you might need to implement a separate endpoint
        // For now, we'll simulate fetching questions
        // In a real implementation, you would call something like:
        // const questionsResponse = await getQuestionsForTender(tenderId);

        // Simulate questions data structure
        const questions: Question[] = [
          {
            _id: "1",
            question:
              "What are the specific requirements for the drainage system?",
            answer:
              "The drainage system must comply with Qatar National Standards QNS-2019 and include smart monitoring sensors for water level detection.",
            askedBy: {
              _id: "user1",
              email: "contact@qatarconstruction.com",
              userType: "business",
              companyName: "Qatar Construction Co.",
            },
            askedDate: "2023-12-05",
            answeredDate: "2023-12-06",
          },
          {
            _id: "2",
            question:
              "Is there flexibility in the project timeline due to weather conditions?",
            answer:
              "Yes, weather-related delays will be considered. A 30-day buffer is included in the contract for extreme weather conditions.",
            askedBy: {
              _id: "user2",
              email: "info@aljazeeraengineering.com",
              userType: "business",
              companyName: "Al-Jazeera Engineering",
            },
            askedDate: "2023-12-07",
            answeredDate: "2023-12-08",
          },
          {
            _id: "3",
            question: "What are the payment terms and milestone structure?",
            answer:
              "Payment will be made in 5 milestones: 20% advance, 20% at foundation completion, 30% at 50% completion, 20% at 90% completion, and 10% upon final handover.",
            askedBy: {
              _id: "user3",
              email: "support@moderninfrastructure.com",
              userType: "business",
              companyName: "Modern Infrastructure Ltd.",
            },
            askedDate: "2023-12-09",
            answeredDate: "2023-12-10",
          },
        ];

        setTenderDetails({
          tender,
          questions,
        });
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

        {/* Details Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-0">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
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
          <Card className="shadow-0">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8">
                <Skeleton className="h-32 w-32 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Q&A Section Skeleton */}
        <Card className="shadow-0">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="mb-3">
                    <Skeleton className="h-4 w-64 mb-2" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Skeleton className="h-4 w-56 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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

  const { tender, questions } = tenderDetails;
  const fileType = getFileType(tender.image || "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("back_to_tenders")}
          </Button>
          <div>
            <p className="text-gray-600 font-mono text-sm">ID: {tender._id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(tender.status)}
          {tender.postedBy?._id && (
            <Link href={`/admin/users/${tender.postedBy._id}`} passHref>
              <Button variant="outline">{t("view_profile")}</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("budget")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatBudget(resolveBudget(tender))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("total_bids")}
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {tender.bidsCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("submitted")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">
              {formatDate(tender.createdAt)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("category")}
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">
              {tender.category?.name || "General"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tender Details */}
        <Card className="shadow-0">
          <CardHeader>
            <CardTitle>{t("tender_information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="font-medium">
                  {tender.postedBy?.companyName ||
                    tender.postedBy?.email ||
                    "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <Badge variant="outline">
                  {tender.category?.name || "General"}
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
          </CardContent>
        </Card>

        {/* Document/Image Section */}
        <Card className="shadow-0">
          <CardHeader>
            <CardTitle>{t("attachment")}</CardTitle>
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
                      {t("download_image")}
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
                          Click below to download
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
                      {t("view_pdf")}
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
                      {t("download_file")}
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
      <Card className="shadow-0">
        <CardHeader>
          <CardTitle>{t("questions_answers")}</CardTitle>
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
                        Asked by: {qa.askedBy.companyName || qa.askedBy.email}
                      </span>
                      <span>Date: {formatDate(qa.askedDate)}</span>
                    </div>
                  </div>
                  {qa.answer ? (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-gray-900 mb-2">
                        <strong>A:</strong> {qa.answer}
                      </p>
                      {qa.answeredDate && (
                        <p className="text-xs text-gray-500">
                          Answered on: {formatDate(qa.answeredDate)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-gray-900 italic">Answer pending...</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
