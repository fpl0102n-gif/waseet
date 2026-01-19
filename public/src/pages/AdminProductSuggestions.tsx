import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { SuggestionDetailDialog } from "@/components/admin/store/SuggestionDetailDialog";

export default function AdminProductSuggestions() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('store_product_suggestions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSuggestions(data || []);
        } catch (error: any) {
            console.error("Error fetching suggestions:", error);
            toast({
                title: "Error",
                description: t('admin_store.suggestions.messages.errorFetch'),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const filteredSuggestions = suggestions.filter(item => {
        const matchesSearch =
            item.product_name?.toLowerCase().includes(search.toLowerCase()) ||
            item.full_name?.toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> {t('admin_store.suggestions.status.pending')}</Badge>;
            case 'reviewed': return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200"><Eye className="w-3 h-3 mr-1" /> {t('admin_store.suggestions.status.reviewed')}</Badge>;
            case 'accepted': return <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> {t('admin_store.suggestions.status.accepted')}</Badge>;
            case 'rejected': return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 hover:bg-red-50"><XCircle className="w-3 h-3 mr-1" /> {t('admin_store.suggestions.status.rejected')}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleViewDetail = (suggestion: any) => {
        setSelectedSuggestion(suggestion);
        setIsDetailOpen(true);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('admin_store.suggestions.title')}</h1>
                        <p className="text-muted-foreground">{t('admin_store.suggestions.subtitle')}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('admin_store.suggestions.listTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('admin_store.suggestions.search.placeholder')}
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder={t('admin_store.suggestions.search.filter')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('admin_store.suggestions.status.all')}</SelectItem>
                                    <SelectItem value="pending">{t('admin_store.suggestions.status.pending')}</SelectItem>
                                    <SelectItem value="reviewed">{t('admin_store.suggestions.status.reviewed')}</SelectItem>
                                    <SelectItem value="accepted">{t('admin_store.suggestions.status.accepted')}</SelectItem>
                                    <SelectItem value="rejected">{t('admin_store.suggestions.status.rejected')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('admin_store.suggestions.table.product')}</TableHead>
                                        <TableHead>{t('admin_store.suggestions.table.price')}</TableHead>
                                        <TableHead>{t('admin_store.suggestions.table.user')}</TableHead>
                                        <TableHead>{t('admin_store.suggestions.table.status')}</TableHead>
                                        <TableHead>{t('admin_store.suggestions.table.date')}</TableHead>
                                        <TableHead className="text-right">{t('admin_store.suggestions.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredSuggestions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                {t('admin_store.suggestions.messages.empty')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSuggestions.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.product_name}</TableCell>
                                                <TableCell>{item.proposed_price} {item.currency}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{item.full_name}</span>
                                                        <span className="text-xs text-muted-foreground">{item.phone}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item)}>
                                                        {t('admin_store.suggestions.actions.review')}
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

            <SuggestionDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                suggestion={selectedSuggestion}
                onUpdate={fetchSuggestions}
            />
        </AdminLayout>
    );
}
