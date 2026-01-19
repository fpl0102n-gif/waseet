import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Section from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Globe2, Package, Settings, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FormState {
  customer_name: string;
  contact_method: 'whatsapp' | 'email' | 'phone';
  contact_value: string;
  origin_country: string;
  origin_city: string;
  product_description: string;
  product_links: string;
  product_currency: string;
  product_value: string;
  quantity: number;
  shipping_priority: 'normal' | 'express';
  delivery_method: 'home_delivery' | 'pickup';
  terms_accepted: boolean;
}

const RequestImport = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [blocked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    customer_name: '',
    contact_method: 'whatsapp',
    contact_value: '',
    origin_country: '',
    origin_city: '',
    product_description: '',
    product_links: '',
    product_currency: 'EUR',
    product_value: '',
    quantity: 1,
    shipping_priority: 'normal',
    delivery_method: 'home_delivery',
    terms_accepted: false,
  });

  const validate = () => {
    if (!form.contact_value.trim()) return t('request_import.validation.contact');
    if (!form.origin_country.trim()) return t('request_import.validation.country');
    if (!form.product_description.trim()) return t('request_import.validation.desc');
    if (!form.product_value || isNaN(Number(form.product_value))) return t('request_import.validation.value');
    if (!form.quantity || form.quantity < 1) return t('request_import.validation.quantity');
    if (!form.terms_accepted) return t('request_import.validation.terms');
    return null;
  };

  const onSubmit = async () => {
    const err = validate();
    if (err) {
      toast({ title: t('request_import.validation.title'), description: err, variant: 'destructive' });
      return;
    }
    setConfirmOpen(true);
  };

  const insertRequest = async () => {
    try {
      setLoading(true);
      // Basic rate limit (client-side)
      const last = localStorage.getItem('import_last_submit');
      if (last && Date.now() - Number(last) < 60000) {
        toast({ title: t('request_import.validation.wait'), description: t('request_import.validation.wait_desc') });
        setLoading(false);
        return;
      }

      const linksArray = form.product_links
        .split(/\n|,/) // comma or newline separated
        .map((s) => s.trim())
        .filter(Boolean);

      const { data, error } = await (supabase as any).from('import_requests').insert({
        customer_name: form.customer_name || null,
        contact_method: form.contact_method,
        contact_value: form.contact_value.trim(),
        origin_country: form.origin_country.trim(),
        origin_city: form.origin_city.trim() || null,
        product_description: form.product_description.trim(),
        product_links: linksArray.length ? linksArray : null,
        product_currency: form.product_currency,
        product_value: Number(form.product_value),
        quantity: Number(form.quantity),
        shipping_priority: form.shipping_priority,
        delivery_method: form.delivery_method,
        terms_accepted: form.terms_accepted,
        status: 'pending',
      }).select('id').single();

      if (error) throw error;

      // Notify admin via Edge Function (optional)
      try {
        const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-request-notify`;
        await fetch(fnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data?.id,
            product_description: form.product_description,
            origin_country: form.origin_country,
            origin_city: form.origin_city,
            value: Number(form.product_value) * Number(form.quantity || 1),
            currency: form.product_currency,
            customer_whatsapp: form.contact_method === 'whatsapp' ? form.contact_value : '',
          })
        });
      } catch (_) { }

      localStorage.setItem('import_last_submit', String(Date.now()));
      setConfirmOpen(false);
      toast({ title: t('request_import.validation.sent'), description: t('request_import.validation.sent_desc_id', { id: data?.id }) });
      // Reset minimal fields
      setForm((f) => ({ ...f, product_description: '', product_links: '', product_value: '', quantity: 1, terms_accepted: false }));
    } catch (e: any) {
      toast({ title: t('request_import.validation.error'), description: e.message || t('request_import.validation.default_error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (blocked) {
    return (
      <AppLayout>
        <Section id="request-import" title="Request Import" subtitle="" padding="md">
          <div className="app-shell min-h-[50vh] flex items-center justify-center">
            <div className="max-w-md w-full border border-warning/50 bg-warning/10 rounded-xl p-8 text-center space-y-5 shadow-sm">
              <h2 className="text-xl font-semibold text-brand-gradient">{t('request_import.blocked.title')}</h2>
              <p className="text-sm text-foreground/65">{t('request_import.blocked.desc')}</p>
              <Button onClick={() => navigate('/')} className="h-11 w-full font-medium">{t('request_import.blocked.btn')}</Button>
            </div>
          </div>
        </Section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Section id="request-import" title={t('request_import.title')} subtitle={t('request_import.subtitle')} padding="md">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-sm">{t('request_import.sections.contact')}</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_name" className="text-xs font-medium">{t('request_import.contact.name')}</Label>
                  <Input id="customer_name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder={t('request_import.contact.name_ph')} className="h-10" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{t('request_import.contact.method')}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['whatsapp', 'email', 'phone'].map(m => (
                        <button key={m} type="button" onClick={() => setForm({ ...form, contact_method: m as any })}
                          className={`px-2 py-2 rounded-lg border-2 text-xs transition-all ${form.contact_method === m ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_value" className="text-xs font-medium">{t('request_import.contact.value')}</Label>
                    <Input id="contact_value" value={form.contact_value} onChange={(e) => setForm({ ...form, contact_value: e.target.value })} placeholder={t('request_import.contact.value_ph')} className="h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Origin */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <Globe2 className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold text-sm">{t('request_import.sections.origin')}</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin_country" className="text-xs font-medium">{t('request_import.origin.country')}</Label>
                    <Input id="origin_country" value={form.origin_country} onChange={(e) => setForm({ ...form, origin_country: e.target.value })} placeholder={t('request_import.origin.country_ph')} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin_city" className="text-xs font-medium">{t('request_import.origin.city')}</Label>
                    <Input id="origin_city" value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })} placeholder={t('request_import.origin.city_ph')} className="h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <Package className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-sm">{t('request_import.sections.product')}</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_description" className="text-xs font-medium">{t('request_import.product.desc')}</Label>
                  <Textarea id="product_description" value={form.product_description} onChange={(e) => setForm({ ...form, product_description: e.target.value })} placeholder={t('request_import.product.desc_ph')} rows={3} className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product_links" className="text-xs font-medium">{t('request_import.product.links')}</Label>
                  <Textarea id="product_links" value={form.product_links} onChange={(e) => setForm({ ...form, product_links: e.target.value })} placeholder={t('request_import.product.links_ph')} rows={3} className="resize-none" />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_currency" className="text-xs font-medium">{t('request_import.product.currency')}</Label>
                    <select id="product_currency" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm" value={form.product_currency} onChange={(e) => setForm({ ...form, product_currency: e.target.value })}>
                      <option>EUR</option><option>USD</option><option>GBP</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_value" className="text-xs font-medium">{t('request_import.product.value')}</Label>
                    <Input id="product_value" type="number" step="0.01" value={form.product_value} onChange={(e) => setForm({ ...form, product_value: e.target.value })} placeholder={t('request_import.product.value_ph')} className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-xs font-medium">{t('request_import.product.quantity')}</Label>
                    <Input id="quantity" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value || 1) })} className="h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <Settings className="w-5 h-5 text-warning" />
                  <h3 className="font-semibold text-sm">{t('request_import.sections.options')}</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{t('request_import.options.priority')}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['normal', 'express'].map(v => (
                        <button key={v} type="button" onClick={() => setForm({ ...form, shipping_priority: v as any })}
                          className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${form.shipping_priority === v ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>{t(`request_import.options.priorities.${v}`)}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{t('request_import.options.delivery')}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['home_delivery', 'pickup'].map(v => (
                        <button key={v} type="button" onClick={() => setForm({ ...form, delivery_method: v as any })}
                          className={`px-3 py-2 rounded-lg border-2 text-xs transition-all ${form.delivery_method === v ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>{v === 'home_delivery' ? t('request_import.options.deliveries.home') : t('request_import.options.deliveries.pickup')}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Submit */}
            <Card className="border border-border/60 shadow-sm bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <h3 className="font-semibold text-sm">{t('request_import.sections.confirmation')}</h3>
                </div>
                <label className="flex items-start gap-3 text-xs leading-relaxed">
                  <input id="terms" type="checkbox" className="mt-1" checked={form.terms_accepted} onChange={(e) => setForm({ ...form, terms_accepted: e.target.checked })} />
                  <span>{t('request_import.confirmation.terms')}</span>
                </label>
                <Button disabled={loading} onClick={onSubmit} className="w-full h-11 text-sm font-semibold">{loading ? t('request_import.confirmation.submitting') : t('request_import.confirmation.submit')}</Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Guidance */}
          <div className="space-y-6 lg:sticky lg:top-8 h-fit">
            <Card className="border border-info/40 bg-info/5 shadow-sm">
              <CardContent className="p-5 text-xs space-y-3">
                <p className="font-medium text-sm">{t('request_import.tips.title')}</p>
                <p>{t('request_import.tips.t1')}</p>
                <p>{t('request_import.tips.t2')}</p>
                <p>{t('request_import.tips.t3')}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="confirmImportTitle">
            <div className="bg-card border border-border/60 rounded-lg shadow-lg p-6 w-full max-w-lg">
              <h2 id="confirmImportTitle" className="text-lg font-semibold mb-4 text-brand-gradient">{t('request_import.confirmation.modal.title')}</h2>
              <div className="text-xs space-y-2 mb-5">
                <div><strong>{t('request_import.sections.product')}:</strong> {form.product_description}</div>
                <div><strong>{t('request_import.sections.origin')}:</strong> {form.origin_country || '-'} / {form.origin_city || '-'}</div>
                <div><strong>{t('request_import.sections.options')}:</strong> {form.product_value || '0'} {form.product_currency} × {form.quantity}</div>
                <div><strong>{t('request_import.sections.contact')}:</strong> {form.contact_method} - {form.contact_value}</div>
                <div><strong>{t('request_import.options.priority')}:</strong> {t(`request_import.options.priorities.${form.shipping_priority}`)}</div>
                <div><strong>{t('request_import.options.delivery')}:</strong> {form.delivery_method === 'home_delivery' ? t('request_import.options.deliveries.home') : t('request_import.options.deliveries.pickup')}</div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)} className="h-9">{t('request_import.confirmation.modal.cancel')}</Button>
                <Button onClick={insertRequest} disabled={loading} className="h-9">{loading ? t('request_import.confirmation.submitting') : t('request_import.confirmation.modal.confirm')}</Button>
              </div>
            </div>
          </div>
        )}
      </Section>
    </AppLayout>
  );
};

export default RequestImport;
