
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/AdminLayout'; // Updated Layout
import Section from '@/components/ui/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Truck, Phone, MessageCircle, Send, Edit, Save, X, MapPin, AlertCircle } from 'lucide-react';

interface TransportVolunteer {
    id: number;
    full_name: string;
    wilaya: string;
    city: string;
    phone_number: string;
    whatsapp: string | null;
    telegram: string | null;
    additional_info: string | null;
    display_initials: string | null;
    display_location: string | null;
    display_description: string | null;
    is_available: boolean;
    status: string;
    created_at: string;
}

const AdminTransport = () => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [transportVolunteers, setTransportVolunteers] = useState<TransportVolunteer[]>([]);
    const [transportStatusFilter, setTransportStatusFilter] = useState('all'); // 'all', 'pending', 'active', 'rejected'

    const [editingVolunteer, setEditingVolunteer] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        display_initials: '',
        display_location: '',
        display_description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transport_volunteers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransportVolunteers(data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les données',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const generateInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase() + ".";
        return parts[0].substring(0, 1).toUpperCase() + ". " + parts[parts.length - 1].substring(0, 1).toUpperCase() + ".";
    };

    const startEditing = (vol: TransportVolunteer) => {
        setEditingVolunteer(vol.id);
        setEditForm({
            display_initials: vol.display_initials || generateInitials(vol.full_name),
            display_location: vol.display_location || `${vol.city}, ${vol.wilaya}`,
            display_description: vol.display_description || "Transport bénévole disponible pour urgences."
        });
    };

    const saveVolunteerDisplay = async (id: number) => {
        try {
            const { error } = await supabase.from('transport_volunteers').update({
                display_initials: editForm.display_initials,
                display_location: editForm.display_location,
                display_description: editForm.display_description
            }).eq('id', id);

            if (error) throw error;

            toast({ title: "Succès", description: "Informations publiques mises à jour." });
            setEditingVolunteer(null);
            fetchData();
        } catch (e) {
            toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" });
        }
    };

    const updateVolunteerStatus = async (id: number, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('transport_volunteers')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            toast({ title: 'Succès', description: `Statut mis à jour: ${newStatus}` });
            fetchData();
        } catch (error) {
            toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
        }
    };

    const stats = {
        total: transportVolunteers.length,
        active: transportVolunteers.filter(v => v.status === 'active').length,
        pending: transportVolunteers.filter(v => v.status === 'pending').length,
        rejected: transportVolunteers.filter(v => v.status === 'rejected').length
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Transport Volunteers</h1>
                    <p className="text-gray-500">Manage volunteer drivers for emergency transport.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Volunteers</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Truck className="h-8 w-8 text-blue-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <Truck className="h-8 w-8 text-green-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <AlertCircle className="h-8 w-8 text-yellow-500 opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Volunteer List</CardTitle>
                        <div className="w-[200px]">
                            <Select value={transportStatusFilter} onValueChange={setTransportStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">⏳ Pending</SelectItem>
                                    <SelectItem value="active">✅ Active</SelectItem>
                                    <SelectItem value="rejected">❌ Rejected</SelectItem>
                                    <SelectItem value="inactive">⏸️ Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {transportVolunteers.filter(v => transportStatusFilter === 'all' || v.status === transportStatusFilter).length === 0 && (
                                <div className="text-center py-8 text-gray-500">No volunteers found with this status.</div>
                            )}
                            {transportVolunteers.filter(v => transportStatusFilter === 'all' || v.status === transportStatusFilter).map(vol => (
                                <div key={vol.id} className={`border rounded-lg p-4 ${vol.status === 'pending' ? 'bg-yellow-50/50 border-yellow-200' : 'bg-white'}`}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* LEFT: Raw Private Data (Read Only) */}
                                        <div className="space-y-3 border-r pr-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Private Data</Badge>
                                                <div className="flex items-center gap-2">
                                                    {vol.status === 'pending' && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>}
                                                    {vol.status === 'active' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>}
                                                    {vol.status === 'rejected' && <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>}
                                                    {vol.status === 'inactive' && <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>}
                                                    <span className="text-xs text-muted-foreground">{new Date(vol.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="font-medium text-gray-500">Full Name:</div>
                                                <div className="font-medium">{vol.full_name}</div>

                                                <div className="font-medium text-gray-500">Phone:</div>
                                                <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {vol.phone_number}</div>

                                                <div className="font-medium text-gray-500">WhatsApp:</div>
                                                <div className="text-green-600">{vol.whatsapp || '-'}</div>

                                                <div className="font-medium text-gray-500">Telegram:</div>
                                                <div className="text-blue-600">{vol.telegram || '-'}</div>

                                                <div className="font-medium text-gray-500">Location:</div>
                                                <div>{vol.city}, {vol.wilaya}</div>

                                                <div className="font-medium text-gray-500">Extra Info:</div>
                                                <div className="col-span-2 bg-gray-50 p-2 border rounded text-xs text-gray-600 max-h-20 overflow-y-auto">
                                                    {vol.additional_info || "No extra info provided."}
                                                </div>
                                            </div>

                                            <div className="pt-4 flex gap-2">
                                                {vol.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => updateVolunteerStatus(vol.id, 'active')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => updateVolunteerStatus(vol.id, 'rejected')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {vol.status === 'active' && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => updateVolunteerStatus(vol.id, 'inactive')}
                                                    >
                                                        Deactivate
                                                    </Button>
                                                )}
                                                {(vol.status === 'inactive' || vol.status === 'rejected') && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                                        onClick={() => updateVolunteerStatus(vol.id, 'active')}
                                                    >
                                                        Re-Activate
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* RIGHT: Public Display Data (Editable) */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Public Display</Badge>
                                                {editingVolunteer === vol.id ? (
                                                    <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => setEditingVolunteer(null)}><X className="w-4 h-4" /></Button>
                                                        <Button size="sm" className="bg-blue-600 text-white" onClick={() => saveVolunteerDisplay(vol.id)}><Save className="w-4 h-4 mr-1" /> Save</Button>
                                                    </div>
                                                ) : (
                                                    <Button size="sm" variant="outline" onClick={() => startEditing(vol)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                                                )}
                                            </div>

                                            {editingVolunteer === vol.id ? (
                                                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                                    <div>
                                                        <Label className="text-xs">Initials / Name</Label>
                                                        <Input
                                                            value={editForm.display_initials}
                                                            onChange={e => setEditForm({ ...editForm, display_initials: e.target.value })}
                                                            placeholder="Ex: A. B."
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Location</Label>
                                                        <Input
                                                            value={editForm.display_location}
                                                            onChange={e => setEditForm({ ...editForm, display_location: e.target.value })}
                                                            placeholder="Public location display"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Description</Label>
                                                        <textarea
                                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                            value={editForm.display_description}
                                                            onChange={e => setEditForm({ ...editForm, display_description: e.target.value })}
                                                            placeholder="Short public description..."
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4 pt-2">
                                                    {/* Preview Card */}
                                                    <div className={`border rounded-lg p-4 shadow-sm relative overflow-hidden ${vol.status === 'active' ? 'border-blue-100 bg-white' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
                                                        <div className={`absolute top-0 right-0 text-white text-[10px] px-2 py-0.5 rounded-bl ${vol.status === 'active' ? 'bg-blue-600' : 'bg-gray-500'}`}>
                                                            {vol.status === 'active' ? 'LIVE PREVIEW' : 'HIDDEN'}
                                                        </div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                                                {vol.display_initials || "?"}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-gray-800">{vol.display_initials || <span className="text-red-500 italic">Not set</span>}</div>
                                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" /> {vol.display_location || <span className="text-red-500 italic">Not set</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 italic">
                                                            "{vol.display_description || <span className="text-red-500">No public description.</span>}"
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default AdminTransport;
