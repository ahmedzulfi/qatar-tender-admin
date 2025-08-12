"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: number;
  name: string;
  description: string;
  parentId?: number;
  tenderCount: number;
  createdAt: string;
}

interface TenderTag {
  id: number;
  name: string;
  description: string;
  color: string;
  usageCount: number;
  createdAt: string;
}

// Mock data
const initialCategories: Category[] = [
  {
    id: 1,
    name: "Construction",
    description: "Building and infrastructure projects",
    tenderCount: 45,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "IT Services",
    description: "Technology and software development",
    tenderCount: 32,
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    name: "Healthcare",
    description: "Medical equipment and services",
    tenderCount: 28,
    createdAt: "2024-02-01",
  },
  {
    id: 4,
    name: "Transportation",
    description: "Logistics and transport services",
    tenderCount: 19,
    createdAt: "2024-02-10",
  },
  {
    id: 5,
    name: "Education",
    description: "Educational services and supplies",
    tenderCount: 15,
    createdAt: "2024-02-15",
  },
];

const initialTags: TenderTag[] = [
  {
    id: 1,
    name: "Urgent",
    description: "High priority tenders",
    color: "red",
    usageCount: 23,
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    name: "Government",
    description: "Government sector tenders",
    color: "blue",
    usageCount: 67,
    createdAt: "2024-01-12",
  },
  {
    id: 3,
    name: "Private",
    description: "Private sector opportunities",
    color: "green",
    usageCount: 45,
    createdAt: "2024-01-15",
  },
  {
    id: 4,
    name: "International",
    description: "Cross-border projects",
    color: "purple",
    usageCount: 12,
    createdAt: "2024-01-18",
  },
  {
    id: 5,
    name: "SME Friendly",
    description: "Suitable for small businesses",
    color: "orange",
    usageCount: 34,
    createdAt: "2024-01-20",
  },
];

export function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [tags, setTags] = useState<TenderTag[]>(initialTags);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | TenderTag | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    type: "category" | "tag";
    name: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("categories");

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Filter tags
  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAddItem = (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if (activeTab === "categories") {
      const parentId = formData.get("parentId") as string;
      const newCategory: Category = {
        id: Math.max(...categories.map((c) => c.id)) + 1,
        name,
        description,
        parentId: parentId ? Number.parseInt(parentId) : undefined,
        tenderCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCategories([...categories, newCategory]);
    } else {
      const color = formData.get("color") as string;
      const newTag: TenderTag = {
        id: Math.max(...tags.map((t) => t.id)) + 1,
        name,
        description,
        color,
        usageCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTags([...tags, newTag]);
    }

    setIsAddDialogOpen(false);
  };

  const handleEditItem = (formData: FormData) => {
    if (!editingItem) return;

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    if ("tenderCount" in editingItem) {
      // It's a category
      const parentId = formData.get("parentId") as string;
      setCategories(
        categories.map((cat) =>
          cat.id === editingItem.id
            ? {
                ...cat,
                name,
                description,
                parentId: parentId ? Number.parseInt(parentId) : undefined,
              }
            : cat
        )
      );
    } else {
      // It's a tag
      const color = formData.get("color") as string;
      setTags(
        tags.map((tag) =>
          tag.id === editingItem.id
            ? {
                ...tag,
                name,
                description,
                color,
              }
            : tag
        )
      );
    }

    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "category") {
      setCategories(categories.filter((cat) => cat.id !== itemToDelete.id));
    } else {
      setTags(tags.filter((tag) => tag.id !== itemToDelete.id));
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const openEditDialog = (item: Category | TenderTag) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (
    id: number,
    type: "category" | "tag",
    name: string
  ) => {
    setItemToDelete({ id, type, name });
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Categories with Tenders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.filter((c) => c.tenderCount > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Most Used Tag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                tags.reduce((prev, current) =>
                  prev.usageCount > current.usageCount ? prev : current
                ).name
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Tags Management</CardTitle>
          <CardDescription>
            Organize your tender categories and tags for better classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Categories Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-3">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Categories Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tender Count</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {category.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.tenderCount}</Badge>
                    </TableCell>
                    <TableCell>{category.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            openDeleteDialog(
                              category.id,
                              "category",
                              category.name
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New {activeTab === "categories" ? "Category" : "Tag"}
            </DialogTitle>
            <DialogDescription>
              Create a new {activeTab === "categories" ? "category" : "tag"} for
              organizing tenders.
            </DialogDescription>
          </DialogHeader>
          <form action={handleAddItem}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  className="mt-3"
                  placeholder="Enter name"
                  required
                />
              </div>
            
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add {activeTab === "categories" ? "Category" : "Tag"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit{" "}
              {editingItem && "tenderCount" in editingItem ? "Category" : "Tag"}
            </DialogTitle>
            <DialogDescription>
              Update the details of this item.
            </DialogDescription>
          </DialogHeader>
          <form action={handleEditItem}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingItem?.name}
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingItem?.description}
                  placeholder="Enter description"
                />
              </div>
              {editingItem && "tenderCount" in editingItem && (
                <div>
                  <Label htmlFor="edit-parentId">
                    Parent Category (Optional)
                  </Label>
                  <Select
                    name="parentId"
                    defaultValue={editingItem.parentId?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat.id !== editingItem.id)
                        .map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {editingItem && "color" in editingItem && (
                <div>
                  <Label htmlFor="edit-color">Color</Label>
                  <Select
                    name="color"
                    defaultValue={editingItem.color}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {itemToDelete?.type} "
              {itemToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
