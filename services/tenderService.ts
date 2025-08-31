// services/tenderService.ts
import { api } from "@/lib/AdminApiClient";

export interface TenderFilter {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
}

export interface CloseTenderData {
    reason: string;
}

export const tenderService = {
    getAllTenders: async (filters: TenderFilter = {}) => {
        return api.get("/tenders", { params: filters });
    },

    getTenderById: async (tenderId: string) => {
        return api.get(`/tenders/${tenderId}`);
    },

    closeTender: async (tenderId: string, data: CloseTenderData) => {
        return api.put(`/tenders/${tenderId}/close`, data);
    },

    deleteTender: async (tenderId: string) => {
        return api.delete(`/tenders/${tenderId}`);
    },

    // Additional tender management functions as needed
};