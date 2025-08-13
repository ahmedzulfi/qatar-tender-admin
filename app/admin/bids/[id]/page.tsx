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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

const mockBid = {
  id: "BID-001",
  tenderTitle: "Road Construction Project - Doha North",
  tenderId: "TND-001",
  vendor: "Qatar Construction Co.",
  vendorType: "Business",
  amount: "$2,200,000",
  submittedDate: "2023-12-10",
  status: "submitted",
  description:
    "Comprehensive proposal for road construction project with 15 years of experience in similar infrastructure projects across Qatar.",
  technicalProposal:
    "Our technical approach includes advanced road surfacing techniques, sustainable drainage systems, and smart traffic management integration. We propose using high-grade asphalt with polymer modification for enhanced durability.",
  timeline: "18 months from project commencement",
  warranty: "5 years comprehensive warranty on all construction work",
  documents: [
    "Technical Proposal.pdf",
    "Financial Proposal.pdf",
    "Company Profile.pdf",
    "Previous Projects Portfolio.pdf",
    "Insurance Certificates.pdf",
  ],
  vendorDetails: {
    companyName: "Qatar Construction Co.",
    registrationNumber: "QC-2019-001234",
    establishedYear: "2008",
    employees: "250+",
    annualRevenue: "$50M",
    contactPerson: {
      name: "Mohammed Al-Thani",
      title: "Business Development Manager",
      email: "mohammed.althani@qatarconstruction.qa",
      phone: "+974 4444 1234",
    },
    address: "Building 123, Industrial Area, Doha, Qatar",
  },
  previousProjects: [
    "Lusail City Road Network - $15M (2022)",
    "West Bay Infrastructure - $8M (2021)",
    "Education City Roads - $12M (2020)",
  ],
  bidDetails: {
    proposalType: "Technical & Financial",
    methodology: "Design-Build-Operate",
    projectDuration: "18 months",
    teamSize: "45 professionals",
    equipmentIncluded: "Heavy machinery, surveying equipment, safety gear",
    qualityAssurance: "ISO 9001:2015 certified processes",
  },
  tenderOverview: {
    scope: "15km highway construction",
    location: "Doha North District",
    startDate: "March 2024",
    completionDate: "September 2025",
    keyFeatures: [
      "Smart traffic systems",
      "LED street lighting",
      "Sustainable drainage",
    ],
    clientRequirements: "Minimum 10 years experience, local presence required",
  },
};

function BidDetailsContent() {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Accepted
          </Badge>
        );
      case "submitted":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Submitted
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
            Back to Bids
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bid Details</h1>
            <p className="text-gray-600">{mockBid.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(mockBid.status)}
          <Button
            variant="outline"
            onClick={() => router.push("/admin/users/USER-001")}
          >
            View Bidder Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/tenders/TND-001")}
          >
            View Tender
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Bid Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockBid.amount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vendor
            </CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">
              {mockBid.vendor}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Submitted
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">
              {mockBid.submittedDate}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Payment Status
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              Paid (100 QAR)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-0">
          <CardHeader>
            <CardTitle>Your Bid Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bid Amount</p>
                <p className="font-medium">{mockBid.amount}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">
                {mockBid.bidDetails.equipmentIncluded} Major road construction
                project covering 15km of highway infrastructure in North Doha
                area.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader>
            <CardTitle>Tender Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Project Scope</p>
              <p className="text-gray-900">{mockBid.tenderOverview.scope}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{mockBid.tenderOverview.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Posted</p>
                <p className="font-medium">
                  {mockBid.tenderOverview.startDate}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Client Requirements</p>
              <p className="text-gray-900">
                Major road construction project covering 15km of highway
                infrastructure in North Doha area.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previous Projects */}
      <Card className="shadow-0">
        <CardHeader>
          <CardTitle>Previous Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {mockBid.previousProjects.map((project, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-sm">{project}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BidDetailsPage() {
  return <BidDetailsContent />;
}
