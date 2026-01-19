import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Truck, Mail, MessageCircle } from "lucide-react";
import { WILAYAS } from "@/lib/wilayas";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    contact_whatsapp: "",
    contact_telegram: "",
    contact_email: "",
    exchange_rate_usd_to_dzd: "",
  });
  const [shippingRates, setShippingRates] = useState<Record<string, any>>({});
  const [importCommission, setImportCommission] = useState({
    mode: 'percentage',
    percentage: '5.00',
    fixed: '0'
  });

  useEffect(() => {
    fetchSettings();
    fetchImportSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("settings")
      .select("key, value");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } else if (data) {
      const settingsObj: any = {};
      data.forEach((setting) => {
        settingsObj[setting.key] = setting.value;
      });
      setSettings(settingsObj);

      if (settingsObj.shipping_rates) {
        try {
          setShippingRates(JSON.parse(settingsObj.shipping_rates));
        } catch (e) {
          console.error("Error parsing shipping rates", e);
          setShippingRates({});
        }
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(settings)
        .filter(([key]) => key !== 'shipping_rates') // Exclude shipping_rates to prevent overwrite
        .map(([key, value]) => {
          return supabase
            .from("settings")
            .upsert({
              key,
              value,
              updated_at: new Date().toISOString()
            }, { onConflict: 'key' });
        });

      // Save shipping rates
      updates.push(
        supabase
          .from("settings")
          .upsert({
            key: "shipping_rates",
            value: JSON.stringify(shippingRates),
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' })
      );

      await Promise.all(updates);

      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRateChange = (wilayaCode: string, field: string, value: any) => {
    setShippingRates(prev => {
      const currentRate: any = prev[wilayaCode] || {
        homePrice: 0,
        deskPrice: 0,
        isHomeEnabled: true,
        isDeskEnabled: true
      };

      // Handle numeric values
      let finalValue = value;
      if (field === 'homePrice' || field === 'deskPrice') {
        finalValue = parseFloat(value) || 0;
      }

      return {
        ...prev,
        [wilayaCode]: {
          ...currentRate,
          [field]: finalValue
        }
      };
    });
  };

  const fetchImportSettings = async () => {
    const { data } = await supabase.from('import_settings').select('*').order('id', { ascending: false }).limit(1).maybeSingle();
    if (data) {
      setImportCommission({
        mode: (data as any).commission_mode || 'percentage',
        percentage: String((data as any).commission_percentage ?? '5.00'),
        fixed: String((data as any).commission_fixed ?? '0')
      });
    }
  };

  const saveImportSettings = async () => {
    setSaving(true);
    const payload = {
      commission_mode: importCommission.mode,
      commission_percentage: Number(importCommission.percentage || '0'),
      commission_fixed: Number(importCommission.fixed || '0')
    };
    const { error } = await supabase.from('import_settings').insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Import commission settings saved' });
      fetchImportSettings();
    }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Platform Settings</h1>
          <p className="text-gray-500">Manage contact info, rates, and commissions.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Settings</CardTitle>
            <CardDescription>
              Manage your contact information displayed on the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Contact Page Settings */}
            <div className="space-y-4 border p-4 rounded-lg bg-card/50">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Mail className="h-4 w-4" /> Contact Page
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+1234567890"
                    value={settings.contact_whatsapp || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_whatsapp: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    placeholder="@username"
                    value={settings.contact_telegram || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_telegram: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="support@waseet.com"
                    value={settings.contact_email || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Social Popup Settings */}
            <div className="space-y-4 border p-4 rounded-lg bg-card/50">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Social Popup
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="popup_facebook">Facebook URL</Label>
                  <Input
                    id="popup_facebook"
                    placeholder="https://facebook.com/..."
                    value={(settings as any).popup_facebook || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, popup_facebook: e.target.value } as any)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="popup_instagram">Instagram URL</Label>
                  <Input
                    id="popup_instagram"
                    placeholder="https://instagram.com/..."
                    value={(settings as any).popup_instagram || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, popup_instagram: e.target.value } as any)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="popup_telegram">Telegram URL</Label>
                  <Input
                    id="popup_telegram"
                    placeholder="https://t.me/..."
                    value={(settings as any).popup_telegram || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, popup_telegram: e.target.value } as any)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Al-Khayr Settings */}
            <div className="space-y-4 border p-4 rounded-lg bg-card/50">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Truck className="h-4 w-4" /> Al-Khayr Contact
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="alkhayr_whatsapp">WhatsApp</Label>
                  <Input
                    id="alkhayr_whatsapp"
                    placeholder="+213..."
                    value={(settings as any).alkhayr_whatsapp || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, alkhayr_whatsapp: e.target.value } as any)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alkhayr_telegram">Telegram</Label>
                  <Input
                    id="alkhayr_telegram"
                    placeholder="waseet"
                    value={(settings as any).alkhayr_telegram || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, alkhayr_telegram: e.target.value } as any)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alkhayr_facebook">Facebook</Label>
                  <Input
                    id="alkhayr_facebook"
                    placeholder="waseet"
                    value={(settings as any).alkhayr_facebook || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, alkhayr_facebook: e.target.value } as any)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alkhayr_instagram">Instagram</Label>
                  <Input
                    id="alkhayr_instagram"
                    placeholder="waseet"
                    value={(settings as any).alkhayr_instagram || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, alkhayr_instagram: e.target.value } as any)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="exchange_rate">USD to DZD Exchange Rate</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.01"
                min="0"
                placeholder="135.50"
                value={settings.exchange_rate_usd_to_dzd}
                onChange={(e) =>
                  setSettings({ ...settings, exchange_rate_usd_to_dzd: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                This rate will be used to convert USD prices to DZD for customers
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Contact Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Requests — Commission Settings</CardTitle>
            <CardDescription>Define how commission is calculated when an import request is completed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Mode</Label>
                <select className="w-full border rounded-md h-10 px-2" value={importCommission.mode} onChange={(e) => setImportCommission({ ...importCommission, mode: e.target.value })}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                  <option value="fixed_plus_percentage">Fixed + Percentage</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Percentage (%)</Label>
                <Input type="number" step="0.01" value={importCommission.percentage} onChange={(e) => setImportCommission({ ...importCommission, percentage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fixed Amount</Label>
                <Input type="number" step="0.01" value={importCommission.fixed} onChange={(e) => setImportCommission({ ...importCommission, fixed: e.target.value })} />
              </div>
            </div>
            <Button onClick={saveImportSettings} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Commission Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Rates (DZD)
            </CardTitle>
            <CardDescription>Set the shipping price for each Wilaya. 0 means free shipping.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 max-h-[600px] overflow-y-auto p-2 border rounded-md mb-4">
              {WILAYAS.map((wilaya) => {
                const rate = shippingRates[wilaya.code] as any || {};
                const homeEnabled = rate.isHomeEnabled ?? true;
                const deskEnabled = rate.isDeskEnabled ?? true;

                return (
                  <div key={wilaya.code} className="p-4 border rounded-lg bg-card shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold text-base truncate" title={wilaya.name}>
                        {wilaya.code}. {wilaya.name}
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Home Delivery */}
                      <div className={`space-y-2 p-3 rounded-md border ${homeEnabled ? 'bg-secondary/20 border-secondary/50' : 'bg-muted/50 border-transparent opacity-70'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Home Delivery</Label>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={homeEnabled}
                            onChange={(e) => handleRateChange(wilaya.code, 'isHomeEnabled', e.target.checked)}
                          />
                        </div>
                        <Input
                          type="number"
                          min="0"
                          disabled={!homeEnabled}
                          value={rate.homePrice || ''}
                          onChange={(e) => handleRateChange(wilaya.code, 'homePrice', e.target.value)}
                          placeholder="Price (DZD)"
                          className="h-8 bg-background"
                        />
                      </div>

                      {/* Desk Delivery */}
                      <div className={`space-y-2 p-3 rounded-md border ${deskEnabled ? 'bg-secondary/20 border-secondary/50' : 'bg-muted/50 border-transparent opacity-70'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">Stopdesk</Label>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={deskEnabled}
                            onChange={(e) => handleRateChange(wilaya.code, 'isDeskEnabled', e.target.checked)}
                          />
                        </div>
                        <Input
                          type="number"
                          min="0"
                          disabled={!deskEnabled}
                          value={rate.deskPrice || ''}
                          onChange={(e) => handleRateChange(wilaya.code, 'deskPrice', e.target.value)}
                          placeholder="Price (DZD)"
                          className="h-8 bg-background"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Shipping Rates
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
