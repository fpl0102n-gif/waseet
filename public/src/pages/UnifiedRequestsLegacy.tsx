import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AppLayout from '@/components/AppLayout';
import Section from '@/components/ui/section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Globe, Users, List, UserPlus } from 'lucide-react';

// Import extracted components (Legacy)
import LocalMedicineForm from '@/components/requests/LocalMedicineForm';
import ForeignMedicineForm from '@/components/requests/ForeignMedicineForm';
import HumanitarianRequestsList from '@/components/requests/HumanitarianRequestsList';
import MyRequestsView from '@/components/requests/MyRequestsView';
import DiasporaRegistrationForm from '@/components/requests/DiasporaRegistrationForm';

const UnifiedRequestsLegacy = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get active tab from URL or default to 'local'
    const activeTab = searchParams.get('type') || 'local';

    // Handle tab change
    const handleTabChange = (value: string) => {
        setSearchParams({ type: value });
        // Optional: Smooth scroll to top on tab change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AppLayout>
            <Section id="unified-requests-legacy" padding="sm" className="pt-4" variant="charity">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-center">
                        <p className="font-semibold">{t('alkhayr.legacy_mode_warning')}</p>
                    </div>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <div className="w-full py-4 text-center">
                            <TabsList className="h-auto flex-wrap justify-center gap-2 p-1 bg-muted/40 backdrop-blur inline-flex">
                                <TabsTrigger value="local" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Heart className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('alkhayr.nav.local')}</span>
                                </TabsTrigger>

                                <TabsTrigger value="foreign" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Globe className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('alkhayr.nav.foreign')}</span>
                                </TabsTrigger>

                                <TabsTrigger value="requests" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <List className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('alkhayr.requests.title')}</span>
                                </TabsTrigger>

                                <TabsTrigger value="my-requests" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <Users className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('alkhayr.nav.myRequests')}</span>
                                </TabsTrigger>

                                <TabsTrigger value="diaspora" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                    <UserPlus className="h-4 w-4" />
                                    <span className="hidden sm:inline">{t('alkhayr.nav.diaspora')}</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="min-h-[60vh] animate-in fade-in duration-500">
                            <TabsContent value="local" className="space-y-6">
                                <LocalMedicineForm />
                            </TabsContent>

                            <TabsContent value="foreign" className="space-y-6">
                                <ForeignMedicineForm />
                            </TabsContent>

                            <TabsContent value="requests" className="space-y-6">
                                <HumanitarianRequestsList />
                            </TabsContent>

                            <TabsContent value="my-requests" className="space-y-6">
                                <MyRequestsView />
                            </TabsContent>

                            <TabsContent value="diaspora" className="space-y-6">
                                <DiasporaRegistrationForm />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </Section>
        </AppLayout>
    );
};

export default UnifiedRequestsLegacy;
