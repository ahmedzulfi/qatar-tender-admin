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
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useTranslation } from "../../../../lib/hooks/useTranslation";
const mockTender = {
  id: "TND-001",
  title: "Road Construction Project - Doha North",
  organization: "Ministry of Infrastructure",
  category: "Construction",
  budget: "$2,500,000",
  status: "active",
  bidsCount: 12,
  submittedDate: "2023-12-01",
  location: "Doha North, Qatar",
  description:
    "Major road construction project covering 15km of highway infrastructure in North Doha area. The project includes complete road surfacing, drainage systems, street lighting, and traffic management systems.",
  documents: [
    "Technical Specifications.pdf",
    "Site Survey Report.pdf",
    "Environmental Impact Assessment.pdf",
    "Tender Terms & Conditions.pdf",
  ],
  contactPerson: {
    name: "Ahmed Al-Mansouri",
    title: "Project Manager",
    email: "ahmed.mansouri@infrastructure.gov.qa",
    phone: "+974 4444 5555",
  },
  qaSection: [
    {
      id: 1,
      question: "What are the specific requirements for the drainage system?",
      answer:
        "The drainage system must comply with Qatar National Standards QNS-2019 and include smart monitoring sensors for water level detection.",
      askedBy: "Qatar Construction Co.",
      askedDate: "2023-12-05",
      answeredDate: "2023-12-06",
    },
    {
      id: 2,
      question:
        "Is there flexibility in the project timeline due to weather conditions?",
      answer:
        "Yes, weather-related delays will be considered. A 30-day buffer is included in the contract for extreme weather conditions.",
      askedBy: "Al-Jazeera Engineering",
      askedDate: "2023-12-07",
      answeredDate: "2023-12-08",
    },
    {
      id: 3,
      question: "What are the payment terms and milestone structure?",
      answer:
        "Payment will be made in 5 milestones: 20% advance, 20% at foundation completion, 30% at 50% completion, 20% at 90% completion, and 10% upon final handover.",
      askedBy: "Modern Infrastructure Ltd.",
      askedDate: "2023-12-09",
      answeredDate: "2023-12-10",
    },
  ],
};
function TenderDetailsContent() {
  const { t } = useTranslation();
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
            <p className="text-gray-600">{mockTender.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(mockTender.status)}
          <Button
            variant="outline"
            onClick={() => router.push("/admin/users/ORG-001")}
          >
            {t("view_profile")}
          </Button>
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
              {mockTender.budget}
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
              {mockTender.bidsCount}
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
              {mockTender.submittedDate}
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
              {mockTender.category}
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
                <p className="font-medium">{mockTender.organization}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <Badge variant="outline">{mockTender.category}</Badge>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{mockTender.location}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">{mockTender.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="shadow-0">
          <CardHeader>
            <CardTitle>{t("documents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTender.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{doc}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("download")}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions & Answers Section */}
      <Card className="shadow-0">
        <CardHeader>
          <CardTitle>{t("questions_answers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockTender.qaSection.map((qa) => (
              <div key={qa.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="mb-3">
                  <p className="font-medium text-gray-900 mb-2">
                    Q: {qa.question}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span>Asked by: {qa.askedBy}</span>
                    <span>Date: {qa.askedDate}</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-gray-900 mb-2">
                    <strong>A:</strong> {qa.answer}
                  </p>
                  <p className="text-xs text-gray-500">
                    Answered on: {qa.answeredDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TenderDetailsPage() {
  return <TenderDetailsContent />;
}
