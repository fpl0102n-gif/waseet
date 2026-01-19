import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Globe } from 'lucide-react';
import DonationForm from './DonationForm';
import DonationList from './DonationList';

export default function DonationMain() {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'browse' | 'offer'>('browse');

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Mode Switcher */}
            <div className="text-center space-y-6">
                <div className="inline-flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-green-900 mb-2">{t('alkhayr_public.donations.title')}</h2>
                    <p className="text-green-700 max-w-xl mx-auto">
                        {t('alkhayr_public.donations.subtitle')}
                    </p>
                </div>

                {/* Mode Toggles (Browse / Offer) */}
                <div className="inline-flex bg-green-50 p-1 rounded-lg border border-green-100">
                    <button
                        onClick={() => setMode('browse')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'browse'
                            ? 'bg-white text-green-700 shadow-sm'
                            : 'text-green-600 hover:text-green-800'
                            }`}
                    >
                        {t('alkhayr_public.donations.view_items')}
                    </button>
                    <button
                        onClick={() => setMode('offer')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${mode === 'offer'
                            ? 'bg-white text-green-700 shadow-sm'
                            : 'text-green-600 hover:text-green-800'
                            }`}
                    >
                        {t('alkhayr_public.donations.propose_item')}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {mode === 'browse' ? (
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-semibold text-lg text-green-800">
                                {t('alkhayr_public.donations.available_items')}
                            </h3>
                        </div>
                        <DonationList />
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        <DonationForm onSuccess={() => setMode('browse')} />
                    </div>
                )}
            </div>
        </div>
    );
}
