import { api } from "@/lib/apiClient";
import { User } from "@/utils/auth";
import { clearTokens, getTokenFromCookie, setTokenCookie } from "@/utils/tokenHelpers";
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
            const response = await api.post("/api/admin/login", credentials);
            const { accessToken, user, ...rest } = response.data;

            if (accessToken) {
                // Use the same helper function as regular auth
                setTokenCookie(accessToken);

                return {
                    success: true,
                    user: user as AdminUser,
                    ...(process.env.USE_COOKIES !== "true" && { refreshToken: rest.refreshToken })
                };
            }
            return { success: false, error: "No access token received" };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Login failed. Please try again.",
            };
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

    async getCurrentAdmin(): Promise<AdminUser | null> {
        try {
            const response = await api.get("/api/users/profile");
            return response.data as AdminUser;
        } catch {
            return null;
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

    // User management
    async getUsers(params: UserListParams = {}) {
        try {
            const response = await api.get("/api/admin/users", { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to fetch users"
            };
        }
    }

    async editUser(userId: string, data: { email?: string; isBanned?: boolean; banReason?: string }) {
        try {
            const response = await api.put(`/api/admin/users/${userId}`, data);
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to update user"
            };
        }
    }

    // Admin management (super admin only)
    async createAdmin(email: string) {
        try {
            const response = await api.post("/api/admin/admins", { email });
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to create admin"
            };
        }
    }

    async deleteAdmin(adminId: string) {
        try {
            const response = await api.delete(`/api/admin/admins/${adminId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to delete admin"
            };
        }
    }

    // Tender management
    async getTenders(params: TenderListParams = {}) {
        try {
            const response = await api.get("/api/admin/tenders", { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to fetch tenders"
            };
        }
    }

    async closeTender(tenderId: string, params: CloseTenderParams) {
        try {
            const response = await api.put(`/api/admin/tenders/${tenderId}/close`, params);
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to close tender"
            };
        }
    }

    async deleteTender(tenderId: string) {
        try {
            const response = await api.delete(`/api/admin/tenders/${tenderId}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to delete tender"
            };
        }
    }

    // Admin activities (super admin only)
    async getAdminActivities(params: {
        page?: number;
        limit?: number;
        adminId?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
    } = {}) {
        try {
            const response = await api.get("/api/admin/activities", { params });
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || "Failed to fetch activities"
            };
        }
    }
}

export const adminService = new AdminService();