"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "../lib/hooks/useTranslation";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categoryService";

interface Category {
  _id: string;
  name: string;
  description: string;
  parentId?: string;
  tenderCount: number;
  createdAt: string;
}

export function CategoriesContent() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (err) {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async (formData: FormData) => {
    setActionLoading(true);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      const newCategory = await createCategory({
        name,
        description,
      });
      setCategories([...categories, newCategory]);
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error("Error creating category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = async (formData: FormData) => {
    if (!editingCategory) return;
    setActionLoading(true);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      const updatedCategory = await updateCategory(editingCategory._id, {
        name,
        description,
      });

      setCategories(
        categories.map((cat) =>
          cat._id === editingCategory._id ? updatedCategory : cat
        )
      );

      setIsEditDialogOpen(false);
      setEditingCategory(null);
    } catch (err) {
      console.error("Error updating category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setActionLoading(true);

    try {
      await deleteCategory(categoryToDelete.id);
      setCategories(
        categories.filter((cat) => cat._id !== categoryToDelete.id)
      );
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Error deleting category:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Categories Table Skeleton */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
          <CardHeader className="border-b border-gray-100/50">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Skeleton className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                <Skeleton className="w-full h-10 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                    <TableHead className="text-right">
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Card className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-600 mb-2">
              {t("error_loading_categories")}
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t("retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 p-4 sm:p-1"
    >
   

      {/* Categories Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <CardHeader className="border pt-5 pb-3 border-gray-100/50">
          <CardTitle className="text-xl font-semibold text-gray-900">
            {t("categories")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_categories")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>{" "}
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("add_category")}
            </Button>
          </div>

          <div className="rounded-md border border-gray-100/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
                  <TableHead className="font-semibold text-gray-600">
                    {t("name")}
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    {t("description")}
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    {t("created")}
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-600">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="text-gray-500">
                        <svg
                          className="h-12 w-12 mx-auto text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          {t("no_categories_found")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t(
                            "try_adjusting_your_search_or_create_new_category"
                          )}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow
                      key={category._id}
                      className="border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {category.description}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className=" group-hover:opacity-100 transition-opacity"
                            onClick={() => openEditDialog(category)}
                          >
                            Edit <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {t("add_new_category")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("create_a_new_category_for_organizing_tenders")}
            </DialogDescription>
          </DialogHeader>
          <form action={handleAddCategory}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("name")}
                </Label>
                <Input
                  id="name"
                  name="name"
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
                  placeholder={t("enter_name")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("description")}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
                  placeholder={t("enter_description")}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-gray-100/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {t("add_category")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {t("edit_category")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("update_the_details_of_this_category")}
            </DialogDescription>
          </DialogHeader>
          <form action={handleEditCategory}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-name"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("name")}
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingCategory?.name}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
                  placeholder={t("enter_name")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-description"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("description")}
                </Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingCategory?.description}
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
                  placeholder={t("enter_description")}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="pt-4 border-t border-gray-100/50">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionLoading ? (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {t("update")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              {t("are_you_sure")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {t("this_will_permanently_delete_the_category")} "
              <span className="font-medium text-gray-900">
                {categoryToDelete?.name}
              </span>
              ". {t("this_action_cannot_be_undone")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 border-t border-gray-100/50">
            <AlertDialogCancel className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-gray-50/80 transition-colors">
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
