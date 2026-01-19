import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const SocialPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const location = useLocation();

    const [settings, setSettings] = useState({
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        telegram: "https://t.me",
        tiktok: "https://tiktok.com",
        whatsapp: "https://wa.me/"
    });

    useEffect(() => {
        fetchSettings();

        // Check if seen in last 24 hours
        const lastSeen = localStorage.getItem('social_popup_timestamp');
        const now = Date.now();

        if (!lastSeen || (now - parseInt(lastSeen)) > 24 * 60 * 60 * 1000) {
            setIsOpen(true);
            setMounted(true);
        }
    }, [location.pathname]);

    const fetchSettings = async () => {
        try {
            const { data } = await supabase.from('settings').select('*');
            if (data) {
                const newSettings: any = { ...settings };
                data.forEach((item: any) => {
                    if (item.key === 'popup_facebook') newSettings.facebook = item.value;
                    if (item.key === 'popup_instagram') newSettings.instagram = item.value;
                    if (item.key === 'popup_telegram') newSettings.telegram = item.value;
                    if (item.key === 'popup_tiktok') newSettings.tiktok = item.value;
                    if (item.key === 'popup_whatsapp') newSettings.whatsapp = item.value;
                });
                setSettings(newSettings);
            }
        } catch (e) {
            console.error("Error fetching popup settings", e);
        }
    };

    const close = () => {
        setIsOpen(false);
        localStorage.setItem('social_popup_timestamp', Date.now().toString());
        setTimeout(() => setMounted(false), 300); // Wait for animation
    };

    if (!mounted) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            onClick={close}
        >
            <Card
                className={`w-[90%] max-w-[400px] border-none shadow-2xl bg-background text-center relative overflow-hidden transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute top-2 right-2 z-10">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={close}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                <CardContent className="p-8 flex flex-col gap-6">
                    <div className="space-y-2">
                        <h3 className="font-bold text-xl">Stay connected with us</h3>
                        <p className="text-sm text-muted-foreground">Follow us for updates, announcements, and important news.</p>
                    </div>

                    <div className="space-y-3">
                        <a
                            href={settings.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg bg-[#1877F2] text-white hover:bg-[#1877F2]/90 transition-colors text-sm font-medium"
                            onClick={close}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.797 1.603-2.797 4.16v1.972h4.568l-.599 3.667h-3.969v7.98h-5.028Z" /></svg>
                            Facebook
                        </a>
                        <a
                            href={settings.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white hover:opacity-90 transition-opacity text-sm font-medium"
                            onClick={close}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" /></svg>
                            Instagram
                        </a>
                        <a
                            href={settings.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg bg-[#229ED9] text-white hover:bg-[#229ED9]/90 transition-colors text-sm font-medium"
                            onClick={close}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0Zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z" /></svg>
                            Telegram
                        </a>
                        <a
                            href={settings.tiktok}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg bg-black text-white hover:bg-black/90 transition-colors text-sm font-medium"
                            onClick={close}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104Z" /></svg>
                            TikTok
                        </a>
                        <a
                            href={settings.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 w-full h-11 rounded-lg bg-[#25D366] text-white hover:bg-[#25D366]/90 transition-colors text-sm font-medium"
                            onClick={close}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                            WhatsApp
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SocialPopup;
