import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, UsersIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUSTOMERS } from "@/polymet/data/customers-data";
import CustomerListItem from "@/polymet/components/customer-list-item";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CustomersPage({ customers, setCustomers }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  // Filter customers based on search query and status filter
  const filteredCustomers = CUSTOMERS.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customers and view their transaction history
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search customers..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <FilterIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Customers stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <h3 className="text-2xl font-bold">{CUSTOMERS.length}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <UsersIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <h3 className="text-2xl font-bold">
                {CUSTOMERS.filter((c) => c.status === "active").length}
              </h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
              <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Inactive Customers
              </p>
              <h3 className="text-2xl font-bold">
                {CUSTOMERS.filter((c) => c.status === "inactive").length}
              </h3>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
              <UsersIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(
                  CUSTOMERS.reduce(
                    (sum, customer) => sum + customer.totalSpent,
                    0
                  )
                )}
              </h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Customers list */}
      <div className="overflow-x-auto border rounded-lg bg-background">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
              {/* ...other columns... */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted">
                  <td className="px-4 py-2 whitespace-nowrap flex items-center gap-2">
                    <span onClick={() => navigate(`/customers/${customer.id}`)} className="cursor-pointer">
                      <Avatar className="h-8 w-8">
                        {customer.avatar ? (
                          <AvatarImage src={customer.avatar} alt={customer.name} />
                        ) : (
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                    </span>
                    <span>{customer.name}</span>
                  </td>
                  {/* ...other columns... */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No customers found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
