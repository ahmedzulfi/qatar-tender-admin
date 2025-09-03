"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { adminService, AdminUser } from "@/services/adminService";
import {
  getTokenFromCookie,
  setTokenCookie,
  clearTokens,
} from "@/utils/tokenHelpers";
import { api } from "@/lib/apiClient";
import { authService } from "@/utils/auth";

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    securityCode: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profiles"); // use global api
      setAdmin(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setAdmin(null);
    }
  };
  const checkAuth = async () => {
    try {
      // First check if we have a valid access token
      if (adminService.isAuthenticated()) {
        const adminData = await adminService.getCurrentAdmin();
        if (adminData) {
          setAdmin(adminData);
          fetchProfile();
          console.log("Admin data found", adminData);
          return;
        }
      }

      // Try to refresh the token
      const refreshSuccess = await authService.refreshToken();
      if (refreshSuccess) {
        const adminData = await adminService.getCurrentAdmin();
        if (adminData) {
          setAdmin(adminData);
          await fetchProfile();
          return;
        }
      }

      setAdmin(null);
    } catch (error) {
      console.error("Admin auth check failed:", error);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    securityCode: string
  ) => {
    setIsLoading(true);
    try {
      const result = await adminService.login({
        email,
        password,
        securityCode,
      });
      console.log(
        "Login successful, setting tokens",
        result,
        email,
        password,
        securityCode
      );
      if (result.success && result.user) {
        setAdmin(result.user);
        router.push("/admin");
        return { success: true };
      }
      return {
        success: false,
        error: result.error || "Login failed. Please check your credentials.",
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred during login",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    adminService.logout();
    setAdmin(null);
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (
      !isLoading &&
      !admin &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin")
    ) {
      if (window.location.pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [isLoading, admin, router]);

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    isAuthenticated: !!admin,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Custom hook
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
