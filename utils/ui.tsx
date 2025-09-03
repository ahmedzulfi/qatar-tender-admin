// types/ui.ts
export type UiTender = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId?: string;
  location?: string;
  contactEmail?: string;
  image?: string;
  budget: number;
  postedBy?: any;
  status: string;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  postedDate: string;
  deadlineDate: string;
  bidCount: number;
  awardedBid: boolean;
  isCompleted: boolean;
  rejectionReason?: string;
};

// types/tender.ts

export interface User {
  _id: string;
  email: string;
  userType: "individual" | "business" | "admin";
  isDocumentVerified?: "verified" | "pending" | "rejected";
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  _id: string;
  tender: string;
  bidder: User;
  amount: number;
  proposal: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Tender {
  _id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  contactEmail: string;
  image?: string;
  estimatedBudget: number;
  deadline: string;
  status: "active" | "awarded" | "closed" | "rejected" | "completed";
  postedBy: User;
  awardedTo?: User;
  createdAt: string;
  updatedAt: string;
}

// API Filter types
export interface TenderFilters {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "newest" | "oldest" | "budget-high" | "budget-low";
}

// API Response types
export interface TenderApiResponse {
  tenders?: Tender[];
  tender?: Tender;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalTenders: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form data types
export interface CreateTenderData {
  title: string;
  description: string;
  category: string;
  location: string;
  contactEmail: string;
  image?: string;
  estimatedBudget: number;
  deadline: string;
}

export interface UpdateTenderData {
  title?: string;
  description?: string;
  location?: string;
  contactEmail?: string;
  image?: string;
  estimatedBudget?: number;
  deadline?: string;
}

// Component-specific types (for backward compatibility with existing TenderCard)
export interface TenderCardData {
  id: string;
  postedTime: string;
  isUrgent: boolean;
  title: string;
  userVerified: boolean;
  rating: number;
  amountSpent: string;
  location: string;
  jobType: "Fixed-Price" | "Hourly";
  budget: string;
  description: string;
  category: string;
  proposals: string;
  estimatedTime?: string;
  hourlyRate?: string;
}

// Filter option types
export interface FilterOption {
  label: string;
  count: number;
  min?: number;
  max?: number;
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}
