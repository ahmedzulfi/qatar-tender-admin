// "use client"

// import { useState } from "react"
// import {
//   LayoutDashboard,
//   CreditCard,
//   Tags,
//   Settings,
//   Shield,
//   FileText,
//   Gavel,
//   Users,
//   UserCheck,
//   BarChart3,
//   Menu,
//   X,
//   Search,
//   User,
//   LogOut,
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { DashboardContent } from "@/components/dashboard-content"
// import { TendersContent } from "@/components/tenders-content"
// import { BidsContent } from "@/components/bids-content"
// import { TransactionsContent } from "@/components/transactions-content"
// import { CategoriesContent } from "@/components/categories-content"
// import { SettingsContent } from "@/components/settings-content"
// import { AdminControlsContent } from "@/components/admin-controls-content"
// import { AnalyticsContent } from "@/components/analytics-content"

// import { useTranslation } from '../lib/hooks/useTranslation';
// const navigation = [
//   { name: "Dashboard", href: "#", icon: LayoutDashboard, current: true },
//   { name: "Tenders", href: "#", icon: FileText, current: false },
//   { name: "Bids", href: "#", icon: Gavel, current: false },
//   { name: "Users", href: "#", icon: Users, current: false },
//   { name: "KYC", href: "#", icon: UserCheck, current: false },
//   { name: "Transactions", href: "#", icon: CreditCard, current: false },
//   { name: "Analytics", href: "#", icon: BarChart3, current: false },
//   { name: "Categories", href: "#", icon: Tags, current: false },
//   { name: "Settings", href: "#", icon: Settings, current: false },
//   { name: "Admin Controls", href: "#", icon: Shield, current: false },
// ]

// function classNames(...classes: string[]) {
//   return classes.filter(Boolean).join(" ")
// }

// export function AdminDashboard() {
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [currentPage, setCurrentPage] = useState("Dashboard")
//       const { t } = useTranslation();
//   const renderPageContent = () => {

//     switch (currentPage) {
//       case "Dashboard":
//         return <DashboardContent />
//       case "Tenders":
//         return <TendersContent />
//       case "Bids":
//         return <BidsContent />
//       case "Users":
//         return <UsersContent />
//       case "KYC":
//         return <KycContent />
//       case "Transactions":
//         return <TransactionsContent />
//       case "Analytics":
//         return <AnalyticsContent />
//       case "Categories":
//         return <CategoriesContent />
//       case "Settings":
//         return <SettingsContent />
//       case "Admin Controls":
//         return <AdminControlsContent />
//       default:
//         return <DashboardContent />
//     }
//   }

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Mobile sidebar */}
//       <div
//         className={classNames(
//           sidebarOpen ? "translate-x-0" : "-translate-x-full",
//           "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
//         )}
//       >
//         <div className="flex h-16 items-center justify-between px-6 border-b">
//           <h1 className="text-xl font-bold text-gray-900">{t('qatar_tender')}</h1>
//           <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
//             <X className="h-5 w-5" />
//           </Button>
//         </div>
//         <nav className="mt-6 px-3">
//           <ul className="space-y-1">
//             {navigation.map((item) => (
//               <li key={item.name}>
//                 <button
//                   onClick={() => {
//                     setCurrentPage(item.name)
//                     setSidebarOpen(false)
//                   }}
//                   className={classNames(
//                     currentPage === item.name
//                       ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
//                       : "text-gray-700 hover:bg-gray-50",
//                     "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
//                   )}
//                 >
//                   <item.icon
//                     className={classNames(
//                       currentPage === item.name ? "text-blue-700" : "text-gray-400",
//                       "mr-3 h-5 w-5 flex-shrink-0",
//                     )}
//                   />
//                   {item.name}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div>

//       {/* Desktop sidebar */}
//       <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
//         <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
//           <div className="flex h-16 items-center px-6 border-b">
//             <h1 className="text-xl font-bold text-gray-900">{t('qatar_tender')}</h1>
//           </div>
//           <nav className="mt-6 flex-1 px-3">
//             <ul className="space-y-1">
//               {navigation.map((item) => (
//                 <li key={item.name}>
//                   <button
//                     onClick={() => setCurrentPage(item.name)}
//                     className={classNames(
//                       currentPage === item.name
//                         ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
//                         : "text-gray-700 hover:bg-gray-50",
//                       "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
//                     )}
//                   >
//                     <item.icon
//                       className={classNames(
//                         currentPage === item.name ? "text-blue-700" : "text-gray-400",
//                         "mr-3 h-5 w-5 flex-shrink-0",
//                       )}
//                     />
//                     {item.name}
//                   </button>
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="flex flex-1 flex-col lg:pl-64">
//         <header className="bg-white border-b border-gray-200">
//           <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center">
//               <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
//                 <Menu className="h-5 w-5" />
//               </Button>
//               <div className="ml-4 lg:ml-0">
//                 <h2 className="text-xl font-semibold text-gray-900">{currentPage}</h2>
//               </div>
//             </div>

//             <div className="flex items-center space-x-4">
//               <div className="relative hidden md:block">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//                 <Input placeholder={t('search')} className="pl-10 w-64" />
//               </div>

//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
//                       <AvatarFallback>AD</AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56" align="end" forceMount>
//                   <DropdownMenuLabel className="font-normal">
//                     <div className="flex flex-col space-y-1">
//                       <p className="text-sm font-medium leading-none">{t('admin_user')}</p>
//                       <p className="text-xs leading-none text-muted-foreground">{t('adminqatartendercom')}</p>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem>
//                     <User className="mr-2 h-4 w-4" />
//                     <span>Profile</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem>
//                     <Settings className="mr-2 h-4 w-4" />
//                     <span>Settings</span>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem>
//                     <LogOut className="mr-2 h-4 w-4" />
//                     <span>{t('log_out')}</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </header>

//         {/* Page content */}
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 sm:p-6 lg:p-8">
//             <div className="mb-8">
//               <p className="text-gray-600 mt-1">
//                 {currentPage === "Dashboard" && "Overview of your Qatar Tender Platform"}
//                 {currentPage === "Tenders" && "Manage and review all tender submissions"}
//                 {currentPage === "Bids" && "Monitor and manage all bid submissions"}
//                 {currentPage === "Users" && "Manage platform users and their accounts"}
//                 {currentPage === "KYC" && "Review and verify user KYC documents"}
//                 {currentPage === "Transactions" && "Manage payments and financial transactions"}
//                 {currentPage === "Analytics" && "Detailed platform analytics and reporting"}
//                 {currentPage === "Categories" && "Organize tender categories and tags"}
//                 {currentPage === "Settings" && "Configure platform settings"}
//                 {currentPage === "Admin Controls" && "Advanced administrative functions"}
//               </p>
//             </div>
//             {renderPageContent()}
//           </div>
//         </main>
//       </div>

//       {sidebarOpen && (
//         <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={() => setSidebarOpen(false)} />
//       )}
//     </div>
//   )
// }
import React from 'react'

function admindashboard() {
  return (
    <div>admin-dashboard</div>
  )
}

export default admindashboard