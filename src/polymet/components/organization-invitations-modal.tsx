/**
 * OrganizationInvitationsModal Component
 * Modal for managing organization invitations (sent, pending, expired)
 */

import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, XCircle, MoreHorizontal, UserPlus, RefreshCw, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInvitations } from '../../hooks/organization/useInvitations';
import { Organization } from '../../types/organization/organization';
import { OrganizationInvitation } from '../../services/organization/invitationApi';

const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['owner', 'admin', 'manager', 'member', 'viewer']),
});

interface OrganizationInvitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
}

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin', 
  manager: 'Manager',
  member: 'Member',
  viewer: 'Viewer',
};

const roleColors = {
  owner: 'bg-yellow-100 text-yellow-800',
  admin: 'bg-red-100 text-red-800',
  manager: 'bg-blue-100 text-blue-800',
  member: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export const OrganizationInvitationsModal: React.FC<OrganizationInvitationsModalProps> = ({
  isOpen,
  onClose,
  organization,
}) => {
  const {
    invitations,
    loading,
    error,
    totalCount,
    createInvitation,
    updateInvitation,
    deleteInvitation,
    resendInvitation,
    loadInvitations,
    clearError,
  } = useInvitations({ 
    organizationId: organization?.id,
    autoLoad: true
  });

  const [showInviteForm, setShowInviteForm] = useState(false);

  const form = useForm<{ email: string; role: string }>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  // Load invitations when modal opens
  useEffect(() => {
    if (isOpen && organization?.id) {
      loadInvitations();
    }
  }, [isOpen, organization?.id, loadInvitations]);

  const onSubmitInvite = async (values: { email: string; role: string }) => {
    if (!organization?.id) return;

    const result = await createInvitation({
      organization_id: organization.id,
      email: values.email,
      role: values.role,
    });

    if (result.success) {
      form.reset();
      setShowInviteForm(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    await resendInvitation(invitationId);
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    await deleteInvitation(invitationId);
  };

  const getInvitationStatus = (invitation: OrganizationInvitation) => {
    if (invitation.accepted_at) {
      return { status: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800', icon: XCircle };
    }

    return { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingInvitations = invitations.filter(inv => !inv.accepted_at && (!inv.expires_at || new Date(inv.expires_at) >= new Date()));
  const expiredInvitations = invitations.filter(inv => !inv.accepted_at && inv.expires_at && new Date(inv.expires_at) < new Date());
  const acceptedInvitations = invitations.filter(inv => inv.accepted_at);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Organization Invitations
            {organization && (
              <Badge variant="outline" className="ml-2">
                {organization.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Error Alert */}
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

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {totalCount} total invitation{totalCount !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-2 text-xs">
              <Badge variant="secondary" className="bg-yellow-50">
                {pendingInvitations.length} pending
              </Badge>
              <Badge variant="secondary" className="bg-green-50">
                {acceptedInvitations.length} accepted
              </Badge>
              <Badge variant="secondary" className="bg-red-50">
                {expiredInvitations.length} expired
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadInvitations()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowInviteForm(true)}
              size="sm"
              disabled={loading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3">Send New Invitation</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitInvite)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="user@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Invitations List */}
        {loading && !invitations.length ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading invitations...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Invitations ({pendingInvitations.length})
                </h3>
                <div className="space-y-2">
                  {pendingInvitations.map((invitation) => {
                    const status = getInvitationStatus(invitation);
                    const StatusIcon = status.icon;
                    
                    return (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {invitation.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{invitation.email}</div>
                            <div className="text-sm text-gray-500">
                              Invited {formatDate(invitation.created_at)}
                              {invitation.expires_at && (
                                <span> • Expires {formatDate(invitation.expires_at)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={roleColors[invitation.role as keyof typeof roleColors]}>
                            {roleLabels[invitation.role as keyof typeof roleLabels]}
                          </Badge>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleResendInvitation(invitation.id)}
                                disabled={loading}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend Invitation
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteInvitation(invitation.id)}
                                disabled={loading}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Invitation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Accepted Invitations */}
            {acceptedInvitations.length > 0 && (
              <>
                {pendingInvitations.length > 0 && <Separator />}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Accepted Invitations ({acceptedInvitations.length})
                  </h3>
                  <div className="space-y-2">
                    {acceptedInvitations.map((invitation) => {
                      const status = getInvitationStatus(invitation);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {invitation.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{invitation.email}</div>
                              <div className="text-sm text-gray-500">
                                Accepted {formatDate(invitation.accepted_at!)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={roleColors[invitation.role as keyof typeof roleColors]}>
                              {roleLabels[invitation.role as keyof typeof roleLabels]}
                            </Badge>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Expired Invitations */}
            {expiredInvitations.length > 0 && (
              <>
                {(pendingInvitations.length > 0 || acceptedInvitations.length > 0) && <Separator />}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    Expired Invitations ({expiredInvitations.length})
                  </h3>
                  <div className="space-y-2">
                    {expiredInvitations.map((invitation) => {
                      const status = getInvitationStatus(invitation);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {invitation.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-600">{invitation.email}</div>
                              <div className="text-sm text-gray-500">
                                Expired {formatDate(invitation.expires_at!)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={roleColors[invitation.role as keyof typeof roleColors]}>
                              {roleLabels[invitation.role as keyof typeof roleLabels]}
                            </Badge>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleResendInvitation(invitation.id)}
                                  disabled={loading}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Resend Invitation
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteInvitation(invitation.id)}
                                  disabled={loading}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Delete Invitation
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Empty State */}
            {!loading && invitations.length === 0 && (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations yet</h3>
                <p className="text-gray-600 mb-4">
                  Send your first invitation to start building your team.
                </p>
                <Button onClick={() => setShowInviteForm(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send First Invitation
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};