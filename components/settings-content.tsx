"use client";

import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2 } from "lucide-react";

import { useTranslation } from "../lib/hooks/useTranslation";
interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  avatar: string;
}

const initialAdminUsers: AdminUser[] = [
  {
    id: 1,
    name: "Ahmed Al-Rashid",
    email: "ahmed@qatartender.gov.qa",
    role: "Super Admin",
    status: "active",
    lastLogin: "2024-01-10T14:30:00Z",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    name: "Fatima Al-Zahra",
    email: "fatima@qatartender.gov.qa",
    role: "Admin",
    status: "active",
    lastLogin: "2024-01-10T09:15:00Z",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    name: "Mohammed Al-Thani",
    email: "mohammed@qatartender.gov.qa",
    role: "Admin",
    status: "inactive",
    lastLogin: "2024-01-08T16:45:00Z",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    name: "Aisha Al-Kuwari",
    email: "aisha@qatartender.gov.qa",
    role: "Admin",
    status: "active",
    lastLogin: "2024-01-09T11:20:00Z",
    avatar: "/placeholder.svg?height=32&width=32",
  },
];

export function SettingsContent() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddUser = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.password
    ) {
      alert("Please fill in all required fields including password");
      return;
    }

    const newUser: AdminUser = {
      id: Math.max(...adminUsers.map((u) => u.id)) + 1,
      name: formData.name,
      email: formData.email,
      role: formData.role === "super-admin" ? "Super Admin" : "Admin",
      status: "active",
      lastLogin: new Date().toISOString(),
      avatar: "/placeholder.svg?height=32&width=32",
    };

    setAdminUsers((prev) => [...prev, newUser]);
    setFormData({ name: "", email: "", role: "", password: "" });
    setIsAddUserDialogOpen(false);
  };

  const handleEditUser = (user: AdminUser) => {
    if (user.role === "Super Admin") {
      alert("Super Admin users cannot be edited");
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role === "Super Admin" ? "super-admin" : "admin",
      password: "",
    });
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!formData.name || !formData.email || !formData.role || !editingUser) {
      alert("Please fill in all required fields");
      return;
    }

    setAdminUsers((prev) =>
      prev.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              name: formData.name,
              email: formData.email,
              role: formData.role === "super-admin" ? "Super Admin" : "Admin",
            }
          : user
      )
    );

    setFormData({ name: "", email: "", role: "", password: "" });
    setEditingUser(null);
    setIsEditUserDialogOpen(false);
  };

  const handleDeleteUser = (user: AdminUser) => {
    if (user.role === "Super Admin") {
      alert("Super Admin users cannot be deleted");
      return;
    }

    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setAdminUsers((prev) =>
        prev.filter((user) => user.id !== userToDelete.id)
      );
      setUserToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{t("admin_users")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("manage_administrative_access_to_the_platform")}
          </p>
        </div>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("add_new_admin_user")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("full_name")}</Label>
                  <Input
                    id="name"
                    placeholder={t("enter_full_name")}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email_address")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("enter_email_address")}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">{t("role")}</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_role")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super-admin">
                        {t("super_admin")}
                      </SelectItem>
                      <SelectItem value="admin">{t("admin")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("password")} *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("enter_password")}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button onClick={handleAddUser}>{t("add_user")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete_admin_user")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("are_you_sure_you_want_to_delete")}{" "}
              <strong>{userToDelete?.name}</strong>?{" "}
              {t("this_action_cannot_be_undone")}
            </p>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button variant="destructive" onClick={confirmDeleteUser}>
                {t("delete_user")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit_admin_user")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("full_name")}</Label>
                <Input
                  id="edit-name"
                  placeholder={t("enter_full_name")}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">{t("email_address")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder={t("enter_email_address")}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">{t("role")}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">
                      {t("super_admin")}
                    </SelectItem>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">{t("new_password")}</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder={t("enter_new_password_optional")}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditUserDialogOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button onClick={handleUpdateUser}>{t("update_user")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("user")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("last_login")}</TableHead>
                <TableHead>{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        disabled={user.role === "Super Admin"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.role === "Super Admin"}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
