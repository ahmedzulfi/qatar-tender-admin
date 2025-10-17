"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  User,
  FileText,
  Gavel,
  Building,
  Mail,
  Phone,
  MapPin,
  Star,
  Clock,
  DollarSign,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Eye,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { adminService } from "@/services/adminService";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface SearchResult {
  _id: string;
  email?: string;
  name?: string;
  title?: string;
  description?: string;
  status?: string;
  userType?: string;
  category?: {
    name?: string;
  };
  postedBy?: {
    email?: string;
    userType?: string;
  };
  bidder?: {
    email?: string;
    userType?: string;
  };
  tender?: {
    title?: string;
    status?: string;
  };
  amount?: number;
  budget?: number;
  bidCount?: number;
  deadline?: string;
  createdAt?: string;
  isVerified?: boolean;
  isDocumentVerified?: string;
  isBanned?: boolean;
  profile?: {
    fullName?: string;
    companyName?: string;
    phone?: string;
    address?: string;
    nationalId?: string;
    commercialRegistrationNumber?: string;
    nationalIdFront?: string;
    nationalIdBack?: string;
    commercialRegistrationDoc?: string;
  };
}

export default function UniversalSearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults({});
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await adminService.universalSearch(query);
        if (res.success) {
          setResults(res?.data || {});
        } else {
          setError(res.error || "Failed to perform search");
        }
      } catch (err) {
        setError("An unexpected error occurred during search");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 500); // debounce 0.5s

    return () => clearTimeout(delay);
  }, [query]);

  // Calculate total results for badge
  const getTotalResults = () => {
    let count = 0;
    Object.values(results).forEach((items: any) => {
      if (Array.isArray(items)) {
        count += items.length;
      }
    });
    return count;
  };

  // Get results for active tab
  const getResultsForTab = () => {
    if (activeTab === "all") {
      return results;
    }
    return { [activeTab]: results[activeTab] };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "QAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get link based on entity type and ID
  const getLink = (type: string, id: string) => {
    switch (type) {
      case "users":
        return `/admin/users/${id}`;
      case "tenders":
        return `/admin/tenders/${id}`;
      case "bids":
        return `/admin/bids/${id}`;
      case "kyc":
        return `/admin/kyc/${id}`;
      default:
        return "#";
    }
  };

  // Get icon based on entity type
  const getEntityIcon = (type: string) => {
    switch (type) {
      case "users":
        return <User className="h-4 w-4" />;
      case "tenders":
        return <FileText className="h-4 w-4" />;
      case "bids":
        return <Gavel className="h-4 w-4" />;
      case "kyc":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string, entityType: string) => {
    if (!status) return null;

    const statusLower = status.toLowerCase();

    if (entityType === "user") {
      if (statusLower.includes("verified")) {
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            {t("verified")}
          </Badge>
        );
      } else if (statusLower.includes("pending")) {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            {t("pending")}
          </Badge>
        );
      } else if (statusLower.includes("rejected")) {
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            {t("rejected")}
          </Badge>
        );
      } else if (statusLower.includes("banned")) {
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            {t("banned")}
          </Badge>
        );
      }
    } else if (entityType === "tender") {
      if (statusLower === "active") {
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            {t("active")}
          </Badge>
        );
      } else if (statusLower === "closed") {
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
            {t("closed")}
          </Badge>
        );
      } else if (statusLower === "awarded") {
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            {t("awarded")}
          </Badge>
        );
      }
    } else if (entityType === "bid") {
      if (statusLower === "accepted") {
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            {t("accepted")}
          </Badge>
        );
      } else if (statusLower === "rejected") {
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            {t("rejected")}
          </Badge>
        );
      } else if (statusLower === "pending") {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            {t("pending")}
          </Badge>
        );
      }
    }

    return (
      <Badge variant="outline" className="capitalize">
        {status}
      </Badge>
    );
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setResults({});
    setError(null);
  };

  // Loading skeleton for results
  const renderSkeleton = () => (
    <div className="grid gap-3">
      {[...Array(5)].map((_, i) => (
        <Card
          key={i}
          className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-100/50"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1 min-w-0">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-[#0f0f0f] dark:to-[#1a1a1a] px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("universal_search")}
            </h1>
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="icon"
              className="hover:bg-white/80 dark:hover:bg-neutral-800/80 backdrop-blur-sm"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-100/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t("search_across_all_modules")}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-12 py-5 text-base bg-transparent border-none focus:ring-0 focus:outline-none"
                  autoFocus
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 h-8 w-8 p-0 hover:bg-transparent"
                  >
                    <XCircle className="h-5 w-5 text-gray-400" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        {(loading || Object.keys(results).length > 0 || error) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("search_results")}
                </h2>
                {getTotalResults() > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {getTotalResults()}
                  </Badge>
                )}
              </div>

              {query && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  "{query}"
                </span>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    {t("searching")}
                  </span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Results Content */}
            {!loading && !error && Object.keys(results).length > 0 && (
              <>
                {/* Tabs for filtering */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="mb-4"
                >
                  <TabsList className="grid w-full grid-cols-3 mb-4 bg-white/80 backdrop-blur-sm rounded-xl p-1">
                    <TabsTrigger
                      value="users"
                      className="flex items-center gap-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-lg py-1.5 text-xs"
                    >
                      <User className="h-3 w-3" />
                      {t("users")}
                      {results.users && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-4 px-1.5 text-xs"
                        >
                          {Array.isArray(results.users)
                            ? results.users.length
                            : 0}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="tenders"
                      className="flex items-center gap-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-lg py-1.5 text-xs"
                    >
                      <FileText className="h-3 w-3" />
                      {t("tenders")}
                      {results.tenders && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-4 px-1.5 text-xs"
                        >
                          {Array.isArray(results.tenders)
                            ? results.tenders.length
                            : 0}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="bids"
                      className="flex items-center gap-1 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-lg py-1.5 text-xs"
                    >
                      <Gavel className="h-3 w-3" />
                      {t("bids")}
                      {results.bids && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-4 px-1.5 text-xs"
                        >
                          {Array.isArray(results.bids)
                            ? results.bids.length
                            : 0}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* All Results Tab 
                  <TabsContent value="all">
                    <div className="space-y-3">
                      {Object.entries(getResultsForTab()).map(
                        ([type, items]) => {
                          if (!Array.isArray(items) || items.length === 0)
                            return null;

                          return (
                            <div key={type}>
                              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 px-1">
                                {t(type)}
                              </h3>

                              <div className="space-y-3">
                                {items.map(
                                  (item: SearchResult, index: number) => (
                                    <Link
                                      key={index}
                                      href={getLink(type, item._id)}
                                      className="block"
                                    >
                                      <Card className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-100/50 hover:bg-gray-50/50 transition-colors">
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                              <div className="bg-gray-100 rounded-lg p-2 flex-shrink-0">
                                                {getEntityIcon(type)}
                                              </div>
                                              <div className="space-y-1 flex-1 min-w-0">
                                                {type === "users" && (
                                                  <>
                                                    <p className="font-medium text-gray-900 truncate">
                                                      {item.profile?.fullName ||
                                                        item.profile
                                                          ?.companyName ||
                                                        item.email}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                      <span className="text-xs text-gray-500 capitalize">
                                                        {item.userType}
                                                      </span>
                                                      {getStatusBadge(
                                                        item.isDocumentVerified ||
                                                          (item.isBanned
                                                            ? "banned"
                                                            : "active"),
                                                        "user"
                                                      )}
                                                    </div>
                                                  </>
                                                )}

                                                {type === "tenders" && (
                                                  <>
                                                    <p className="font-medium text-gray-900 truncate">
                                                      {item.title}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                      <span className="text-xs text-gray-500">
                                                        {formatCurrency(
                                                          item.budget || 0
                                                        )}
                                                      </span>
                                                      {item.bidCount !==
                                                        undefined && (
                                                        <>
                                                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                          <span className="text-xs text-gray-500">
                                                            {item.bidCount}{" "}
                                                            {t("bids")}
                                                          </span>
                                                        </>
                                                      )}
                                                      {getStatusBadge(
                                                        item.status!,
                                                        "tender"
                                                      )}
                                                    </div>
                                                  </>
                                                )}

                                                {type === "bids" && (
                                                  <>
                                                    <p className="font-medium text-gray-900 truncate">
                                                      {t("bid_on")} "
                                                      {item.tender?.title}"
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                      <span className="text-xs text-gray-500">
                                                        {formatCurrency(
                                                          item.amount || 0
                                                        )}
                                                      </span>
                                                      {getStatusBadge(
                                                        item.status!,
                                                        "bid"
                                                      )}
                                                    </div>
                                                  </>
                                                )}

                                                {type === "kyc" && (
                                                  <>
                                                    <p className="font-medium text-gray-900 truncate">
                                                      {item.profile?.fullName ||
                                                        item.profile
                                                          ?.companyName ||
                                                        item.email}
                                                    </p>
                                                    <div className="flex items-center space-x-2">
                                                      <span className="text-xs text-gray-500 capitalize">
                                                        {item.userType}
                                                      </span>
                                                      {getStatusBadge(
                                                        item.isDocumentVerified!,
                                                        "user"
                                                      )}
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </Link>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </TabsContent>*/}

                  {/* Individual Type Tabs */}
                  {(["users", "tenders", "bids"] as const).map((type) => (
                    <TabsContent key={type} value={type}>
                      {results[type] &&
                      Array.isArray(results[type]) &&
                      results[type].length > 0 ? (
                        <div className="space-y-3">
                          {results[type].map(
                            (item: SearchResult, index: number) => (
                              <Link
                                key={index}
                                href={getLink(type, item._id)}
                                className="block"
                              >
                                <Card className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-100/50 hover:bg-gray-50/50 transition-colors">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="bg-gray-100 rounded-lg p-2 flex-shrink-0">
                                          {getEntityIcon(type)}
                                        </div>
                                        <div className="space-y-1 flex-1 min-w-0">
                                          {type === "users" && (
                                            <>
                                              <p className="font-medium text-gray-900 truncate">
                                                {item.profile?.fullName ||
                                                  item.profile?.companyName ||
                                                  item.email}
                                              </p>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500 capitalize">
                                                  {item.userType}
                                                </span>
                                                {getStatusBadge(
                                                  item.isDocumentVerified ||
                                                    (item.isBanned
                                                      ? "banned"
                                                      : "active"),
                                                  "user"
                                                )}
                                              </div>
                                            </>
                                          )}

                                          {type === "tenders" && (
                                            <>
                                              <p className="font-medium text-gray-900 truncate">
                                                {item.title}
                                              </p>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">
                                                  {formatCurrency(
                                                    item.budget || 0
                                                  )}
                                                </span>
                                                {item.bidCount !==
                                                  undefined && (
                                                  <>
                                                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                    <span className="text-xs text-gray-500">
                                                      {item.bidCount}{" "}
                                                      {t("bids")}
                                                    </span>
                                                  </>
                                                )}
                                                {getStatusBadge(
                                                  item.status!,
                                                  "tender"
                                                )}
                                              </div>
                                            </>
                                          )}

                                          {type === "bids" && (
                                            <>
                                              <p className="font-medium text-gray-900 truncate">
                                                {t("bid_on")} "
                                                {item.tender?.title}"
                                              </p>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">
                                                  {formatCurrency(
                                                    item.amount || 0
                                                  )}
                                                </span>
                                                {getStatusBadge(
                                                  item.status!,
                                                  "bid"
                                                )}
                                              </div>
                                            </>
                                          )}

                                          {/* {type === "kyc" && (
                                            <>
                                              <p className="font-medium text-gray-900 truncate">
                                                {item.profile?.fullName ||
                                                  item.profile?.companyName ||
                                                  item.email}
                                              </p>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500 capitalize">
                                                  {item.userType}
                                                </span>
                                                {getStatusBadge(
                                                  item.isDocumentVerified!,
                                                  "user"
                                                )}
                                              </div>
                                            </>
                                          )} */}
                                        </div>
                                      </div>
                                      <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                                    </div>
                                  </CardContent>
                                </Card>
                              </Link>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">
                            {t("no_results_found")}
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading &&
          !error &&
          Object.keys(results).length === 0 &&
          query === "" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {t("start_searching")}
              </h2>
              <p className="text-gray-500 text-sm">
                {t("search_users_tenders_and_more")}
              </p>
            </motion.div>
          )}
      </div>
    </div>
  );
}
