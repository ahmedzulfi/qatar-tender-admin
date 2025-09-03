// services/adminService.js
import { api } from "@/lib/apiClient";

/**
 * Admin login with security code
 * @param {string} email
 * @param {string} password
 * @param {string} securityCode
 * @returns {Promise<Object>} Auth response with tokens and user data
 */
export const adminLogin = async (email, password, securityCode) => {
  try {
    const response = await api.post("/api/admin/login", {
      email,
      password,
      securityCode,
    });
    return response.data;
  } catch (error) {
    console.error("Admin login failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a new admin (super admin only)
 * @param {string} email
 * @returns {Promise<Object>} Response with admin creation details
 */
export const createAdmin = async (email) => {
  try {
    const response = await api.post("/api/admin/admins", { email });
    return response.data;
  } catch (error) {
    console.error(
      "Create admin failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get all users (admin and super admin)
 * @param {Object} params - Pagination and filtering parameters
 * @returns {Promise<Object>} Users data with pagination
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get("/api/admin/users", { params });
    return response.data;
  } catch (error) {
    console.error("Get users failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Edit user details (admin and super admin)
 * @param {string} userId
 * @param {Object} updates - Fields to update (email, isBanned, banReason)
 * @returns {Promise<Object>} Updated user data
 */
export const editUser = async (userId, updates) => {
  try {
    const response = await api.put(`/api/admin/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    console.error("Edit user failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all tenders (admin and super admin)
 * @param {Object} params - Pagination and filtering parameters
 * @returns {Promise<Object>} Tenders data with pagination
 */
export const getAllTenders = async (params = {}) => {
  try {
    const response = await api.get("/api/admin/tenders", { params });
    return response.data;
  } catch (error) {
    console.error("Get tenders failed:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Close a tender (admin and super admin)
 * @param {string} tenderId
 * @param {string} reason
 * @returns {Promise<Object>} Closed tender data
 */
export const closeTender = async (tenderId, reason) => {
  try {
    const response = await api.put(`/api/admin/tenders/${tenderId}/close`, {
      reason,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Close tender failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Delete a tender (admin and super admin)
 * @param {string} tenderId
 * @returns {Promise<Object>} Success message
 */
export const deleteTender = async (tenderId) => {
  try {
    const response = await api.delete(`/api/admin/tenders/${tenderId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete tender failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get admin activities (super admin only)
 * @param {Object} params - Filtering parameters
 * @returns {Promise<Object>} Activities data with pagination
 */
export const getAdminActivities = async (params = {}) => {
  try {
    const response = await api.get("/api/admin/activities", { params });
    return response.data;
  } catch (error) {
    console.error(
      "Get activities failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Delete an admin (super admin only)
 * @param {string} adminId
 * @returns {Promise<Object>} Success message
 */
export const deleteAdmin = async (adminId) => {
  try {
    const response = await api.delete(`/api/admin/admins/${adminId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete admin failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
