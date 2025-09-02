export interface CandidateCompany {
  id: string;
  name: string;
  description: string;
  emails: string[];
  phones: string[];
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
  };
  process: string[];
  website?: string;
  industry?: string;
  employees?: string;
  founded?: number;
  scrapedAt: Date;
  status: 'active' | 'pending' | 'contacted' | 'rejected';
}