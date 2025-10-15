"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "../lib/hooks/useTranslation";
import { adminService } from "@/services/adminService";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminUser {
  _id: string;
  email: string;
  userType: "admin";
  adminType: "super" | "normal";
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export function SettingsContent() {
  const { t } = useTranslation();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "admin" as "super" | "admin",
  });
  const [password, setPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch admin users on component mount
  useEffect(() => {
    const fetchAdminUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        // First get all users
        const usersResponse = await adminService.getUsers();

        if (usersResponse.success) {
          // Filter for admin users (userType: "admin")
          const adminUsers = usersResponse.data.users.filter(
            (user: any) => user.userType === "admin || superadmin"
          );

          setAdminUsers(adminUsers);
        } else {
          throw new Error(usersResponse.error || "Failed to fetch admin users");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load admin users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminUsers();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddUser = async () => {
    if (!formData.email) {
      alert(t("please_enter_email_address"));
      return;
    }

    setActionLoading(true);
    try {
      const result = await adminService.createAdmin(formData.email);

      if (result.success) {
        // Refresh admin users list
        const usersResponse = await adminService.getUsers();
        if (usersResponse.success) {
          const adminUsers = usersResponse.data.users.filter(
            (user: any) => user.userType === "admin"
          );
          setAdminUsers(adminUsers);
        }

        setIsAddUserDialogOpen(false);
        setFormData({ email: "", role: "admin" });
        alert(t("admin_user_created_successfully"));
      } else {
        throw new Error(result.error || t("failed_to_create_admin_user"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("failed_to_create_admin_user")
      );
      alert(
        err instanceof Error ? err.message : t("failed_to_create_admin_user")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    if (user.adminType === "super") {
      alert(t("super_admin_users_cannot_be_edited"));
      return;
    }

    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.adminType === "super" ? "super" : "admin",
    });
    setIsEditUserDialogOpen(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    if (user.adminType === "super") {
      alert(t("super_admin_users_cannot_be_deleted"));
      return;
    }

    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(true);
    try {
      const result = await adminService.deleteAdmin(userToDelete._id);

      if (result.success) {
        // Refresh admin users list
        const usersResponse = await adminService.getUsers();
        if (usersResponse.success) {
          const adminUsers = usersResponse.data.users.filter(
            (user: any) => user.userType === "admin"
          );
          setAdminUsers(adminUsers);
        }

        setUserToDelete(null);
        setIsDeleteDialogOpen(false);
        alert(t("admin_user_deleted_successfully"));
      } else {
        throw new Error(result.error || t("failed_to_delete_admin_user"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("failed_to_delete_admin_user")
      );
      alert(
        err instanceof Error ? err.message : t("failed_to_delete_admin_user")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "admin":
        return "bg-blue-100 text-blue-600 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusBadge = (user: AdminUser) => {
    if (!user.isVerified) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          {t("pending_verification")}
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        {t("verified")}
      </Badge>
    );
  };

  const refreshAdminUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const usersResponse = await adminService.getUsers();

      if (usersResponse.success) {
        const adminUsers = usersResponse.data.users.filter(
          (user: any) => user.userType === "admin"
        );
        setAdminUsers(adminUsers);
      } else {
        throw new Error(
          usersResponse.error || t("failed_to_refresh_admin_users")
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("failed_to_refresh_admin_users")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">{t("admin_users")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("manage_administrative_access_to_the_platform")}
            </p>
          </div>
          <Button onClick={refreshAdminUsers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
        </div>

        <Card>
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              {t("error_loading_admin_users")}
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={refreshAdminUsers} className="mt-4">
              {t("try_again")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t("admin_users")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("manage_administrative_access_to_the_platform")}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={refreshAdminUsers}
            className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
          <Dialog
            open={isAddUserDialogOpen}
            onOpenChange={setIsAddUserDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("add_admin_user")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {t("add_new_admin_user")}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  {t("a_password_will_be_generated_and_sent_to_the_email")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t("email_address")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("enter_admin_email")}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t("role")}
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                      <SelectValue placeholder={t("select_role")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super">{t("super_admin")}</SelectItem>
                      <SelectItem value="admin">{t("admin")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="pt-4 border-t border-gray-100/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddUserDialogOpen(false);
                    setFormData({ email: "", role: "admin" });
                  }}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={actionLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {t("add_user")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {t("delete_admin_user")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("are_you_sure_you_want_to_delete_admin_user")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {userToDelete && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">
                    {t("action_cannot_be_undone")}
                  </span>
                </div>
                <p className="text-sm text-red-800">
                  {t("deleting_admin_user_warning", {
                    email: userToDelete.email,
                  })}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="pt-4 border-t border-gray-100/50">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t("delete_user")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {t("edit_admin_user")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("edit_admin_user_details")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="edit-email"
                className="text-sm font-medium text-gray-700"
              >
                {t("email_address")}
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder={t("enter_email_address")}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="edit-role"
                className="text-sm font-medium text-gray-700"
              >
                {t("role")}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border border-gray-200/50">
                  <SelectValue placeholder={t("select_role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super">{t("super_admin")}</SelectItem>
                  <SelectItem value="admin">{t("admin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-100/50">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditUserDialogOpen(false);
                setFormData({ email: "", role: "admin" });
                setEditingUser(null);
              }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {actionLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {t("update_user")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                <TableHead className="font-semibold text-gray-600">
                  {t("user")}
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  {t("role")}
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  {t("status")}
                </TableHead>
                <TableHead className="font-semibold text-gray-600">
                  {t("created")}
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-600">
                  {t("actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="text-gray-500">
                      <svg
                        className="h-12 w-12 mx-auto text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        {t("no_admin_users_found")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("add_admin_users_to_manage_platform")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                adminUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    className="border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32&text=${user.email.charAt(
                              0
                            )}`}
                            alt={user.email}
                          />
                          <AvatarFallback>
                            {user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{user.email}</div>
                          <div className="text-xs text-gray-500">
                            {user.adminType === "super"
                              ? t("super_admin")
                              : t("admin")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getRoleColor(user.adminType)} capitalize`}
                      >
                        {user.adminType === "super"
                          ? t("super_admin")
                          : t("admin")}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                       
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.adminType === "super"}
                          className=" group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
