import { jwtDecode } from "jwt-decode";
import {
  setTokenCookie,
  getTokenFromCookie,
  clearTokens,
} from "@/utils/tokenHelpers";
import { api } from "@/lib/apiClient";

export interface User {
  _id: string;
  email: string;
  userType: "individual" | "business" | "admin";
  isVerified: boolean;
  adminType?: string;
  permissions?: string[];
  isDocumentVerified?: string;
  profile?: any;
}

export interface RegisterData {
  email: string;
  password: string;
  userType: "individual" | "business";
  phone: string;
  fullName?: string;
  companyName?: string;
}

class AuthService {
  async register(userData: RegisterData) {
    try {
      const response = await api.post("/api/users/register", userData);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await api.post("/api/users/login", { email, password });
      const { accessToken, ...userData } = response.data;

      if (accessToken) {
        setTokenCookie(accessToken);
        return { success: true, user: userData };
      }

      return { success: false, error: "No access token received" };
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        // Backend returned an error response
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = "Invalid credentials or account not verified.";
        } else if (error.response.status >= 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        // No response from backend
        errorMessage =
          "No response from server. Check your network connection.";
      } else {
        // Something went wrong setting up the request
        errorMessage = error.message || "Unexpected error occurred.";
      }

      return { success: false, error: errorMessage };
    }
  }

  async logout() {
    try {
      await api.post("/api/users/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get("/api/users/profile");
      return response.data;
    } catch {
      return null;
    }
  }

  async forgotPassword(email: string) {
    try {
      const response = await api.post("/api/users/forgot-password", { email });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Request failed",
      };
    }
  }

  async verifyResetCode(email: string, code: string) {
    try {
      const response = await api.post("/api/users/verify-reset-code", {
        email,
        code,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Invalid code",
      };
    }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    try {
      const response = await api.put("/api/users/reset-password", {
        email,
        code,
        newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Reset failed",
      };
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const response = await api.post("/api/users/resend-verification", {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Resend failed",
      };
    }
  }

  isAuthenticated(): boolean {
    const token = getTokenFromCookie();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      return decoded.exp! > now;
    } catch {
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await api.post(
        "/api/users/refresh-token",
        {},
        { withCredentials: true }
      );
      if (response.data.accessToken) {
        setTokenCookie(response.data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await api.patch("/api/users/change-password", {
        currentPassword,
        newPassword,
      });

      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to change password",
      };
    }
  }
}

export const authService = new AuthService();
