import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, BuildingIcon, PlusIcon, FileTextIcon, TrashIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPLIERS, Supplier } from "@/polymet/data/suppliers-data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CORE_CAPACITY_OPTIONS = [
  "Aluminum Die Casting",
  "CNC Machining",
  "Injection Molding",
  "Sheet Metal",
];
const SUPPLIER_TYPE_OPTIONS = ["Tolling", "Manufacturer", "Distributor"];
const SIZE_OPTIONS = ["Small", "Medium", "Large"];
const STATE_OPTIONS = ["CDMX", "Jalisco", "Nuevo León", "Querétaro", "Estado de México"];

function SupplierForm({ supplier, onSave, onCancel, onDelete }: { supplier?: Supplier; onSave: (s: Supplier) => void; onCancel: () => void; onDelete?: () => void }) {
  const initialSupplier: Supplier = {
    id: supplier?.id || '',
    name: supplier?.name || '',
    company: supplier?.company || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    joinedDate: supplier?.joinedDate || '',
    totalPurchases: supplier?.totalPurchases || 0,
    avatar: supplier?.avatar || '',
    status: supplier?.status || 'active',
    rating: supplier?.rating || 0,
    capabilities: supplier?.capabilities || [],
    transactions: supplier?.transactions || [],
    coreCapacity: supplier?.coreCapacity || '',
    supplierType: supplier?.supplierType || '',
    size: supplier?.size || '',
    state: supplier?.state || '',
    iso9001: supplier?.iso9001 || false,
    iatf: supplier?.iatf || false,
    contactsCount: supplier?.contactsCount || 0,
    presentation: supplier?.presentation || '',
    zip: supplier?.zip || '',
    type: supplier?.type || '',
  };
  const [form, setForm] = useState<Supplier>(initialSupplier);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPresentationFile(e.target.files[0]);
      setForm(f => ({ ...f, presentation: e.target.files![0].name }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, presentation: presentationFile ? presentationFile.name : form.presentation });
  };

  return (
    <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
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
        <div className="flex items-center gap-2 border rounded-lg p-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <FileTextIcon className="h-4 w-4 mr-2" />
            {presentationFile ? presentationFile.name : form.presentation ? form.presentation : "Select or drag and drop"}
          </Button>
        </div>
        {/* PDF Preview */}
        {(presentationFile && presentationFile.type === 'application/pdf') ? (
          <iframe
            className="mt-2 w-full h-64 border rounded"
            src={URL.createObjectURL(presentationFile)}
            title="PDF Preview"
          />
        ) : (!presentationFile && form.presentation && form.presentation.endsWith('.pdf')) ? (
          <div className="mt-2">
            <a href={form.presentation} target="_blank" rel="noopener noreferrer" className="text-primary underline">View PDF</a>
          </div>
        ) : null}
      </div>
      <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
        <Button type="submit">{supplier ? "Update" : "Create"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        {supplier && onDelete && (
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <TrashIcon className="h-4 w-4 mr-1" /> Delete
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
                <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </form>
  );
}

export default function SuppliersPage({ suppliers, setSuppliers }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();

  // Filter suppliers based on search query and status filter
  const filteredSuppliers = suppliers.filter((supplier) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your suppliers and view their capabilities and transaction history
          </p>
        </div>
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

      {/* Suppliers table */}
      <div className="overflow-x-auto border rounded-lg bg-background">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Core Capacity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Contacts</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Presentation</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">ISO 9001:2015</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">IATF</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-muted">
                  <td className="px-4 py-2 whitespace-nowrap flex items-center gap-2">
                    <span onClick={() => navigate(`/suppliers/${supplier.id}`)} className="cursor-pointer">
                      <Avatar className="h-8 w-8">
                        {supplier.avatar ? (
                          <AvatarImage src={supplier.avatar} alt={supplier.name} />
                        ) : (
                          <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                    </span>
                    <span>{supplier.name}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{supplier.coreCapacity || supplier.capabilities?.[0]?.name || ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{supplier.contactsCount || 0}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{supplier.presentation ? <FileTextIcon className="inline h-5 w-5 text-primary" /> : ''}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{supplier.iso9001 ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded">YES</span> : <span className="bg-red-100 text-red-700 px-2 py-1 rounded">NO</span>}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{supplier.iatf ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded">YES</span> : <span className="bg-red-100 text-red-700 px-2 py-1 rounded">NO</span>}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{supplier.type || ''}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No suppliers found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
