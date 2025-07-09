import { Supplier } from '@/types/supplier/supplier';

export const formatSupplierUrl = (url?: string): string => {
  if (!url) return '';
  
  // Remove protocol if present
  let cleanUrl = url.replace(/^https?:\/\//, '');
  
  // Add https:// protocol
  return `https://${cleanUrl}`;
};

export const getSupplierDisplayName = (supplier: Supplier): string => {
  return supplier.comercial_name || supplier.name || 'Unnamed Supplier';
};

export const getSupplierInitials = (supplier: Supplier): string => {
  const name = getSupplierDisplayName(supplier);
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatSupplierAddress = (supplier: Supplier): string => {
  const parts = [supplier.full_address, supplier.zip, supplier.state].filter(Boolean);
  return parts.join(', ');
};

export const getSupplierStatusColor = (enabled: boolean): string => {
  return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

export const getSupplierStatusText = (enabled: boolean): string => {
  return enabled ? 'Active' : 'Inactive';
};

export const formatSupplierPhone = (phone?: string): string => {
  if (!phone) return '';
  
  // Basic phone formatting - you can enhance this based on your needs
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

export const getSupplierTypeOptions = (): string[] => {
  return [
    'Manufacturer',
    'Distributor',
    'Service Provider',
    'Contractor',
    'Consultant'
  ];
};

export const getSupplierSizeOptions = (): string[] => {
  return [
    'Small',
    'Medium',
    'Large',
    'Enterprise'
  ];
};

export const getSupplierStateOptions = (): string[] => {
  return [
    'CDMX',
    'Jalisco',
    'Nuevo León',
    'Querétaro',
    'Estado de México',
    'Guanajuato',
    'Puebla',
    'Veracruz',
    'Chihuahua',
    'Sonora'
  ];
}; 