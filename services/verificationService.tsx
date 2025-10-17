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
      (error && typeof error === "object" && "response" in error && (error as any).response?.data) || (error && typeof error === "object" && "message" in error ? (error as any).message : String(error))
    );
    throw error;
  } finally {
    console.log("↩️ Finished getPendingVerifications request");
  }
};

// Verify user documents
interface VerifyUserDocumentsPayload {
  status: string;
  rejectionReason?: string;
}

interface VerifyUserDocumentsResponse {
  success: boolean;
  message: string;
  // Add more fields as returned by your API if needed
}

export const verifyUserDocuments = async (
  userId: string,
  status: string,
  rejectionReason?: string
): Promise<VerifyUserDocumentsResponse> => {
  console.log(
    `➡️ Starting verifyUserDocuments request for userId=${userId}, status=${status}, rejectionReason=${
      rejectionReason || "N/A"
    }`
  );

  try {
    const payload: VerifyUserDocumentsPayload = { status };
    if (rejectionReason) {
      payload.rejectionReason = rejectionReason;
    }

    const response = await api.put<VerifyUserDocumentsResponse>(
      `/api/verification/${userId}/verify`,
      payload
    );
    console.log("✅ verifyUserDocuments success:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error verifying user documents:",
      (error && typeof error === "object" && "response" in error && (error as any).response?.data) ||
      (error && typeof error === "object" && "message" in error ? (error as any).message : String(error))
    );
    throw error;
  } finally {
    console.log("↩️ Finished verifyUserDocuments request");
  }
};
export const getAllVerifications = async () => {
  console.log("➡️ Starting getAllVerifications request...");
  try {
    const response = await api.get("/api/verification/all");
    console.log("✅ getAllVerifications success:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching all verifications:",
      (error && typeof error === "object" && "response" in error && (error as any).response?.data) ||
      (error && typeof error === "object" && "message" in error ? (error as any).message : String(error))
    );
    throw error;
  } finally {
    console.log("↩️ Finished getAllVerifications request");
  }
};
export default {
  getPendingVerifications,
  verifyUserDocuments,
  getAllVerifications,
};
