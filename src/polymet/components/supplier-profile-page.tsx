import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const CORE_CAPACITY_OPTIONS = [
  "Aluminum Die Casting",
  "CNC Machining",
  "Injection Molding",
  "Sheet Metal",
];
const SUPPLIER_TYPE_OPTIONS = ["Tolling", "Manufacturer", "Distributor"];
const SIZE_OPTIONS = ["Small", "Medium", "Large"];
const STATE_OPTIONS = ["CDMX", "Jalisco", "Nuevo León", "Querétaro", "Estado de México"];

interface SupplierProfilePageProps {
  suppliers: typeof SUPPLIERS;
  setSuppliers: React.Dispatch<React.SetStateAction<typeof SUPPLIERS>>;
}

export default function SupplierProfilePage({ suppliers, setSuppliers }: SupplierProfilePageProps) {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const supplier = suppliers.find((s) => s.id === supplierId);
  const [form, setForm] = useState<typeof SUPPLIERS[0]>(supplier!);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleDropdown = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = () => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? form : s));
    navigate('/suppliers');
  };

  const handleDelete = () => {
    setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    navigate('/suppliers');
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
          {form.avatar ? (
            <AvatarImage src={form.avatar} alt={form.name} />
          ) : (
            <AvatarFallback className="text-xl">
              {getInitials(form.name)}
            </AvatarFallback>
          )}
        </Avatar>

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
          <div className="flex items-center gap-1 text-yellow-500">
            <StarIcon className="h-4 w-4 fill-current" />

            <span className="font-medium">{form.rating}</span>
            <span className="text-muted-foreground text-sm">/ 5.0</span>
          </div>
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
          <div className="text-sm text-muted-foreground">Total Purchases</div>
          <div className="text-2xl font-bold">
            {formatCurrency(form.totalPurchases)}
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
                {form.capabilities.map((capability) => (
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
            transactions={form.transactions}
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

      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/suppliers')}>Back to list</Button>
          <Avatar className="h-16 w-16">
            {form.avatar ? (
              <AvatarImage src={form.avatar} alt={form.name} />
            ) : (
              <AvatarFallback>{form.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <h2 className="text-2xl font-bold">{form.name}</h2>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="font-medium">Name *</label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="font-medium">Commercial name</label>
            <Input name="company" value={form.company} onChange={handleChange} />
          </div>
          <div>
            <label className="font-medium">Size</label>
            <Select value={form.size} onValueChange={v => handleDropdown("size", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <label className="font-medium flex-1">ISO 9001:2015</label>
            <input type="checkbox" name="iso9001" checked={!!form.iso9001} onChange={handleChange} />
            <label className="font-medium flex-1">IATF</label>
            <input type="checkbox" name="iatf" checked={!!form.iatf} onChange={handleChange} />
          </div>
          <div>
            <label className="font-medium">Link web</label>
            <Input name="email" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="font-medium">Supplier Type</label>
            <Select value={form.supplierType} onValueChange={v => handleDropdown("supplierType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {SUPPLIER_TYPE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-medium">Core Capacity</label>
            <Select value={form.coreCapacity} onValueChange={v => handleDropdown("coreCapacity", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {CORE_CAPACITY_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-medium">Full address</label>
            <Input name="address" value={form.address} onChange={handleChange} />
          </div>
          <div>
            <label className="font-medium">State</label>
            <Select value={form.state} onValueChange={v => handleDropdown("state", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {STATE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-medium">Zip</label>
            <Input name="zip" value={form.zip} onChange={handleChange} />
          </div>
          <div className="md:col-span-2">
            <label className="font-medium">Presentation</label>
            {form.presentation && form.presentation.endsWith('.pdf') ? (
              <iframe
                className="mt-2 w-full h-64 border rounded"
                src={form.presentation}
                title="PDF Preview"
              />
            ) : form.presentation ? (
              <a href={form.presentation} target="_blank" rel="noopener noreferrer" className="text-primary underline">View File</a>
            ) : null}
          </div>
          <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
            <Button type="submit" variant="default">Save</Button>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this supplier? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </div>
    </div>
  );
}
