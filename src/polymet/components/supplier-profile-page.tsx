import { useState, useEffect } from "react";
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
  Building2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuppliers } from "@/hooks/supplier/useSuppliers";
import { Supplier } from "@/types/supplier/supplier";
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
import { Link } from "react-router-dom";
import { PageLoading } from "@/components/ui/loading";
import { formatDate } from "@/utils/dateUtils";

const CORE_CAPACITY_OPTIONS = [
  "Aluminum Die Casting",
  "CNC Machining",
  "Injection Molding",
  "Sheet Metal",
];
const SUPPLIER_TYPE_OPTIONS = ["Tolling", "Manufacturer", "Distributor"];
const SIZE_OPTIONS = ["Small", "Medium", "Large"];
const STATE_OPTIONS = ["CDMX", "Jalisco", "Nuevo León", "Querétaro", "Estado de México"];

export default function SupplierProfilePage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const { getSupplierById, updateSupplier, deleteSupplier, loading } = useSuppliers();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplier = async () => {
      if (!supplierId) return;
      
      setPageLoading(true);
      setError(null);
      
      try {
        const supplierData = await getSupplierById(supplierId);
        
        if (supplierData) {
          setSupplier(supplierData);
          setForm(supplierData);
        } else {
          setError("Supplier not found");
        }
      } catch (err) {
        setError("Failed to load supplier data");
      } finally {
        setPageLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId, getSupplierById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => ({ ...f, [name]: checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!supplierId) return;
    
    try {
      const success = await updateSupplier(supplierId, form);
      if (success) {
        navigate('/suppliers');
      }
    } catch (err) {
      setError("Failed to update supplier");
    }
  };

  const handleDelete = async () => {
    if (!supplierId) return;
    
    try {
      const success = await deleteSupplier(supplierId);
      if (success) {
        navigate('/suppliers');
      }
    } catch (err) {
      setError("Failed to delete supplier");
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Loading state
  if (pageLoading) {
    return <PageLoading text="Loading supplier data..." />;
  }

  // Error state
  if (error || !supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">Supplier Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "The supplier you're looking for doesn't exist or has been removed."}
        </p>
        <Link to="/suppliers">
          <Button variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </Link>
      </div>
    );
  }

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
          {form.image ? (
            <AvatarImage src={form.image} alt={form.name} />
          ) : (
            <AvatarFallback className="text-xl">
              <Building2Icon className="h-8 w-8" />
            </AvatarFallback>
          )}
        </Avatar>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{form.name}</h1>
            <Badge
              variant={form.enabled ? "default" : "secondary"}
              className={
                form.enabled
                  ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-500/20 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-500/20 dark:text-gray-400"
              }
            >
              {form.enabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {form.comercial_name && (
              <span>{form.comercial_name}</span>
            )}
            {form.type && (
              <span>• {form.type}</span>
            )}
            {form.size && (
              <span>• {form.size}</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {form.phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4" />
                {form.phone}
              </div>
            )}
            {form.full_address && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                {form.full_address}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {form.iso_9001_2015 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                ISO 9001:2015
              </Badge>
            )}
            {form.iatf && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                IATF
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading}>
            Save Changes
          </Button>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
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
      </div>

      {/* Supplier details */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-muted-foreground">{supplier.name}</p>
                </div>
                {supplier.comercial_name && (
                  <div>
                    <label className="text-sm font-medium">Commercial Name</label>
                    <p className="text-sm text-muted-foreground">{supplier.comercial_name}</p>
                  </div>
                )}
                {supplier.link_web && (
                  <div>
                    <label className="text-sm font-medium">Website</label>
                    <a
                      href={supplier.link_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {supplier.link_web}
                    </a>
                  </div>
                )}
                {supplier.description && (
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground">{supplier.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.phone && (
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                  </div>
                )}
                {supplier.full_address && (
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <p className="text-sm text-muted-foreground">{supplier.full_address}</p>
                  </div>
                )}
                {supplier.state && (
                  <div>
                    <label className="text-sm font-medium">State</label>
                    <p className="text-sm text-muted-foreground">{supplier.state}</p>
                  </div>
                )}
                {supplier.zip && (
                  <div>
                    <label className="text-sm font-medium">ZIP Code</label>
                    <p className="text-sm text-muted-foreground">{supplier.zip}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Supplier Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.type && (
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <p className="text-sm text-muted-foreground">{supplier.type}</p>
                  </div>
                )}
                {supplier.size && (
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <p className="text-sm text-muted-foreground">{supplier.size}</p>
                  </div>
                )}
                {supplier.capacity && (
                  <div>
                    <label className="text-sm font-medium">Capacity</label>
                    <p className="text-sm text-muted-foreground">{supplier.capacity}</p>
                  </div>
                )}
                {supplier.presentation && (
                  <div>
                    <label className="text-sm font-medium">Presentation</label>
                    <p className="text-sm text-muted-foreground">{supplier.presentation}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certifications & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground">
                    {supplier.enabled ? "Active" : "Inactive"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">ISO 9001:2015</label>
                  <p className="text-sm text-muted-foreground">
                    {supplier.iso_9001_2015 ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">IATF</label>
                  <p className="text-sm text-muted-foreground">
                    {supplier.iatf ? "Yes" : "No"}
                  </p>
                </div>
                {supplier.first_contact && (
                  <div>
                    <label className="text-sm font-medium">First Contact</label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(supplier.first_contact)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Edit Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    name="name"
                    value={form.name || ''}
                    onChange={handleChange}
                    placeholder="Supplier name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Commercial Name</label>
                  <Input
                    name="comercial_name"
                    value={form.comercial_name || ''}
                    onChange={handleChange}
                    placeholder="Commercial name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    name="link_web"
                    value={form.link_web || ''}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    name="phone"
                    value={form.phone || ''}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edit Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    name="type"
                    value={form.type || ''}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select type</option>
                    {SUPPLIER_TYPE_OPTIONS.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Size</label>
                  <select
                    name="size"
                    value={form.size || ''}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select size</option>
                    {SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <select
                    name="state"
                    value={form.state || ''}
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select state</option>
                    {STATE_OPTIONS.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    name="full_address"
                    value={form.full_address || ''}
                    onChange={handleChange}
                    placeholder="Full address"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={form.enabled || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">Active</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="iso_9001_2015"
                    checked={form.iso_9001_2015 || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">ISO 9001:2015</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="iatf"
                    checked={form.iatf || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm font-medium">IATF</label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
