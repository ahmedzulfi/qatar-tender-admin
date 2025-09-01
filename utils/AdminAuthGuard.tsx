// components/AdminAuthGuard.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthProvider";

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  children,
  requireSuperAdmin = false
}) => {
  const { isAuthenticated, isLoading, isSuperAdmin, checkAuth } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      
      // If not authenticated, redirect to login
      if (!isAuthenticated && !isLoading) {
        router.push("/login");
      }
      
      // If super admin required but user isn't super admin
      if (requireSuperAdmin && isAuthenticated && !isSuperAdmin && !isLoading) {
        router.push("/admin/dashboard");
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, isSuperAdmin, router, checkAuth, requireSuperAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You need super admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};