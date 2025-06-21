import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import { Customer } from "@/polymet/data/customers-data";

interface CustomerListItemProps {
  customer: Customer;
}

export default function CustomerListItem({ customer }: CustomerListItemProps) {
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
          {customer.avatar ? (
            <AvatarImage src={customer.avatar} alt={customer.name} />
          ) : (
            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium">{customer.name}</div>
          <div className="text-sm text-muted-foreground">
            {customer.company}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-auto">
        <div className="hidden sm:block">
          <div className="text-sm font-medium">Total Spent</div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(customer.totalSpent)}
          </div>
        </div>

        <div className="hidden sm:block">
          <div className="text-sm font-medium">Joined</div>
          <div className="text-sm text-muted-foreground">
            {formatDate(customer.joinedDate)}
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:justify-end">
          <div className="flex items-center sm:hidden">
            <Badge
              variant={customer.status === "active" ? "default" : "secondary"}
              className={
                customer.status === "active"
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
              }
            >
              {customer.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <Link to={`/customers/${customer.id}`}>
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
