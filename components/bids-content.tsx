"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Building, Gavel, Clock, CheckCircle } from "lucide-react"

const mockBids = [
  {
    id: "BID-001",
    tenderTitle: "Road Construction Project - Doha North",
    tenderId: "TND-001",
    vendor: "Qatar Construction Co.",
    vendorType: "Business",
    amount: "$2,200,000",
    submittedDate: "2023-12-10",
    status: "submitted",
    documents: ["proposal.pdf", "technical-specs.pdf", "company-profile.pdf"],
    notes: "Comprehensive proposal with 15 years experience in road construction.",
    flagged: false,
  },
  {
    id: "BID-002",
    tenderTitle: "IT Equipment Procurement",
    tenderId: "TND-002",
    vendor: "Tech Solutions Qatar",
    vendorType: "Business",
    amount: "$780,000",
    submittedDate: "2023-12-12",
    status: "submitted",
    documents: ["bid-proposal.pdf", "equipment-specs.pdf"],
    notes: "Competitive pricing with local support services included.",
    flagged: false,
  },
  {
    id: "BID-003",
    tenderTitle: "Healthcare Equipment Tender",
    tenderId: "TND-003",
    vendor: "MedEquip International",
    vendorType: "Business",
    amount: "$1,150,000",
    submittedDate: "2023-12-14",
    status: "accepted",
    documents: ["medical-proposal.pdf", "certifications.pdf", "warranty-terms.pdf"],
    notes: "ISO certified equipment with 5-year warranty and training included.",
    flagged: false,
  },
  {
    id: "BID-004",
    tenderTitle: "Office Supplies Annual Contract",
    tenderId: "TND-004",
    vendor: "Suspicious Vendor LLC",
    vendorType: "Business",
    amount: "$50,000",
    submittedDate: "2023-12-15",
    status: "submitted",
    documents: ["basic-proposal.pdf"],
    notes: "Unusually low bid amount. Multiple submissions from same IP address detected.",
    flagged: true,
  },
  {
    id: "BID-005",
    tenderTitle: "Security Services Contract",
    tenderId: "TND-005",
    vendor: "Elite Security Services",
    vendorType: "Business",
    amount: "$920,000",
    submittedDate: "2023-12-16",
    status: "accepted",
    documents: ["security-proposal.pdf", "staff-credentials.pdf"],
    notes: "Did not meet minimum experience requirements.",
    flagged: false,
  },
  {
    id: "BID-006",
    tenderTitle: "Road Construction Project - Doha North",
    tenderId: "TND-001",
    vendor: "Ahmed Al-Rashid",
    vendorType: "Individual",
    amount: "$2,450,000",
    submittedDate: "2023-12-11",
    status: "submitted",
    documents: ["individual-proposal.pdf", "experience-letter.pdf"],
    notes: "Individual contractor with 10 years experience.",
    flagged: false,
  },
]

export function BidsContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tenderFilter, setTenderFilter] = useState("all")
  const [vendorTypeFilter, setVendorTypeFilter] = useState("all")
  const [selectedBid, setSelectedBid] = useState(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  const filteredBids = mockBids.filter((bid) => {
    const matchesSearch =
      bid.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.tenderTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter
    const matchesTender = tenderFilter === "all" || bid.tenderId === tenderFilter
    const matchesVendorType = vendorTypeFilter === "all" || bid.vendorType.toLowerCase() === vendorTypeFilter

    return matchesSearch && matchesStatus && matchesTender && matchesVendorType
  })

  const getStatusBadge = (status, flagged) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Submitted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status, flagged) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "submitted":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleFlagBid = (bidId) => {
    console.log("Flagging bid:", bidId)
    // Handle flag logic
  }

  const handleRemoveBid = (bidId) => {
    console.log("Removing bid:", bidId)
    // Handle remove logic
  }

  const handleRejectBid = (bidId) => {
    console.log("Rejecting bid:", bidId)
    // Handle reject logic
  }

  const handleViewDetails = (bid) => {
    window.location.href = `/admin/bids/${bid.id}`
  }

  const handleUploadDocuments = (bidId) => {
    console.log("Uploading documents for bid:", bidId)
    setUploadDialogOpen(true)
  }

  const uniqueTenders = [...new Set(mockBids.map((bid) => ({ id: bid.tenderId, title: bid.tenderTitle })))]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bids</CardTitle>
            <Gavel className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{mockBids.length}</div>
            <p className="text-xs text-gray-500 mt-1">All submissions</p>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mockBids.filter((b) => b.status === "submitted").length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Accepted Bids</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockBids.filter((b) => b.status === "accepted").length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Successful bids</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-0">
        <CardHeader>
          <CardTitle>Bid Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bids, vendors, tenders..."
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
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tenderFilter} onValueChange={setTenderFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by tender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tenders</SelectItem>
                {uniqueTenders.map((tender) => (
                  <SelectItem key={tender.id} value={tender.id}>
                    {tender.title.substring(0, 30)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={vendorTypeFilter} onValueChange={setVendorTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Vendor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bids Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bid Details</TableHead>
                  <TableHead>Tender</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.map((bid) => (
                  <TableRow key={bid.id} className={bid.flagged ? "bg-red-50" : ""}>
                    <TableCell>
                      <div className="flex items-center">
                        {getStatusIcon(bid.status, bid.flagged)}
                        <div className="ml-2">
                          <div className="font-medium">{bid.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate">{bid.tenderTitle}</div>
                        <div className="text-sm text-gray-500">{bid.tenderId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div className="font-medium">{bid.vendor}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{bid.amount}</TableCell>
                    <TableCell className="text-sm">{bid.submittedDate}</TableCell>
                    <TableCell>{getStatusBadge(bid.status, bid.flagged)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(bid)}>
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

      {/* Document Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>Upload additional documents for this bid</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-upload">Select Documents</Label>
              <Input id="document-upload" type="file" multiple className="mt-2" />
            </div>
            <div>
              <Label htmlFor="document-notes">Notes (Optional)</Label>
              <Textarea id="document-notes" placeholder="Add any notes about these documents..." className="mt-2" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setUploadDialogOpen(false)}>Upload Documents</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
