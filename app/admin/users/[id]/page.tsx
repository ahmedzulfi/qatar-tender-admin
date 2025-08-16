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
import { useState } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useTranslation } from '../../../../lib/hooks/useTranslation';
export default function UserProfile() {
    const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("service-providing");
  const router = useRouter();

  const mockUser = {
    id: 234,
    name: "Al-Rashid Construction LLC",
    email: "info@alrashid-construction.qa",
    phone: "+974 4444 5555",
    type: "Business",
    status: "Active",
    joinDate: "2023-01-15",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 4.8,
    reviewCount: 156,
    description:
      "Leading construction company in Qatar specializing in infrastructure development, commercial buildings, and residential projects. With over 15 years of experience, we deliver high-quality construction solutions.",
    serviceProvidingStats: {
      completedProjects: 24,
      totalBids: 28,
      successfulBids: 8,
      totalValue: "$12M",
    },
    projectPostingStats: {
      totalTenders: 15,
      activeTenders: 3,
      completedTenders: 12,
      totalValue: "$45M",
    },
    businessDetails: {
      companyName: "Al-Rashid Construction LLC",
      contactPersonName: "Mohammed Al-Thani",
      personalEmail: "mohammed.althani@personal.qa",
      companyEmail: "info@alrashid-construction.qa",
      companyPhone: "+974 4444 5555",
      companyDescription:
        "Leading construction company in Qatar specializing in infrastructure development, commercial buildings, and residential projects. With over 15 years of experience, we deliver high-quality construction solutions.",
    },
    contactPerson: {
      name: "Mohammed Al-Thani",
      title: "Business Development Manager",
      email: "mohammed.althani@alrashid-construction.qa",
      phone: "+974 4444 5678",
    },
    documents: [
      {
        name: "Commercial Registration",
        status: "verified",
        uploadDate: "2023-01-15",
      },
    ],
    completedProjects: [
      {
        id: 1,
        title: "Al Wakra Stadium Infrastructure",
        client: "Qatar Sports Authority",
        completedDate: "2023-11-15",
        value: "$2.5M",
        rating: 5,
        review:
          "Exceptional work quality and timely delivery. The team exceeded our expectations in every aspect of the project.",
        reviewer: "Ahmed Al-Mansouri",
        reviewDate: "2023-11-20",
      },
      {
        id: 2,
        title: "Doha Metro Station Construction",
        client: "Qatar Rail Company",
        completedDate: "2023-09-30",
        value: "$1.8M",
        rating: 4,
        review:
          "Professional execution with minor delays due to weather conditions. Overall satisfied with the outcome.",
        reviewer: "Sarah Johnson",
        reviewDate: "2023-10-05",
      },
      {
        id: 3,
        title: "Residential Complex - West Bay",
        client: "Private Developer",
        completedDate: "2023-08-22",
        value: "$3.2M",
        rating: 5,
        review:
          "Outstanding construction quality and attention to detail. Highly recommend for future projects.",
        reviewer: "Mohammed Al-Thani",
        reviewDate: "2023-08-25",
      },
    ],
    postedTenders: [
      {
        id: 1,
        title: "Office Building Renovation - Pearl Qatar",
        datePosted: "2024-01-15",
        status: "Active",
        bidsReceived: 12,
        budget: "$850K",
        deadline: "2024-02-15",
      },
      {
        id: 2,
        title: "Warehouse Construction - Industrial Area",
        datePosted: "2024-01-10",
        status: "Active",
        bidsReceived: 8,
        budget: "$1.2M",
        deadline: "2024-02-10",
      },
      {
        id: 3,
        title: "Shopping Mall Interior Design",
        datePosted: "2023-12-20",
        status: "Completed",
        bidsReceived: 15,
        budget: "$2.1M",
        deadline: "2024-01-20",
      },
      {
        id: 4,
        title: "Hospital Equipment Installation",
        datePosted: "2023-12-15",
        status: "Completed",
        bidsReceived: 6,
        budget: "$950K",
        deadline: "2024-01-15",
      },
      {
        id: 5,
        title: "School Building Maintenance",
        datePosted: "2023-11-30",
        status: "Completed",
        bidsReceived: 9,
        budget: "$650K",
        deadline: "2023-12-30",
      },
    ],
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Suspended
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getAnalyticsCards = () => {
    if (activeTab === "service-providing") {
      return [
        {
          title: "Completed Projects",
          value: mockUser.serviceProvidingStats.completedProjects,
          icon: FileText,
        },
        {
          title: "Total Bids",
          value: mockUser.serviceProvidingStats.totalBids,
          icon: Building,
        },
        {
          title: "Success Rate",
          value: `${Math.round(
            (mockUser.serviceProvidingStats.successfulBids /
              mockUser.serviceProvidingStats.totalBids) *
              100
          )}%`,
          icon: DollarSign,
          color: "text-green-600",
        },
        {
          title: "Total Value",
          value: mockUser.serviceProvidingStats.totalValue,
          icon: DollarSign,
        },
      ];
    } else {
      return [
        {
          title: "Total Tenders",
          value: mockUser.projectPostingStats.totalTenders,
          icon: FileText,
        },
        {
          title: "Active Tenders",
          value: mockUser.projectPostingStats.activeTenders,
          icon: Building,
        },
        {
          title: "Completed Tenders",
          value: mockUser.projectPostingStats.completedTenders,
          icon: DollarSign,
          color: "text-green-600",
        },
        {
          title: "Total Value",
          value: mockUser.projectPostingStats.totalValue,
          icon: DollarSign,
        },
      ];
    }
  };

  const getTenderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* User Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back_to_users')}</Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mockUser.name}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">
                {mockUser.id} • {mockUser.type}
              </p>
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {renderStars(Math.floor(mockUser.rating))}
                </div>
                <span className="text-sm font-medium">{mockUser.rating}</span>
                <span className="text-sm text-gray-500">
                  ({mockUser.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {getStatusBadge(mockUser.status)}
          {getKycBadge(mockUser.documents[0].status)}
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
          <TabsTrigger value="service-providing">{t('service_providing')}</TabsTrigger>
          <TabsTrigger value="project-posting">{t('project_posting')}</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="service-providing" className="space-y-6">
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>{t('bids_made')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('project_title')}</TableHead>
                    <TableHead>{t('bid_amount')}</TableHead>
                    <TableHead>{t('date_submitted')}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      id: 1,
                      title: "E-commerce Website Development",
                      bidAmount: "45,000 QAR",
                      dateSubmitted: "2024-01-15",
                      status: "Won",
                      client: "Tech Solutions Ltd",
                    },
                    {
                      id: 2,
                      title: "Mobile App UI/UX Design",
                      bidAmount: "28,000 QAR",
                      dateSubmitted: "2024-01-10",
                      status: "Under Review",
                      client: "StartupCorp",
                    },
                    {
                      id: 3,
                      title: "Database Migration Project",
                      bidAmount: "35,000 QAR",
                      dateSubmitted: "2024-01-08",
                      status: "Rejected",
                      client: "Enterprise Inc",
                    },
                    {
                      id: 4,
                      title: "Cloud Infrastructure Setup",
                      bidAmount: "52,000 QAR",
                      dateSubmitted: "2024-01-05",
                      status: "Won",
                      client: "CloudTech Solutions",
                    },
                  ].map((bid) => (
                    <TableRow key={bid.id}>
                      <TableCell className="font-medium">{bid.title}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {bid.bidAmount}
                      </TableCell>
                      <TableCell>{bid.dateSubmitted}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bid.status === "Won"
                              ? "default"
                              : bid.status === "Under Review"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {bid.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{bid.client}</TableCell>
                      <TableCell>
                        <Link href={"/admin/bids/BID-006"}>
                          <Button variant="outline" size="sm">
                            {t('view_details')}</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>{t('completed_projects_reviews')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockUser.completedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.title}
                        </h3>
                        <p className="text-gray-600">
                          Client: {project.client}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Completed: {project.completedDate}</span>
                          <span>Value: {project.value}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {renderStars(project.rating)}
                          <span className="text-sm font-medium ml-1">
                            {project.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <p className="text-gray-700 italic">
                            "{project.review}"
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-900">
                              - {project.reviewer}
                            </span>
                            <span className="text-sm text-gray-500">
                              {project.reviewDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project-posting" className="space-y-6">
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>{t('posted_tenders')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('project_title')}</TableHead>
                    <TableHead>{t('date_posted')}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>{t('bids_received')}</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUser.postedTenders.map((tender) => (
                    <TableRow key={tender.id}>
                      <TableCell className="font-medium">
                        {tender.title}
                      </TableCell>
                      <TableCell>{tender.datePosted}</TableCell>
                      <TableCell>
                        {getTenderStatusBadge(tender.status)}
                      </TableCell>
                      <TableCell>{tender.bidsReceived}</TableCell>
                      <TableCell className="font-medium">
                        {tender.budget}
                      </TableCell>
                      <TableCell>
                        <Link href={"/admin/tenders/TND-001"}>
                          <Button variant="outline" size="sm">
                            {t('view_details')}</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>{t('client_reviews_ratings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    id: 1,
                    project: "Corporate Website Redesign",
                    client: "Business Corp Ltd",
                    rating: 5,
                    review:
                      "Excellent project management and delivery. The team was professional and delivered exactly what we needed on time and within budget.",
                    reviewer: "Sarah Johnson, Project Manager",
                    reviewDate: "2024-01-20",
                    completedDate: "2024-01-18",
                    value: "75,000 QAR",
                  },
                  {
                    id: 2,
                    project: "Mobile App Development",
                    client: "TechStart Solutions",
                    rating: 4,
                    review:
                      "Great technical expertise and communication throughout the project. Minor delays but overall satisfied with the quality of work delivered.",
                    reviewer: "Ahmed Al-Rashid, CTO",
                    reviewDate: "2024-01-15",
                    completedDate: "2024-01-12",
                    value: "95,000 QAR",
                  },
                  {
                    id: 3,
                    project: "E-commerce Platform",
                    client: "Retail Innovations",
                    rating: 5,
                    review:
                      "Outstanding work! The platform exceeded our expectations and has significantly improved our online sales. Highly recommended.",
                    reviewer: "Maria Rodriguez, CEO",
                    reviewDate: "2024-01-10",
                    completedDate: "2024-01-08",
                    value: "120,000 QAR",
                  },
                ].map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-6 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.project}
                        </h3>
                        <p className="text-gray-600">Client: {review.client}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Completed: {review.completedDate}</span>
                          <span>Value: {review.value}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          {renderStars(review.rating)}
                          <span className="text-sm font-medium ml-1">
                            {review.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <p className="text-gray-700 italic">
                            "{review.review}"
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-900">
                              - {review.reviewer}
                            </span>
                            <span className="text-sm text-gray-500">
                              {review.reviewDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="shadow-0">
              <CardHeader>
                <CardTitle>{t('basic_information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{t('company_name')}</p>
                    <p className="font-medium">
                      {mockUser.businessDetails.companyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-blue-600">
                      {mockUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{mockUser.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">
                      {mockUser.businessDetails.companyPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">{t('join_date')}</p>
                    <p className="font-medium">{mockUser.joinDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card className="shadow-0">
              <CardHeader>
                <CardTitle>{t('business_details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('company_name')}</p>
                    <p className="font-medium">
                      {mockUser.businessDetails.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('contact_person_name')}</p>
                    <p className="font-medium">
                      {mockUser.businessDetails.contactPersonName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('personal_email')}</p>
                    <p className="font-medium">
                      {mockUser.businessDetails.personalEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('company_email')}</p>
                    <p className="font-medium">
                      {mockUser.businessDetails.companyEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('company_phone')}</p>
                    <p className="font-medium">
                      {mockUser.businessDetails.companyPhone}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">{t('company_description')}</p>
                  <p className="font-medium">
                    {mockUser.businessDetails.companyDescription}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Person */}
        </TabsContent>

        <TabsContent value="documents">
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>{t('kyc_documents')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('document_name')}</TableHead>
                    <TableHead>{t('upload_date')}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUser.documents.map((doc, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell>{getKycBadge(doc.status)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
