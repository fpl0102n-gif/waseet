import { useTranslation } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import Section from '@/components/ui/section';

const AlKhayrFAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t('alkhayr.faq.q1'),
      answer: t('alkhayr.faq.a1')
    },
    {
      question: t('alkhayr.faq.q2'),
      answer: t('alkhayr.faq.a2')
    },
    {
      question: t('alkhayr.faq.q3'),
      answer: t('alkhayr.faq.a3')
    },
    {
      question: t('alkhayr.faq.q4'),
      answer: t('alkhayr.faq.a4')
    },
    {
      question: t('alkhayr.faq.q5'),
      answer: t('alkhayr.faq.a5')
    },
    {
      question: t('alkhayr.faq.q6'),
      answer: t('alkhayr.faq.a6')
    }
  ];

  return (
    <AppLayout>
      <Section id="alkhayr-faq" title={t('alkhayr.faq.title')} subtitle={t('alkhayr.faq.subtitle')} padding="md" variant="charity">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="h-16 w-16 text-primary" />
            </div>
          </div>

          <Card className="charity-glass charity-card-hover">
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </Section>
    </AppLayout>
  );
};

export default AlKhayrFAQ;
