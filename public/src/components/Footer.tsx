import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useTranslation } from "react-i18next";
import { Facebook, Instagram, Send, ShieldCheck } from "lucide-react";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-[#E7E5E4] bg-[#F7F3EE] text-[#5F5B57]">
      <div className="app-shell py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logo} alt="Waseet Logo" className="h-10 w-auto drop-shadow-sm transition-transform duration-fast group-hover:scale-105" />
              <span className="text-lg font-semibold tracking-tight text-[#2D2A26]">Waseet</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#5F5B57] max-w-xs">
              {t('footer.brandDesc')}
            </p>
          </div>

          {/* Column 2: Services */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-[#2D2A26] uppercase opacity-90">{t('footer.services')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-[#F4A261] transition-colors">{t('nav.store')}</Link></li>
              <li><Link to="/order" className="hover:text-[#F4A261] transition-colors">{t('footer.order')}</Link></li>
              <li><Link to="/track" className="hover:text-[#F4A261] transition-colors">{t('footer.trackOrder')}</Link></li>
              <li><Link to="/exchange" className="hover:text-[#F4A261] transition-colors">{t('footer.exchange')}</Link></li>
              <li><Link to="/import-request" className="hover:text-[#F4A261] transition-colors">{t('footer.importRequest')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Support & Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wide text-[#2D2A26] uppercase opacity-90">{t('footer.support')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="hover:text-[#F4A261] transition-colors">{t('footer.contact')}</Link></li>
              <li><Link to="/verify" className="hover:text-[#F4A261] transition-colors">{t('nav.verify')}</Link></li>
              <li><Link to="/about" className="hover:text-[#F4A261] transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/faq" className="hover:text-[#F4A261] transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-[#F4A261] transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-[#F4A261] transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Social & Trust */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold tracking-wide text-[#2D2A26] uppercase opacity-90">{t('footer.connect')}</h4>
              <div className="flex items-center gap-4">
                <a href="https://t.me/waseet" target="_blank" rel="noreferrer my-0" className="bg-white p-2 rounded-full shadow-sm text-[#2D2A26] hover:text-[#0088cc] hover:shadow-md transition-all">
                  <Send className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="bg-white p-2 rounded-full shadow-sm text-[#2D2A26] hover:text-[#1877F2] hover:shadow-md transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-white p-2 rounded-full shadow-sm text-[#2D2A26] hover:text-[#E4405F] hover:shadow-md transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8A857F] bg-white/50 p-3 rounded-lg border border-[#E7E5E4]/50">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>{t('footer.verified_badge')}</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[#E7E5E4] pt-8">
          <p className="text-xs text-[#8A857F]">© {new Date().getFullYear()} Waseet. {t('footer.rights')}</p>
          <div className="flex items-center gap-6 text-xs text-[#8A857F]">
            <Link to="/privacy" className="hover:text-[#F4A261] transition-colors">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-[#F4A261] transition-colors">{t('footer.terms')}</Link>
            <Link to="/cookies" className="hover:text-[#F4A261] transition-colors">{t('footer.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
