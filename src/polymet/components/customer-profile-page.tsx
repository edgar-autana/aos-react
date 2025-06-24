import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface CustomerProfilePageProps {
  customers: typeof CUSTOMERS;
  setCustomers: React.Dispatch<React.SetStateAction<typeof CUSTOMERS>>;
}

export default function CustomerProfilePage({ customers, setCustomers }: CustomerProfilePageProps) {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const customer = customers.find((c) => c.id === customerId);
  const [form, setForm] = useState<typeof CUSTOMERS[number]>(customer!);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Customer Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The customer you're looking for doesn't exist or has been removed.
        </p>
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setForm(f => ({ ...f, avatar: URL.createObjectURL(e.target.files![0]) }));
    }
  };

  const handleSave = () => {
    setCustomers(prev => prev.map(c => c.id === customerId ? form : c));
    navigate('/customers');
  };

  const handleDelete = () => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    navigate('/customers');
  };

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

  // Demo stats (replace with real data as needed)
  const stats = [
    { label: 'RFQs', value: 29 },
    { label: 'Part Numbers', value: 157 },
    { label: 'Quotes Sent', value: 87 },
    { label: 'Purchase Orders', value: 0 },
    { label: 'Pieces Quoted', value: 87.00 },
    { label: 'Quoted Value', value: '$2M' },
  ];

  // Demo RFQ history (replace with real data as needed)
  const rfqHistory = [
    { name: 'Busch - Torrevac', partNumbers: 6, status: 'Pendiente por Revisar', capacity: 'CNC', created: '21-May-2025' },
    { name: 'Busch - 5602011', partNumbers: 4, status: 'RFQ creado(s)', capacity: 'CNC', created: '15-Apr-2025' },
    // ... more rows ...
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="pl-0 mb-2" onClick={() => navigate('/customers')}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      {/* Customer header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative">
          <Avatar className="h-20 w-20 border">
            {form.avatar ? (
              <AvatarImage src={form.avatar} alt={form.name} />
            ) : (
              <AvatarFallback className="text-xl">
                {getInitials(form.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button size="sm" variant="outline" className="absolute bottom-0 right-0" onClick={() => fileInputRef.current?.click()}>
            Upload
          </Button>
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{form.name}</h1>
            <Badge
              variant={form.status === "active" ? "default" : "secondary"}
              className={
                form.status === "active"
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
              }
            >
              {form.status === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{form.company}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            <div className="flex items-center gap-1">
              <MailIcon className="h-4 w-4 text-muted-foreground" />

              <span>{form.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <PhoneIcon className="h-4 w-4 text-muted-foreground" />

              <span>{form.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />

              <span>{form.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />

              <span>Joined {formatDate(form.joinedDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-muted-foreground">Total Spent</div>
          <div className="text-2xl font-bold">
            {formatCurrency(form.totalSpent)}
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
          <TransactionHistoryChart transactions={form.transactions} />

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
                  {form.transactions.length > 0 ? (
                    form.transactions.map((transaction) => (
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
                    <dd className="text-sm">{form.name}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Company
                    </dt>
                    <dd className="text-sm">{form.company}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Email
                    </dt>
                    <dd className="text-sm">{form.email}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Phone
                    </dt>
                    <dd className="text-sm">{form.phone}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Address
                    </dt>
                    <dd className="text-sm">{form.address}</dd>
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
                    <dd className="text-sm">{form.id}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm">
                      <Badge
                        variant={
                          form.status === "active" ? "default" : "secondary"
                        }
                        className={
                          form.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
                        }
                      >
                        {form.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Join Date
                    </dt>
                    <dd className="text-sm">
                      {formatDate(form.joinedDate)}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Total Transactions
                    </dt>
                    <dd className="text-sm">{form.transactions.length}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Total Spent
                    </dt>
                    <dd className="text-sm">
                      {formatCurrency(form.totalSpent)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save/Delete Buttons */}
      <div className="flex gap-2 mt-6">
        <Button type="button" variant="default" onClick={handleSave}>Save</Button>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this customer? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button type="button" variant="outline" onClick={() => navigate('/customers')}>Back to list</Button>
      </div>
    </div>
  );
}
