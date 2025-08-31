// services/adminManagementService.ts

import {api} from "@/lib/AdminApiClient";

export interface CreateAdminData {
    email: string;
}

export const adminManagementService = {
    getAllAdmins: async () => {
        return api.get("/admins");
    },

    createAdmin: async (data: CreateAdminData) => {
        return api.post("/admins", data);
    },

    deleteAdmin: async (adminId: string) => {
        return api.delete(`/admins/${adminId}`);
    },

    getAdminActivities: async (params: {
        page?: number;
        limit?: number;
        adminId?: string;
        action?: string;
        startDate?: string;
        endDate?: string;
    } = {}) => {
        return api.get("/activities", { params });
    },
};