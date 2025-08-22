import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlusIcon, TrashIcon, Package2Icon, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/numberUtils';
import { usePartNumbersByRfq } from '@/hooks/part-number/usePartNumbers';
import { useRfqWithCompany } from '@/hooks/rfq/useRfqs';
import { useGlobalQuotationMutations } from '@/hooks/global-quotation/useGlobalQuotations';
import { quotationApi } from '@/services/quotation/quotationApi';
import { useToast } from '@/components/ui/use-toast';

interface CreateGlobalQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqId: string;
  onSuccess: (globalQuotationId?: string) => void;
}

interface CustomerInfo {
  contactName: string;
  companyName: string;
  phone: string;
  address: string;
}

interface QuoteDetails {
  quoteNumber: string;
  rfqId: string;
  quoteDate: string;
  preparedBy: string;
  validityDays: number;
  exchangeRate: number;
  currency: 'USD' | 'MXN';
}

interface QuotationLineItem {
  partNumberId: string;
  partNumber: string;
  description: string;
  process: string;
  eauVolume: number;
  moq: number;
  priceEXW: number;
  freightPerPiece: number;
  totalDDP: number;
  cncFixtures: number;
  isSelected: boolean;
  notes?: string;
}

interface PartNumberOption {
  id: string;
  name: string;
  description: string;
  process_name: string;
  estimated_anual_units: number;
}

export default function CreateGlobalQuotationModal({
  isOpen,
  onClose,
  rfqId,
  onSuccess
}: CreateGlobalQuotationModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availablePartNumbers, setAvailablePartNumbers] = useState<PartNumberOption[]>([]);
  
  // Use hooks to get RFQ and Part Numbers data
  const { rfq: rfqData } = useRfqWithCompany(rfqId);
  const { partNumbers: partNumbersData, loading: partNumbersLoading } = usePartNumbersByRfq(rfqId);
  const { createGlobalQuotation, addPartNumberToGlobalQuotation } = useGlobalQuotationMutations();
  
  // Form state
  const [quotationName, setQuotationName] = useState('');
  const [quotationDescription, setQuotationDescription] = useState('');
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    contactName: '',
    companyName: '',
    phone: '',
    address: ''
  });

  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails>({
    quoteNumber: `${Date.now()}_QUOTE`,
    rfqId: rfqId,
    quoteDate: new Date().toISOString().split('T')[0],
    preparedBy: 'AUTANA',
    validityDays: 10,
    exchangeRate: 19.5,
    currency: 'USD'
  });

  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([]);

  // Load RFQ and customer data when available
  useEffect(() => {
    if (rfqData) {
      // If rfqData has company_info from a joined query
      if ('company_info' in rfqData && rfqData.company_info) {
        setCustomerInfo({
          contactName: 'Primary Contact', // We'll need to load contacts separately
          companyName: rfqData.company_info.name || 'Company Name',
          phone: 'Contact Phone', // We'll need to load contacts separately
          address: 'Company Address' // We'll need to load company details separately
        });
      } else {
        // For now, set placeholder data
        setCustomerInfo({
          contactName: 'Primary Contact',
          companyName: rfqData.name || 'RFQ Company',
          phone: 'Contact Phone',
          address: 'Company Address'
        });
      }
    }
  }, [rfqData]);

  // Load part numbers when available
  useEffect(() => {
    if (partNumbersData && partNumbersData.length > 0) {
      const formattedPartNumbers = partNumbersData.map(pn => ({
        id: pn.id,
        name: pn.drawing_number || pn.part_name || 'Unknown',
        description: pn.part_name || pn.description || '',
        process_name: pn.main_process || 'N/A',
        estimated_anual_units: pn.estimated_anual_units || 0
      }));
      setAvailablePartNumbers(formattedPartNumbers);
    }
  }, [partNumbersData]);

  // Add part number to line items
  const addPartNumber = (partNumberId: string) => {
    // Convert to string for comparison since IDs might be numbers
    const partNumber = availablePartNumbers.find(pn => String(pn.id) === String(partNumberId));
    
    // Check if part number is already added to avoid duplicates
    if (partNumber && !lineItems.find(item => String(item.partNumberId) === String(partNumberId))) {
      const newItem: QuotationLineItem = {
        partNumberId: String(partNumber.id),
        partNumber: partNumber.name,
        description: partNumber.description,
        process: partNumber.process_name,
        eauVolume: partNumber.estimated_anual_units,
        moq: 0,
        priceEXW: 0,
        freightPerPiece: 0,
        totalDDP: 0,
        cncFixtures: 0,
        isSelected: true,
        notes: ''
      };
      setLineItems(prev => [...prev, newItem]);
    }
  };

  // Remove part number from line items
  const removePartNumber = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Update line item
  const updateLineItem = (index: number, field: keyof QuotationLineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate total DDP if relevant fields change
    if (field === 'priceEXW' || field === 'freightPerPiece') {
      updatedItems[index].totalDDP = 
        (updatedItems[index].priceEXW || 0) + (updatedItems[index].freightPerPiece || 0);
    }
    
    setLineItems(updatedItems);
  };

  // Calculate total quotation value
  const calculateTotalValue = () => {
    return lineItems
      .filter(item => item.isSelected)
      .reduce((total, item) => {
        return total + (item.totalDDP * item.moq);
      }, 0);
  };

  // Handle form submission - Database creation
  const handleSubmit = async () => {
    // Validate required fields
    if (!quotationName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a quotation name",
      });
      return;
    }

    if (lineItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please add at least one part number",
      });
      return;
    }

    // Validate that all line items have required data
    const invalidItems = lineItems
      .filter(item => item.isSelected)
      .filter(item => 
        !item.moq || item.moq <= 0 || 
        !item.priceEXW || item.priceEXW <= 0
      );

    if (invalidItems.length > 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in MOQ and Price EXW for all items",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get company ID and contact info from RFQ data
      let companyId = null;
      let contactPersonId = null;
      
      if (rfqData && 'company_info' in rfqData && rfqData.company_info) {
        companyId = rfqData.company_info.id;
      } else if (rfqData?.company) {
        companyId = rfqData.company;
      }

      console.log('Creating global quotation with correct schema:', {
        quote_number: quoteDetails.quoteNumber,
        name: quotationName.trim(),
        company_id: companyId,
        rfq: rfqId,
        contact_person_id: contactPersonId,
        quote_date: quoteDetails.quoteDate,
        prepared_by: quoteDetails.preparedBy,
        validity_days: quoteDetails.validityDays,
        exchange_rate: quoteDetails.exchangeRate,
        currency: quoteDetails.currency,
        total_value: calculateTotalValue(),
        selectedItems: lineItems.filter(item => item.isSelected)
      });

      // Step 1: Create the Global Quotation using correct schema
      const globalQuotationPayload = {
        quote_number: quoteDetails.quoteNumber,
        name: quotationName.trim(),
        description: quotationDescription?.trim() || null,
        company_id: companyId,
        rfq: rfqId,
        contact_person_id: contactPersonId, // Will be null for now
        quote_date: quoteDetails.quoteDate,
        prepared_by: quoteDetails.preparedBy,
        validity_days: quoteDetails.validityDays,
        exchange_rate: quoteDetails.exchangeRate,
        currency: quoteDetails.currency,
        total_value: calculateTotalValue(),
        status: 'draft' as const,
        // Version and parent will be handled by database triggers
        is_active_version: true
      };

      const createResponse = await createGlobalQuotation(globalQuotationPayload);
      
      if (createResponse.error || !createResponse.data) {
        throw new Error(createResponse.error || 'Failed to create global quotation');
      }

      const newGlobalQuotationId = createResponse.data.id;
      console.log('✅ Global Quotation created:', createResponse.data);

      // Step 2: Create preliminary quotations without supplier and add to bridge table
      const selectedItems = lineItems.filter(item => item.isSelected);
      
      for (const lineItem of selectedItems) {
        try {
          console.log('Creating preliminary quotation for part:', lineItem.partNumber);
          
          // First, create individual quotation record (tb_quotation) without supplier (preliminary)
          const quotationPayload = {
            part_number_id: lineItem.partNumberId,
            supplier_id: null, // No supplier selected yet for global quotations
            version_number: 0,
            status: 'draft',
            unit_price: lineItem.priceEXW,
            total_price: lineItem.totalDDP * lineItem.moq,
            quantity: lineItem.moq,
            lead_time_days: 30, // Default
            validity_days: quoteDetails.validityDays,
            notes: `Generated from Global Quotation: ${quotationName}. EXW: ${lineItem.priceEXW}, Freight: ${lineItem.freightPerPiece}, CNC Fixtures: ${lineItem.cncFixtures}`,
            moq1: lineItem.moq,
            cnc_fixtures: lineItem.cncFixtures // Store CNC Fixtures in the dedicated cnc_fixtures field
          };

          const quotationResponse = await quotationApi.create(quotationPayload);
          
          if (quotationResponse.error || !quotationResponse.data) {
            console.warn('⚠️ Failed to create quotation for:', lineItem.partNumber, quotationResponse.error);
            continue;
          }

          const newQuotationId = quotationResponse.data.id;
          console.log('✅ Created preliminary quotation:', newQuotationId, 'for part:', lineItem.partNumber);

          // Now add to bridge table with the quotation_id
          const addPartResponse = await addPartNumberToGlobalQuotation(
            newGlobalQuotationId,
            lineItem.partNumberId,
            newQuotationId // Now we have a real quotation_id
          );

          if (addPartResponse.error) {
            console.warn('⚠️ Warning linking part number:', lineItem.partNumber, addPartResponse.error);
          } else {
            console.log('✅ Linked part to global quotation:', lineItem.partNumber);
          }
          
        } catch (itemError) {
          console.warn('⚠️ Error processing line item:', lineItem.partNumber, itemError);
        }
      }

      console.log('✅ Added', selectedItems.length, 'parts to global quotation');

      // Success feedback
      toast({
        title: "✅ Success!",
        description: (
          <div className="space-y-1">
            <p className="font-semibold">Global Quotation "{quotationName}" created successfully!</p>
            <p className="text-sm text-muted-foreground">Quote Number: {quoteDetails.quoteNumber}</p>
            <p className="text-sm text-muted-foreground">Total Value: {formatCurrency(calculateTotalValue())}</p>
            <p className="text-sm text-muted-foreground">{selectedItems.length} part number{selectedItems.length !== 1 ? 's' : ''} included</p>
          </div>
        ),
        duration: 5000, // Show for 5 seconds
      });
      
      // Reset form after success
      resetForm();
      
      // Call onSuccess with the new ID
      onSuccess(newGlobalQuotationId);
      
    } catch (error) {
      console.error('❌ Error creating global quotation:', error);
      toast({
        variant: "destructive",
        title: "❌ Error creating quotation",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuotationName('');
    setQuotationDescription('');
    setLineItems([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* AUTANA Logo */}
              <div className="flex items-center">
                <img 
                  src="/logo/logo.png" 
                  alt="AUTANA" 
                  className="h-10 w-auto"
                />
              </div>
              <div className="border-l pl-4 ml-4">
                <DialogTitle className="text-lg">Create Global Quotation</DialogTitle>
                <p className="text-sm text-muted-foreground">Quote #: {quoteDetails.quoteNumber}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header Info - Compact horizontal layout */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="quotation-name" className="text-xs">Quotation Name *</Label>
              <Input
                id="quotation-name"
                value={quotationName}
                onChange={(e) => setQuotationName(e.target.value)}
                placeholder="Enter name"
                className="text-sm h-8"
                required
              />
            </div>
            <div>
              <Label htmlFor="quote-number" className="text-xs">Quote Number</Label>
              <Input
                id="quote-number"
                value={quoteDetails.quoteNumber}
                onChange={(e) => setQuoteDetails(prev => ({ ...prev, quoteNumber: e.target.value }))}
                className="text-sm h-8"
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <Label htmlFor="quote-date" className="text-xs">Quote Date</Label>
              <Input
                id="quote-date"
                type="date"
                value={quoteDetails.quoteDate}
                onChange={(e) => setQuoteDetails(prev => ({ ...prev, quoteDate: e.target.value }))}
                className="text-sm h-8"
              />
            </div>
            <div>
              <Label htmlFor="prepared-by" className="text-xs">Prepared By</Label>
              <Input
                id="prepared-by"
                value={quoteDetails.preparedBy}
                onChange={(e) => setQuoteDetails(prev => ({ ...prev, preparedBy: e.target.value }))}
                className="text-sm h-8"
              />
            </div>
            <div>
              <Label htmlFor="validity-days" className="text-xs">Validity (days)</Label>
              <Input
                id="validity-days"
                type="number"
                value={quoteDetails.validityDays}
                onChange={(e) => setQuoteDetails(prev => ({ ...prev, validityDays: parseInt(e.target.value) }))}
                className="text-sm h-8"
              />
            </div>
            <div>
              <Label htmlFor="exchange-rate" className="text-xs">Exchange Rate</Label>
              <Input
                id="exchange-rate"
                type="number"
                step="0.1"
                value={quoteDetails.exchangeRate}
                onChange={(e) => setQuoteDetails(prev => ({ ...prev, exchangeRate: parseFloat(e.target.value) }))}
                className="text-sm h-8"
              />
            </div>
          </div>

          {/* Customer Info - Single line */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Contact:</span> {customerInfo.contactName}
              </div>
              <div>
                <span className="font-medium text-blue-800">Company:</span> {customerInfo.companyName}
              </div>
              <div>
                <span className="font-medium text-blue-800">Phone:</span> {customerInfo.phone}
              </div>
              <div>
                <span className="font-medium text-blue-800">Address:</span> {customerInfo.address}
              </div>
            </div>
          </div>

          {/* Add Part Number Section */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <PlusIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Add Part Number:</span>
            {partNumbersLoading ? (
              <span className="text-sm text-green-600">Loading part numbers...</span>
            ) : (
              <>
                <span className="text-xs text-green-600">
                  ({availablePartNumbers.filter(pn => !lineItems.find(item => String(item.partNumberId) === String(pn.id))).length} available)
                </span>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addPartNumber(e.target.value);
                    // Reset the select after adding
                    e.target.value = '';
                  }
                }}
                className="flex-1 max-w-md text-sm border border-green-300 rounded px-3 py-1 bg-white"
                disabled={availablePartNumbers.length === 0}
              >
                <option value="">
                  {availablePartNumbers.length === 0 
                    ? "No part numbers available for this RFQ" 
                    : "Select a part number to add..."}
                </option>
                {availablePartNumbers
                  .filter(pn => !lineItems.find(item => String(item.partNumberId) === String(pn.id)))
                  .map(pn => (
                    <option key={pn.id} value={pn.id}>
                      {pn.name} - {pn.description} ({pn.estimated_anual_units} EAU)
                    </option>
                  ))
                }
              </select>
              </>
            )}
          </div>

          {/* Line Items Table */}
          <div className="border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-100 grid grid-cols-12 gap-2 p-3 text-xs font-medium text-gray-700 border-b">
              <div className="col-span-1">#</div>
              <div className="col-span-2">Description</div>
              <div className="col-span-1">Process</div>
              <div className="col-span-1">EAU</div>
              <div className="col-span-1">MOQ</div>
              <div className="col-span-1">Price EXW</div>
              <div className="col-span-1">Freight/Piece</div>
              <div className="col-span-1">Total DDP</div>
              <div className="col-span-1">CNC Fixtures</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Table Body */}
            {lineItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-gray-50">
                <Package2Icon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">No parts added yet</p>
                <p className="text-xs">Use the selector above to add part numbers</p>
              </div>
            ) : (
              <div className="divide-y">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-gray-50">
                    <div className="col-span-1 text-sm font-medium">{index + 1}</div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium">{item.partNumber}</div>
                      <div className="text-xs text-gray-500 truncate">{item.description}</div>
                    </div>
                    <div className="col-span-1 text-xs text-gray-600">{item.process}</div>
                    <div className="col-span-1 text-xs text-gray-600">{item.eauVolume}</div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={item.moq}
                        onChange={(e) => updateLineItem(index, 'moq', parseInt(e.target.value) || 0)}
                        className="text-xs h-7 w-full"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.priceEXW}
                        onChange={(e) => updateLineItem(index, 'priceEXW', parseFloat(e.target.value) || 0)}
                        className="text-xs h-7 w-full"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.freightPerPiece}
                        onChange={(e) => updateLineItem(index, 'freightPerPiece', parseFloat(e.target.value) || 0)}
                        className="text-xs h-7 w-full"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1 text-xs font-bold text-green-600">
                      ${item.totalDDP.toFixed(2)}
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.cncFixtures}
                        onChange={(e) => updateLineItem(index, 'cncFixtures', parseFloat(e.target.value) || 0)}
                        className="text-xs h-7 w-full"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePartNumber(index)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table Footer - Total */}
            {lineItems.length > 0 && (
              <div className="bg-gray-100 border-t">
                <div className="grid grid-cols-12 gap-2 p-3">
                  <div className="col-span-8"></div>
                  <div className="col-span-2 text-right">
                    <div className="text-xs text-gray-600">Total Quotation Value:</div>
                    <div className="text-sm font-bold text-green-600">{formatCurrency(calculateTotalValue())}</div>
                  </div>
                  <div className="col-span-2"></div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            {/* Summary */}
            <div className="text-sm text-gray-600">
              {lineItems.length > 0 && (
                <span>
                  {lineItems.length} item{lineItems.length > 1 ? 's' : ''} • 
                  Total: <span className="font-bold text-green-600">{formatCurrency(calculateTotalValue())}</span>
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !quotationName || lineItems.length === 0}
                className="bg-blue-600 hover:bg-blue-700 min-w-[180px]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Global Quotation'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}