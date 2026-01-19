import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, HeartHandshake, X, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useTranslation } from 'react-i18next';

interface PublicDonationDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    donation: any;
}

export function PublicDonationDetailDialog({ open, onOpenChange, donation }: PublicDonationDetailDialogProps) {
    const { t } = useTranslation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!donation) return null;

    // Combine main_image and images array
    const allImages = [];
    if (donation.main_image) allImages.push(donation.main_image);
    if (donation.images && donation.images.length > 0) {
        donation.images.forEach((img: string) => {
            if (img !== donation.main_image && !allImages.includes(img)) allImages.push(img);
        });
    }
    const hasImages = allImages.length > 0;

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return t('alkhayr_public.details.relative_time.today');
        if (diffDays === 1) return t('alkhayr_public.details.relative_time.yesterday');
        return t('alkhayr_public.details.relative_time.days_ago', { days: diffDays });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden flex flex-col md:flex-row md:h-[700px] gap-0">
                    <VisuallyHidden.Root>
                        <DialogHeader>
                            <DialogTitle>{t('alkhayr_public.donations.card.details_title')} - {donation.item_name}</DialogTitle>
                            <DialogDescription>Description</DialogDescription>
                        </DialogHeader>
                    </VisuallyHidden.Root>

                    {/* LEFT: IMAGE SECTION */}
                    <div className="relative w-full md:w-1/2 bg-black/5 flex items-center justify-center overflow-hidden shrink-0 group md:h-full h-[300px]">
                        {hasImages ? (
                            <>
                                <img
                                    src={allImages[currentImageIndex]}
                                    alt={donation.item_name}
                                    className="w-full h-full object-contain cursor-zoom-in transition-transform duration-300"
                                    onClick={() => setLightboxOpen(true)}
                                />

                                {/* Overlay Gradient & Controls */}
                                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="text-white text-xs flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">
                                        <ZoomIn className="h-3 w-3" /> Zoom
                                    </span>
                                </div>

                                {allImages.length > 1 && (
                                    <>
                                        <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10" onClick={prevImage}>
                                            <ChevronLeft className="h-6 w-6" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10" onClick={nextImage}>
                                            <ChevronRight className="h-6 w-6" />
                                        </Button>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-2 py-1 rounded-full text-xs text-white z-10">
                                            {currentImageIndex + 1} / {allImages.length}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <Package className="h-16 w-16 opacity-20 mb-2" />
                                <span>{t('alkhayr_public.donations.card.no_images')}</span>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-2 bg-white/80 hover:bg-white rounded-full text-black md:hidden z-20"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* RIGHT: CONTENT SECTION */}
                    <div className="flex-1 flex flex-col h-full bg-white relative">
                        {/* Close button for desktop */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 z-10 hidden md:flex text-gray-500 hover:text-black"
                            onClick={() => onOpenChange(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-start gap-3 mb-2">
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                            {donation.category === 'medicine' ? t('alkhayr_public.donations.card.medicine') :
                                                donation.category === 'equipment' ? t('alkhayr_public.donations.card.equipment') : t('alkhayr_public.donations.card.other')}
                                        </Badge>
                                        <Badge variant="outline" className="border-green-200 text-green-700">
                                            {t('alkhayr_public.donations.card.qty')}: {donation.quantity || 1}
                                        </Badge>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2 pr-8">{donation.item_name}</h2>
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <MapPin className="h-4 w-4 mr-1 text-green-600" />
                                        <span className="font-medium">{donation.location}</span>
                                        <span className="mx-2 text-slate-300">•</span>
                                        <span className="capitalize">
                                            {donation.condition === 'new' ? t('alkhayr_public.donations.card.new') :
                                                donation.condition === 'used_good' ? t('alkhayr_public.donations.card.used_good') : t('alkhayr_public.donations.card.used_fair')}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">{t('alkhayr_public.donations.card.description_title')}</h3>
                                    <div className="prose prose-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        {donation.admin_description || donation.description || t('alkhayr_public.donations.card.no_description')}
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between text-xs text-slate-400 border-t">
                                    <span>{t('alkhayr_public.donations.card.added_on')} {getRelativeTime(donation.created_at)}</span>
                                    <span>ID: {donation.id.replace(/\D/g, '').slice(0, 8)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 md:p-6 border-t bg-gray-50/50 mt-auto">
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-medium shadow-sm hover:shadow-md transition-all gap-2" asChild>
                                <a href="/contact">
                                    <HeartHandshake className="h-5 w-5" />
                                    {t('alkhayr_public.donations.card.contact_collect')}
                                </a>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* LIGHTBOX OVERLAY */}
            {lightboxOpen && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setLightboxOpen(false)}>

                    <div className="absolute top-4 right-4 z-[10000] flex gap-2">
                        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full" onClick={() => setLightboxOpen(false)}>
                            <X className="h-8 w-8" />
                        </Button>
                    </div>

                    <div className="relative w-full h-full flex items-center justify-center">
                        <img
                            src={allImages[currentImageIndex]}
                            alt="Full screen view"
                            className="w-auto h-auto max-w-[95vw] max-h-[95vh] object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {allImages.length > 1 && (
                            <>
                                <Button
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full border-0 h-12 w-12"
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                                <Button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full border-0 h-12 w-12"
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 bg-black/40 px-4 py-1 rounded-full">
                                    {currentImageIndex + 1} / {allImages.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
