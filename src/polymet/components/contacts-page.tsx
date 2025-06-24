import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon, UsersIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock contacts data
const CONTACTS = [
  { name: "Surya", lastName: "Konidela", phone: "", source: "", company: "Pfeiffer Vacuum", supplier: "" },
  { name: "LUIS", lastName: "MARINELARENA", phone: "", source: "", company: "", supplier: "" },
  { name: "DIE", lastName: "", phone: "", source: "CASTING EXPO MEXICO", company: "", supplier: "" },
  { name: "Rodolfo", lastName: "Valdez", phone: "", source: "", company: "", supplier: "" },
  { name: "Saul", lastName: "Arredondo", phone: "", source: "", company: "", supplier: "" },
  { name: "Anna", lastName: "L Barnett", phone: "", source: "", company: "Automatic Systems,", supplier: "" },
  { name: "DIECASTING", lastName: "", phone: "", source: "EXPO MÉXICO MEITECH", company: "eventosmexicoindustry.com", supplier: "" },
  { name: "Claudia (MEX)", lastName: "Sanchez", phone: "", source: "", company: "GENSOTEC", supplier: "" },
  { name: "Eva", lastName: "Vargas", phone: "", source: "", company: "Urban", supplier: "" },
];

export interface Contact {
  id: string;
  name: string;
  lastName: string;
  linkedin: string;
  source: string;
  tag: string;
  email: string;
  phone: string;
  company: string;
  provider: string;
  position: string;
  image: string;
  mainContact: boolean;
  supplier?: string;
}

interface ContactsPageProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export default function ContactsPage({ contacts, setContacts }: ContactsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact: Contact) => {
    const q = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(q) ||
      (contact.lastName && contact.lastName.toLowerCase().includes(q)) ||
      (contact.company && contact.company.toLowerCase().includes(q)) ||
      (contact.supplier && contact.supplier.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Contacts</h1>
          <p className="text-muted-foreground">Manage your contacts and view their details</p>
        </div>
        <Button onClick={() => navigate("/contacts/new")} variant="default">New Contact</Button>
      </div>

      {/* Contacts stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Contacts</p>
              <h3 className="text-2xl font-bold">{CONTACTS.length}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <UsersIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <FilterIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Contacts table */}
      <div className="overflow-x-auto border rounded-lg bg-background">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Last name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Source</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Company</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Supplier</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact: Contact, idx: number) => (
                <tr key={contact.id} className="cursor-pointer hover:bg-muted" onClick={() => navigate(`/contacts/${contact.id}`)}>
                  <td className="px-4 py-2 whitespace-nowrap">{contact.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{contact.lastName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{contact.phone}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{contact.source}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{contact.company}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{contact.supplier}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  No contacts found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 