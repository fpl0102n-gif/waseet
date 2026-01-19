
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ThermometerSun, Circle, MapPin, Clock, Heart as HeartIcon, Globe, User, Eye, XCircle, ArrowRight } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface RequestRow {
    id: number;
    title: string;
    description: string;
    classification: string;
    category: string;
    wilaya: string;
    status: string;
    urgency: string;
    created_at: string;
    prescription_url?: string;
    public_name?: string;
    table_name?: string;
    origin?: string;
    visibility_settings?: any;
    public_notes?: string;
    amount?: number;
    currency?: string;
    requester_name?: string;
}

const classificationMeta: Record<string, { variant: 'destructive' | 'secondary' | 'default' | 'outline'; icon: JSX.Element; }> = {
    severe: { variant: 'destructive', icon: <AlertTriangle className="w-3 h-3" /> },
    cancer: { variant: 'destructive', icon: <AlertTriangle className="w-3 h-3" /> },
    surgery: { variant: 'destructive', icon: <ThermometerSun className="w-3 h-3" /> },
    medium: { variant: 'secondary', icon: <ThermometerSun className="w-3 h-3" /> },
    diabetes: { variant: 'secondary', icon: <Circle className="w-3 h-3" /> },
    normal: { variant: 'outline', icon: <Circle className="w-3 h-3" /> },
    rare: { variant: 'default', icon: <Globe className="w-3 h-3" /> },
};

const HumanitarianRequestsList = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [classificationFilter, setClassificationFilter] = useState<string>('all');
    const [rows, setRows] = useState<RequestRow[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
    const [galleryImages, setGalleryImages] = useState<any[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('alkhayr_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRows(data as RequestRow[]);
        } catch (e) {
            console.error('Failed to load requests', e);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (selectedRequest) {
            const fetchGallery = async () => {
                const { data } = await supabase
                    .from('request_images')
                    .select('*')
                    .eq('request_id', selectedRequest.id)
                    .eq('is_approved', true);

                setGalleryImages(data || []);
            };
            fetchGallery();
        } else {
            setGalleryImages([]);
        }
    }, [selectedRequest]);

    const filtered = rows.filter(r => classificationFilter === 'all' || r.classification === classificationFilter);

    return (
        <div className="container max-w-7xl mx-auto space-y-10 py-8 px-4 sm:px-6">
            <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Badge variant="outline" className="mb-4 py-1 px-4 text-base border-primary/20 text-primary bg-primary/5 rounded-full">
                    {t('alkhayr_public.promo_badge')}
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    {t('alkhayr.requests.title')}
                </h1>
                <p className="text-[#374151] text-lg max-w-2xl mx-auto leading-relaxed">
                    {t('alkhayr.requests.subtitle')}
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {['all', 'severe', 'cancer', 'surgery', 'medium', 'diabetes', 'rare', 'normal'].map(type => (
                    <Button
                        key={type}
                        variant={classificationFilter === type ? 'default' : 'outline'}
                        onClick={() => setClassificationFilter(type)}
                        size="sm"
                        className={`capitalize rounded-full px-4 transition-all ${classificationFilter === type ? 'shadow-md scale-105' : 'hover:bg-primary/5'}`}
                    >
                        {type === 'all' ? t('alkhayr_public.filter.all') : t('classification.' + type)}
                    </Button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((req) => (
                    <Card key={req.id}
                        className="group overflow-hidden border-border/50 bg-card hover:shadow-2xl hover:border-primary/20 transition-all duration-500 cursor-pointer flex flex-col h-full rounded-2xl"
                        onClick={() => setSelectedRequest(req)}
                    >
                        <div className="relative w-full aspect-video bg-muted overflow-hidden">
                            {req.prescription_url ? (
                                <img
                                    src={req.prescription_url}
                                    alt={req.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-slate-100 dark:bg-slate-800">
                                    <HeartIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 opacity-50" />
                                </div>
                            )}

                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                <Badge className="bg-white/90 text-black shadow-sm backdrop-blur-md hover:bg-white">
                                    {req.category || 'Humanitaire'}
                                </Badge>
                                {req.status === 'completed' && <Badge className="bg-blue-600 text-white shadow-sm">{t('alkhayr_public.status.completed')}</Badge>}
                            </div>

                            <div className="absolute top-3 right-3">
                                {req.classification && classificationMeta[req.classification] && (
                                    <Badge variant={classificationMeta[req.classification].variant as any} className="shadow-sm backdrop-blur-md">
                                        {classificationMeta[req.classification].icon}
                                        <span className="ml-1">{t('classification.' + req.classification)}</span>
                                    </Badge>
                                )}
                            </div>

                            {req.urgency === 'urgent' && (
                                <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white text-center text-xs font-bold py-1 backdrop-blur-sm">
                                    {t('alkhayr_public.details.urgent')}
                                </div>
                            )}
                        </div>

                        <CardContent className="p-6 flex-1 flex flex-col gap-3">
                            <div className="flex items-center justify-between text-xs text-[#374151] mb-1">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {req.wilaya || 'Algérie'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(req.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {req.title}
                            </h3>

                            <p className="text-sm text-[#374151] line-clamp-3 leading-relaxed">
                                {req.description}
                            </p>
                        </CardContent>

                        <CardFooter className="p-6 pt-0 mt-auto">
                            <Button className="w-full rounded-xl group-hover:bg-primary group-hover:text-white transition-colors" variant="secondary">
                                {t('alkhayr_public.card.view')} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/20">
                    <HeartIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
                    <h3 className="text-2xl font-bold mb-2 text-[#1F2933]">{t('alkhayr_public.empty.title')}</h3>
                    <p className="text-[#374151] max-w-md mx-auto">
                        {t('alkhayr_public.empty.desc')}
                    </p>
                </div>
            )}

            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-4xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0 rounded-2xl border-0 shadow-2xl">
                    {selectedRequest && (
                        <div className="flex flex-col md:flex-row h-full">



                            <div className="w-full md:w-2/5 bg-black/5 dark:bg-black/20 border-r overflow-hidden relative group">
                                <ScrollArea className="h-full max-h-[40vh] md:max-h-full">
                                    <div className="p-4 space-y-4">
                                        <div
                                            className="rounded-xl overflow-hidden shadow-sm border bg-white aspect-square cursor-zoom-in relative"
                                            onClick={() => setSelectedImage(selectedRequest.prescription_url || null)}
                                        >
                                            {selectedRequest.prescription_url ? (
                                                <img src={selectedRequest.prescription_url} className="w-full h-full object-cover" alt="Main" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full"><HeartIcon className="w-12 h-12 opacity-20" /></div>
                                            )}
                                        </div>

                                        {galleryImages.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {galleryImages.map((img, i) => (
                                                    <div key={i} className="rounded-lg overflow-hidden border bg-white aspect-square cursor-zoom-in hover:opacity-90 transition-opacity" onClick={() => setSelectedImage(img.image_url)}>
                                                        <img src={img.image_url} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>

                            <div className="flex-1 flex flex-col h-full bg-background">
                                <ScrollArea className="flex-1">
                                    <div className="p-6 md:p-8 space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="rounded-full px-3">{selectedRequest.category}</Badge>
                                                {selectedRequest.classification && classificationMeta[selectedRequest.classification] && (
                                                    <Badge variant={classificationMeta[selectedRequest.classification].variant as any} className="gap-1 rounded-full px-3">
                                                        {classificationMeta[selectedRequest.classification].icon}
                                                        {t('classification.' + selectedRequest.classification)}
                                                    </Badge>
                                                )}
                                                {selectedRequest.urgency === 'urgent' && <Badge variant="destructive" className="rounded-full px-3">{t('alkhayr_public.details.urgent')}</Badge>}
                                            </div>

                                            <h2 className="text-3xl font-bold leading-tight">{selectedRequest.title}</h2>

                                            <div className="flex items-center gap-4 text-sm text-[#374151] border-b pb-6">
                                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedRequest.wilaya || 'Algérie'}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Publié le {new Date(selectedRequest.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 font-bold text-lg"><Globe className="w-5 h-5 text-primary" /> {t('alkhayr_public.details.story')}</h4>
                                            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-line">
                                                {selectedRequest.description}
                                            </p>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl border bg-muted/30">
                                                <div className="flex gap-3">
                                                    <div className="mt-1"><User className="w-5 h-5 text-primary" /></div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{t('alkhayr_public.details.beneficiary')}</p>
                                                        <p className="text-sm text-[#374151]">{selectedRequest.public_name || t('alkhayr_public.details.anonymous')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedRequest.public_notes && (
                                                <div className="p-4 rounded-xl border bg-yellow-50/50 border-yellow-100 col-span-2">
                                                    <div className="flex gap-3">
                                                        <div className="mt-1"><AlertTriangle className="w-5 h-5 text-yellow-600" /></div>
                                                        <div>
                                                            <p className="font-semibold text-sm text-yellow-800">{t('alkhayr_public.details.note_title')}</p>
                                                            <p className="text-sm text-yellow-700 leading-relaxed">{selectedRequest.public_notes}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>

                                <div className="p-6 border-t bg-muted/10 backdrop-blur flex justify-between items-center gap-4">
                                    <div className="text-xs text-[#374151]">{t('alkhayr_public.details.ref')}: <span className="font-mono select-all">#{selectedRequest.id}</span></div>
                                    <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                        {t('alkhayr_public.details.donate_now')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-[98vw] h-[95vh] p-0 bg-black/95 border-0 shadow-none flex items-center justify-center z-[50]">
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        <Button variant="ghost" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-12 h-12 p-0 z-50" onClick={() => setSelectedImage(null)}>
                            <XCircle className="w-8 h-8" />
                        </Button>

                        <Carousel className="w-full h-full max-h-[90vh] max-w-5xl"
                            opts={{
                                startIndex: selectedRequest?.prescription_url === selectedImage ? 0 : (
                                    galleryImages.findIndex(img => img.image_url === selectedImage) + (selectedRequest?.prescription_url ? 1 : 0)
                                )
                            }}
                        >
                            <CarouselContent>
                                {selectedRequest?.prescription_url && (
                                    <CarouselItem className="flex items-center justify-center h-full">
                                        <img src={selectedRequest.prescription_url} alt="Main" className="max-w-full max-h-[85vh] object-contain" />
                                    </CarouselItem>
                                )}
                                {galleryImages.map((img, index) => (
                                    <CarouselItem key={index} className="flex items-center justify-center h-full">
                                        <img src={img.image_url} alt={`Gallery ${index}`} className="max-w-full max-h-[85vh] object-contain" />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-2 bg-white/10 hover:bg-white/20 text-white border-0" />
                            <CarouselNext className="right-2 bg-white/10 hover:bg-white/20 text-white border-0" />
                        </Carousel>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default HumanitarianRequestsList;
