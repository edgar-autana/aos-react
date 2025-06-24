import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  MailIcon,
  PhoneIcon,
  LinkedinIcon,
  BriefcaseIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setForm(f => ({ ...f, image: URL.createObjectURL(e.target.files![0]) }));
    }
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

  // Get initials for avatar fallback
  const getInitials = (name: string, lastName: string) => {
    return (name.charAt(0) + (lastName.charAt(0) || "")).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      {/* Back button */}
      <Button variant="ghost" className="pl-0 mb-2" onClick={() => navigate('/contacts')}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to Contacts
      </Button>

      {/* Profile header */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="relative">
          <Avatar className="h-20 w-20 border">
            {form.image ? (
              <AvatarImage src={form.image} alt={form.name} />
            ) : (
              <AvatarFallback className="text-xl">
                {getInitials(form.name, form.lastName)}
              </AvatarFallback>
            )}
          </Avatar>
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button size="sm" variant="outline" className="absolute bottom-0 right-0" onClick={() => fileInputRef.current?.click()}>
            Upload
          </Button>
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{form.name} {form.lastName}</h1>
            {form.mainContact && (
              <Badge className="bg-blue-100 text-blue-800">Main Contact</Badge>
            )}
            {form.tag && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 flex items-center gap-1"><TagIcon className="h-3 w-3" />{form.tag}</Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{form.company}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm pt-2">
            {form.email && (
              <div className="flex items-center gap-1">
                <MailIcon className="h-4 w-4 text-muted-foreground" />
                <span>{form.email}</span>
              </div>
            )}
            {form.phone && (
              <div className="flex items-center gap-1">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                <span>{form.phone}</span>
              </div>
            )}
            {form.linkedin && (
              <div className="flex items-center gap-1">
                <LinkedinIcon className="h-4 w-4 text-muted-foreground" />
                <a href={form.linkedin} target="_blank" rel="noopener noreferrer" className="underline">LinkedIn</a>
              </div>
            )}
            {form.position && (
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span>{form.position}</span>
              </div>
            )}
            {form.provider && (
              <div className="flex items-center gap-1">
                <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                <span>{form.provider}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
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
            <div className="flex items-center gap-2 col-span-1 md:col-span-2">
              <input type="checkbox" name="mainContact" checked={form.mainContact} onChange={handleChange} />
              <label>Main Contact Customer</label>
            </div>
            <div className="flex gap-2 mt-6 col-span-1 md:col-span-2">
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
        </CardContent>
      </Card>
    </div>
  );
} 