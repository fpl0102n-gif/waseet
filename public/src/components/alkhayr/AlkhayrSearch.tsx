import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next'; // Added import
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pill, MapPin, Calendar, Search, Filter, Phone, AlertTriangle, Globe, User, Facebook, Instagram, MessageCircle, X, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

const ALGERIAN_WILAYAS = [
    'Toutes',
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
    'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Menia'
];

interface StrictRequest {
    id: string; // UUID
    // --- ADMIN DISPLAY COLUMNS (V3) ---
    display_name: string;
    display_wilaya: string;
    display_area: string;
    display_summary: string;
    display_description: string;
    display_main_image: string;
    display_images: string[];
    display_is_urgent: boolean;

    category: 'local' | 'foreign';
    created_at: string;
    status: string;
}

const AlkhayrSearch = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<StrictRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<StrictRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<StrictRequest | null>(null);
    const [showContactDialog, setShowContactDialog] = useState(false);

    // Default Waseet Contacts (Fallbacks)
    const [contactSettings, setContactSettings] = useState({
        whatsapp: "213555555555",
        telegram: "waseet",
        facebook: "waseet",
        instagram: "waseet"
    });

    const [categoryFilter, setCategoryFilter] = useState('all');
    const [wilayaFilter, setWilayaFilter] = useState('Toutes');
    const [searchTerm, setSearchTerm] = useState('');
    const [lightboxState, setLightboxState] = useState<{ isOpen: boolean, images: string[], currentIndex: number }>({
        isOpen: false,
        images: [],
        currentIndex: 0
    });

    useEffect(() => {
        fetchRequests();
        fetchSettings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [categoryFilter, wilayaFilter, searchTerm, requests]);

    const fetchSettings = async () => {
        try {
            const { data } = await supabase.from('settings').select('*');
            if (data) {
                const newSettings: any = { ...contactSettings };
                data.forEach((item: any) => {
                    if (item.key === 'alkhayr_whatsapp') newSettings.whatsapp = item.value;
                    if (item.key === 'alkhayr_telegram') newSettings.telegram = item.value;
                    if (item.key === 'alkhayr_facebook') newSettings.facebook = item.value;
                    if (item.key === 'alkhayr_instagram') newSettings.instagram = item.value;
                });
                setContactSettings(newSettings);
            }
        } catch (e) {
            console.error("Error fetching settings", e);
        }
    };

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Unified Request
            const { data, error } = await supabase
                .from('medicine_requests')
                .select('*')
                .in('status', ['in_progress', 'accepted', 'handled', 'completed'])
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapToStrict = (item: any): StrictRequest => ({
                id: item.id,

                // STRICT MAPPING V3
                display_name: item.display_name,
                display_wilaya: item.display_wilaya,
                display_area: item.display_area,
                display_summary: item.display_summary,
                display_description: item.display_description,
                display_main_image: item.display_main_image,
                display_images: item.display_images || [],
                display_is_urgent: item.display_is_urgent || false,

                category: item.request_type as 'local' | 'foreign',
                status: item.status,
                created_at: item.created_at
            });

            let allRequests = (data || []).map(mapToStrict);

            // SAFETY FILTER: Remove items with no display name (meaning admin didn't curate them)
            allRequests = allRequests.filter(r => r.display_name && r.display_name.trim().length > 0);

            // Client-side Sort
            allRequests.sort((a, b) => {
                if (a.display_is_urgent !== b.display_is_urgent) return a.display_is_urgent ? -1 : 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            setRequests(allRequests);

        } catch (error) {
            console.error('Error fetching requests:', error);
            toast({ title: t('alkhayr_public.submit.errors.submit'), description: t('alkhayr_public.search_errors.fetch'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...requests];

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(r => r.category === categoryFilter);
        }

        if (wilayaFilter !== 'Toutes') {
            filtered = filtered.filter(r => r.display_wilaya && r.display_wilaya.includes(wilayaFilter));
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.display_name?.toLowerCase().includes(term) ||
                r.display_summary?.toLowerCase().includes(term) ||
                r.display_description?.toLowerCase().includes(term)
            );
        }

        setFilteredRequests(filtered);
    };

    const handleOpenContact = () => setShowContactDialog(true);

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return t('alkhayr_public.details.relative_time.today');
        if (diffDays === 1) return t('alkhayr_public.details.relative_time.yesterday');
        return t('alkhayr_public.details.relative_time.days_ago', { days: diffDays });
    };

    return (
        <div className="space-y-8">
            {/* Filters Section */}
            <Card className="border border-green-100 shadow-sm bg-white">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-green-50 p-2 rounded-lg">
                            <Filter className="h-5 w-5 text-[#2E7D32]" />
                        </div>
                        <h3 className="font-bold text-lg text-[#1F2933]">{t('alkhayr_public.filter.title')}</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label>{t('alkhayr_public.filter.type')}</Label>
                            <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                                <TabsList className="w-full bg-green-50 border border-green-100">
                                    <TabsTrigger value="all" className="flex-1 data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white">{t('alkhayr_public.filter.all')}</TabsTrigger>
                                    <TabsTrigger value="local" className="flex-1 data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white">{t('alkhayr_public.filter.local')}</TabsTrigger>
                                    <TabsTrigger value="foreign" className="flex-1 data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white">{t('alkhayr_public.filter.foreign')}</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('alkhayr_public.filter.wilaya')}</Label>
                            <Select value={wilayaFilter} onValueChange={setWilayaFilter} disabled={categoryFilter === 'foreign'}>
                                <SelectTrigger className="border-green-100 focus:ring-[#2E7D32] h-11"><SelectValue /></SelectTrigger>
                                <SelectContent className="max-h-[300px]">{ALGERIAN_WILAYAS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('alkhayr_public.filter.search')}</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder={t('alkhayr_public.filter.placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 border-green-100 focus-visible:ring-[#2E7D32]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-green-50 pt-4">
                        <p className="text-sm font-medium text-gray-500">
                            {filteredRequests.length} {t('alkhayr_public.filter.results')}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#2E7D32] hover:bg-green-50"
                            onClick={() => {
                                setCategoryFilter('all');
                                setWilayaFilter('Toutes');
                                setSearchTerm('');
                            }}
                        >
                            {t('alkhayr_public.filter.reset')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* CONTACT DIALOG (Strictly Waseet) */}
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent className="sm:max-w-md w-[95%] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            {t('alkhayr_public.contact_dialog.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('alkhayr_public.contact_dialog.desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4 grid-cols-2">
                        {contactSettings.whatsapp && (
                            <Button variant="outline" className="w-full flex flex-col items-center justify-center gap-2 h-auto py-4 text-sm hover:bg-green-50 hover:border-green-200" onClick={() => window.open(`https://wa.me/${contactSettings.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')}>
                                <div className="bg-green-100 p-2 rounded-full"><MessageCircle className="h-5 w-5 text-green-600" /></div>
                                <span className="font-semibold text-gray-700">{t('alkhayr_public.contact_dialog.whatsapp')}</span>
                            </Button>
                        )}
                        {contactSettings.facebook && (
                            <Button variant="outline" className="w-full flex flex-col items-center justify-center gap-2 h-auto py-4 text-sm hover:bg-blue-50 hover:border-blue-200" onClick={() => window.open(`https://facebook.com/${contactSettings.facebook}`, '_blank')}>
                                <div className="bg-blue-100 p-2 rounded-full"><Facebook className="h-5 w-5 text-blue-600" /></div>
                                <span className="font-semibold text-gray-700">{t('alkhayr_public.contact_dialog.facebook')}</span>
                            </Button>
                        )}
                        {contactSettings.instagram && (
                            <Button variant="outline" className="w-full flex flex-col items-center justify-center gap-2 h-auto py-4 text-sm hover:bg-pink-50 hover:border-pink-200" onClick={() => window.open(`https://instagram.com/${contactSettings.instagram}`, '_blank')}>
                                <div className="bg-pink-100 p-2 rounded-full"><Instagram className="h-5 w-5 text-pink-600" /></div>
                                <span className="font-semibold text-gray-700">{t('alkhayr_public.contact_dialog.instagram')}</span>
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>


            {/* DETAILS DIALOG (Full Admin Content) */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-xl">
                    {selectedRequest && (
                        <div className="flex flex-col bg-white">
                            {/* Header Image */}
                            <div className="relative h-48 sm:h-64 w-full bg-gray-100">
                                {selectedRequest.display_main_image ? (
                                    <img src={selectedRequest.display_main_image} className="w-full h-full object-contain bg-black/5" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-200">
                                        <Pill className="w-20 h-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <Badge className={selectedRequest.category === 'local' ? 'bg-green-600' : 'bg-blue-600'}>
                                        {selectedRequest.category === 'local' ? t('alkhayr_public.card.local') : t('alkhayr_public.card.foreign')}
                                    </Badge>
                                </div>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 md:p-8 space-y-6">
                                {/* Title & Meta */}
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {selectedRequest.display_is_urgent && (
                                            <Badge variant="destructive" className="flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {t('alkhayr_public.details.urgent')}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-gray-500 border-gray-200">
                                            <Calendar className="w-3 h-3 mr-1" /> {getRelativeTime(selectedRequest.created_at)}
                                        </Badge>
                                        <Badge variant="outline" className="text-gray-500 border-gray-200">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {selectedRequest.display_wilaya} {selectedRequest.display_area && `- ${selectedRequest.display_area}`}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                        {selectedRequest.display_name}
                                    </h2>
                                </div>

                                {/* Full Description */}
                                <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                    {selectedRequest.display_description || <span className="text-gray-400 italic">{t('alkhayr_public.details.no_description')}</span>}
                                </div>

                                {/* Gallery */}
                                {selectedRequest.display_images && selectedRequest.display_images.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <h3 className="font-bold text-gray-900">{t('alkhayr_public.details.photos_title')}</h3>
                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                            {selectedRequest.display_images.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity"
                                                    onClick={() => setLightboxState({
                                                        isOpen: true,
                                                        images: [selectedRequest.display_main_image, ...selectedRequest.display_images].filter(Boolean),
                                                        currentIndex: idx + 1 // +1 because main image is 0
                                                    })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Call to Action */}
                                <div className="pt-6 mt-4 border-t border-gray-100">
                                    <Button
                                        size="lg"
                                        className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white shadow-lg text-lg h-14"
                                        onClick={handleOpenContact}
                                    >
                                        <Phone className="w-5 h-5 mr-2" />
                                        {t('alkhayr_public.details.contact_button')}
                                    </Button>
                                    <p className="text-center text-xs text-gray-400 mt-3">
                                        {t('alkhayr_public.details.ref')}: #{selectedRequest.id.slice(0, 8)} • {t('alkhayr_public.details.managed_by')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Results List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{t('alkhayr_public.empty.title')}</h3>
                    <p className="text-gray-500 text-sm mt-1">{t('alkhayr_public.empty.desc')}</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRequests.map(req => (
                        <Card
                            key={req.id}
                            onClick={() => setSelectedRequest(req)}
                            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-none shadow-md overflow-hidden bg-white flex flex-col h-full transform hover:-translate-y-1"
                        >
                            {/* Card Image */}
                            <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                                {req.display_main_image ? (
                                    <img
                                        src={req.display_main_image}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 bg-black/5"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                        <Pill className="w-12 h-12" />
                                    </div>
                                )}

                                {req.display_is_urgent && (
                                    <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold uppercase py-1 px-3 flex items-center gap-1 justify-center tracking-widest">
                                        <AlertTriangle className="w-3 h-3" /> {t('alkhayr_public.card.urgent')}
                                    </div>
                                )}

                                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                                    <Badge className={`${req.category === 'local' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white border-none shadow-sm`}>
                                        {req.category === 'local' ? t('alkhayr_public.card.local') : t('alkhayr_public.card.foreign')}
                                    </Badge>
                                </div>
                            </div>

                            <CardContent className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                                    {req.display_name}
                                </h3>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                    {req.display_summary}
                                </p>

                                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate max-w-[120px]">
                                            {req.display_wilaya}
                                            {req.display_area && `, ${req.display_area}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{getRelativeTime(req.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Lightbox Overlay */}
            {lightboxState.isOpen && createPortal(
                <div className="fixed inset-0 z-[5000] bg-black/95 flex items-center justify-center p-4">
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-[5001]"
                        onClick={() => setLightboxState({ ...lightboxState, isOpen: false })}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center">
                        {lightboxState.images.length > 1 && (
                            <button
                                className="absolute left-4 z-[5001] bg-black/50 p-2 rounded-full text-white hover:bg-black/80"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const next = (lightboxState.currentIndex - 1 + lightboxState.images.length) % lightboxState.images.length;
                                    setLightboxState({ ...lightboxState, currentIndex: next });
                                }}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                        )}

                        <img
                            src={lightboxState.images[lightboxState.currentIndex]}
                            className="max-h-full max-w-full object-contain select-none shadow-2xl"
                        />

                        {lightboxState.images.length > 1 && (
                            <button
                                className="absolute right-4 z-[5001] bg-black/50 p-2 rounded-full text-white hover:bg-black/80"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const next = (lightboxState.currentIndex + 1) % lightboxState.images.length;
                                    setLightboxState({ ...lightboxState, currentIndex: next });
                                }}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        )}

                        <div className="absolute bottom-4 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                            {lightboxState.currentIndex + 1} / {lightboxState.images.length}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AlkhayrSearch;
