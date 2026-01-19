
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, Search, Filter } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Order = Database['public']['Tables']['orders']['Row'];

const AdminOrders = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [filterType, setFilterType] = useState<'all' | 'store' | 'custom'>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter, filterType]);

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

        if (statusFilter !== "all") {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        if (filterType !== 'all') {
            filtered = filtered.filter(order => {
                try {
                    if (order.notes && order.notes.startsWith('{')) {
                        const notesJson = JSON.parse(order.notes);
                        if (notesJson.order_type) {
                            return notesJson.order_type === filterType;
                        }
                    }
                } catch (e) { }

                const isCustom = order.product_url && (order.product_url.startsWith('http') || order.product_url.startsWith('https'));
                return filterType === 'custom' ? isCustom : !isCustom;
            });
        }

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

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            new: "default",
            processing: "secondary",
            done: "outline",
            cancelled: "destructive",
        };
        // Normalize status display to capitalized english via keys if needed, 
        // but for now displaying translation of status value
        const statusKey = `admin_orders.status.${status}`;
        return <Badge variant={variants[status] || "default"}>{t(statusKey, { defaultValue: status })}</Badge>;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('admin_orders.title')}</h1>
                    <p className="text-gray-500">{t('admin_orders.subtitle')}</p>
                </div>

                <Card className="border border-border/60 shadow-sm">
                    <CardHeader>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <CardTitle className="text-sm font-semibold tracking-wide">{t('admin_orders.listTitle')}</CardTitle>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('admin_orders.searchPlaceholder')}
                                        className="pl-8 w-full sm:w-[200px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="w-full sm:w-[150px]">
                                    <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                                        <SelectTrigger>
                                            <div className="flex items-center gap-2">
                                                <Filter className="w-3 h-3 text-muted-foreground" />
                                                <SelectValue placeholder={t('admin_orders.filterType.all')} />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('admin_orders.filterType.all')}</SelectItem>
                                            <SelectItem value="store">{t('admin_orders.filterType.store')}</SelectItem>
                                            <SelectItem value="custom">{t('admin_orders.filterType.custom')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[140px]">
                                        <SelectValue placeholder={t('admin_orders.status.all')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('admin_orders.status.all')}</SelectItem>
                                        <SelectItem value="new">{t('admin_orders.status.new')}</SelectItem>
                                        <SelectItem value="processing">{t('admin_orders.status.processing')}</SelectItem>
                                        <SelectItem value="done">{t('admin_orders.status.done')}</SelectItem>
                                        <SelectItem value="cancelled">{t('admin_orders.status.cancelled')}</SelectItem>
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
                                        <TableHead className="text-xs w-[60px]">{t('admin_orders.table.id')}</TableHead>
                                        <TableHead className="text-xs w-[100px]">{t('admin_orders.table.type')}</TableHead>
                                        <TableHead className="text-xs">{t('admin_orders.table.product')}</TableHead>
                                        <TableHead className="text-xs">{t('admin_orders.table.customer')}</TableHead>
                                        <TableHead className="text-xs">{t('admin_orders.table.contact')}</TableHead>
                                        <TableHead className="text-xs">{t('admin_orders.table.total')}</TableHead>
                                        <TableHead className="text-xs">{t('admin_orders.table.status')}</TableHead>
                                        <TableHead className="text-xs">{t('admin_orders.table.date')}</TableHead>
                                        <TableHead className="text-right text-xs">{t('admin_orders.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center text-xs text-muted-foreground py-8">{t('admin_orders.noOrders')}</TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredOrders.map((order) => {
                                            const isCustom = order.product_url && (order.product_url.startsWith('http') || order.product_url.startsWith('https'));
                                            return (
                                                <TableRow
                                                    key={order.id}
                                                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                >
                                                    <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                                                    <TableCell className="text-xs">
                                                        {isCustom
                                                            ? <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">{t('admin_orders.badges.custom')}</Badge>
                                                            : <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{t('admin_orders.badges.store')}</Badge>
                                                        }
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs max-w-[150px] truncate" title={order.product_url || order.notes || ''}>
                                                        {isCustom ? t('admin_orders.externalLink') : (order.product_url || t('admin_orders.viewDetails'))}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-xs">{order.name}</TableCell>
                                                    <TableCell className="text-xs">{order.contact_type === 'whatsapp' ? '📱' : '✈️'} {order.contact_value}</TableCell>
                                                    <TableCell className="font-semibold text-xs">{order.total} DZD</TableCell>
                                                    <TableCell className="text-xs">{getStatusBadge(order.status)}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            to={`/admin/orders/${order.id}`}
                                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 relative z-50"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
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
        </AdminLayout>
    );
};

export default AdminOrders;
