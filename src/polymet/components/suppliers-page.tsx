import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, BuildingIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPLIERS } from "@/polymet/data/suppliers-data";
import SupplierListItem from "@/polymet/components/supplier-list-item";

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter suppliers based on search query and status filter
  const filteredSuppliers = SUPPLIERS.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Suppliers</h1>
        <p className="text-muted-foreground">
          Manage your suppliers and view their capabilities and transaction
          history
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            placeholder="Search suppliers..."
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

      {/* Suppliers stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Suppliers</p>
              <h3 className="text-2xl font-bold">{SUPPLIERS.length}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <BuildingIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
              <h3 className="text-2xl font-bold">
                {SUPPLIERS.filter((s) => s.status === "active").length}
              </h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
              <BuildingIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Inactive Suppliers
              </p>
              <h3 className="text-2xl font-bold">
                {SUPPLIERS.filter((s) => s.status === "inactive").length}
              </h3>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
              <BuildingIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <h3 className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(
                  SUPPLIERS.reduce(
                    (sum, supplier) => sum + supplier.totalPurchases,
                    0
                  )
                )}
              </h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
              <BuildingIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers list */}
      <div className="space-y-4">
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map((supplier) => (
            <SupplierListItem key={supplier.id} supplier={supplier} />
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-background">
            <p className="text-muted-foreground">
              No suppliers found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
