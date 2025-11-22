// services/blogService.ts
import { api } from "@/lib/apiClient";

export interface CreatePostPayload {
  title: string;
  content: string;
  tags?: string[];
}
export type BlogPost = {
  _id?: string;
  title: string;
  description?: string | null;
  content: string;
  image?: string | null;
  author?: string;
  authorImage?: string | null;
  pubDate?: string | null;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
};

const handleResponse = (res: any) => {
  if (!res || (res.status && res.status >= 400)) {
    throw new Error((res && res.data && res.data.message) || "API error");
  }
  return res.data;
};

export const createBlogPost = async (data: {
  title: string;
  author: string;
  content: string;
  description?: string;
  pubDate?: string;
  image?: string;
}) => {
  const response = await api.post("/api/admin/blog/create", data, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};
export const getAllBlogs = async (): Promise<BlogPost[]> => {
  try {
    const res = await api.get("/api/admin/blog");
    console.log("Blog posts fetched:", res);

    return handleResponse(res);
  } catch (err: any) {
    console.error(
      "blogService.getAllBlogs error:",
      err?.response?.data || err.message || err
    );
    throw err;
  }
};

export const getBlogBySlug = async (slug: string): Promise<BlogPost> => {
  try {
    const res = await api.get(`/api/admin/blog/${encodeURIComponent(slug)}`);
    return handleResponse(res);
  } catch (err: any) {
    console.error(
      `blogService.getBlogBySlug(${slug}) error:`,
      err?.response?.data || err.message || err
    );
    throw err;
  }
};

export const deleteBlogPost = async (id: string) => {
  try {
    const res = await api.delete(`/api/admin/blog/${id}`);
    return handleResponse(res);
  } catch (err: any) {
    console.error("deleteBlogPost error:", err?.response?.data || err.message);
    throw err;
  }
};

export const blogService = {
  createBlogPost,
  getAllBlogs,
  getBlogBySlug,
  deleteBlogPost,
};
