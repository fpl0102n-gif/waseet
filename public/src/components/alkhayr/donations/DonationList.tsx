import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, HeartHandshake, Archive, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PublicDonationDetailDialog } from './PublicDonationDetailDialog';
import { useTranslation } from 'react-i18next';

interface DonationListProps { }

export default function DonationList({ }: DonationListProps) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonation, setSelectedDonation] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('material_donations')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDonations(data || []);
        } catch (error: any) {
            console.error(error);
            toast({ title: t('alkhayr_public.submit.errors.submit'), description: "Failed to load donations.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const handleCardClick = (donation: any) => {
        setSelectedDonation(donation);
        setDetailOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
        );
    }

    if (donations.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">{t('alkhayr_public.donations.empty.title')}</h3>
                <p className="text-muted-foreground">{t('alkhayr_public.donations.empty.desc')}</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {donations.map((item) => (
                    <Card
                        key={item.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-green-100 cursor-pointer group flex flex-col h-full"
                        onClick={() => handleCardClick(item)}
                    >
                        <div className="aspect-video relative bg-gray-100 overflow-hidden">
                            {item.main_image || (item.images && item.images.length > 0) ? (
                                <img
                                    src={item.main_image || item.images[0]}
                                    alt={item.item_name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-green-50">
                                    <Package className="h-10 w-10 opacity-20" />
                                </div>
                            )}
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                                <Badge className="bg-black/70 hover:bg-black/80 text-white gap-1 pointer-events-none">
                                    <Eye className="h-3 w-3" /> {t('alkhayr_public.donations.card.view_details')}
                                </Badge>
                            </div>

                            <div className="absolute top-2 right-2">
                                <Badge variant="secondary" className="bg-white/90 text-green-700 backdrop-blur-sm shadow-sm">
                                    {item.category === 'medicine' ? t('alkhayr_public.donations.card.medicine') :
                                        item.category === 'equipment' ? t('alkhayr_public.donations.card.equipment') : t('alkhayr_public.donations.card.other')}
                                </Badge>
                            </div>
                        </div>

                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold text-green-900 line-clamp-1 group-hover:text-green-700 transition-colors">
                                {item.item_name}
                            </CardTitle>
                            <div className="flex items-center text-sm text-green-700 gap-1.5 font-medium">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>{item.location}</span>
                            </div>
                        </CardHeader>

                        <CardContent className="pb-4 flex-grow">
                            <p className="text-sm text-gray-600 line-clamp-3 min-h-[60px]">
                                {item.admin_description || t('alkhayr_public.donations.card.no_description')}
                            </p>
                            <div className="mt-3 flex gap-2">
                                <Badge variant="outline" className="text-xs border-green-200 text-green-600 bg-green-50/50">
                                    {item.condition === 'new' ? t('alkhayr_public.donations.card.new') :
                                        item.condition === 'used_good' ? t('alkhayr_public.donations.card.used_good') : t('alkhayr_public.donations.card.used_fair')}
                                </Badge>
                                {item.quantity > 1 && (
                                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50/50">
                                        {t('alkhayr_public.donations.card.qty')}: {item.quantity}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="pt-0 mt-auto">
                            <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white z-10 relative" asChild onClick={(e) => e.stopPropagation()}>
                                <a href="/contact">
                                    <HeartHandshake className="h-4 w-4" />
                                    {t('alkhayr_public.donations.card.contact')}
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <PublicDonationDetailDialog
                open={detailOpen}
                onOpenChange={setDetailOpen}
                donation={selectedDonation}
            />
        </>
    );
}
