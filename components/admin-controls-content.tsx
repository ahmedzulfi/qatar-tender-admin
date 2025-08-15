"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { format } from "date-fns";
import { SettingsContent } from "./settings-content";

// Mock data for users that can be suspended
const usersData = [
  {
    id: 1,
    name: "Ahmed Al-Rashid",
    email: "ahmed@example.com",
    company: "Al-Rashid Construction",
    status: "active",
    joinDate: "2024-01-15T00:00:00Z",
    lastActivity: "2024-01-20T14:30:00Z",
    tenderCount: 12,
    suspensionReason: null,
  },
  {
    id: 2,
    name: "Qatar Construction Co.",
    email: "info@qatarconstruction.com",
    company: "Qatar Construction Co.",
    status: "suspended",
    joinDate: "2024-01-10T00:00:00Z",
    lastActivity: "2024-01-18T09:15:00Z",
    tenderCount: 8,
    suspensionReason: "Fraudulent bidding activity",
  },
  {
    id: 3,
    name: "Doha Engineering Ltd.",
    email: "contact@dohaeng.com",
    company: "Doha Engineering Ltd.",
    status: "active",
    joinDate: "2024-01-12T00:00:00Z",
    lastActivity: "2024-01-20T16:45:00Z",
    tenderCount: 15,
    suspensionReason: null,
  },
];

// Mock data for tenders that can be removed
const tendersData = [
  {
    id: 1,
    title: "Construction Project - Phase 1",
    tenderCode: "TND-2024-001",
    status: "active",
    bidCount: 23,
    deadline: "2024-02-15T23:59:59Z",
    publishedDate: "2024-01-15T00:00:00Z",
    category: "Construction",
    estimatedValue: 2500000,
  },
  {
    id: 2,
    title: "IT Infrastructure Upgrade",
    tenderCode: "TND-2024-002",
    status: "active",
    bidCount: 15,
    deadline: "2024-02-20T23:59:59Z",
    publishedDate: "2024-01-16T00:00:00Z",
    category: "IT & Technology",
    estimatedValue: 850000,
  },
  {
    id: 3,
    title: "Healthcare Equipment Procurement",
    tenderCode: "TND-2024-003",
    status: "closed",
    bidCount: 8,
    deadline: "2024-01-25T23:59:59Z",
    publishedDate: "2024-01-10T00:00:00Z",
    category: "Healthcare",
    estimatedValue: 1200000,
  },
];

// Mock audit log data
const auditLogData = [
  {
    id: 1,
    action: "User Suspended",
    target: "Qatar Construction Co.",
    admin: "Super Admin",
    timestamp: "2024-01-20T10:30:00Z",
    reason: "Fraudulent bidding activity",
    severity: "high",
  },
  {
    id: 2,
    action: "Tender Removed",
    target: "TND-2024-005",
    admin: "Super Admin",
    timestamp: "2024-01-19T15:45:00Z",
    reason: "Duplicate tender posting",
    severity: "medium",
  },
  {
    id: 3,
    action: "Bidding Closed",
    target: "TND-2024-004",
    admin: "Admin User",
    timestamp: "2024-01-18T09:20:00Z",
    reason: "Emergency closure due to specification changes",
    severity: "medium",
  },
];

export function AdminControlsContent() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState(usersData);
  const [tenders, setTenders] = useState(tendersData);
  const [auditLog, setAuditLog] = useState(auditLogData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    target: any;
    reason: string;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [actionReason, setActionReason] = useState("");

  // Security check - in real app, this would check user permissions
  const isSuperAdmin = true; // Mock super admin status

  const handlePasswordVerification = () => {
    // In real app, this would verify the password against the current user's password
    if (password === "admin123") {
      // Mock password verification
      executeAction();
      setIsPasswordDialogOpen(false);
      setPassword("");
      setPendingAction(null);
      setActionReason("");
    } else {
      alert("Incorrect password. Action cancelled.");
    }
  };

  const executeAction = () => {
    if (!pendingAction) return;

    const timestamp = new Date().toISOString();
    const newAuditEntry = {
      id: auditLog.length + 1,
      action: pendingAction.type,
      target:
        pendingAction.target.name ||
        pendingAction.target.title ||
        pendingAction.target.tenderCode,
      admin: "Super Admin",
      timestamp,
      reason: pendingAction.reason,
      severity: "high" as const,
    };

    switch (pendingAction.type) {
      case "User Suspended":
        setUsers(
          users.map((user) =>
            user.id === pendingAction.target.id
              ? {
                  ...user,
                  status: "suspended",
                  suspensionReason: pendingAction.reason,
                }
              : user
          )
        );
        break;
      case "User Reactivated":
        setUsers(
          users.map((user) =>
            user.id === pendingAction.target.id
              ? { ...user, status: "active", suspensionReason: null }
              : user
          )
        );
        break;
      case "Tender Removed":
        setTenders(
          tenders.filter((tender) => tender.id !== pendingAction.target.id)
        );
        break;
      case "Bidding Closed":
        setTenders(
          tenders.map((tender) =>
            tender.id === pendingAction.target.id
              ? { ...tender, status: "closed" }
              : tender
          )
        );
        break;
    }

    setAuditLog([newAuditEntry, ...auditLog]);
    alert(`${pendingAction.type} completed successfully.`);
  };

  const initiateAction = (type: string, target: any, reason: string) => {
    setPendingAction({ type, target, reason });
    setActionReason(reason);
    setIsPasswordDialogOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTenders = tenders.filter(
    (tender) =>
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.tenderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600">
            You don't have permission to access admin controls. Contact your
            system administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="users" className="flex items-center gap-2 ">
            <UserX className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="tenders" className="flex items-center gap-2">
            <FileX className="h-4 w-4" />
            Tender Controls
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Audit Log
          </TabsTrigger>{" "}
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5" />
                User Suspension Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tenders</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.company}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : "destructive"
                            }
                            className={
                              user.status === "suspended"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.tenderCount}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(user.lastActivity),
                            "MMM dd, yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.status === "active" ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Suspend User</DialogTitle>
                                    <DialogDescription>
                                      This will immediately suspend {user.name}{" "}
                                      and prevent them from accessing the
                                      platform.
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
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="reason">
                                          Suspension Reason
                                        </Label>
                                        <Textarea
                                          id="reason"
                                          name="reason"
                                          placeholder="Provide a detailed reason for suspension..."
                                          required
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter className="mt-6">
                                      <Button
                                        type="submit"
                                        variant="destructive"
                                      >
                                        Proceed to Suspend
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <UserX className="h-4 w-4 mr-2" />
                                    Reactivate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Reactivate User
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will reactivate {user.name} and
                                      restore their platform access.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        initiateAction(
                                          "User Reactivated",
                                          user,
                                          "Account reactivated by admin"
                                        )
                                      }
                                    >
                                      Reactivate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tender Controls Tab */}
        <TabsContent value="tenders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileX className="h-5 w-5" />
                Tender Management Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tenders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tender</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bids</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenders.map((tender) => (
                      <TableRow key={tender.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tender.title}</div>
                            <div className="text-sm text-gray-500">
                              {tender.tenderCode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tender.category}</Badge>
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
                                : ""
                            }
                          >
                            {tender.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{tender.bidCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tender.status === "active" && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <StopCircle className="h-4 w-4 mr-2" />
                                      Close Bidding
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Force Close Bidding
                                      </DialogTitle>
                                      <DialogDescription>
                                        This will immediately close bidding for
                                        "{tender.title}" and prevent new bids.
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
                                          "Bidding Closed",
                                          tender,
                                          reason
                                        );
                                      }}
                                    >
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="close-reason">
                                            Closure Reason
                                          </Label>
                                          <Textarea
                                            id="close-reason"
                                            name="reason"
                                            placeholder="Provide a reason for closing bidding early..."
                                            required
                                          />
                                        </div>
                                      </div>
                                      <DialogFooter className="mt-6">
                                        <Button
                                          type="submit"
                                          variant="destructive"
                                        >
                                          Close Bidding
                                        </Button>
                                      </DialogFooter>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remove
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Remove Tender
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently remove "
                                        {tender.title}" from the platform. This
                                        action cannot be undone and will affect{" "}
                                        {tender.bidCount} existing bids.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          initiateAction(
                                            "Tender Removed",
                                            tender,
                                            "Tender removed by admin"
                                          )
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Remove Tender
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Admin Action Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLog.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.action}
                        </TableCell>
                        <TableCell>{entry.target}</TableCell>
                        <TableCell>{entry.admin}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate">{entry.reason}</div>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(entry.timestamp),
                            "MMM dd, yyyy HH:mm:ss"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="space-y-6">
          <SettingsContent />
        </TabsContent>
      </Tabs>

      {/* Password Confirmation Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              Security Verification Required
            </DialogTitle>
            <DialogDescription>
              Please enter your admin password to confirm this sensitive action.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pendingAction && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-900">
                    Action to be performed:
                  </span>
                </div>
                <div className="text-sm text-red-800">
                  <strong>{pendingAction.type}</strong> on{" "}
                  <strong>
                    {pendingAction.target.name ||
                      pendingAction.target.title ||
                      pendingAction.target.tenderCode}
                  </strong>
                </div>
                <div className="text-sm text-red-700 mt-1">
                  Reason: {pendingAction.reason}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setPassword("");
                setPendingAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePasswordVerification}
              disabled={!password}
            >
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
