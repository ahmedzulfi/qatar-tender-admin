"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Shield,
  UserX,
  FileX,
  StopCircle,
  AlertTriangle,
  Lock,
  Eye,
  History,
  Ban,
  Trash2,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { SettingsContent } from "./settings-content";
import { useTranslation } from "../lib/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import Link from "next/link";

interface AdminActivity {
  _id: string;
  adminId: {
    _id: string;
    email: string;
  };
  adminEmail: string;
  action: string;
  targetId: string;
  targetModel: string;
  details: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export function AdminControlsContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<any[]>([]);
  const [tenders, setTenders] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<AdminActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [userPage, setUserPage] = useState(1);
  const [tenderPage, setTenderPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);

  const usersPerPage = 10;
  const tendersPerPage = 10;
  const auditPerPage = 10;

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    target: any;
    reason: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [actionReason, setActionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch users
        const usersResponse = await adminService.getUsers();
        if (usersResponse.success) {
          setUsers(usersResponse.data.users);
        }

        // Fetch tenders
        const tendersResponse = await adminService.getTenders();
        if (tendersResponse.success) {
          setTenders(tendersResponse.data.tenders);
        }

        // Fetch audit log
        const auditResponse = await adminService.getAdminActivities();
        if (auditResponse.success) {
          setAuditLog(auditResponse.data.activities);
        }
      } catch (err) {
        setError("Failed to load admin data");
        console.error("Error loading admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Security check - in real app, this would check user permissions
  const isSuperAdmin = true; // Mock super admin status

  const handlePasswordVerification = async () => {
    setActionLoading(true);
    try {
      await executeAction();
      setIsPasswordDialogOpen(false);
      setPassword("");
      setPendingAction(null);
      setActionReason("");
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const executeAction = async () => {
    if (!pendingAction) return;

    try {
      switch (pendingAction.type) {
        case "User Suspended":
          await adminService.editUser(pendingAction.target._id, {
            isBanned: true,
            banReason: pendingAction.reason,
          });
          setUsers(
            users.map((user) =>
              user._id === pendingAction.target._id
                ? { ...user, isBanned: true, banReason: pendingAction.reason }
                : user
            )
          );
          break;
        case "User Reactivated":
          await adminService.editUser(pendingAction.target._id, {
            isBanned: false,
            banReason: "",
          });
          setUsers(
            users.map((user) =>
              user._id === pendingAction.target._id
                ? { ...user, isBanned: false, banReason: "" }
                : user
            )
          );
          break;
        case "Tender Closed":
          console.log(
            "Tender Removed RemovedRemovedRemovedRemovedRemovedRemovedRemovedRemovedRemovedRemovedRemovedRemovedRemovedRemovedRemoved"
          );
          await adminService.closeTender(pendingAction.target._id, {
            reason: pendingAction.reason,
          });
          setTenders(
            tenders.map((tender) =>
              tender._id === pendingAction.target._id
                ? { ...tender, status: "rejected" }
                : tender
            )
          );
          break;
        case "Bidding Closed":
          await adminService.closeTender(pendingAction.target._id, {
            reason: pendingAction.reason,
          });
          setTenders(
            tenders.map((tender) =>
              tender._id === pendingAction.target._id
                ? { ...tender, status: "closed" }
                : tender
            )
          );
        default:
          alert("dsd");
      }

      // Refresh audit log
      const auditResponse = await adminService.getAdminActivities();
      if (auditResponse.success) {
        setAuditLog(auditResponse.data.activities);
      }

      alert(`${pendingAction.type} completed successfully.`);
    } catch (err) {
      console.error("Action execution failed:", err);
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Unknown error";
      alert(`Failed to execute action: ${errorMessage}`);
    }
  };

  const initiateAction = (type: string, target: any, reason: string) => {
    setPendingAction({ type, target, reason });
    setActionReason(reason);
    setIsPasswordDialogOpen(true);
  };

  // Filtered data based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.profile?.companyName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const filteredTenders = tenders.filter(
    (tender) =>
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.tenderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAuditLog = auditLog.filter(
    (entry) =>
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.targetModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginated data
  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * usersPerPage,
    userPage * usersPerPage
  );

  const paginatedTenders = filteredTenders.slice(
    (tenderPage - 1) * tendersPerPage,
    tenderPage * tendersPerPage
  );

  const paginatedAuditLog = filteredAuditLog.slice(
    (auditPage - 1) * auditPerPage,
    auditPage * auditPerPage
  );

  // Pagination handlers
  const handleUserPageChange = (newPage: number) => {
    setUserPage(newPage);
  };

  const handleTenderPageChange = (newPage: number) => {
    setTenderPage(newPage);
  };

  const handleAuditPageChange = (newPage: number) => {
    setAuditPage(newPage);
  };
  const getTargetRoute = (targetModel: string, targetId: any) => {
    // If targetId is an object, extract the _id
    const id =
      typeof targetId === "object" && targetId !== null
        ? targetId._id
        : targetId;
    console.log(targetModel, targetId, "dddddd");
    switch (targetModel) {
      case "User":
        return `/admin/users/${id}`;
      case "Tender":
        return `/admin/tenders/${id}`;
      case "Bid":
        return `/admin/bids/${id}`;
      default:
        return null;
    }
  };
  // Calculate total pages
  const userTotalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const tenderTotalPages = Math.ceil(filteredTenders.length / tendersPerPage);
  const auditTotalPages = Math.ceil(filteredAuditLog.length / auditPerPage);

  if (!isSuperAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 p-4 sm:p-6"
      >
        <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("access_restricted")}
            </h3>
            <p className="text-gray-600">
              {t("no_permission_to_access_admin_controls")}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 overflow-hidden">
          <CardHeader className="border-b border-gray-100/50">
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative flex-1 mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Skeleton className="pl-10 w-full h-10 rounded-lg" />
            </div>

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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              {t("error_loading_data")}
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
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
      className="space-y-6 p-4 sm:p-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-1">
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-lg py-2"
          >
            <UserX className="h-4 w-4" />
            {t("user_management")}
          </TabsTrigger>
          <TabsTrigger
            value="tenders"
            className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-lg py-2"
          >
            <FileX className="h-4 w-4" />
            {t("tender_controls")}
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-lg py-2"
          >
            <History className="h-4 w-4" />
            {t("audit_log")}
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 overflow-hidden">
              <CardHeader className="border-b border-gray-100/50">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <UserX className="h-5 w-5 text-blue-600" />
                  {t("user_management")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("search_users")}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setUserPage(1); // Reset to first page when searching
                      }}
                      className="pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="rounded-md border border-gray-100/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                        <TableHead className="font-semibold text-gray-600">
                          {t("user")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("email")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("status")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("kyc_status")}
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">
                          {t("actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="text-gray-500">
                              <UserX className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                              <p className="text-lg font-medium">
                                {t("no_users_found")}
                              </p>
                              <p className="text-sm text-gray-500">
                                {t("try_adjusting_your_search")}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedUsers.map((user) => (
                          <TableRow
                            key={user._id}
                            className="border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-900">
                              <div className="flex items-center space-x-3">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
                                <div>
                                  <div>
                                    {user.profile?.fullName ||
                                      user.profile?.companyName ||
                                      user.email}
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize">
                                    {user.userType}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              {user.isBanned ? (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                  {t("banned")}
                                </Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  {t("active")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.isDocumentVerified === "verified" ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  {t("kyc_verified")}
                                </Badge>
                              ) : user.isDocumentVerified === "pending" ? (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  {t("kyc_pending")}
                                </Badge>
                              ) : user.isDocumentVerified === "rejected" ? (
                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                  {t("kyc_rejected")}
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                  {t("kyc_not_submitted")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {user.isBanned ? (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-green-100 hover:bg-green-200 text-green-800 border-green-200 hover:border-green-300"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {t("reactivate")}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                                          {t("reactivate_user")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-600">
                                          {t("reactivate_user_description", {
                                            name:
                                              user.profile?.fullName ||
                                              user.profile?.companyName ||
                                              user.email,
                                          })}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors">
                                          {t("cancel")}
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            initiateAction(
                                              "User Reactivated",
                                              user,
                                              "Account reactivated by admin"
                                            )
                                          }
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                          {t("reactivate")}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Ban className="h-4 w-4 mr-2" />
                                        {t("suspend")}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl font-semibold text-gray-900">
                                          {t("suspend_user")}
                                        </DialogTitle>
                                        <DialogDescription className="text-gray-600">
                                          {t("suspend_user_description", {
                                            name:
                                              user.profile?.fullName ||
                                              user.profile?.companyName ||
                                              user.email,
                                          })}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <form
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          const formData = new FormData(
                                            e.currentTarget
                                          );
                                          const reason = formData.get(
                                            "reason"
                                          ) as string;
                                          initiateAction(
                                            "User Suspended",
                                            user,
                                            reason
                                          );
                                        }}
                                      >
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label
                                              htmlFor="reason"
                                              className="text-sm font-medium text-gray-700"
                                            >
                                              {t("suspension_reason")}
                                            </Label>
                                            <Textarea
                                              id="reason"
                                              name="reason"
                                              placeholder={t(
                                                "provide_reason_for_suspension"
                                              )}
                                              required
                                              rows={3}
                                              className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="pt-4 border-t border-gray-100/50">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                              setIsPasswordDialogOpen(false)
                                            }
                                            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                          >
                                            {t("cancel")}
                                          </Button>
                                          <Button
                                            type="submit"
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                          >
                                            {t("suspend_user")}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {filteredUsers.length > usersPerPage && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      {t("showing")} {(userPage - 1) * usersPerPage + 1}-
                      {Math.min(userPage * usersPerPage, filteredUsers.length)}{" "}
                      {t("of")} {filteredUsers.length} {t("users")}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserPageChange(userPage - 1)}
                        disabled={userPage === 1}
                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      >
                        {t("previous")}
                      </Button>
                      <div className="text-sm text-gray-600">
                        {t("page")} {userPage} {t("of")} {userTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUserPageChange(userPage + 1)}
                        disabled={userPage === userTotalPages}
                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      >
                        {t("next")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Tender Controls Tab */}
        <TabsContent value="tenders" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 overflow-hidden">
              <CardHeader className="border-b border-gray-100/50">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileX className="h-5 w-5 text-blue-600" />
                  {t("tender_controls")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("search_tenders")}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setTenderPage(1); // Reset to first page when searching
                      }}
                      className="pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="rounded-md border border-gray-100/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                        <TableHead className="font-semibold text-gray-600">
                          {t("tender")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("category")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("status")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("bids")}
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">
                          {t("actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTenders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="text-gray-500">
                              <FileX className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                              <p className="text-lg font-medium">
                                {t("no_tenders_found")}
                              </p>
                              <p className="text-sm text-gray-500">
                                {t("try_adjusting_your_search")}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTenders.map((tender) => (
                          <TableRow
                            key={tender._id}
                            className="border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors"
                          >
                            <TableCell className="font-medium text-gray-900">
                              <div>
                                <div>{tender.title}</div>
                                <div className="text-xs text-gray-500">
                                  {tender.tenderCode}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {tender.category?.name}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  tender.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  tender.status === "closed"
                                    ? "bg-gray-100 text-gray-800"
                                    : tender.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : ""
                                }
                              >
                                {t(tender.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {tender.bidCount || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {tender.status === "active" && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {t("remove")}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
                                      <DialogHeader>
                                        <DialogTitle className="text-xl font-semibold text-gray-900">
                                          {t("close_tender")}
                                        </DialogTitle>
                                        <DialogDescription className="text-gray-600">
                                          {t("remove_tender_description", {
                                            title: tender.title,
                                          })}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <form
                                        onSubmit={(e) => {
                                          e.preventDefault();
                                          const formData = new FormData(
                                            e.currentTarget
                                          );
                                          const reason = formData.get(
                                            "reason"
                                          ) as string;
                                          if (!reason.trim()) {
                                            alert(t("reason_required"));
                                            return;
                                          }
                                          initiateAction(
                                            "Tender Closed",
                                            tender,
                                            reason
                                          );
                                        }}
                                      >
                                        <div className="space-y-4 py-4">
                                          <div className="space-y-2">
                                            <Label
                                              htmlFor="tender-close-reason"
                                              className="text-sm font-medium text-gray-700"
                                            >
                                              {t("closure_reason")}
                                            </Label>
                                            <Textarea
                                              id="tender-close-reason"
                                              name="reason"
                                              placeholder={t(
                                                "provide_reason_for_closing_tender"
                                              )}
                                              required
                                              rows={3}
                                              className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="pt-4 border-t border-gray-100/50">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                              // Close dialog
                                            }}
                                            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                          >
                                            {t("cancel")}
                                          </Button>
                                          <Button
                                            type="submit"
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                          >
                                            {t("close_tender")}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                )}
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {filteredTenders.length > tendersPerPage && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      {t("showing")} {(tenderPage - 1) * tendersPerPage + 1}-
                      {Math.min(
                        tenderPage * tendersPerPage,
                        filteredTenders.length
                      )}{" "}
                      {t("of")} {filteredTenders.length} {t("tenders")}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTenderPageChange(tenderPage - 1)}
                        disabled={tenderPage === 1}
                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      >
                        {t("previous")}
                      </Button>
                      <div className="text-sm text-gray-600">
                        {t("page")} {tenderPage} {t("of")} {tenderTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTenderPageChange(tenderPage + 1)}
                        disabled={tenderPage === tenderTotalPages}
                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      >
                        {t("next")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50 overflow-hidden">
              <CardHeader className="border-b border-gray-100/50">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  {t("audit_log")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("search_audit_log")}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setAuditPage(1); // Reset to first page when searching
                      }}
                      className="pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="rounded-md border border-gray-100/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                        <TableHead className="font-semibold text-gray-600">
                          {t("action")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("target")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("admin")}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">
                          {t("timestamp")}
                        </TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">
                          {t("actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAuditLog.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="text-gray-500">
                              <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                              <p className="text-lg font-medium">
                                {t("no_audit_logs_found")}
                              </p>
                              <p className="text-sm text-gray-500">
                                {t("audit_logs_will_appear_here")}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedAuditLog.map((entry) => {
                          const route = getTargetRoute(
                            entry.targetModel,
                            entry.targetId
                          );

                          return (
                            <TableRow
                              key={entry._id}
                              className="border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors"
                            >
                              <TableCell className="font-medium text-gray-900">
                                {t(`audit_action_${entry.action}`)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {entry.targetModel}
                                </Badge>
                              </TableCell>
                              <TableCell>{entry.adminEmail}</TableCell>
                              <TableCell className="text-gray-600">
                                {new Date(entry.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right">
                                {route ? (
                                  <Link href={route} passHref>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      {t("view")}
                                    </Button>
                                  </Link>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled
                                    className="opacity-50 cursor-not-allowed"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    {t("view")}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {filteredAuditLog.length > auditPerPage && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-600">
                      {t("showing")} {(auditPage - 1) * auditPerPage + 1}-
                      {Math.min(
                        auditPage * auditPerPage,
                        filteredAuditLog.length
                      )}{" "}
                      {t("of")} {filteredAuditLog.length} {t("activities")}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAuditPageChange(auditPage - 1)}
                        disabled={auditPage === 1}
                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      >
                        {t("previous")}
                      </Button>
                      <div className="text-sm text-gray-600">
                        {t("page")} {auditPage} {t("of")} {auditTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAuditPageChange(auditPage + 1)}
                        disabled={auditPage === auditTotalPages}
                        className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                      >
                        {t("next")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Password Confirmation Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              {t("security_verification_required")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("enter_admin_password_to_confirm_action")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {pendingAction && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">
                    {t("action_to_be_performed")}
                  </span>
                </div>
                <div className="text-sm text-red-800">
                  <strong>{t(`audit_action_${pendingAction.type}`)}</strong>{" "}
                  {t("on")}{" "}
                  <strong>
                    {pendingAction.target.profile?.fullName ||
                      pendingAction.target.profile?.companyName ||
                      pendingAction.target.title ||
                      pendingAction.target.tenderCode}
                  </strong>
                </div>
                <div className="text-sm text-red-700 mt-1">
                  {t("reason")}: {pendingAction.reason}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="text-sm font-medium text-gray-700"
              >
                {t("admin_password")}
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("enter_your_password")}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-100/50">
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setPassword("");
                setPendingAction(null);
              }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handlePasswordVerification}
              disabled={!password || actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Lock className="h-4 w-4 mr-2" />
              )}
              {t("confirm_action")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
