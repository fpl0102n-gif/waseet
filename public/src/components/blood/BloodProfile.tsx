import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Edit, Save, Calendar, CheckCircle, AlertCircle, LogOut } from 'lucide-react';

interface DonorData {
    id: number;
    full_name: string;
    phone_number: string;
    email: string | null;
    age: number;
    blood_type: string;
    last_donation_date: string | null;
    wilaya: string;
    city: string;
    medical_conditions: string | null;
    willing_to_be_contacted: boolean;
    can_share_info: boolean;
    is_active: boolean;
    created_at: string;
}

const BloodProfile = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [donor, setDonor] = useState<DonorData | null>(null);
    const [phoneSearch, setPhoneSearch] = useState(location.state?.phoneNumber || '');

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editedLastDonation, setEditedLastDonation] = useState('');

    // Profile Edit State
    const [editingProfile, setEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState({ can_share_info: false, willing_to_be_contacted: false });

    useEffect(() => {
        if (donor) {
            setEditedProfile({
                can_share_info: donor.can_share_info,
                willing_to_be_contacted: donor.willing_to_be_contacted
            });
        }
    }, [donor]);

    // Handle Profile Update
    const handleUpdateProfile = async () => {
        if (!donor) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('blood_donors')
                .update({
                    can_share_info: editedProfile.can_share_info,
                    willing_to_be_contacted: editedProfile.willing_to_be_contacted
                })
                .eq('id', donor.id);

            if (error) throw error;

            toast({ title: t('alkhayr_public.details.success'), description: t('blood.profile.update_success') });
            setDonor({
                ...donor,
                can_share_info: editedProfile.can_share_info,
                willing_to_be_contacted: editedProfile.willing_to_be_contacted
            });
            setEditingProfile(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({ title: t('alkhayr_public.details.error'), description: t('blood.profile.update_error'), variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (phoneSearch && location.state?.phoneNumber) {
            fetchDonor(phoneSearch);
        }
    }, []);

    const fetchDonor = async (phone: string) => {
        if (!phone.trim()) {
            toast({ title: t('alkhayr_public.details.error'), description: t('blood.profile.errors.enter_phone'), variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .rpc('get_donor_by_phone', { phone: phone.trim() })
                .maybeSingle();

            if (error || !data) {
                toast({
                    title: t('blood.profile.donor_not_found'),
                    description: t('blood.profile.donor_not_found_desc'),
                    variant: 'destructive'
                });
                setDonor(null);
                // Switch to register tab if not found?
                // document.querySelector('[value="register"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                return;
            }

            setDonor(data);
            setEditedLastDonation(data.last_donation_date || '');
        } catch (error) {
            console.error('Error fetching donor:', error);
            toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLastDonation = async () => {
        if (!donor) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('blood_donors')
                .update({ last_donation_date: editedLastDonation || null })
                .eq('id', donor.id);

            if (error) {
                toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
                return;
            }

            toast({ title: t('alkhayr_public.details.success'), description: t('blood.profile.update_success') });

            // Send confirmation email if available
            if (donor.email) {
                console.log("[BloodProfile] Sending update email to:", donor.email);
                supabase.functions.invoke('send-email', {
                    body: {
                        type: 'blood_donation_thank_you',
                        record: {
                            full_name: donor.full_name,
                            email: donor.email,
                            last_donation_date: editedLastDonation
                        }
                    }
                }).then(({ data, error }) => {
                    if (error) {
                        console.error("[BloodProfile] Function Error:", error);
                        toast({ title: "Email Error", description: "Backend outdated? Please deploy.", variant: "destructive" });
                        // Extract Project ID for debugging
                        const projectUrl = (supabase as any).supabaseUrl || "";
                        const projectId = projectUrl.split('.')[0].split('/').pop();

                        // Show FULL URL for diagnosis
                        const debugInfo = projectUrl.includes('localhost') ? 'LOCAL' : `Proj: ${projectId}`;

                        if (data && data.message && typeof data.message === 'string' && data.message.includes("Unknown type")) {
                            toast({ title: "Deployment Check", description: `${data.message} (${debugInfo})`, variant: "destructive" });
                        } else if (data && data.name === "validation_error") {
                            toast({ title: "Email Error", description: "Resend Validation Error: " + data.message, variant: "destructive" });
                        } else {
                            toast({ title: "Notification", description: `Envoyé! ID: ${data?.id || 'OK'}`, duration: 4000 });
                        }
                    }
                }).catch(err => {
                    console.error("[BloodProfile] Network/Invoke Error:", err);
                    toast({
                        title: "System Error",
                        description: `Check console: ${err.message || 'Network error'}`,
                        variant: "destructive"
                    });
                });
            } else {
                console.log("[BloodProfile] No email found, skipping.");
                toast({ title: "Debug: No Email", description: `Donor ID: ${donor.id} has no email.`, variant: "destructive" });
                toast({ title: "Info", description: "Aucun email lié, pas de notif.", duration: 3000 });
            }

            setDonor({ ...donor, last_donation_date: editedLastDonation || null });
            setEditing(false);
        } catch (error) {
            console.error('Error updating:', error);
            toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const calculateDaysUntilEligible = (lastDonationDate: string | null): number | null => {
        if (!lastDonationDate) return null;
        const lastDate = new Date(lastDonationDate);
        const today = new Date();
        const diffDays = Math.ceil((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysUntilEligible = 56 - diffDays;
        return daysUntilEligible > 0 ? daysUntilEligible : 0;
    };

    const daysUntilEligible = donor ? calculateDaysUntilEligible(donor.last_donation_date) : null;

    if (!donor) {
        return (
            <div className="max-w-md mx-auto py-12">
                <Card className="border border-red-100 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-red-50 p-3 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                            <Phone className="h-8 w-8 text-[#C62828]" />
                        </div>
                        <CardTitle className="text-xl font-bold text-[#8E0000]">{t('blood.profile.access_title')}</CardTitle>
                        <CardDescription>
                            {t('blood.profile.access_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <Input
                                type="tel"
                                placeholder={t('blood.profile.ph_phone')}
                                value={phoneSearch}
                                onChange={(e) => setPhoneSearch(e.target.value)}
                                className="focus-visible:ring-[#C62828]"
                            />
                            <Button
                                onClick={() => fetchDonor(phoneSearch)}
                                disabled={loading}
                                className="bg-[#C62828] hover:bg-[#8E0000] text-white"
                            >
                                {loading ? '...' : t('blood.profile.btn_access')}
                            </Button>
                        </div>
                        <div className="text-center pt-4">
                            <p className="text-sm text-gray-500">{t('blood.profile.not_registered')}</p>
                            <Button
                                variant="link"
                                className="text-[#C62828] font-semibold"
                                onClick={() => document.querySelector('[value="register"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                            >
                                {t('blood.profile.btn_register')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-red-100 shadow-sm">
                <h2 className="text-2xl font-bold text-[#8E0000]">{t('blood.profile.welcome', { name: donor.full_name.split(' ')[0] })}</h2>
                <Button
                    variant="ghost"
                    onClick={() => { setDonor(null); setPhoneSearch(''); }}
                    className="text-gray-500 hover:text-[#C62828]"
                >
                    <LogOut className="h-4 w-4 mr-2" /> {t('blood.profile.logout')}
                </Button>
            </div>

            {/* Eligibility Status */}
            <Alert className={`border-l-4 ${daysUntilEligible === 0 || daysUntilEligible === null ? 'bg-green-50 border-green-500 border-l-green-600' : 'bg-orange-50 border-orange-200 border-l-orange-500'}`}>
                {daysUntilEligible === 0 || daysUntilEligible === null ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                )}
                <AlertDescription className="ml-2 text-base font-medium">
                    {daysUntilEligible === null && <span className="text-green-800">{t('blood.profile.eligible')}</span>}
                    {daysUntilEligible === 0 && <span className="text-green-800">{t('blood.profile.eligible_again')}</span>}
                    {daysUntilEligible && daysUntilEligible > 0 && <span className="text-orange-800">{t('blood.profile.days_remaining', { count: daysUntilEligible })}</span>}
                </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Info */}
                <Card className="border-red-50 shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-bold text-[#1F2933]">{t('blood.profile.personal_info')}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-[#C62828] text-lg font-bold px-3 py-1">{donor.blood_type}</Badge>
                                {!editingProfile && (
                                    <Button variant="ghost" size="sm" onClick={() => setEditingProfile(true)} className="text-[#C62828] hover:bg-red-50 h-8 px-2">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <Label className="text-[#374151] text-xs">{t('blood.profile.full_name')}</Label>
                                <p className="font-semibold text-[#1F2933]">{donor.full_name}</p>
                            </div>
                            <div>
                                <Label className="text-[#374151] text-xs">{t('blood.profile.age')}</Label>
                                <p className="font-semibold text-[#1F2933]">{donor.age} {t('alkhayr_public.details.years')}</p>
                            </div>
                            <div>
                                <Label className="text-[#374151] text-xs">{t('blood.profile.phone')}</Label>
                                <p className="font-semibold text-[#1F2933]">{donor.phone_number}</p>
                            </div>
                            <div>
                                <Label className="text-[#374151] text-xs">{t('blood.profile.wilaya')}</Label>
                                <p className="font-semibold text-[#1F2933]">{donor.wilaya}</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                            {editingProfile ? (
                                <div className="space-y-3 bg-red-50/50 p-3 rounded-md">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="shareInfo" className="cursor-pointer">{t('blood.profile.public_visible')}</Label>
                                        <input
                                            type="checkbox"
                                            id="shareInfo"
                                            className="w-5 h-5 accent-[#C62828]"
                                            checked={editedProfile.can_share_info}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, can_share_info: e.target.checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="contact" className="cursor-pointer">{t('blood.profile.emergency_contact')}</Label>
                                        <input
                                            type="checkbox"
                                            id="contact"
                                            className="w-5 h-5 accent-[#C62828]"
                                            checked={editedProfile.willing_to_be_contacted}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, willing_to_be_contacted: e.target.checked })}
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <Button variant="outline" size="sm" onClick={() => setEditingProfile(false)}>{t('blood.profile.cancel')}</Button>
                                        <Button size="sm" onClick={handleUpdateProfile} disabled={saving} className="bg-[#C62828] hover:bg-[#8E0000] text-white">
                                            <Save className="h-4 w-4 mr-1" /> {t('blood.profile.save')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between py-2 items-center">
                                        <span className="text-sm text-[#374151]">{t('blood.profile.public_visible')}</span>
                                        <Badge variant={donor.can_share_info ? 'default' : 'secondary'} className={donor.can_share_info ? 'bg-green-600' : ''}>
                                            {donor.can_share_info ? t('blood.profile.yes') : t('blood.profile.no')}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between py-2 items-center">
                                        <span className="text-sm text-[#374151]">{t('blood.profile.emergency_contact')}</span>
                                        <Badge variant={donor.willing_to_be_contacted ? 'default' : 'secondary'} className={donor.willing_to_be_contacted ? 'bg-green-600' : ''}>
                                            {donor.willing_to_be_contacted ? t('blood.profile.yes') : t('blood.profile.no')}
                                        </Badge>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Donation History */}
                <Card className="border-red-50 shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-bold text-[#1F2933] flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-[#C62828]" /> {t('blood.profile.history')}
                            </CardTitle>
                            {!editing && (
                                <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-[#C62828] hover:bg-red-50">
                                    <Edit className="h-4 w-4 mr-1" /> {t('blood.profile.edit')}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {editing ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[#374151]">{t('blood.profile.last_donation')}</Label>
                                    <Input
                                        type="date"
                                        value={editedLastDonation}
                                        onChange={(e) => setEditedLastDonation(e.target.value)}
                                        className="focus-visible:ring-[#C62828]"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => setEditing(false)}>{t('blood.profile.cancel')}</Button>
                                    <Button size="sm" onClick={handleUpdateLastDonation} disabled={saving} className="bg-[#C62828] hover:bg-[#8E0000] text-white">
                                        <Save className="h-4 w-4 mr-1" /> {t('blood.profile.save')}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-red-50/50 rounded-lg border border-red-50">
                                <p className="text-sm text-[#374151] mb-1">{t('blood.profile.last_donation')}</p>
                                <p className="text-2xl font-bold text-[#8E0000]">
                                    {donor.last_donation_date
                                        ? new Date(donor.last_donation_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                                        : t('blood.profile.no_donation')}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BloodProfile;
