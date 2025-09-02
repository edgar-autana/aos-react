import { useState, useEffect } from 'react';
import { CandidateCompany } from '@/types/candidate-company';

interface CandidateCompaniesHook {
  companies: CandidateCompany[];
  mapCompanies: CandidateCompany[];
  loading: boolean;
  error: string | null;
  mapCenter: [number, number];
}

// Country coordinates mapping
const getCountryCenter = (country: string): [number, number] => {
  const countryMap: Record<string, [number, number]> = {
    'México': [23.6345, -102.5528],
    'Mexico': [23.6345, -102.5528],
    'USA': [39.8283, -98.5795],
    'United States': [39.8283, -98.5795],
    'Canada': [56.1304, -106.3468],
    'Brasil': [-14.2350, -51.9253],
    'Brazil': [-14.2350, -51.9253],
    'Argentina': [-38.4161, -63.6167],
  };
  
  return countryMap[country] || [23.6345, -102.5528]; // Default to Mexico
};

// Parse CSV row to CandidateCompany
const parseCSVRow = (row: string[], headers: string[]): CandidateCompany | null => {
  try {
    const data: Record<string, string> = {};
    headers.forEach((header, index) => {
      data[header] = row[index] || '';
    });

    // Validate required fields
    if (!data.id || !data.company_name) {
      return null;
    }

    // Parse latitude and longitude
    const latitude = parseFloat(data.latitude);
    const longitude = parseFloat(data.longitude);

    // Parse location string (e.g., "México D.F.", "Querétaro", "Ciudad de México")
    const locationParts = (data.location || '').split(',').map(s => s.trim());
    const city = locationParts[0] || data.location || 'Unknown';
    const state = locationParts[1] || '';

    return {
      id: data.id,
      name: data.company_name,
      description: data.description || 'No description available',
      emails: data.email ? [data.email] : [],
      phones: data.phone ? [data.phone] : [],
      location: {
        address: data.address || data.formatted_address || '',
        city: city,
        state: state,
        country: data.country || 'México',
        lat: isNaN(latitude) ? 0 : latitude,
        lng: isNaN(longitude) ? 0 : longitude
      },
      process: data.process ? [data.process] : [],
      website: data.url || undefined,
      industry: 'Manufacturing',
      employees: undefined,
      founded: undefined,
      scrapedAt: new Date(),
      status: 'active'
    };
  } catch (error) {
    console.error('Error parsing CSV row:', error);
    return null;
  }
};

// Improved CSV parser that handles quoted fields with commas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    
    i++;
  }

  result.push(current.trim());
  return result.map(cell => cell.replace(/^["']|["']$/g, ''));
};

// Parse CSV content
const parseCSV = (csvContent: string): CandidateCompany[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const companies: CandidateCompany[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    
    const company = parseCSVRow(row, headers);
    if (company) {
      companies.push(company);
    }
  }

  return companies;
};

export const useCandidateCompanies = (): CandidateCompaniesHook => {
  const [companies, setCompanies] = useState<CandidateCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/data/candidate_company.csv');
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }

        const csvContent = await response.text();
        const parsedCompanies = parseCSV(csvContent);

        if (parsedCompanies.length === 0) {
          throw new Error('No valid companies found in CSV');
        }

        setCompanies(parsedCompanies);
      } catch (err) {
        console.error('Error loading candidate companies:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  // Filter companies with valid coordinates for map display
  const mapCompanies = companies.filter(company => 
    company.location.lat !== 0 && 
    company.location.lng !== 0 &&
    !isNaN(company.location.lat) &&
    !isNaN(company.location.lng)
  );

  // Determine map center based on primary country
  const mapCenter = companies.length > 0 
    ? getCountryCenter(companies[0].location.country)
    : [23.6345, -102.5528]; // Default to Mexico

  return {
    companies,
    mapCompanies,
    loading,
    error,
    mapCenter
  };
};