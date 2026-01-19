// @ts-nocheck
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info, Phone, MessageCircle, Send, ArrowRight, ShieldCheck } from 'lucide-react';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface Wilaya {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
}

interface PaymentMethod {
  id: number;
  name: string;
}

interface ExchangeFormData {
  request_type: 'buy';
  currency_from_id: string;
  currency_to_id: string;
  amount: number | null;
  total_price: number;
  payment_method_from_id: string;
  payment_method_to_id: string;
  wilaya_id: string;
  needed_by: string;
  email: string;
  phone_number: string;
  whatsapp: string;
  telegram: string;
  notes: string;
  terms_accepted: boolean;
}

export default function ExchangePage() {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Data State
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Form State
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [requestId, setRequestId] = useState<string | number | null>(null);
  const [currentRate, setCurrentRate] = useState<number>(0);

  const [availableMethodsFrom, setAvailableMethodsFrom] = useState<PaymentMethod[]>([]);
  const [availableMethodsTo, setAvailableMethodsTo] = useState<PaymentMethod[]>([]);

  const [formData, setFormData] = useState<ExchangeFormData>({
    request_type: 'buy',
    currency_from_id: '',
    currency_to_id: '',
    amount: null,
    total_price: 0,
    payment_method_from_id: '',
    payment_method_to_id: '',
    wilaya_id: '',
    needed_by: '',
    email: '',
    phone_number: '',
    whatsapp: '',
    telegram: '',
    notes: '',
    terms_accepted: false,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.currency_from_id) {
      fetchAllowedMethods(formData.currency_from_id, 'from');
    }
  }, [formData.currency_from_id]);

  useEffect(() => {
    if (formData.currency_to_id) {
      fetchAllowedMethods(formData.currency_to_id, 'to');
    }
  }, [formData.currency_to_id]);
  const fetchInitialData = async () => {
    try {
      const { data: currData } = await supabase.from('currencies').select('*').eq('is_active', true);
      if (currData) setCurrencies(currData);

      const { data: wilayaData } = await supabase.from('wilayas').select('*').eq('active', true).order('id');
      if (wilayaData) setWilayas(wilayaData);

      const { data: pmData } = await supabase.from('payment_methods').select('*').eq('is_active', true);
      if (pmData) setPaymentMethods(pmData);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchAllowedMethods = async (currencyId: string, type: 'from' | 'to') => {
    const { data } = await supabase
      .from('currency_payment_methods')
      .select(`
            payment_method_id,
            payment_methods (id, name)
        `)
      .eq('currency_id', currencyId);

    if (data) {
      const methods = data.map((d: any) => d.payment_methods).filter(Boolean);
      if (type === 'from') setAvailableMethodsFrom(methods);
      else setAvailableMethodsTo(methods);
    }
  };

  const calculateEstimate = async (fromId: string, toId: string) => {
    if (!fromId || !toId) return;

    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('buy_rate')
        .eq('currency_from_id', parseInt(fromId))
        .eq('currency_to_id', parseInt(toId))
        .maybeSingle();

      if (error) {
        console.error('Error fetching rate:', error);
        return;
      }

      const rate = data ? data.buy_rate : 0;
      setCurrentRate(rate);

      if (formData.amount) {
        setFormData(prev => ({ ...prev, total_price: prev.amount! * rate }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.terms_accepted) {
      toast({ title: 'Error', description: t('exchange.validation.terms'), variant: 'destructive' });
      return;
    }
    if (!formData.currency_from_id || !formData.currency_to_id || !formData.wilaya_id) {
      toast({ title: 'Error', description: t('exchange.validation.required'), variant: 'destructive' });
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast({ title: 'Error', description: t('exchange.validation.amount'), variant: 'destructive' });
      return;
    }
    if (!formData.needed_by) {
      toast({ title: 'Error', description: t('exchange.validation.date'), variant: 'destructive' });
      return;
    }
    if (!formData.email) {
      toast({ title: 'Error', description: t('exchange.validation.email'), variant: 'destructive' });
      return;
    }
    if (!formData.phone_number) {
      toast({ title: 'Error', description: t('exchange.validation.phone'), variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();

      const payload = {
        user_id: session.session?.user?.id,
        request_type: formData.request_type,
        currency_from_id: parseInt(formData.currency_from_id),
        currency_to_id: parseInt(formData.currency_to_id),
        wilaya_id: parseInt(formData.wilaya_id),
        payment_method_from_id: formData.payment_method_from_id ? parseInt(formData.payment_method_from_id) : null,
        payment_method_to_id: formData.payment_method_to_id ? parseInt(formData.payment_method_to_id) : null,
        amount: formData.amount,
        rate: currentRate,
        total_price: formData.total_price,
        needed_by: new Date(formData.needed_by).toISOString(),
        email: formData.email,
        phone_number: formData.phone_number,
        whatsapp: formData.whatsapp,
        telegram: formData.telegram,
        notes: formData.notes,
        status: 'pending'
      };

      const { data, error } = await supabase.from('exchange_requests').insert(payload).select().single();

      if (error) throw error;
      setRequestId(data.id);

      // Direct Email Invocation
      console.log('Invoking Email for Exchange Request', data.id);
      supabase.functions.invoke('send-email', {
        body: {
          type: 'exchange_request',
          record: data
        }
      }).then(({ data: emailData, error: emailError }) => {
        if (emailError) console.error("Exchange Email Error:", emailError);
        else console.log("Exchange Email Success:", emailData);
      });

      setShowSuccess(true);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: t('exchange.validation.submit_error'), variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-primary/5 to-background min-h-screen py-10 md:py-16">
        <div className="container max-w-6xl mx-auto px-4 space-y-12">

          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-brand-gradient">{t('exchange.title')}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('exchange.subtitle')}
            </p>
          </div>

          <Card className="overflow-hidden border border-border/60 shadow-lg bg-card/95 backdrop-blur-sm">
            <div className="p-6 md:p-10 space-y-10">

              {/* Main Exchange Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">

                {/* Desktop Divider Line */}
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border/60 -ml-px" />

                {/* Left Column: Source */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{t('exchange.have.step')}</div>
                    <h3 className="text-xl font-semibold">{t('exchange.have.title')}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('exchange.have.currency')}</Label>
                      <Select
                        value={formData.currency_from_id}
                        onValueChange={(v) => {
                          setFormData({ ...formData, currency_from_id: v });
                          calculateEstimate(v, formData.currency_to_id);
                        }}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={t('exchange.form.placeholder.select_currency')} />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.code} - {c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('exchange.have.payment')}</Label>
                      <Select
                        value={formData.payment_method_from_id}
                        onValueChange={v => setFormData({ ...formData, payment_method_from_id: v })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={availableMethodsFrom.length ? t('exchange.form.placeholder.select_method') : t('exchange.form.placeholder.any_method')} />
                        </SelectTrigger>
                        <SelectContent>
                          {(availableMethodsFrom.length > 0 ? availableMethodsFrom : paymentMethods).map(m => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('exchange.have.amount')}</Label>
                      <Input
                        type="number"
                        className="h-11 text-lg font-medium"
                        placeholder="0.00"
                        value={formData.amount || ''}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setFormData({ ...formData, amount: val, total_price: val * currentRate });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Target */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{t('exchange.want.step')}</div>
                    <h3 className="text-xl font-semibold">{t('exchange.want.title')}</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('exchange.want.currency')}</Label>
                      <Select
                        value={formData.currency_to_id}
                        onValueChange={(v) => {
                          setFormData({ ...formData, currency_to_id: v });
                          calculateEstimate(formData.currency_from_id, v);
                        }}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={t('exchange.form.placeholder.select_currency')} />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.code} - {c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('exchange.want.payment')}</Label>
                      <Select
                        value={formData.payment_method_to_id}
                        onValueChange={v => setFormData({ ...formData, payment_method_to_id: v })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={availableMethodsTo.length ? t('exchange.form.placeholder.select_method') : t('exchange.form.placeholder.any_method')} />
                        </SelectTrigger>
                        <SelectContent>
                          {(availableMethodsTo.length > 0 ? availableMethodsTo : paymentMethods).map(m => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('exchange.want.total')}</Label>
                      <div className="h-11 flex items-center px-3 bg-muted/40 rounded-md border border-input text-lg font-bold tabular-nums text-foreground/80">
                        {formData.total_price > 0 ? formData.total_price.toFixed(2) : '--'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border my-8" />

              {/* Location & Time Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t('exchange.location.wilaya')}</Label>
                  <Select value={formData.wilaya_id} onValueChange={v => setFormData({ ...formData, wilaya_id: v })}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={t('exchange.form.placeholder.select_wilaya')} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {wilayas.map(w => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.code} - {w.name_ar} ({w.name_en})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('exchange.location.neededBy')}</Label>
                  <Input
                    type="date"
                    className="h-11"
                    value={formData.needed_by}
                    onChange={e => setFormData({ ...formData, needed_by: e.target.value })}
                  />
                </div>
              </div>

              {/* Private Contact Details Section */}
              <div className="bg-[#f8fafc] dark:bg-muted/20 border border-slate-200 dark:border-border rounded-xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-primary" />
                  <h3 className="font-semibold text-foreground">{t('exchange.private.title')} <span className="text-xs font-normal text-muted-foreground ml-1">{t('exchange.private.subtitle')}</span></h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {t('exchange.private.email')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      className="bg-background h-11"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {t('exchange.private.phone')} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      className="bg-background h-11"
                      placeholder="e.g. 0550123456"
                      value={formData.phone_number}
                      onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" /> {t('exchange.private.whatsapp')}
                    </Label>
                    <Input
                      className="bg-background h-11"
                      placeholder="WhatsApp Number"
                      value={formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Send className="h-4 w-4" /> {t('exchange.private.telegram')}
                    </Label>
                    <Input
                      className="bg-background h-11"
                      placeholder="@username or Number"
                      value={formData.telegram}
                      onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Submit */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.terms_accepted}
                    onCheckedChange={(c) => setFormData({ ...formData, terms_accepted: c as boolean })}
                  />
                  <Label htmlFor="terms" className="font-normal text-sm text-muted-foreground leading-snug">
                    {t('exchange.form.terms_label')}
                  </Label>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    className="w-full md:max-w-xs h-12 text-base font-semibold shadow-md active:scale-95 transition-all"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                    {submitting ? t('exchange.form.submitting') : t('exchange.form.submit_btn')}
                  </Button>
                </div>
              </div>

            </div>
          </Card>
        </div>

        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="h-6 w-6" /> {t('exchange.success.title')}
              </DialogTitle>
              <DialogDescription className="pt-2">
                {t('exchange.success.desc')}
                <br />
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground mt-2 inline-block">{t('exchange.success.id_prefix')} {requestId}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowSuccess(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
