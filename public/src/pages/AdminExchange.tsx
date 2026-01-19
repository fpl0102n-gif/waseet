// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, CheckCircle, XCircle, Phone, MessageCircle, Send } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminExchange() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Data
  const [requests, setRequests] = useState<any[]>([]);
  const [currencies, setCurrencies] = useState<any[]>([]);

  // Filtering
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');

  // Dialogs
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, currencyFilter]);

  const fetchInitialData = async () => {
    const { data } = await supabase.from('currencies').select('*').order('code');
    if (data) setCurrencies(data);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('exchange_requests')
        .select(`
          *,
          currency_from:currencies!currency_from_id(code, name),
          currency_to:currencies!currency_to_id(code, name),
          wilaya:wilayas(code, name_en, name_ar),
          payment_method_from:payment_methods!payment_method_from_id(name),
          payment_method_to:payment_methods!payment_method_to_id(name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (currencyFilter !== 'all') {
        query = query.eq('currency_from_id', currencyFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      const payload: any = { status };
      if (notes) payload.rejection_reason = notes;

      const { error } = await supabase.from('exchange_requests').update(payload).eq('id', id);
      if (error) throw error;

      toast({ title: 'Status Updated', description: `Request marked as ${status}` });
      setShowRequestDialog(false);
      fetchRequests();
    } catch (e) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={variants[status] || ''} variant="outline">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Exchange Requests</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/exchange-rates')}>Configuration</Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
          <CardContent className="flex gap-4">
            <div className="w-1/3">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/3">
              <Label>Currency (From)</Label>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {currencies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.code}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Wilaya</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="animate-spin inline" /></TableCell></TableRow> :
                  requests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell>#{req.id}</TableCell>
                      <TableCell>
                        <Badge variant={req.request_type === 'buy' ? 'default' : 'secondary'}>{req.request_type.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{req.currency_from?.code}</span> &rarr; <span className="font-mono">{req.currency_to?.code}</span>
                      </TableCell>
                      <TableCell>{req.amount}</TableCell>
                      <TableCell>{req.wilaya?.code} - {req.wilaya?.name_en}</TableCell>
                      <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedRequest(req); setShowRequestDialog(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Request Details #{selectedRequest?.id}</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                  <div><Label>Type</Label><div className="font-bold">{selectedRequest.request_type.toUpperCase()}</div></div>
                  <div><Label>Status</Label><div>{getStatusBadge(selectedRequest.status)}</div></div>

                  <div><Label>From</Label><div>{selectedRequest.currency_from?.name} ({selectedRequest.currency_from?.code})</div></div>
                  <div><Label>To</Label><div>{selectedRequest.currency_to?.name} ({selectedRequest.currency_to?.code})</div></div>

                  <div><Label>Amount</Label><div className="text-xl font-mono">{selectedRequest.amount}</div></div>
                  <div className="col-span-2 grid grid-cols-2 gap-4 bg-muted/20 p-2 rounded">
                    <div><Label>Deposit Via</Label><div className="font-semibold text-green-700">{selectedRequest.payment_method_from?.name || 'Any'}</div></div>
                    <div><Label>Withdraw Via</Label><div className="font-semibold text-blue-700">{selectedRequest.payment_method_to?.name || 'Any'}</div></div>
                  </div>

                  <div><Label>Wilaya</Label><div>{selectedRequest.wilaya?.code} - {selectedRequest.wilaya?.name_en} ({selectedRequest.wilaya?.name_ar})</div></div>

                  {/* New Date Display */}
                  <div>
                    <Label>Needed By</Label>
                    <div className="font-medium">
                      {selectedRequest.needed_by ? new Date(selectedRequest.needed_by).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Updated Contact Details */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 space-y-3">
                  <Label className="text-amber-800 font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Admin Only: Contact Details
                  </Label>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div><Label>Email</Label><div className="font-mono select-all bg-white p-1 rounded border">{selectedRequest.email || '-'}</div></div>
                    <div><Label>Phone</Label><div className="font-mono select-all bg-white p-1 rounded border">{selectedRequest.phone_number}</div></div>
                    <div><Label>WhatsApp</Label><div className="font-mono select-all bg-white p-1 rounded border">{selectedRequest.whatsapp || '-'}</div></div>
                    <div><Label>Telegram</Label><div className="font-mono select-all bg-white p-1 rounded border">{selectedRequest.telegram || '-'}</div></div>
                  </div>

                  {selectedRequest.notes && (
                    <div className="pt-2"><Label>User Notes</Label><div className="p-2 bg-white rounded border">{selectedRequest.notes}</div></div>
                  )}

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    {selectedRequest.status === 'pending' && (
                      <>
                        <Button variant="destructive" onClick={() => updateStatus(selectedRequest.id, 'cancelled', 'Admin rejected')}>Reject</Button>
                        <Button onClick={() => updateStatus(selectedRequest.id, 'matched')}>Mark Matched</Button>
                      </>
                    )}
                    {selectedRequest.status === 'matched' && (
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(selectedRequest.id, 'completed')}>Mark Completed</Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
