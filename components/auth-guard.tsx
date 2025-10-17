"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
  // Restrict access to specific admin types (for userType "admin")
  allowedAdminTypes?: ("super" | "normal")[];
}

export function ProtectedRoute({
  children,
  allowedUserTypes,
  allowedAdminTypes,
}: ProtectedRouteProps) {
  const { admin, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(admin, "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

    if (!isLoading) {
      if (!admin) {
        router.push("/login");
        return;
      }

      // Check basic user type first
      if (allowedUserTypes && !allowedUserTypes.includes(admin.userType)) {
        const redirectPath = getRedirectPath(admin.userType);
        router.push(redirectPath);
        return;
      }

      // Check for admin type restrictions
      if (admin.userType === "admin" && allowedAdminTypes) {
        if (
          !admin?.user?.adminType ||
          !allowedAdminTypes.includes(admin.user.adminType)
        ) {
          router.push("/admin");
          return;
        }
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

  // Show loader while auth state is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prevent rendering if not allowed
  if (
    !admin ||
    (allowedUserTypes && !allowedUserTypes.includes(admin.userType)) ||
    (admin.userType === "admin" &&
      allowedAdminTypes &&
      (!admin?.user?.adminType ||
        !allowedAdminTypes.includes(admin.user.adminType)))
  ) {
    return null;
  }

  return <>{children}</>;
}

// HOC wrapper for convenience
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedUserTypes?: string[],
  allowedAdminTypes?: ("super" | "normal")[]
) {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute
        allowedUserTypes={allowedUserTypes}
        allowedAdminTypes={allowedAdminTypes}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;

  return AuthenticatedComponent;
}
