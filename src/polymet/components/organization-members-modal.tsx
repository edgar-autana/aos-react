/**
 * OrganizationMembersModal Component
 * Modal for managing organization members
 */

import React, { useState } from 'react';
import { Users, UserPlus, Crown, Shield, User, Eye, MoreHorizontal, Mail } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrganizationMembers } from '../../hooks/organization/useOrganizationMembers';
import { OrganizationRole, Organization } from '../../types/organization/organization';
import { OrganizationInvitationsModal } from './organization-invitations-modal';

const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['owner', 'admin', 'manager', 'member', 'viewer']),
});

interface OrganizationMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
}

export const OrganizationMembersModal: React.FC<OrganizationMembersModalProps> = ({
  isOpen,
  onClose,
  organization,
}) => {
  const {
    members,
    isLoading,
    error,
    isInviting,
    inviteMember,
    updateMemberRole,
    removeMember,
    clearError,
  } = useOrganizationMembers(organization?.id || null);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showInvitationsModal, setShowInvitationsModal] = useState(false);

  const form = useForm<{ email: string; role: OrganizationRole }>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmitInvite = async (values: { email: string; role: OrganizationRole }) => {
    try {
      await inviteMember(values.email, values.role);
      form.reset();
      setShowInviteForm(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: OrganizationRole) => {
    try {
      await updateMemberRole(memberId, newRole);
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleIcon = (role: OrganizationRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'manager':
        return <User className="h-4 w-4 text-green-500" />;
      case 'member':
        return <User className="h-4 w-4 text-gray-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-400" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: OrganizationRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'manager':
        return 'outline';
      case 'member':
        return 'outline';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (!organization) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Manage Members - {organization.name}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Invite New Member Section */}
          <div className="border-b pb-4">
            {!showInviteForm ? (
              <div className="space-y-2">
                <Button
                  onClick={() => setShowInviteForm(true)}
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite New Member
                </Button>
                <Button
                  onClick={() => setShowInvitationsModal(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Manage Invitations
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitInvite)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="user@example.com"
                              {...field}
                              disabled={isInviting}
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isInviting}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowInviteForm(false);
                        form.reset();
                      }}
                      disabled={isInviting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isInviting}>
                      {isInviting ? 'Inviting...' : 'Send Invitation'}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Members ({members.length})
            </h3>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No members found. Invite someone to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${member.user_email}`} />
                        <AvatarFallback>
                          {getInitials(member.user_name || '', member.user_email || '')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {member.user_name || member.user_email || member.user_id}
                          </span>
                          {getRoleIcon(member.role)}
                        </div>
                        {member.user_email && (
                          <span className="text-sm text-muted-foreground">
                            {member.user_email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'admin')}
                            disabled={member.role === 'admin'}
                          >
                            Make Admin
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'member')}
                            disabled={member.role === 'member'}
                          >
                            Make Member
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, 'viewer')}
                            disabled={member.role === 'viewer'}
                          >
                            Make Viewer
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600"
                            disabled={member.role === 'owner'}
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Invitations Management Modal */}
      <OrganizationInvitationsModal
        isOpen={showInvitationsModal}
        onClose={() => setShowInvitationsModal(false)}
        organization={organization}
      />
    </Dialog>
  );
};