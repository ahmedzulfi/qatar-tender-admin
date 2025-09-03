// services/tenderService.ts
import { api } from "@/lib/apiClient";

// Fetch tenders for a specific user
export const getUserTenders = async (userId: string) => {
  try {
    const res = await api.get(`api/tenders/user/${userId}`);
    return res.data;
  } catch (error: any) {
    console.error(
      "Error fetching user tenders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getTender = async (id: string) => {
  try {
    const res = await api.get(`/api/tenders/${id}`);
    return res.data;
  } catch (error: any) {
    console.error(
      "Error fetching tender:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * updateData can be FormData (for file upload) or a plain object.
 * If passing FormData, caller must ensure correct fields appended.
 */
export const updateTender = async (
  id: string,
  updateData: FormData | object
) => {
  try {
    if (updateData instanceof FormData) {
      // override header for multipart
      const res = await api.put(`/api/tenders/${id}`, updateData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } else {
      const res = await api.put(`/api/tenders/${id}`, updateData);
      return res.data;
    }
  } catch (error: any) {
    console.error(
      "Error updating tender:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateTenderStatus = async (id: string, status: string) => {
  try {
    const res = await api.put(`/api/tenders/${id}/status`, { status });
    return res.data; // updated tender object
  } catch (error: any) {
    console.error(
      "Error updating tender status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createTender = async (payload: any) => {
  const response = await api.post("/api/tenders", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

type TendersParams = {
  status?: string;
  category?: string;
  search?: string;
};

export const getTenders = async (params?: TendersParams) => {
  try {
    const res = await api.get("/api/tenders", { params });
    return res.data;
  } catch (error: any) {
    console.error(
      "Error fetching tenders:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const awardTender = async (id: string, bidId: string) => {
  try {
    const res = await api.put(`/api/tenders/${id}/award`, { bidId });
    return res.data; // { message: "Tender awarded successfully", tender }
  } catch (error: any) {
    console.error(
      "Error awarding tender:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getActiveTenders = async () => {
  return getTenders({ status: "active" });
};
