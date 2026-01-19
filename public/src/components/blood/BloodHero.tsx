import { Droplet, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useTranslation } from 'react-i18next';

const BloodHero = () => {
    const { t } = useTranslation();
    return (
        <div className="relative bg-[#8E0000] text-white py-12 md:py-20 px-4 overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-white blur-3xl"></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
                    <div className="max-w-2xl space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium animate-in fade-in slide-in-from-left duration-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            {t('blood.hero.badge')}
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                            {t('blood.hero.main_title_1')} <br />
                            <span className="text-red-200">{t('blood.hero.main_title_2')}</span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-red-100 max-w-xl leading-relaxed">
                            {t('blood.hero.description')}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                            <div className="flex items-center gap-2 text-sm text-red-200 bg-black/20 px-4 py-2 rounded-lg">
                                <HeartHandshake className="h-5 w-5" />
                                <span>{t('blood.hero.volunteer')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-red-200 bg-black/20 px-4 py-2 rounded-lg">
                                <Droplet className="h-5 w-5" />
                                <span>{t('blood.hero.impact')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block relative">
                        <div className="relative w-72 h-72 lg:w-96 lg:h-96">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse"></div>
                            <div className="absolute inset-4 bg-red-500/30 rounded-full blur-xl"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Droplet className="w-48 h-48 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] fill-red-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodHero;
