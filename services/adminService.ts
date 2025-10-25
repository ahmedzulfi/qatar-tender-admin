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
  user: any;
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
export interface AnalyticsStats {
  totalTenders: number; // add this inside stats
  totalUsers: number;
  activeTenders: number;
  completedTenders: number;
  pendingBids: number;
  successfulBids: number;
  failedBids: number;
  totalRevenue: number;
  platformFees: number;
  newUsersToday: number;
  tendersPostedToday: number;
  bidsSubmittedToday: number;
}

export interface DailyAnalytics {
  date: string;
  usersCreated: number;
  tendersPosted: number;
  bidsPlaced: number;
  paymentsProcessed: number;
  revenue: number;
}

export interface CategoryDistribution {
  name: string;
  count: number;
  percentage: number;
}

export interface BidSuccessRate {
  totalBids: number;
  acceptedBids: number;
  rejectedBids: number;
  successRate: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  profit: number;
}

export interface TenderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface UserGrowthData {
  month: string;
  newUsers: number;
  retainedUsers: number;
}

export interface BidAnalysis {
  avgBidValue: number;
  minBid: number;
  maxBid: number;
  mostActiveCategory: string;
  bidConversionRate: number;
}

export interface PlatformAnalytics {
  stats: AnalyticsStats;
  daily: DailyAnalytics[];
  categories: CategoryDistribution[];
  bidSuccess: BidSuccessRate;
  revenue: RevenueData[];
  tenderStatus: TenderStatusBreakdown[];
  userGrowth: UserGrowthData[];
  bidAnalysis: BidAnalysis;
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

  // ====== NEWLY ADDED ENDPOINTS BELOW ======

  /**
   * Creates the initial super admin account
   * @param email - Super admin email (must match SUPER_ADMIN_EMAIL env var)
   * @param password - Initial password for super admin
   * @returns Success status and response data
   */
  async createSuperAdmin(email: string, password: string) {
    try {
      console.log("🔐 Creating super admin with email:", email);
      const response = await api.post("/api/admin/create-super-admin", {
        email,
        password,
      });
      console.log("✅ Super admin created:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to create super admin:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to create super admin",
      };
    }
  }

  /**
   * Verifies super admin's email using verification token
   * @param token - Email verification token
   * @returns Success status and verification result
   */
  async verifySuperAdminEmail(token: string) {
    try {
      console.log(`📧 Verifying super admin email with token: ${token}`);
      const response = await api.get(`/api/admin/verify-email/${token}`);
      console.log("✅ Super admin email verified:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to verify super admin email:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to verify super admin email",
      };
    }
  }

  // ====== EXISTING ENDPOINTS (UNMODIFIED) ======

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
      console.log(`✏️ Editing user ${userId} with `, data);
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
  async getUser(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log(`🔍 Fetching user with ID: ${userId}`);
      const response = await api.get(`/api/admin/users/${userId}`);
      console.log("✅ User fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("❌ Failed to fetch user:", error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch user",
      };
    }
  }
  async getTenderById(tenderId: string): Promise<{
    tender: any;
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log(`🔍 Fetching tender with ID: ${tenderId}`);
      const response = await api.get(`/api/admin/tenders/${tenderId}`);
      console.log("✅ Tender fetched:", response.data);
      return {
        tender: response.data,
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch tender:",
        error.response?.data || error
      );
      return {
        tender: null,
        success: false,
        error: error.response?.data?.message || "Failed to fetch tender",
      };
    }
  }
  async universalSearch(search: string) {
    try {
      console.log("🔍 Performing universal admin search with query:", search);
      const response = await api.get("/api/admin/search", {
        params: { search },
      });
      console.log("✅ Universal search results:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to perform universal search:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to perform universal search",
      };
    }
  }
  // async universalSearch(search: string) {
  //   try {
  //     console.log("🔍 Performing universal admin search with query:", search);
  //     const response = await api.get("/api/admin/search", {
  //       params: { q: search },
  //     });
  //     console.log("✅ Universal search results:", response.data);
  //     return {
  //       success: true,
  //       data: response.data,
  //     };
  //   } catch (error: any) {
  //     console.error(
  //       "❌ Failed to perform universal search:",
  //       error.response?.data || error
  //     );
  //     return {
  //       success: false,
  //       error:
  //         error.response?.data?.message || "Failed to perform universal search",
  //     };
  //   }
  // }

  async getPayments(params: Record<string, any> = {}) {
    try {
      console.log("📂 Fetching payments with params:", params);
      const response = await api.get("/api/admin/payments", { params });
      console.log("✅ Payments fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch payments:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch payments",
      };
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      console.log(`🔍 Fetching payment details for ${paymentId}`);
      const response = await api.get(`/api/admin/payments/${paymentId}`);
      console.log("✅ Payment details:", response.data);
      return {
        success: true,
        data: response.data.payment,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch payment details:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch payment details",
      };
    }
  }
  async getPlatformAnalytics(): Promise<{
    success: boolean;
    data?: PlatformAnalytics;
    error?: string;
  }> {
    try {
      console.log("📊 Fetching platform analytics...");
      const response = await api.get("/api/admin/analytics/platform");

      console.log("✅ Analytics data fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch analytics:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch analytics data",
      };
    }
  }

  /**
   * Get overall statistics for dashboard
   */
  async getDashboardStats(): Promise<{
    success: boolean;
    data?: AnalyticsStats;
    error?: string;
  }> {
    try {
      console.log("📈 Fetching dashboard statistics...");
      const response = await api.get("/api/admin/analytics/stats");

      console.log("✅ Dashboard stats fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch dashboard stats:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch dashboard statistics",
      };
    }
  }

  /**
   * Get user growth data by month
   */
  async getUserGrowth(): Promise<{
    success: boolean;
    data?: UserGrowthData[];
    error?: string;
  }> {
    try {
      console.log("👥 Fetching user growth data...");
      const response = await api.get("/api/admin/analytics/user-growth");

      console.log("✅ User growth data:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch user growth:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch user growth data",
      };
    }
  }

  /**
   * Get tender posting and bidding trends
   */
  async getTenderTrends(): Promise<{
    success: boolean;
    data?: DailyAnalytics[];
    error?: string;
  }> {
    try {
      console.log("📈 Fetching tender trends...");
      const response = await api.get("/api/admin/analytics/tender-trends");

      console.log("✅ Tender trends fetched:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch tender trends:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch tender trends",
      };
    }
  }

  /**
   * Get category distribution data
   */
  async getCategoryDistribution(): Promise<{
    success: boolean;
    data?: CategoryDistribution[];
    error?: string;
  }> {
    try {
      console.log("📋 Fetching category distribution...");
      const response = await api.get("/api/admin/analytics/categories");

      console.log("✅ Category distribution:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch category distribution:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch category distribution",
      };
    }
  }

  /**
   * Get bid success rate data
   */
  async getBidSuccessRate(): Promise<{
    success: boolean;
    data?: BidSuccessRate;
    error?: string;
  }> {
    try {
      console.log("🎯 Fetching bid success rate...");
      const response = await api.get("/api/admin/analytics/bid-success");

      console.log("✅ Bid success rate:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch bid success rate:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message || "Failed to fetch bid success rate",
      };
    }
  }

  /**
   * Get revenue over time
   */
  async getRevenueData(): Promise<{
    success: boolean;
    data?: RevenueData[];
    error?: string;
  }> {
    try {
      console.log("💰 Fetching revenue data...");
      const response = await api.get("/api/admin/analytics/revenue");

      console.log("✅ Revenue data:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch revenue data:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch revenue data",
      };
    }
  }

  /**
   * Get tender status breakdown
   */
  async getTenderStatusBreakdown(): Promise<{
    success: boolean;
    data?: TenderStatusBreakdown[];
    error?: string;
  }> {
    try {
      console.log("📊 Fetching tender status breakdown...");
      const response = await api.get("/api/admin/analytics/tender-status");

      console.log("✅ Tender status breakdown:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch tender status breakdown:",
        error.response?.data || error
      );
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Failed to fetch tender status breakdown",
      };
    }
  }

  /**
   * Get bid analysis data
   */
  async getBidAnalysis(): Promise<{
    success: boolean;
    data?: BidAnalysis;
    error?: string;
  }> {
    try {
      console.log("🔍 Fetching bid analysis...");
      const response = await api.get("/api/admin/analytics/bid-analysis");

      console.log("✅ Bid analysis:", response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Failed to fetch bid analysis:",
        error.response?.data || error
      );
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch bid analysis",
      };
    }
  }
}

export const adminService = new AdminService();
