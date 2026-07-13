"use client";

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
  Users,
  Warehouse,
  Activity,
} from "lucide-react";

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
    value: "48,910",
    change: "+5.2%",
    description: "healthy stock",
    icon: Fish,
    accent: "from-cyan-500/20 to-cyan-400/5",
  },
  {
    title: "Total Ponds",
    value: "24",
    change: "+2 new",
    description: "active ponds",
    icon: Droplets,
    accent: "from-violet-500/20 to-violet-400/5",
  },
  {
    title: "Inventory Items",
    value: "1,248",
    change: "+14",
    description: "stock entries",
    icon: Warehouse,
    accent: "from-amber-500/20 to-amber-400/5",
  },
  {
    title: "Active Users",
    value: "182",
    change: "+9",
    description: "farm operators",
    icon: Users,
    accent: "from-rose-500/20 to-rose-400/5",
  },
];

const activities = [
  { label: "Water quality stable", value: "95% healthy" },
  { label: "Feed consumption", value: "1.2T this week" },
  { label: "Growth rate", value: "+7.8%" },
];

const chartData = [
  { month: "January", revenue: 18600, sales: 80 },
  { month: "February", revenue: 30500, sales: 200 },
  { month: "March", revenue: 23700, sales: 120 },
  { month: "April", revenue: 7300, sales: 190 },
  { month: "May", revenue: 20900, sales: 130 },
  { month: "June", revenue: 21400, sales: 140 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  sales: { label: "Sales", color: "hsl(var(--secondary))" },
};

const mortalityChartData = [
  { week: "W1", rate: 2.8 },
  { week: "W2", rate: 2.6 },
  { week: "W3", rate: 3.1 },
  { week: "W4", rate: 2.4 },
  { week: "W5", rate: 2.2 },
  { week: "W6", rate: 1.9 },
];

const mortalityChartConfig = {
  rate: {
    label: "Mortality Rate",
    color: "#ef4444",
  },
};

const page = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-2xl sm:rounded-3xl border border-border/20 bg-linear-to-br from-primary/10 via-background to-background p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 sm:mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs sm:text-sm font-medium text-primary">
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
              className="rounded-lg sm:rounded-2xl border border-border/20 bg-background p-3 sm:p-5 shadow-sm transition hover:-translate-y-0.5"
            >
              <div className={`rounded-lg sm:rounded-xl bg-linear-to-br ${item.accent} p-2 sm:p-3`}>
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
        <div className="rounded-2xl sm:rounded-3xl border border-border/20 bg-background p-4 sm:p-6 shadow-sm">
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
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
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
          <div className="rounded-2xl sm:rounded-3xl border border-border/20 bg-background p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Mortality Rate</h2>
                <p className="text-xs sm:text-sm text-foreground/60 mt-0.5">Current forecast and response trend.</p>
              </div>
              <div className="rounded-full bg-rose-500/10 px-3 py-1 text-xs sm:text-sm font-medium text-rose-600 whitespace-nowrap">
                2.4%
              </div>
            </div>

            <ChartContainer config={mortalityChartConfig} className="mt-3 sm:mt-4 min-h-40 sm:min-h-50 w-full">
              <LineChart
                accessibilityLayer
                data={mortalityChartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="rate"
                  type="monotone"
                  stroke="var(--color-rate)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </LineChart>
            </ChartContainer>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-border/20 bg-background p-4 sm:p-6 shadow-sm">
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
        <div className="rounded-2xl sm:rounded-3xl border border-border/20 bg-background p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Upcoming Tasks</h2>
          <ul className="mt-3 sm:mt-5 space-y-2 sm:space-y-3 text-xs sm:text-sm text-foreground/70">
            <li className="rounded-lg sm:rounded-xl border border-border/30 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">Feed delivery scheduled for tomorrow</li>
            <li className="rounded-lg sm:rounded-xl border border-border/30 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">Water quality check due in 2 hours</li>
            <li className="rounded-lg sm:rounded-xl border border-border/30 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">Harvest planning review at 4 PM</li>
          </ul>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-border/20 bg-background p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Pond Status</h2>
          <div className="mt-3 sm:mt-5 space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-border/30 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              <span>North Pond</span>
              <span className="font-medium text-emerald-600">Healthy</span>
            </div>
            <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-border/30 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              <span>South Pond</span>
              <span className="font-medium text-amber-600">Watch</span>
            </div>
            <div className="flex items-center justify-between rounded-lg sm:rounded-xl border border-border/30 bg-muted/30 px-3 sm:px-4 py-2 sm:py-3">
              <span>East Pond</span>
              <span className="font-medium text-rose-600">Attention</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-border/20 bg-background p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold">Feed Efficiency</h2>
          <div className="mt-3 sm:mt-5 rounded-lg sm:rounded-2xl bg-muted/30 p-4 sm:p-4 text-center">
            <p className="text-3xl sm:text-4xl font-semibold text-primary">91%</p>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-foreground/60">Conversion efficiency this month</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;