import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinIcon, BuildingIcon, UsersIcon, CalendarIcon, MailIcon, PhoneIcon } from "lucide-react";
import { CandidateCompany } from "@/data/mockCandidateCompanies";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const createCustomIcon = (status: string) => {
  let color = '#6366f1'; // default
  switch (status) {
    case 'active': color = '#10b981'; break;
    case 'pending': color = '#f59e0b'; break;
    case 'contacted': color = '#3b82f6'; break;
    case 'rejected': color = '#ef4444'; break;
  }
  
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-300';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

interface InteractiveCompaniesMapProps {
  companies: CandidateCompany[];
  onCompanySelect: (company: CandidateCompany) => void;
  selectedCompany?: CandidateCompany | null;
  mapCenter?: [number, number];
}

export default function InteractiveCompaniesMap({ 
  companies, 
  onCompanySelect, 
  selectedCompany,
  mapCenter = [23.6345, -102.5528] // Default to Mexico center
}: InteractiveCompaniesMapProps) {
  const [mapZoom] = useState(5);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {companies.map((company) => (
          <Marker
            key={company.id}
            position={[company.location.lat, company.location.lng]}
            icon={createCustomIcon(company.status)}
            eventHandlers={{
              click: () => onCompanySelect(company),
            }}
          >
            <Popup maxWidth={480} className="custom-popup">
              <Card className="border-0 shadow-none">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header with Company Name */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                          {company.name}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`mt-2 text-xs ${getStatusColor(company.status)}`}
                        >
                          {company.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2">
                      {/* Emails */}
                      <div className="flex items-start gap-2">
                        <MailIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-2 text-sm">
                          {company.emails.slice(0, 2).map((email, index) => (
                            <a
                              key={index}
                              href={`mailto:${email}`}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {email}
                            </a>
                          ))}
                          {company.emails.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{company.emails.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Phones */}
                      <div className="flex items-start gap-2">
                        <PhoneIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-wrap gap-2 text-sm">
                          {company.phones.slice(0, 2).map((phone, index) => (
                            <a
                              key={index}
                              href={`tel:${phone}`}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {phone}
                            </a>
                          ))}
                          {company.phones.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{company.phones.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Location - Compact */}
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {company.location.city}, {company.location.state}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompanySelect(company);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .custom-popup .leaflet-popup-content-wrapper {
          padding: 12px;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          min-width: 440px;
        }
        
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 420px !important;
          max-width: 420px;
        }
        
        .custom-popup .leaflet-popup-close-button {
          padding: 8px;
          font-size: 18px;
          color: #6b7280;
          right: 8px;
          top: 8px;
        }
        
        .custom-popup .leaflet-popup-close-button:hover {
          color: #374151;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        
        .custom-div-icon {
          background: transparent;
          border: none;
        }
        
        /* Ensure contact links are clickable and don't break layout */
        .custom-popup a {
          word-break: break-all;
          line-height: 1.3;
        }
        
        .custom-popup .flex-wrap {
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
}