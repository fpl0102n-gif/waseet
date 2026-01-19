import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, UserCog, Shield, CheckCircle2, XCircle } from "lucide-react";

export default function AdminUsers() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Use secure RPC to get full user details including auth status
            const { data, error } = await supabase.rpc('get_admin_users_full');

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error("Error fetching users:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to fetch users.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.user_id?.toLowerCase().includes(search.toLowerCase()) ||
            user.email?.toLowerCase().includes(search.toLowerCase()) ||
            user.first_name?.toLowerCase().includes(search.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(search.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const updateUserRole = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .update({ role: newRole })
                .eq('user_id', userId);

            if (error) throw error;

            toast({ title: "Success", description: "User role updated" });
            fetchUsers();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
        }
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('user_roles')
                .update({ is_active: !currentStatus })
                .eq('user_id', userId);

            if (error) throw error;

            toast({ title: "Success", description: `User ${!currentStatus ? 'activated' : 'disabled'}` });
            fetchUsers();
        } catch (error) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const confirmEmail = async (userId: string) => {
        try {
            const { error } = await supabase.rpc('admin_confirm_user_email', { target_user_id: userId });

            if (error) throw error;

            toast({ title: "Success", description: "Email manually confirmed" });
            fetchUsers();
        } catch (error) {
            toast({ title: "Error", description: "Failed to confirm email", variant: "destructive" });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Users & Admins</h1>
                        <p className="text-muted-foreground">Manage platform users and their roles.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID or Email..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                    <SelectItem value="humanitarian_admin">Humanitarian Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User ID</TableHead>
                                        <TableHead>Email / Name</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Verified</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow key={user.user_id}>
                                                <TableCell className="font-mono text-xs text-muted-foreground w-[100px] truncate" title={user.user_id}>{user.user_id.substring(0, 8)}...</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}` : 'Unknown'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{user.email || 'No Email'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'super_admin' ? 'default' : user.role === 'humanitarian_admin' ? 'outline' : 'secondary'}>
                                                        {user.role === 'super_admin' ? 'Super Admin' : user.role === 'humanitarian_admin' ? 'Humanitarian' : user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.email_confirmed_at ? (
                                                        <div className="flex items-center text-green-600 text-xs font-medium">
                                                            <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center text-yellow-600 text-xs font-medium">
                                                                <XCircle className="h-4 w-4 mr-1" /> Pending
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2"
                                                                onClick={() => confirmEmail(user.user_id)}
                                                            >
                                                                Confirm
                                                            </Button>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium cursor-pointer select-none ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                        onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                                                    >
                                                        {user.is_active ? 'Active' : 'Disabled'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Select
                                                        defaultValue={user.role}
                                                        onValueChange={(val) => updateUserRole(user.user_id, val)}
                                                    >
                                                        <SelectTrigger className="w-[110px] h-8 ml-auto">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                                            <SelectItem value="humanitarian_admin">Humanitarian Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
