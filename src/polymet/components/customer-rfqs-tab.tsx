import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableLoading } from "@/components/ui/loading";
import { useRfqsByCompanyPaginated } from "@/hooks/rfq/useRfqs";
import { 
  getRfqDisplayName, 
  getRfqStatusColor, 
  getRfqStatusText, 
  getRfqPriorityColor, 
  getRfqPriorityText
} from "@/utils/rfq/rfqUtils";

interface CustomerRfqsTabProps {
  customerId: string;
}

export default function CustomerRfqsTab({ customerId }: CustomerRfqsTabProps) {
  const {
    rfqs: customerRfqs,
    loading: rfqsLoading,
    error: rfqsError,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange
  } = useRfqsByCompanyPaginated(customerId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RFQs ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rfqsError && (
            <div className="text-center py-4 text-red-500">
              Error loading RFQs: {rfqsError}
            </div>
          )}
          
          {rfqsLoading ? (
            <TableLoading />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Priority</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customerRfqs.length > 0 ? (
                      customerRfqs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-muted/50">
                          <td className="p-4">
                            <div className="font-medium">{getRfqDisplayName(rfq)}</div>
                          </td>
                          <td className="p-4 min-w-[250px]">
                            <Badge 
                              className={`${getRfqStatusColor(rfq.status)} !max-w-none !w-auto !whitespace-normal !text-ellipsis-none overflow-visible`}
                              style={{ 
                                maxWidth: 'none !important', 
                                width: 'auto !important',
                                whiteSpace: 'normal !important',
                                textOverflow: 'unset !important',
                                overflow: 'visible !important'
                              }}
                            >
                              {getRfqStatusText(rfq.status)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={getRfqPriorityColor(rfq.priority)}>
                              {getRfqPriorityText(rfq.priority)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/rfqs/${rfq.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <div className="mb-4">
                              <svg className="w-12 h-12 mx-auto text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-lg font-medium">No RFQs found</p>
                            <p className="text-sm">This customer hasn't submitted any RFQs yet.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalItems > 0 && (
                <div className="p-4 border-t">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 