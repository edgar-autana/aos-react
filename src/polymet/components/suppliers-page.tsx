import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, PlusIcon, Building2Icon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableLoading } from "@/components/ui/loading";
import { useSuppliers } from "@/hooks/supplier/useSuppliers";
import { 
  formatSupplierUrl, 
  getSupplierDisplayName, 
  getSupplierStatusColor, 
  getSupplierStatusText,
  formatSupplierPhone,
} from "@/utils/supplier/supplierUtils";

export default function SuppliersPage() {
  const { suppliers, loading, error, searchSuppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableLoading, setTableLoading] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search with loading state
  useEffect(() => {
    setTableLoading(true);
    searchSuppliers(debouncedSearchTerm).finally(() => {
      setTableLoading(false);
    });
  }, [debouncedSearchTerm, searchSuppliers]);

  // Filter suppliers based on status, type, and size
  const filteredSuppliers = useMemo(() => {
    return suppliers
  }, [suppliers]);

  // Pagination logic
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSuppliers.slice(startIndex, endIndex);
  }, [filteredSuppliers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSuppliers.length / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Suppliers</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500">Error loading suppliers: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Building2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Building2Icon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.filter((s) => s.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Suppliers</CardTitle>
            <Building2Icon className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.filter((s) => !s.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With ISO 9001</CardTitle>
            <Building2Icon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suppliers.filter((s) => s.iso_9001_2015).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
     
      </div>

      {/* Table and Pagination with Loading */}
      {(loading || tableLoading) ? (
        <TableLoading />
      ) : (
        <>
          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium"></th>
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Website</th>
                      <th className="text-left p-4 font-medium">Phone</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">ISO 9001</th>
                      <th className="text-left p-4 font-medium">IATF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedSuppliers.length > 0 ? (
                      paginatedSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-muted/50">
                          <td className="p-4">
                            <Link to={`/suppliers/${supplier.id}`}>
                              {supplier.image ? (
                                <Avatar className="h-10 w-10 border cursor-pointer hover:opacity-80 transition-opacity">
                                  <AvatarImage src={supplier.image} alt={getSupplierDisplayName(supplier)} />
                                  <AvatarFallback>
                                    <Building2Icon className="h-5 w-5" />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border cursor-pointer hover:opacity-80 transition-opacity">
                                  <Building2Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </Link>
                          </td>
                          <td className="p-4">
                            <Link
                              to={`/suppliers/${supplier.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {getSupplierDisplayName(supplier)}
                            </Link>
                            {supplier.comercial_name && supplier.comercial_name !== supplier.name && (
                              <div className="text-sm text-muted-foreground">
                                {supplier.name}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {supplier.link_web ? (
                              <a
                                href={formatSupplierUrl(supplier.link_web)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {supplier.link_web}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              <span className="text-muted-foreground">No website</span>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {supplier.phone ? formatSupplierPhone(supplier.phone) : (
                              <span className="text-muted-foreground">No phone</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={supplier.enabled ? "default" : "secondary"}
                              className={getSupplierStatusColor(supplier.enabled)}
                            >
                              {getSupplierStatusText(supplier.enabled)}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {supplier.iso_9001_2015 ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                No
                              </Badge>
                            )}
                          </td>
                          <td className="p-4">
                            {supplier.iatf ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                No
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchTerm
                              ? "No suppliers found matching your criteria." 
                              : "No suppliers found."}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSuppliers.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}
