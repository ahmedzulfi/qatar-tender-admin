"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "../lib/hooks/useTranslation";
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
  Check,
  X,
  FileText,
  Download,
  Building,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const mockKycRequests = [
  {
    id: "KYC-001",
    userId: "BUS-004",
    userName: "Suspicious Vendor LLC",
    userType: "Business",
    email: "contact@suspicious.com",
    submittedDate: "2023-12-01",
    status: "pending",
    documents: [
      {
        name: "trade-license.pdf",
        type: "Trade License",
        size: "2.4 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
      {
        name: "tax-certificate.pdf",
        type: "Tax Certificate",
        size: "1.8 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
    ],
    notes: "Initial KYC submission for new business registration.",
    priority: "high",
  },
  {
    id: "KYC-002",
    userId: "IND-003",
    userName: "Mohammed Al-Kuwari",
    userType: "Individual",
    email: "mohammed.kuwari@email.com",
    submittedDate: "2023-11-15",
    status: "pending",
    documents: [
      {
        name: "qid-copy.pdf",
        type: "Qatar ID",
        size: "1.2 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
      {
        name: "bank-statement.pdf",
        type: "Bank Statement",
        size: "3.1 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
    ],
    notes: "Individual contractor KYC verification.",
    priority: "medium",
  },
  {
    id: "KYC-003",
    userId: "BUS-005",
    userName: "New Construction LLC",
    userType: "Business",
    email: "info@newconstruction.qa",
    submittedDate: "2023-12-10",
    status: "under_review",
    documents: [
      {
        name: "trade-license.pdf",
        type: "Trade License",
        size: "2.1 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
      {
        name: "company-profile.pdf",
        type: "Company Profile",
        size: "4.5 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
      {
        name: "insurance-certificate.pdf",
        type: "Insurance Certificate",
        size: "1.9 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
    ],
    notes: "Construction company with good credentials. Under detailed review.",
    priority: "medium",
  },
  {
    id: "KYC-004",
    userId: "IND-005",
    userName: "Aisha Al-Naimi",
    userType: "Individual",
    email: "aisha.naimi@email.com",
    submittedDate: "2023-12-12",
    status: "pending",
    documents: [
      {
        name: "qid-copy.pdf",
        type: "Qatar ID",
        size: "1.1 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
      {
        name: "professional-certificate.pdf",
        type: "Professional Certificate",
        size: "2.3 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
    ],
    notes: "Professional consultant seeking individual verification.",
    priority: "low",
  },
  {
    id: "KYC-005",
    userId: "BUS-006",
    userName: "Tech Innovations Qatar",
    userType: "Business",
    email: "admin@techinnovations.qa",
    submittedDate: "2023-12-14",
    status: "pending",
    documents: [
      {
        name: "trade-license.pdf",
        type: "Trade License",
        size: "2.2 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
      {
        name: "technical-certifications.pdf",
        type: "Technical Certifications",
        size: "3.8 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
      {
        name: "financial-statement.pdf",
        type: "Financial Statement",
        size: "2.7 MB",
        url: "/placeholder.svg?height=400&width=600",
      },
    ],
    notes: "Technology company with comprehensive documentation.",
    priority: "high",
  },
];

// Types

type KycRequest = (typeof mockKycRequests)[number];
type Document = KycRequest["documents"][number];

type StatusFilter =
  | "all"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";
type TypeFilter = "all" | "business" | "individual";
type PriorityFilter = "all" | "high" | "medium" | "low";

export function KycContent() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [selectedRequest, setSelectedRequest] = useState<KycRequest | null>(
    null
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [approvalNotes, setApprovalNotes] = useState<string>("");

  const filteredRequests = mockKycRequests.filter((request) => {
    const matchesSearch =
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;

    // userType in data is "Business"/"Individual" - normalize for comparison
    const matchesType =
      typeFilter === "all" ||
      request.userType.toLowerCase() === typeFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === "all" || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getStatusBadge = (status: string): React.ReactNode => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "under_review":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {t("under_review")}
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
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

  const getPriorityBadge = (priority: string): React.ReactNode => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };
  const { t } = useTranslation();

  const handleApprove = (requestId: string) => {
    console.log(
      "Approving KYC request:",
      requestId,
      "with notes:",
      approvalNotes
    );
    setApprovalNotes("");
  };

  const handleReject = (requestId: string) => {
    console.log(
      "Rejecting KYC request:",
      requestId,
      "with reason:",
      rejectionReason
    );
    setRejectionReason("");
  };

  const getDaysAgo = (date: string): number => {
    const today = new Date();
    const submittedDate = new Date(date);
    const diffTime = today.getTime() - submittedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("total_requests")}
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockKycRequests.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("all_kyc_submissions")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("pending_review")}
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {
                mockKycRequests.filter(
                  (r) => r.status === "pending" || r.status === "under_review"
                ).length
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("awaiting_verification")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("high_priority")}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockKycRequests.filter((r) => r.priority === "high").length}
            </div>
            <p className="text-xs text-gray-500 mt-1">{t("urgent_reviews")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("approved_today")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
            <p className="text-xs text-gray-500 mt-1">
              {t("completed_verifications")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KYC Requests Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t("kyc_verification_requests")}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_kyc_requests")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={() => setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_status")}</SelectItem>
                <SelectItem value="pending">{t("pending")}</SelectItem>
                <SelectItem value="under_review">
                  {t("under_review")}
                </SelectItem>
                <SelectItem value="approved">{t("approved")}</SelectItem>
                <SelectItem value="rejected">{t("rejected")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TypeFilter)}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t("user_type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_types")}</SelectItem>
                <SelectItem value="business">{t("business")}</SelectItem>
                <SelectItem value="individual">{t("individual")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) =>
                setPriorityFilter(value as PriorityFilter)
              }
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_priority")}</SelectItem>
                <SelectItem value="high">{t("high")}</SelectItem>
                <SelectItem value="medium">{t("medium")}</SelectItem>
                <SelectItem value="low">{t("low")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KYC Requests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("request_details")}</TableHead>
                  <TableHead>{t("user")}</TableHead>
                  <TableHead>{t("type")}</TableHead>
                  <TableHead>{t("documents")}</TableHead>
                  <TableHead>{t("submitted")}</TableHead>
                  <TableHead>{t("view")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => {
                  const daysAgo = getDaysAgo(request.submittedDate);
                  return (
                    <TableRow key={request.id} className={""}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="ml-2">
                            <div className="font-medium">{request.id}</div>
                            <div className="text-sm text-gray-500">
                              {request.userId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {request.userType === "Business" ? (
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                          ) : (
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                          )}
                          <div>
                            <div className="font-medium">
                              {request.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.userType}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm">
                            {request.documents.length} files
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{request.submittedDate}</div>
                          <div className="text-xs text-gray-500">
                            {daysAgo} days ago
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                KYC Request - {request.id}
                              </DialogTitle>
                              <DialogDescription>
                                {t("review_and_verify_user_documents")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    {t("user_name")}
                                  </Label>
                                  <p className="text-sm text-gray-600">
                                    {request.userName}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    {t("user_type")}
                                  </Label>
                                  <p className="text-sm text-gray-600">
                                    {request.userType}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Email
                                  </Label>
                                  <p className="text-sm text-gray-600">
                                    {request.email}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    {t("submitted_date")}
                                  </Label>
                                  <p className="text-sm text-gray-600">
                                    {request.submittedDate}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">
                                  Notes
                                </Label>
                                <p className="text-sm text-gray-600 mt-1">
                                  {request.notes}
                                </p>
                              </div>

                              <div>
                                <Label className="text-sm font-medium">
                                  Documents
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                  {request.documents.map((doc, index) => (
                                    <Card key={index} className="p-4 shadow-0">
                                      <div className="flex items-center justify-between mb-2">
                                        <div>
                                          <h4 className="font-medium text-sm">
                                            {doc.type}
                                          </h4>
                                          <p className="text-xs text-gray-500">
                                            {doc.name} • {doc.size}
                                          </p>
                                        </div>
                                        <div className="flex space-x-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              setSelectedDocument(doc)
                                            }
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button variant="ghost" size="sm">
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="border rounded-lg overflow-hidden">
                                        <img
                                          src={doc.url || "/placeholder.svg"}
                                          alt={doc.type}
                                          className="w-full h-32 object-cover"
                                        />
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>

                              {request.status === "pending" ||
                              request.status === "under_review" ? (
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      (window.location.href = `/admin/users/${request.userId}`)
                                    }
                                  >
                                    <User className="h-4 w-4 mr-2" />
                                    {t("view_user_complete_profile")}
                                  </Button>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="text-red-600 bg-transparent"
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          {t("reject_kyc_request")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Please provide a reason for rejecting
                                          this KYC request.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <div className="py-4">
                                        <Label htmlFor="rejection-reason">
                                          {t("rejection_reason")}
                                        </Label>
                                        <Textarea
                                          id="rejection-reason"
                                          placeholder={t(
                                            "enter_reason_for_rejection"
                                          )}
                                          value={rejectionReason}
                                          onChange={(e) =>
                                            setRejectionReason(e.target.value)
                                          }
                                          className="mt-2"
                                        />
                                      </div>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() =>
                                            handleReject(request.id)
                                          }
                                        >
                                          {t("reject_request")}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button>
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          {t("approve_kyc_request")}
                                        </DialogTitle>
                                        <DialogDescription>
                                          Confirm approval of this KYC request.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="py-4">
                                        <Label htmlFor="approval-notes">
                                          Approval Notes (Optional)
                                        </Label>
                                        <Textarea
                                          id="approval-notes"
                                          placeholder={t(
                                            "add_any_notes_about_the_approval"
                                          )}
                                          value={approvalNotes}
                                          onChange={(e) =>
                                            setApprovalNotes(e.target.value)
                                          }
                                          className="mt-2"
                                        />
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline">
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleApprove(request.id)
                                          }
                                        >
                                          {t("approve_request")}
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-sm text-gray-500">
                                    This request has been {request.status}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog
        open={!!selectedDocument}
        onOpenChange={() => setSelectedDocument(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t("document_preview")}</DialogTitle>
            <DialogDescription>
              {selectedDocument?.type} - {selectedDocument?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedDocument && (
              <img
                src={selectedDocument.url || "/placeholder.svg"}
                alt={selectedDocument.type}
                className="max-w-full max-h-[70vh] object-contain border rounded-lg"
              />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={() => setSelectedDocument(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
