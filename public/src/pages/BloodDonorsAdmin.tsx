import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import Section from '@/components/ui/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Droplet, Users, AlertCircle, Phone, MapPin, Calendar, Download, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const BLOOD_TYPES = ['Tous', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface Donor {
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
  approved_by_admin: boolean;
  status?: string;
  user_id: string;
  created_at: string;
}

interface DonationRequest {
  id: number;
  user_id: string;
  patient_name: string;
  blood_type: string;
  urgency_level: string;
  hospital: string;
  wilaya: string;
  city: string;
  description: string | null;
  contact_number: string;
  status: string;
  created_at: string;
}

const BloodDonorsAdmin = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('Tous');
  const [wilayaFilter, setWilayaFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donorsRes, requestsRes] = await Promise.all([
        supabase.from('blood_donors').select('*').order('created_at', { ascending: false }),
        supabase.from('blood_donation_requests').select('*').order('created_at', { ascending: false }),
      ]);

      if (donorsRes.error) throw donorsRes.error;
      if (requestsRes.error) throw requestsRes.error;

      setDonors(donorsRes.data || []);
      setRequests(requestsRes.data || []);
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

  const filteredDonors = donors.filter(donor => {
    const matchesBloodType = bloodTypeFilter === 'Tous' || donor.blood_type === bloodTypeFilter;
    const matchesWilaya = !wilayaFilter || wilayaFilter === 'all' || donor.wilaya.includes(wilayaFilter);
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'approved' && donor.approved_by_admin) ||
      (statusFilter === 'pending' && !donor.approved_by_admin && donor.status !== 'rejected') ||
      (statusFilter === 'rejected' && donor.status === 'rejected');
    // Fallback for legacy "approved_by_admin" mixing

    // Better logic: use status if available, else fallback
    const effectiveStatus = donor.status || (donor.approved_by_admin ? 'approved' : 'pending');
    const matchesStatusV2 = statusFilter === 'all' || effectiveStatus === statusFilter;

    const matchesSearch = !searchTerm ||
      donor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone_number.includes(searchTerm);

    return matchesBloodType && matchesWilaya && matchesStatusV2 && matchesSearch;
  });

  // ...

  const exportDonorsCSV = () => {
    const headers = ['ID', 'Nom', 'Téléphone', 'Age', 'Groupe', 'Wilaya', 'Ville', 'Statut', 'Dernier Don'];
    const csvRows = filteredDonors.map(d => {
      const status = d.status || (d.approved_by_admin ? 'Approuvé' : 'En attente');
      return [
        d.id,
        `"${d.full_name.replace(/"/g, '""')}"`,
        `"${d.phone_number}"`,
        d.age,
        d.blood_type,
        `"${d.wilaya}"`,
        `"${d.city}"`,
        `"${status}"`,
        d.last_donation_date || ''
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\n'); // Add BOM
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `donateurs_sang_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const approveDonor = async (id: number) => {
    try {
      // Update approved_by_admin AND status
      const { error } = await supabase.from('blood_donors')
        .update({ approved_by_admin: true, status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      // Send Acceptance Email
      const donor = donors.find(d => d.id === id);
      if (donor && donor.email) {
        supabase.functions.invoke('send-email', {
          body: {
            type: 'blood_donor_acceptance',
            record: { full_name: donor.full_name, email: donor.email }
          }
        });
      }

      toast({ title: 'Succès', description: 'Donneur approuvé' });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Erreur lors de l\'approbation', variant: 'destructive' });
    }
  };

  const rejectDonor = async (id: number) => {
    try {
      const { error } = await supabase.from('blood_donors')
        .update({ approved_by_admin: false, status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Refusé', description: 'Donneur marqué comme refusé' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur lors du refus', variant: 'destructive' });
    }
  };

  const deleteDonor = async (id: number) => {
    try {
      const { error } = await supabase.from('blood_donors').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Succès', description: 'Donneur supprimé' });
      fetchData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <Section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des Donateurs</h2>
            <p className="text-muted-foreground">
              Gérer les donneurs de sang et les demandes de don
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{donors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Demandes Actives</CardTitle>
              <Droplet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {donors.filter(d => !d.approved_by_admin && d.status !== 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="donors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="donors">Liste des Donateurs</TabsTrigger>
            <TabsTrigger value="requests">Demandes de Don</TabsTrigger>
          </TabsList>

          <TabsContent value="donors" className="space-y-4">
            <Card className="bg-white/50 backdrop-blur-sm border-white/20">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Filters */}
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvé</SelectItem>
                        <SelectItem value="rejected">Refusé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Groupe Sanguin</Label>
                    <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BLOOD_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Wilaya</Label>
                    <Input value={wilayaFilter} onChange={(e) => setWilayaFilter(e.target.value)} placeholder="Wilaya..." />
                  </div>

                  <div className="space-y-2">
                    <Label>Recherche</Label>
                    <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Nom..." />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={exportDonorsCSV}>
                    <Download className="h-4 w-4 mr-2" /> Exporter CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {filteredDonors.map((donor) => (
                <Card key={donor.id} className="bg-white/60 hover:bg-white/90 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid md:grid-cols-4 gap-4">
                        {/* Info Columns */}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{donor.full_name}</p>
                            {/* Status Badge */}
                            {donor.status === 'approved' || donor.approved_by_admin ? (
                              <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
                            ) : donor.status === 'rejected' ? (
                              <Badge className="bg-gray-100 text-gray-800">Refusé</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{donor.phone_number}</p>
                          {donor.email && <p className="text-xs text-muted-foreground">{donor.email}</p>}
                        </div>

                        {/* ... (Age/Blood) */}

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          {/* Allow Approve if not approved OR if rejected (restore) */}
                          {(!donor.approved_by_admin && donor.status !== 'approved') && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveDonor(donor.id)}>
                              Approuver
                            </Button>
                          )}

                          {/* Allow Reject if not already rejected */}
                          {donor.status !== 'rejected' && (
                            <Button size="sm" variant="secondary" onClick={() => rejectDonor(donor.id)}>
                              Refuser
                            </Button>
                          )}

                          {donor.status === 'rejected' && (
                            <Button size="sm" variant="outline" onClick={() => approveDonor(donor.id)}>
                              Rétablir (Approuver)
                            </Button>
                          )}

                          <Button size="sm" variant="destructive" onClick={() => deleteDonor(donor.id)}>
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Aucune demande active.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {requests.map(req => (
                  <Card key={req.id} className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setSelectedRequest(req)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{req.patient_name}</h4>
                            <Badge variant="outline">{req.blood_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{req.hospital}, {req.wilaya}</p>
                        </div>
                        <Badge variant={req.urgency_level === 'very_urgent' ? 'destructive' : 'secondary'}>
                          {req.urgency_level}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Section>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Patient</Label>
                  <p className="font-medium">{selectedRequest.patient_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Groupe Sanguin</Label>
                  <p className="font-bold text-red-600">{selectedRequest.blood_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hôpital</Label>
                  <p>{selectedRequest.hospital}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lieu</Label>
                  <p>{selectedRequest.city}, {selectedRequest.wilaya}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact</Label>
                  <p className="font-mono">{selectedRequest.contact_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Urgence</Label>
                  <Badge variant={selectedRequest.urgency_level === 'very_urgent' ? 'destructive' : 'secondary'}>
                    {selectedRequest.urgency_level}
                  </Badge>
                </div>
              </div>
              {selectedRequest.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded mt-1">{selectedRequest.description}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Fermer</Button>
                <Button asChild>
                  <a href={`tel:${selectedRequest.contact_number}`}>
                    <Phone className="mr-2 h-4 w-4" /> Appeler
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BloodDonorsAdmin;
