import { RMSupplier } from '@/types/rm-supplier/rmSupplier';

export const getRMSupplierDisplayName = (supplier: RMSupplier): string => {
  return supplier.comercial_name || supplier.name || `RM-${supplier.id.slice(-6)}`;
};

export const getRMSupplierStatusColor = (enabled: boolean): string => {
  return enabled 
    ? "bg-green-100 text-green-800" 
    : "bg-gray-100 text-gray-800";
};

export const getRMSupplierStatusText = (enabled: boolean): string => {
  return enabled ? "Active" : "Inactive";
};

export const formatRMSupplierUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

export const formatRMSupplierPhone = (phone: string): string => {
  // Basic phone formatting - can be enhanced based on requirements
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

export const getMaterialTypesDisplay = (materialTypes: string[] | null): string => {
  if (!materialTypes || materialTypes.length === 0) {
    return '—';
  }
  return materialTypes.join(', ');
};

export const getCertificationsDisplay = (certifications: string[] | null): string => {
  if (!certifications || certifications.length === 0) {
    return '—';
  }
  return certifications.join(', ');
};

export const formatLeadTime = (days: number | null): string => {
  if (!days) return '—';
  return `${days} days`;
};

export const formatMinimumOrder = (quantity: number | null): string => {
  if (!quantity) return '—';
  return quantity.toLocaleString();
}; 