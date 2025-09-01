import React, { useState, useEffect } from 'react';
import {
  Mail,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Send,
  X,
  Copy,
  Shield,
  Building2,
  Info
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  invited_by: string | null;
  token: string;  // Cambio: invitation_token → token
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  organization?: {
    name: string;
    slug: string;
  };
}

// Helper function para calcular status dinámicamente
const getInvitationStatus = (invitation: Invitation): 'pending' | 'sent' | 'accepted' | 'expired' => {
  if (invitation.accepted_at) return 'accepted';
  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) return 'expired';
  return 'sent'; // Por defecto, invitación enviada y pendiente
};

interface InvitationStats {
  total: number;
  pending: number;
  sent: number;
  accepted: number;
  expired: number;
}

export function SuperAdminInvitations() {
  const { user, getToken } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<InvitationStats>({
    total: 0,
    pending: 0,
    sent: 0,
    accepted: 0,
    expired: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    organizationName: '',
  });

  // Load invitations and stats
  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      
      // Get invitations - usando tabla correcta
      const { data: invitationsData, error } = await supabase
        .from('saas_organization_invitations')
        .select(`
          *,
          organization:saas_organizations(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate stats usando helper function
      const stats: InvitationStats = {
        total: invitationsData?.length || 0,
        pending: invitationsData?.filter(i => getInvitationStatus(i) === 'pending').length || 0,
        sent: invitationsData?.filter(i => getInvitationStatus(i) === 'sent').length || 0,
        accepted: invitationsData?.filter(i => getInvitationStatus(i) === 'accepted').length || 0,
        expired: invitationsData?.filter(i => getInvitationStatus(i) === 'expired').length || 0,
      };

      setInvitations(invitationsData || []);
      setStats(stats);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invitations',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  // Send new invitation
  const handleSendInvitation = async () => {
    if (!newInvitation.email || !newInvitation.organizationName) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setSendingInvitation(true);
    try {
      // This will call the backend API to:
      // 1. Create user in Clerk with temp password
      // 2. Create organization
      // 3. Create invitation record
      // 4. Send email
      
      const token = await getToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/super-admin/invitations/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newInvitation.email,
          organization_name: newInvitation.organizationName,
        })
      });

      if (!response.ok) throw new Error('Failed to send invitation');

      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });

      setShowSendModal(false);
      setNewInvitation({ email: '', organizationName: '' });
      loadInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive'
      });
    } finally {
      setSendingInvitation(false);
    }
  };

  // Resend invitation
  const handleResendInvitation = async (invitationId: string) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/super-admin/invitations/resend/${invitationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to resend invitation');

      toast({
        title: 'Success',
        description: 'Invitation resent successfully',
      });

      loadInvitations();
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to resend invitation',
        variant: 'destructive'
      });
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const token = await getToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/super-admin/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to cancel invitation');

      toast({
        title: 'Success',
        description: 'Invitation cancelled',
      });

      loadInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel invitation',
        variant: 'destructive'
      });
    }
  };

  // Copy invitation link
  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/accept-invitation?token=${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Copied',
      description: 'Invitation link copied to clipboard',
    });
  };

  const getStatusIcon = (invitation: Invitation) => {
    const status = getInvitationStatus(invitation);
    
    switch (status) {
      case 'pending':
      case 'sent':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (invitation: Invitation) => {
    const status = getInvitationStatus(invitation);
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'pending': 'outline',
      'sent': 'secondary',
      'accepted': 'default',
      'expired': 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Invitations</CardTitle>
              <CardDescription>
                Invite new administrators to create and manage their organizations
              </CardDescription>
            </div>
            <Button onClick={() => setShowSendModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No invitations sent yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{invitation.email}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{invitation.organization?.name || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{invitation.organization?.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(invitation)}
                            {getStatusBadge(invitation)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                {new Date(invitation.created_at).toLocaleDateString()}
                              </TooltipTrigger>
                              <TooltipContent>
                                {new Date(invitation.created_at).toLocaleString()}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        
                        <TableCell>
                          {invitation.accepted_at ? (
                            <span className="text-sm text-green-600">Accepted</span>
                          ) : new Date(invitation.expires_at) < new Date() ? (
                            <span className="text-sm text-red-600">Expired</span>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  {new Date(invitation.expires_at).toLocaleDateString()}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {new Date(invitation.expires_at).toLocaleString()}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getInvitationStatus(invitation) === 'sent' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyInvitationLink(invitation.token)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResendInvitation(invitation.id)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Invitation Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Organization Invitation</DialogTitle>
            <DialogDescription>
              Invite a new administrator to create and manage their organization
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={newInvitation.email}
                onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="ACME Corporation"
                value={newInvitation.organizationName}
                onChange={(e) => setNewInvitation({ ...newInvitation, organizationName: e.target.value })}
              />
            </div>
            
            <div className="rounded-lg bg-blue-50 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-blue-900">What happens next:</p>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    <li>An account will be created in Clerk with a temporary password</li>
                    <li>A new organization will be created</li>
                    <li>The user will receive an email with login instructions</li>
                    <li>They'll be prompted to change their password on first login</li>
                    <li>They'll become the administrator of their organization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvitation} disabled={sendingInvitation}>
              {sendingInvitation ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}