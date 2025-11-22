"use client";

import React, { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import { $getRoot, SerializedEditorState } from "lexical";
import { Trash2, Eye, Plus } from "lucide-react";

import {
  createBlogPost,
  getAllBlogs,
  deleteBlogPost,
  type BlogPost,
} from "@/services/blogservice";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Editor } from "@/components/blocks/editor-md/editor";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

export default function BlogCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [pubDate, setPubDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  // Keep as string (exactly like you had it)
  const [serializedContent, setSerializedContent] = useState<string | null>(
    null
  );
  const [plainTextPreview, setPlainTextPreview] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [blogsError, setBlogsError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Upload image
  const handleFileUpload = async (file?: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
      setImageFileName(file.name);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract plain text for preview
  const handleEditorChange = useCallback((editorState: any) => {
    editorState.read(() => {
      const text = $getRoot().getTextContent();
      setPlainTextPreview(text);
    });
  }, []);

  // This receives the real SerializedEditorState object from Lexical
  const handleEditorSerializedChange = useCallback(
    (serialized: SerializedEditorState) => {
      setSerializedContent(JSON.stringify(serialized));
    },
    []
  );

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    setBlogsLoading(true);
    setBlogsError(null);
    try {
      const data = await getAllBlogs();
      setBlogs(data || []);
    } catch (err: any) {
      setBlogsError(err?.message || "Failed to load blogs");
    } finally {
      setBlogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setAuthor("");
    setPubDate(dayjs().format("YYYY-MM-DD"));
    setImageUrl(null);
    setImageFileName(null);
    setSerializedContent(null);
    setPlainTextPreview("");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !author.trim()) return;
    if (!serializedContent && !plainTextPreview.trim()) return;

    setLoading(true);
    try {
      await createBlogPost({
        title: title.trim(),
        author: author.trim(),
        content: serializedContent || plainTextPreview,
        description: description.trim() || undefined,
        pubDate: pubDate ? new Date(pubDate).toISOString() : undefined,
        image: imageUrl || undefined,
      });

      resetForm();
      await fetchBlogs();
    } catch (err) {
      console.error("Failed to publish", err);
    } finally {
      setLoading(false);
    }
  }, [
    title,
    author,
    serializedContent,
    plainTextPreview,
    description,
    pubDate,
    imageUrl,
    resetForm,
    fetchBlogs,
  ]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this post?")) return;
      await deleteBlogPost(id);
      await fetchBlogs();
    },
    [fetchBlogs]
  );

  const slugPreview = title
    ? title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 50) + "-..."
    : "";

  function BlogListItem({ post }: { post: BlogPost }) {
    const date = post.pubDate
      ? dayjs(post.pubDate).format("MMM D, YYYY")
      : post.createdAt
      ? dayjs(post.createdAt).format("MMM D, YYYY")
      : "Draft";

    return (
      <div className="group relative bg-white/60 backdrop-blur-xl border border-gray-200/80 rounded-2xl p-4 hover:bg-white/80 hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2 mb-1.5">
              {post.title}
            </h4>
            <p className="text-[13px] text-gray-500 font-medium">{date}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">
              by {post.author || "Unknown"}
            </p>
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => alert(`View: ${post.title}`)}
              className="w-8 h-8 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => post._id && handleDelete(post._id)}
              disabled={blogsLoading}
              className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-white/40 backdrop-blur-2xl border transition-all duration-500 ${
          isSidebarOpen ? "w-[340px]" : "w-0 overflow-hidden"
        }`}
      >
        <div className={`${isSidebarOpen ? "block p-6" : "hidden"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
              Library
            </h2>
            <Badge className="bg-gray-900 text-white px-3 py-1 text-[13px] font-semibold rounded-full">
              {blogs.length}
            </Badge>
          </div>
          <p className="text-[13px] text-gray-500 mb-6">All your blog posts</p>

          {blogsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {blogsError}
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-180px)] pr-2">
            <div className="space-y-3">
              {blogsLoading ? (
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200/80"
                  >
                    <Skeleton className="h-5 w-4/5 mb-2" />
                    <Skeleton className="h-3 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
              ) : blogs.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="font-medium">No posts yet</p>
                  <p className="text-sm mt-1">Create your first blog post</p>
                </div>
              ) : (
                blogs.map((b) => <BlogListItem key={b._id} post={b} />)
              )}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Main Form */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[95%] mx-auto px-8 py-10">
          <div className="bg-white/60 backdrop-blur-2xl border border-gray-200/80 rounded-[32px] overflow-hidden">
            <div className="p-10 space-y-8">
              {/* Title */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-900 mb-3">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a captivating title"
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-[17px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Author & Date */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[15px] font-semibold text-gray-900 mb-3">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[15px] font-semibold text-gray-900 mb-3">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={pubDate}
                    onChange={(e) => setPubDate(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-900 mb-3">
                  Short Description{" "}
                  <span className="text-gray-400 text-[14px] font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief summary for previews..."
                  className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-[16px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Hero Image */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-900 mb-3">
                  Hero Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFileUpload(e.target.files[0])
                    }
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-5 py-4 bg-gray-50/50 border-2 border-dashed border-gray-300 rounded-2xl text-[15px] text-gray-600 hover:bg-gray-100/50 cursor-pointer transition"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {imageFileName || "Choose image"}
                  </label>
                  <input
                    placeholder="Or paste image URL"
                    value={imageUrl ?? ""}
                    onChange={(e) => setImageUrl(e.target.value || null)}
                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200">
                    <img
                      src={imageUrl}
                      alt="Hero"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Editor — THIS IS THE KEY FIX */}
              <div>
                <label className="block text-[15px] font-semibold text-gray-900 mb-3">
                  Content <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  <Editor
                    editorSerializedState={
                      serializedContent
                        ? JSON.parse(serializedContent)
                        : undefined
                    }
                    onChange={handleEditorChange}
                    onSerializedChange={handleEditorSerializedChange}
                  />
                </div>
              </div>

              {/* Slug Preview */}
              {title && (
                <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200">
                  <p className="text-[13px] font-semibold text-gray-600 mb-2">
                    URL PREVIEW
                  </p>
                  <p className="text-[14px] font-mono text-gray-700 break-all">
                    {slugPreview}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-2xl disabled:opacity-50 transition-all hover:scale-[1.02]"
                >
                  {loading ? "Publishing..." : "Publish Post"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-8 py-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition hover:scale-[1.02]"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
