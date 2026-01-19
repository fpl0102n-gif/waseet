import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Section from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Info, ShieldCheck, Truck, Globe, Users, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <Section padding="lg">
          <div className="max-w-4xl mx-auto space-y-16">

            {/* 1. Header & Identity */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {t('about.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                {t('about.hero.subtitle')}
              </p>
            </div>

            {/* 2. What is Waseet */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  {t('about.what.title')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.what.desc1')}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <Trans i18nKey="about.what.desc2" components={{ strong: <strong /> }} />
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-background/50 border-primary/20">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <span className="font-semibold">{t('about.what.cards.mediated')}</span>
                  </CardContent>
                </Card>
                <Card className="bg-background/50 border-primary/20">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                    <ShieldCheck className="h-8 w-8 text-primary mb-2" />
                    <span className="font-semibold">{t('about.what.cards.secure')}</span>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 3. Core Services */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">{t('about.services.title')}</h2>
                <p className="text-muted-foreground">{t('about.services.subtitle')}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Store */}
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{t('about.services.cards.store.title')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('about.services.cards.store.desc')}
                    </p>
                  </CardContent>
                </Card>

                {/* Exchange */}
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold">{t('about.services.cards.exchange.title')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('about.services.cards.exchange.desc')}
                    </p>
                  </CardContent>
                </Card>

                {/* Import & Logistics */}
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-xl font-semibold">{t('about.services.cards.import.title')}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t('about.services.cards.import.desc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 4. How It Works */}
            <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-8 text-center">{t('about.how.title')}</h2>
              <div className="grid gap-8 md:grid-cols-4 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-0.5 bg-border -z-10" />

                <div className="flex flex-col items-center text-center space-y-3 bg-background/80 p-4 rounded-xl backdrop-blur-sm md:bg-transparent md:p-0">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">1</div>
                  <h4 className="font-semibold">{t('about.how.steps.1.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('about.how.steps.1.desc')}</p>
                </div>

                <div className="flex flex-col items-center text-center space-y-3 bg-background/80 p-4 rounded-xl backdrop-blur-sm md:bg-transparent md:p-0">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">2</div>
                  <h4 className="font-semibold">{t('about.how.steps.2.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('about.how.steps.2.desc')}</p>
                </div>

                <div className="flex flex-col items-center text-center space-y-3 bg-background/80 p-4 rounded-xl backdrop-blur-sm md:bg-transparent md:p-0">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">3</div>
                  <h4 className="font-semibold">{t('about.how.steps.3.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('about.how.steps.3.desc')}</p>
                </div>

                <div className="flex flex-col items-center text-center space-y-3 bg-background/80 p-4 rounded-xl backdrop-blur-sm md:bg-transparent md:p-0">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">4</div>
                  <h4 className="font-semibold">{t('about.how.steps.4.title')}</h4>
                  <p className="text-sm text-muted-foreground">{t('about.how.steps.4.desc')}</p>
                </div>
              </div>
            </div>

            {/* 5. Transparency & Trust (What We Are Not) */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  {t('about.why.title')}
                </h2>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium block">{t('about.why.items.adapted.title')}</span>
                      <span className="text-sm text-muted-foreground">{t('about.why.items.adapted.desc')}</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium block">{t('about.why.items.human.title')}</span>
                      <span className="text-sm text-muted-foreground">{t('about.why.items.human.desc')}</span>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium block">{t('about.why.items.centralized.title')}</span>
                      <span className="text-sm text-muted-foreground">{t('about.why.items.centralized.desc')}</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-destructive/5 rounded-xl p-6 border border-destructive/10">
                <h3 className="text-lg font-bold text-destructive flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  {t('about.notice.title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('about.notice.desc')}
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-destructive font-bold">•</span>
                    <span className="text-muted-foreground"><Trans i18nKey="about.notice.items.1" components={{ strong: <strong /> }} /></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive font-bold">•</span>
                    <span className="text-muted-foreground"><Trans i18nKey="about.notice.items.2" components={{ strong: <strong /> }} /></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive font-bold">•</span>
                    <span className="text-muted-foreground"><Trans i18nKey="about.notice.items.3" components={{ strong: <strong /> }} /></span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 6. Contact / Support */}
            <div className="text-center pt-8 border-t">
              <h2 className="text-2xl font-bold mb-4">{t('about.footer.title')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('about.footer.desc')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full">
                  <HelpCircle className="h-4 w-4" />
                  <span>{t('about.footer.support')}</span>
                </div>
              </div>
            </div>

          </div>
        </Section>
      </div>
    </AppLayout>
  );
};

export default About;
