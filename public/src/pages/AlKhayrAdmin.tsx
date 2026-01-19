import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Eye, Save, X, Check, Clock, AlertTriangle, FileText,
    Image as ImageIcon, Phone, MapPin, User, ShieldAlert,
    Globe, MessageCircle, Upload, Trash, Layout, Truck
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Interface matching the Unified Schema
interface AlKhayrRequestStrict {
    id: string; // UUID
    legacy_id?: number; // For display
    created_at: string;
    table_name: 'medicine_requests'; // Unified
    origin: 'local' | 'foreign';

    // --- RAW USER DATA (READ ONLY - INTERNAL) ---
    requester_name: string;
    contact_phone: string;
    email?: string;
    whatsapp?: string;
    telegram?: string;

    user_wilaya_raw: string;
    user_city_raw: string;
    user_country_raw?: string; // Foreign Target Country

    medicine_name_raw: string;
    description_raw: string;
    user_urgency_raw: boolean;
    user_proof_url: string; // Legacy/Fallback
    all_detail_images: string[];
    all_prescription_images: string[];

    // Extra Raw Data
    contact_type_raw?: string;
    address_raw?: string;
    disease_name_raw?: string;
    raw_detail_images?: any;
    raw_prescription_images?: any;

    // Financial (Internal)
    financial_ability?: string;
    afford_amount?: number;
    family_status?: string;
    monthly_income?: number;

    need_delivery?: boolean;
    user_priority?: string;

    // Admin Fields
    admin_notes?: string;

    // --- ADMIN DISPLAY DATA (PUBLIC - EDITABLE) ---
    status: 'pending' | 'accepted' | 'rejected' | 'handled' | 'approved' | 'cancelled' | 'in_progress' | 'completed';

    display_name: string;        // Public Name
    display_wilaya: string;      // Public Wilaya
    display_area: string;        // Public Area/City
    display_summary: string;     // Public Card Description
    display_description: string; // Public Detail Description

    display_main_image: string;
    display_images: string[];
    display_is_urgent: boolean;  // Admin override
}

const AlKhayrAdmin = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<AlKhayrRequestStrict[]>([]);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [editRequest, setEditRequest] = useState<AlKhayrRequestStrict | null>(null);
    const [uploading, setUploading] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        pending: 0,
        accepted: 0,
        total: 0
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Unified Selection
            const { data, error } = await supabase
                .from('medicine_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map raw DB rows to our Strict Interface
            const mapRow = (row: any): AlKhayrRequestStrict => ({
                id: row.id,
                legacy_id: row.legacy_id,
                created_at: row.created_at,
                table_name: 'medicine_requests',
                origin: row.request_type as 'local' | 'foreign',

                // Raw Data Mapping
                requester_name: row.full_name || 'Inconnu',
                contact_phone: row.phone_number || row.contact_value || '', // V2 schema standardized to phone_number
                email: row.email,

                // Contact types: Check explicit columns first, then fallback to parsing admin_notes (Legacy Support)
                whatsapp: row.whatsapp || (row.admin_notes?.match(/WhatsApp:\s*([^\n]+)/)?.[1]?.trim()),
                telegram: row.telegram || (row.admin_notes?.match(/Telegram:\s*([^\n]+)/)?.[1]?.trim()),

                user_wilaya_raw: row.wilaya || '',
                user_city_raw: row.city || '',
                user_country_raw: row.expected_country, // Map Foreign Country
                address_raw: row.address, // Might be missing in new schema
                contact_type_raw: row.contact_type, // Legacy

                medicine_name_raw: row.medicine_name || row.title || 'Sans titre',
                disease_name_raw: row.disease_name, // Legacy
                description_raw: row.description || row.medicine_details || '',
                user_urgency_raw: row.is_urgent === true,
                user_proof_url: row.prescription_url || row.main_image_url || '',

                // Debug: Raw Images from DB
                raw_detail_images: row.detail_images,
                raw_prescription_images: row.prescription_images,

                // Images: Handle both array (Postgres) and JSON string (if coming from legacy view)
                // Also parse single image fallback.
                all_detail_images: (() => {
                    const raw = row.detail_images || [];
                    const imgs = Array.isArray(raw) ? raw : (typeof raw === 'string' ? JSON.parse(raw) : []);

                    // Fallback for Local Requests: prescription_url holds the Item Image
                    if (imgs.length === 0 && row.request_type === 'local' && row.prescription_url) {
                        return [row.prescription_url];
                    }
                    // Fallback legacy name
                    if (imgs.length === 0 && row.main_image_url) return [row.main_image_url];

                    return imgs;
                })(),

                all_prescription_images: (() => {
                    const raw = row.prescription_images || [];
                    const imgs = Array.isArray(raw) ? raw : (typeof raw === 'string' ? JSON.parse(raw) : []);

                    // Fallback for Foreign Requests: prescription_url holds the Prescription
                    if (imgs.length === 0 && row.request_type === 'foreign' && row.prescription_url) {
                        return [row.prescription_url];
                    }
                    return imgs;
                })(),

                financial_ability: row.financial_ability,
                afford_amount: row.afford_amount || row.offered_amount || row.budget,
                family_status: row.family_status,
                monthly_income: row.monthly_income,
                need_delivery: row.need_delivery === 'true' || row.need_delivery === true || row.need_delivery === 'paid' || row.need_delivery === 'free',
                user_priority: row.urgency || row.user_priority, // urgency vs user_priority

                // Admin Data Mapping (V3 Columns)
                status: row.status || 'pending',
                admin_notes: row.admin_notes || '',

                display_name: row.display_name || '',
                display_wilaya: row.display_wilaya || '',
                display_area: row.display_area || '',
                display_summary: row.display_summary || '',
                display_description: row.display_description || '',

                display_main_image: row.display_main_image || '',
                display_images: Array.isArray(row.display_images) ? row.display_images : [],
                display_is_urgent: row.display_is_urgent || false
            });

            const all = (data || []).map(mapRow);

            setRequests(all);

            // Update Stats
            setStats({
                pending: all.filter(r => r.status === 'pending').length,
                accepted: all.filter(r => ['accepted', 'in_progress', 'completed', 'handled'].includes(r.status)).length,
                total: all.length
            });

        } catch (error) {
            console.error('Error fetching:', error);
            toast({ title: 'Erreur', description: 'Impossible de charger les demandes', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
            const { error, data } = await supabase.storage.from('medicine-images').upload(fileName, file);
            if (error) throw error;
            const { data: publicUrl } = supabase.storage.from('medicine-images').getPublicUrl(fileName);
            return publicUrl.publicUrl;
        } catch (error: any) {
            toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
            return null;
        }
    };

    const handleSave = async (reqToSave = editRequest) => {
        if (!reqToSave) return;

        try {
            // Validation Logic
            const isPublicStatus = ['accepted', 'in_progress', 'handled', 'completed'].includes(reqToSave.status);

            if (isPublicStatus) {
                if (!reqToSave.display_name || !reqToSave.display_summary || !reqToSave.display_main_image) {
                    toast({
                        title: 'Validation Échouée',
                        description: 'Pour rendre public, vous devez remplir: Titre Public, Résumé, et Image Principale.',
                        variant: 'destructive'
                    });
                    return;
                }
            }

            // Direct Update to medicine_requests
            const payload = {
                status: reqToSave.status,
                display_name: reqToSave.display_name,
                display_wilaya: reqToSave.display_wilaya,
                display_area: reqToSave.display_area,
                display_summary: reqToSave.display_summary,
                display_description: reqToSave.display_description,
                display_main_image: reqToSave.display_main_image,
                display_images: reqToSave.display_images,
                display_is_urgent: reqToSave.display_is_urgent,
                admin_notes: reqToSave.admin_notes
            };

            const { error } = await supabase
                .from('medicine_requests')
                .update(payload)
                .eq('id', reqToSave.id);

            if (error) throw error;

            toast({ title: 'Succès', description: 'Demande mise à jour avec succès.' });
            setEditRequest(null);
            fetchRequests();

        } catch (error) {
            console.error('Update Error:', error);
            toast({ title: 'Erreur', description: 'Échec de la mise à jour.', variant: 'destructive' });
        }
    };

    const filteredRequests = requests.filter(r =>
        filterStatus === 'all' ? true :
            filterStatus === 'active' ? ['accepted', 'in_progress', 'handled'].includes(r.status) :
                r.status === filterStatus
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted':
            case 'in_progress': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'handled':
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t('admin_alkhayr.title')}</h1>
                    <p className="text-gray-500">{t('admin_alkhayr.subtitle')}</p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <Card className="bg-white border-l-4 border-yellow-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <div className="text-sm text-gray-500">{t('admin_alkhayr.stats.pending')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-green-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.accepted}</div>
                            <div className="text-sm text-gray-500">{t('admin_alkhayr.stats.online')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-l-4 border-blue-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-sm text-gray-500">{t('admin_alkhayr.stats.total')}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="bg-white p-2 rounded-lg border inline-block mb-4">
                    <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                        <TabsList className="bg-transparent">
                            <TabsTrigger value="pending">{t('admin_alkhayr.tabs.pending')}</TabsTrigger>
                            <TabsTrigger value="active">{t('admin_alkhayr.tabs.online')}</TabsTrigger>
                            <TabsTrigger value="handled">{t('admin_alkhayr.tabs.handled')}</TabsTrigger>
                            <TabsTrigger value="rejected">{t('admin_alkhayr.tabs.rejected')}</TabsTrigger>
                            <TabsTrigger value="all">{t('admin_alkhayr.tabs.all')}</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRequests.map(req => (
                        <Card
                            key={req.id}
                            className={`cursor-pointer hover:shadow-lg transition-all border-l-4 ${req.status === 'pending' ? 'border-l-yellow-400' : 'border-l-green-400'}`}
                            onClick={() => setEditRequest(req)}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline">#{req.legacy_id || req.id.slice(0, 8)}</Badge>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </div>
                                {/* Show ADMIN title if present, else placeholder */}
                                <h3 className={`font-bold text-lg mb-1 ${req.display_name ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                    {req.display_name || t('admin_alkhayr.card.untitled')}
                                </h3>
                                {/* Show ADMIN Summary if present, else Raw data faded */}
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {req.display_summary || <span className="italic opacity-50">{t('admin_alkhayr.card.raw', { val: req.medicine_name_raw })}</span>}
                                </p>

                                <div className="text-xs text-gray-400 flex items-center gap-1 mt-2">
                                    <Clock className="w-3 h-3" /> {new Date(req.created_at).toLocaleDateString()}
                                    {req.origin === 'foreign' && <Badge variant="secondary" className="ml-auto text-xs">{t('alkhayr_public.card.foreign')}</Badge>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* --- EDIT MODAL (THE COCKPIT - V3) --- */}
                <Dialog open={!!editRequest} onOpenChange={(open) => !open && setEditRequest(null)}>
                    <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden bg-gray-50">
                        {editRequest && (
                            <>
                                <DialogHeader className="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
                                    <div className="flex justify-between items-center">
                                        <DialogTitle className="flex items-center gap-2">
                                            <ShieldAlert className="w-5 h-5 text-blue-600" />
                                            {t('admin_alkhayr.modal.title', { id: editRequest.id })}
                                        </DialogTitle>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" onClick={() => setEditRequest(null)}><X className="w-5 h-5" /></Button>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <div className="flex-1 flex overflow-hidden">

                                    {/* --- LEFT PANEL: REMOTE / RAW / INTERNAL (READ ONLY) --- */}
                                    <div className="w-[350px] bg-gray-100 border-r border-gray-200 overflow-y-auto p-6 scrollbar-thin flex-shrink-0">
                                        <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-4 flex items-center gap-1">
                                            <FileText className="w-4 h-4" /> {t('admin_alkhayr.modal.section_raw')}
                                        </h3>

                                        <div className="space-y-6">
                                            {/* Identity */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <Label className="text-xs text-gray-400">{t('admin_alkhayr.modal.requester')}</Label>
                                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" /> {editRequest.requester_name}
                                                </div>
                                                <div className="mt-2 text-sm text-gray-600 flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 select-all">
                                                        <Phone className="w-3 h-3" /> {editRequest.contact_phone}
                                                        {editRequest.contact_type_raw && editRequest.contact_type_raw !== 'phone' && <Badge variant="outline" className="text-[10px] h-5">{editRequest.contact_type_raw}</Badge>}
                                                    </div>
                                                    {editRequest.whatsapp && (
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <MessageCircle className="w-3 h-3" /> {editRequest.whatsapp}
                                                        </div>
                                                    )}
                                                    {editRequest.telegram && (
                                                        <div className="flex items-center gap-2 text-blue-500">
                                                            <div className="w-3 h-3 flex items-center justify-center font-bold text-[8px] border border-blue-500 rounded-full">T</div>
                                                            {editRequest.telegram}
                                                        </div>
                                                    )}
                                                    {editRequest.email && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <div className="w-3 h-3 flex items-center justify-center font-bold text-[10px]">@</div>
                                                            {editRequest.email}
                                                        </div>
                                                    )}
                                                    {editRequest.user_priority && editRequest.user_priority !== 'normal' && (
                                                        <div className={`mt-2 ml-2 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${editRequest.user_priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                            <AlertTriangle className="w-3 h-3" /> Priorité: {editRequest.user_priority}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <Label className="text-xs text-gray-400">{t('admin_alkhayr.modal.location')}</Label>
                                                <div className="flex items-center gap-2 font-medium">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    {editRequest.origin === 'foreign' && editRequest.user_country_raw ? (
                                                        <span className="capitalize">{editRequest.user_country_raw} <span className="text-gray-400 text-xs font-normal">(Target)</span></span>
                                                    ) : (
                                                        <span>{editRequest.user_city_raw}, {editRequest.user_wilaya_raw}</span>
                                                    )}
                                                </div>
                                                {editRequest.origin === 'foreign' && (
                                                    <div className="mt-1 text-xs text-gray-500 pl-6 border-l-2 ml-1">
                                                        Origin City: {editRequest.user_city_raw}
                                                    </div>
                                                )}
                                                {editRequest.address_raw && (
                                                    <div className="mt-1 text-xs text-gray-500 pl-6 border-l-2 ml-1">
                                                        {editRequest.address_raw}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Request Content */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <Label className="text-xs text-gray-400">{t('admin_alkhayr.modal.need')}</Label>
                                                <div className="font-bold text-gray-800 mb-1">{editRequest.medicine_name_raw}</div>
                                                {editRequest.disease_name_raw && <div className="text-xs text-blue-600 font-medium mb-1">Maladie: {editRequest.disease_name_raw}</div>}
                                                <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                                    {editRequest.description_raw}
                                                </div>
                                                {editRequest.user_urgency_raw && (
                                                    <div className="mt-2 inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                                        <AlertTriangle className="w-3 h-3" /> URGENT (User)
                                                    </div>
                                                )}
                                            </div>



                                            {/* Proofs & Images Gallery */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                                                <Label className="text-xs text-gray-400 block border-b pb-2">{t('admin_alkhayr.modal.docs')}</Label>

                                                {/* Prescription Images (Foreign) */}
                                                {editRequest.all_prescription_images && editRequest.all_prescription_images.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                                            <FileText className="w-3 h-3" /> {t('admin_alkhayr.modal.prescription')} ({editRequest.all_prescription_images.length})
                                                        </span>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {editRequest.all_prescription_images.map((img, i) => (
                                                                <a href={img} key={`presc-${i}`} target="_blank" rel="noopener noreferrer" className="block border rounded overflow-hidden group relative">
                                                                    <img src={img} className="w-full h-20 object-cover transition group-hover:opacity-80" />
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 text-white text-xs">{t('admin_alkhayr.modal.open')}</div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    editRequest.origin === 'foreign' && <div className="text-xs text-gray-400 italic">Aucune ordonnance fournie.</div>
                                                )}

                                                {/* Medicine Images */}
                                                {editRequest.all_detail_images && editRequest.all_detail_images.length > 0 ? (
                                                    <div className="space-y-2 pt-2">
                                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                                            <ImageIcon className="w-3 h-3" /> {t('admin_alkhayr.modal.med_photos')} ({editRequest.all_detail_images.length})
                                                        </span>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {editRequest.all_detail_images.map((img, i) => (
                                                                <div key={`det-${i}`} className="group relative">
                                                                    <a href={img} target="_blank" rel="noopener noreferrer" className="block border rounded overflow-hidden">
                                                                        <img src={img} className="w-full h-20 object-cover transition group-hover:opacity-80" />
                                                                    </a>
                                                                    {/* Quick Action: Use as Display Image */}
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        className="absolute bottom-0 left-0 w-full text-[10px] h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        onClick={() => setEditRequest({ ...editRequest, display_main_image: img })}
                                                                    >
                                                                        {t('admin_alkhayr.modal.use')}
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 italic">Aucune photo de médicament.</div>
                                                )}
                                            </div>

                                            {/* Financial */}
                                            <div className="bg-white p-4 rounded-lg shadow-sm text-xs space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">{t('admin_alkhayr.modal.financial.capability')}:</span>
                                                    <strong>{editRequest.financial_ability || 'N/A'}</strong>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">{t('admin_alkhayr.modal.financial.offer')}:</span>
                                                    <strong className="text-green-600">{editRequest.afford_amount || 0} DZD</strong>
                                                </div>
                                                {editRequest.family_status && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">{t('admin_alkhayr.modal.financial.family')}:</span>
                                                        <strong>{editRequest.family_status}</strong>
                                                    </div>
                                                )}
                                                {editRequest.monthly_income !== undefined && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">{t('admin_alkhayr.modal.financial.income')}:</span>
                                                        <strong>{editRequest.monthly_income} DZD</strong>
                                                    </div>
                                                )}
                                                {editRequest.need_delivery !== undefined && (
                                                    <div className="flex justify-between pt-2 border-t mt-2">
                                                        <span className="text-gray-500 flex items-center gap-1"><Truck className="w-3 h-3" /> {t('admin_alkhayr.modal.financial.delivery')}:</span>
                                                        <Badge variant={editRequest.need_delivery ? "default" : "outline"} className={editRequest.need_delivery ? "bg-blue-600 hover:bg-blue-700" : "text-gray-400"}>
                                                            {editRequest.need_delivery ? 'OUI' : 'NON'}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- RIGHT PANEL: PUBLIC / CURATED / EXTERNAL (EDITABLE) --- */}
                                    <div className="flex-1 bg-white overflow-y-auto p-6 scrollbar-thin">
                                        <h3 className="font-bold text-blue-600 uppercase tracking-wider text-xs mb-4 flex items-center gap-1">
                                            <Globe className="w-4 h-4" /> {t('admin_alkhayr.modal.section_public')}
                                        </h3>

                                        <div className="grid grid-cols-2 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-semibold">{t('admin_alkhayr.modal.form.title')}</Label>
                                                <Input
                                                    value={editRequest.display_name}
                                                    onChange={(e) => setEditRequest({ ...editRequest, display_name: e.target.value })}
                                                    placeholder={t('admin_alkhayr.modal.form.title_ph')}
                                                    className="border-gray-300 font-medium"
                                                />
                                                <p className="text-xs text-gray-400">{t('admin_alkhayr.modal.form.title_help')}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-2">
                                                    <Label className="text-gray-700 font-semibold">{t('admin_alkhayr.modal.form.wilaya')}</Label>
                                                    <Input
                                                        value={editRequest.display_wilaya}
                                                        onChange={(e) => setEditRequest({ ...editRequest, display_wilaya: e.target.value })}
                                                        placeholder="Ex: Alger"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gray-700 font-semibold">{t('admin_alkhayr.modal.form.area')}</Label>
                                                    <Input
                                                        value={editRequest.display_area}
                                                        onChange={(e) => setEditRequest({ ...editRequest, display_area: e.target.value })}
                                                        placeholder="Ex: Bab El Oued"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-8">
                                            {/* Col 1: Status & Image */}
                                            <div className="col-span-4 space-y-6">

                                                <div className="bg-white p-4 border rounded-xl shadow-sm space-y-4">
                                                    <Label className="font-bold">{t('admin_alkhayr.modal.form.status')}</Label>
                                                    <Select
                                                        value={editRequest.status}
                                                        onValueChange={(val: any) => setEditRequest({ ...editRequest, status: val })}
                                                    >
                                                        <SelectTrigger className="w-full font-bold">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">{t('admin_alkhayr.modal.status.pending')}</SelectItem>
                                                            <SelectItem value="in_progress">{t('admin_alkhayr.modal.status.online')}</SelectItem>
                                                            <SelectItem value="handled">{t('admin_alkhayr.modal.status.handled')}</SelectItem>
                                                            <SelectItem value="rejected">{t('admin_alkhayr.modal.status.rejected')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <div className="flex items-center justify-between pt-2 border-t">
                                                        <Label className="text-red-600 font-bold">{t('admin_alkhayr.modal.form.urgent_admin')}</Label>
                                                        <Switch
                                                            checked={editRequest.display_is_urgent}
                                                            onCheckedChange={(c) => setEditRequest({ ...editRequest, display_is_urgent: c })}
                                                        />
                                                    </div>
                                                </div>


                                                <div className="bg-white p-4 border rounded-xl shadow-sm space-y-2">
                                                    <Label className="font-bold text-gray-700">Délibération / Notes Admin</Label>
                                                    <Textarea
                                                        value={editRequest.admin_notes}
                                                        onChange={(e) => setEditRequest({ ...editRequest, admin_notes: e.target.value })}
                                                        placeholder="Notes internes ou raison de rejet..."
                                                        className="min-h-[80px]"
                                                    />
                                                </div>

                                                <div className="bg-white p-4 border rounded-xl shadow-sm space-y-2">
                                                    <Label className="font-bold">Image Principale (Display) *</Label>
                                                    <div className="aspect-square bg-gray-100 rounded border-2 border-dashed flex items-center justify-center relative overflow-hidden group">
                                                        {editRequest.display_main_image ? (
                                                            <>
                                                                <img src={editRequest.display_main_image} className="w-full h-full object-cover" />
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                    <Button variant="secondary" size="sm" onClick={() => setEditRequest({ ...editRequest, display_main_image: '' })}>Retirer</Button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                                <span className="text-xs text-gray-400 block">Glisser ou cliquer</span>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={async (e) => {
                                                                if (e.target.files?.[0]) {
                                                                    setUploading(true);
                                                                    const url = await uploadFile(e.target.files[0]);
                                                                    if (url) setEditRequest({ ...editRequest, display_main_image: url });
                                                                    setUploading(false);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setEditRequest({ ...editRequest, display_main_image: editRequest.user_proof_url })}>
                                                            {t('admin_alkhayr.modal.form.use_proof')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Col 2: Content */}
                                            <div className="col-span-8 space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="font-bold text-gray-700">{t('admin_alkhayr.modal.form.summary')}</Label>
                                                    <Textarea
                                                        value={editRequest.display_summary}
                                                        onChange={(e) => setEditRequest({ ...editRequest, display_summary: e.target.value })}
                                                        placeholder={t('admin_alkhayr.modal.form.summary_ph')}
                                                        className="min-h-[100px] text-lg"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="font-bold text-gray-700">{t('admin_alkhayr.modal.form.desc')}</Label>
                                                    <Textarea
                                                        value={editRequest.display_description}
                                                        onChange={(e) => setEditRequest({ ...editRequest, display_description: e.target.value })}
                                                        placeholder={t('admin_alkhayr.modal.form.desc_ph')}
                                                        className="min-h-[200px]"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="font-bold text-gray-700">{t('admin_alkhayr.modal.form.gallery')}</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {editRequest.display_images.map((img, idx) => (
                                                            <div key={idx} className="w-20 h-20 relative rounded overflow-hidden border group">
                                                                <img src={img} className="w-full h-full object-cover" />
                                                                <button
                                                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100"
                                                                    onClick={() => {
                                                                        const newImgs = [...editRequest.display_images];
                                                                        newImgs.splice(idx, 1);
                                                                        setEditRequest({ ...editRequest, display_images: newImgs });
                                                                    }}
                                                                >
                                                                    <Trash className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <label className="w-20 h-20 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                                                            <Upload className="w-5 h-5 text-gray-400" />
                                                            <input type="file" multiple className="hidden" onChange={async (e) => {
                                                                if (e.target.files) {
                                                                    setUploading(true);
                                                                    const urls = [];
                                                                    for (const file of Array.from(e.target.files)) {
                                                                        const url = await uploadFile(file);
                                                                        if (url) urls.push(url);
                                                                    }
                                                                    setEditRequest({ ...editRequest, display_images: [...editRequest.display_images, ...urls] });
                                                                    setUploading(false);
                                                                }
                                                            }} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center flex-shrink-0 z-10">
                                    <div className="text-sm text-gray-500">
                                        Vérification V3 Active • {editRequest.origin}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setEditRequest(null)}>{t('admin_alkhayr.modal.actions.cancel')}</Button>
                                        <Button onClick={() => handleSave()} disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 min-w-[200px]">
                                            <Save className="w-4 h-4" /> {t('admin_alkhayr.modal.actions.save')}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout >
    );
};

export default AlKhayrAdmin;
