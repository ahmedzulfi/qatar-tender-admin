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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "../lib/hooks/useTranslation";
import {
  Search,
  Eye,
  Building,
  User,
  FileText,
  Gavel,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

type UserStatus = "active" | "suspended" | "pending" | string;
type KycStatus = "approved" | "pending" | "rejected" | string;
type UserRole = "vendor" | "individual";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: UserStatus;
  kycStatus: KycStatus;
  tendersPosted: number;
  bidsSubmitted: number;
  lastActivity: string;
  documents: string[];
  role: UserRole;
}

const mockBusinessUsers: User[] = [
  {
    id: "BUS-001",
    name: "Qatar Construction Co.",
    email: "info@qatarconstruction.com",
    phone: "+974 4444 5555",
    registrationDate: "2023-10-15",
    status: "active",
    kycStatus: "approved",
    tendersPosted: 3,
    bidsSubmitted: 12,
    lastActivity: "2023-12-16",
    documents: [
      "trade-license.pdf",
      "tax-certificate.pdf",
      "bank-statement.pdf",
    ],
    role: "vendor",
  },
  {
    id: "BUS-002",
    name: "Tech Solutions Qatar",
    email: "contact@techsolutions.qa",
    phone: "+974 4444 6666",
    registrationDate: "2023-11-02",
    status: "active",
    kycStatus: "approved",
    tendersPosted: 1,
    bidsSubmitted: 8,
    lastActivity: "2023-12-15",
    documents: ["trade-license.pdf", "technical-certifications.pdf"],
    role: "vendor",
  },
  {
    id: "BUS-003",
    name: "MedEquip International",
    email: "sales@medequip.com",
    phone: "+974 4444 7777",
    registrationDate: "2023-11-20",
    status: "suspended",
    kycStatus: "approved",
    tendersPosted: 0,
    bidsSubmitted: 5,
    lastActivity: "2023-12-10",
    documents: [
      "trade-license.pdf",
      "medical-certifications.pdf",
      "iso-certificate.pdf",
    ],
    role: "vendor",
  },
  {
    id: "BUS-004",
    name: "Suspicious Vendor LLC",
    email: "contact@suspicious.com",
    phone: "+974 4444 8888",
    registrationDate: "2023-12-01",
    status: "pending",
    kycStatus: "pending",
    tendersPosted: 0,
    bidsSubmitted: 2,
    lastActivity: "2023-12-16",
    documents: ["basic-license.pdf"],
    role: "vendor",
  },
];
const mockIndividualUsers: User[] = [
  {
    id: "IND-001",
    name: "Ahmed Al-Rashid",
    email: "ahmed.rashid@email.com",
    phone: "+974 5555 1111",
    registrationDate: "2023-09-20",
    status: "active",
    kycStatus: "approved",
    tendersPosted: 0,
    bidsSubmitted: 4,
    lastActivity: "2023-12-14",
    documents: ["qid-copy.pdf", "experience-letter.pdf", "bank-statement.pdf"],
    role: "individual",
  },
  {
    id: "IND-002",
    name: "Fatima Al-Thani",
    email: "fatima.thani@email.com",
    phone: "+974 5555 2222",
    registrationDate: "2023-10-05",
    status: "active",
    kycStatus: "approved",
    tendersPosted: 1,
    bidsSubmitted: 2,
    lastActivity: "2023-12-13",
    documents: ["qid-copy.pdf", "professional-certificate.pdf"],
    role: "individual",
  },
  {
    id: "IND-003",
    name: "Mohammed Al-Kuwari",
    email: "mohammed.kuwari@email.com",
    phone: "+974 5555 3333",
    registrationDate: "2023-11-15",
    status: "pending",
    kycStatus: "pending",
    tendersPosted: 0,
    bidsSubmitted: 1,
    lastActivity: "2023-12-12",
    documents: ["qid-copy.pdf"],
    role: "individual",
  },
  {
    id: "IND-004",
    name: "Sara Al-Mansouri",
    email: "sara.mansouri@email.com",
    phone: "+974 5555 4444",
    registrationDate: "2023-12-01",
    status: "suspended",
    kycStatus: "rejected",
    tendersPosted: 0,
    bidsSubmitted: 0,
    lastActivity: "2023-12-05",
    documents: ["qid-copy.pdf"],
    role: "individual",
  },
];

export const UsersContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"businesses" | "individuals">(
    "businesses"
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const { t } = useTranslation();

  const currentUsers =
    activeTab === "businesses" ? mockBusinessUsers : mockIndividualUsers;

  const filteredUsers = currentUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesKyc = kycFilter === "all" || user.kycStatus === kycFilter;

    return matchesSearch && matchesStatus && matchesKyc;
  });

  const getStatusBadge = (status: UserStatus) => {
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

  const getKycBadge = (kycStatus: KycStatus) => {
    switch (kycStatus) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
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
        return <Badge variant="outline">{kycStatus}</Badge>;
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "suspended":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleSuspendUser = (userId: string): void => {
    console.log("Suspending user:", userId);
  };

  const handleActivateUser = (userId: string): void => {
    console.log("Activating user:", userId);
  };

  const handleUpgradeRole = (userId: string): void => {
    console.log("Upgrading user role:", userId);
  };

  const getTotalUsers = (type: "businesses" | "individuals"): number => {
    return type === "businesses"
      ? mockBusinessUsers.length
      : mockIndividualUsers.length;
  };

  const getActiveUsers = (type: "businesses" | "individuals"): number => {
    const users =
      type === "businesses" ? mockBusinessUsers : mockIndividualUsers;
    return users.filter((u) => u.status === "active").length;
  };

  const getPendingKyc = (type: "businesses" | "individuals"): number => {
    const users =
      type === "businesses" ? mockBusinessUsers : mockIndividualUsers;
    return users.filter((u) => u.kycStatus === "pending").length;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("total_users")}
            </CardTitle>
            <User className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockBusinessUsers.length + mockIndividualUsers.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("all_registered_users")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("active_users")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                [...mockBusinessUsers, ...mockIndividualUsers].filter(
                  (u) => u.status === "active"
                ).length
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("currently_active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t("pending_kyc")}
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {
                [...mockBusinessUsers, ...mockIndividualUsers].filter(
                  (u) => u.kycStatus === "pending"
                ).length
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("awaiting_verification")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
            <CardTitle className="text-sm font-medium text-gray-600">
              Businesses
            </CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockBusinessUsers.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t("registered_companies")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>{t("user_management")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "businesses" | "individuals")
            }
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="businesses" className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Businesses ({mockBusinessUsers.length})
              </TabsTrigger>
              <TabsTrigger value="individuals" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Individuals ({mockIndividualUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="businesses" className="space-y-4">
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("search_businesses")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_status")}</SelectItem>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="suspended">{t("suspended")}</SelectItem>
                    <SelectItem value="pending">{t("pending")}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={kycFilter} onValueChange={setKycFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder={t("kyc_status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_kyc")}</SelectItem>
                    <SelectItem value="approved">{t("approved")}</SelectItem>
                    <SelectItem value="pending">{t("pending")}</SelectItem>
                    <SelectItem value="rejected">{t("rejected")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("business_details")}</TableHead>
                      <TableHead>{t("contact")}</TableHead>
                      <TableHead>{t("registration")}</TableHead>
                      <TableHead>{t("activity")}</TableHead>
                      <TableHead>{t("kyc")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(user.status)}
                            <div className="ml-2">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{user.email}</div>
                            <div className="text-sm text-gray-500">
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.registrationDate}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <FileText className="h-3 w-3 mr-1" />
                              {user.tendersPosted} tenders
                            </div>
                            <div className="flex items-center">
                              <Gavel className="h-3 w-3 mr-1" />
                              {user.bidsSubmitted} bids
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getKycBadge(user.kycStatus)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/admin/users/${user.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t("view_user")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="individuals" className="space-y-4">
              {/* Same structure as businesses but for individuals */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={t("search_individuals")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_status")}</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={kycFilter} onValueChange={setKycFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder={t("kyc_status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_kyc")}</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("individual_details")}</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(user.status)}
                            <div className="ml-2">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{user.email}</div>
                            <div className="text-sm text-gray-500">
                              {user.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.registrationDate}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center">
                              <FileText className="h-3 w-3 mr-1" />
                              {user.tendersPosted} tenders
                            </div>
                            <div className="flex items-center">
                              <Gavel className="h-3 w-3 mr-1" />
                              {user.bidsSubmitted} bids
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getKycBadge(user.kycStatus)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              (window.location.href = `/admin/users/${user.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t("view_user")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
