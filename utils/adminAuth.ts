// utils/adminAuth.ts
import { api } from "@/lib/AdminApiClient";
import {
    setAdminTokenCookie,
    getAdminTokenFromCookie,
    clearAdminTokens,
} from "@/utils/adminTokenHelpers";
import { jwtDecode } from "jwt-decode";

export interface AdminUser {
    _id: string;
    email: string;
    userType: "admin";
    adminType: "super" | "normal";
    isVerified: boolean;
    permissions?: string[];
}

export interface AdminLoginData {
    email: string;
    password: string;
    securityCode: string;
}

class AdminAuthService {
    async login(data: AdminLoginData) {
        try {
            const response = await api.post("/login", data);
            const { accessToken, refreshToken, ...userData } = response.data;

            if (accessToken) {
                setAdminTokenCookie(accessToken);
                return { success: true, user: userData };
            }

            return { success: false, error: "No access token received" };
        } catch (error: any) {
            let errorMessage = "Login failed. Please try again.";

            if (error.response) {
                if (error.response.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.status === 401) {
                    if (error.response.data.message.includes("security code")) {
                        errorMessage = "Invalid security code";
                    } else {
                        errorMessage = "Invalid credentials or account not verified.";
                    }
                }
            } else if (error.request) {
                errorMessage = "No response from server. Check your network connection.";
            }

            return { success: false, error: errorMessage };
        }
    }

    async logout() {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Admin logout error:", error);
        } finally {
            clearAdminTokens();
            if (typeof window !== "undefined") {
                window.location.href = "/admin/login";
            }
        }
    }

    async getCurrentAdmin(): Promise<AdminUser | null> {
        try {
            const response = await api.get("/profile");
            return response.data;
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        const token = getAdminTokenFromCookie();
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
                setAdminTokenCookie(response.data.accessToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Admin token refresh failed:", error);
            return false;
        }
    }

    isAdmin(): boolean {
        const token = getAdminTokenFromCookie();
        if (!token) return false;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.userType === "admin";
        } catch {
            return false;
        }
    }

    isSuperAdmin(): boolean {
        const token = getAdminTokenFromCookie();
        if (!token) return false;

        try {
            const decoded: any = jwtDecode(token);
            return decoded.userType === "admin" && decoded.adminType === "super";
        } catch {
            return false;
        }
    }
}

export const adminAuthService = new AdminAuthService();