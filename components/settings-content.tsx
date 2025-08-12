"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  Shield,
  Globe,
  Mail,
  Bell,
  Database,
  Key,
  Plus,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
} from "lucide-react";

const adminUsers = [
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
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [settings, setSettings] = useState({
    platformName: "Qatar Tender Platform",
    supportEmail: "support@qatartender.gov.qa",
    maxFileSize: "10",
    sessionTimeout: "30",
    enableRegistration: true,
    requireKYC: true,
    enableNotifications: true,
    maintenanceMode: false,
    autoBackup: true,
    twoFactorRequired: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Admin Users</h3>
          <p className="text-sm text-muted-foreground">
            Manage administrative access to the platform
          </p>
        </div>
        <Dialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Admin User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="sendInvite" defaultChecked />
                <Label htmlFor="sendInvite">Send invitation email</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setIsAddUserDialogOpen(false)}>
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="py-7">
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
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
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
