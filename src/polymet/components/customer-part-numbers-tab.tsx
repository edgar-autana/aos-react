import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/loading';
import { Input } from '@/components/ui/input';
import { TablePagination } from '@/components/ui/table-pagination';
import { 
  FileTextIcon, 
  PackageIcon, 
  EyeIcon,
  FileImageIcon,
  SearchIcon,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { partNumberApi } from '@/services/part-number/partNumberApi';
import { PartNumber } from '@/types/part-number/partNumber';
import { RFQ } from '@/types/rfq/rfq';
import { rfqApi } from '@/services/rfq/rfqApi';
import { Link, useNavigate } from 'react-router-dom';

interface CustomerPartNumbersTabProps {
  customerId: string;
}

export default function CustomerPartNumbersTab({ customerId }: CustomerPartNumbersTabProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [partNumbers, setPartNumbers] = useState<PartNumber[]>([]);
  const [filteredPartNumbers, setFilteredPartNumbers] = useState<PartNumber[]>([]);
  const [rfqsMap, setRfqsMap] = useState<Map<string, RFQ>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch part numbers for the customer
  React.useEffect(() => {
    const fetchPartNumbers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch part numbers and RFQs
        const [partNumbersResponse, rfqsResponse] = await Promise.all([
          partNumberApi.getByCompanyId(customerId),
          rfqApi.getByCompanyId(customerId)
        ]);
        
        if (partNumbersResponse.error) {
          setError(partNumbersResponse.error);
        } else if (rfqsResponse.error) {
          setError(rfqsResponse.error);
        } else {
          const partNumbers = partNumbersResponse.data || [];
          const rfqs = rfqsResponse.data || [];
          
          // Create RFQs map for quick lookup
          const rfqsMap = new Map<string, RFQ>();
          rfqs.forEach(rfq => {
            rfqsMap.set(rfq.id, rfq);
          });
          
          setPartNumbers(partNumbers);
          setFilteredPartNumbers(partNumbers);
          setRfqsMap(rfqsMap);
        }
      } catch (err) {
        setError('Failed to load part numbers');
      } finally {
        setLoading(false);
      }
    };

    fetchPartNumbers();
  }, [customerId]);

  // Filter part numbers based on search term
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPartNumbers(partNumbers);
      return;
    }

    const filtered = partNumbers.filter(partNumber => {
      const searchLower = searchTerm.toLowerCase();
      
      // Get RFQ name for this part number
      const rfq = partNumber.rfq ? rfqsMap.get(partNumber.rfq) : null;
      const rfqName = rfq?.name || rfq?.slug_name || '';
      
      return (
        (partNumber.part_name?.toLowerCase().includes(searchLower)) ||
        (partNumber.drawing_number?.toLowerCase().includes(searchLower)) ||
        (partNumber.slug_name?.toLowerCase().includes(searchLower)) ||
        (partNumber.name?.toLowerCase().includes(searchLower)) ||
        (rfqName.toLowerCase().includes(searchLower))
      );
    });

    setFilteredPartNumbers(filtered);
  }, [searchTerm, partNumbers, rfqsMap]);

  // Handle search input change
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Calculate paginated data
  const totalItems = filteredPartNumbers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPartNumbers = filteredPartNumbers.slice(startIndex, endIndex);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Get part number display name
  const getPartNumberDisplayName = (partNumber: PartNumber): string => {
    return partNumber.part_name || partNumber.slug_name || `PN-${partNumber.id.slice(-6)}`;
  };

  // Get RFQ name for a part number
  const getRfqName = (partNumber: PartNumber): string => {
    if (!partNumber.rfq) return '—';
    const rfq = rfqsMap.get(partNumber.rfq);
    return rfq?.name || rfq?.slug_name || `RFQ-${partNumber.rfq.slice(-6)}`;
  };

  // Get part number status color
  const getPartNumberStatusColor = (status: string | null): string => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    const statusColors: { [key: string]: string } = {
      "pending": "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800", 
      "completed": "bg-green-100 text-green-800",
      "cancelled": "bg-red-100 text-red-800"
    };
    
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  // Format number
  const formatNumber = (value: number | null): string => {
    if (value === null || value === undefined) return '—';
    return value.toLocaleString();
  };

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-500">
            Error loading part numbers: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Part Numbers ({totalItems})</h3>
          <p className="text-sm text-muted-foreground">
            Browse part numbers for this customer
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by part name, number, or RFQ..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Part Numbers Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading part numbers...</p>
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PackageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">
                {searchTerm ? 'No part numbers found matching your search' : 'No part numbers found'}
              </p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search terms.' : 'This customer doesn\'t have any part numbers yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2 font-medium" style={{width: '35%'}}>Part Name</th>
                    <th className="text-left p-2 font-medium" style={{width: '25%'}}>RFQ</th>
                    <th className="text-left p-2 font-medium" style={{width: '20%'}}>Part Number</th>
                    <th className="text-left p-2 font-medium" style={{width: '15%'}}>Process</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedPartNumbers.map((partNumber) => (
                    <tr 
                      key={partNumber.id} 
                      className="hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/part-number/${partNumber.id}`)}
                    >
                      <td className="p-2" style={{width: '35%'}}>
                        <div className="font-medium text-xs leading-tight break-words">{getPartNumberDisplayName(partNumber)}</div>
                      </td>
                      <td className="p-2" style={{width: '25%'}}>
                        <div className="font-medium text-xs leading-tight break-words">
                          {partNumber.rfq ? (
                            <Link 
                              to={`/rfqs/${partNumber.rfq}`}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {getRfqName(partNumber)}
                            </Link>
                          ) : (
                            getRfqName(partNumber)
                          )}
                        </div>
                      </td>
                      <td className="p-2" style={{width: '20%'}}>
                        <div className="text-xs font-mono leading-tight break-words">
                          {partNumber.drawing_number || '—'}
                        </div>
                      </td>
                      <td className="p-2" style={{width: '15%'}}>
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          {partNumber.main_process || '—'}
                        </Badge>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
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
        </CardContent>
      </Card>
    </div>
  );
}