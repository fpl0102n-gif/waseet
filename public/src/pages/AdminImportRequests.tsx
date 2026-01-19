import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface ImportRequestRow {
  id: number;
  customer_name: string | null;
  origin_country: string | null;
  product_currency: string | null;
  product_value: number | null;
  quantity: number | null;
  status: string;
  created_at: string;
}

const AdminImportRequests = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<ImportRequestRow[]>([]);
  const [status, setStatus] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const fetchData = async () => {
    try {
      let query = (supabase as any).from('import_requests').select('id, customer_name, origin_country, product_currency, product_value, quantity, status, created_at').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      if (origin) query = query.ilike('origin_country', `%${origin}%`);
      if (fromDate) query = query.gte('created_at', fromDate);
      if (toDate) query = query.lte('created_at', toDate + ' 23:59:59');
      const { data, error } = await query;
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalFound = useMemo(() => rows.length, [rows]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Import Requests</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
          <div className="md:col-span-1">
            <select className="w-full border rounded-md h-10 px-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option>pending</option>
              <option>verified</option>
              <option>assigned</option>
              <option>in_transit</option>
              <option>arrived</option>
              <option>delivered</option>
              <option>completed</option>
              <option>disputed</option>
              <option>rejected</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <Input placeholder="Origin country" value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="md:col-span-1 flex gap-2">
            <Button onClick={fetchData}>Filter</Button>
            <Button variant="outline" onClick={() => { setStatus(''); setOrigin(''); setFromDate(''); setToDate(''); }}>Reset</Button>
          </div>
        </div>

        <div className="overflow-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Origin</th>
                <th className="text-left p-2">Value</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">#{r.id}</td>
                  <td className="p-2">{r.customer_name || '-'}</td>
                  <td className="p-2">{r.origin_country}</td>
                  <td className="p-2">{(r.product_value || 0) * (r.quantity || 1)} {r.product_currency}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-2">
                    <Button asChild size="sm"><Link to={`/admin/import-requests/${r.id}`}>Open</Link></Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-muted-foreground">No requests found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="text-sm text-muted-foreground mt-2">{totalFound} found</div>
      </div>
    </AdminLayout>
  );
};

export default AdminImportRequests;
