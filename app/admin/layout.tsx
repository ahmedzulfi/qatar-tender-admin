"use client";

import type React from "react";

import { useState } from "react";
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
  User,
  LogOut,
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
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Tenders", href: "/admin/tenders", icon: FileText },
  { name: "Bids", href: "/admin/bids", icon: Gavel },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "KYC", href: "/admin/kyc", icon: UserCheck },
  { name: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Admin Controls", href: "/admin/admin-controls", icon: Shield },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCurrentPageName = () => {
    const currentNav = navigation.find((nav) => {
      if (nav.href === "/admin" && pathname === "/admin") return true;
      if (nav.href !== "/admin" && pathname.startsWith(nav.href)) return true;
      return false;
    });
    return currentNav?.name || "Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={classNames(
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Qatar Tender</h1>
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
                      (item.href !== "/admin" && pathname.startsWith(item.href))
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
            <h1 className="text-xl font-bold text-gray-900">Qatar Tender</h1>
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
        <header className="bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
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

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search..." className="pl-10 w-64" />
              </div>

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
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Admin User
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        admin@qatartender.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <Link href={"/admin/settings"}>
                    {" "}
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>{" "}
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href={"/login"}>
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </Link>
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
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
