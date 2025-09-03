// services/uploadService.js
import { api } from "@/lib/apiClient";

export const uploadMedia = async (files: any[]) => {
  const formData = new FormData();

  // Append all files to FormData
  files.forEach((file) => {
    formData.append("media", file);
  });

  try {
    const response = await api.post("/api/upload/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        let progress = 0;
        if (progressEvent.total) {
          progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
        }
        console.log(`Upload Progress: ${progress}%`);
      },
    });

    return response.data.files; // This should be an array of { url, name, size, type }
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};
