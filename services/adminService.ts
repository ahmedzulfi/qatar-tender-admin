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
export interface TenderOverTime {
  _id: string;
  total: number;
  active: number;
  closed: number;
  awarded: number;
  completed: number;
}

export interface BidsOverTime {
  _id: string;
  totalBids: number;
  averageBidsPerTender: number;
}

export interface TenderSizeMetrics {
  tenderMetrics: {
    _id: string;
    totalTenderSize: number;
    averageTenderSize: number;
    tenderCount: number;
  }[];
  bidMetrics: {
    _id: string;
    averageBidSize: number;
    totalBidAmount: number;
    bidCount: number;
  }[];
}

export interface AwardMetrics {
  _id: string;
  totalTenders: number;
  awardedTenders: number;
  awardPercentage: number;
}

export interface TimeToFirstBid {
  _id: string;
  averageTimeToFirstBid: number;
  tenderCount: number;
}

export interface UserMetrics {
  _id: string;
  individualUsers: number;
  businessUsers: number;
  totalNewUsers: number;
  totalActiveUsers: number;
  activeUserPercentage: number;
}

export interface RevenueOverTime {
  _id: string;
  totalRevenue: number;
  transactionCount: number;
  averageTransaction: number;
}

export interface CategoryDistribution {
  _id: string;
  tenderCount: number;
  averageTenderSize: number;
  totalTenderValue: number;
}

export interface BidderDistribution {
  _id: string;
  totalBids: number;
  averageBiddersPerTender: number;
  averageBidsPerTender: number;
}

export interface UserTypeDistribution {
  _id: string;
  individualTenders: number;
  businessTenders: number;
  individualValue: number;
  businessValue: number;
}

export interface AverageBidPerCategory {
  _id: string;
  averageBid: number;
  minBid: number;
  maxBid: number;
  bidCount: number;
}

export interface RatingMetrics {
  overall: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution?: number[];
  };
  businessCategoryRatings: {
    _id: {
      business: string;
      category: string;
    };
    averageRating: number;
    reviewCount: number;
    businessId: string;
  }[];
}

export interface AdminAnalyticsResponse {
  success: boolean;
  data: {
    tendersOverTime: TenderOverTime[];
    bidsOverTime: BidsOverTime[];
    tenderSizeMetrics: TenderSizeMetrics;
    awardMetrics: AwardMetrics[];
    timeToFirstBid: TimeToFirstBid[];
    userMetrics: UserMetrics[];
    revenueOverTime: RevenueOverTime[];
    categoryDistribution: CategoryDistribution[];
    bidderDistribution: BidderDistribution[];
    userTypeDistribution: UserTypeDistribution[];
    averageBidPerCategory: AverageBidPerCategory[];
    ratingMetrics: RatingMetrics;
  };
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  interval?: "day" | "week" | "month" | "year";
  category?: string;
}

export class AnalyticsService {
  async getAdminAnalytics(
    filters: AnalyticsFilters = {}
  ): Promise<AdminAnalyticsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.interval) params.append("interval", filters.interval);
      if (filters.category) params.append("category", filters.category);

      const queryString = params.toString();
      const url = `/api/admin/analytics/admin${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Analytics fetch error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch analytics data"
      );
    }
  }

  async getTenderAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.interval) params.append("interval", filters.interval);

      const queryString = params.toString();
      const url = `/api/admin/analytics/tenders${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Tender analytics error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch tender analytics"
      );
    }
  }

  async getBidAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.interval) params.append("interval", filters.interval);

      const queryString = params.toString();
      const url = `/api/admin/analytics/bids${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ Bid analytics error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch bid analytics"
      );
    }
  }

  async getUserAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.interval) params.append("interval", filters.interval);

      const queryString = params.toString();
      const url = `/api/admin/analytics/users${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error(
        "❌ User analytics error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch user analytics"
      );
    }
  }

  // Helper methods for specific analytics data
  async getCategoryPerformance(filters: AnalyticsFilters = {}) {
    try {
      const analytics = await this.getAdminAnalytics(filters);
      return analytics.data.categoryDistribution;
    } catch (error) {
      console.error("❌ Category performance fetch error:", error);
      throw error;
    }
  }

  async getRevenueTrends(filters: AnalyticsFilters = {}) {
    try {
      const analytics = await this.getAdminAnalytics(filters);
      return analytics.data.revenueOverTime;
    } catch (error) {
      console.error("❌ Revenue trends fetch error:", error);
      throw error;
    }
  }

  async getUserGrowthMetrics(filters: AnalyticsFilters = {}) {
    try {
      const analytics = await this.getAdminAnalytics(filters);
      return analytics.data.userMetrics;
    } catch (error) {
      console.error("❌ User growth metrics fetch error:", error);
      throw error;
    }
  }

  async getBidPerformance(filters: AnalyticsFilters = {}) {
    try {
      const analytics = await this.getAdminAnalytics(filters);
      return {
        bidsOverTime: analytics.data.bidsOverTime,
        averageBidPerCategory: analytics.data.averageBidPerCategory,
        bidderDistribution: analytics.data.bidderDistribution,
      };
    } catch (error) {
      console.error("❌ Bid performance fetch error:", error);
      throw error;
    }
  }

  async getTenderPerformance(filters: AnalyticsFilters = {}) {
    try {
      const analytics = await this.getAdminAnalytics(filters);
      return {
        tendersOverTime: analytics.data.tendersOverTime,
        awardMetrics: analytics.data.awardMetrics,
        tenderSizeMetrics: analytics.data.tenderSizeMetrics,
      };
    } catch (error) {
      console.error("❌ Tender performance fetch error:", error);
      throw error;
    }
  }

  // Method to get summary statistics for dashboard cards
  async getDashboardSummary(filters: AnalyticsFilters = {}) {
    try {
      const analytics = await this.getAdminAnalytics(filters);

      const {
        tendersOverTime,
        bidsOverTime,
        userMetrics,
        revenueOverTime,
        awardMetrics,
      } = analytics.data;

      // Calculate summary statistics
      const totalTenders = tendersOverTime.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const totalBids = bidsOverTime.reduce(
        (sum, item) => sum + item.totalBids,
        0
      );
      const totalUsers = userMetrics.reduce(
        (sum, item) => sum + item.totalNewUsers,
        0
      );
      const totalRevenue = revenueOverTime.reduce(
        (sum, item) => sum + item.totalRevenue,
        0
      );

      const currentPeriod = tendersOverTime[tendersOverTime.length - 1];
      const activeTenders = currentPeriod?.active || 0;
      const awardedTenders = awardMetrics.reduce(
        (sum, item) => sum + item.awardedTenders,
        0
      );

      return {
        totalTenders,
        totalBids,
        totalUsers,
        totalRevenue,
        activeTenders,
        awardedTenders,
        awardRate:
          awardedTenders > 0 ? (awardedTenders / totalTenders) * 100 : 0,
      };
    } catch (error) {
      console.error("❌ Dashboard summary fetch error:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();

export class AdminService {
  private analyticsService = new AnalyticsService();

  // Analytics methods
  async getAnalytics(filters: AnalyticsFilters = {}) {
    return this.analyticsService.getAdminAnalytics(filters);
  }

  async getTenderAnalytics(filters: AnalyticsFilters = {}) {
    return this.analyticsService.getTenderAnalytics(filters);
  }

  async getBidAnalytics(filters: AnalyticsFilters = {}) {
    return this.analyticsService.getBidAnalytics(filters);
  }

  async getUserAnalytics(filters: AnalyticsFilters = {}) {
    return this.analyticsService.getUserAnalytics(filters);
  }

  async getDashboardSummary(filters: AnalyticsFilters = {}) {
    return this.analyticsService.getDashboardSummary(filters);
  }

  async getCategoryPerformance(filters: AnalyticsFilters = {}) {
    return this.analyticsService.getCategoryPerformance(filters);
  }

  async getRevenueTrends(filters: AnalyticsFilters = {}) {
    return this.analyticsService.getRevenueTrends(filters);
  }

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
