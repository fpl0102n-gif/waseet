import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, ArrowRight, Package, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const OrderVerification = () => {
    const { toast } = useToast();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("+213");
    const [orders, setOrders] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'active') return ['new', 'processing', 'shipped'].includes(order.status);
        if (statusFilter === 'completed') return order.status === 'done';
        if (statusFilter === 'cancelled') return order.status === 'cancelled';
        return true;
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber.trim() || phoneNumber === "+213") {
            toast({
                title: t('verification_page.toast.phone_required'),
                description: t('verification_page.toast.phone_desc'),
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        setOrders([]);
        setHasSearched(true);

        try {
            const { data, error } = await supabase
                .from('orders')
                .select('id, status, total, product_url, name, created_at')
                .eq('contact_value', phoneNumber)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);

        } catch (error: any) {
            console.error("Error fetching orders:", error);
            toast({
                title: t('verification_page.toast.error_title'),
                description: t('verification_page.toast.error_desc'),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new': return t('tracking_page.status_labels.default');
            case 'processing': return t('tracking_page.status_labels.processing');
            case 'done': return t('tracking_page.status_labels.completed');
            case 'cancelled': return t('tracking_page.status_labels.rejected');
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 container py-6 sm:py-12 px-4">
                <div className="max-w-xl mx-auto space-y-6 sm:space-y-8">
                    <div className="text-center space-y-2">
                        <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary" />
                        <h1 className="text-2xl sm:text-3xl font-bold">{t('verification_page.title')}</h1>
                        <p className="text-muted-foreground">{t('verification_page.desc')}</p>
                    </div>

                    <Card>
                        <CardHeader className="px-4 sm:px-6">
                            <CardTitle className="text-lg">{t('verification_page.card_title')}</CardTitle>
                            <CardDescription>{t('verification_page.card_desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6">
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">{t('verification_page.phone_label')}</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="text"
                                        placeholder="+213..."
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (!val.startsWith("+213")) val = "+213";
                                            setPhoneNumber(val);
                                        }}
                                        required
                                    />
                                </div>

                                <Button type="submit" disabled={loading} className="w-full">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t('verification_page.btn_searching')}
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            {t('verification_page.btn_find')}
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {hasSearched && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="font-semibold text-lg px-1">{t('verification_page.results_count', { count: orders.length })}</h2>

                                {/* Status Filter */}
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'active', 'completed', 'cancelled'].map((filter) => (
                                        <Badge
                                            key={filter}
                                            variant={statusFilter === filter ? "default" : "outline"}
                                            className="cursor-pointer capitalize px-3 py-1.5"
                                            onClick={() => setStatusFilter(filter)}
                                        >
                                            {t(`verification_page.filters.${filter}` as any)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {filteredOrders.length === 0 ? (
                                <Card className="bg-muted/50 border-dashed">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        {t('verification_page.no_orders', { filter: statusFilter !== 'all' ? t(`verification_page.filters.${statusFilter}` as any) : '' })}
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredOrders.map((order) => {
                                        let productName = order.name;
                                        // ... logic to determine name
                                        if (order.product_url && order.product_url.startsWith('http')) {
                                            productName = t('tracking_page.custom_request_title');
                                        } else if (order.product_url) {
                                            productName = order.product_url;
                                        }

                                        return (
                                            <div key={order.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono text-xs text-muted-foreground mb-1">#{order.id}</span>
                                                        <h3 className="font-semibold text-gray-900 line-clamp-1">{productName}</h3>
                                                    </div>
                                                    <Badge variant={order.status === 'done' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'secondary'}>
                                                        {getStatusLabel(order.status)}
                                                    </Badge>
                                                </div>

                                                <div className="flex justify-between items-end mt-4">
                                                    <div className="flex flex-col text-sm">
                                                        <span className="text-muted-foreground">{t('admin_orders.table.total')}</span>
                                                        <span className="font-bold">{order.total} DZD</span>
                                                    </div>
                                                    <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate(`/track?id=${order.id}`)}>
                                                        {t('admin_orders.viewDetails')} <ArrowRight className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderVerification;
