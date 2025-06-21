import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid } from "recharts";
import { SupplierTransaction } from "@/polymet/data/suppliers-data";

interface TransactionHistoryChartProps {
  transactions: SupplierTransaction[];
}

export default function SupplierTransactionHistoryChart({
  transactions,
}: TransactionHistoryChartProps) {
  const [timeRange, setTimeRange] = useState("all");

  // Filter transactions based on selected time range
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const now = new Date();

    switch (timeRange) {
      case "30days":
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return transactionDate >= thirtyDaysAgo;
      case "90days":
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return transactionDate >= ninetyDaysAgo;
      case "1year":
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return transactionDate >= oneYearAgo;
      case "all":
      default:
        return true;
    }
  });

  // Sort transactions by date
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Format data for chart
  const chartData = sortedTransactions.map((transaction) => ({
    date: new Date(transaction.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    amount: transaction.amount,
    fullDate: transaction.date,
    orderNumber: transaction.orderNumber,
    status: transaction.status,
    materialType: transaction.materialType,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Transaction History
        </CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={{}} className="aspect-[none] h-[250px]">
            <BarChart data={chartData}>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const transaction = chartData.find(
                        (t) => t.date === value
                      );
                      return transaction
                        ? `${transaction.orderNumber} - ${new Date(transaction.fullDate).toLocaleDateString()}`
                        : value;
                    }}
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
        ) : (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">
              No transaction data available for the selected time period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
