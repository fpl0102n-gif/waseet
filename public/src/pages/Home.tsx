import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Section from '@/components/ui/section';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  RefreshCcw, // For Exchange
  Globe, // For Import
  Search, // For Tracking
  CheckCircle,
  Bell,
  ShieldAlert,
  Users,
  ArrowRight,
  ShieldCheck,
  Truck
} from "lucide-react";
import { useTranslation, Trans } from "react-i18next";

const Home = () => {
  const { t } = useTranslation();

  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AppLayout>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#D6D3D1] bg-[#E7E5E4] dark:bg-background">
        <div className="container relative py-12 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-[#2D2A26] dark:text-white leading-tight">
              {t('home.hero.title_prefix')} <br />
              <span className="text-[#5F5B57] dark:text-stone-400">{t('home.hero.title_highlight')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#5F5B57] dark:text-stone-300 leading-relaxed max-w-2xl mx-auto px-4">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 px-4">
              <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base bg-[#F4A261] hover:bg-[#E76F51] text-white shadow-md transition-all" onClick={scrollToServices}>
                {t('home.hero.cta_explore')}
              </Button>
              <Link to="/track" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="h-12 w-full sm:w-auto px-8 text-base border-[#E7E5E4] hover:bg-[#F7F3EE] text-[#5F5B57]">
                  <Search className="mr-2 h-4 w-4" />
                  {t('home.hero.cta_track')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE SERVICES SECTION */}
      <Section
        id="services"
        title={t('home.services.title')}
        subtitle={t('home.services.subtitle')}
        padding="lg"
        center
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Service 1: Store */}
          <Card className="flex flex-col h-full border border-[#E7E5E4] shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-[#F7F3EE] flex items-center justify-center text-[#F4A261] mb-4">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-[#2D2A26]">{t('home.services.marketplace.title')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-[#5F5B57] leading-relaxed">
                {t('home.services.marketplace.desc')}
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/store" className="w-full">
                <Button variant="outline" className="w-full border-[#E7E5E4] text-[#5F5B57] hover:bg-[#F7F3EE] min-h-[44px]">{t('home.services.marketplace.btn')}</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Service 2: Exchange */}
          <Card className="flex flex-col h-full border border-[#E7E5E4] shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-[#F7F3EE] flex items-center justify-center text-[#F4A261] mb-4">
                <RefreshCcw className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-[#2D2A26]">{t('home.services.exchange.title')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-[#5F5B57] leading-relaxed">
                {t('home.services.exchange.desc')}
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/exchange" className="w-full">
                <Button variant="outline" className="w-full border-[#E7E5E4] text-[#5F5B57] hover:bg-[#F7F3EE] min-h-[44px]">{t('home.services.exchange.btn')}</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Service 3: Import */}
          <Card className="flex flex-col h-full border border-[#E7E5E4] shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-[#F7F3EE] flex items-center justify-center text-[#F4A261] mb-4">
                <Globe className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-[#2D2A26]">{t('home.services.import.title')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-[#5F5B57] leading-relaxed">
                {t('home.services.import.desc')}
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/import-request" className="w-full">
                <Button variant="outline" className="w-full border-[#E7E5E4] text-[#5F5B57] hover:bg-[#F7F3EE] min-h-[44px]">{t('home.services.import.btn')}</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Service 4: Tracking */}
          <Card className="flex flex-col h-full border border-[#E7E5E4] shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-[#F7F3EE] flex items-center justify-center text-[#F4A261] mb-4">
                <Search className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-[#2D2A26]">{t('home.services.tracking.title')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-[#5F5B57] leading-relaxed">
                {t('home.services.tracking.desc')}
              </p>
            </CardContent>
            <CardFooter>
              <Link to="/track" className="w-full">
                <Button variant="outline" className="w-full border-[#E7E5E4] text-[#5F5B57] hover:bg-[#F7F3EE] min-h-[44px]">{t('home.services.tracking.btn')}</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* 3. HOW IT WORKS */}
      <Section
        title={t('home.how.title')}
        subtitle={t('home.how.subtitle')}
        padding="md"
        center
        className="bg-muted/50"
      >
        <div className="max-w-5xl mx-auto mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-border -z-10" />

            {[
              { title: t('home.how.steps.1.title'), desc: t('home.how.steps.1.desc'), icon: <CheckCircle className="h-5 w-5" /> },
              { title: t('home.how.steps.2.title'), desc: t('home.how.steps.2.desc'), icon: <Users className="h-5 w-5" /> },
              { title: t('home.how.steps.3.title'), desc: t('home.how.steps.3.desc'), icon: <Bell className="h-5 w-5" /> },
              { title: t('home.how.steps.4.title'), desc: t('home.how.steps.4.desc'), icon: <Truck className="h-5 w-5" /> }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-3 bg-background/50 p-6 rounded-xl backdrop-blur-sm md:bg-transparent md:p-0">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md ring-4 ring-background">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-snug">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100 max-w-full whitespace-normal text-center">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {t('home.how.manual_note')}
            </p>
          </div>
        </div>
      </Section>

      {/* 4. TRUST SECTION */}
      <Section
        title={t('home.trust.title')}
        subtitle={t('home.trust.subtitle')}
        padding="lg"
        center
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto text-left">
          <Card className="border-none shadow-none bg-muted/30">
            <CardContent className="p-6 space-y-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg">{t('home.trust.cards.review.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.trust.cards.review.desc')}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-none bg-muted/30">
            <CardContent className="p-6 space-y-3">
              <Bell className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg">{t('home.trust.cards.comms.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.trust.cards.comms.desc')}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-none bg-muted/30">
            <CardContent className="p-6 space-y-3">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg">{t('home.trust.cards.broker.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.trust.cards.broker.desc')}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-none bg-muted/30">
            <CardContent className="p-6 space-y-3">
              <Globe className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-lg">{t('home.trust.cards.local.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('home.trust.cards.local.desc')}</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* 5. WHO IS THIS FOR */}
      <Section padding="md" className="bg-gradient-to-br from-primary/5 to-secondary/5 border-y">
        <div className="container max-w-5xl text-center space-y-10">
          <h2 className="text-3xl font-bold">{t('home.who.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="mx-auto w-12 h-1 border-t-2 border-primary mb-4" />
              <h3 className="font-semibold">{t('home.who.shoppers.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.who.shoppers.desc')}</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto w-12 h-1 border-t-2 border-primary mb-4" />
              <h3 className="font-semibold">{t('home.who.exchangers.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.who.exchangers.desc')}</p>
            </div>
            <div className="space-y-2">
              <div className="mx-auto w-12 h-1 border-t-2 border-primary mb-4" />
              <h3 className="font-semibold">{t('home.who.verification.title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.who.verification.desc')}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 6. TRANSPARENCY BLOCK */}
      <section className="py-16 bg-background">
        <div className="container max-w-3xl text-center">
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-destructive flex items-center justify-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              {t('home.transparency.title')}
            </h3>
            <ul className="text-muted-foreground space-y-2 text-sm md:text-base">
              <li>• <Trans i18nKey="home.transparency.items.1" components={{ strong: <strong /> }} /></li>
              <li>• <Trans i18nKey="home.transparency.items.2" components={{ strong: <strong /> }} /></li>
              <li>• <Trans i18nKey="home.transparency.items.3" components={{ strong: <strong /> }} /></li>
            </ul>
          </div>
        </div>
      </section>



      {/* 7. FINAL CTA */}
      <section className="py-20 bg-muted/30 border-t">
        <div className="container max-w-2xl text-center space-y-8">
          <h2 className="text-3xl font-bold">{t('home.ready.title')}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8" onClick={scrollToServices}>
              {t('home.ready.explore')}
            </Button>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="px-8">
                {t('home.ready.support')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </AppLayout>
  );
};

export default Home;
