import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Save, Plus, User, Briefcase, Settings, Users, Key, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type WorkspaceSettings = {
  id: string;
  name: string;
  logo_url?: string;
  default_assistant_id?: string;
  billing_tier: string;
  created_at: string;
  updated_at: string;
};

type WorkspaceMember = {
  user_id: string;
  workspace_id: string;
  role: 'admin' | 'member' | 'viewer';
  email: string;
  full_name?: string;
  avatar_url?: string;
};

const workspaceFormSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  logo_url: z.string().optional(),
  default_assistant_id: z.string().optional(),
  billing_tier: z.enum(["free", "pro", "enterprise"]),
});

const userInviteFormSchema = z.object({
  email: z.string().email("Must be a valid email"),
  role: z.enum(["admin", "member", "viewer"]),
});

const apiKeysFormSchema = z.object({
  openai_api_key: z.string().min(1, "API key is required"),
});

const useWorkspace = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workspace_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as WorkspaceSettings;
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members'],
    queryFn: async () => {
      if (!workspace?.id) return [];
      
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          workspace_id,
          role,
          profiles:user_id (
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('workspace_id', workspace.id);
      
      if (error) throw error;
      
      return data.map(member => {
        const profile = member.profiles as any;
        return {
          user_id: member.user_id,
          workspace_id: member.workspace_id,
          role: member.role,
          email: profile ? profile.email || '' : '',
          full_name: profile ? profile.full_name || '' : '',
          avatar_url: profile ? profile.avatar_url || '' : '',
        };
      }) as WorkspaceMember[];
    },
    enabled: !!workspace?.id,
  });

  const updateWorkspace = useMutation({
    mutationFn: async (data: Partial<WorkspaceSettings>) => {
      if (!workspace?.id) throw new Error("No workspace found");
      
      const { error } = await supabase
        .from('workspace_settings')
        .update(data)
        .eq('id', workspace.id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toast({
        title: "Settings saved",
        description: "Workspace settings have been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update workspace: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string, role: string }) => {
      if (!workspace?.id) throw new Error("No workspace found");
      
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
        
      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }
      
      let userId = existingUser?.id;
      
      if (!userId) {
        throw new Error("User not found. Please have them sign up first.");
      }
      
      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: userId,
          role,
        });
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast({
        title: "Member invited",
        description: "Invitation has been sent",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to invite member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      if (!workspace?.id) throw new Error("No workspace found");
      
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast({
        title: "Member removed",
        description: "User has been removed from workspace",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove member: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      if (!workspace?.id) throw new Error("No workspace found");
      
      const { error } = await supabase
        .from('workspace_members')
        .update({ role })
        .eq('workspace_id', workspace.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      toast({
        title: "Role updated",
        description: "Member role has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update role: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    workspace,
    members,
    isLoading,
    updateWorkspace: updateWorkspace.mutate,
    inviteMember: inviteMember.mutate,
    removeMember: removeMember.mutate,
    updateMemberRole: updateMemberRole.mutate,
    isUpdating: updateWorkspace.isPending,
  };
};

const useApiKeys = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKey, isLoading } = useQuery({
    queryKey: ['openai-api-key'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_configuration')
        .select('value')
        .eq('key', 'openai_api_key')
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return '';
        }
        throw error;
      }
      
      return data?.value || '';
    },
  });

  const updateApiKey = useMutation({
    mutationFn: async (apiKey: string) => {
      const { error } = await supabase
        .from('app_configuration')
        .upsert({
          key: 'openai_api_key',
          value: apiKey,
          is_secret: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['openai-api-key'] });
      toast({
        title: "API key saved",
        description: "Your OpenAI API key has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update API key: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    apiKey,
    isLoading,
    updateApiKey: updateApiKey.mutate,
    isUpdating: updateApiKey.isPending,
  };
};

function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const { inviteMember } = useWorkspace();
  
  const form = useForm<z.infer<typeof userInviteFormSchema>>({
    resolver: zodResolver(userInviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  function onSubmit(values: z.infer<typeof userInviteFormSchema>) {
    inviteMember({
      email: values.email,
      role: values.role
    });
    form.reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your workspace.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Admins can manage workspace settings and members.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Invite</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function ApiKeyForm() {
  const { apiKey, isLoading, updateApiKey, isUpdating } = useApiKeys();
  const [showApiKey, setShowApiKey] = useState(false);
  
  const form = useForm<z.infer<typeof apiKeysFormSchema>>({
    resolver: zodResolver(apiKeysFormSchema),
    defaultValues: {
      openai_api_key: "",
    },
    values: {
      openai_api_key: apiKey || "",
    },
  });

  function onSubmit(values: z.infer<typeof apiKeysFormSchema>) {
    updateApiKey(values.openai_api_key);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="openai_api_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OpenAI API Key</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Input 
                      type={showApiKey ? "text" : "password"} 
                      {...field} 
                      placeholder="sk-..." 
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Your OpenAI API key is required for AI functionality. It's stored securely and never shared.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isUpdating}>
          <Key className="mr-2 h-4 w-4" />
          Save API Key
        </Button>
      </form>
    </Form>
  );
}

export function SettingsPage() {
  const { workspace, members, isLoading, updateWorkspace, updateMemberRole, removeMember, isUpdating } = useWorkspace();
  
  const workspaceForm = useForm<z.infer<typeof workspaceFormSchema>>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: {
      name: workspace?.name || "",
      logo_url: workspace?.logo_url || "",
      default_assistant_id: workspace?.default_assistant_id || "",
      billing_tier: (workspace?.billing_tier as any) || "free",
    },
    values: {
      name: workspace?.name || "",
      logo_url: workspace?.logo_url || "",
      default_assistant_id: workspace?.default_assistant_id || "",
      billing_tier: (workspace?.billing_tier as any) || "free",
    },
  });

  function onSubmitWorkspaceForm(values: z.infer<typeof workspaceFormSchema>) {
    updateWorkspace(values);
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <h1 className="text-3xl font-bold text-forest-green mb-6">Settings</h1>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="workspace">
            <Briefcase className="h-4 w-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="contacts">
            <User className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="developer">
            <Settings className="h-4 w-4 mr-2" />
            Developer
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workspace">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                Manage workspace name, logo, and configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6">Loading...</div>
              ) : (
                <Form {...workspaceForm}>
                  <form onSubmit={workspaceForm.handleSubmit(onSubmitWorkspaceForm)} className="space-y-6">
                    <FormField
                      control={workspaceForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Workspace Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={workspaceForm.control}
                      name="logo_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter a URL for your workspace logo.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={workspaceForm.control}
                      name="default_assistant_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Assistant</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an assistant" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General Assistant</SelectItem>
                              <SelectItem value="sales">Sales Assistant</SelectItem>
                              <SelectItem value="support">Support Assistant</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the default assistant for workspace members.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={workspaceForm.control}
                      name="billing_tier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Tier</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select billing tier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="pro">Pro</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your current subscription plan.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={isUpdating}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage users and their permissions.
                </CardDescription>
              </div>
              <InviteMemberDialog />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.length === 0 ? (
                  <div className="text-center py-6 text-medium-gray">
                    No members found. Invite some team members to get started.
                  </div>
                ) : (
                  members.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback>{member.full_name?.charAt(0) || member.email.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.full_name || 'Unnamed User'}</div>
                          <div className="text-sm text-medium-gray">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={member.role === 'admin' ? 'default' : 'outline'}>
                          {member.role}
                        </Badge>
                        <Select 
                          defaultValue={member.role} 
                          onValueChange={(value) => updateMemberRole({ userId: member.user_id, role: value })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Are you sure you want to remove this user?')) {
                              removeMember(member.user_id);
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contacts Management</CardTitle>
              <CardDescription>
                Manage your company contacts and customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-6 text-center">
                <p className="text-medium-gray mb-4">
                  View and manage all your business contacts in one place.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <CardTitle>Developer Settings</CardTitle>
              <CardDescription>
                Manage API keys and integrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <p className="text-medium-gray mb-4">
                    Manage API keys for third-party integrations.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md">
                      <h4 className="font-semibold mb-4">OpenAI API Key</h4>
                      <ApiKeyForm />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <span className="font-medium">Salesforce Integration</span>
                        <span className="ml-2 text-xs bg-gray-100 text-gray-800 py-1 px-2 rounded">Not Connected</span>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium">Webhooks</h3>
                  <p className="text-medium-gray mb-4">
                    Set up webhooks to notify external services about events.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Webhook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
