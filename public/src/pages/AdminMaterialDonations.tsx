import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { DonationDetailDialog } from "@/components/admin/alkhayr/DonationDetailDialog";

export default function AdminMaterialDonations() {
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedDonation, setSelectedDonation] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchDonations = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('material_donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter !== "all") {
                query = query.eq('status', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setDonations(data || []);
        } catch (error) {
            console.error("Error fetching donations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, [statusFilter]);

    const filteredDonations = donations.filter(d =>
        d.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDetail = (donation: any) => {
        setSelectedDonation(donation);
        setIsDetailOpen(true);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
            case 'approved': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvé</Badge>;
            case 'rejected': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
            case 'completed': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Terminé</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen w-full bg-slate-50">
                <AdminSidebar />
                <main className="transition-all duration-200 ease-in-out md:pl-64">
                    <div className="container mx-auto p-6 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dons Matériels</h1>
                                <p className="text-slate-500">Gérez les propositions de dons d'articles.</p>
                            </div>
                            <Button onClick={fetchDonations} variant="outline" size="sm" className="gap-2">
                                <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Actualiser
                            </Button>
                        </div>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex flex-col md:flex-row gap-4 justify-between">
                                    <div className="relative w-full md:w-72">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Rechercher (Article, Donneur, Lieu)..."
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filtrer par statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tous les statuts</SelectItem>
                                            <SelectItem value="pending">En attente</SelectItem>
                                            <SelectItem value="approved">Approuvés</SelectItem>
                                            <SelectItem value="rejected">Rejetés</SelectItem>
                                            <SelectItem value="completed">Terminés</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Article</TableHead>
                                                <TableHead>Donneur</TableHead>
                                                <TableHead>Lieu</TableHead>
                                                <TableHead>Catégorie</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center">Chargement...</TableCell>
                                                </TableRow>
                                            ) : filteredDonations.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Aucun don trouvé.</TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredDonations.map((d) => (
                                                    <TableRow key={d.id}>
                                                        <TableCell className="font-medium">{d.item_name}</TableCell>
                                                        <TableCell>{d.donor_name}</TableCell>
                                                        <TableCell>{d.location}</TableCell>
                                                        <TableCell>
                                                            {d.category === 'medicine' ? 'Médicament' :
                                                                d.category === 'equipment' ? 'Équipement' : 'Autre'}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {format(new Date(d.created_at), 'dd/MM/yyyy')}
                                                        </TableCell>
                                                        <TableCell><StatusBadge status={d.status} /></TableCell>
                                                        <TableCell className="text-right">
                                                            <Button size="sm" variant="ghost" onClick={() => handleOpenDetail(d)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Gérer
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            <DonationDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                donation={selectedDonation}
                onUpdate={fetchDonations}
            />
        </SidebarProvider>
    );
}
