import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Contact } from "./contacts-page";
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

const emptyContact: Contact = {
  id: '',
  name: '',
  lastName: '',
  linkedin: '',
  source: '',
  tag: '',
  email: '',
  phone: '',
  company: '',
  provider: '',
  position: '',
  image: '',
  mainContact: false,
  supplier: '',
};

interface ContactProfilePageProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export default function ContactProfilePage({ contacts, setContacts }: ContactProfilePageProps) {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const isNew = contactId === 'new';
  const contact = isNew ? emptyContact : contacts.find((c: Contact) => c.id === contactId) || emptyContact;
  const [form, setForm] = useState<Contact>(contact);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleUpdate = () => {
    if (isNew) {
      setContacts(prev => [...prev, { ...form, id: Date.now().toString() }]);
    } else {
      setContacts(prev => prev.map((c: Contact) => c.id === contactId ? form : c));
    }
    navigate('/contacts');
  };

  const handleDelete = () => {
    setContacts(prev => prev.filter((c: Contact) => c.id !== contactId));
    navigate('/contacts');
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">{isNew ? 'New Contact' : 'Edit Contact'}</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
        <div>
          <label className="font-medium">Name *</label>
          <Input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="font-medium">Last name *</label>
          <Input name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>
        <div>
          <label className="font-medium">Linkedin</label>
          <Input name="linkedin" value={form.linkedin} onChange={handleChange} />
        </div>
        <div>
          <label className="font-medium">Source</label>
          <Input name="source" value={form.source} onChange={handleChange} />
        </div>
        <div>
          <label className="font-medium">Tag</label>
          <Input name="tag" value={form.tag} onChange={handleChange} />
        </div>
        <div>
          <label className="font-medium">Email</label>
          <Input name="email" value={form.email} onChange={handleChange} type="email" />
        </div>
        <div>
          <label className="font-medium">Phone</label>
          <Input name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <div>
          <label className="font-medium">Company</label>
          <Input name="company" value={form.company} onChange={handleChange} />
        </div>
        <div>
          <label className="font-medium">Provider</label>
          <Input name="provider" value={form.provider} onChange={handleChange} />
        </div>
        <div>
          <label className="font-medium">Position</label>
          <Input name="position" value={form.position} onChange={handleChange} />
        </div>
        <div>
          <label className="font-medium">Image</label>
          <Input name="image" value={form.image} onChange={handleChange} type="file" />
        </div>
        <div className="flex items-center gap-2 col-span-1 md:col-span-2 lg:col-span-3">
          <input type="checkbox" name="mainContact" checked={form.mainContact} onChange={handleChange} />
          <label>Main Contact Customer</label>
        </div>
        <div className="flex gap-2 mt-6 col-span-1 md:col-span-2 lg:col-span-3">
          <Button type="submit" variant="default">{isNew ? 'Create' : 'Update'}</Button>
          {!isNew && (
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this contact? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="button" variant="outline" onClick={() => navigate('/contacts')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
} 