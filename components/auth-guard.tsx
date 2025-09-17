"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminUser } from "@/services/adminService";
import { useAdminAuth } from "@/context/AdminAuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
}

export function ProtectedRoute({
  children,
  allowedUserTypes,
}: ProtectedRouteProps) {
  const { admin, isLoading } = useAdminAuth(); // <-- renamed "user" to "admin"
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!admin) {
        router.push("/login");
        return;
      }

      if (allowedUserTypes && !allowedUserTypes.includes(admin.userType)) {
        // Redirect if admin user type is not allowed
        const redirectPath = getRedirectPath(admin.userType);
        router.push(redirectPath);
        return;
      }
    }
  }, [admin, isLoading, router, allowedUserTypes]);

  const getRedirectPath = (userType: string) => {
    switch (userType) {
      case "admin":
        return "/admin";
      case "business":
        return "/business-dashboard";
      case "individual":
      default:
        return "/dashboard";
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prevent rendering if no admin or not in allowed user types
  if (
    !admin ||
    (allowedUserTypes && !allowedUserTypes.includes(admin.userType))
  ) {
    return null;
  }

  return <>{children}</>;
}

// HOC version (alternative usage)
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedUserTypes?: string[]
) {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute allowedUserTypes={allowedUserTypes}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;
  return AuthenticatedComponent;
}
