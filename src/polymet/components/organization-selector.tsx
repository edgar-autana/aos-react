/**
 * OrganizationSelector Component
 * Allows users to switch between organizations and create new ones
 */

import React from 'react';
import { Building2, ChevronDown, Plus, Settings, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useGlobalData } from '../../contexts/GlobalDataProviderReal';
import { Organization } from '../../types/organization/organization';

interface OrganizationSelectorProps {
  onCreateOrganization?: () => void;
  onManageOrganization?: (organization: Organization) => void;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  onCreateOrganization,
  onManageOrganization,
}) => {
  const {
    organizations,
    selectedOrganization,
    canCreateOrganization,
    getOrganizationLimitText
  } = useGlobalData();

  // Don't render if no data (data is already loaded globally)
  if (!organizations.length || !selectedOrganization) {
    return null;
  }

  const handleSwitchOrganization = async (organizationId: string) => {
    // TODO: Implement organization switching through context
    // For now, just reload the page to refresh data
    window.location.reload();
  };

  const getPlanBadgeVariant = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return 'default';
      case 'premium':
        return 'secondary';
      case 'free':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'suspended':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };


  if (!organizations.length) {
    return (
      <Button
        variant="outline"
        onClick={onCreateOrganization}
        className="w-48 relative"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Organization
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
          SAAS
        </span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-48 justify-between">
          <div className="flex items-center">
            <Building2 className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate max-w-32">
                {selectedOrganization?.name || 'Select Organization'}
              </span>
              {selectedOrganization && (
                <span className="text-xs text-muted-foreground">
                  {selectedOrganization.member_count || 1} member{(selectedOrganization.member_count || 1) !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSwitchOrganization(org.id)}
            className="flex items-center justify-between p-3"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium truncate">{org.name}</span>
                  {selectedOrganization?.id === org.id && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={getPlanBadgeVariant(org.plan_type)} className="text-xs">
                    {org.plan_type}
                  </Badge>
                  
                  <span className={`text-xs ${getStatusColor(org.status)}`}>
                    {org.status}
                  </span>
                  
                  <span className="text-xs text-muted-foreground">
                   {org.member_count || 1} member{(org.member_count || 1) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
            
            {onManageOrganization && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageOrganization(org);
                }}
                className="ml-2"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {onCreateOrganization && (
          <DropdownMenuItem 
            onClick={canCreateOrganization ? onCreateOrganization : undefined}
            disabled={!canCreateOrganization}
            className={!canCreateOrganization ? "opacity-50" : ""}
          >
            <Plus className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>Create Organization</span>
              {!canCreateOrganization && (
                <span className="text-xs text-muted-foreground">
                  {getOrganizationLimitText()}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        )}
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
};