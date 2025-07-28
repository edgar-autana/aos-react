import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableLoading } from "@/components/ui/loading";
import { FileTextIcon, CalendarIcon, EyeIcon, PlusIcon, UserIcon, FileIcon, DownloadIcon, FileImageIcon } from "lucide-react";
import { usePartNumbersByRfqPaginated } from "@/hooks/part-number/usePartNumbers";
import { PartNumber } from "@/types/part-number/partNumber";
import { formatNumber } from "@/utils/dateUtils";
import PartNumberCreateModal from "./part-number-create-modal";

interface RfqPnsTabProps {
  rfqId: string;
}

export default function RfqPnsTab({ rfqId }: RfqPnsTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const {
    partNumbers,
    loading,
    error,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
    refetch
  } = usePartNumbersByRfqPaginated(rfqId);

  const getPartNumberDisplayName = (partNumber: PartNumber): string => {
    return partNumber.part_name || partNumber.slug_name || `PN-${partNumber.id.slice(-6)}`;
  };

  const getMainProcessColor = (mainProcess: string | null): string => {
    if (!mainProcess) return "bg-gray-100 text-gray-800";
    
    const processColors: { [key: string]: string } = {
      "CNC": "bg-red-100 text-red-800",
      "MACHINING": "bg-blue-100 text-blue-800",
      "HPDC": "bg-green-100 text-green-800",
      "IM": "bg-cyan-100 text-cyan-800"
    };
    
    const process = mainProcess.toUpperCase();
    return processColors[process] || "bg-gray-100 text-gray-800";
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Part Numbers ({totalItems})</CardTitle>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Part Number
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error && (
            <div className="text-center py-4 text-red-500">
              Error loading part numbers: {error}
            </div>
          )}
          
          {loading ? (
            <TableLoading />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Drawing Number</th>
                      <th className="text-left p-4 font-medium">Process</th>
                      <th className="text-left p-4 font-medium">Feasibility</th>
                      <th className="text-left p-4 font-medium">Documents</th>
                      <th className="text-left p-4 font-medium">EAU</th>
                      <th className="text-left p-4 font-medium">Piece Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {partNumbers.length > 0 ? (
                      partNumbers.map((partNumber: PartNumber) => (
                        <tr key={partNumber.id} className="hover:bg-muted/50">
                          <td className="p-4">
                            <Link to={`/part-number/${partNumber.id}`} className="font-medium hover:text-primary transition-colors">
                              {getPartNumberDisplayName(partNumber)}
                            </Link>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-mono">
                              {partNumber.drawing_number || '—'}
                            </div>
                          </td>
                         
                          <td className="p-4">
                            <Badge className={getMainProcessColor(partNumber.main_process)}>
                              {partNumber.main_process}
                            </Badge>
                          </td>
                         
                          <td className="p-4">
                            <div className="text-sm">
                            {(partNumber?.feasibility || '—')}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              {partNumber.part_drawing_2d && (
                                <a
                                  href={partNumber.part_drawing_2d}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <FileTextIcon className="h-3 w-3" />
                                  2D Drawing
                                </a>
                              )}
                              {partNumber.part_drawing_3d && (
                                <a
                                  href={partNumber.part_drawing_3d}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <FileImageIcon className="h-3 w-3" />
                                  3D Model
                                </a>
                              )}
                              {!partNumber.part_drawing_2d && !partNumber.part_drawing_3d && (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {formatNumber(partNumber.estimated_anual_units)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {formatNumber(partNumber.piece_price)}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <div className="mb-4">
                              <FileTextIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                            </div>
                            <p className="text-lg font-medium">No Part Numbers found</p>
                            <p className="text-sm">This RFQ doesn't have any part numbers yet.</p>
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
      
      {/* Part Number Create Modal */}
      <PartNumberCreateModal
        rfqId={rfqId}
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
} 