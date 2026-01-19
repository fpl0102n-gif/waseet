import AppLayout from "@/components/AppLayout";
import { Mail, MessageCircle, Send, Facebook, Instagram, Video, Heart, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  const alkhayrChannels = [
    {
      icon: <Mail className="h-6 w-6" />,
      label: "Email",
      link: "mailto:alkhayr@waseet.store",
      color: "text-green-700",
      bg: "bg-green-50 hover:bg-green-100",
      border: "border-green-100"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      label: "WhatsApp",
      link: "https://wa.me/15878421051",
      color: "text-green-600",
      bg: "bg-green-50 hover:bg-green-100",
      border: "border-green-100"
    },
    {
      icon: <Send className="h-6 w-6" />,
      label: "Telegram",
      link: "https://t.me/waseetalkhayr",
      color: "text-blue-500",
      bg: "bg-green-50 hover:bg-green-100",
      border: "border-green-100"
    },
    {
      icon: <Facebook className="h-6 w-6" />,
      label: "Facebook",
      link: "https://www.facebook.com/profile.php?id=61586227243016",
      color: "text-blue-700",
      bg: "bg-green-50 hover:bg-green-100",
      border: "border-green-100"
    },
    {
      icon: <Instagram className="h-6 w-6" />,
      label: "Instagram",
      link: "https://instagram.com/waseet.alkhayr",
      color: "text-pink-600",
      bg: "bg-green-50 hover:bg-green-100",
      border: "border-green-100"
    },
    {
      icon: <Video className="h-6 w-6" />,
      label: "TikTok",
      link: "https://tiktok.com/@waseet.alkhayr",
      color: "text-black",
      bg: "bg-green-50 hover:bg-green-100",
      border: "border-green-100"
    }
  ];

  const waseetChannels = [
    {
      icon: <Mail className="h-6 w-6" />,
      label: "Email",
      link: "mailto:support@waseet.store",
      color: "text-blue-600",
      bg: "bg-blue-50 hover:bg-blue-100",
      border: "border-blue-100"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      label: "WhatsApp",
      link: "https://wa.me/15873287505",
      color: "text-green-600",
      bg: "bg-blue-50 hover:bg-blue-100",
      border: "border-blue-100"
    },
    {
      icon: <Send className="h-6 w-6" />,
      label: "Telegram",
      link: "https://t.me/waseetstore",
      color: "text-blue-500",
      bg: "bg-blue-50 hover:bg-blue-100",
      border: "border-blue-100"
    },
    {
      icon: <Facebook className="h-6 w-6" />,
      label: "Facebook",
      link: "https://www.facebook.com/profile.php?id=61585887913642",
      color: "text-blue-700",
      bg: "bg-blue-50 hover:bg-blue-100",
      border: "border-blue-100"
    },
    {
      icon: <Instagram className="h-6 w-6" />,
      label: "Instagram",
      link: "https://instagram.com/waseet.official",
      color: "text-pink-600",
      bg: "bg-blue-50 hover:bg-blue-100",
      border: "border-blue-100"
    },
    {
      icon: <Video className="h-6 w-6" />,
      label: "TikTok",
      link: "https://tiktok.com/@waseetofficial",
      color: "text-black",
      bg: "bg-blue-50 hover:bg-blue-100",
      border: "border-blue-100"
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{t('contact.title')}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('contact.subtitle')}</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">

            {/* Section 1: Al-Khayr & Blood */}
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-2 mb-6">
                <div className="p-3 bg-green-100 rounded-2xl shadow-sm">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Al-Khayr & Blood Donation</h2>
                  <p className="text-sm text-gray-500 font-medium">Humanitarian aid & blood donation services</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {alkhayrChannels.map((channel, idx) => (
                  <a
                    key={idx}
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 border ${channel.border} ${channel.bg} shadow-sm hover:shadow-md hover:-translate-y-1 group cursor-pointer`}
                  >
                    <div className={`mb-3 p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform ${channel.color}`}>
                      {channel.icon}
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 text-sm">{channel.label}</span>
                  </a>
                ))}
              </div>

            </div>

            {/* Section 2: Waseet Platform */}
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-2 mb-6">
                <div className="p-3 bg-blue-100 rounded-2xl shadow-sm">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Waseet – Platform Services</h2>
                  <p className="text-sm text-gray-500 font-medium">Orders, exchange, agents, and general support</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {waseetChannels.map((channel, idx) => (
                  <a
                    key={idx}
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 border ${channel.border} ${channel.bg} shadow-sm hover:shadow-md hover:-translate-y-1 group cursor-pointer`}
                  >
                    <div className={`mb-3 p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform ${channel.color}`}>
                      {channel.icon}
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 text-sm">{channel.label}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-gray-200 text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-primary/80 font-bold text-xl tracking-tight">
              <span>Waseet</span>
            </div>
            <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              We never share your contact data
            </p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default Contact;
