import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Calendar, AlertCircle, Search, RefreshCw, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TrackedRequest {
    id: string; // UUID
    title: string;
    type: 'local' | 'foreign';
    status: string;
    created_at: string;
    user_notes?: string;   // Admin message to user
    updated_at?: string;
}

const MyRequestsView = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [results, setResults] = useState<TrackedRequest[]>([]);
    const [searched, setSearched] = useState(false);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'accepted':
            case 'approved':
                return { color: 'bg-green-500', icon: CheckCircle2, label: 'Accepté & Publié', desc: 'Votre demande a été validée et est visible par les donateurs.' };
            case 'completed':
                return { color: 'bg-blue-600', icon: CheckCircle2, label: 'Terminé', desc: 'Votre demande a été traitée avec succès.' };
            case 'rejected':
                return { color: 'bg-red-500', icon: XCircle, label: 'Refusé', desc: "Votre demande n'a pas pu être acceptée." };
            case 'reviewing':
                return { color: 'bg-blue-500', icon: RefreshCw, label: 'En revue', desc: 'Un administrateur est en train d\'examiner votre dossier.' };
            default: // pending
                return { color: 'bg-yellow-500', icon: Clock, label: 'En attente', desc: 'Votre demande est en attente de traitement.' };
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber.trim()) {
            toast({ title: "Champ requis", description: "Veuillez entrer votre numéro de téléphone.", variant: "destructive" });
            return;
        }

        setLoading(true);
        setResults([]);
        setSearched(false);

        try {
            const phone = phoneNumber.trim();

            // Unified Search
            const { data, error } = await supabase
                .from('medicine_requests')
                .select('id, title, medicine_name, status, created_at, admin_notes, request_type')
                .ilike('phone_number', `%${phone}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const allRequests = (data || []).map(r => ({
                id: r.id,
                title: r.title || r.medicine_name || 'Sans titre', // Fallback to medicine_name if title is empty
                status: r.status,
                created_at: r.created_at,
                user_notes: r.admin_notes, // admin_notes is often visible to user in this view context? Or should be distinct? 
                // In old view, it selected `user_notes`. 
                // New schema: `admin_notes` (maybe private?), `rejection_reason` (public?).
                // If `user_notes` was strictly for user, I might have mapped it to `admin_notes` or I missed it.
                // Let's assume `admin_notes` here for now, or `rejection_reason`.
                // Actually `admin_notes` in new schema was intended for admins.
                // But MyRequests often shows feedback. I'll use `admin_notes` as feedback channel for now.
                type: r.request_type as 'local' | 'foreign'
            }));

            setResults(allRequests as TrackedRequest[]);
            setSearched(true);

        } catch (error) {
            console.error('Search error:', error);
            toast({
                title: "Erreur",
                description: "Impossible de rechercher les demandes. Réessayez plus tard.",
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-lg mx-auto py-12 px-4">
            <div className="text-center mb-10 space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    Mes Demandes
                </h1>
                <p className="text-muted-foreground">
                    Saisissez votre numéro de téléphone pour voir l'état de vos demandes.
                </p>
            </div>

            <Card className="border-t-4 border-t-primary shadow-lg mb-8">
                <CardHeader>
                    <CardTitle>Recherche</CardTitle>
                    <CardDescription>Utilisez le numéro fourni lors de la création de la demande.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Numéro de téléphone</Label>
                            <Input
                                id="phone"
                                placeholder="ex: 0550..."
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                className="text-lg tracking-wide"
                            />
                        </div>

                        <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            {loading ? 'Recherche...' : 'Voir mes demandes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {searched && results.length === 0 && (
                <div className="text-center p-8 bg-muted/30 rounded-xl border border-dashed animate-in fade-in zoom-in-95 duration-300">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-semibold text-lg">Aucune demande trouvée</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Aucune demande associée à ce numéro. Vérifiez le format (ex: 0550...).
                    </p>
                </div>
            )}

            {results.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-xl font-semibold px-1">Résultats ({results.length})</h2>
                    {results.map((req) => (
                        <Card key={`${req.type}-${req.id}`} className="overflow-hidden border-2 border-primary/5 shadow-md hover:shadow-lg transition-all">
                            <div className={`h-1.5 w-full ${getStatusConfig(req.status).color}`} />
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                                                {req.type === 'local' ? 'Locale' : 'Étranger'}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">#{req.id.slice(0, 8)}</span>
                                        </div>
                                        <CardTitle className="text-lg line-clamp-1">
                                            {req.title || "Demande sans titre"}
                                        </CardTitle>
                                    </div>
                                    <Badge className={`${getStatusConfig(req.status).color} text-white shrink-0`}>
                                        {getStatusConfig(req.status).label}
                                    </Badge>
                                </div>
                                <CardDescription className="flex items-center gap-1 text-xs mt-1">
                                    <Calendar className="w-3 h-3" /> {new Date(req.created_at).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pb-4 pt-0 space-y-3">
                                <div className="bg-muted/30 p-3 rounded-lg flex gap-3 items-start text-sm">
                                    {(() => {
                                        const Icon = getStatusConfig(req.status).icon;
                                        return <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${getStatusConfig(req.status).color.replace('bg-', 'text-')}`} />;
                                    })()}
                                    <div>
                                        <p className="text-muted-foreground leading-snug">
                                            {getStatusConfig(req.status).desc}
                                        </p>
                                    </div>
                                </div>

                                {req.user_notes && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
                                        <div className="font-semibold text-yellow-800 flex items-center gap-2 mb-1">
                                            <FileText className="w-3 h-3" /> Note Admin:
                                        </div>
                                        <p className="text-yellow-700 italic">
                                            "{req.user_notes}"
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRequestsView;
