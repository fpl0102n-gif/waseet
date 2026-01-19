import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/AppLayout';
import Section from '@/components/ui/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, User } from 'lucide-react';

// New Green Components
import AlkhayrHero from '@/components/alkhayr/AlkhayrHero';
import AlkhayrSubmit from '@/components/alkhayr/AlkhayrSubmit';
import AlkhayrSearch from '@/components/alkhayr/AlkhayrSearch';
import AlkhayrProfile from '@/components/alkhayr/AlkhayrProfile';
import DonationMain from '@/components/alkhayr/donations/DonationMain';
import { Gift } from 'lucide-react';

const UnifiedRequests = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Default active tab logic
    const initialTab = searchParams.get('type') === 'my-requests' ? 'profile' :
        searchParams.get('type') === 'requests' ? 'search' :
            searchParams.get('type') === 'donate' ? 'donate' : 'submit';

    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync state with URL params if needed, or just handle internally
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        // Map back to legacy URL params if we want to keep some compatibility, 
        // or just update state. For now, we update state to keep it simple.
        let typeParam = 'local';
        if (val === 'search') typeParam = 'requests';
        if (val === 'profile') typeParam = 'my-requests';
        if (val === 'donate') typeParam = 'donate';
        setSearchParams({ type: typeParam });
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#F1F8E9]">
                {/* Hero Section */}
                <AlkhayrHero />
                <Section id="alkhayr-main" padding="md" className="relative -mt-4 md:-mt-8 z-10">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-green-100 p-4 md:p-8">
                            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-8">
                                <div className="flex justify-center w-full">
                                    <TabsList className="h-auto p-1.5 bg-green-50/50 border border-green-100 rounded-2xl md:rounded-full grid grid-cols-2 w-full gap-2 md:flex md:w-auto">
                                        <TabsTrigger
                                            value="submit"
                                            className="rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-3 text-xs md:text-base data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2 w-full md:w-auto min-w-0"
                                        >
                                            <Heart className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('alkhayr_public.tabs.submit')}</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="search"
                                            className="rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-3 text-xs md:text-base data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2 w-full md:w-auto min-w-0"
                                        >
                                            <Search className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('alkhayr_public.tabs.search')}</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="donate"
                                            className="rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-3 text-xs md:text-base data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2 w-full md:w-auto min-w-0"
                                        >
                                            <Gift className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('alkhayr_public.tabs.donate')}</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="profile"
                                            className="rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-3 text-xs md:text-base data-[state=active]:bg-[#2E7D32] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2 w-full md:w-auto min-w-0"
                                        >
                                            <User className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('alkhayr_public.tabs.profile')}</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="min-h-[400px]">
                                    <TabsContent value="submit" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <AlkhayrSubmit />
                                    </TabsContent>

                                    <TabsContent value="search" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <AlkhayrSearch />
                                    </TabsContent>

                                    <TabsContent value="donate" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <DonationMain />
                                    </TabsContent>

                                    <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <AlkhayrProfile />
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </Section>
            </div>
        </AppLayout>
    );
};

export default UnifiedRequests;
