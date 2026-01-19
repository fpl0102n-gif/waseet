import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { StatCard } from '@/components/ui/stat-card';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Eye, Search, Settings, Gift, ShoppingBag, Filter } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Order = Database['public']['Tables']['orders']['Row'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filterType, setFilterType] = useState<'all' | 'store' | 'custom'>('all');

  useEffect(() => {
    checkAuth();
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, filterType]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "Admin privileges required",
        variant: "destructive",
      });
      navigate('/admin');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Fetch orders error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by Status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by Type (Store vs Custom)
    if (filterType !== 'all') {
      filtered = filtered.filter(order => {
        // Try to parse order_type from JSON notes first
        try {
          if (order.notes && order.notes.startsWith('{')) {
            const notesJson = JSON.parse(order.notes);
            if (notesJson.order_type) {
              return notesJson.order_type === filterType;
            }
          }
        } catch (e) {
          // Ignore parse errors, fall back to legacy check
        }

        // Fallback: Legacy check using product_url
        const isCustom = order.product_url && (order.product_url.startsWith('http') || order.product_url.startsWith('https'));
        // If filter is 'custom', return true if isCustom.
        // If filter is 'store', return true if NOT isCustom.
        // Note: My previous logic mapped 'store' type to 'store' filter and 'order' type to 'custom' filter.
        // Let's assume filterType values are 'store' and 'custom'.
        // Legacy: 'custom' means isCustom=true. 'store' means isCustom=false.
        return filterType === 'custom' ? isCustom : !isCustom;
      });
    }

    // Filter by Search Term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.contact_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.product_url && order.product_url.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredOrders(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      new: "default",
      processing: "secondary",
      done: "outline",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="app-shell py-12">
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-brand-gradient">Admin Dashboard</h1>
              <p className="text-sm text-foreground/65">Manage all customer orders</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => navigate('/admin/exchange')}>Exchange</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/exchange-rates')}>Rates</Button>
              <Button size="sm" variant="outline" asChild><Link to="/admin/agent-registrations">Agents</Link></Button>
              <Button size="sm" variant="outline" asChild><Link to="/admin/import-requests">Imports</Link></Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/alkhayr')} className="border-red-500 text-red-600 hover:bg-red-50">Al-Khayr</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/blood')} className="border-red-500 text-red-600 hover:bg-red-50">Blood</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/store')}><ShoppingBag className="mr-2 h-4 w-4" />Store</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/referrals')}><Gift className="mr-2 h-4 w-4" />Referrals</Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/settings')}><Settings className="mr-2 h-4 w-4" />Settings</Button>
              <Button size="sm" variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Logout</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              value={orders.length.toString()}
              label="Total Orders"
              description="All time orders"
              accent="primary"
            />
            <StatCard
              value={orders.filter(o => o.status === 'new').length.toString()}
              label="New Orders"
              description="Currently new"
              accent="accent"
            />
            <StatCard
              value={orders.filter(o => o.status === 'processing').length.toString()}
              label="Processing"
              description="In progress"
              accent="warning"
            />
            <StatCard
              value={orders.filter(o => o.status === 'done').length.toString()}
              label="Completed"
              description="Finished successfully"
              accent="success"
            />
          </div>
        </div>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-sm font-semibold tracking-wide">Orders</CardTitle>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-8 w-full sm:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Type Filter */}
                <div className="w-full sm:w-[150px]">
                  <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="w-3 h-3 text-muted-foreground" />
                        <SelectValue placeholder="All types" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="store">Store Orders</SelectItem>
                      <SelectItem value="custom">Custom Requests</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs w-[60px]">ID</TableHead>
                    <TableHead className="text-xs w-[100px]">Type</TableHead>
                    <TableHead className="text-xs">Product</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-xs text-muted-foreground py-8">No orders found</TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const isCustom = order.product_url && (order.product_url.startsWith('http') || order.product_url.startsWith('https'));
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                          <TableCell className="text-xs">
                            {isCustom
                              ? <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">Custom</Badge>
                              : <Badge variant="outline" className="px-1.5 py-0 text-[10px]">Store</Badge>
                            }
                          </TableCell>
                          <TableCell className="font-medium text-xs max-w-[150px] truncate" title={order.product_url || order.notes}>
                            {isCustom ? 'External Link' : (order.product_url || 'View Details')}
                          </TableCell>
                          <TableCell className="font-medium text-xs">{order.name}</TableCell>
                          <TableCell className="text-xs">{order.contact_type === 'whatsapp' ? '📱' : '✈️'} {order.contact_value}</TableCell>
                          <TableCell className="font-semibold text-xs">{order.total} DZD</TableCell>
                          <TableCell className="text-xs">{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
