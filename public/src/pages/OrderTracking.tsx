import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Truck, CheckCircle2, XCircle, MessageSquare, Package, ExternalLink, ArrowRight, ShoppingBag, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const OrderTracking = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("id") || "");
  const [singleOrder, setSingleOrder] = useState<any>(null);
  const [orderList, setOrderList] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  // Auto-search if ID is in URL
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setSearchQuery(idParam);
      performSearch(idParam);
    }
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'processing': return { label: t('tracking_page.status_labels.processing', 'On the way'), color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Truck className="w-4 h-4" /> };
      case 'done': return { label: t('tracking_page.status_labels.completed', 'Completed'), color: "text-green-600 bg-green-50 border-green-200", icon: <CheckCircle2 className="w-4 h-4" /> };
      case 'cancelled': return { label: t('tracking_page.status_labels.rejected', 'Rejected'), color: "text-red-600 bg-red-50 border-red-200", icon: <XCircle className="w-4 h-4" /> };
      case 'new':
      default: return { label: t('tracking_page.status_labels.default', 'Processing'), color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Loader2 className="w-4 h-4" /> };
    }
  };

  const detectInputType = (input: string): 'id' | 'phone' | 'invalid' => {
    const clean = input.replace(/[\s-]/g, '');
    // Phone regex for Algeria: starts with 05, 06, 07 or +213...
    // Broadened to allow typical user inputs
    const phoneRegex = /^(\+213|00213|0)(5|6|7)[0-9]{8}$/;

    // Order ID is typically numeric. 
    // Conflict: An ID could theoretically look like a phone, but IDs are usually smaller numbers (serial).
    // If it matches phone regex, prioritize Phone.

    if (phoneRegex.test(clean)) return 'phone';
    if (/^\d+$/.test(clean)) return 'id';

    return 'invalid';
  };

  const normalizePhone = (input: string) => {
    let clean = input.replace(/[\s-]/g, '');
    if (clean.startsWith('00213')) clean = '+' + clean.substring(2);
    else if (clean.startsWith('0')) clean = '+213' + clean.substring(1);
    else if (!clean.startsWith('+')) clean = '+213' + clean; // Fallback assumption
    return clean;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      toast({ title: t('tracking_page.validation.inputRequired.title'), description: t('tracking_page.validation.inputRequired.desc'), variant: "destructive" });
      return;
    }

    setLoading(true);
    setSingleOrder(null);
    setOrderList([]);
    setSearched(true);

    const type = detectInputType(query);

    try {
      if (type === 'phone') {
        const phone = normalizePhone(query);
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, total, product_url, name, created_at, notes, price, contact_value')
          .eq('contact_value', phone)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Parse metadata for all orders
        const processed = (data || []).map(processOrderData);
        setOrderList(processed);

      } else if (type === 'id') {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, total, product_url, name, created_at, notes, price')
          .eq('id', parseInt(query))
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setSingleOrder(processOrderData(data));
        }
      } else {
        // Fallback: Try ID search if invalid but numeric-ish, otherwise show error
        toast({ title: t('tracking_page.validation.invalidFormat.title'), description: t('tracking_page.validation.invalidFormat.desc'), variant: "destructive" });
      }

    } catch (error: any) {
      console.error("Search error:", error);
      toast({ title: "Error", description: "Storage connection failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const processOrderData = (data: any) => {
    let publicNote = "";
    let itemsMetadata: any[] = [];
    let isCustom = false;

    if (data.notes) {
      try {
        if (data.notes.startsWith('{') || data.notes.startsWith('[')) {
          const parsed = JSON.parse(data.notes);
          publicNote = parsed.public || "";
          itemsMetadata = parsed.items_metadata || [];
          if (parsed.order_type === 'custom') isCustom = true;
        }
      } catch (_) { }
    }

    // Determine legacy custom status if not in JSON
    if (data.product_url && (data.product_url.startsWith('http') || data.product_url.startsWith('https'))) {
      isCustom = true;
    }

    return { ...data, publicNote, itemsMetadata, isCustom };
  };

  const SingleOrderView = ({ order }: { order: any }) => {
    const { label, color, icon } = getStatusConfig(order.status);
    return (
      <div className="bg-card p-6 rounded-lg border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b pb-4">
          <div>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{t('tracking_page.order_prefix')}{order.id}</span>

            {/* Item List Display */}
            <div className="mt-4 space-y-2">
              {order.itemsMetadata && order.itemsMetadata.length > 0 ? (
                order.itemsMetadata.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    {item.slug ? (
                      <Link to={`/store/product/${item.slug}`} className="font-semibold text-lg text-primary hover:underline flex items-center gap-1">
                        {item.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    ) : item.product_url ? (
                      <a href={item.product_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg text-primary hover:underline flex items-center gap-1">
                        {item.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="font-semibold text-lg text-foreground">{item.name}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="font-semibold text-lg text-foreground break-all">
                  {order.isCustom ? (
                    <a href={order.product_url} target="_blank" className="flex items-center gap-1 hover:underline text-primary">
                      {t('admin_orders.externalLink')} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    order.product_url || order.name
                  )}
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-2">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <Badge variant="outline" className={`${color} flex items-center gap-1.5 px-3 py-1 text-sm h-fit whitespace-nowrap`}>
            {icon}
            {label}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="bg-secondary/20 p-4 rounded-md flex justify-between items-center">
            <span className="text-sm font-medium">{t('admin_orders.table.total')}</span>
            <span className="font-bold font-mono text-lg">{order.total} DZD</span>
          </div>

          {order.publicNote && (
            <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400 font-medium text-xs uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                Note from Team
              </div>
              <p className="text-blue-900/80 dark:text-blue-200 leading-relaxed text-sm">{order.publicNote}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const OrderListItem = ({ order }: { order: any }) => {
    const { label, color } = getStatusConfig(order.status);
    return (
      <div className="group bg-card hover:bg-muted/30 p-5 rounded-xl border transition-all cursor-pointer" onClick={() => setSingleOrder(order)}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">#{order.id}</span>
            <Badge variant="secondary" className="text-[10px] h-5">
              {order.isCustom ? t('admin_orders.badges.custom') : t('admin_orders.badges.store')}
            </Badge>
          </div>
          <Badge variant="outline" className={`${color} text-[10px] px-2 py-0.5`}>
            {label}
          </Badge>
        </div>

        <div className="font-medium text-foreground mb-1 line-clamp-1">
          {order.itemsMetadata?.[0]?.name || (order.isCustom ? t('tracking_page.custom_request_title') : order.name)}
          {order.itemsMetadata?.length > 1 && ` ${t('tracking_page.more_items', { count: order.itemsMetadata.length - 1 })}`}
        </div>

        <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t">
          <span className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
          <div className="flex items-center gap-1 text-primary font-medium">
            {t('admin_orders.viewDetails')} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container max-w-3xl py-12 px-4">

        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{t('tracking_page.header.title')}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('tracking_page.header.desc')}
          </p>
        </div>

        {/* Search Input */}
        <Card className="border shadow-md mb-10 overflow-hidden">
          <CardContent className="p-1">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 p-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-12 border-0 shadow-none focus-visible:ring-0 bg-transparent text-lg"
                  placeholder={t('tracking_page.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8 shrink-0" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('tracking_page.search.btn')}
              </Button>
            </form>
          </CardContent>
          <div className="bg-muted/50 px-4 py-2 border-t text-xs text-muted-foreground text-center">
            {t('tracking_page.search.tip')}
          </div>
        </Card>

        {/* Results Area */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary/30 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">

            {singleOrder && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-4">
                  {orderList.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setSingleOrder(null)} className="h-8 -ml-2 text-muted-foreground hover:text-foreground">
                      {t('tracking_page.results.back')}
                    </Button>
                  )}
                  <h2 className="text-lg font-semibold">{t('tracking_page.results.details')}</h2>
                </div>
                <SingleOrderView order={singleOrder} />
              </div>
            )}

            {!singleOrder && orderList.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-semibold mb-4">{t('tracking_page.results.found', { count: orderList.length })}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {orderList.map(order => (
                    <OrderListItem key={order.id} order={order} />
                  ))}
                </div>
              </div>
            )}

            {searched && !singleOrder && orderList.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed rounded-xl">
                <div className="bg-muted inline-flex p-3 rounded-full mb-4">
                  <AlertCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">{t('tracking_page.results.noOrders.title')}</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {t('tracking_page.results.noOrders.desc', { query: searchQuery })}
                </p>
              </div>
            )}

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;
