// @ts-nocheck
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Plus, Edit, Trash2, Check, X, DollarSign, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminExchangeRates() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Data
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Global Rate State
  const [globalRate, setGlobalRate] = useState("");
  const [savingRate, setSavingRate] = useState(false);

  // Dialogs
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [showMethodDialog, setShowMethodDialog] = useState(false);

  // Forms
  const [editingCurrency, setEditingCurrency] = useState<any>(null);
  const [currencyForm, setCurrencyForm] = useState({ code: '', name: '', symbol: '', allowed_methods: [] as number[] });

  const [editingRate, setEditingRate] = useState<any>(null);
  const [rateForm, setRateForm] = useState({ currency_from_id: '', currency_to_id: '', buy_rate: 0, sell_rate: 0 }); // Using IDs

  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [methodForm, setMethodForm] = useState({ name: '' });
  const [newMethodName, setNewMethodName] = useState('');

  const quickCreateMethod = async () => {
    if (!newMethodName.trim()) return;
    try {
      const { data, error } = await supabase.from('payment_methods').insert({ name: newMethodName }).select().single();
      if (error) throw error;

      toast({ title: 'Method Created', description: `${newMethodName} added to list.` });

      // Refresh methods list
      const { data: pm } = await supabase.from('payment_methods').select('*').order('id');
      if (pm) setPaymentMethods(pm);

      // Auto-select it for the current currency
      setCurrencyForm(prev => ({
        ...prev,
        allowed_methods: [...prev.allowed_methods, data.id]
      }));

      setNewMethodName('');
    } catch (e) {
      toast({ title: 'Error', description: 'Could not create method.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for all data including global rate
      const [currResult, rtsResult, pmResult, settingsResult] = await Promise.all([
        supabase.from('currencies').select(`*, currency_payment_methods(count)`).order('id'),
        supabase.from('exchange_rates').select(`*, currency_from:currencies!currency_from_id(code), currency_to:currencies!currency_to_id(code)`).order('created_at'),
        supabase.from('payment_methods').select('*').order('id'),
        supabase.from('settings').select('value').eq('key', 'exchange_rate_usd_to_dzd').maybeSingle()
      ]);

      if (currResult.data) setCurrencies(currResult.data);
      if (rtsResult.data) setRates(rtsResult.data);
      if (pmResult.data) setPaymentMethods(pmResult.data);
      if (settingsResult.data) setGlobalRate(settingsResult.data.value);

    } catch (error) {
      console.error(error);
      toast({ title: "Error loading data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveGlobalRate = async () => {
    setSavingRate(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: globalRate, updated_at: new Date().toISOString() })
        .eq('key', 'exchange_rate_usd_to_dzd');

      if (error) throw error;
      toast({ title: "Rate Updated", description: "Global exchange rate saved successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save rate", variant: "destructive" });
    } finally {
      setSavingRate(false);
    }
  };

  // --- Currency Logic ---
  const openCurrencyDialog = async (curr?: any) => {
    if (curr) {
      setEditingCurrency(curr);
      // Fetch allowed methods for this currency
      const { data } = await supabase
        .from('currency_payment_methods')
        .select('payment_method_id')
        .eq('currency_id', curr.id);
      const methodIds = data ? data.map((d: any) => d.payment_method_id) : [];

      setCurrencyForm({
        code: curr.code,
        name: curr.name,
        symbol: curr.symbol,
        allowed_methods: methodIds
      });
    } else {
      setEditingCurrency(null);
      setCurrencyForm({ code: '', name: '', symbol: '', allowed_methods: [] });
    }
    setShowCurrencyDialog(true);
  };

  const saveCurrency = async () => {
    try {
      let currId;
      const payload = { code: currencyForm.code, name: currencyForm.name, symbol: currencyForm.symbol };

      if (editingCurrency) {
        const { error } = await supabase.from('currencies').update(payload).eq('id', editingCurrency.id);
        if (error) throw error;
        currId = editingCurrency.id;
      } else {
        const { data, error } = await supabase.from('currencies').insert(payload).select().single();
        if (error) throw error;
        currId = data.id;
      }

      // Update Payment Methods Link
      if (currId) {
        // clear existing
        await supabase.from('currency_payment_methods').delete().eq('currency_id', currId);
        // insert new
        if (currencyForm.allowed_methods.length > 0) {
          const links = currencyForm.allowed_methods.map(mid => ({
            currency_id: currId,
            payment_method_id: mid
          }));
          await supabase.from('currency_payment_methods').insert(links);
        }
      }

      toast({ title: 'Success', description: 'Currency saved' });
      setShowCurrencyDialog(false);
      fetchData();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const toggleCurrencyActive = async (id: number, current: boolean) => {
    await supabase.from('currencies').update({ is_active: !current }).eq('id', id);
    fetchData();
  };

  // --- Rate Logic ---
  // Now uses IDs relationally
  const openRateDialog = (rate?: any) => {
    if (rate) {
      setEditingRate(rate);
      setRateForm({
        currency_from_id: rate.currency_from_id?.toString(),
        currency_to_id: rate.currency_to_id?.toString(),
        buy_rate: rate.buy_rate,
        sell_rate: rate.sell_rate
      });
    } else {
      setEditingRate(null);
      setRateForm({ currency_from_id: '', currency_to_id: '', buy_rate: 0, sell_rate: 0 });
    }
    setShowRateDialog(true);
  };

  const saveRate = async () => {
    try {
      const payload = {
        currency_from_id: parseInt(rateForm.currency_from_id),
        currency_to_id: parseInt(rateForm.currency_to_id),
        buy_rate: rateForm.buy_rate,
        sell_rate: rateForm.sell_rate
      };
      if (editingRate) {
        await supabase.from('exchange_rates').update(payload).eq('id', editingRate.id);
      } else {
        await supabase.from('exchange_rates').insert(payload);
      }
      toast({ title: 'Success' });
      setShowRateDialog(false);
      fetchData();
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  // --- Payment Method Logic ---
  const openMethodDialog = (method?: any) => {
    if (method) {
      setEditingMethod(method);
      setMethodForm({ name: method.name });
    } else {
      setEditingMethod(null);
      setMethodForm({ name: '' });
    }
    setShowMethodDialog(true);
  };

  const saveMethod = async () => {
    if (editingMethod) {
      await supabase.from('payment_methods').update({ name: methodForm.name }).eq('id', editingMethod.id);
    } else {
      await supabase.from('payment_methods').insert({ name: methodForm.name });
    }
    setShowMethodDialog(false);
    fetchData();
  };

  const deleteMethod = async (id: number) => {
    if (!confirm('Are you sure? This relies on cascade delete.')) return;
    try {
      const { error } = await supabase.from('payment_methods').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Method deleted' });
      fetchData();
    } catch (e) {
      toast({ title: 'Error deleting', variant: 'destructive' });
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Exchange Configuration</h1>

        {/* Global Exchange Rate Section */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Global Order Exchange Rate (USD to DZD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 max-w-lg">
              <div className="flex-1 space-y-2">
                <Label htmlFor="global-rate">Exchange Rate</Label>
                <div className="relative">
                  <Input
                    id="global-rate"
                    type="number"
                    step="0.01"
                    value={globalRate}
                    onChange={(e) => setGlobalRate(e.target.value)}
                    placeholder="e.g. 240.00"
                  />
                  <div className="absolute right-3 top-2.5 text-sm text-muted-foreground font-medium">DZD</div>
                </div>
              </div>
              <Button onClick={saveGlobalRate} disabled={savingRate}>
                {savingRate ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Update Rate
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This rate is used for calculating prices on the "Order" page (Custom Requests).
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="currencies" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="currencies">Currencies</TabsTrigger>
            <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          {/* Currencies Tab */}
          <TabsContent value="currencies">
            <Card>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle>Currencies</CardTitle>
                <Button onClick={() => openCurrencyDialog()}><Plus className="mr-2 h-4 w-4" /> Add Currency</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Active</TableHead><TableHead>Methods</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {currencies.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold">{c.code}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell><Switch checked={c.is_active} onCheckedChange={() => toggleCurrencyActive(c.id, c.is_active)} /></TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {c.currency_payment_methods && c.currency_payment_methods[0] ? c.currency_payment_methods[0].count : 0} Allowed
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openCurrencyDialog(c)}><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rates Tab */}
          <TabsContent value="rates">
            <Card>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle>Exchange Rates</CardTitle>
                <Button onClick={() => openRateDialog()}><Plus className="mr-2 h-4 w-4" /> Add Rate</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Pair</TableHead><TableHead>Buy</TableHead><TableHead>Sell</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {rates.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono">{r.currency_from?.code} / {r.currency_to?.code}</TableCell>
                        <TableCell>{r.buy_rate}</TableCell>
                        <TableCell>{r.sell_rate}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openRateDialog(r)}><Edit className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Methods Tab */}
          <TabsContent value="methods">
            <Card>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle>Payment Methods</CardTitle>
                <Button onClick={() => openMethodDialog()}><Plus className="mr-2 h-4 w-4" /> Add Method</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {paymentMethods.map(m => (
                      <TableRow key={m.id}>
                        <TableCell>{m.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openMethodDialog(m)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deleteMethod(m.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Currency Dialog */}
        <Dialog open={showCurrencyDialog} onOpenChange={setShowCurrencyDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingCurrency ? 'Edit Currency' : 'New Currency'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Code</Label><Input value={currencyForm.code} onChange={e => setCurrencyForm({ ...currencyForm, code: e.target.value })} placeholder="USD" /></div>
                <div><Label>Symbol</Label><Input value={currencyForm.symbol} onChange={e => setCurrencyForm({ ...currencyForm, symbol: e.target.value })} placeholder="$" /></div>
              </div>
              <div><Label>Name</Label><Input value={currencyForm.name} onChange={e => setCurrencyForm({ ...currencyForm, name: e.target.value })} placeholder="US Dollar" /></div>

              <div className="border p-4 rounded-md">
                <Label className="mb-2 block">Allowed Payment Methods</Label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pm-${pm.id}`}
                        checked={currencyForm.allowed_methods.includes(pm.id)}
                        onCheckedChange={(c) => {
                          const set = new Set(currencyForm.allowed_methods);
                          if (c) set.add(pm.id); else set.delete(pm.id);
                          setCurrencyForm({ ...currencyForm, allowed_methods: Array.from(set) });
                        }}
                      />
                      <Label htmlFor={`pm-${pm.id}`}>{pm.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 items-end pt-2 border-t mt-2">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Create New Method</Label>
                  <Input
                    placeholder="e.g. zzz1"
                    value={newMethodName}
                    onChange={e => setNewMethodName(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <Button onClick={quickCreateMethod} size="sm" variant="secondary" className="h-8">
                  <Plus className="h-3 w-3 mr-1" /> Create
                </Button>
              </div>
            </div>
            <DialogFooter><Button onClick={saveCurrency}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rate Dialog */}
        <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingRate ? 'Edit Rate' : 'New Rate'}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={rateForm.currency_from_id}
                  onChange={e => setRateForm({ ...rateForm, currency_from_id: e.target.value })}
                >
                  <option value="">Select</option>
                  {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
              </div>
              <div>
                <Label>To</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  value={rateForm.currency_to_id}
                  onChange={e => setRateForm({ ...rateForm, currency_to_id: e.target.value })}
                >
                  <option value="">Select</option>
                  {currencies.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Buy Rate</Label><Input type="number" step="0.0001" value={rateForm.buy_rate} onChange={e => setRateForm({ ...rateForm, buy_rate: parseFloat(e.target.value) })} /></div>
              <div><Label>Sell Rate</Label><Input type="number" step="0.0001" value={rateForm.sell_rate} onChange={e => setRateForm({ ...rateForm, sell_rate: parseFloat(e.target.value) })} /></div>
            </div>
            <DialogFooter><Button onClick={saveRate}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Method Dialog */}
        <Dialog open={showMethodDialog} onOpenChange={setShowMethodDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingMethod ? 'Edit Method' : 'New Method'}</DialogTitle></DialogHeader>
            <div><Label>Name</Label><Input value={methodForm.name} onChange={e => setMethodForm({ ...methodForm, name: e.target.value })} /></div>
            <DialogFooter><Button onClick={saveMethod}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
      <Footer />
    </>
  );
}
