import { ReactNode, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AppLayout({ children, className = '' }: AppLayoutProps) {
  const location = useLocation();

  const themedClass = useMemo(() => {
    const p = location.pathname;
    const charityPaths = [
      '/alkhayr/foreign',
      '/alkhayr/my-requests',
      '/alkhayr/diaspora',
      '/alkhayr/requests',
      '/alkhayr/local',
      '/alkhayr/zero-commission',
      '/alkhayr/faq',
      // unprefixed fallbacks
      '/foreign',
      '/my-requests',
      '/diaspora',
      '/requests',
      '/local',
      '/zero-commission',
      '/faq',
    ];
    return charityPaths.some((prefix) => p.startsWith(prefix)) ? 'theme-charity' : '';
  }, [location.pathname]);

  useEffect(() => {
    const body = document.body;
    if (themedClass) {
      body.classList.add(themedClass);
    } else {
      body.classList.remove('theme-charity');
    }
    return () => {
      body.classList.remove('theme-charity');
    };
  }, [themedClass]);

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Navbar />
      <main id="app-main" role="main" className="flex-1" aria-label="Main Content Area">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
