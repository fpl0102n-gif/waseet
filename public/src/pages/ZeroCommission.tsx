import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Heart, Eye, Scale } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import Section from '@/components/ui/section';

const ZeroCommission = () => {
  const { t } = useTranslation();

  const principles = [
    {
      icon: Heart,
      title: t('alkhayr.zeroCommission.principle1Title'),
      description: t('alkhayr.zeroCommission.principle1Desc'),
      color: 'text-red-500'
    },
    {
      icon: Shield,
      title: t('alkhayr.zeroCommission.principle2Title'),
      description: t('alkhayr.zeroCommission.principle2Desc'),
      color: 'text-green-500'
    },
    {
      icon: Eye,
      title: t('alkhayr.zeroCommission.principle3Title'),
      description: t('alkhayr.zeroCommission.principle3Desc'),
      color: 'text-blue-500'
    },
    {
      icon: Scale,
      title: t('alkhayr.zeroCommission.principle4Title'),
      description: t('alkhayr.zeroCommission.principle4Desc'),
      color: 'text-purple-500'
    }
  ];

  return (
    <AppLayout>
      <Section id="alkhayr-zero" title={t('alkhayr.zeroCommission.title')} subtitle={t('alkhayr.zeroCommission.subtitle')} padding="md" variant="charity">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gray-50 ${principle.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{principle.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{principle.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-center text-gray-700">
                {t('alkhayr.zeroCommission.commercial')}
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </AppLayout>
  );
};

export default ZeroCommission;
