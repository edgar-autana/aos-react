import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { SearchIcon, PlusIcon, UserIcon, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TablePagination } from "@/components/ui/table-pagination";
import { useContacts } from "@/hooks/contact/useContacts";
import { useCompanies } from "@/hooks/company/useCompanies";
import { useSuppliers } from "@/hooks/supplier/useSuppliers";
import { TableLoading } from "@/components/ui/loading";
import { Contact, ContactPayload } from "@/types/contact/contact";
import { ContactCreationForm } from "@/polymet/components/contact-creation-form";
import { useToast } from "@/components/ui/use-toast";

export default function ContactsPage() {
  const { contacts, loading, error, searchContacts, createContact } = useContacts();
  const { companies } = useCompanies();
  const { suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableLoading, setTableLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

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
    searchContacts(debouncedSearchTerm).finally(() => {
      setTableLoading(false);
    });
  }, [debouncedSearchTerm, searchContacts]);

  // Pagination logic
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return contacts.slice(startIndex, endIndex);
  }, [contacts, currentPage, pageSize]);

  const totalPages = Math.ceil(contacts.length / pageSize);

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

  // Get initials for avatar fallback
  const getInitials = (contact: Contact) => {
    const firstName = contact.name || "";
    const lastName = contact.last_name || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || "C";
  };

  // Resolve company ID to company name
  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "-";
    const company = companies.find(c => c.id === companyId);
    return company?.name || "-";
  };

  // Resolve supplier ID to supplier name
  const getSupplierName = (supplierId: string | null) => {
    if (!supplierId) return "-";
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || "-";
  };

  // Handle contact creation
  const handleCreateContact = async (contactData: ContactPayload) => {
    try {
      await createContact(contactData);
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
      setShowCreateModal(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create contact",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Contacts</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-red-500">Error loading contacts: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.enabled).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Main Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.main_contact).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invited Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter((c) => c.invited).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contacts" className="mt-6">
        <TabsList className="grid w-full grid-cols-1 md:w-auto">
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6 mt-6">
          {/* Search Controls */}
          <div className="flex items-center justify-between space-x-4">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="text-center py-4">
              <div className="text-red-500">Error loading contacts: {error}</div>
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
                          <th className="text-left p-4 font-medium">Last Name</th>
                          <th className="text-left p-4 font-medium">Company</th>
                          <th className="text-left p-4 font-medium">Supplier</th>
                          <th className="text-left p-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {paginatedContacts.length > 0 ? (
                          paginatedContacts.map((contact) => (
                            <tr key={contact.id} className="hover:bg-muted/50">
                              <td className="p-4">
                                <Link to={`/contacts/${contact.id}`}>
                                  <Avatar className="h-10 w-10 border cursor-pointer hover:opacity-80 transition-opacity">
                                    {contact.image ? (
                                      <AvatarImage src={contact.image} alt={`${contact.name} ${contact.last_name}`} />
                                    ) : (
                                      <AvatarFallback>
                                        {getInitials(contact)}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                </Link>
                              </td>
                              <td className="p-4">
                                <div className="font-medium">
                                  {contact.name || 'N/A'}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-medium">
                                  {contact.last_name || 'N/A'}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm">
                                  {getCompanyName(contact.company)}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm">
                                  {getSupplierName(contact.supplier)}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <Badge
                                    variant={contact.enabled ? "default" : "secondary"}
                                    className={
                                      contact.enabled
                                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                    }
                                  >
                                    {contact.enabled ? "Active" : "Inactive"}
                                  </Badge>
                                  {contact.main_contact && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                      Main
                                    </Badge>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-8">
                              <div className="text-muted-foreground">
                                <div className="mb-4">
                                  <UserIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                                </div>
                                <p className="text-lg font-medium">No contacts found</p>
                                <p className="text-sm">No contacts match your search criteria.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {contacts.length > 0 && (
                    <div className="p-4 border-t">
                      <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={contacts.length}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Contact Creation Modal */}
      <ContactCreationForm
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateContact}
      />
    </div>
  );
} 