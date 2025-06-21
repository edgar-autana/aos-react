import { useParams, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  CheckIcon,
  CircleIcon,
  MinusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUPPLIERS } from "@/polymet/data/suppliers-data";
import SupplierTransactionHistoryChart from "@/polymet/components/supplier-transaction-history-chart";

export default function SupplierProfilePage() {
  const { supplierId = "" } = useParams();

  // Find the supplier by ID
  const supplier = SUPPLIERS.find((s) => s.id === supplierId);

  // If supplier not found, show error state
  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Supplier Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The supplier you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/suppliers">
          <Button>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </Link>
      </div>
    );
  }

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

  // Get expertise icon
  const getExpertiseIcon = (expertise: string) => {
    switch (expertise) {
      case "expert":
        return <CheckIcon className="h-4 w-4 text-green-500" />;

      case "intermediate":
        return <MinusIcon className="h-4 w-4 text-amber-500" />;

      default:
        return <CircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get expertise label
  const getExpertiseLabel = (expertise: string) => {
    switch (expertise) {
      case "expert":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20">
            Expert
          </Badge>
        );

      case "intermediate":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/20">
            Intermediate
          </Badge>
        );

      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/20">
            Beginner
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/suppliers">
        <Button variant="ghost" className="pl-0 mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>
      </Link>

      {/* Supplier header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-20 w-20 border">
          {supplier.avatar ? (
            <AvatarImage src={supplier.avatar} alt={supplier.name} />
          ) : (
            <AvatarFallback className="text-xl">
              {getInitials(supplier.name)}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
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
          <p className="text-lg text-muted-foreground">{supplier.company}</p>
          <div className="flex items-center gap-1 text-yellow-500">
            <StarIcon className="h-4 w-4 fill-current" />

            <span className="font-medium">{supplier.rating}</span>
            <span className="text-muted-foreground text-sm">/ 5.0</span>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            <div className="flex items-center gap-1">
              <MailIcon className="h-4 w-4 text-muted-foreground" />

              <span>{supplier.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />

              <span>{supplier.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />

              <span>{supplier.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />

              <span>Joined {formatDate(supplier.joinedDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-muted-foreground">Total Purchases</div>
          <div className="text-2xl font-bold">
            {formatCurrency(supplier.totalPurchases)}
          </div>
        </div>
      </div>

      {/* Supplier content */}
      <Tabs defaultValue="capabilities" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="capabilities" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {supplier.capabilities.map((capability) => (
                  <div
                    key={capability.id}
                    className="border rounded-lg p-4 hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {getExpertiseIcon(capability.expertise)}
                        {capability.name}
                      </h3>
                      {getExpertiseLabel(capability.expertise)}
                    </div>
                    <p className="text-muted-foreground">
                      {capability.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 mt-6">
          <SupplierTransactionHistoryChart
            transactions={supplier.transactions}
          />

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium">
                  <div>Date</div>
                  <div>Order #</div>
                  <div>Material Type</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {supplier.transactions.length > 0 ? (
                    supplier.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="grid grid-cols-5 p-3 text-sm"
                      >
                        <div>{formatDate(transaction.date)}</div>
                        <div>
                          <Link
                            to={`/orders/${transaction.orderNumber}`}
                            className="text-primary hover:underline"
                          >
                            {transaction.orderNumber}
                          </Link>
                        </div>
                        <div>{transaction.materialType}</div>
                        <div>{formatCurrency(transaction.amount)}</div>
                        <div>
                          <Badge
                            variant="outline"
                            className={
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                                : transaction.status === "pending"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/20"
                                  : "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20"
                            }
                          >
                            {transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No transactions found for this supplier
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
