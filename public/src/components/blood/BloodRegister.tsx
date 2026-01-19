import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Droplet, Heart, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ALGERIAN_WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
    'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Menia'
];

const BloodRegister = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registeredPhoneNumber, setRegisteredPhoneNumber] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        age: '',
        bloodType: '',
        lastDonationDate: '',
        wilaya: '',
        city: '',
        medicalConditions: '',
        willingToBeContacted: true,
        canShareInfo: true,
        contactApp: 'aucun',
        whatsappNumber: '',
        telegramUsername: ''
    });

    const validateForm = () => {
        if (!formData.wilaya) {
            toast({ title: 'Erreur', description: t('blood.register.errors.wilaya'), variant: 'destructive' });
            return false;
        }
        if (!formData.city.trim()) {
            toast({ title: 'Erreur', description: t('blood.register.errors.city'), variant: 'destructive' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            // Check for existing donor with this phone number
            const { data: existingDonor } = await supabase
                .rpc('get_donor_by_phone', { phone: formData.phoneNumber.trim() })
                .maybeSingle();

            if (existingDonor) {
                toast({
                    title: 'Erreur',
                    description: t('blood.register.errors.duplicate_phone') || 'Ce numéro est déjà enregistré/This number is already registered.',
                    variant: 'destructive'
                });
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('blood_donors')
                .insert({
                    full_name: formData.fullName,
                    phone_number: formData.phoneNumber,
                    email: formData.email || null,
                    age: parseInt(formData.age),
                    blood_type: formData.bloodType,
                    last_donation_date: formData.lastDonationDate || null,
                    wilaya: formData.wilaya,
                    city: formData.city,
                    medical_conditions: formData.medicalConditions || null,
                    willing_to_be_contacted: formData.willingToBeContacted,
                    can_share_info: formData.canShareInfo,
                    is_active: true,
                    approved_by_admin: false,
                    contact_app: formData.contactApp,
                    whatsapp_number: formData.contactApp === 'whatsapp' ? formData.whatsappNumber : null,
                    telegram_username: formData.contactApp === 'telegram' ? formData.telegramUsername : null
                });

            if (error) {
                console.error('Error registering donor:', error);
                toast({ title: 'Erreur', description: t('blood.register.errors.reg_error'), variant: 'destructive' });
                return;
            }

            toast({ title: t('blood.register.success_title'), description: t('blood.register.success_desc') });
            setRegistrationSuccess(true);
            setRegisteredPhoneNumber(formData.phoneNumber);
            setFormData({
                fullName: '', phoneNumber: '', email: '', age: '', bloodType: '', lastDonationDate: '', wilaya: '', city: '',
                medicalConditions: '', willingToBeContacted: true, canShareInfo: true, contactApp: 'aucun', whatsappNumber: '', telegramUsername: ''
            });

            // Send Email Notification
            supabase.functions.invoke('send-email', {
                body: {
                    type: 'blood_donor_registration',
                    record: {
                        full_name: formData.fullName,
                        phone_number: formData.phoneNumber,
                        email: formData.email,
                        age: formData.age,
                        blood_type: formData.bloodType,
                        last_donation_date: formData.lastDonationDate,
                        wilaya: formData.wilaya,
                        city: formData.city,
                        medical_conditions: formData.medicalConditions
                    }
                }
            }).then(({ error }) => {
                if (error) console.error('Email Error:', error);
            });
        } catch (error) {
            console.error('Error:', error);
            toast({ title: 'Erreur', description: t('blood.register.errors.unexpected'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    if (registrationSuccess) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Card className="border-[#C62828]/20 bg-[#FDECEA]/50 shadow-lg text-center p-8">
                    <CardContent className="space-y-6">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-[#1F2933]">{t('blood.register.success_title')}</h3>
                            <p className="text-[#374151]">
                                {t('blood.register.success_desc')}
                            </p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={() => document.querySelector('[value="profile"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                                className="bg-[#C62828] hover:bg-[#8E0000] text-white"
                            >
                                {t('blood.register.btn_profile')}
                            </Button>
                            <Button variant="outline" onClick={() => setRegistrationSuccess(false)}>
                                {t('blood.register.btn_another')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="text-center pb-8">
                    <CardTitle className="text-3xl font-bold text-[#8E0000]">{t('blood.register.title')}</CardTitle>
                    <CardDescription className="text-lg">
                        {t('blood.register.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Personal Info */}
                        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2 text-[#C62828]">
                                <Phone className="h-5 w-5" /> {t('blood.register.personal_info')}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">{t('blood.register.full_name')}</Label>
                                    <Input
                                        id="fullName"
                                        className="focus-visible:ring-[#C62828]"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">{t('blood.register.phone')}</Label>
                                    <Input
                                        id="phoneNumber"
                                        type="tel"
                                        className="focus-visible:ring-[#C62828]"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t('blood.register.email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="focus-visible:ring-[#C62828]"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="age">{t('blood.register.age')}</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        min="18"
                                        max="65"
                                        className="focus-visible:ring-[#C62828]"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Blood & Location */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-[#C62828]">
                                    <Droplet className="h-5 w-5" /> {t('blood.register.blood_info')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bloodType">{t('blood.register.blood_type')}</Label>
                                        <Select value={formData.bloodType} onValueChange={(value) => setFormData({ ...formData, bloodType: value })}>
                                            <SelectTrigger className="focus:ring-[#C62828]"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                            <SelectContent>{BLOOD_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastDonationDate">{t('blood.register.last_donation')}</Label>
                                        <Input
                                            id="lastDonationDate"
                                            type="date"
                                            className="focus-visible:ring-[#C62828]"
                                            value={formData.lastDonationDate}
                                            onChange={(e) => setFormData({ ...formData, lastDonationDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-[#C62828]">
                                    <MapPin className="h-5 w-5" /> {t('blood.register.location')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="wilaya">{t('blood.register.wilaya')}</Label>
                                        <Select value={formData.wilaya} onValueChange={(value) => setFormData({ ...formData, wilaya: value })}>
                                            <SelectTrigger className="focus:ring-[#C62828] h-11"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                                            <SelectContent className="max-h-[300px]">{ALGERIAN_WILAYAS.map(wilaya => <SelectItem key={wilaya} value={wilaya}>{wilaya}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="city">{t('blood.register.city')}</Label>
                                        <Input
                                            id="city"
                                            className="focus-visible:ring-[#C62828]"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medical & Consent */}
                        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="medicalConditions">{t('blood.register.medical_info')}</Label>
                                <Textarea
                                    id="medicalConditions"
                                    className="focus-visible:ring-[#C62828]"
                                    value={formData.medicalConditions}
                                    onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-red-100">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="willingToBeContacted"
                                        className="data-[state=checked]:bg-[#C62828] border-red-200"
                                        checked={formData.willingToBeContacted}
                                        onCheckedChange={(c) => setFormData({ ...formData, willingToBeContacted: c as boolean })}
                                    />
                                    <label htmlFor="willingToBeContacted" className="text-sm cursor-pointer">{t('blood.register.consent_contact')}</label>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="canShareInfo"
                                        className="data-[state=checked]:bg-[#C62828] border-red-200"
                                        checked={formData.canShareInfo}
                                        onCheckedChange={(c) => setFormData({ ...formData, canShareInfo: c as boolean })}
                                    />
                                    <label htmlFor="canShareInfo" className="text-sm cursor-pointer">{t('blood.register.consent_public')}</label>
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-semibold bg-[#C62828] hover:bg-[#8E0000] shadow-md transition-all duration-300 transform hover:scale-[1.01]"
                            disabled={loading}
                        >
                            {loading ? t('blood.register.submitting') : t('blood.register.submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8 bg-[#FDECEA] border border-[#ffcdd2] rounded-xl p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="bg-white p-3 rounded-full shadow-sm">
                        <Heart className="h-6 w-6 text-[#C62828]" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-bold text-[#8E0000] mb-1">{t('blood.register.eligibility_title')}</h4>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-[#1F2933]">
                            <span className="flex items-center gap-1">✅ {t('blood.register.criteria_age')}</span>
                            <span className="flex items-center gap-1">✅ {t('blood.register.criteria_weight')}</span>
                            <span className="flex items-center gap-1">✅ {t('blood.register.criteria_health')}</span>
                            <span className="flex items-center gap-1">✅ {t('blood.register.criteria_recent')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BloodRegister;
