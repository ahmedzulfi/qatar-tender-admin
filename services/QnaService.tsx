import { api } from "@/lib/apiClient";
export interface UserProfile {
  _id: string;
  usertype: string;
  email: string;
}
export interface Question {
  _id: string;
  tender: string;
  question: string;
  answer?: string;
  askedBy: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Ask a question about a tender
 */
export const askQuestion = async (
  tender: string,
  question: string
): Promise<Question> => {
  try {
    const response = await api.post("/api/questions", {
      tender,
      question,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Answer a question (tender owner only)
 */
export const answerQuestion = async (
  questionId: string,
  answer: string
): Promise<Question> => {
  try {
    const response = await api.put<ApiResponse<Question>>(
      `/api/questions/${questionId}/answer`,
      { answer }
    );
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all questions for a specific tender
 */
export const getQuestionsForTender = async (
  tenderId: string
): Promise<ApiResponse<Question[]>> => {
  try {
    const response = await api.get<ApiResponse<Question[]>>(
      `/api/questions/tender/${tenderId}`
    );
    return response.data; // ✅ returning ApiResponse
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get questions asked by the current user
 */
export const getMyQuestions = async (): Promise<Question[]> => {
  try {
    const response = await api.get<ApiResponse<Question[]>>(
      "/api/questions/my-questions"
    );
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get a single question by ID
 */
export const getQuestionById = async (
  questionId: string
): Promise<Question> => {
  try {
    const response = await api.get<ApiResponse<Question>>(
      `/api/questions/${questionId}`
    );
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a question
 */
export const deleteQuestion = async (
  questionId: string
): Promise<{ message: string }> => {
  try {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/api/questions/${questionId}`
    );
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update a question
 */
export const updateQuestion = async (
  questionId: string,
  question: string
): Promise<Question> => {
  try {
    const response = await api.put<ApiResponse<Question>>(
      `/api/questions/${questionId}`,
      { question }
    );
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// Default export for convenience
export default {
  askQuestion,
  answerQuestion,
  getQuestionsForTender,
  getMyQuestions,
  getQuestionById,
  deleteQuestion,
  updateQuestion,
};
