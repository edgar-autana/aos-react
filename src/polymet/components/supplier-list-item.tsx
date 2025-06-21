import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Supplier } from "@/polymet/data/suppliers-data";

interface SupplierListItemProps {
  supplier: Supplier;
}

export default function SupplierListItem({ supplier }: SupplierListItemProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
        <Avatar className="h-10 w-10 border">
          {supplier.avatar ? (
            <AvatarImage src={supplier.avatar} alt={supplier.name} />
          ) : (
            <AvatarFallback>{getInitials(supplier.name)}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium">{supplier.name}</div>
          <div className="text-sm text-muted-foreground">
            {supplier.company}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full sm:w-auto">
        <div className="hidden sm:block">
          <div className="text-sm font-medium">Total Purchases</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(supplier.totalPurchases)}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="text-sm font-medium">Joined</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(supplier.joinedDate)}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="text-sm font-medium">Rating</div>
          <div className="text-sm text-muted-foreground flex items-center">
            {supplier.rating}
            <span className="text-yellow-500 ml-1">★</span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:justify-end">
          <div className="flex items-center sm:hidden">
            <Badge
              variant={supplier.status === "active" ? "default" : "secondary"}
              className={
                supplier.status === "active"
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
              }
            >
              {supplier.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Link to={`/suppliers/${supplier.id}`}>
            <Button variant="ghost" size="sm" className="ml-2">
              <span className="mr-1">View</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
