// services/userService.ts
import { api } from "@/lib/AdminApiClient";

export interface UserFilter {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export interface UserUpdateData {
    email?: string;
    isBanned?: boolean;
    banReason?: string;
}

export const userService = {
    getAllUsers: async (filters: UserFilter = {}) => {
        return api.get("/users", { params: filters });
    },

    getUserById: async (userId: string) => {
        return api.get(`/users/${userId}`);
    },

    updateUser: async (userId: string, data: UserUpdateData) => {
        return api.put(`/users/${userId}`, data);
    },

    banUser: async (userId: string, reason: string) => {
        return api.put(`/users/${userId}`, {
            isBanned: true,
            banReason: reason
        });
    },

    unbanUser: async (userId: string) => {
        return api.put(`/users/${userId}`, {
            isBanned: false,
            banReason: ""
        });
    },
};