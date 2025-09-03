// api/profileApi.ts

import { api } from "@/lib/apiClient";

// Define TypeScript interfaces for better type safety
interface ProfileData {
  personalEmail: string;
  userType: string;
  fullName?: string;
  phone?: string;
  address?: string;
  email?: string;
  companyName?: string;
  companyEmail?: string;
  contactPersonName?: string;
  companyDesc?: string;
  nationalId?: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
  commercialRegistrationNumber?: string;
  commercialRegistrationDoc?: string;
}

interface UpdateProfileResponse {
  requiresReVerification?: boolean;
  message: string;
}

interface VerificationStatusResponse {
  status: string;
  message: string;
}

interface DocumentSubmissionData {
  nationalId?: string;
  nationalIdFront?: string;
  nationalIdBack?: string;
  commercialRegistrationNumber?: string;
  commercialRegistrationDoc?: string;
}

export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<ProfileData> => {
    try {
      const response = await api.get("/api/profiles");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  },

  // Update profile
  updateProfile: async (profileData: Partial<ProfileData>): Promise<UpdateProfileResponse> => {
    try {
      const response = await api.put("/api/profiles", profileData);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  },

  getProfileById: async (userId: string): Promise<ProfileData> => {
    try {
      const response = await api.get(`/api/profiles/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch profile by ID"
      );
    }
  },

  // Submit documents for verification
  submitDocuments: async (documentsData: DocumentSubmissionData): Promise<{ message: string }> => {
    try {
      const response = await api.put(
        "/api/profiles/submit-documents",
        documentsData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to submit documents"
      );
    }
  },

  // Get verification status
  getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
    try {
      const response = await api.get("/api/profiles/verification-status");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch verification status"
      );
    }
  },
};