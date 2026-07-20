"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Species } from "./types";

interface SpeciesStockChartProps {
  speciesData: Species[];
}

export const SpeciesStockChart = ({ speciesData }: SpeciesStockChartProps) => {
  const chartData = speciesData
    .filter(s => s.totalStock > 0)
    .map(s => ({
      name: s.commonName,
      total: s.totalStock,
      fill: s.color,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Distribution by Species</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};