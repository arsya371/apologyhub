"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface AnalyticsChartProps {
  data: Array<{
    date: Date;
    visits: number;
    submissions: number;
    views: number;
  }>;
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    visits: item.visits,
    submissions: item.submissions,
    views: item.views,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-2 bg-card dark:bg-card/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Analytics Overview</CardTitle>
          <CardDescription className="text-xs">Track your platform's performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Visits"
                />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Submissions"
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Views"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
