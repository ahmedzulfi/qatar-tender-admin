// contexts/AdminAuthProvider.tsx
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
import { adminAuthService, AdminUser, AdminLoginData } from "@/utils/adminAuth";
import {
  getAdminTokenFromCookie,
  clearAdminTokens,
} from "@/utils/adminTokenHelpers";
import { api } from "@/lib/AdminApiClient";

interface AdminProfile {
  _id: string;
  email: string;
  userType: "admin";
  adminType: "super" | "normal";
  isVerified: boolean;
  permissions?: string[];
  // Add any additional profile fields you need
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  profile: AdminProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (
    data: AdminLoginData
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch admin profile:", err);
      setProfile(null);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);

      // Check if we have a valid admin token
      if (adminAuthService.isAuthenticated() && adminAuthService.isAdmin()) {
        const adminData = await adminAuthService.getCurrentAdmin();
        if (adminData) {
          setAdmin(adminData);
          await fetchProfile();
          return;
        }
      }

      // Try to refresh token if not authenticated
      const refreshSuccess = await adminAuthService.refreshToken();
      if (
        refreshSuccess &&
        adminAuthService.isAuthenticated() &&
        adminAuthService.isAdmin()
      ) {
        const adminData = await adminAuthService.getCurrentAdmin();
        if (adminData) {
          setAdmin(adminData);
          await fetchProfile();
          return;
        }
      }

      // Not authenticated
      setAdmin(null);
      setProfile(null);
    } catch (error) {
      console.error("Admin auth check failed:", error);
      setAdmin(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: AdminLoginData) => {
    setIsLoading(true);
    try {
      const result = await adminAuthService.login(data);

      if (result.success && result.user) {
        setAdmin(result.user);
        await fetchProfile();

        // Redirect based on admin type
        if (result.user.adminType === "super") {
          router.push("/admin/dashboard");
        } else {
          router.push("/admin/dashboard");
        }
      }

      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "An unexpected error occurred",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    adminAuthService.logout();
    setAdmin(null);
    setProfile(null);
  };

  // Initialize auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check auth when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (!isLoading && !admin) {
        checkAuth();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isLoading, admin]);

  const value: AdminAuthContextType = {
    admin,
    profile,
    isLoading,
    isAuthenticated: !!admin,
    isAdmin: adminAuthService.isAdmin(),
    isSuperAdmin: adminAuthService.isSuperAdmin(),
    login,
    logout,
    checkAuth,
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
