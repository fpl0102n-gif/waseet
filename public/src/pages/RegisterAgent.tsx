import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Section from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Package,
  Scale,
  Settings2,
  ShieldCheck,
  Plane,
  Globe,
  DollarSign,
  FileText
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

const RegisterAgent = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successId, setSuccessId] = useState<number | null>(null);

  const [form, setForm] = useState({
    // Personal / Identity
    name: '',
    city: '',
    country: '',
    phone_whatsapp: '',
    email: '',
    telegram: '',

    // Import Capabilities
    shipping_countries: '', // Text input, will be split
    shipping_methods: '', // Changed to string input
    shipment_frequency: 'regular', // regular | occasional

    // Product Categories
    goods_types: [] as string[], // electronics, clothing, etc.
    goods_other: '',

    // Pricing (Optional)
    price_per_kg: '',
    currency: 'EUR',
    pricing_type: 'negotiable', // fixed | negotiable

    // Additional
    additional_notes: '',

    // Legal
    agree_broker: false,
    agree_admin: false,
    agree_terms: false,
  });

  const toggleMulti = (list: string[], value: string) =>
    list.includes(value) ? list.filter(v => v !== value) : [...list, value];

  const validate = () => {
    if (!form.name.trim()) return t('register_agent.validation.name');
    if (!form.country.trim()) return t('register_agent.validation.country');
    if (!form.city.trim()) return t('register_agent.validation.city');
    if (!form.phone_whatsapp.trim()) return t('register_agent.validation.phone');
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('register_agent.validation.email');

    if (!form.shipping_countries.trim()) return t('register_agent.validation.countries');

    if (!form.agree_broker) return t('register_agent.validation.broker');
    if (!form.agree_admin) return t('register_agent.validation.admin');
    if (!form.agree_terms) return t('register_agent.validation.terms');

    return null;
  };

  const onSubmit = () => {
    const v = validate();
    if (v) { toast({ title: t('register_agent.validation.title'), description: v, variant: 'destructive' }); return; }
    setConfirmOpen(true);
  };

  const insertRegistration = async () => {
    try {
      setLoading(true);

      // Process Data
      const countriesArr = form.shipping_countries.split(/,|\n/).map(s => s.trim()).filter(Boolean);
      const goodsArr = [...form.goods_types];
      if (form.goods_other.trim()) goodsArr.push(form.goods_other.trim());

      const { data, error } = await (supabase as any).from('agents').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone_whatsapp: form.phone_whatsapp.trim(),
        telegram: form.telegram.trim() || null,
        country: form.country.trim(),
        city: form.city.trim(),

        shipping_countries: countriesArr.length ? countriesArr : null,
        shipping_methods: form.shipping_methods.trim() ? [form.shipping_methods.trim()] : null,
        shipment_frequency: form.shipment_frequency,

        goods_types: goodsArr.length ? goodsArr : null,

        price_per_kg: form.price_per_kg ? Number(form.price_per_kg) : null,
        currency: form.currency || null,
        pricing_type: form.pricing_type || null,

        additional_notes: form.additional_notes.trim() || null,

        status: 'pending',
        role: 'agent',
        active: false // Explicitly inactive until approved
      }).select('*').single();

      if (error) throw error;

      setSuccessId(data.id);

      // Direct Email Invocation (Bypasses Docker Network Issues)
      console.log('Invoking Email for Agent Registration', data.id);
      supabase.functions.invoke('send-email', {
        body: {
          type: 'agent_registration',
          record: data
        }
      }).then(({ data: emailData, error: emailError }) => {
        if (emailError) console.error("Agent Email Error:", emailError);
        else console.log("Agent Email Success:", emailData);
      });

      setShowSuccess(true);
      setConfirmOpen(false);

    } catch (e: any) {
      toast({ title: t('register_agent.validation.error_title'), description: e.message || t('register_agent.validation.default_error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <AppLayout>
        <Section center padding="lg">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">{t('register_agent.success.title')}</h2>
            <p className="text-muted-foreground">
              {t('register_agent.success.desc', { id: successId })}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">{t('register_agent.success.home_btn')}</Button>
          </div>
        </Section>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Section id="register-agent" title={t('register_agent.hero.title')} subtitle={t('register_agent.hero.subtitle')} padding="md">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* 1. Personal / Identity */}
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">{t('register_agent.personal.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('register_agent.personal.name')}</Label>
                <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('register_agent.personal.placeholders.name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('register_agent.personal.country')}</Label>
                <Input id="country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder={t('register_agent.personal.placeholders.country')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('register_agent.personal.city')}</Label>
                <Input id="city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder={t('register_agent.personal.placeholders.city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('register_agent.personal.email')}</Label>
                <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('register_agent.personal.placeholders.email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('register_agent.personal.phone')}</Label>
                <Input id="phone" value={form.phone_whatsapp} onChange={e => setForm({ ...form, phone_whatsapp: e.target.value })} placeholder={t('register_agent.personal.placeholders.phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegram">{t('register_agent.personal.telegram')}</Label>
                <Input id="telegram" value={form.telegram} onChange={e => setForm({ ...form, telegram: e.target.value })} placeholder={t('register_agent.personal.placeholders.telegram')} />
              </div>
            </CardContent>
          </Card>

          {/* 2. Import Capabilities */}
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base">{t('register_agent.capabilities.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="countries">{t('register_agent.capabilities.countries_label')}</Label>
                <Input
                  id="countries"
                  value={form.shipping_countries}
                  onChange={e => setForm({ ...form, shipping_countries: e.target.value })}
                  placeholder={t('register_agent.capabilities.countries_placeholder')}
                />
                <p className="text-xs text-muted-foreground">{t('register_agent.capabilities.countries_hint')}</p>
              </div>

              <div className="space-y-2">
                <Label>{t('register_agent.capabilities.methods_label')}</Label>
                <Input
                  id="methods"
                  value={form.shipping_methods as string}
                  onChange={e => setForm({ ...form, shipping_methods: e.target.value })}
                  placeholder={t('register_agent.capabilities.methods_placeholder') || "e.g. Air Cargo, DHL, Personal Transport"}
                />
                <p className="text-xs text-muted-foreground">Enter the shipping methods you support.</p>
              </div>

              <div className="space-y-2">
                <Label>{t('register_agent.capabilities.frequency_label')}</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 flex-1 hover:bg-muted/50">
                    <input
                      type="radio"
                      name="freq"
                      checked={form.shipment_frequency === 'regular'}
                      onChange={() => setForm({ ...form, shipment_frequency: 'regular' })}
                    />
                    <div className="text-sm">
                      <span className="font-medium block">{t('register_agent.capabilities.freq_regular')}</span>
                      <span className="text-muted-foreground text-xs">{t('register_agent.capabilities.freq_regular_desc')}</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 flex-1 hover:bg-muted/50">
                    <input
                      type="radio"
                      name="freq"
                      checked={form.shipment_frequency === 'occasional'}
                      onChange={() => setForm({ ...form, shipment_frequency: 'occasional' })}
                    />
                    <div className="text-sm">
                      <span className="font-medium block">{t('register_agent.capabilities.freq_occasional')}</span>
                      <span className="text-muted-foreground text-xs">{t('register_agent.capabilities.freq_occasional_desc')}</span>
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Product Categories */}
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-base">{t('register_agent.categories.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>{t('register_agent.categories.label')}</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: 'Electronics', label: t('register_agent.categories.options.electronics') },
                    { val: 'Clothing', label: t('register_agent.categories.options.clothing') },
                    { val: 'Medical Items', label: t('register_agent.categories.options.medical') },
                    { val: 'Cosmetics', label: t('register_agent.categories.options.cosmetics') },
                    { val: 'Auto Parts', label: t('register_agent.categories.options.auto') },
                    { val: 'General Goods', label: t('register_agent.categories.options.general') }
                  ].map(cat => (
                    <button
                      key={cat.val}
                      type="button"
                      onClick={() => setForm({ ...form, goods_types: toggleMulti(form.goods_types, cat.val) })}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${form.goods_types.includes(cat.val)
                        ? 'bg-orange-50 border-orange-200 text-orange-700'
                        : 'bg-background border-border hover:bg-muted'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_goods" className="text-xs">{t('register_agent.categories.other_label')}</Label>
                <Input
                  id="other_goods"
                  value={form.goods_other}
                  onChange={e => setForm({ ...form, goods_other: e.target.value })}
                  placeholder={t('register_agent.categories.other_placeholder')}
                  className="h-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Pricing (Optional) */}
          <Card className="border-dashed border-primary/30">
            <CardHeader className="pb-3 border-b bg-primary/5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <CardTitle className="text-base">{t('register_agent.pricing.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm text-muted-foreground">{t('register_agent.pricing.subtitle')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="price">{t('register_agent.pricing.price_per_kg')}</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      value={form.price_per_kg}
                      onChange={e => setForm({ ...form, price_per_kg: e.target.value })}
                      placeholder="0.00"
                      className="pl-8"
                    />
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t('register_agent.pricing.currency')}</Label>
                  <select
                    id="currency"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="DZD">DZD (DA)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('register_agent.pricing.type')}</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={form.pricing_type}
                    onChange={e => setForm({ ...form, pricing_type: e.target.value })}
                  >
                    <option value="fixed">{t('register_agent.pricing.types.fixed')}</option>
                    <option value="negotiable">{t('register_agent.pricing.types.negotiable')}</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Additional Info */}
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <CardTitle className="text-base">{t('register_agent.additional.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Label htmlFor="notes" className="sr-only">Notes</Label>
              <Textarea
                id="notes"
                value={form.additional_notes}
                onChange={e => setForm({ ...form, additional_notes: e.target.value })}
                placeholder={t('register_agent.additional.placeholder')}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* 6. Legal & Agreement */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">{t('register_agent.legal.title')}</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <input type="checkbox" checked={form.agree_broker} onChange={e => setForm({ ...form, agree_broker: e.target.checked })} className="accent-primary w-4 h-4" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">{t('register_agent.legal.broker')}</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <input type="checkbox" checked={form.agree_admin} onChange={e => setForm({ ...form, agree_admin: e.target.checked })} className="accent-primary w-4 h-4" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">{t('register_agent.legal.admin')}</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="pt-0.5">
                    <input type="checkbox" checked={form.agree_terms} onChange={e => setForm({ ...form, agree_terms: e.target.checked })} className="accent-primary w-4 h-4" />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">{t('register_agent.legal.terms')}</span>
                </label>
              </div>
              <div className="pt-4">
                <Button
                  onClick={onSubmit}
                  disabled={loading}
                  className="w-full md:w-auto md:px-12 h-12 text-base shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? t('register_agent.legal.submitting') : t('register_agent.legal.submit')}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-bold">Confirm Registration</h2>
                <p className="text-sm text-muted-foreground">Please double check your details before submitting.</p>
              </div>

              <div className="space-y-3 text-sm bg-muted/30 p-4 rounded-lg">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-right">{form.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium text-right">{form.country} ({form.city})</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Ship From:</span>
                  <span className="font-medium text-right max-w-[200px] truncate">{form.shipping_countries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium text-right">{form.phone_whatsapp}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)} className="flex-1 h-11">Edit</Button>
                <Button onClick={insertRegistration} disabled={loading} className="flex-1 h-11">
                  {loading ? 'Submitting...' : 'Confirm & Submit'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Section>
    </AppLayout>
  );
};

export default RegisterAgent;
