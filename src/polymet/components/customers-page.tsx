import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, PlusIcon, Building2Icon } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/ui/table-pagination";
import { useCompanies } from "@/hooks/company/useCompanies";
import { formatUrl } from "@/utils/urlUtils";
import { TableLoading } from "@/components/ui/loading";

export default function CustomersPage() {
  const { companies, loading, error, searchCompanies } = useCompanies();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableLoading, setTableLoading] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 2);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle search with loading state
  useEffect(() => {
    setTableLoading(true);
    searchCompanies(debouncedSearchTerm).finally(() => {
      setTableLoading(false);
    });
  }, [debouncedSearchTerm, searchCompanies]);

  // Pagination logic
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return companies.slice(startIndex, endIndex);
  }, [companies, currentPage, pageSize]);

  const totalPages = Math.ceil(companies.length / pageSize);

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
          <h1 className="text-3xl font-bold">Customers</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500">Error loading customers: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter((c) => c.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter((c) => !c.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With NDA Signed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter((c) => c.nda_signed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-center py-4">
          <div className="text-red-500">Error loading customers: {error}</div>
        </div>
      )}

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
                      <th className="text-left p-4 font-medium">URL</th>
                      <th className="text-left p-4 font-medium">Phone</th>
                      <th className="text-left p-4 font-medium">NDA Signed</th>
                      <th className="text-left p-4 font-medium">Address</th>
                      <th className="text-left p-4 font-medium">Slug</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedCompanies.length > 0 ? (
                      paginatedCompanies.map((company) => (
                        <tr key={company.id} className="hover:bg-muted/50">
                          <td className="p-4">
                            <Link to={`/customers/${company.id}`}>
                              {company.image ? (
                                <Avatar className="h-10 w-10 border cursor-pointer hover:opacity-80 transition-opacity">
                                  <AvatarImage src={company.image} alt={company.name || 'Company'} />
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
                              to={`/customers/${company.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {company.name || 'Unnamed Company'}
                            </Link>
                          </td>
                          <td className="p-4 text-sm">
                            {company.url ? (
                              <a
                                href={formatUrl(company.url)}
                                target="_blank"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {company.url}
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              <span className="text-muted-foreground">No URL</span>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {company.phone || <span className="text-muted-foreground">No phone</span>}
                          </td>
                          <td className="p-4">
                            {company.nda_signed ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                No
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {company.address || <span className="text-muted-foreground">No address</span>}
                          </td>
                          <td className="p-4 text-sm">
                            {company.slug || <span className="text-muted-foreground">no-slug</span>}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {searchTerm ? "No customers found matching your search." : "No customers found."}
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
            totalItems={companies.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}
