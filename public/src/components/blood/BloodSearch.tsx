import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Droplet, Phone, MapPin, Calendar, Search, Filter, AlertCircle } from 'lucide-react';

const BLOOD_TYPES = ['Tous', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ALGERIAN_WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
    'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Menia'
];

interface Donor {
    id: number;
    full_name: string;
    phone_number: string;
    blood_type: string;
    wilaya: string;
    city: string;
    last_donation_date: string | null;
    willing_to_be_contacted: boolean;
    contact_app?: 'whatsapp' | 'telegram' | 'aucun';
    whatsapp_number?: string | null;
    telegram_username?: string | null;
}

const BloodSearch = () => {
    const { toast } = useToast();

    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [donors, setDonors] = useState<Donor[]>([]);
    const [filteredDonors, setFilteredDonors] = useState<Donor[]>([]);

    const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
    const [wilayaFilter, setWilayaFilter] = useState('all');
    const [searchName, setSearchName] = useState('');

    useEffect(() => {
        fetchDonors();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [bloodTypeFilter, wilayaFilter, searchName, donors]);

    const fetchDonors = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blood_donors')
                .select('id, full_name, phone_number, blood_type, wilaya, city, last_donation_date, willing_to_be_contacted, contact_app, whatsapp_number, telegram_username')
                .eq('is_active', true)
                .eq('can_share_info', true)
                .eq('approved_by_admin', true)
                .order('last_donation_date', { ascending: false, nullsFirst: false });

            if (error) throw error;
            setDonors(data || []);
        } catch (error) {
            console.error('Error fetching donors:', error);
            toast({
                title: t('alkhayr_public.details.error'),
                description: t('blood.search.error_fetch'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...donors];

        if (bloodTypeFilter !== 'all') {
            filtered = filtered.filter(d => d.blood_type === bloodTypeFilter);
        }

        if (wilayaFilter !== 'all') {
            filtered = filtered.filter(d => d.wilaya === wilayaFilter);
        }

        if (searchName.trim()) {
            filtered = filtered.filter(d =>
                d.full_name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredDonors(filtered);
    };

    const handleContactDonor = (phone: string) => window.open(`tel:${phone}`);

    const handleContactWhatsApp = (number: string) => {
        const whatsappUrl = `https://wa.me/${number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Bonjour, je vous contacte via Waseet Don de Sang concernant un besoin urgent.')}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleContactTelegram = (username: string) => {
        window.open(`https://t.me/${username.replace(/^@/, '')}`, '_blank');
    };

    const getDaysSinceLastDonation = (lastDonationDate: string | null): string => {
        if (!lastDonationDate) return t('blood.search.never_donated');
        const lastDate = new Date(lastDonationDate);
        const today = new Date();
        const diffDays = Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 30) return t('blood.search.days_ago', { count: diffDays });
        if (diffDays < 365) return t('blood.search.months_ago', { count: Math.floor(diffDays / 30) });
        return t('blood.search.years_ago', { count: Math.floor(diffDays / 365) });
    };

    return (
        <div className="space-y-8">
            {/* Filters Section */}
            <Card className="border border-red-100 shadow-md overflow-hidden bg-white">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-red-50 p-2 rounded-lg">
                            <Filter className="h-5 w-5 text-[#C62828]" />
                        </div>
                        <h3 className="font-bold text-lg text-[#1F2933]">{t('blood.search.title')}</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>{t('blood.search.filter_blood')}</Label>
                            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                                <SelectTrigger className="border-red-100 focus:ring-[#C62828] h-11"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('alkhayr_public.filter.all')}</SelectItem>
                                    {BLOOD_TYPES.slice(1).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('blood.search.filter_wilaya')}</Label>
                            <Select value={wilayaFilter} onValueChange={setWilayaFilter}>
                                <SelectTrigger className="border-red-100 focus:ring-[#C62828] h-11"><SelectValue /></SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="all">{t('alkhayr_public.filter.all')}</SelectItem>
                                    {ALGERIAN_WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('blood.search.filter_name')}</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('blood.search.placeholder_name')}
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    className="pl-9 border-red-100 focus-visible:ring-[#C62828]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-red-50 pt-4">
                        <p className="text-sm font-medium text-[#374151]">
                            {t('blood.search.results_count', { count: filteredDonors.length })}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#C62828] hover:text-[#8E0000] hover:bg-red-50"
                            onClick={() => {
                                setBloodTypeFilter('all');
                                setWilayaFilter('all');
                                setSearchName('');
                            }}
                        >
                            {t('blood.search.reset')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="text-center py-20 bg-white/50 rounded-xl backdrop-blur-sm border border-red-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">{t('blood.search.loading')}</p>
                </div>
            ) : filteredDonors.length === 0 ? (
                <div className="text-center py-20 bg-white/50 rounded-xl backdrop-blur-sm border border-red-50">
                    <Droplet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#1F2933] mb-2">{t('blood.search.empty_title')}</h3>
                    <p className="text-[#374151]">{t('blood.search.empty_desc')}</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDonors.map((donor) => (
                        <Card key={donor.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white overflow-hidden group">
                            <div className="h-2 bg-[#C62828]"></div>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg text-[#1F2933] group-hover:text-[#C62828] transition-colors">
                                                {donor.full_name}
                                            </h3>
                                            <p className="text-sm text-[#374151] flex items-center gap-1 mt-1">
                                                <MapPin className="h-3 w-3" />
                                                {donor.city}, {donor.wilaya}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-xs font-bold text-[#374151] mb-1">{t('blood.search.filter_blood')}</span>
                                            <Badge className="text-lg font-bold bg-white text-[#C62828] border-2 border-[#C62828] shadow-sm px-3 py-1">
                                                {donor.blood_type}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-[#1F2933] bg-gray-50 p-2 rounded-md">
                                        <Calendar className="h-4 w-4 text-[#C62828]" />
                                        <span>{t('blood.search.last_donation', { time: getDaysSinceLastDonation(donor.last_donation_date) })}</span>
                                    </div>

                                    {donor.willing_to_be_contacted && (
                                        <Badge variant="secondary" className="w-full justify-center bg-green-50 text-green-700 border border-green-200 py-1.5 font-medium">
                                            {t('blood.search.urgent_badge')}
                                        </Badge>
                                    )}

                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        <Button
                                            className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
                                            onClick={() => handleContactDonor(donor.phone_number)}
                                        >
                                            <Phone className="h-4 w-4 mr-2" />
                                            {t('blood.search.call')}
                                        </Button>

                                        <div className="grid grid-cols-2 gap-2">
                                            {donor.contact_app === 'whatsapp' && donor.whatsapp_number && (
                                                <Button
                                                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-11"
                                                    onClick={() => handleContactWhatsApp(donor.whatsapp_number!)}
                                                >
                                                    WhatsApp
                                                </Button>
                                            )}
                                            {donor.contact_app === 'telegram' && donor.telegram_username && (
                                                <Button
                                                    className="w-full bg-[#229ED9] hover:bg-[#1976D2] text-white h-11"
                                                    onClick={() => handleContactTelegram(donor.telegram_username!)}
                                                >
                                                    Telegram
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="bg-[#FDECEA] border border-[#ffcdd2] rounded-lg p-4 flex items-start gap-3 mt-8">
                <AlertCircle className="h-5 w-5 text-[#C62828] mt-0.5" />
                <div>
                    <h4 className="font-bold text-[#8E0000] text-sm">{t('blood.search.note_title')}</h4>
                    <p className="text-sm text-[#1F2933] mt-1">
                        {t('blood.search.note_desc')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BloodSearch;
