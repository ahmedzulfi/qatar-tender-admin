// contexts/AuthProvider.js (or wherever your AuthProvider is located)
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
import { authService, RegisterData, User } from "@/utils/auth";
import { api } from "@/lib/apiClient";
import socketService from "@/lib/socket"; // Import our socket service
import { getTokenFromCookie } from "@/utils/tokenHelpers";

// Profile type (based on your backend schema)
interface Profile {
  _id: string;
  user: string;
  phone?: string;
  fullName?: string;
  companyName?: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  userType?: "individual" | "business" | "admin";
  createdAt?: string;
  updatedAt?: string;

  // ✅ Add virtuals
  totalTenders?: number;
  activeTenders?: number;
  rejectedTenders?: number;
  completedTenders?: number;
  awardedTenders?: number;
  totalSpent?: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;

  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => void;
  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyResetCode: (
    email: string,
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ✅ Fetch profile block using api instance
  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profiles"); // use global api
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setProfile(null);
    }
  };

  // ✅ Check auth (and also load profile if logged in)
  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          await fetchProfile(); // get profile after user
          return;
        }
      }

      const refreshSuccess = await authService.refreshToken();
      if (refreshSuccess) {
        const userData = await authService.getCurrentUser();
        if (userData) {
          setUser(userData);
          await fetchProfile();
          return;
        }
      }

      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize socket connection when user is authenticated
  const initializeSocketConnection = useCallback(() => {
    if (user && user._id) {
      console.log(
        "AuthProvider: Initializing socket connection for user:",
        user._id
      );

      // Get the auth token (adjust based on how your authService stores it)
      const token = getTokenFromCookie(); // Make sure authService has getToken()

      if (token) {
        // Connect socket with the token for authentication
        socketService.connect(token);

        // Join user's specific room after a short delay to ensure connection
        setTimeout(() => {
          socketService.joinUserRoom(user._id);
        }, 500); // Adjust delay if needed
      } else {
        console.warn(
          "AuthProvider: No auth token found, cannot connect socket"
        );
      }
    }
  }, [user]); // Re-run if user changes

  // Disconnect socket
  const disconnectSocket = useCallback(() => {
    console.log("AuthProvider: Disconnecting socket");
    socketService.disconnect();
  }, []);

  // Run on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle socket connection when user state changes
  useEffect(() => {
    if (user) {
      initializeSocketConnection();
    } else {
      disconnectSocket();
    }

    // Cleanup function on unmount or before user changes
    return () => {
      disconnectSocket();
    };
  }, [user, initializeSocketConnection, disconnectSocket]); // Dependencies

  // Re-check when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (!isLoading && !user) {
        checkAuth();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isLoading, user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);

      if (result.success && result.user) {
        setUser(result.user);
        await fetchProfile(); // ✅ fetch profile after login
        const redirectPath = getRedirectPath(result.user.userType);
        router.push(redirectPath);
      }

      return result;
    } catch (error: any) {
      // Log raw error for debugging (dev only)
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", error);
      }

      return {
        success: false,
        error: error?.message || "An unexpected error occurred",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    authService.logout();
    disconnectSocket(); // Explicitly disconnect on logout
  };

  const forgotPassword = async (email: string) => {
    return await authService.forgotPassword(email);
  };

  const verifyResetCode = async (email: string, code: string) => {
    return await authService.verifyResetCode(email, code);
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    return await authService.resetPassword(email, code, newPassword);
  };

  const resendVerificationEmail = async (email: string) => {
    return await authService.resendVerificationEmail(email);
  };

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

  const value: AuthContextType = {
    user,
    profile, // ✅ profile now globally available
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
