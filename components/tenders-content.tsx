"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "../lib/hooks/useTranslation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Eye,
  Building,
  DollarSign,
  Users,
  FileText,
  MoreVertical,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { adminService } from "@/services/adminService";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Types
interface Tender {
  _id: string;
  title: string;
  category: { name: string } | null;
  status: string;
  bidsCount?: number;
  bidCount?: number;
  deadline?: string;
  createdAt?: string;
  description?: string;
  postedBy?: {
    email?: string;
    userType?: string;
  };
  budget?: string | number;
  estimatedBudget?: number;
}

export function TendersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTenders: 0,
    activeTenders: 0,
    totalBids: 0,
    totalValue: 0,
  });

  const { t } = useTranslation();

  // Sorting state
  const [sortBy, setSortBy] = useState<
    "none" | "deadline" | "budget" | "bids" | "createdAt" | "title"
  >("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const pageOptions = [10, 25, 50, 100];

  // Fetch tenders data
  useEffect(() => {
    const fetchTenders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await adminService.getTenders({ limit: 100 });

        if (response.success && response.data) {
          const fetchedTenders: Tender[] = response.data.tenders || [];
          setTenders(fetchedTenders);

          const totalTenders = fetchedTenders.length;
          const activeTenders = fetchedTenders.filter(
            (t) =>
              (t.status || "").toLowerCase() === "open" ||
              (t.status || "").toLowerCase() === "active"
          ).length;
          const totalBids = fetchedTenders.reduce(
            (sum, tender) =>
              sum +
              Number(
                (tender as any).bidCount ?? (tender as any).bidsCount ?? 0
              ),
            0
          );
          const totalValue = fetchedTenders.reduce((sum, tender) => {
            const budget = resolveBudget(tender);
            return sum + (budget > 0 ? budget : 0);
          }, 0);

          setStats({
            totalTenders,
            activeTenders,
            totalBids,
            totalValue,
          });
        } else {
          setError("Failed to fetch tenders data");
        }
      } catch (err) {
        console.error("Error fetching tenders:", err);
        setError("Failed to load tenders data");
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  const resolveBudget = (tender: Tender) => {
    if (typeof tender.estimatedBudget === "number")
      return tender.estimatedBudget;
    if (tender.budget && !isNaN(Number(tender.budget)))
      return Number(tender.budget);
    if (typeof tender.budget === "string") {
      const digits = tender.budget.replace(/[^0-9.]/g, "");
      return digits ? Number(digits) : 0;
    }
    return 0;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const categories = useMemo(
    () => [
      ...new Set(
        tenders
          .map((t) => t.category?.name)
          .filter((name): name is string => typeof name === "string")
      ),
    ],
    [tenders]
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "active":
        return (
          <Badge className="rounded-full bg-green-100 text-green-800 px-2 py-0.5">
            {t("status_active")}
          </Badge>
        );
      case "awarded":
        return (
          <Badge className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5">
            {t("status_awarded")}
          </Badge>
        );
      case "completed":
        return (
          <Badge className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5">
            {t("status_completed")}
          </Badge>
        );
      case "closed":
        return (
          <Badge className="rounded-full bg-gray-100 text-gray-800 px-2 py-0.5">
            {t("status_closed")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="rounded-full bg-red-100 text-red-800 px-2 py-0.5">
            {t("status_rejected")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full px-2 py-0.5">
            {status}
          </Badge>
        );
    }
  };

  const formatBudget = (budget: number) => {
    if (!budget || budget === 0) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const matchesSearch =
        tender.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.postedBy?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        false;

      const tenderStatus = (tender.status || "").toLowerCase();
      const sf = statusFilter.toLowerCase();
      const matchesStatus =
        sf === "all" ||
        (sf === "open" &&
          (tenderStatus === "open" || tenderStatus === "active")) ||
        tenderStatus === sf;

      const matchesCategory =
        categoryFilter === "all" || tender.category?.name === categoryFilter;
      const matchesType =
        typeFilter === "all" ||
        (tender.postedBy?.userType === "individual" &&
          typeFilter === "individual") ||
        (tender.postedBy?.userType === "business" && typeFilter === "business");

      return matchesSearch && matchesStatus && matchesCategory && matchesType;
    });
  }, [tenders, searchTerm, statusFilter, categoryFilter, typeFilter]);

  // 🔥 CRITICAL FIX: Reset to page 1 whenever filtered results change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTenders]);

  const sortedTenders = useMemo(() => {
    const list = [...filteredTenders];
    if (sortBy === "none") return list;

    const order = sortOrder === "asc" ? 1 : -1;

    list.sort((a, b) => {
      if (sortBy === "deadline") {
        const da = a.deadline ? new Date(a.deadline).getTime() : 0;
        const db = b.deadline ? new Date(b.deadline).getTime() : 0;
        return (da - db) * order;
      }

      if (sortBy === "createdAt") {
        const ca = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const cb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (ca - cb) * order;
      }

      if (sortBy === "budget") {
        const ba = resolveBudget(a);
        const bb = resolveBudget(b);
        return (ba - bb) * order;
      }

      if (sortBy === "bids") {
        const bidsA = Number((a as any).bidCount ?? (a as any).bidsCount ?? 0);
        const bidsB = Number((b as any).bidCount ?? (b as any).bidsCount ?? 0);
        return (bidsA - bidsB) * order;
      }

      if (sortBy === "title") {
        const ta = (a.title || "").toLowerCase();
        const tb = (b.title || "").toLowerCase();
        if (ta < tb) return -1 * order;
        if (ta > tb) return 1 * order;
        return 0;
      }

      return 0;
    });

    return list;
  }, [filteredTenders, sortBy, sortOrder]);

  const totalItems = sortedTenders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure currentPage is valid if pageSize changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1); // Safe fallback
    }
  }, [pageSize, totalPages, currentPage]);

  const paginatedTenders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedTenders.slice(start, end);
  }, [sortedTenders, currentPage, pageSize]);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const left = Math.max(1, currentPage - 2);
    const right = Math.min(totalPages, currentPage + 2);

    if (left > 1) {
      pages.push(1);
      if (left > 2) pages.push("...");
    }

    for (let i = left; i <= right; i++) pages.push(i);

    if (right < totalPages) {
      if (right < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card
              key={i}
              className="shadow-[0_6px_18px_rgba(0,0,0,0.06)] bg-white/70 rounded-2xl"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-[0_6px_18px_rgba(0,0,0,0.06)] bg-white/60 rounded-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Skeleton className="h-10 flex-1 rounded-full" />
              <Skeleton className="h-10 w-full sm:w-[180px] rounded-full" />
              <Skeleton className="h-10 w-full sm:w-[180px] rounded-full" />
              <Skeleton className="h-10 w-full sm:w-[180px] rounded-full" />
              <Skeleton className="h-10 w-full sm:w-[180px] rounded-full" />
              <Skeleton className="h-10 w-full sm:w-[180px] rounded-full" />
            </div>

            <div className="rounded-2xl border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(7)].map((_, i) => (
                      <TableHead key={i}>
                        <Skeleton className="h-4 w-28" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="shadow-[0_6px_18px_rgba(0,0,0,0.06)] rounded-2xl bg-white/70">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <Card className="shadow-[0_6px_18px_rgba(0,0,0,0.06)] bg-white/80 rounded-2xl">
        <CardHeader>
          <CardTitle>{t("tender_management")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center">
            <div className="relative flex-1 max-w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_tenders")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // ✅ Removed setCurrentPage(1)
                className="pl-10 rounded-full border border-gray-100 shadow-sm"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)} // ✅ Removed setCurrentPage(1)
            >
              <SelectTrigger className="w-full sm:w-[170px] rounded-full">
                <SelectValue placeholder={t("filter_by_status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_status")}</SelectItem>
                <SelectItem value="open">{t("status_active")}</SelectItem>
                <SelectItem value="awarded">{t("status_awarded")}</SelectItem>
                <SelectItem value="completed">
                  {t("status_completed")}
                </SelectItem>
                <SelectItem value="closed">{t("status_closed")}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v)} // ✅ Removed setCurrentPage(1)
            >
              <SelectTrigger className="w-full sm:w-[170px] rounded-full">
                <SelectValue placeholder={t("filter_by_category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_categories")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v)} // ✅ Removed setCurrentPage(1)
            >
              <SelectTrigger className="w-full sm:w-[150px] rounded-full">
                <SelectValue placeholder={t("filter_by_type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_types")}</SelectItem>
                <SelectItem value="individual">{t("individual")}</SelectItem>
                <SelectItem value="business">{t("business")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-full sm:w-[160px] rounded-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="createdAt">Created At</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="bids">Bids</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
              >
                <SelectTrigger className="w-full sm:w-[120px] rounded-full">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  // Note: currentPage reset handled by useEffect below if needed
                }}
              >
                <SelectTrigger className="w-[90px] rounded-full">
                  <SelectValue placeholder={`${pageSize}/page`} />
                </SelectTrigger>
                <SelectContent>
                  {pageOptions.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {p}/page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white/60">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow>
                  <TableHead className="text-sm text-gray-600">
                    {t("tender_details")}
                  </TableHead>
                  <TableHead className="text-sm text-gray-600">
                    {t("posted_by")}
                  </TableHead>
                  <TableHead className="text-sm text-gray-600">
                    {t("category")}
                  </TableHead>
                  <TableHead className="text-sm text-gray-600">
                    {t("budget")}
                  </TableHead>
                  <TableHead className="text-sm text-gray-600">
                    {t("bids")}
                  </TableHead>
                  <TableHead className="text-sm text-gray-600">
                    {t("deadline")}
                  </TableHead>
                  <TableHead className="text-sm text-gray-600">
                    {t("status")}
                  </TableHead>
                  <TableHead className="text-sm text-gray-600">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTenders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No tenders found</p>
                        <p className="text-sm">
                          Try adjusting your filters or search term
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTenders.map((tender) => {
                    const bids =
                      (tender as any).bidCount ??
                      (tender as any).bidsCount ??
                      0;
                    return (
                      <TableRow key={tender._id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 line-clamp-2">
                              {tender.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              ID: {tender._id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {tender.postedBy?.email || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {tender.postedBy?.userType || "-"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-full px-2 py-0.5"
                          >
                            {tender.category?.name || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {formatBudget(resolveBudget(tender))}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5"
                          >
                            {bids}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(tender.deadline)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(tender.status || "")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <Link
                                href={`/admin/tenders/${tender._id}`}
                                passHref
                              >
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {t("view_details")}
                                </DropdownMenuItem>
                              </Link>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-9 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 px-2">
                {getPageNumbers().map((p, idx) =>
                  p === "..." ? (
                    <span key={idx} className="text-sm text-gray-400 px-2">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(Number(p))}
                      className={`min-w-[36px] h-8 px-3 rounded-md text-sm ${
                        currentPage === p
                          ? "bg-gray-900 text-white"
                          : "bg-white/50 text-gray-800 border border-transparent hover:border-gray-100"
                      }`}
                      aria-current={currentPage === p ? "page" : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
