import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerTransaction } from "@/polymet/data/customers-data";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

interface TransactionHistoryChartProps {
  transactions: CustomerTransaction[];
}

export default function TransactionHistoryChart({
  transactions,
}: TransactionHistoryChartProps) {
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "1y" | "all">(
    "all"
  );

  // Process transactions for chart data
  const processTransactions = () => {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter based on time range
    const now = new Date();
    const filtered = sortedTransactions.filter((transaction) => {
      const txDate = new Date(transaction.date);
      if (timeRange === "30d") {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return txDate >= thirtyDaysAgo;
      } else if (timeRange === "90d") {
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return txDate >= ninetyDaysAgo;
      } else if (timeRange === "1y") {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return txDate >= oneYearAgo;
      }
      return true; // "all" case
    });

    // Format for chart
    return filtered.map((tx) => ({
      date: formatDate(tx.date),
      amount: tx.amount,
      status: tx.status,
      orderNumber: tx.orderNumber,
      projectName: tx.projectName,
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const chartData = processTransactions();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Transaction History
        </CardTitle>
        <Tabs
          defaultValue={timeRange}
          onValueChange={(v) => setTimeRange(v as any)}
        >
          <TabsList className="grid grid-cols-4 h-8">
            <TabsTrigger value="30d" className="text-xs">
              30d
            </TabsTrigger>
            <TabsTrigger value="90d" className="text-xs">
              90d
            </TabsTrigger>
            <TabsTrigger value="1y" className="text-xs">
              1y
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={{}} className="aspect-[none] h-[300px]">
          <BarChart data={chartData}>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                  labelFormatter={(label) => label}
                />
              }
            />

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />

            <Bar
              dataKey="amount"
              fill="hsl(var(--chart-1))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        {chartData.length === 0 && (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No transaction data available for the selected time period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
