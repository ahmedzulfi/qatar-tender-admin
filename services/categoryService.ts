import { api } from "@/lib/AdminApiClient";


export const getCategories = async () => {
    try {
        const res = await api.get("/api/categories");
        return res.data; // should be an array of categories
    } catch (error: any) {
        console.error(
            "Error fetching categories:",
            error.response?.data || error.message
        );
        throw error;
    }
};