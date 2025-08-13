import { SummaryCard } from "@/components/ui/summary-card";

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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <SummaryCard 
          title="RFQs"
          value={stats[0].value}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>}
        />
        <SummaryCard 
          title="Part Numbers"
          value={stats[1].value}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>}
        />
        <SummaryCard 
          title="Quotes Sent"
          value={stats[2].value}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        />
        <SummaryCard 
          title="Purchase Orders"
          value={stats[3].value}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>}
        />
        <SummaryCard 
          title="Quoted Value"
          value={stats[5].value}
          icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2">Note: "Pieces Quoted" metric ({stats[4].value}) is displayed in the detail views below.</p>
    </div>
  );
} 