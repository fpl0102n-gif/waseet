import { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import AppLayout from '@/components/AppLayout';
import Section from '@/components/ui/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Search, User, Car } from 'lucide-react';

// Components
import BloodHero from '@/components/blood/BloodHero';
import BloodRegister from '@/components/blood/BloodRegister';
import BloodProfile from '@/components/blood/BloodProfile';
import BloodSearch from '@/components/blood/BloodSearch';
import TransportVolunteerRegister from '@/components/blood/TransportVolunteerRegister';
import TransportVolunteerList from '@/components/blood/TransportVolunteerList';

const BloodDonation = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('search');

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <AppLayout>
            <div className="min-h-screen bg-[#FDECEA]/30">
                {/* Hero Section */}
                <BloodHero />

                <Section className="relative -mt-4 md:-mt-8 z-10">
                    <div className="container mx-auto max-w-4xl px-4">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-red-100 p-4 md:p-8">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
                                <div className="flex justify-center w-full">
                                    <TabsList className="h-auto p-1.5 bg-red-50/50 border border-red-100 rounded-2xl md:rounded-full grid grid-cols-2 w-full gap-2 md:flex md:w-auto">
                                        <TabsTrigger
                                            value="search"
                                            className="rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-3 text-xs md:text-base data-[state=active]:bg-[#C62828] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2 w-full md:w-auto min-w-0"
                                        >
                                            <Search className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('blood.tabs.search')}</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="register"
                                            className="rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-3 text-xs md:text-base data-[state=active]:bg-[#C62828] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2 w-full md:w-auto min-w-0"
                                        >
                                            <Heart className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('blood.tabs.register')}</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="transport"
                                            className="rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-3 text-xs md:text-base data-[state=active]:bg-[#E53935] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2 w-full md:w-auto min-w-0"
                                        >
                                            <Car className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('blood.tabs.transport')}</span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="profile"
                                            className="rounded-xl md:rounded-full px-2 py-3 md:px-6 md:py-3 text-xs md:text-base data-[state=active]:bg-[#C62828] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 gap-2 w-full md:w-auto min-w-0"
                                        >
                                            <User className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{t('blood.tabs.profile')}</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="min-h-[400px]">
                                    <TabsContent value="search" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <BloodSearch />
                                    </TabsContent>

                                    <TabsContent value="register" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <BloodRegister />
                                    </TabsContent>

                                    <TabsContent value="transport" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                                        <div className="text-center mb-4">
                                            <h2 className="text-2xl font-bold text-gray-800">{t('blood.transport.title')}</h2>
                                            <p className="text-gray-600">{t('blood.transport.subtitle')}</p>
                                        </div>

                                        <Tabs defaultValue="find" className="w-full">
                                            <div className="flex justify-center mb-8">
                                                <TabsList className="bg-red-50 border border-red-100 rounded-full p-1 h-auto">
                                                    <TabsTrigger
                                                        value="find"
                                                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#E53935] data-[state=active]:text-white text-red-700 transition-all font-medium"
                                                    >
                                                        <Search className="w-4 h-4 mr-2" />
                                                        {t('blood.transport.find')}
                                                    </TabsTrigger>
                                                    <TabsTrigger
                                                        value="join"
                                                        className="rounded-full px-6 py-2.5 data-[state=active]:bg-[#E53935] data-[state=active]:text-white text-red-700 transition-all font-medium"
                                                    >
                                                        <Car className="w-4 h-4 mr-2" />
                                                        {t('blood.transport.join')}
                                                    </TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <TabsContent value="find" className="mt-0">
                                                <TransportVolunteerList />
                                            </TabsContent>

                                            <TabsContent value="join" className="mt-0 space-y-4">
                                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r">
                                                    <p className="text-sm text-blue-800">
                                                        <Trans i18nKey="blood.transport.privacy_note" components={{ strong: <strong /> }} />
                                                    </p>
                                                </div>
                                                <TransportVolunteerRegister />
                                            </TabsContent>
                                        </Tabs>
                                    </TabsContent>

                                    <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <BloodProfile />
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

export default BloodDonation;
