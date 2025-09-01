/**
 * AcceptInvitationPage Component
 * Public page for accepting organization invitations
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Mail, CheckCircle, XCircle, Clock, Users, Building } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useInvitations } from '../../hooks/organization/useInvitations';
import { OrganizationInvitation } from '../../services/organization/invitationApi';

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin', 
  manager: 'Manager',
  member: 'Member',
  viewer: 'Viewer',
};

const roleDescriptions = {
  owner: 'Full access to organization settings and data',
  admin: 'Manage members and organization settings',
  manager: 'Manage team projects and workflows',
  member: 'Access organization features and data',
  viewer: 'Read-only access to organization data',
};

const roleColors = {
  owner: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  
  const token = searchParams.get('token');
  const [invitation, setInvitation] = useState<OrganizationInvitation | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptSuccess, setAcceptSuccess] = useState(false);

  const {
    loading,
    error,
    getInvitationByToken,
    acceptInvitation,
    clearError,
  } = useInvitations();

  // Load invitation on component mount
  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    if (!token) return;

    const result = await getInvitationByToken(token);
    if (result.success && result.data) {
      setInvitation(result.data);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !userId || !token) return;

    setIsAccepting(true);
    
    try {
      const result = await acceptInvitation({
        token: token,
        user_id: userId,
      });

      if (result.success) {
        setAcceptSuccess(true);
        // Redirect to organization dashboard after 3 seconds
        setTimeout(() => {
          navigate('/polymet');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isInvitationExpired = (invitation: OrganizationInvitation) => {
    return invitation.expires_at && new Date(invitation.expires_at) < new Date();
  };

  const isInvitationAccepted = (invitation: OrganizationInvitation) => {
    return !!invitation.accepted_at;
  };

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              No invitation token was provided in the URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/polymet')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>
              {error || 'This invitation link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/polymet')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (acceptSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Welcome to the Team!</CardTitle>
            <CardDescription>
              You have successfully joined the organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Redirecting you to the dashboard...
            </p>
            <Button onClick={() => navigate('/polymet')} className="w-full">
              Go to Dashboard Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if invitation is expired
  if (isInvitationExpired(invitation)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation expired on {formatDate(invitation.expires_at!)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please contact the organization administrator for a new invitation.
            </p>
            <Button onClick={() => navigate('/polymet')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if invitation is already accepted
  if (isInvitationAccepted(invitation)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>
              This invitation was already accepted on {formatDate(invitation.accepted_at!)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/polymet')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">You're invited to join:</div>
                <div className="font-medium">{invitation.email}</div>
                <Badge className={roleColors[invitation.role as keyof typeof roleColors] + ' mt-2'}>
                  {roleLabels[invitation.role as keyof typeof roleLabels]}
                </Badge>
              </div>
              <Button onClick={() => navigate('/sign-in')} className="w-full">
                Sign In to Accept
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main invitation acceptance UI
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle>Organization Invitation</CardTitle>
          <CardDescription>
            You've been invited to join an organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Invitation Details */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Organization</div>
                  <div className="font-medium">Organization Name</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Invited Email</div>
                  <div className="font-medium">{invitation.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Role</div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleColors[invitation.role as keyof typeof roleColors]}>
                      {roleLabels[invitation.role as keyof typeof roleLabels]}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {roleDescriptions[invitation.role as keyof typeof roleDescriptions]}
                  </div>
                </div>
              </div>

              {invitation.expires_at && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Expires</div>
                    <div className="font-medium">{formatDate(invitation.expires_at)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800 mb-1">Signed in as:</div>
              <div className="font-medium text-blue-900">
                {user?.primaryEmailAddress?.emailAddress || userId}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleAcceptInvitation}
                disabled={isAccepting}
                className="w-full"
              >
                {isAccepting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/polymet')}
                className="w-full"
              >
                Decline
              </Button>
            </div>

            <div className="text-xs text-center text-gray-500">
              By accepting this invitation, you agree to join the organization with the specified role.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};