// services/reviewService.ts
import { api } from "@/lib/apiClient";

// Define TypeScript interfaces
export interface Review {
  _id: string;
  tender: {
    _id: string;
    title: string;
  };
  reviewer: {
    _id: string;
    email: string;
    userType: string;
  };
  reviewedUser: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  tender: string;
  reviewedUser: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating: number;
  comment?: string;
}

// Create a new review
export const createReview = async (
  reviewData: CreateReviewData
): Promise<Review> => {
  try {
    const response = await api.post<Review>("/api/reviews", reviewData);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating review:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to create review. Please try again."
    );
  }
};

// Update an existing review
export const updateReview = async (
  reviewId: string,
  updateData: UpdateReviewData
): Promise<Review> => {
  try {
    const response = await api.put<Review>(
      `/api/reviews/${reviewId}`,
      updateData
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating review:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to update review. Please try again."
    );
  }
};

// Get review for a specific tender by current user
export const getReviewForTender = async (
  tenderId: string
): Promise<Review | null> => {
  try {
    const response = await api.get<Review>(`/api/reviews/tender/${tenderId}`);
    return response.data;
  } catch (error: any) {
    // If review not found, return null instead of throwing error
    if (error.response?.status === 404) {
      return null;
    }
    console.error(
      "Error fetching tender review:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch tender review."
    );
  }
};

// Get reviews for a specific user
export const getReviewsForUser = async (userId: string): Promise<Review[]> => {
  try {
    const response = await api.get<Review[]>(`/api/reviews/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching user reviews:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch user reviews."
    );
  }
};

// Get reviews received by the current user
export const getMyReceivedReviews = async (): Promise<Review[]> => {
  try {
    const response = await api.get<Review[]>("/api/reviews/my-reviews");
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching received reviews:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch received reviews."
    );
  }
};

// Get reviews given by the current user
export const getMyGivenReviews = async (): Promise<Review[]> => {
  try {
    const response = await api.get<Review[]>("/api/reviews/my-given-reviews");
    return response.data;
  } catch (error: any) {
    console.error(
      "Error fetching given reviews:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to fetch reviews you've given."
    );
  }
};

// Delete a review (optional - if you want to add delete functionality later)
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await api.delete(`/api/reviews/${reviewId}`);
  } catch (error: any) {
    console.error(
      "Error deleting review:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        "Failed to delete review. Please try again."
    );
  }
};
