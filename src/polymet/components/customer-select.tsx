import { useState, useEffect } from "react";
import { Check, ChevronsUpDownIcon, SearchIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CUSTOMERS, Customer } from "@/polymet/data/customers-data";

interface CustomerSelectProps {
  selectedCustomerId: string | null;
  onSelectCustomer: (customerId: string) => void;
}

export default function CustomerSelect({
  selectedCustomerId,
  onSelectCustomer,
}: CustomerSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Find the selected customer when the component mounts or when selectedCustomerId changes
  useEffect(() => {
    if (selectedCustomerId) {
      const customer = CUSTOMERS.find((c) => c.id === selectedCustomerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={selectedCustomer.avatar} />

                <AvatarFallback>
                  {selectedCustomer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{selectedCustomer.name}</span>
              <span className="text-muted-foreground">
                ({selectedCustomer.company})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserIcon className="h-4 w-4" />

              <span>Select a customer</span>
            </div>
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <div className="flex items-center border-b px-3">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />

            <CommandInput placeholder="Search customers..." />
          </div>
          <CommandEmpty>No customer found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {CUSTOMERS.map((customer) => (
              <CommandItem
                key={customer.id}
                value={`${customer.name} ${customer.company}`}
                onSelect={() => {
                  onSelectCustomer(customer.id);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={customer.avatar} />

                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span>{customer.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {customer.company}
                    </span>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedCustomerId === customer.id
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
  );
}
