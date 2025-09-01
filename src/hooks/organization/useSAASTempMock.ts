/**
 * Temporary mock hooks for SAAS development
 * This file provides temporary mocks to avoid import errors during integration
 * TODO: Remove this file once proper hooks are integrated with Clerk
 */

// Mock organization hook
export const useOrganizations = () => ({
  organizations: [],
  selectedOrganization: null,
  userContext: null,
  isLoading: false,
  error: null,
  showCreateModal: false,
  showMemberModal: false,
  createOrganization: async () => ({}),
  updateOrganization: async () => ({}),
  switchOrganization: async () => {},
  refreshOrganizations: async () => {},
  fetchUserContext: async () => {},
  showCreateModal: () => {},
  hideCreateModal: () => {},
  showMemberModal: () => {},
  hideMemberModal: () => {},
  clearError: () => {},
  isAuthenticated: false,
  isSuperAdmin: false,
  currentPermissions: {},
  hasOrganizations: false,
});

// Mock organization members hook
export const useOrganizationMembers = () => ({
  members: [],
  isLoading: false,
  error: null,
  isInviting: false,
  fetchMembers: async () => {},
  inviteMember: async () => ({}),
  removeMember: async () => {},
  updateMemberRole: async () => {},
  clearError: () => {},
  getMemberByUserId: () => null,
  getMembersByRole: () => [],
  memberCount: 0,
  owners: [],
  admins: [],
  managers: [],
  regularMembers: [],
  viewers: [],
});

// Mock super admin hook
export const useSuperAdmin = () => ({
  allOrganizations: [],
  isLoading: false,
  error: null,
  systemHealth: null,
  fetchAllOrganizations: async () => ({}),
  updateOrganizationStatus: async () => ({}),
  updateOrganizationPlan: async () => ({}),
  fetchSystemHealth: async () => ({}),
  clearError: () => {},
  getOrganizationsByStatus: () => [],
  getOrganizationsByPlan: () => [],
  searchOrganizations: () => [],
  getAnalytics: () => ({
    totalOrganizations: 0,
    activeOrganizations: 0,
    suspendedOrganizations: 0,
    cancelledOrganizations: 0,
    freeOrganizations: 0,
    premiumOrganizations: 0,
    enterpriseOrganizations: 0,
    totalMembers: 0,
    averageMembersPerOrganization: 0,
    organizationsByStatus: { active: 0, suspended: 0, cancelled: 0, pending: 0 },
    organizationsByPlan: { free: 0, premium: 0, enterprise: 0 },
  }),
  isAuthenticated: false,
  analytics: {
    totalOrganizations: 0,
    activeOrganizations: 0,
    suspendedOrganizations: 0,
    cancelledOrganizations: 0,
    freeOrganizations: 0,
    premiumOrganizations: 0,
    enterpriseOrganizations: 0,
    totalMembers: 0,
    averageMembersPerOrganization: 0,
    organizationsByStatus: { active: 0, suspended: 0, cancelled: 0, pending: 0 },
    organizationsByPlan: { free: 0, premium: 0, enterprise: 0 },
  },
});