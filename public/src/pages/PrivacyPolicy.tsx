
import { AppLayout } from "@/components/AppLayout";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, Server, UserCheck, Scale, Globe } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

/**
 * Privacy Policy Page
 * Clear, honest, and user-friendly privacy policy tailored for Waseet/Algeria context.
 */
const PrivacyPolicy = () => {
    const { t } = useTranslation();
    return (
        <AppLayout>
            <Section id="privacy-policy" className="bg-gray-50/50">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{t('privacy.title')}</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {t('privacy.subtitle')}
                        </p>
                    </div>

                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-8 md:p-12 space-y-10">

                            {/* 1. Introduction */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Shield className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('privacy.intro.title')}</h2>
                                </div>
                                <p className="leading-relaxed text-gray-700">
                                    {t('privacy.intro.desc')}
                                </p>
                            </section>

                            {/* 2. Information We Collect */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <FileText className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('privacy.collect.title')}</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-gray-900 border-b pb-2">{t('privacy.collect.section_a')}</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                            <li>{t('privacy.collect.items_a.1')}</li>
                                            <li>{t('privacy.collect.items_a.2')}</li>
                                            <li>{t('privacy.collect.items_a.3')}</li>
                                            <li>{t('privacy.collect.items_a.4')}</li>
                                            <li>{t('privacy.collect.items_a.5')}</li>
                                            <li>{t('privacy.collect.items_a.6')}</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-gray-900 border-b pb-2">{t('privacy.collect.section_b')}</h3>
                                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                            <li>{t('privacy.collect.items_b.1')}</li>
                                            <li>{t('privacy.collect.items_b.2')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* 3. How We Use Your Information */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Server className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('privacy.use.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    {t('privacy.use.desc')}
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>{t('privacy.use.items.1')}</li>
                                    <li>{t('privacy.use.items.2')}</li>
                                    <li>{t('privacy.use.items.3')}</li>
                                    <li>{t('privacy.use.items.4')}</li>
                                    <li>{t('privacy.use.items.5')}</li>
                                </ul>
                                <div className="bg-green-50 text-green-800 p-4 rounded-lg font-medium border border-green-100 mt-4 text-center">
                                    {t('privacy.use.note')}
                                </div>
                            </section>

                            {/* 4. Data Visibility & Human Review */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <UserCheck className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('privacy.visibility.title')}</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    <Trans i18nKey="privacy.visibility.desc" components={{ strong: <strong /> }} />
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>{t('privacy.visibility.items.1')}</li>
                                    <li>{t('privacy.visibility.items.2')}</li>
                                    <li>{t('privacy.visibility.items.3')}</li>
                                </ul>
                            </section>

                            {/* 5. Data Sharing */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Globe className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('privacy.sharing.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    {t('privacy.sharing.desc')}
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                    <li>{t('privacy.sharing.items.1')}</li>
                                    <li>{t('privacy.sharing.items.2')}</li>
                                    <li>{t('privacy.sharing.items.3')}</li>
                                </ul>
                                <p className="text-gray-600 italic mt-2">
                                    {t('privacy.sharing.note')}
                                </p>
                            </section>

                            {/* 6. Cookies & Storage */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Lock className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('privacy.cookies.title')}</h2>
                                </div>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        <Trans i18nKey="privacy.cookies.items.cookies" components={{ strong: <strong /> }} />
                                    </p>
                                    <p>
                                        <Trans i18nKey="privacy.cookies.items.security" components={{ strong: <strong /> }} />
                                    </p>
                                    <p>
                                        <Trans i18nKey="privacy.cookies.items.duration" components={{ strong: <strong /> }} />
                                    </p>
                                </div>
                            </section>

                            {/* 7. User Rights */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Scale className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('privacy.rights.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    {t('privacy.rights.desc')}
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                    <li>{t('privacy.rights.items.1')}</li>
                                    <li>{t('privacy.rights.items.2')}</li>
                                    <li>{t('privacy.rights.items.3')}</li>
                                </ul>
                            </section>

                            {/* 8. Legal & Changes */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Eye className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('privacy.legal.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    <Trans i18nKey="privacy.legal.items.intermediary" components={{ strong: <strong /> }} />
                                </p>
                                <p className="text-gray-700">
                                    <Trans i18nKey="privacy.legal.items.children" components={{ strong: <strong /> }} />
                                </p>
                                <p className="text-gray-700">
                                    <Trans i18nKey="privacy.legal.items.updates" components={{ strong: <strong /> }} />
                                </p>
                            </section>

                            {/* Contact Footer */}
                            <div className="border-t pt-8 mt-12 text-center">
                                <p className="text-gray-600 mb-4">{t('privacy.footer.question')}</p>
                                <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">
                                    {t('privacy.footer.contact')}
                                </a>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </Section>
        </AppLayout>
    );
};

export default PrivacyPolicy;
