import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Car, MapPin, Phone, MessageCircle, Send, ShieldCheck, Map } from 'lucide-react';

const TransportVolunteerList = () => {
    const { t } = useTranslation();
    const [volunteers, setVolunteers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showContactDialog, setShowContactDialog] = useState(false);

    // Default Waseet Contacts (Should be fetched from settings ideally)
    const [waseetContact, setWaseetContact] = useState({
        whatsapp: "213555555555",
        facebook: "waseet",
        instagram: "waseet"
    });

    useEffect(() => {
        fetchVolunteers();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        // Try to fetch settings, fallback to defaults
        const { data } = await supabase.from('settings').select('*');
        if (data && data.length > 0) {
            const newSettings: any = { ...waseetContact };
            data.forEach((s: any) => {
                if (s.key === 'alkhayr_whatsapp') newSettings.whatsapp = s.value;
                if (s.key === 'alkhayr_facebook') newSettings.facebook = s.value;
                if (s.key === 'alkhayr_instagram') newSettings.instagram = s.value;
            });
            setWaseetContact(newSettings);
        }
    };

    const fetchVolunteers = async () => {
        setLoading(true);
        // Only fetch public columns if possible or filter on client
        // Selecting * but display logic strictly hides private data
        // Only fetch strictly vetted columns for public display
        const { data, error } = await supabase
            .from('active_transport_volunteers_view')
            .select('id, display_initials, display_location, display_description, is_available')
            .eq('status', 'active')
            .neq('display_initials', null) // Ensure only curated profiles show
            .order('created_at', { ascending: false });

        if (!error && data) {
            setVolunteers(data);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Car className="text-[#E53935]" />
                {t('blood.transport.available_count', { count: volunteers.length })}
            </h3>

            {loading ? (
                <div className="text-center py-8">{t('blood.transport.loading')}</div>
            ) : volunteers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    {t('blood.transport.empty')}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {volunteers.map(v => (
                        <Card key={v.id} className="border-l-4 border-l-[#E53935] shadow-sm hover:shadow-md transition bg-white">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#E53935] font-bold text-lg">
                                            {v.display_initials}
                                        </div>
                                        <div>
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                {t('blood.transport.volunteer_badge')}
                                            </Badge>
                                        </div>
                                    </div>
                                    {v.is_available && <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Disponible"></span>}
                                </div>

                                <div className="mb-4 pl-1">
                                    <div className="flex items-center gap-2 text-gray-700 font-medium mb-1">
                                        <MapPin className="w-4 h-4 text-red-400" />
                                        {v.display_location}
                                    </div>
                                    <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-2">
                                        "{v.display_description || t('blood.transport.default_desc')}"
                                    </p>
                                </div>

                                <Button
                                    className="w-full bg-white border border-[#E53935] text-[#E53935] hover:bg-red-50 gap-2 h-11"
                                    onClick={() => setShowContactDialog(true)}
                                >
                                    <Phone className="w-4 h-4" />
                                    {t('blood.transport.contact_btn')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Contact Dialog - Always Waseet */}
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent className="w-[95%] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#E53935]">
                            <ShieldCheck className="w-5 h-5" />
                            {t('blood.transport.dialog.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('blood.transport.dialog.desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4 grid-cols-2">
                        <Button variant="outline" className="w-full flex flex-col items-center justify-center gap-2 h-auto py-4 text-sm hover:bg-green-50 hover:border-green-200" onClick={() => window.open(`https://wa.me/${waseetContact.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')}>
                            <div className="bg-green-100 p-2 rounded-full"><MessageCircle className="text-green-600 w-5 h-5" /></div>
                            <span className="font-semibold text-gray-700">{t('blood.transport.dialog.whatsapp')}</span>
                        </Button>
                        <Button variant="outline" className="w-full flex flex-col items-center justify-center gap-2 h-auto py-4 text-sm hover:bg-blue-50 hover:border-blue-200" onClick={() => window.open(`https://facebook.com/${waseetContact.facebook}`, '_blank')}>
                            <div className="bg-blue-100 p-2 rounded-full"><Car className="text-blue-600 w-5 h-5" /></div>
                            <span className="font-semibold text-gray-700">{t('blood.transport.dialog.facebook')}</span>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TransportVolunteerList;
