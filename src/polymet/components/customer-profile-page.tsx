import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  GlobeIcon,
  Building2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { companyApi } from "@/services/company/companyApi";
import { Company } from "@/lib/supabase";
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
import { formatUrl } from "@/utils/urlUtils";
import { formatDate } from "@/utils/dateUtils";
import { PageLoading } from "@/components/ui/loading";

export default function CustomerProfilePage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Company>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch customer data by ID
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await companyApi.getById(customerId);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setCustomer(response.data);
          setForm(response.data);
        } else {
          setError("Customer not found");
        }
      } catch (err) {
        setError("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(f => ({ ...f, image: URL.createObjectURL(e.target.files![0]) }));
    }
  };

  const handleSave = async () => {
    if (!customerId) return;
    
    try {
      const response = await companyApi.update(customerId, form);
      
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setCustomer(response.data);
        setForm(response.data);
      }
    } catch (err) {
      setError("Failed to update customer");
    }
  };

  const handleDelete = async () => {
    if (!customerId) return;
    
    try {
      const response = await companyApi.delete(customerId);
      
      if (response.error) {
        setError(response.error);
      } else {
        navigate('/customers');
      }
    } catch (err) {
      setError("Failed to delete customer");
    }
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
  ];

  // Loading state
  if (loading) {
    return <PageLoading text="Loading customer data..." />;
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Customer Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The customer you're looking for doesn't exist or has been removed."}
        </p>
        <Button variant="outline" onClick={() => navigate('/customers')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" className="pl-0 mb-2" onClick={() => navigate('/customers')}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      {/* Customer header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative group">
          <Avatar className="h-20 w-20 border cursor-pointer transition-all duration-200 group-hover:opacity-80">
            {form.image ? (
              <AvatarImage src={form.image} alt={form.name || 'Company'} />
            ) : (
              <AvatarFallback className="text-xl">
                <Building2Icon className="h-8 w-8 text-muted-foreground" />
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
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{form.name || 'Unnamed Company'}</h1>
            <Badge
              variant={form.enabled ? "default" : "secondary"}
              className={
                form.enabled
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
              }
            >
              {form.enabled ? "Active" : "Inactive"}
            </Badge>
            {form.nda_signed && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                NDA Signed
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            {form.phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                <span>{form.phone}</span>
              </div>
            )}
            {form.address && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{form.address}</span>
              </div>
            )}
            {form.url && (
              <div className="flex items-center gap-1">
                <GlobeIcon className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={formatUrl(form.url)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {form.url}
                </a>
              </div>
            )}
            {form.created_at && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Created {formatDate(form.created_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer content */}
      <Tabs defaultValue="details" className="mt-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="details">Company Details</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Company Name
                    </dt>
                    <dd className="text-sm">{form.name || 'N/A'}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Description
                    </dt>
                    <dd className="text-sm">{form.description || 'N/A'}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Phone
                    </dt>
                    <dd className="text-sm">{form.phone || 'N/A'}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Address
                    </dt>
                    <dd className="text-sm">{form.address || 'N/A'}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Website
                    </dt>
                    <dd className="text-sm">
                      {form.url ? (
                        <a 
                          href={formatUrl(form.url)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {form.url}
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </dd>
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
                      Company ID
                    </dt>
                    <dd className="text-sm">{form.id || 'N/A'}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm">
                      <Badge
                        variant={form.enabled ? "default" : "secondary"}
                        className={
                          form.enabled
                            ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/20"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400 dark:hover:bg-gray-500/20"
                        }
                      >
                        {form.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Created Date
                    </dt>
                    <dd className="text-sm">
                      {form.created_at ? formatDate(form.created_at) : 'N/A'}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Slug
                    </dt>
                    <dd className="text-sm">{form.slug || 'N/A'}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">
                      NDA Status
                    </dt>
                    <dd className="text-sm">
                      {form.nda_signed ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Signed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Not Signed
                        </Badge>
                      )}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent RFQ History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 bg-muted/50 p-3 text-sm font-medium">
                  <div>Name</div>
                  <div>Part Numbers</div>
                  <div>Status</div>
                  <div>Capacity</div>
                  <div>Created</div>
                </div>
                <div className="divide-y">
                  {rfqHistory.map((rfq, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-5 p-3 text-sm"
                    >
                      <div>{rfq.name}</div>
                      <div>{rfq.partNumbers}</div>
                      <div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {rfq.status}
                        </Badge>
                      </div>
                      <div>{rfq.capacity}</div>
                      <div>{rfq.created}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
