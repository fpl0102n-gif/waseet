import { useParams, useLocation, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const Success = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { total, name, contactType, contactValue } = location.state || {};
  const { t } = useTranslation();

  const shareOnWhatsApp = () => {
    const message = `My Waseet Order #${orderId}\n\nTotal: $${total}\nName: ${name}\n\nThank you for using Waseet!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-success">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 rounded-full bg-success/10 w-16 h-16 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl">{t('success.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">{t('success.processing')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('success.contactSoon', { type: contactType === 'whatsapp' ? 'WhatsApp' : 'Telegram', value: contactValue })}
                </p>
              </div>

              <div className="p-6 bg-muted/50 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('success.orderId')}</span>
                  <span className="font-mono font-semibold text-lg">#{orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t('success.customerName')}</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-medium">{t('success.totalAmount')}</span>
                  <span className="text-2xl font-bold text-primary">${total}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={shareOnWhatsApp} 
                  variant="outline" 
                  className="w-full"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('success.shareWhatsapp')}
                </Button>
                
                <Link to="/" className="block">
                  <Button className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    {t('success.returnHome')}
                  </Button>
                </Link>
              </div>

              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  {t('success.questions')}
                  <Link to="/contact" className="text-primary hover:underline font-medium">
                    {t('success.contactPage')}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Success;
