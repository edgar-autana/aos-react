import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PartNumberCreateForm from './part-number-create-form';

interface PartNumberCreateModalProps {
  rfqId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function PartNumberCreateModal({ 
  rfqId, 
  open, 
  onOpenChange, 
  onSuccess 
}: PartNumberCreateModalProps) {
  
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part Number</DialogTitle>
          <DialogDescription>
            Add a new part number to this RFQ with technical drawings and specifications.
          </DialogDescription>
        </DialogHeader>
        
        <PartNumberCreateForm 
          rfqId={rfqId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
} 