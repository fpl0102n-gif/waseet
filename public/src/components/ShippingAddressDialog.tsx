import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { WILAYAS } from "@/lib/wilayas";
import { useCart } from "@/context/CartContext";
import { Loader2, Home, Building2, Truck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ShippingAddressDialog() {
    const {
        isAddressModalOpen,
        setIsAddressModalOpen,
        setShippingInfo,
        shippingInfo,
        processPendingItem
    } = useCart();

    const [address, setAddress] = useState(shippingInfo.address || "");
    const [wilayaCode, setWilayaCode] = useState(shippingInfo.wilayaCode || "");
    const [deliveryType, setDeliveryType] = useState<'home' | 'desk' | undefined>(shippingInfo.deliveryType);
    const [loading, setLoading] = useState(false);
    const [ratesLoading, setRatesLoading] = useState(false);
    const [error, setError] = useState("");
    const [shippingRates, setShippingRates] = useState<Record<string, any>>({});

    // Fetch shipping rates on mount
    useEffect(() => {
        if (isAddressModalOpen) {
            fetchShippingRates();
        }
    }, [isAddressModalOpen]);

    const fetchShippingRates = async () => {
        setRatesLoading(true);
        try {
            const { data } = await supabase
                .from("settings")
                .select("value")
                .eq("key", "shipping_rates")
                .single();

            if (data?.value) {
                setShippingRates(JSON.parse(data.value));
            }
        } catch (error) {
            console.error("Error loading shipping rates", error);
        } finally {
            setRatesLoading(false);
        }
    };

    const handleSave = () => {
        if (!wilayaCode || !address.trim()) {
            setError("Please fill in address and wilaya.");
            return;
        }

        if (!deliveryType) {
            setError("Please select a delivery method.");
            return;
        }

        setLoading(true);
        // Simulate a small delay for better UX
        setTimeout(() => {
            setShippingInfo({
                address: address,
                wilayaCode: wilayaCode,
                deliveryType: deliveryType
            });

            processPendingItem();
            setIsAddressModalOpen(false);
            setLoading(false);
        }, 500);
    };

    const getWilayaOptions = () => {
        if (!wilayaCode) return null;

        const rate = shippingRates[wilayaCode] || {};
        // Default to enabled if not explicitly disabled or unconfigured
        // If unconfigured (simple number), assume Home=True, Desk=True? 
        // Or better handling of legacy simple number format:
        // If rate is number -> home=rate, desk=rate, both enabled.

        let homeEnabled = true;
        let deskEnabled = true;
        let homePrice = 0;
        let deskPrice = 0;

        if (typeof rate === 'number') {
            homePrice = rate;
            deskPrice = rate;
        } else {
            homeEnabled = rate.isHomeEnabled !== false;
            deskEnabled = rate.isDeskEnabled !== false;
            homePrice = parseFloat(rate.homePrice) || 0;
            deskPrice = parseFloat(rate.deskPrice) || 0;
        }

        return { homeEnabled, deskEnabled, homePrice, deskPrice };
    };

    const options = getWilayaOptions();

    return (
        <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Shipping Details Required</DialogTitle>
                    <DialogDescription>
                        Select your location and preferred delivery method for accurate pricing.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Wilaya Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="wilaya">Wilaya</Label>
                        <Select
                            value={wilayaCode}
                            onValueChange={(val) => {
                                setWilayaCode(val);
                                setDeliveryType(undefined); // Reset type on wilaya change
                                setError("");
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Wilaya" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[250px]">
                                {WILAYAS.map((w) => (
                                    <SelectItem key={w.code} value={w.code}>
                                        {w.code} - {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Delivery Method Selection - Only show if Wilaya selected */}
                    {wilayaCode && options && (
                        <div className="space-y-3">
                            <Label>Delivery Method</Label>
                            {ratesLoading ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading rates...</div>
                            ) : (
                                <RadioGroup value={deliveryType} onValueChange={(v: 'home' | 'desk') => { setDeliveryType(v); setError(""); }}>
                                    {options.homeEnabled && (
                                        <div className={`flex items-center justify-between space-x-2 border p-3 rounded-md cursor-pointer transition-colors ${deliveryType === 'home' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="home" id="r-home" />
                                                <Label htmlFor="r-home" className="cursor-pointer flex items-center gap-2 font-medium">
                                                    <Home className="h-4 w-4 text-muted-foreground" />
                                                    Home Delivery
                                                </Label>
                                            </div>
                                            <span className="font-bold text-primary">{options.homePrice} DZD</span>
                                        </div>
                                    )}

                                    {options.deskEnabled && (
                                        <div className={`flex items-center justify-between space-x-2 border p-3 rounded-md cursor-pointer transition-colors ${deliveryType === 'desk' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="desk" id="r-desk" />
                                                <Label htmlFor="r-desk" className="cursor-pointer flex items-center gap-2 font-medium">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    Stopdesk (Office)
                                                </Label>
                                            </div>
                                            <span className="font-bold text-primary">{options.deskPrice} DZD</span>
                                        </div>
                                    )}

                                    {!options.homeEnabled && !options.deskEnabled && (
                                        <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                                            No delivery options available for this Wilaya currently.
                                        </div>
                                    )}
                                </RadioGroup>
                            )}
                        </div>
                    )}

                    {/* Address Field */}
                    <div className="space-y-2">
                        <Label htmlFor="address">Full Address</Label>
                        <Textarea
                            id="address"
                            placeholder="Street number, Building, Floor..."
                            value={address}
                            onChange={(e) => { setAddress(e.target.value); setError(""); }}
                            className="resize-none"
                            rows={2}
                        />
                    </div>

                    {error && <div className="text-sm text-destructive font-medium bg-destructive/10 p-2 rounded flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-destructive"></div>{error}</div>}
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={loading || (wilayaCode && !options?.homeEnabled && !options?.deskEnabled)}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Shipping"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
