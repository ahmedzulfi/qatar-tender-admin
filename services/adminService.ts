import { api } from "@/lib/apiClient";
import { User } from "@/utils/auth";
import {
  clearTokens,
  getTokenFromCookie,
  setTokenCookie,
} from "@/utils/tokenHelpers";
import { jwtDecode } from "jwt-decode";

export interface AdminLoginCredentials {
  email: string;
  password: string;
  securityCode: string;
}

export interface AdminUser {
  _id: string;
  email: string;
  userType: "admin";
  adminType: "super" | "normal";
  isVerified: boolean;
  permissions?: string[];
}

export interface AdminActivity {
  _id: string;
  adminId: {
    _id: string;
    email: string;
  };
  adminEmail: string;
  action: string;
  targetId: string;
  targetModel: string;
  details: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface TenderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface CloseTenderParams {
  reason: string;
}

export class AdminService {
  async login(credentials: AdminLoginCredentials) {
    try {
      console.log("🔑 Logging in with credentials:", credentials);
      const response = await api.post("/api/admin/login", credentials);
      console.log("✅ Login response:", response.data);

      const { accessToken, user, ...rest } = response.data;

      if (accessToken) {
        setTokenCookie(accessToken);
        return {
          success: true,
          user: user as AdminUser,
          ...(process.env.USE_COOKIES !== "true" && {
            refreshToken: rest.refreshToken,
          }),
        };
      }
      return { success: false, error: "No access token received" };
    } catch (error: any) {
      console.error("❌ Login error:", error.response?.data || error.message);
      return {
        success: false,
        error:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  }

  async logout() {
    try {
      console.log("🚪 Logging out...");
      const response = await api.post("/api/users/logout");
      console.log("✅ Logout response:", response.data);
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      console.log("👤 Fetching current admin profile...");
      const response = await api.get("/api/users/profile");
      console.log("✅ Current admin profile:", response.data);
      return response.data as AdminUser;
    } catch (error) {
      console.error("❌ Failed to fetch current admin:", error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = getTokenFromCookie();
    console.log("🔍 Checking authentication with token:", token);
    if (!token) return false;

    try {
      const decoded = jwtDecode<any>(token);
      const now = Date.now() / 1000;
      console.log("📜 Decoded token:", decoded);
      return decoded.exp! > now;
    } catch (error) {
      console.error("❌ Token decode failed:", error);
      return false;
    }
  }

  // User management
  async getUsers(params: UserListParams = {}) {
    try {
      console.log("📂 Fetching users with params:", params);
      const response = await api.get("/api/admin/users", { params });
      console.log("✅ Users fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("❌ Failed to fetch users:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch users",
      };
    }
  }

  async editUser(
    userId: string,
    data: { email?: string; isBanned?: boolean; banReason?: string }
  ) {
    try {
      console.log(`✏️ Editing user ${userId} with data:`, data);
      const response = await api.put(`/api/admin/users/${userId}`, data);
      console.log("✅ User updated:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("❌ Failed to update user:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update user",
      };
    }
  }

  // Admin management (super admin only)
  async createAdmin(email: string) {
    try {
      console.log("➕ Creating admin with email:", email);
      const response = await api.post("/api/admin/admins", { email });
      console.log("✅ Admin created:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to create admin:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create admin",
      };
    }
  }

  async deleteAdmin(adminId: string) {
    try {
      console.log(`🗑️ Deleting admin with id: ${adminId}`);
      const response = await api.delete(`/api/admin/admins/${adminId}`);
      console.log("✅ Admin deleted:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to delete admin:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete admin",
      };
    }
  }

  // Tender management
  async getTenders(params: TenderListParams = {}) {
    try {
      console.log("📂 Fetching tenders with params:", params);
      const response = await api.get("/api/admin/tenders", { params });
      console.log("✅ Tenders fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch tenders:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch tenders",
      };
    }
  }

  async closeTender(tenderId: string, params: CloseTenderParams) {
    try {
      console.log(`🔒 Closing tender ${tenderId} with params:`, params);
      const response = await api.put(
        `/api/admin/tenders/${tenderId}/close`,
        params
      );
      console.log("✅ Tender closed:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to close tender:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to close tender",
      };
    }
  }

  async deleteTender(tenderId: string) {
    try {
      console.log(`🗑️ Deleting tender with id: ${tenderId}`);
      const response = await api.delete(`/api/admin/tenders/${tenderId}`);
      console.log("✅ Tender deleted:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to delete tender:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to delete tender",
      };
    }
  }

  // Admin activities (super admin only)
  async getAdminActivities(
    params: {
      page?: number;
      limit?: number;
      adminId?: string;
      action?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    try {
      console.log("📂 Fetching admin activities with params:", params);
      const response = await api.get("/api/admin/activities", { params });
      console.log("✅ Admin activities fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch admin activities:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch activities",
      };
    }
  }

  async getBids(
    params: Record<string, any> = {}
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log("📂 Fetching bids with params:", params);
      const response = await api.get("/api/admin/bids", { params });
      console.log("✅ Bids fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("❌ Failed to fetch bids:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch bids",
      };
    }
  }
}

export const adminService = new AdminService();
