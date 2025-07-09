import { Supplier } from '@/types/supplier/supplier';

// Format supplier URL
export const formatSupplierUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

// Get supplier display name
export const getSupplierDisplayName = (supplier: Supplier): string => {
  return supplier.comercial_name || supplier.name || 'Unknown Supplier';
};

// Get supplier initials for avatar
export const getSupplierInitials = (supplier: Supplier): string => {
  const name = getSupplierDisplayName(supplier);
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Get supplier status color
export const getSupplierStatusColor = (enabled: boolean): string => {
  return enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
};

// Get supplier status text
export const getSupplierStatusText = (enabled: boolean): string => {
  return enabled ? 'Active' : 'Inactive';
};

// Format supplier phone
export const formatSupplierPhone = (phone?: string): string => {
  if (!phone) return '';
  // Basic phone formatting - can be enhanced based on requirements
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

// Get supplier type options
export const getSupplierTypeOptions = (): string[] => {
  return ['Tolling', 'Manufacturer', 'Distributor'];
};

// Get supplier size options
export const getSupplierSizeOptions = (): string[] => {
  return ['Small', 'Medium', 'Large'];
};

// Get supplier state options
export const getSupplierStateOptions = (): string[] => {
  return ['CDMX', 'Jalisco', 'Nuevo León', 'Querétaro', 'Estado de México'];
};

// Format supplier address
export const formatSupplierAddress = (supplier: Supplier): string => {
  const parts = [
    supplier.full_address,
    supplier.state,
    supplier.zip
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Check if supplier has certifications
export const hasSupplierCertifications = (supplier: Supplier): boolean => {
  return !!(supplier.iso_9001_2015 || supplier.iatf);
};

// Get supplier certification badges
export const getSupplierCertifications = (supplier: Supplier): string[] => {
  const certifications: string[] = [];
  
  if (supplier.iso_9001_2015) {
    certifications.push('ISO 9001:2015');
  }
  
  if (supplier.iatf) {
    certifications.push('IATF');
  }
  
  return certifications;
};

// Format supplier capacity
export const formatSupplierCapacity = (capacity?: string): string => {
  if (!capacity) return 'Not specified';
  return capacity;
};

// Get supplier type badge color
export const getSupplierTypeBadgeColor = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case 'manufacturer':
      return 'bg-blue-100 text-blue-800';
    case 'distributor':
      return 'bg-green-100 text-green-800';
    case 'tolling':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get supplier size badge color
export const getSupplierSizeBadgeColor = (size?: string): string => {
  switch (size?.toLowerCase()) {
    case 'large':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'small':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Filter suppliers by search term
export const filterSuppliersBySearch = (suppliers: Supplier[], searchTerm: string): Supplier[] => {
  if (!searchTerm.trim()) return suppliers;
  
  const term = searchTerm.toLowerCase();
  
  return suppliers.filter(supplier => 
    supplier.name?.toLowerCase().includes(term) ||
    supplier.comercial_name?.toLowerCase().includes(term) ||
    supplier.description?.toLowerCase().includes(term) ||
    supplier.link_web?.toLowerCase().includes(term) ||
    supplier.phone?.toLowerCase().includes(term) ||
    supplier.full_address?.toLowerCase().includes(term) ||
    supplier.state?.toLowerCase().includes(term) ||
    supplier.type?.toLowerCase().includes(term) ||
    supplier.size?.toLowerCase().includes(term)
  );
};

// Sort suppliers by name
export const sortSuppliersByName = (suppliers: Supplier[]): Supplier[] => {
  return [...suppliers].sort((a, b) => {
    const nameA = getSupplierDisplayName(a).toLowerCase();
    const nameB = getSupplierDisplayName(b).toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

// Get supplier summary stats
export const getSupplierStats = (suppliers: Supplier[]) => {
  const total = suppliers.length;
  const active = suppliers.filter(s => s.enabled).length;
  const inactive = total - active;
  const withISO = suppliers.filter(s => s.iso_9001_2015).length;
  const withIATF = suppliers.filter(s => s.iatf).length;
  
  return {
    total,
    active,
    inactive,
    withISO,
    withIATF,
    withCertifications: suppliers.filter(s => hasSupplierCertifications(s)).length
  };
}; 