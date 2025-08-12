"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Building, Calendar, DollarSign, FileText, User, Mail, Phone, MapPin, Activity } from "lucide-react"
import { useRouter } from "next/navigation"

const mockUser = {
  id: "USR-001",
  name: "Qatar Construction Co.",
  type: "Business",
  email: "info@qatarconstruction.qa",
  phone: "+974 4444 1234",
  registrationDate: "2023-01-15",
  status: "active",
  kycStatus: "verified",
  address: "Building 123, Industrial Area, Doha, Qatar",
  website: "www.qatarconstruction.qa",
  businessDetails: {
    registrationNumber: "QC-2019-001234",
    establishedYear: "2008",
    employees: "250+",
    annualRevenue: "$50M",
    businessType: "Construction & Infrastructure",
    taxId: "TAX-123456789",
  },
  contactPerson: {
    name: "Mohammed Al-Thani",
    title: "Business Development Manager",
    email: "mohammed.althani@qatarconstruction.qa",
    phone: "+974 4444 5678",
  },
  statistics: {
    totalTenders: 15,
    totalBids: 28,
    successfulBids: 8,
    totalValue: "$45M",
  },
  recentActivity: [
    { date: "2023-12-15", action: "Submitted bid for Road Construction Project", type: "bid" },
    { date: "2023-12-10", action: "Updated company profile", type: "profile" },
    { date: "2023-12-05", action: "Submitted tender for IT Equipment", type: "tender" },
    { date: "2023-12-01", action: "KYC documents verified", type: "kyc" },
  ],
  documents: [
    { name: "Commercial Registration", status: "verified", uploadDate: "2023-01-15" },
    { name: "Tax Certificate", status: "verified", uploadDate: "2023-01-15" },
    { name: "Insurance Certificate", status: "verified", uploadDate: "2023-01-20" },
    { name: "Bank Statement", status: "pending", uploadDate: "2023-12-01" },
  ],
}

function UserDetailsContent() {
  const router = useRouter()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{mockUser.name}</h1>
            <p className="text-gray-600">
              {mockUser.id} • {mockUser.type}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {getStatusBadge(mockUser.status)}
          {getKycBadge(mockUser.kycStatus)}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tenders</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{mockUser.statistics.totalTenders}</div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Bids</CardTitle>
            <Building className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{mockUser.statistics.totalBids}</div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((mockUser.statistics.successfulBids / mockUser.statistics.totalBids) * 100)}%
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{mockUser.statistics.totalValue}</div>
          </CardContent>
        </Card>
      </div>

      {/* ... existing code for tabs and detailed information ... */}

      {/* Detailed Information */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="shadow-0">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Company Name</p>
                    <p className="font-medium">{mockUser.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-blue-600">{mockUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{mockUser.phone}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{mockUser.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Registration Date</p>
                    <p className="font-medium">{mockUser.registrationDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card className="shadow-0">
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Registration Number</p>
                    <p className="font-medium">{mockUser.businessDetails.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Established</p>
                    <p className="font-medium">{mockUser.businessDetails.establishedYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Employees</p>
                    <p className="font-medium">{mockUser.businessDetails.employees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Annual Revenue</p>
                    <p className="font-medium">{mockUser.businessDetails.annualRevenue}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Business Type</p>
                  <p className="font-medium">{mockUser.businessDetails.businessType}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Tax ID</p>
                  <p className="font-medium">{mockUser.businessDetails.taxId}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Website</p>
                  <p className="font-medium text-blue-600">{mockUser.website}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Person */}
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>Contact Person</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{mockUser.contactPerson.name}</p>
                    <p className="text-sm text-gray-500">{mockUser.contactPerson.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-blue-600">{mockUser.contactPerson.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{mockUser.contactPerson.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUser.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Activity className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                    <Badge variant="outline">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="shadow-0">
            <CardHeader>
              <CardTitle>KYC Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUser.documents.map((doc, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell>{getKycBadge(doc.status)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  return <UserDetailsContent />
}
