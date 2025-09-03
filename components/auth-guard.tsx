"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: string[];
}

export function ProtectedRoute({
  children,
  allowedUserTypes,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
        return;
      }

      if (allowedUserTypes && !allowedUserTypes.includes(user.userType)) {
        // Redirect to appropriate dashboard if user type not allowed
        const redirectPath = getRedirectPath(user.userType);
        router.push(redirectPath);
        return;
      }
    }
  }, [user, isLoading, router, allowedUserTypes]);

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

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if no user or wrong user type
  if (
    !user ||
    (allowedUserTypes && !allowedUserTypes.includes(user.userType))
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
