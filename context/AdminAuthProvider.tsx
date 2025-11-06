"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef, // Added
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
import socketService from "@/lib/socket"; // Added

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

  // Added: Tab sync & reload suppression
  const tabIdRef = useRef(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  const suppressReloadRef = useRef(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profiles");
      const profile = res.data;
      // If the user is not admin, log them out
      if (res?.data.user.userType !== "admin") {
        console.warn("Non-admin user detected, logging out...", res);
        router.push("/login");
        return;
      }
      setAdmin(profile);
      console.log("Fetched profile:", profile);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setAdmin(null);
    }
  };
  useEffect(() => {
    if (admin && admin.userType !== "admin") {
      console.warn(
        "Non-admin user detected in admin context. Forcing logout..."
      );
      logout();
      router.push("/login");
    }
  }, [admin, router]);

  const checkAuth = async () => {
    try {
      if (adminService.isAuthenticated()) {
        const adminData = await adminService.getCurrentAdmin();
        if (adminData) {
          setAdmin(adminData);
          fetchProfile();
          console.log("Admin data found", adminData);
          return;
        }
      }

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
      if (result.success && "user" in result && result.user) {
        setAdmin(result.user);

        // Added: Socket connection after login
        suppressReloadRef.current = true;
        setTimeout(() => (suppressReloadRef.current = false), 5500);

        const token = getTokenFromCookie();
        if (token) {
          socketService.connect(token);
          socketService
            .getSocket()
            ?.emit("join-user-room", { userId: result.user._id });
        }

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
    socketService.disconnect(); // Added
  };

  // Added: Socket connection lifecycle
  const initializeSocketConnection = useCallback(() => {
    if (!admin?._id || socketService.isConnected()) return;

    const token = getTokenFromCookie();
    if (!token) return;

    socketService.connect(token);
    socketService.joinUserRoom(admin._id);

    const handleForceLogout = () => {
      if (suppressReloadRef.current) return;
      console.log("Server force-logout → reload");
      window.location.reload();
    };

    const socket = socketService.getSocket();
    socket?.on("force-logout", handleForceLogout);

    return () => {
      socket?.off("force-logout", handleForceLogout);
    };
  }, [admin]);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // // Redirect if not authenticated
  // useEffect(() => {
  //   if (
  //     !isLoading &&
  //     !admin &&
  //     typeof window !== "undefined" &&
  //     window.location.pathname.startsWith("/admin")
  //   ) {
  //     if (window.location.pathname !== "/login") {
  //       router.push("/login");
  //     }
  //   }
  // }, [isLoading, admin, router]);

  // Added: Socket lifecycle
  useEffect(() => {
    const cleanup = admin ? initializeSocketConnection() : undefined;
    if (!admin) socketService.disconnect();
    return () => {
      cleanup?.();
      if (!admin) socketService.disconnect();
    };
  }, [admin, initializeSocketConnection]);
  useEffect(() => {
    if (!isLoading && !admin) {
      // Only redirect if we're on a protected route
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin")
      ) {
        router.push("/login");
      }
    }
  }, [isLoading, admin, router]);

  // Added: Re-check auth on window focus
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleFocus = () => {
      if (!isLoading && !admin) {
        clearTimeout(timeout);
        timeout = setTimeout(() => checkAuth(), 200);
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isLoading, admin]);

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
