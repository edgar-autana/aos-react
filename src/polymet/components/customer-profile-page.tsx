import { useParams, Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CUSTOMERS } from "@/polymet/data/customers-data";
import TransactionHistoryChart from "@/polymet/components/transaction-history-chart";

export default function CustomerProfilePage() {
  const { customerId = "" } = useParams();

  // Find the customer by ID
  const customer = CUSTOMERS.find((c) => c.id === customerId);

  // If customer not found, show error state
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Customer Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The customer you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/customers">
          <Button>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Customers
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

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/customers">
        <Button variant="ghost" className="pl-0 mb-2">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </Link>

      {/* Customer header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-20 w-20 border">
          {customer.avatar ? (
            <AvatarImage src={customer.avatar} alt={customer.name} />
          ) : (
            <AvatarFallback className="text-xl">
              {getInitials(customer.name)}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{customer.name}</h1>
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
          <p className="text-lg text-muted-foreground">{customer.company}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            <div className="flex items-center gap-1">
              <MailIcon className="h-4 w-4 text-muted-foreground" />

              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />

              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />

              <span>{customer.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />

              <span>Joined {formatDate(customer.joinedDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-muted-foreground">Total Spent</div>
          <div className="text-2xl font-bold">
            {formatCurrency(customer.totalSpent)}
          </div>
        </div>
      </div>

      {/* Customer content */}
      <Tabs defaultValue="transactions" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="details">Customer Details</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6 mt-6">
          <TransactionHistoryChart transactions={customer.transactions} />

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium">
                  <div>Date</div>
                  <div>Order #</div>
                  <div>Project</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>
                <div className="divide-y">
                  {customer.transactions.length > 0 ? (
                    customer.transactions.map((transaction) => (
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
                        <div>{transaction.projectName}</div>
                        <div>{formatCurrency(transaction.amount)}</div>
                        <div>
                          <Badge
                            variant="outline"
                            className={
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                                : transaction.status === "pending"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/20"
                                  : transaction.status === "cancelled"
                                    ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/20"
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/20"
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
                      No transactions found for this customer
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </dt>
                    <dd className="text-sm">{customer.name}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Company
                    </dt>
                    <dd className="text-sm">{customer.company}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Email
                    </dt>
                    <dd className="text-sm">{customer.email}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Phone
                    </dt>
                    <dd className="text-sm">{customer.phone}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Address
                    </dt>
                    <dd className="text-sm">{customer.address}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Customer ID
                    </dt>
                    <dd className="text-sm">{customer.id}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm">
                      <Badge
                        variant={
                          customer.status === "active" ? "default" : "secondary"
                        }
                        className={
                          customer.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
                        }
                      >
                        {customer.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Join Date
                    </dt>
                    <dd className="text-sm">
                      {formatDate(customer.joinedDate)}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Total Transactions
                    </dt>
                    <dd className="text-sm">{customer.transactions.length}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Total Spent
                    </dt>
                    <dd className="text-sm">
                      {formatCurrency(customer.totalSpent)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
