import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { StatCard } from '@/components/ui/stat-card';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, DollarSign, Gift, MessageSquare, ShoppingCart, TrendingUp, Shield, Zap } from "lucide-react";
import Section from '@/components/ui/section';
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";

const Order = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(135);
  const [formData, setFormData] = useState({
    productName: "",
    productUrl: "",
    price: "",
    shippingPrice: "",
    referralCode: "",
    notes: "",
  });

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) return;

      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "exchange_rate_usd_to_dzd")
        .single();

      if (error) throw error;
      if (data) {
        setExchangeRate(parseFloat(data.value));
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  const calculateTotal = () => {
    const price = parseFloat(formData.price) || 0;
    const shipping = parseFloat(formData.shippingPrice) || 0;
    return (price + shipping).toFixed(2);
  };

  const calculateTotalDZD = () => {
    const totalUSD = parseFloat(calculateTotal());
    return (totalUSD * exchangeRate).toFixed(2);
  };

  const validateForm = () => {
    if (!formData.productUrl.trim()) {
      toast({ title: t('order.validation.error'), description: t('order.validation.url_required'), variant: "destructive" });
      return false;
    }

    /* URL validation removed as per request - allows text input
    if (!formData.productUrl.startsWith('http://') && !formData.productUrl.startsWith('https://')) {
      toast({ title: t('order.validation.error'), description: t('order.validation.url_invalid'), variant: "destructive" });
      return false;
    }
    */

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({ title: t('order.validation.error'), description: t('order.validation.price_required'), variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const priceUSD = parseFloat(formData.price);
      const shippingUSD = parseFloat(formData.shippingPrice || "0");

      // Convert to DZD
      const priceDZD = parseFloat((priceUSD * exchangeRate).toFixed(2));
      const shippingDZD = parseFloat((shippingUSD * exchangeRate).toFixed(2));

      // Create a unique ID for the cart item (using timestamp)
      const cartItem = {
        id: Date.now(),
        name: formData.productName, // Use user provided name
        price: priceDZD, // Store Price in DZD
        quantity: 1,
        slug: `custom-order-${Date.now()}`,
        // Custom fields
        productUrl: formData.productUrl,
        shippingPrice: shippingDZD, // Store Shipping in DZD
        notes: formData.notes,
        referralCode: formData.referralCode
      };

      addItem(cartItem);

      // Reset form
      setFormData({
        productName: "",
        productUrl: "",
        price: "",
        shippingPrice: "",
        referralCode: "",
        notes: "",
      });

      toast({
        title: t('order.toast.added'),
        description: t('order.toast.added_desc')
      });

    } catch (error: any) {
      console.error('Added to cart error:', error);
      toast({
        title: t('order.error.title'),
        description: t('order.error.generic'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Section
        title={t('order.header.title')}
        subtitle={t('order.header.subtitle')}
        padding="md"
        id="order"
      >
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Left - Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Info */}
              <Card className="border border-border/60 shadow-sm bg-card">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t('order.product.title')}</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productName" className="text-sm font-medium">{t('order.product.name')}</Label>
                    <Input
                      id="productName"
                      type="text"
                      placeholder={t('order.product.name_ph')}
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productUrl" className="text-sm font-medium">{t('order.product.url')}</Label>
                    <Input
                      id="productUrl"
                      type="text"
                      placeholder={t('order.product.url_ph')}
                      value={formData.productUrl}
                      onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                      className="h-11"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        {t('order.product.price')}
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingPrice" className="text-sm font-medium">{t('order.product.shipping')}</Label>
                      <Input
                        id="shippingPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.shippingPrice}
                        onChange={(e) => setFormData({ ...formData, shippingPrice: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Optional */}
              <Card className="border border-border/60 shadow-sm bg-card">
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="referralCode" className="text-sm font-medium flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-accent" />
                      {t('order.optional.referral')}
                    </Label>
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder={t('order.optional.referral_ph')}
                      value={formData.referralCode}
                      onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                      maxLength={8}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      {t('order.optional.notes')}
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder={t('order.optional.notes_ph')}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>



              {/* Submit Mobile */}
              <div className="block lg:hidden pt-4 pb-20">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold shadow-lg"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      {t('order.actions.processing')}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center justify-center leading-none">
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          {t('order.actions.add_to_cart')}
                        </span>
                        <span className="text-xs font-normal opacity-80 mt-1">
                          Total: {calculateTotalDZD()} DA
                        </span>
                      </div>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6 space-y-4">
              {/* Total Card */}
              <Card className="border border-border/60 shadow-sm bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">{t('order.summary.title')}</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <StatCard
                      value={`$${formData.price || '0.00'}`}
                      label={t('order.summary.product')}
                      description={t('order.product.title')}
                      accent="accent"
                    />
                    <StatCard
                      value={`$${formData.shippingPrice || '0.00'}`}
                      label={t('order.summary.shipping')}
                      description={t('order.product.shipping')}
                      accent="secondary"
                    />

                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <StatCard
                      value={`$${calculateTotal()}`}
                      label={t('order.summary.total')}
                      description={t('order.summary.usd_total')}
                      accent="primary"
                    />
                    <StatCard
                      value={`${calculateTotalDZD()} DA`}
                      label={t('order.summary.dzd')}
                      description={t('order.summary.total')}
                      accent="warning"
                    />
                  </div>

                  <div className="hidden lg:block">
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      className="w-full h-12 text-base font-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('order.actions.processing')}
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          {t('order.actions.add_to_cart')}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="border border-border/60 shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t('order.benefits.secure_title')}</p>
                      <p className="text-xs text-muted-foreground">{t('order.benefits.secure_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t('order.benefits.fast_title')}</p>
                      <p className="text-xs text-muted-foreground">{t('order.benefits.fast_desc')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-secondary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{t('order.benefits.track_title')}</p>
                      <p className="text-xs text-muted-foreground">{t('order.benefits.track_desc')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Section >
    </AppLayout >
  );
};

export default Order;
