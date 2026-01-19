import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AlkhayrVerseModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Only show on Alkhayr pages
        if (!location.pathname.includes('/alkhayr')) return;

        // DEBUG LOG
        console.log('AlkhayrModal: Location matched.');
        // Check if seen in last 24 hours
        const lastSeen = localStorage.getItem('alkhayr_verse_timestamp');
        const now = Date.now();

        if (!lastSeen || (now - parseInt(lastSeen)) > 24 * 60 * 60 * 1000) {
            console.log('AlkhayrModal: Opening immediately...');
            setIsOpen(true);
            setMounted(true);
        } else {
            console.log('AlkhayrModal: Already seen in last 24h.');
        }
    }, [location.pathname]);

    const close = () => {
        setIsOpen(false);
        localStorage.setItem('alkhayr_verse_timestamp', Date.now().toString());
        setTimeout(() => setMounted(false), 500); // Wait for transition
    };

    if (!mounted) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            onClick={close}
        >
            <Card
                className={`w-[90%] max-w-lg border-none shadow-2xl bg-[#ecfdf5] dark:bg-[#064e3b] text-center relative overflow-hidden transition-all duration-700 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={close}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5 text-emerald-800 dark:text-emerald-100" />
                    <span className="sr-only">Close</span>
                </button>

                <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[200px]">
                    <div className="space-y-6">
                        <div className="w-16 h-1 bg-emerald-500/30 mx-auto rounded-full" />
                        <p
                            className="font-arabic text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed text-[#065f46] dark:text-[#ecfdf5]"
                            dir="rtl"
                        >
                            "ومن أحياها فكأنما أحيا الناس جميعًا"
                        </p>
                        <div className="w-16 h-1 bg-emerald-500/30 mx-auto rounded-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AlkhayrVerseModal;
