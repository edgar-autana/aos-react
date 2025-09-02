import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  MapPinIcon, 
  PhoneIcon, 
  MailIcon, 
  GlobeIcon, 
  BuildingIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  AlertCircleIcon
} from "lucide-react";
import { CandidateCompany } from "@/types/candidate-company";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CompanyDetailsModalProps {
  company: CandidateCompany | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-300';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return <CheckCircleIcon className="h-4 w-4" />;
    case 'pending': return <ClockIcon className="h-4 w-4" />;
    case 'contacted': return <AlertCircleIcon className="h-4 w-4" />;
    case 'rejected': return <XCircleIcon className="h-4 w-4" />;
    default: return <ClockIcon className="h-4 w-4" />;
  }
};

export default function CompanyDetailsModal({ company, isOpen, onClose }: CompanyDetailsModalProps) {
  if (!company) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="candidate-companies-modal max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {company.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Company Information */}
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline" 
                className={`flex items-center gap-2 px-3 py-1 ${getStatusColor(company.status)}`}
              >
                {getStatusIcon(company.status)}
                <span className="capitalize font-medium">{company.status}</span>
              </Badge>
              <span className="text-sm text-gray-500">
                Scraped {company.scrapedAt.toLocaleDateString()}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Description</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {company.description}
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Contact Information</h3>
              <div className="space-y-3">
                {/* Emails */}
                <div className="flex items-start gap-3">
                  <MailIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    {company.emails.map((email, index) => (
                      <a
                        key={index}
                        href={`mailto:${email}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Phones */}
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    {company.phones.map((phone, index) => (
                      <a
                        key={index}
                        href={`tel:${phone}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Website */}
                {company.website && (
                  <div className="flex items-center gap-3">
                    <GlobeIcon className="h-5 w-5 text-gray-500" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Location</h3>
              <div className="flex items-start gap-3">
                <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{company.location.address}</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {company.location.city}, {company.location.state} {company.location.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Processes */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Processes</h3>
              <div className="flex flex-wrap gap-2">
                {company.process.map((process, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {process}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Company Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Company Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.industry && (
                  <div className="flex items-center gap-2">
                    <BuildingIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Industry:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{company.industry}</span>
                  </div>
                )}
                {company.employees && (
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Employees:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{company.employees}</span>
                  </div>
                )}
                {company.founded && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Founded:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{company.founded}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <Separator />
            <div className="flex gap-3">
              <Button className="flex-1">
                <MailIcon className="h-4 w-4 mr-2" />
                Send RFQ
              </Button>
              <Button variant="outline" className="flex-1">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline">
                Mark as Contacted
              </Button>
            </div>
          </div>

          {/* Map */}
          <div className="lg:sticky lg:top-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Location Map</h3>
            <div className="h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <MapContainer
                center={[company.location.lat, company.location.lng]}
                zoom={13}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[company.location.lat, company.location.lng]}>
                  <Popup>
                    <div className="text-center">
                      <h4 className="font-bold text-sm">{company.name}</h4>
                      <p className="text-xs">{company.location.address}</p>
                      <p className="text-xs">{company.location.city}, {company.location.state}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}