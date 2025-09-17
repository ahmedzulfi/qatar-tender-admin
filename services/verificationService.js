// services/verificationService.js
import { api } from "@/lib/apiClient";

// Get all users with pending document verification
export const getPendingVerifications = async () => {
  try {
    const response = await api.get("/api/verification/pending");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching pending verifications:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Verify user documents
export const verifyUserDocuments = async (userId, status, rejectionReason) => {
  try {
    const payload = { status };
    if (rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }

    const response = await api.put(
      `/api/verification/${userId}/verify`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error verifying user documents:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Default export for convenience
export default {
  getPendingVerifications,
  verifyUserDocuments,
};
