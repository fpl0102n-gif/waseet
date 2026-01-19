import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, LogOut, Package, Trash2, CheckCircle, Clock } from 'lucide-react';

interface Request {
    id: string; // UUID
    medicine_name: string;
    status: string;
    created_at: string;
    type: string;
    category: 'local' | 'foreign';
    admin_notes?: string;
}

const AlkhayrProfile = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [requests, setRequests] = useState<Request[]>([]);

    const handleLogin = async () => {
        if (!phoneNumber.trim()) {
            toast({ title: t('alkhayr_public.submit.toast.error'), description: t('alkhayr_public.profile.login_req'), variant: 'destructive' });
            return;
        }
        setLoading(true);
        // In a real app we'd verify OTP. Here we just fetch associated requests.
        // We'll simulate login by just fetching ANY request matching this phone number across tables.
        try {
            await fetchUserRequests(phoneNumber);
            setIsLoggedIn(true);
        } catch (error) {
            console.error(error);
            toast({ title: t('alkhayr_public.submit.toast.error'), description: t('alkhayr_public.profile.login_error'), variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRequests = async (phone: string) => {
        // Normalize phone to last 9 digits to generate variations
        const clean = phone.replace(/\D/g, '');
        const significant = clean.slice(-9); // Last 9 digits

        // Generate variations to search for
        const variations = [
            `0${significant}`,          // 055...
            significant,                // 55...
            `213${significant}`,        // 21355...
            `+213${significant}`,       // +21355...
            `00213${significant}`       // 0021355...
        ];

        // Construct OR query part: phone_number.eq.X,phone_number.eq.Y,...
        const orQuery = variations.map(v => `phone_number.eq.${v}`).join(',');

        // Fetch from Unified Table
        const { data, error } = await supabase
            .from('medicine_requests')
            .select('*')
            .or(orQuery);

        if (error) throw new Error('Fetch failed');

        const all = (data || []).map(r => ({
            id: r.id,
            medicine_name: r.medicine_name || r.title || 'Sans Titre',
            status: r.status,
            created_at: r.created_at,
            type: r.request_type, // 'local' | 'foreign'
            category: r.request_type as 'local' | 'foreign',
            admin_notes: r.admin_notes
        })) as Request[];

        setRequests(all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    };

    const handleDelete = async (id: string, category: 'local' | 'foreign') => {
        const { error } = await supabase.from('medicine_requests').delete().eq('id', id);

        if (error) {
            toast({ title: t('alkhayr_public.submit.toast.error'), description: t('alkhayr_public.profile.delete_error'), variant: 'destructive' });
        } else {
            toast({ title: t('alkhayr_public.submit.toast.success.title'), description: t('alkhayr_public.profile.delete_success') });
            setRequests(requests.filter(r => !(r.id === id)));
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="max-w-md mx-auto py-12">
                <Card className="border border-green-100 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-green-50 p-3 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                            <Phone className="h-8 w-8 text-[#2E7D32]" />
                        </div>
                        <CardTitle className="text-xl font-bold text-[#1B5E20]">{t('alkhayr_public.profile.title')}</CardTitle>
                        <CardDescription>
                            {t('alkhayr_public.profile.desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <Input
                                type="tel"
                                placeholder={t('alkhayr_public.profile.phonePlaceholder')}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="focus-visible:ring-[#2E7D32]"
                            />
                            <Button
                                onClick={handleLogin}
                                disabled={loading}
                                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white"
                            >
                                {loading ? t('alkhayr_public.profile.loading') : t('alkhayr_public.profile.access')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                        <Package className="h-6 w-6 text-[#2E7D32]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#1B5E20]">{t('alkhayr_public.profile.dashboard')}</h2>
                        <p className="text-sm text-[#374151]">{phoneNumber}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => { setIsLoggedIn(false); setPhoneNumber(''); setRequests([]); }}
                    className="text-gray-500 hover:text-[#2E7D32]"
                >
                    <LogOut className="h-4 w-4 mr-2" /> {t('alkhayr_public.profile.logout')}
                </Button>
            </div>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                        <p className="text-[#1F2933]">{t('alkhayr_public.profile.no_requests')}</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <Card key={`${req.category}-${req.id}`} className="border-l-4 border-l-[#2E7D32] shadow-sm">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-lg">{req.medicine_name}</h4>
                                        <Badge variant="outline">{req.category === 'local' ? t('alkhayr_public.submit.tabs.local').split(' ')[0] : t('alkhayr_public.submit.tabs.foreign')}</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-[#374151]">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {req.status === 'pending' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('alkhayr_public.profile.status.pending')}</Badge>}
                                            {req.status === 'accepted' && <Badge variant="secondary" className="bg-green-100 text-green-800">{t('alkhayr_public.profile.status.approved')}</Badge>}
                                            {req.status === 'in_progress' && <Badge variant="secondary" className="bg-blue-100 text-blue-800">{t('alkhayr_public.profile.status.process') || 'In Progress'}</Badge>}
                                            {req.status === 'fulfilled' && <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">{t('alkhayr_public.profile.status.fulfilled')}</Badge>}
                                            {req.status === 'rejected' && <Badge variant="secondary" className="bg-red-100 text-red-800">{t('alkhayr_public.profile.status.rejected') || 'Rejected'}</Badge>}
                                        </span>
                                    </div>
                                    {req.admin_notes && (
                                        <div className="mt-3 text-sm bg-gray-50 p-2 rounded border border-gray-100 text-gray-700">
                                            <span className="font-semibold text-gray-900 block mb-1">Message:</span>
                                            {req.admin_notes}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(req.id, req.category)}
                                >
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AlkhayrProfile;
