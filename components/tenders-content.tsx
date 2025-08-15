"use client";

import { useState } from "react";
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
  Search,
  Eye,
  Building,
  DollarSign,
  Users,
  FileText,
  MoreVertical,
} from "lucide-react";

const mockTenders = [
  {
    id: "TND-001",
    title: "Road Construction Project - Doha North",
    organization: "Ministry of Infrastructure",
    category: "Construction",
    budget: "$2,500,000",
    status: "active",
    bidsCount: 12,
    submittedDate: "2023-12-01",
    description:
      "Major road construction project covering 15km of highway infrastructure in North Doha area.",
    type: "business",
  },
  {
    id: "TND-002",
    title: "IT Equipment Procurement",
    organization: "Ministry of Technology",
    category: "Technology",
    budget: "$850,000",
    status: "active",
    bidsCount: 8,
    submittedDate: "2023-12-03",
    description:
      "Procurement of computers, servers, and networking equipment for government offices.",
    type: "business",
  },
  {
    id: "TND-003",
    title: "Healthcare Equipment Tender",
    organization: "Ministry of Health",
    category: "Healthcare",
    budget: "$1,200,000",
    status: "active",
    bidsCount: 15,
    submittedDate: "2023-12-05",
    description:
      "Medical equipment procurement for new hospital facilities across Qatar.",
    type: "business",
  },
  {
    id: "TND-004",
    title: "Office Supplies Annual Contract",
    organization: "Government Services",
    category: "Supplies",
    budget: "$300,000",
    status: "awarded",
    bidsCount: 6,
    submittedDate: "2023-12-07",
    description:
      "Annual contract for office supplies and stationery for government departments.",
    type: "business",
  },
  {
    id: "TND-005",
    title: "Security Services Contract",
    organization: "Ministry of Interior",
    category: "Services",
    budget: "$950,000",
    status: "active",
    bidsCount: 4,
    submittedDate: "2023-12-10",
    description: "Security services for government buildings and facilities.",
    type: "individual",
  },
];

export function TendersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all"); // New filter for type
  const [selectedTender, setSelectedTender] = useState(null);

  const filteredTenders = mockTenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tender.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || tender.category === categoryFilter;
    const matchesType =
      typeFilter === "all" || tender.type === typeFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const getStatusBadge = (status: "active" | "rejected" | string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  interface Tender {
    id: string | number;
    title?: string;
    description?: string;
  }

  const handleViewDetails = (tender: Tender) => {
    window.location.href = `/admin/tenders/${tender.id}`;
  };
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Tenders
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockTenders.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active submissions</p>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Tenders
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockTenders.filter((t) => t.status === "active").length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently open</p>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Bids
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {mockTenders.reduce((sum, tender) => sum + tender.bidsCount, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all tenders</p>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">$5.8M</div>
            <p className="text-xs text-gray-500 mt-1">Combined budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-0">
        <CardHeader>
          <CardTitle>Tender Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Supplies">Supplies</SelectItem>
              </SelectContent>
            </Select>

            {/* New Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tenders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tender Details</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tender.title}</div>
                        <div className="text-sm text-gray-500">{tender.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {tender.organization}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tender.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {tender.budget}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tender.bidsCount}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(tender.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(tender)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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
