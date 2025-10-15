"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminUser } from "@/services/adminService";
import { useAdminAuth } from "@/context/AdminAuthProvider";
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
  allowedAdminTypes?: string[]; // <-- new optional param
}

export function ProtectedRoute({
  children,
  allowedUserTypes,
  allowedAdminTypes,
}: ProtectedRouteProps) {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!admin) {
        router.push("/login");
        return;
      }

      // Check userType
      if (allowedUserTypes && !allowedUserTypes.includes(admin.userType)) {
        const redirectPath = getRedirectPath(admin.userType);
        router.push(redirectPath);
        return;
      }

      // Check adminType if specified
      if (
        allowedAdminTypes &&
        (!admin.adminType || !allowedAdminTypes.includes(admin.adminType))
      ) {
        const redirectPath = getRedirectPath(admin.userType);
        router.push(redirectPath);
        return;
      }
    }
  }, [admin, isLoading, router, allowedUserTypes, allowedAdminTypes]);

  const getRedirectPath = (userType: string) => {
    switch (userType) {
      case "admin":
        return "/admin";
      case "business":
        return "/business-dashboard";
      case "individual":
      default:
        return "/admin";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (
    !admin ||
    (allowedUserTypes && !allowedUserTypes.includes(admin.userType)) ||
    (allowedAdminTypes &&
      (!admin.adminType || !allowedAdminTypes.includes(admin.adminType)))
  ) {
    return null;
  }

  return <>{children}</>;
}
