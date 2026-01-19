
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Trash2, Plus, Minus, Loader2, CheckCircle2, MapPin, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WILAYAS } from "@/lib/wilayas";
import { useTranslation } from "react-i18next";

export function CartSheet() {
    const { items, removeItem, updateQuantity, cartTotal, itemCount, clearCart, shippingInfo, setIsAddressModalOpen } = useCart();
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [successDetails, setSuccessDetails] = useState<{ title: string; description: string } | null>(null);
    const [shippingRates, setShippingRates] = useState<Record<string, any>>({});

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        useWhatsApp: false,
        useTelegram: false,
        whatsappNumber: "+213",
        telegramUsername: "@"
    });

    useEffect(() => {
        if (isOpen) {
            fetchShippingRates();
        }
    }, [isOpen]);

    const fetchShippingRates = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'shipping_rates').single();
        if (data?.value) {
            try {
                setShippingRates(JSON.parse(data.value));
            } catch (e) {
                console.error("Failed to parse shipping rates", e);
            }
        }
    };

    const [exchangeRate, setExchangeRate] = useState(1);

    useEffect(() => {
        const fetchExchangeRate = async () => {
            const { data } = await supabase.from('settings').select('value').eq('key', 'exchange_rate_usd_to_dzd').single();
            if (data?.value) {
                setExchangeRate(parseFloat(data.value) || 1);
            }
        }
        fetchExchangeRate();
    }, []);

    const wilayaName = useMemo(() => {
        return WILAYAS.find(w => w.code === shippingInfo.wilayaCode)?.name || shippingInfo.wilayaCode;
    }, [shippingInfo.wilayaCode]);

    const hasStoreItems = useMemo(() => {
        return items.some(item => !item.productUrl);
    }, [items]);

    const shippingCosts = useMemo(() => {
        let baseShipping = 0;

        // Apply Wilaya shipping only if there are STORE items and wilaya is selected
        if (hasStoreItems && shippingInfo.wilayaCode && shippingRates[shippingInfo.wilayaCode] !== undefined) {
            const rate: any = shippingRates[shippingInfo.wilayaCode];

            // Handle new complex rate structure vs legacy simple number
            if (typeof rate === 'number') {
                baseShipping = rate;
            } else if (rate && typeof rate === 'object') {
                // Default to Home price if type not set (fallback), or use specific type price
                if (shippingInfo.deliveryType === 'desk') {
                    baseShipping = parseFloat(rate.deskPrice) || 0;
                } else {
                    // Default to home if 'home' or undefined
                    baseShipping = parseFloat(rate.homePrice) || 0;
                }
            }
        }

        // Add custom shipping from items (e.g. huge items with specific extra cost)
        const itemsShipping = items.reduce((acc, item) => acc + (item.shippingPrice || 0) * item.quantity, 0);

        return baseShipping + itemsShipping;
    }, [items, shippingInfo.wilayaCode, shippingInfo.deliveryType, shippingRates, hasStoreItems]);

    const finalTotal = cartTotal + shippingCosts;

    const deliveryLabel = useMemo(() => {
        if (!shippingInfo.deliveryType) return t('cart.shipping');
        return shippingInfo.deliveryType === 'desk' ? t('cart.shipping_desk') : t('cart.shipping_home');
    }, [shippingInfo.deliveryType, t]);

    const validateForm = () => {
        // Only require shipping info if there are store items
        if (hasStoreItems && (!shippingInfo.wilayaCode || !shippingInfo.address)) {
            toast({
                title: t('cart.validation.missing_shipping_title'),
                description: t('cart.validation.missing_shipping_desc'),
                variant: "destructive"
            });
            setIsAddressModalOpen(true);
            return false;
        }
        if (!formData.name.trim()) {
            toast({
                title: t('cart.validation.missing_name_title'),
                description: t('cart.validation.missing_name_desc'),
                variant: "destructive"
            });
            return false;
        }
        if (!formData.phone.trim() || formData.phone === "+213") {
            toast({
                title: t('cart.validation.missing_phone_title'),
                description: t('cart.validation.missing_phone_desc'),
                variant: "destructive"
            });
            return false;
        }

        if (formData.useWhatsApp && (!formData.whatsappNumber.trim() || formData.whatsappNumber === "+213")) {
            toast({
                title: t('cart.validation.missing_whatsapp_title'),
                description: t('cart.validation.missing_whatsapp_desc'),
                variant: "destructive"
            });
            return false;
        }

        if (formData.useTelegram && (!formData.telegramUsername.trim() || formData.telegramUsername === "@")) {
            toast({
                title: t('cart.validation.missing_telegram_title'),
                description: t('cart.validation.missing_telegram_desc'),
                variant: "destructive"
            });
            return false;
        }

        return true;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) return;
        setLoading(true);

        try {
            const storeItems = items.filter(item => !item.productUrl);
            const customItems = items.filter(item => item.productUrl);
            const createdOrders = [];

            // Helper to create order string
            const createOrderString = (itemsToProcess: typeof items) => {
                return itemsToProcess.map(item => {
                    let details = `${item.name} x${item.quantity} (${(item.price * item.quantity).toFixed(2)} DZD)`;
                    if (item.productUrl) details += `\nURL: ${item.productUrl}`;
                    if (item.notes) details += `\nNotes: ${item.notes}`;
                    if (item.referralCode) details += `\nReferral: ${item.referralCode}`;
                    return details;
                }).join('\n---\n');
            };

            // Helper to get contact details string
            const getContactString = () => {
                let contactDetails = `Phone: ${formData.phone}`;
                if (formData.useWhatsApp) contactDetails += `\nWhatsApp: ${formData.whatsappNumber}`;
                if (formData.useTelegram) contactDetails += `\nTelegram: ${formData.telegramUsername}`;
                return contactDetails;
            };

            const contactString = getContactString();
            const contactType = formData.useTelegram && !formData.useWhatsApp ? "telegram" : "whatsapp";
            const deliveryMethodStr = shippingInfo.deliveryType === 'desk' ? 'Stopdesk' : 'Home Delivery';
            const fullAddress = `${shippingInfo.address}, ${wilayaName} (${shippingInfo.wilayaCode}) - ${deliveryMethodStr}`;

            // Process Store Order
            if (storeItems.length > 0) {
                const storeSubtotal = storeItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                // Allocate Base Shipping to Store Order
                const storeShipping = shippingCosts;
                const storeTotal = storeSubtotal + storeShipping;

                const storeInternalNotes = `TYPE: Store Order\nItems:\n${createOrderString(storeItems)}\n\nUser Email: ${formData.email || 'N/A'}\nShipping Address: ${fullAddress}`;

                // Get referral code from first item that has one (assuming batch uses same code or first applies)
                const referralCode = storeItems.find(i => i.referralCode)?.referralCode || null;

                // Create JSON Note Structure
                const notesJson = {
                    internal: `CONTACT INFO:\n${contactString}\n\n${storeInternalNotes}`,
                    public: "", // Public note starts empty
                    order_type: "store",
                    items_metadata: storeItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        slug: item.slug || null // Store slug for clickable links
                    }))
                };

                const { data, error } = await supabase
                    .from('orders')
                    .insert({
                        name: formData.name,
                        contact_type: contactType as any,
                        contact_value: formData.phone,
                        product_url: `Store Order (${storeItems.length} items)`,
                        price: storeSubtotal,
                        shipping_price: storeShipping,
                        total: storeTotal,
                        status: 'new' as any,
                        notes: JSON.stringify(notesJson),
                        referral_code: referralCode,
                        exchange_rate: exchangeRate
                    })
                    .select()
                    .single();

                if (error) throw error;
                createdOrders.push({ type: 'Store', id: data.id, items: storeItems.map(i => i.name).join(', ') });

                // Email is now handled by Database Trigger (on_order_created_email)
            }

            // Process Custom Order
            if (customItems.length > 0) {
                const customSubtotal = customItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                // Refined Logic (same as before): If StoreItems existed, they took the shipping cost.
                const shippingApplied = storeItems.length > 0;
                const thisOrderShipping = shippingApplied ? 0 : shippingCosts;
                const customTotal = customSubtotal + thisOrderShipping;

                const customInternalNotes = `TYPE: Custom Request\nItems:\n${createOrderString(customItems)}\n\nUser Email: ${formData.email || 'N/A'}\nShipping Address: ${fullAddress}`;

                // Get referral code from first item that has one
                const referralCode = customItems.find(i => i.referralCode)?.referralCode || null;

                // Extract primary URL (first item's URL) to be the main order link
                const primaryUrl = customItems[0]?.productUrl || "";
                // Combine user notes
                const userNotes = customItems.map(i => i.notes).filter(Boolean).join('\n\n');

                // Create JSON Note Structure for Custom Order
                const notesJson = {
                    internal: `CONTACT INFO:\n${contactString}\n\n${customInternalNotes}`,
                    public: userNotes, // Store user notes in public field for easy access
                    order_type: "order",
                    items_metadata: customItems.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        product_url: item.productUrl
                    })),
                    // Also store URL in metadata root for email parser
                    product_url: primaryUrl
                };

                const { data, error } = await supabase
                    .from('orders')
                    .insert({
                        name: formData.name,
                        contact_type: contactType as any,
                        contact_value: formData.phone,
                        product_url: primaryUrl || `Custom Request (${customItems.length} items)`, // Use actual URL if available
                        price: customSubtotal,
                        shipping_price: thisOrderShipping,
                        total: customTotal,
                        status: 'new' as any,
                        notes: JSON.stringify(notesJson),
                        referral_code: referralCode,
                        exchange_rate: exchangeRate
                    })
                    .select()
                    .single();

                if (error) throw error;
                createdOrders.push({ type: 'Request', id: data.id, items: customItems.map(i => i.name).join(', ') });

                // Email is now handled by Database Trigger (on_order_created_email)
            }

            // Success Dialog Logic
            let title = t('cart.order_success_title');
            let description = t('cart.order_success_desc');

            if (createdOrders.length > 0) {
                const details = createdOrders.map(o => `${o.type} #${o.id}:\n${o.items}`).join('\n\n');
                description = details;
            }

            setSuccessDetails({ title, description });
            setIsOpen(false);
            setSuccessOpen(true);
            clearCart();
            // Reset form but keep shipping address as it's likely reusable
            setFormData({
                name: "",
                phone: "",
                email: "",
                useWhatsApp: false,
                useTelegram: false,
                whatsappNumber: "+213",
                telegramUsername: "@"
            });

        } catch (error: any) {
            console.error('Error placing order:', error);
            toast({
                title: t('cart.order_failed_title'),
                description: error.message || t('cart.order_failed_desc'),
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side={i18n.language === 'ar' ? 'left' : 'right'} className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        {t('cart.title')} ({itemCount})
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <ShoppingCart className="h-16 w-16 opacity-20" />
                        <p>{t('cart.empty')}</p>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            {t('cart.start_shopping')}
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-6 py-4">
                                {/* Items List */}
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0 border border-border/50">
                                                {item.productUrl ? (
                                                    <div className="h-full w-full flex items-center justify-center bg-white p-2">
                                                        <img
                                                            src="/logo/waseet_favicon_128.png"
                                                            alt="Waseet"
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                                                            {t('cart.no_img')}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                                                    <p className="text-sm font-medium text-primary">
                                                        {item.price.toFixed(2)} DZD
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                {/* Summary & Form Section */}
                                <div className="space-y-4">
                                    {/* Shipping Info Display - Only show if there are store items */}
                                    {hasStoreItems && (
                                        <div className="bg-muted/30 p-3 rounded-md text-sm space-y-1">
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {t('cart.shipping_to')}
                                                </span>
                                                <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setIsAddressModalOpen(true)}>
                                                    {t('cart.change')}
                                                </Button>
                                            </div>
                                            <div className="pl-5 text-muted-foreground">
                                                <p>{wilayaName || t('cart.select_wilaya')}</p>
                                                <p className="truncate line-clamp-1" title={shippingInfo.address}>{shippingInfo.address || t('cart.select_address')}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                                            <span>{cartTotal.toFixed(2)} DZD</span>
                                        </div>

                                        {/* Show separate shipping line if there is any shipping cost */}
                                        {shippingCosts > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    {hasStoreItems ? `${deliveryLabel} (${wilayaName})` : t('cart.shipping')}
                                                </span>
                                                <span>{shippingCosts.toFixed(2)} DZD</span>
                                            </div>
                                        )}
                                        <Separator className="my-2" />
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>{t('cart.total')}</span>
                                            <span>{finalTotal.toFixed(2)} DZD</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm">{t('cart.checkout_details')}</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs">{t('cart.name')}</Label>
                                            <Input
                                                id="name"
                                                placeholder={t('cart.name_placeholder')}
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mandatory-phone" className="text-xs">{t('cart.phone')}</Label>
                                            <Input
                                                id="mandatory-phone"
                                                placeholder={t('cart.phone_placeholder')}
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (!val.startsWith('+213')) val = '+213';
                                                    setFormData({ ...formData, phone: val });
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cart-email" className="text-xs">{t('cart.email')}</Label>
                                            <Input
                                                id="cart-email"
                                                type="email"
                                                placeholder={t('cart.email_placeholder')}
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="pt-2 space-y-3">
                                            <Label className="text-xs font-semibold">{t('cart.additional_contact')}</Label>
                                            <div className="flex flex-col gap-3">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="use-whatsapp"
                                                            checked={formData.useWhatsApp}
                                                            onCheckedChange={(checked) => setFormData({ ...formData, useWhatsApp: checked as boolean })}
                                                        />
                                                        <Label htmlFor="use-whatsapp" className="text-sm cursor-pointer">{t('cart.whatsapp')}</Label>
                                                    </div>
                                                    {formData.useWhatsApp && (
                                                        <Input
                                                            placeholder={t('cart.whatsapp_placeholder')}
                                                            value={formData.whatsappNumber}
                                                            onChange={(e) => {
                                                                let val = e.target.value;
                                                                if (!val.startsWith('+213')) val = '+213';
                                                                setFormData({ ...formData, whatsappNumber: val });
                                                            }}
                                                            className="h-8 text-sm"
                                                        />
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="use-telegram"
                                                            checked={formData.useTelegram}
                                                            onCheckedChange={(checked) => setFormData({ ...formData, useTelegram: checked as boolean })}
                                                        />
                                                        <Label htmlFor="use-telegram" className="text-sm cursor-pointer">{t('cart.telegram')}</Label>
                                                    </div>
                                                    {formData.useTelegram && (
                                                        <Input
                                                            placeholder={t('cart.telegram_placeholder')}
                                                            value={formData.telegramUsername}
                                                            onChange={(e) => {
                                                                let val = e.target.value;
                                                                if (!val.startsWith('@')) val = '@' + val.replace(/^@+/, '');
                                                                setFormData({ ...formData, telegramUsername: val });
                                                            }}
                                                            className="h-8 text-sm"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <SheetFooter className="pt-4 border-t">
                            <Button
                                className="w-full h-11 text-base gap-2"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {t('cart.processing')}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-5 w-5" />
                                        {t('cart.place_order')}
                                    </>
                                )}
                            </Button>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>

            <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                            {successDetails?.title}
                        </DialogTitle>
                        <DialogDescription className="pt-4 whitespace-pre-wrap font-medium text-foreground/90 leading-relaxed">
                            {successDetails?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/50 p-4 rounded-lg mt-2 mb-4 text-sm text-muted-foreground">
                        <p>{t('cart.contact_shortly')}</p>
                        <p className="mt-1">{t('cart.keep_ref')}</p>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full sm:w-auto"
                            onClick={() => setSuccessOpen(false)}
                        >
                            {t('cart.close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Sheet>
    );
}
