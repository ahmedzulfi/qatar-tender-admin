import { api } from "@/lib/apiClient";

export interface CreateBidPayload {
  tender: string;
  amount: number;
  description: string;
}

export interface Bid {
  _id: string;
  tender: string;
  bidder: string;
  amount: number;
  description: string;
  paymentStatus: "pending" | "completed" | "failed";
  paymentAmount: number;
  paymentId?: string;
  status:
    | "pending"
    | "accepted"
    | "rejected"
    | "under_review"
    | "submitted"
    | "completed";
  createdAt: string;
  updatedAt: string;
}

// Create a new bid
export const createBid = async (payload: CreateBidPayload) => {
  try {
    const res = await api.post("/api/bids", payload);
    return res.data;
  } catch (error: any) {
    console.error("Error creating bid:", error.response?.data || error.message);
    throw error;
  }
};

// Get bids for a specific tender
export const getTenderBids = async (tenderId: string) => {
  try {
    const res = await api.get(`/api/bids/tender/${tenderId}`);
    return res.data;
  } catch (error: any) {
    console.error(
      "Error fetching tender bids:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get user's bids
export const getUserBids = async () => {
  try {
    const res = await api.get("/api/bids/my-bids");
    return res.data;
  } catch (error: any) {
    console.error(
      "Error fetching user bids:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Update a bid (for general bid updates, not status)
export const updateBid = async (
  bidId: string,
  updateData: Partial<CreateBidPayload>
) => {
  try {
    const res = await api.put(`/api/bids/${bidId}`, updateData);
    return res.data;
  } catch (error: any) {
    console.error("Error updating bid:", error.response?.data || error.message);
    throw error;
  }
};

// NEW: Update bid status (specifically for accepting/rejecting bids)
export const updateBidStatus = async (
  bidId: string,
  status: "accepted" | "rejected" | "submitted" | "completed"
) => {
  try {
    const res = await api.put(`/api/bids/${bidId}/status`, { status });
    return res.data;
  } catch (error: any) {
    console.error(
      "Error updating bid status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Delete a bid
export const deleteBid = async (bidId: string) => {
  try {
    const res = await api.delete(`/api/bids/${bidId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error deleting bid:", error.response?.data || error.message);
    throw error;
  }
};

// Get a specific bid by ID
export const getBid = async (bidId: string) => {
  try {
    const res = await api.get(`/api/bids/${bidId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching bid:", error.response?.data || error.message);
    throw error;
  }
};
