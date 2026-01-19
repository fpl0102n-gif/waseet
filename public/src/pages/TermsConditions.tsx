
import { AppLayout } from "@/components/AppLayout";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, CheckCircle, AlertTriangle, UserX, Shield, FileText, Globe, Gavel } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

/**
 * Terms & Conditions Page
 * Defines clear rules and limits for the Waseet platform (Brokerage/Intermediary context).
 */
const TermsConditions = () => {
    const { t } = useTranslation();
    return (
        <AppLayout>
            <Section id="terms-conditions" className="bg-gray-50/50">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{t('terms.title')}</h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            {t('terms.subtitle')}
                        </p>
                    </div>

                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-8 md:p-12 space-y-10">

                            {/* 1. Acceptance */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <CheckCircle className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.acceptance.title')}</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    {t('terms.acceptance.desc')}
                                </p>
                            </section>

                            {/* 2. Description of Service */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Globe className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.description.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    <Trans i18nKey="terms.description.desc" components={{ strong: <strong /> }} />
                                </p>
                                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-100 italic">
                                    {t('terms.description.note')}
                                </div>
                            </section>

                            {/* 3. User Responsibilities */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <UserX className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.responsibilities.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    {t('terms.responsibilities.desc')}
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>{t('terms.responsibilities.items.1')}</li>
                                    <li>{t('terms.responsibilities.items.2')}</li>
                                    <li>{t('terms.responsibilities.items.3')}</li>
                                    <li>{t('terms.responsibilities.items.4')}</li>
                                </ul>
                                <p className="text-red-600 font-medium text-sm mt-2">
                                    {t('terms.responsibilities.warning')}
                                </p>
                            </section>

                            {/* 4. Humanitarian & Blood Disclaimer */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <AlertTriangle className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.humanitarian.title')}</h2>
                                </div>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        <Trans i18nKey="terms.humanitarian.items.alkhayr" components={{ strong: <strong /> }} />
                                    </p>
                                    <p>
                                        <Trans i18nKey="terms.humanitarian.items.blood" components={{ strong: <strong /> }} />
                                    </p>
                                    <p>
                                        <Trans i18nKey="terms.humanitarian.items.transport" components={{ strong: <strong /> }} />
                                    </p>
                                </div>
                            </section>

                            {/* 5. Brokerage & Exchange Disclaimer */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Scale className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.brokerage.title')}</h2>
                                </div>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>{t('terms.brokerage.items.1')}</li>
                                    <li>{t('terms.brokerage.items.2')}</li>
                                    <li>{t('terms.brokerage.items.3')}</li>
                                </ul>
                            </section>

                            {/* 6. Platform as Intermediary */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Shield className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.intermediary.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    {t('terms.intermediary.desc')}
                                </p>
                            </section>

                            {/* 7. Moderation Rights */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <Gavel className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.moderation.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    {t('terms.moderation.desc')}
                                </p>
                                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                    <li>{t('terms.moderation.items.1')}</li>
                                    <li>{t('terms.moderation.items.2')}</li>
                                    <li>{t('terms.moderation.items.3')}</li>
                                </ul>
                            </section>

                            {/* 8. Limitation of Liability */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <AlertTriangle className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.liability.title')}</h2>
                                </div>
                                <p className="text-gray-700">
                                    {t('terms.liability.desc')}
                                </p>
                            </section>

                            {/* 9. Privacy & Others */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 text-primary">
                                    <FileText className="w-6 h-6" />
                                    <h2 className="text-2xl font-semibold text-gray-900">{t('terms.misc.title')}</h2>
                                </div>
                                <div className="space-y-3 text-gray-700">
                                    <p>
                                        <Trans i18nKey="terms.misc.items.privacy" components={{ strong: <strong />, a: <a href="/privacy" className="text-primary hover:underline" /> }} />
                                    </p>
                                    <p>
                                        <Trans i18nKey="terms.misc.items.changes" components={{ strong: <strong /> }} />
                                    </p>
                                    <p>
                                        <Trans i18nKey="terms.misc.items.legal" components={{ strong: <strong /> }} />
                                    </p>
                                </div>
                            </section>

                            {/* Contact Footer */}
                            <div className="border-t pt-8 mt-12 text-center">
                                <p className="text-gray-600 mb-4">{t('terms.footer.question')}</p>
                                <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">
                                    {t('terms.footer.contact')}
                                </a>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </Section>
        </AppLayout>
    );
};

export default TermsConditions;
