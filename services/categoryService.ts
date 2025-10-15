import { api } from "@/lib/apiClient";

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

export const createCategory = async (categoryData: {
  name: string;
  description: string;
  parentId?: number;
}) => {
  try {
    const response = await api.post("/api/categories", categoryData);
    console.log(response, "ddddddddddddddddddddddddddddddd");
    return response.data;
  } catch (error: any) {
    console.error(
      "Error creating category:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateCategory = async (
  categoryId: string,
  categoryData: {
    name: string;
    description: string;
    parentId?: number;
  }
) => {
  try {
    const response = await api.put(
      `/api/categories/${categoryId}`,
      categoryData
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error updating category:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await api.delete(`/api/categories/${categoryId}`);
  } catch (error: any) {
    console.error(
      "Error deleting category:",
      error.response?.data || error.message
    );
    throw error;
  }
};
