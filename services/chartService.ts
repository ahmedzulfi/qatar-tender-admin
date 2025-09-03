// services/chartService.ts
import { getUserBids } from "./BidService";
import { getTenders } from "./tenderService";

export interface ChartDataPoint {
  date: string;
  tendersPosted: number;
  bidsReceived: number;
}

export interface DashboardStats {
  totalTenders: number;
  totalBids: number;
  activeTenders: number;
  completedTenders: number;
  successRate: number;
  averageBidAmount: number;
}

export interface TenderCategoryData {
  category: string;
  count: number;
  value: number;
}

export interface BidStatusData {
  status: string;
  count: number;
  percentage: number;
}

// Transform tenders and bids data into chart format
export const getOverviewChartData = async (
  days: number = 90
): Promise<ChartDataPoint[]> => {
  try {
    const [tenders, bids] = await Promise.all([getTenders(), getUserBids()]);

    // Create date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Generate date array
    const dateArray: string[] = [];
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dateArray.push(d.toISOString().split("T")[0]);
    }

    // Group tenders by date
    const tendersMap = new Map<string, number>();
    tenders.forEach((tender: any) => {
      const date = new Date(tender.createdAt || tender.updatedAt)
        .toISOString()
        .split("T")[0];
      tendersMap.set(date, (tendersMap.get(date) || 0) + 1);
    });

    // Group bids by date
    const bidsMap = new Map<string, number>();
    bids.forEach((bid: any) => {
      const date = new Date(bid.createdAt || bid.updatedAt)
        .toISOString()
        .split("T")[0];
      bidsMap.set(date, (bidsMap.get(date) || 0) + 1);
    });

    // Create chart data
    return dateArray.map((date) => ({
      date,
      tendersPosted: tendersMap.get(date) || 0,
      bidsReceived: bidsMap.get(date) || 0,
    }));
  } catch (error) {
    console.error("Error fetching chart data:", error);
    // Return mock data as fallback
    return generateMockChartData(days);
  }
};

// Get dashboard statistics from existing data
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const [tenders, bids] = await Promise.all([getTenders(), getUserBids()]);

    const activeTenders = tenders.filter(
      (t: any) => t.status === "active"
    ).length;
    const completedTenders = tenders.filter((t: any) =>
      ["awarded", "completed"].includes(t.status)
    ).length;

    const acceptedBids = bids.filter(
      (b: any) => b.status === "accepted"
    ).length;
    const successRate =
      bids.length > 0 ? (acceptedBids / bids.length) * 100 : 0;

    const totalBidAmount = bids.reduce(
      (sum: number, bid: any) => sum + (bid.amount || 0),
      0
    );
    const averageBidAmount = bids.length > 0 ? totalBidAmount / bids.length : 0;

    return {
      totalTenders: tenders.length,
      totalBids: bids.length,
      activeTenders,
      completedTenders,
      successRate: Math.round(successRate),
      averageBidAmount: Math.round(averageBidAmount),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalTenders: 0,
      totalBids: 0,
      activeTenders: 0,
      completedTenders: 0,
      successRate: 0,
      averageBidAmount: 0,
    };
  }
};

// Get tender categories distribution
export const getTenderCategoriesData = async (): Promise<
  TenderCategoryData[]
> => {
  try {
    const tenders = await getTenders();

    const categoryMap = new Map<
      string,
      { count: number; totalValue: number }
    >();

    tenders.forEach((tender: any) => {
      const categoryName = tender.category?.name || "Uncategorized";
      const current = categoryMap.get(categoryName) || {
        count: 0,
        totalValue: 0,
      };
      categoryMap.set(categoryName, {
        count: current.count + 1,
        totalValue: current.totalValue + (tender.estimatedBudget || 0),
      });
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        value: data.totalValue,
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error("Error fetching category data:", error);
    return [];
  }
};

// Get bid status distribution
export const getBidStatusData = async (): Promise<BidStatusData[]> => {
  try {
    const bids = await getUserBids();

    const statusMap = new Map<string, number>();
    bids.forEach((bid: any) => {
      const status = bid.status || "submitted";
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const total = bids.length;
    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status:
        status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
  } catch (error) {
    console.error("Error fetching bid status data:", error);
    return [];
  }
};

// Get monthly tender trends (last 12 months)
export const getMonthlyTrends = async () => {
  try {
    const tenders = await getTenders();
    const bids = await getUserBids();

    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
      };
    }).reverse();

    const tendersByMonth = new Map<string, number>();
    const bidsByMonth = new Map<string, number>();

    tenders.forEach((tender: any) => {
      const date = new Date(tender.createdAt || tender.updatedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      tendersByMonth.set(key, (tendersByMonth.get(key) || 0) + 1);
    });

    bids.forEach((bid: any) => {
      const date = new Date(bid.createdAt || bid.updatedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      bidsByMonth.set(key, (bidsByMonth.get(key) || 0) + 1);
    });

    return months.map(({ month, key }) => ({
      month,
      tenders: tendersByMonth.get(key) || 0,
      bids: bidsByMonth.get(key) || 0,
    }));
  } catch (error) {
    console.error("Error fetching monthly trends:", error);
    return [];
  }
};

// Generate mock data as fallback
const generateMockChartData = (days: number): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const endDate = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split("T")[0],
      tendersPosted: Math.floor(Math.random() * 15) + 3,
      bidsReceived: Math.floor(Math.random() * 40) + 10,
    });
  }

  return data;
};
