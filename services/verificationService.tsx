import { api } from "@/lib/apiClient";

// Get all users with pending document verification
export const getPendingVerifications = async () => {
  console.log("➡️ Starting getPendingVerifications request...");
  try {
    const response = await api.get("/api/verification/pending");
    console.log("✅ getPendingVerifications success:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching pending verifications:",
      error.response?.data || error.message
    );
    throw error;
  } finally {
    console.log("↩️ Finished getPendingVerifications request");
  }
};

// Verify user documents
export const verifyUserDocuments = async (userId, status, rejectionReason) => {
  console.log(
    `➡️ Starting verifyUserDocuments request for userId=${userId}, status=${status}, rejectionReason=${
      rejectionReason || "N/A"
    }`
  );

  try {
    const payload = { status };
    if (rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }

    const response = await api.put(
      `/api/verification/${userId}/verify`,
      payload
    );
    console.log("✅ verifyUserDocuments success:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error verifying user documents:",
      error.response?.data || error.message
    );
    throw error;
  } finally {
    console.log("↩️ Finished verifyUserDocuments request");
  }
};

export default {
  getPendingVerifications,
  verifyUserDocuments,
};
