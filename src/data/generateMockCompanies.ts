import { CandidateCompany } from './mockCandidateCompanies';

// Extended data for generating large datasets
const companyNamePrefixes = [
  'Precision', 'Advanced', 'Elite', 'Premier', 'Superior', 'Apex', 'Global', 'Pro', 'Tech', 'Master',
  'Ultra', 'Prime', 'Excellence', 'Quality', 'Reliable', 'Innovative', 'Custom', 'Rapid', 'Smart', 'Dynamic',
  'Industrial', 'Professional', 'Expert', 'Specialized', 'Modern', 'Digital', 'Automated', 'Integrated'
];

const companyNameSuffixes = [
  'Manufacturing', 'Technologies', 'Solutions', 'Industries', 'Works', 'Systems', 'Corp', 'Company',
  'Enterprises', 'Group', 'Services', 'Engineering', 'Production', 'Fabrication', 'Machining',
  'Components', 'Parts', 'Assembly', 'Tools', 'Equipment', 'Aerospace', 'Automotive', 'Medical'
];

const cities = [
  { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
  { name: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
  { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
  { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
  { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
  { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
  { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
  { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
  { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
  { name: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
  { name: 'Jacksonville', state: 'FL', lat: 32.0835, lng: -81.6934 },
  { name: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
  { name: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
  { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
  { name: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  { name: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
  { name: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
  { name: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122 },
  { name: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
  { name: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065 },
  { name: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504 },
  { name: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747 },
  { name: 'Fresno', state: 'CA', lat: 36.7378, lng: -119.7871 },
  { name: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944 },
  { name: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
  { name: 'Mesa', state: 'AZ', lat: 33.4152, lng: -111.8315 }
];

const processes = [
  'CNC Machining', 'CNC Turning', 'CNC Milling', '5-axis Machining', '3-axis Machining',
  'Sheet Metal Fabrication', 'Welding', 'Laser Cutting', 'Plasma Cutting', 'Waterjet Cutting',
  'Wire EDM', 'Sinker EDM', 'Surface Grinding', 'Cylindrical Grinding', 'Honing',
  'Assembly', 'Quality Control', 'CMM Inspection', 'Heat Treatment', 'Anodizing',
  'Powder Coating', 'Plating', 'Passivation', 'Deburring', 'Finishing',
  'Rapid Prototyping', '3D Printing', 'Investment Casting', 'Die Casting', 'Forging',
  'Stamping', 'Deep Drawing', 'Roll Forming', 'Bending', 'Punching'
];

const industries = [
  'Manufacturing', 'Aerospace', 'Automotive', 'Medical Devices', 'Electronics',
  'Defense', 'Oil & Gas', 'Construction', 'Agriculture', 'Marine', 'Food Processing',
  'Semiconductor', 'Telecommunications', 'Energy', 'Transportation'
];

const employeeRanges = ['1-10', '10-25', '25-50', '50-100', '100-200', '200-500', '500+'];
const statuses: ('active' | 'pending' | 'contacted' | 'rejected')[] = ['active', 'pending', 'contacted', 'rejected'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], min: number = 1, max: number = 4): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateEmail(companyName: string): string[] {
  const domain = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15) + '.com';
  
  const emails = ['info', 'sales', 'contact'];
  const numEmails = Math.floor(Math.random() * 2) + 1; // 1-2 emails
  
  return emails.slice(0, numEmails).map(prefix => `${prefix}@${domain}`);
}

function generatePhone(): string[] {
  const phones = [];
  const numPhones = Math.floor(Math.random() * 2) + 1; // 1-2 phones
  
  for (let i = 0; i < numPhones; i++) {
    const areaCode = Math.floor(Math.random() * 800) + 200;
    const exchange = Math.floor(Math.random() * 800) + 200;
    const number = Math.floor(Math.random() * 9000) + 1000;
    phones.push(`+1-${areaCode}-${exchange.toString().substring(0, 3)}-${number}`);
  }
  
  return phones;
}

function generateDescription(companyName: string, selectedProcesses: string[], industry: string): string {
  const templates = [
    `${companyName} is a leading ${industry.toLowerCase()} company specializing in ${selectedProcesses.slice(0, 2).join(' and ')}. We provide high-quality parts with precision and reliability.`,
    `Established manufacturer offering comprehensive ${selectedProcesses.slice(0, 2).join(' and ')} services for the ${industry.toLowerCase()} industry. Known for quality and on-time delivery.`,
    `${companyName} provides advanced ${selectedProcesses[0].toLowerCase()} solutions with state-of-the-art equipment and experienced team members.`,
    `Full-service manufacturing company specializing in ${selectedProcesses.slice(0, 3).join(', ')} for various industries including ${industry.toLowerCase()}.`,
    `Professional ${industry.toLowerCase()} manufacturer with expertise in ${selectedProcesses.slice(0, 2).join(' and ')}. Certified quality management systems and competitive pricing.`
  ];
  
  return getRandomElement(templates);
}

export function generateMockCompanies(count: number = 1000): CandidateCompany[] {
  const companies: CandidateCompany[] = [];
  
  for (let i = 0; i < count; i++) {
    const prefix = getRandomElement(companyNamePrefixes);
    const suffix = getRandomElement(companyNameSuffixes);
    const companyName = `${prefix} ${suffix}`;
    
    const city = getRandomElement(cities);
    const selectedProcesses = getRandomElements(processes, 2, 6);
    const industry = getRandomElement(industries);
    const status = getRandomElement(statuses);
    const employees = getRandomElement(employeeRanges);
    const founded = Math.floor(Math.random() * 30) + 1990; // 1990-2020
    
    // Generate address
    const streetNumber = Math.floor(Math.random() * 9999) + 100;
    const streetNames = ['Industrial Blvd', 'Manufacturing Way', 'Technology Drive', 'Business Park', 'Commerce St', 'Factory Rd', 'Production Ave'];
    const address = `${streetNumber} ${getRandomElement(streetNames)}`;
    
    // Random date in last 6 months
    const scrapedDate = new Date();
    scrapedDate.setDate(scrapedDate.getDate() - Math.floor(Math.random() * 180));
    
    const company: CandidateCompany = {
      id: (i + 1).toString(),
      name: companyName,
      description: generateDescription(companyName, selectedProcesses, industry),
      emails: generateEmail(companyName),
      phones: generatePhone(),
      location: {
        address,
        city: city.name,
        state: city.state,
        country: 'USA',
        lat: city.lat + (Math.random() - 0.5) * 0.2, // Add some randomness
        lng: city.lng + (Math.random() - 0.5) * 0.2,
      },
      process: selectedProcesses,
      website: Math.random() > 0.3 ? `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}.com` : undefined,
      industry,
      employees,
      founded,
      scrapedAt: scrapedDate,
      status,
    };
    
    companies.push(company);
  }
  
  return companies;
}