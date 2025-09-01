// services/adminService.ts
import { api } from "@/lib/AdminApiClient";

export const adminService = {
    // Login
    login: async (email: string, password: string, securityCode: string) => {
        return api.post("/login", { email, password, securityCode });
    },

    // Profile
    getProfile: async () => {
        return api.get("/profile");
    },

    // Super Admin only
    createSuperAdmin: async (email: string, password: string) => {
        return api.post("/create-super-admin", { email, password });
    },

    verifySuperAdminEmail: async (token: string) => {
        return api.get(`/verify-email/${token}`);
    },
};