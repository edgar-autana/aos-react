import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, PlusIcon, SendIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SUPPLIERS } from "@/polymet/data/suppliers-data";
import { RFQ } from "@/polymet/data/rfqs-data";

interface CreateBiddingCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rfq: RFQ;
  onSubmit: (data: {
    name: string;
    description: string;
    closingDate: Date;
    suppliers: string[];
  }) => void;
}

export default function CreateBiddingCompetitionModal({
  open,
  onOpenChange,
  rfq,
  onSubmit,
}: CreateBiddingCompetitionModalProps) {
  const [name, setName] = useState(`${rfq.name} Bidding Competition`);
  const [description, setDescription] = useState(
    `We are requesting quotes for the following parts: ${rfq.partNumbers
      .map((p) => p.name)
      .join(", ")}`
  );
  const [closingDate, setClosingDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 14))
  );
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [openSupplierSelect, setOpenSupplierSelect] = useState(false);

  const activeSuppliers = SUPPLIERS.filter((s) => s.status === "active");

  const handleSubmit = () => {
    if (!name || !description || !closingDate || selectedSuppliers.length === 0)
      return;

    onSubmit({
      name,
      description,
      closingDate,
      suppliers: selectedSuppliers,
    });
  };

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((current) =>
      current.includes(supplierId)
        ? current.filter((id) => id !== supplierId)
        : [...current, supplierId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Bidding Competition</DialogTitle>
          <DialogDescription>
            Create a bidding competition to invite suppliers to submit quotes
            for this RFQ.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Competition Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this bidding competition"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about what you're looking for"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Closing Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !closingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />

                  {closingDate ? (
                    format(closingDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={closingDate}
                  onSelect={setClosingDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Invite Suppliers</Label>
              <span className="text-xs text-muted-foreground">
                {selectedSuppliers.length} selected
              </span>
            </div>
            <Popover
              open={openSupplierSelect}
              onOpenChange={setOpenSupplierSelect}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedSuppliers.length > 0 ? (
                    <span>
                      {selectedSuppliers.length} supplier
                      {selectedSuppliers.length !== 1 ? "s" : ""} selected
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select suppliers
                    </span>
                  )}
                  <PlusIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search suppliers..." />

                  <CommandEmpty>No supplier found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {activeSuppliers.map((supplier) => (
                      <CommandItem
                        key={supplier.id}
                        value={`${supplier.name} ${supplier.company}`}
                        onSelect={() => toggleSupplier(supplier.id)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={supplier.avatar} />

                            <AvatarFallback>
                              {supplier.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{supplier.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {supplier.company}
                            </span>
                          </div>
                        </div>
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedSuppliers.includes(supplier.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedSuppliers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSuppliers.map((supplierId) => {
                  const supplier = SUPPLIERS.find((s) => s.id === supplierId);
                  if (!supplier) return null;
                  return (
                    <Badge
                      key={supplierId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={supplier.avatar} />

                        <AvatarFallback>
                          {supplier.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{supplier.name}</span>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !name ||
              !description ||
              !closingDate ||
              selectedSuppliers.length === 0
            }
          >
            <SendIcon className="mr-2 h-4 w-4" />
            Send Invitations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
