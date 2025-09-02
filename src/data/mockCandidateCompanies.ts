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

export const mockCandidateCompanies: CandidateCompany[] = [
  {
    id: '1',
    name: 'PrecisionTech Manufacturing',
    description: 'Leading CNC machining and precision manufacturing company specializing in aerospace and automotive components. We provide high-quality parts with tight tolerances.',
    emails: ['info@precisiontech.com', 'sales@precisiontech.com'],
    phones: ['+1-555-0123', '+1-555-0124'],
    location: {
      address: '1250 Industrial Blvd',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      lat: 34.0522,
      lng: -118.2437
    },
    process: ['CNC Machining', 'Turning', 'Milling', 'Surface Finishing'],
    website: 'https://precisiontech.com',
    industry: 'Manufacturing',
    employees: '50-100',
    founded: 1995,
    scrapedAt: new Date('2025-01-15'),
    status: 'active'
  },
  {
    id: '2',
    name: 'Apex Manufacturing Solutions',
    description: 'Full-service manufacturing company offering CNC machining, sheet metal fabrication, and assembly services for various industries.',
    emails: ['contact@apexmfg.com'],
    phones: ['+1-555-0234'],
    location: {
      address: '789 Manufacturing Way',
      city: 'Detroit',
      state: 'MI',
      country: 'USA',
      lat: 42.3314,
      lng: -83.0458
    },
    process: ['CNC Machining', 'Sheet Metal', 'Welding', 'Assembly'],
    website: 'https://apexmfg.com',
    industry: 'Manufacturing',
    employees: '25-50',
    founded: 2008,
    scrapedAt: new Date('2025-01-14'),
    status: 'pending'
  },
  {
    id: '3',
    name: 'TechCore Industries',
    description: 'Advanced manufacturing facility specializing in precision components for medical devices and electronics industry.',
    emails: ['info@techcore.com', 'quality@techcore.com'],
    phones: ['+1-555-0345', '+1-555-0346'],
    location: {
      address: '456 Technology Drive',
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      lat: 30.2672,
      lng: -97.7431
    },
    process: ['CNC Machining', 'Precision Turning', 'Quality Control', 'Packaging'],
    website: 'https://techcore.com',
    industry: 'Medical Devices',
    employees: '100-200',
    founded: 2010,
    scrapedAt: new Date('2025-01-13'),
    status: 'contacted'
  },
  {
    id: '4',
    name: 'MetalWorks Pro',
    description: 'Specialized metal fabrication company with expertise in custom CNC machining and rapid prototyping services.',
    emails: ['orders@metalworkspro.com'],
    phones: ['+1-555-0456'],
    location: {
      address: '321 Steel Street',
      city: 'Pittsburgh',
      state: 'PA',
      country: 'USA',
      lat: 40.4406,
      lng: -79.9959
    },
    process: ['CNC Machining', 'Rapid Prototyping', 'Metal Fabrication', 'Heat Treatment'],
    website: 'https://metalworkspro.com',
    industry: 'Manufacturing',
    employees: '10-25',
    founded: 2015,
    scrapedAt: new Date('2025-01-12'),
    status: 'active'
  },
  {
    id: '5',
    name: 'Global Precision Manufacturing',
    description: 'International manufacturing company with facilities worldwide. Specializing in high-volume production and complex assemblies.',
    emails: ['global@gpm.com', 'na-sales@gpm.com'],
    phones: ['+1-555-0567', '+1-555-0568'],
    location: {
      address: '900 Global Plaza',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      lat: 41.8781,
      lng: -87.6298
    },
    process: ['CNC Machining', 'Assembly', 'Quality Assurance', 'Logistics'],
    website: 'https://gpm.com',
    industry: 'Manufacturing',
    employees: '500+',
    founded: 1985,
    scrapedAt: new Date('2025-01-11'),
    status: 'active'
  },
  {
    id: '6',
    name: 'Rapid Manufacturing Co',
    description: 'Fast-turnaround manufacturing company focusing on quick delivery of precision machined parts and prototypes.',
    emails: ['rapid@rapidmfg.com'],
    phones: ['+1-555-0678'],
    location: {
      address: '2100 Speed Lane',
      city: 'San Jose',
      state: 'CA',
      country: 'USA',
      lat: 37.3382,
      lng: -121.8863
    },
    process: ['CNC Machining', 'Rapid Prototyping', '3D Printing', 'Finishing'],
    website: 'https://rapidmfg.com',
    industry: 'Manufacturing',
    employees: '25-50',
    founded: 2018,
    scrapedAt: new Date('2025-01-10'),
    status: 'pending'
  },
  {
    id: '7',
    name: 'Precision Aerospace Systems',
    description: 'FAA-certified manufacturer specializing in aerospace components with AS9100 certification and strict quality standards.',
    emails: ['aerospace@pas.com', 'quality@pas.com'],
    phones: ['+1-555-0789'],
    location: {
      address: '1500 Aerospace Blvd',
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      lat: 47.6062,
      lng: -122.3321
    },
    process: ['CNC Machining', 'Aerospace Assembly', 'NDT Testing', 'Certification'],
    website: 'https://pas.com',
    industry: 'Aerospace',
    employees: '200-300',
    founded: 1992,
    scrapedAt: new Date('2025-01-09'),
    status: 'contacted'
  },
  {
    id: '8',
    name: 'Advanced Machining Technologies',
    description: 'State-of-the-art CNC machining facility with 5-axis capabilities and advanced quality measurement systems.',
    emails: ['info@amt.com'],
    phones: ['+1-555-0890'],
    location: {
      address: '800 Tech Park Drive',
      city: 'Denver',
      state: 'CO',
      country: 'USA',
      lat: 39.7392,
      lng: -104.9903
    },
    process: ['5-axis CNC Machining', 'CMM Inspection', 'Tool Making', 'Engineering Support'],
    website: 'https://amt.com',
    industry: 'Manufacturing',
    employees: '75-100',
    founded: 2005,
    scrapedAt: new Date('2025-01-08'),
    status: 'active'
  }
];