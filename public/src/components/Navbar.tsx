import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Heart, ChevronDown, Droplet } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { CartSheet } from "@/components/cart-sheet";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    document.cookie = `i18next=${lang}; path=/; max-age=31536000; SameSite=Strict`;
  };

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/order", label: t("nav.order") },
    { to: "/track", label: t("nav.track") },
    { to: "/referral", label: t("nav.earn") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
    { to: "/import-request", label: t("nav.internationalAgent") },
  ];

  const alKhayrLinks = [
    { to: "/alkhayr/main", label: t('nav.alkhayr_label') },
    { to: "/alkhayr/zero-commission", label: t("alkhayr.nav.zeroCommission") },
    { to: "/alkhayr/faq", label: t("alkhayr.nav.faq") },
    { to: "/blood-donation", label: t('blood.title') },
  ];







  // Admin links temporarily removed from header per request

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#FFFCF9] text-[#2D2A26] border-b border-[#E7E5E4] shadow-sm" role="navigation" aria-label="Primary">
      <div className="app-shell flex py-3 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src={logo} alt="Waseet Logo" className="h-12 w-auto drop-shadow-sm transition-transform duration-fast group-hover:scale-105" />
          <span className="hidden md:inline text-lg font-semibold tracking-tight text-[#2D2A26] group-hover:text-[#F4A261] transition-colors">{t('nav.waseet')}</span>
        </Link>
        {/* Desktop Navigation */}
        <div className="hidden xl:flex items-center gap-x-3 2xl:gap-x-8">
          {/* First: Accueil */}
          <Link to="/" className="text-xs lg:text-sm font-medium text-[#5F5B57] hover:text-[#F4A261] transition-colors whitespace-nowrap">
            {t('nav.home')}
          </Link>

          {/* Second: Waseet hover dropdown (no click) */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs lg:text-sm font-medium text-[#5F5B57] hover:text-[#F4A261] transition-colors whitespace-nowrap">
              <span className="font-semibold">{t('nav.waseet')}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {/* Bridge invisible */}
            <div className="absolute top-full left-0 w-52 h-3 hidden group-hover:block"></div>
            <div className="absolute hidden group-hover:block top-full left-0 mt-3 w-52 rounded-lg border border-gray-200 bg-white shadow-lg p-2 text-gray-800">
              <div className="flex flex-col">
                <Link to="/order" className="px-3 py-2 rounded-md text-xs font-medium hover:bg-[#F7F3EE] hover:text-[#E76F51] transition-colors">
                  {t('nav.order')}
                </Link>
                <Link to="/track" className="px-3 py-2 rounded-md text-xs font-medium hover:bg-[#F7F3EE] hover:text-[#E76F51] transition-colors">
                  {t('nav.track')}
                </Link>
                <Link to="/store" className="px-3 py-2 rounded-md text-xs font-medium hover:bg-[#F7F3EE] hover:text-[#E76F51] transition-colors">
                  {t('nav.store')}
                </Link>
                <Link to="/referral" className="px-3 py-2 rounded-md text-xs font-medium hover:bg-[#F7F3EE] hover:text-[#E76F51] transition-colors">
                  {t('nav.earn')}
                </Link>
              </div>
            </div>
          </div>

          {/* Third: Exchange Link */}
          <Link to="/exchange" className="text-xs lg:text-sm font-medium text-[#5F5B57] hover:text-[#F4A261] transition-colors whitespace-nowrap">
            {t('nav.exchange')}
          </Link>

          {/* International Agent Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs lg:text-sm font-medium text-[#5F5B57] hover:text-[#F4A261] transition-colors whitespace-nowrap">
              <span>{t('nav.internationalAgent')}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {/* Bridge invisible pour maintenir le hover */}
            <div className="absolute top-full left-0 w-60 h-3 hidden group-hover:block"></div>
            <div className="absolute hidden group-hover:block top-full left-0 mt-3 w-60 rounded-lg border border-gray-200 bg-white shadow-lg p-2 text-gray-800">
              <Link to="/import-request" className="block px-3 py-2 rounded-md text-xs font-medium hover:bg-[#F7F3EE] hover:text-[#E76F51] transition-colors">
                {t('nav.agent.requestImport')}
              </Link>
              <Link to="/register-agent" className="block px-3 py-2 rounded-md text-xs font-medium hover:bg-[#F7F3EE] hover:text-[#E76F51] transition-colors">
                {t('nav.agent.registerAgent')}
              </Link>
            </div>
          </div>

          {/* Admin Dropdown removed */}

          {/* Keep About & Contact inline (sans cadre) */}
          <Link to="/about" className="text-xs lg:text-sm font-medium text-[#5F5B57] hover:text-[#F4A261] transition-colors whitespace-nowrap">
            {t('nav.about')}
          </Link>
          <Link to="/contact" className="text-xs lg:text-sm font-medium text-[#5F5B57] hover:text-[#F4A261] transition-colors whitespace-nowrap">
            {t('nav.contact')}
          </Link>

          {/* Al-Khayr Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-xs lg:text-sm font-semibold text-green-700 hover:text-green-800 transition-colors px-2 lg:px-3 py-1.5 lg:py-2 rounded-md bg-green-50 hover:bg-green-100 border border-green-200 whitespace-nowrap shadow-sm">
              <Heart className="h-4 w-4 fill-green-100 text-green-600" />
              <span>{t('nav.alkhayr_label')}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute top-full left-0 w-64 h-2 hidden group-hover:block"></div>
            <div className="absolute hidden group-hover:block top-full left-0 mt-2 w-64 rounded-lg border border-green-200 bg-white shadow-lg py-2 text-gray-800">
              {alKhayrLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-2 text-xs font-medium rounded-md transition-colors ${link.to === '/blood-donation'
                    ? 'text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 mt-2 mx-2 text-center'
                    : 'hover:bg-green-50 hover:text-green-700'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Blood Donation (Standalone) */}

          <div className="flex items-center gap-2 lg:gap-3">
            <div className="text-[#2D2A26]"><CartSheet /></div>
            <select
              aria-label="Language"
              className="text-[10px] lg:text-xs font-medium bg-gray-800 text-gray-200 border border-gray-700 rounded-md px-1.5 lg:px-2 py-1 focus-outline transition-colors"
              value={i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('ar') ? 'ar' : 'en'}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
              <option value="ar">AR</option>
            </select>
          </div>
        </div>
        {/* Mobile Actions */}
        <div className="flex items-center gap-2 xl:hidden">
          <div className="text-[#2D2A26]"><CartSheet /></div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-border bg-background/95 backdrop-blur-xl h-[calc(100vh-64px)] overflow-y-auto">
          <div className="app-shell py-4 flex flex-col space-y-2 pb-20">
            {/* Accueil */}
            <Link
              to="/"
              className="text-base font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>

            {/* Waseet Dropdown Mobile */}
            <details className="group">
              <summary className="flex items-center justify-between text-base font-semibold text-foreground/90 hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted/50 cursor-pointer list-none select-none">
                <span>{t('nav.waseet')}</span>
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-primary/20 ml-3">
                <Link to="/order" className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-3 px-3 rounded-md hover:bg-muted/50" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.order')}
                </Link>
                <Link to="/track" className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-3 px-3 rounded-md hover:bg-muted/50" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.track')}
                </Link>
                <Link to="/store" className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-3 px-3 rounded-md hover:bg-muted/50" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.store')}
                </Link>
                <Link to="/referral" className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-3 px-3 rounded-md hover:bg-muted/50" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.earn')}
                </Link>
              </div>
            </details>

            {/* Exchange */}
            <Link
              to="/exchange"
              className="text-base font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.exchange')}
            </Link>



            {/* International Agent Dropdown Mobile */}
            <details className="group">
              <summary className="flex items-center justify-between text-base font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted/50 cursor-pointer list-none select-none">
                <span>{t('nav.internationalAgent')}</span>
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-primary/20 ml-3">
                <Link to="/import-request" className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-3 px-3 rounded-md hover:bg-muted/50" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.agent.requestImport')}
                </Link>
                <Link to="/register-agent" className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-3 px-3 rounded-md hover:bg-muted/50" onClick={() => setMobileMenuOpen(false)}>
                  {t('nav.agent.registerAgent')}
                </Link>
              </div>
            </details>

            {/* About */}
            <Link
              to="/about"
              className="text-base font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              className="text-base font-medium text-foreground/90 hover:text-primary transition-colors py-3 px-4 rounded-md hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.contact')}
            </Link>

            {/* Al-Khayr Dropdown Mobile */}
            <details className="group">
              <summary className="flex items-center justify-between text-base font-semibold text-red-600 hover:text-red-700 transition-colors py-3 px-4 rounded-md bg-red-50/70 border border-red-200 cursor-pointer list-none select-none">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  <span>{t('nav.alkhayr_label')}</span>
                </div>
                <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-red-300 ml-3">
                {alKhayrLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block text-sm font-medium text-foreground/85 hover:text-red-700 transition-colors py-3 px-3 rounded-md hover:bg-red-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>

            {/* Blood Donation Custom Mobile */}


            {/* Language & Theme */}
            <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-3 px-2">
              <select
                aria-label="Language"
                className="flex-1 text-base bg-muted/40 border border-border/70 rounded-md px-3 py-3 focus-outline"
                value={i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('ar') ? 'ar' : 'en'}
                onChange={(e) => { handleLanguageChange(e.target.value); setMobileMenuOpen(false); }}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
