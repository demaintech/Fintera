"use client";

import { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ArrowUpRight,
  DollarSign,
  Fish,
  Droplets,
  TrendingUp,
  Warehouse,
  Activity,
  Wheat,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getPonds } from "@/lib/pond-api";
import { getStockRecords } from "@/lib/stock-api";
import { getFeedInventory } from "@/lib/feed-inventory-api";
import { getMortalityRecords, MortalityRecord } from "@/lib/mortality-api";
import { getFeedingLogs } from "@/lib/feeding-logs-api";

const chartData = [
  { month: "January", revenue: -20000, sales: 200 },
  { month: "February", revenue: -10000, sales: 200 },
  { month: "March", revenue: 100000, sales: 200 },
  { month: "April", revenue: 5000, sales: 190 },
  { month: "May", revenue: 50000, sales: 130 },
  { month: "June", revenue: 20000, sales: 140 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  sales: { label: "Sales", color: "hsl(var(--secondary))" },
};

const mortalityChartConfig = {
  rate: {
    label: "Mortality Rate (%)",
    color: "#ef4444",
  },
  count: {
    label: "Mortality Count",
    color: "#ef4444",
  },
};

const Page = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState({
    totalFishes: 0,
    totalPonds: 0,
    totalHarvest: 0,
    totalFeedsKg: 0,
    weeklyFeedConsumedKg: 0,
    overallMortalityRate: 0,
    growthRate: null as number | null,
    feedEfficiency: 0,
  });

  const [mortalityChartData, setMortalityChartData] = useState<
    { date: string; rate: number; count: number }[]
  >([]);

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!token) return;
      setLoading(true);

      try {
        const [ponds, stocks, feeds, mortalities, feedingLogsRes] = await Promise.all([
          getPonds(token).catch(() => []),
          getStockRecords(token).catch(() => []),
          getFeedInventory(token).catch(() => []),
          getMortalityRecords(token).catch(() => []),
          getFeedingLogs(token).catch((err) => {
            console.error("DEBUG: Failed to fetch feeding logs", err);
            return null;
          }),
        ]);

        console.log("DEBUG: Raw Feeding Logs API Response:", feedingLogsRes);

        const pondCount = Array.isArray(ponds) ? ponds.length : 0;

        const totalStockFromRecords = Array.isArray(stocks)
          ? stocks.reduce((acc, stock) => acc + (stock.quantity || 0), 0)
          : 0;

        const completedHarvests = Array.isArray(stocks)
          ? stocks.filter((stock) => stock.status === "Completed").length
          : 0;

        const totalFeedWeight = Array.isArray(feeds)
          ? feeds.reduce((acc, feed) => {
              const bags = feed.quantity || 0;
              const weightPerBag = feed.av_weight_per_bag || 0;
              return acc + bags * weightPerBag;
            }, 0)
          : 0;

        // Extract array from response payload safely
        let rawLogsArray: any[] = [];
        if (Array.isArray(feedingLogsRes)) {
          rawLogsArray = feedingLogsRes;
        } else if (feedingLogsRes && typeof feedingLogsRes === "object") {
          rawLogsArray =
            (feedingLogsRes as any).data ||
            (feedingLogsRes as any).logs ||
            (feedingLogsRes as any).results ||
            (feedingLogsRes as any).feedingLogs ||
            [];
        }

        console.log("DEBUG: Parsed Feeding Logs Array:", rawLogsArray);

        if (rawLogsArray.length > 0) {
          console.log("DEBUG: First Item Object Keys:", Object.keys(rawLogsArray[0]));
          console.log("DEBUG: First Item Contents:", JSON.stringify(rawLogsArray[0], null, 2));
        }

        // Aggregate feed quantity across all records directly
        let aggregateFeed = 0;

        if (Array.isArray(rawLogsArray) && rawLogsArray.length > 0) {
          aggregateFeed = rawLogsArray.reduce((acc, item) => {
            const rawVal =
              item?.quantity_kg ??
              item?.quantityKg ??
              item?.quantity ??
              item?.feed_amount ??
              item?.feedAmount ??
              item?.amount ??
              item?.used_kg ??
              item?.weight_kg ??
              item?.qty ??
              item?.feed_quantity ??
              item?.feedQuantity ??
              item?.feed?.quantity ??
              item?.details?.quantity ??
              0;

            const parsedVal =
              typeof rawVal === "number"
                ? rawVal
                : parseFloat(String(rawVal).replace(/[^0-9.]/g, ""));

            return acc + (isNaN(parsedVal) ? 0 : parsedVal);
          }, 0);
        }

        console.log("DEBUG: Calculated Total Feed Aggregate:", aggregateFeed);

        const calculatedFeedEfficiency =
          totalFeedWeight > 0 && totalStockFromRecords > 0
            ? Math.min(
                Math.round(
                  (totalStockFromRecords / (totalStockFromRecords + totalFeedWeight * 0.1)) * 100
                ),
                100
              )
            : 0;

        const mortalityList: MortalityRecord[] = Array.isArray(mortalities) ? mortalities : [];
        const totalMortalityCount = mortalityList.reduce((acc, m) => acc + (m.quantity || 0), 0);

        const overallRate =
          totalStockFromRecords > 0
            ? (totalMortalityCount / (totalStockFromRecords + totalMortalityCount)) * 100
            : 0;

        const groupedByDate = mortalityList.reduce((acc, record) => {
          const rawDate = record.dateRecorded !== "N/A" ? record.dateRecorded : "Unknown";
          const dateKey = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;

          acc[dateKey] = (acc[dateKey] || 0) + record.quantity;
          return acc;
        }, {} as Record<string, number>);

        const sortedDates = Object.keys(groupedByDate).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        const formattedChartData = sortedDates.map((date) => {
          const count = groupedByDate[date];
          const dailyRate =
            totalStockFromRecords > 0
              ? Number(((count / (totalStockFromRecords + count)) * 100).toFixed(2))
              : 0;

          const displayDate =
            date !== "Unknown"
              ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "N/A";

          return {
            date: displayDate,
            rate: dailyRate,
            count: count,
          };
        });

        setMortalityChartData(formattedChartData);
        setMetricsData({
          totalFishes: totalStockFromRecords,
          totalPonds: pondCount,
          totalHarvest: completedHarvests,
          totalFeedsKg: totalFeedWeight,
          weeklyFeedConsumedKg: aggregateFeed,
          overallMortalityRate: overallRate,
          growthRate: null,
          feedEfficiency: calculatedFeedEfficiency,
        });
      } catch (err) {
        console.error("Failed to load dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [token]);

  const formatFeedDisplay = (totalKg: number) => {
    if (loading) return "...";
    if (totalKg >= 1000) {
      return `${(totalKg / 1000).toFixed(1)} T`;
    }
    return `${totalKg.toLocaleString()} kg`;
  };

  const activities = [
    { label: "Water quality stable", value: "95% healthy" },
    {
      label: "Feed consumption this week",
      value: formatFeedDisplay(metricsData.weeklyFeedConsumedKg),
    },
    {
      label: "Growth rate",
      value:
        loading
          ? "..."
          : metricsData.growthRate !== null
          ? `+${metricsData.growthRate}%`
          : "Pending API",
    },
  ];

  const metrics = [
    {
      title: "Total Revenue",
      value: "$124,500",
      change: "+12.4%",
      description: "vs last month",
      icon: DollarSign,
      accent: "from-emerald-500/20 to-emerald-400/5",
    },
    {
      title: "Total Sales",
      value: "3,284",
      change: "+8.1%",
      description: "orders processed",
      icon: TrendingUp,
      accent: "from-sky-500/20 to-sky-400/5",
    },
    {
      title: "Total Fishes",
      value: loading ? "..." : metricsData.totalFishes.toLocaleString(),
      change: "+5.2%",
      description: "healthy stock",
      icon: Fish,
      accent: "from-cyan-500/20 to-cyan-400/5",
    },
    {
      title: "Total Ponds",
      value: loading ? "..." : metricsData.totalPonds.toString(),
      change: "Active",
      description: "active ponds",
      icon: Droplets,
      accent: "from-violet-500/20 to-violet-400/5",
    },
    {
      title: "Total Harvest",
      value: loading ? "..." : metricsData.totalHarvest.toString(),
      change: "Completed",
      description: "harvest events",
      icon: Warehouse,
      accent: "from-amber-500/20 to-amber-400/5",
    },
    {
      title: "Total Feeds",
      value: formatFeedDisplay(metricsData.totalFeedsKg),
      change: "In Stock",
      description: "available feed stock",
      icon: Wheat,
      accent: "from-rose-500/20 to-rose-400/5",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-2xl sm:rounded-3xl border border-gray-500 bg-gradient-to-br from-primary/10 via-background to-background p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 sm:mb-3 inline-flex items-center gap-2 rounded-full border border-gray-500 bg-background/70 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
              <Activity className="h-4 w-4" />
              Aquaculture Ops Overview
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              Manage your fish farm performance at a glance
            </h1>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm lg:text-base text-foreground/70">
              Track revenue, stock health, and day-to-day operations with a clear, data-driven dashboard.
            </p>
          </div>
          <div className="rounded-lg sm:rounded-2xl border border-border/20 bg-background/80 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm shadow-sm">
            <p className="text-foreground/60">This week</p>
            <p className="mt-1 text-xl font-semibold">+18.2% efficiency</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-lg sm:rounded-2xl border border-gray-500 bg-background p-3 sm:p-5 shadow-sm transition hover:-translate-y-0.5"
            >
              <div className={`rounded-lg sm:rounded-xl bg-gradient-to-br ${item.accent} p-2 sm:p-3`}>
                <Icon className="h-5 sm:h-6 w-5 sm:w-6 text-foreground" />
              </div>
              <div className="mt-3 sm:mt-4 flex items-start justify-between gap-2 sm:gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-foreground/60">{item.title}</p>
                  <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-semibold">{item.value}</p>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                  <span className="inline-flex items-center gap-1">
                    {item.change} <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-foreground/60">{item.description}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-[1fr] lg:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-2xl sm:rounded-3xl border border-gray-500 bg-background p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Revenue & Sales Trend</h2>
              <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">Performance over the last 6 months.</p>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs sm:text-sm font-medium text-primary whitespace-nowrap">
              Live trend
            </div>
          </div>

          <ChartContainer config={chartConfig} className="mt-4 sm:mt-6 min-h-60 sm:min-h-75 w-full">
            <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                fillOpacity={0.4}
                stroke="var(--color-revenue)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-2xl sm:rounded-3xl border border-gray-500 bg-background p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Mortality Rate</h2>
                <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">
                  Real-time daily recorded mortality.
                </p>
              </div>
              <div className="rounded-full bg-rose-500/10 px-3 py-1 text-xs sm:text-sm font-medium text-rose-600 whitespace-nowrap">
                {loading ? "..." : `${metricsData.overallMortalityRate.toFixed(2)}% Avg`}
              </div>
            </div>

            <ChartContainer config={mortalityChartConfig} className="mt-3 sm:mt-4 min-h-40 sm:min-h-50 w-full">
              {mortalityChartData.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
                  No mortality records available.
                </div>
              ) : (
                <LineChart
                  accessibilityLayer
                  data={mortalityChartData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    dataKey="count"
                    name="Mortality Count"
                    type="monotone"
                    stroke="var(--color-count)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </LineChart>
              )}
            </ChartContainer>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-gray-500 bg-background p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-semibold">Farm Health Snapshot</h2>
            <div className="mt-3 sm:mt-5 grid gap-2 sm:gap-3">
              {activities.map((activity) => (
                <div key={activity.label} className="rounded-lg sm:rounded-2xl bg-muted/40 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-foreground/60">{activity.label}</p>
                  <p className="mt-0.5 sm:mt-1 text-base sm:text-lg font-semibold">{activity.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl sm:rounded-3xl border border-gray-500 bg-background p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Upcoming Tasks</h2>
          <ul className="mt-3 sm:mt-5 space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/70">
            <li className="rounded-lg sm:rounded-xl border border-gray-500 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              Feed delivery scheduled for tomorrow
            </li>
            <li className="rounded-lg sm:rounded-xl border border-gray-500 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              Water quality check due in 2 hours
            </li>
            <li className="rounded-lg sm:rounded-xl border border-gray-500 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              Harvest planning review at 4 PM
            </li>
          </ul>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-gray-500 bg-background p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Pond Status</h2>
          <div className="mt-3 sm:mt-5 space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-gray-500 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              <span>North Pond</span>
              <span className="font-medium text-emerald-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-gray-500 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              <span>South Pond</span>
              <span className="font-medium text-amber-600">Watch</span>
            </div>
            <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-gray-500 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              <span>East Pond</span>
              <span className="font-medium text-rose-600">Attention</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-gray-500 bg-background p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Feed Efficiency</h2>
          <div className="mt-3 sm:mt-5 rounded-lg sm:rounded-2xl bg-muted/30 p-4 sm:p-4 text-center">
            <p className="text-3xl sm:text-4xl font-semibold text-primary">
              {loading ? "..." : `${metricsData.feedEfficiency}%`}
            </p>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-foreground/60">
              Conversion efficiency this month
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;