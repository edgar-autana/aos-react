import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableLoading } from "@/components/ui/loading";
import { PlusIcon, SearchIcon } from "lucide-react";
import { useRfqsByCompanyPaginated } from "@/hooks/rfq/useRfqs";
import { 
  getRfqDisplayName, 
  getRfqStatusColor, 
  getRfqStatusText, 
  getRfqPriorityColor, 
  getRfqPriorityText
} from "@/utils/rfq/rfqUtils";
import RfqCreateModal from "./rfq-create-modal";

interface CustomerRfqsTabProps {
  customerId: string;
}

export default function CustomerRfqsTab({ customerId }: CustomerRfqsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    rfqs: customerRfqs,
    loading: rfqsLoading,
    error: rfqsError,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    refetch
  } = useRfqsByCompanyPaginated(customerId);

  const handleCreateSuccess = () => {
    refetch();
  };

  // Filter RFQs based on search term
  const filteredRfqs = customerRfqs.filter(rfq => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const rfqName = getRfqDisplayName(rfq).toLowerCase();
    
    return rfqName.includes(searchLower);
  });

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">RFQs ({searchTerm ? filteredRfqs.length : totalItems})</h3>
          <p className="text-sm text-muted-foreground">
            Browse and manage RFQs for this customer
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add RFQ
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search RFQs by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* RFQs Table */}
      <Card>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredRfqs.length > 0 ? (
                      filteredRfqs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-muted/50">
                          <td className="p-4">
                            <Link to={`/rfqs/${rfq.id}`} className="font-medium hover:text-primary transition-colors">
                              {getRfqDisplayName(rfq)}
                            </Link>
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
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <div className="mb-4">
                              <svg className="w-12 h-12 mx-auto text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-lg font-medium">
                              {searchTerm ? 'No RFQs found matching your search' : 'No RFQs found'}
                            </p>
                            <p className="text-sm">
                              {searchTerm ? 'Try adjusting your search terms.' : 'This customer hasn\'t submitted any RFQs yet.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination - Hide when searching to show all filtered results */}
              {!searchTerm && totalItems > 0 && (
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

      {/* Create RFQ Modal */}
      <RfqCreateModal
        customerId={customerId}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
} 