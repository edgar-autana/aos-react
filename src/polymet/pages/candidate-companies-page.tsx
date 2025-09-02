import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SearchIcon,
  FilterIcon,
  MapIcon,
  ListIcon,
  BuildingIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  UsersIcon,
  CalendarIcon,
  GlobeIcon,
  RefreshCwIcon
} from "lucide-react";
import { CandidateCompany } from "@/data/mockCandidateCompanies";
import { useCandidateCompanies } from "@/hooks/useCandidateCompanies";
import InteractiveCompaniesMap from "@/polymet/components/interactive-companies-map";
import CompanyDetailsModal from "@/polymet/components/company-details-modal";
import CompaniesDataTable from "@/polymet/components/companies-data-table";
import '@/styles/candidate-companies.css';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-300';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'contacted': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function CandidateCompaniesPage() {
  const [selectedCompany, setSelectedCompany] = useState<CandidateCompany | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [processFilter, setProcessFilter] = useState<string>('all');
  const [cleanDataFilter, setCleanDataFilter] = useState<'all' | 'clean' | 'incomplete'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Load companies from CSV
  const { companies: companiesData, mapCompanies, loading, error, mapCenter } = useCandidateCompanies();

  // Get unique processes for filter
  const allProcesses = Array.from(new Set(companiesData.flatMap(c => c.process)));

  // Helper function to determine if company has clean data
  const isCleanData = (company: CandidateCompany): boolean => {
    return !!(
      company.name &&
      company.description &&
      company.emails.length > 0 &&
      company.phones.length > 0 &&
      company.location.lat !== 0 &&
      company.location.lng !== 0 &&
      !isNaN(company.location.lat) &&
      !isNaN(company.location.lng) &&
      company.location.address &&
      company.process.length > 0
    );
  };

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companiesData.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProcess = processFilter === 'all' || company.process.includes(processFilter);
      
      const matchesCleanData = cleanDataFilter === 'all' || 
        (cleanDataFilter === 'clean' && isCleanData(company)) ||
        (cleanDataFilter === 'incomplete' && !isCleanData(company));

      return matchesSearch && matchesProcess && matchesCleanData;
    });
  }, [companiesData, searchTerm, processFilter, cleanDataFilter]);

  const handleCompanySelect = (company: CandidateCompany) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  // Data quality statistics
  const dataQualityStats = useMemo(() => {
    const totalCompanies = filteredCompanies.length;
    const cleanCompanies = filteredCompanies.filter(isCleanData).length;
    const incompleteCompanies = totalCompanies - cleanCompanies;
    const companiesWithGeo = filteredCompanies.filter(c => 
      c.location.lat !== 0 && c.location.lng !== 0 && !isNaN(c.location.lat) && !isNaN(c.location.lng)
    ).length;

    return {
      total: totalCompanies,
      clean: cleanCompanies,
      incomplete: incompleteCompanies,
      withGeo: companiesWithGeo
    };
  }, [filteredCompanies]);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCwIcon className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading companies...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <p className="text-lg font-medium">Error loading companies</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Candidate Companies
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage scraped manufacturing companies and potential suppliers
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <ListIcon className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dataQualityStats.total}
                </p>
              </div>
              <BuildingIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Clean Data</p>
                <p className="text-2xl font-bold text-green-600">
                  {dataQualityStats.clean}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Incomplete Data</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dataQualityStats.incomplete}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-500"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">With Geolocation</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dataQualityStats.withGeo}
                </p>
              </div>
              <MapPinIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Only show for map view */}
      {viewMode === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FilterIcon className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Process
              </label>
              <Select value={processFilter} onValueChange={setProcessFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All processes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All processes</SelectItem>
                  {allProcesses.map(process => (
                    <SelectItem key={process} value={process}>
                      {process}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Data Quality
              </label>
              <Select value={cleanDataFilter} onValueChange={setCleanDataFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All companies</SelectItem>
                  <SelectItem value="clean">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      Clean data only
                    </div>
                  </SelectItem>
                  <SelectItem value="incomplete">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      Incomplete data only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Main Content */}
      <div className="min-h-[600px]">
        {viewMode === 'map' ? (
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapIcon className="h-5 w-5" />
                Companies Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-80px)]">
              <InteractiveCompaniesMap
                companies={filteredCompanies.filter(c => 
                  c.location.lat !== 0 && 
                  c.location.lng !== 0 &&
                  !isNaN(c.location.lat) &&
                  !isNaN(c.location.lng)
                )}
                onCompanySelect={handleCompanySelect}
                selectedCompany={selectedCompany}
                mapCenter={mapCenter}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListIcon className="h-5 w-5" />
                Companies Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompaniesDataTable
                data={filteredCompanies}
                onRowClick={handleCompanySelect}
                globalFilter={searchTerm}
                onGlobalFilterChange={setSearchTerm}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Company Details Modal */}
      <CompanyDetailsModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}