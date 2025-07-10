import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerStatsTabProps {
  customerId: string;
}

export default function CustomerStatsTab({ customerId }: CustomerStatsTabProps) {
  // Demo stats (replace with real data as needed)
  const stats = [
    { label: 'RFQs', value: 29 },
    { label: 'Part Numbers', value: 157 },
    { label: 'Quotes Sent', value: 87 },
    { label: 'Purchase Orders', value: 0 },
    { label: 'Pieces Quoted', value: 87.00 },
    { label: 'Quoted Value', value: '$2M' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 