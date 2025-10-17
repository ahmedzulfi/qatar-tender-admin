"use client";

import type React from "react";
import { useState, Suspense } from "react";
import {
  LayoutDashboard,
  CreditCard,
  Tags,
  Settings,
  Shield,
  FileText,
  Gavel,
  Users,
  UserCheck,
  BarChart3,
  Menu,
  X,
  Search,
  LogOut,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import { useTranslation } from "../../lib/hooks/useTranslation";
import { LanguageToggle } from "@/components/LanguageToggle";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth-guard";
import { NotificationProvider } from "@/context/NotificationContext";
import { adminService } from "@/services/adminService";
import { useAdminAuth } from "@/context/AdminAuthProvider";
// Types
type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type SearchResult = {
  type: "user" | "business" | "tender";
  id: number;
  title: string;
  subtitle: string;
};

// Navigation Items

// Mock search data
const mockResults: SearchResult[] = [
  { type: "user", id: 1, title: "John Doe", subtitle: "john@example.com" },
  {
    type: "business",
    id: 2,
    title: "Qatar Constructions",
    subtitle: "Construction Industry",
  },
  {
    type: "tender",
    id: 3,
    title: "Road Expansion Project",
    subtitle: "Due: Sep 30, 2025",
  },
  {
    type: "user",
    id: 4,
    title: "Fatima Khan",
    subtitle: "fatima@qatartender.com",
  },
  {
    type: "business",
    id: 5,
    title: "Desert Tech Solutions",
    subtitle: "IT Services",
  },
  {
    type: "tender",
    id: 6,
    title: "School Renovation Tender",
    subtitle: "Due: Oct 10, 2025",
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { logout, admin } = useAdminAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigation: NavItem[] = [
    { name: t("dashboard"), href: "/admin", icon: LayoutDashboard },
    { name: t("tenders"), href: "/admin/tenders", icon: FileText },
    { name: t("bids"), href: "/admin/bids", icon: Gavel },
    { name: t("users"), href: "/admin/users", icon: Users },
    { name: t("kyc"), href: "/admin/kyc", icon: UserCheck },
    // { name: t("transactions"), href: "/admin/transactions", icon: CreditCard },
    { name: t("notifications"), href: "/admin/notification", icon: Bell },
    { name: t("analytics"), href: "/admin/analytics", icon: BarChart3 },
    { name: t("categories"), href: "/admin/categories", icon: Tags },
    { name: t("search"), href: "/admin/search", icon: Search },
    { name: t("settings"), href: "/admin/settings", icon: Settings },
    { name: t("admin_controls"), href: "/admin/admin-controls", icon: Shield },
  ];

  const getCurrentPageName = () => {
    const currentNav = navigation.find((nav) => {
      if (nav.href === "/admin" && pathname === "/admin") return true;
      if (nav.href !== "/admin" && pathname.startsWith(nav.href)) return true;
      return false;
    });
    return currentNav?.name || t("dashboard");
  };
  const handellogout = async () => {
    logout();
    router.push("/login");
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="flex h-screen bg-gray-50">
          <div
            className={classNames(
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
              "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden"
            )}
          >
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <h1 className="text-xl font-bold text-gray-900">
                {t("qatar_tender")}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="mt-6 px-3">
              <ul className="space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }}
                      className={classNames(
                        (item.href === "/admin" && pathname === "/admin") ||
                          (item.href !== "/admin" &&
                            pathname.startsWith(item.href))
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-700 hover:bg-gray-50",
                        "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                      )}
                    >
                      <item.icon
                        className={classNames(
                          (item.href === "/admin" && pathname === "/admin") ||
                            (item.href !== "/admin" &&
                              pathname.startsWith(item.href))
                            ? "text-blue-700"
                            : "text-gray-400",
                          "mr-3 h-5 w-5 flex-shrink-0"
                        )}
                      />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
            <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
              <div className="flex h-16 items-center px-6 border-b">
                <h1 className="text-xl font-bold text-gray-900">
                  {t("qatar_tender")}
                </h1>
              </div>
              <nav className="mt-6 flex-1 px-3">
                <ul className="space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => router.push(item.href)}
                        className={classNames(
                          (item.href === "/admin" && pathname === "/admin") ||
                            (item.href !== "/admin" &&
                              pathname.startsWith(item.href))
                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                            : "text-gray-700 hover:bg-gray-50",
                          "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                        )}
                      >
                        <item.icon
                          className={classNames(
                            (item.href === "/admin" && pathname === "/admin") ||
                              (item.href !== "/admin" &&
                                pathname.startsWith(item.href))
                              ? "text-blue-700"
                              : "text-gray-400",
                            "mr-3 h-5 w-5 flex-shrink-0"
                          )}
                        />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col lg:pl-64">
            <header className="bg-white border-b border-gray-200 relative">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left Section */}
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <div className="ml-4 lg:ml-0">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {getCurrentPageName()}
                    </h2>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4 relative gap-6">
                  <LanguageToggle />
                  {/* Avatar & Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src="/placeholder.svg?height=32&width=32"
                            alt="Admin"
                          />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {t("admin_user")}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {admin?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <div
                          className="div flex"
                          onClick={() => handellogout()}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>{t("log_out")}</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8">{children}</div>
            </main>
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
