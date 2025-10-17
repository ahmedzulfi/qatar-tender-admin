"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "../lib/hooks/useTranslation";
import {
  Search,
  Eye,
  Building,
  Gavel,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart2,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { adminService } from "@/services/adminService";

// Types
interface Bid {
  _id: string;
  tender: {
    _id: string;
    title: string;
  };
  bidder: {
    _id: string;
    email: string;
    userType: string;
    companyName?: string;
  };
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  documents?: Array<{
    name: string;
    url: string;
  }>;
  flagged?: boolean;
}

export function BidsContent() {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tenderFilter, setTenderFilter] = useState<string>("all");
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [allFetchedBids, setAllFetchedBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all bids once (adjust limit as needed)
  const fetchAllBids = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch a large enough set (e.g., 200) to cover most admin use cases
      const response = await adminService.getBids({ limit: 200 });
      if (response.success && response.data?.bids) {
        setAllFetchedBids(response.data.bids);
      } else {
        setAllFetchedBids([]);
        setError("Failed to fetch bids");
      }
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError("Failed to load bids");
      setAllFetchedBids([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filtering
  const filteredBids = useMemo(() => {
    let result = [...allFetchedBids];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((bid) => bid.status === statusFilter);
    }

    // Tender filter
    if (tenderFilter !== "all") {
      result = result.filter((bid) => bid.tender?._id === tenderFilter);
    }

    // Search term (search in tender title, bidder email, company name, bid ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (bid) =>
          bid.tender?.title?.toLowerCase().includes(term) ||
          bid.bidder?.email?.toLowerCase().includes(term) ||
          bid.bidder?.companyName?.toLowerCase().includes(term) ||
          bid._id.toLowerCase().includes(term)
      );
    }

    return result;
  }, [allFetchedBids, searchTerm, statusFilter, tenderFilter]);

  // Get unique tenders for filter dropdown
  const uniqueTenders = useMemo(() => {
    const map = new Map<string, string>();
    allFetchedBids.forEach((bid) => {
      if (bid.tender?._id && bid.tender?.title) {
        map.set(bid.tender._id, bid.tender.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [allFetchedBids]);

  // Status badge
  const getStatusBadge = (status: string, flagged?: boolean) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return (
          <Badge className="bg-green-100/80 text-green-700 hover:bg-green-100 transition-colors">
            {t("status_accepted")}
          </Badge>
        );

      case "submitted":
      case "under_review":
        return (
          <Badge className="bg-blue-100/80 text-blue-700 hover:bg-blue-100 transition-colors">
            {t("status_active")}
          </Badge>
        );

      case "rejected":
        return (
          <Badge className="bg-red-100/80 text-red-700 hover:bg-red-100 transition-colors">
            {t("status_rejected")}
          </Badge>
        );

      case "completed":
        return (
          <Badge className="bg-purple-100/80 text-purple-700 hover:bg-purple-100 transition-colors">
            {t("status_completed")}
          </Badge>
        );

      default:
        return (
          <Badge variant="outline" className="bg-gray-100/80 text-gray-700">
            {status}
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "submitted":
      case "under_review":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    fetchAllBids();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="shadow-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100/50">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-600 mb-2">
              Error Loading Bids
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchAllBids} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden"
      >
        <CardHeader className="border border-gray-100/50">
          <CardTitle className="text-xl mt-5 ps-3 pb-0 font-semibold text-gray-900">
            {t("bid_management")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_bids_vendors_tenders")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_status")}</SelectItem>
                <SelectItem value="submitted">{t("status_active")}</SelectItem>
                <SelectItem value="accepted">{t("status_accepted")}</SelectItem>
                <SelectItem value="rejected">{t("status_rejected")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tenderFilter} onValueChange={setTenderFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder={t("filter_by_tender")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_tenders")}</SelectItem>
                {uniqueTenders.map((tender) => (
                  <SelectItem key={tender.id} value={tender.id}>
                    {tender.title.length > 30
                      ? `${tender.title.substring(0, 30)}...`
                      : tender.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bids Table */}
          <div className="rounded-lg border border-gray-100/50 overflow-hidden bg-white/80 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-32">{t("bid_details")}</TableHead>
                  <TableHead>{t("tender")}</TableHead>
                  <TableHead>{t("vendor")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("submitted")}</TableHead>
                  <TableHead className="w-32">{t("status")}</TableHead>
                  <TableHead className="w-20">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-500">
                        No bids found
                      </p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your filters or search term
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBids.map((bid) => (
                    <TableRow
                      key={bid._id}
                      className="hover:bg-gray-50/50 border-b border-gray-100/50"
                    >
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(bid.status)}
                          <div className="ml-2">
                            <div className="font-medium text-gray-900 text-sm">
                              {bid._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <Link
                            href={`/admin/tenders/${bid.tender?._id}`}
                            className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {bid.tender?.title || "N/A"}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {bid.tender?._id?.substring(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {bid.bidder?.companyName ||
                                bid.bidder?.email ||
                                "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {bid.bidder?.userType || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {formatAmount(bid.amount)}
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {formatDate(bid.createdAt)}
                      </TableCell>
                      <TableCell>{getStatusBadge(bid.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <Link href={`/admin/bids/${bid._id}`} passHref>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("view_details")}
                              </DropdownMenuItem>
                            </Link>
                            {bid.documents && bid.documents.length > 0 && (
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                {t("view_documents")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </motion.div>

      {/* Document Upload Dialog (unchanged) */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-white/90 backdrop-blur-xl border border-gray-100/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {t("upload_documents")}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("upload_additional_documents_for_this_bid")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="document-upload"
                className="text-sm font-medium text-gray-700"
              >
                {t("select_documents")}
              </Label>
              <Input
                id="document-upload"
                type="file"
                multiple
                className="mt-2 bg-white/80 backdrop-blur-sm border border-gray-200/50"
              />
            </div>
            <div>
              <Label
                htmlFor="document-notes"
                className="text-sm font-medium text-gray-700"
              >
                {t("add_any_notes_about_these_documents")}
              </Label>
              <Textarea
                id="document-notes"
                placeholder={t("add_any_notes_about_these_documents")}
                className="mt-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 resize-none"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              className="bg-white/80 backdrop-blur-sm border border-gray-200/50"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setUploadDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t("upload_documents")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
