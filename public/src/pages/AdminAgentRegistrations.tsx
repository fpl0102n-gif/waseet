import { useEffect, useState } from 'react';
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Row { id: number; name: string; email: string; phone_whatsapp: string; country: string | null; city: string | null; status: string; created_at: string; shipping_methods: string[] | null; goods_types: string[] | null; }

const AdminAgentRegistrations = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState('');
  const [country, setCountry] = useState('');
  const [method, setMethod] = useState('');
  const [category, setCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchData = async () => {
    try {
      // Select shipping_methods and goods_types for client-side filtering or indication
      // Select shipping_methods and goods_types for client-side filtering or indication
      let q = (supabase as any).from('agents')
        .select('id,name,email,phone_whatsapp,country,city,status,created_at,shipping_methods,goods_types')
        .order('created_at', { ascending: false });

      if (status) q = q.eq('status', status);
      if (country) q = q.ilike('country', `%${country}%`);

      // JSONB filtering for arrays
      if (method) q = q.contains('shipping_methods', [method]);
      if (category) q = q.contains('goods_types', [category]);

      if (fromDate) q = q.gte('created_at', fromDate);
      if (toDate) q = q.lte('created_at', toDate + ' 23:59:59');

      const { data, error } = await q;
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Agent Registrations</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/admin/agents">Active Agents</Link></Button>
          </div>
        </div>

        <div className="bg-muted/20 p-4 rounded-lg mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Status</label>
              <select className="w-full border rounded-md h-9 px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="active">Active</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Country (Loc)</label>
              <Input placeholder="Search location..." value={country} onChange={(e) => setCountry(e.target.value)} className="h-9" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Ship Method</label>
              <select className="w-full border rounded-md h-9 px-2 text-sm" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="">Any Method</option>
                <option value="Air Cargo">Air Cargo</option>
                <option value="Sea Freight">Sea Freight</option>
                <option value="Hand-carry (Traveler)">Hand-carry</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Category</label>
              <select className="w-full border rounded-md h-9 px-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Any Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Medical Items">Medical Items</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Auto Parts">Auto Parts</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">From</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">To</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9" />
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <Button onClick={fetchData} size="sm" className="w-32">Filter</Button>
              <Button variant="outline" size="sm" onClick={() => { setStatus(''); setCountry(''); setMethod(''); setCategory(''); setFromDate(''); setToDate(''); }}>Reset</Button>
            </div>
          </div>
        </div>

        <div className="overflow-auto border rounded-md shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">ID</th>
                <th className="text-left p-3 font-medium">Identity</th>
                <th className="text-left p-3 font-medium">Location</th>
                <th className="text-left p-3 font-medium">Capabilities</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-right p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t hover:bg-muted/5">
                  <td className="p-3 text-muted-foreground">#{r.id}</td>
                  <td className="p-3">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </td>
                  <td className="p-3">{r.country || '-'} / {r.city || '-'}</td>
                  <td className="p-3 max-w-[200px] truncate text-xs text-muted-foreground">
                    {[...(r.shipping_methods || []), ...(r.goods_types || [])].join(', ')}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${r.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                      r.status === 'active' ? 'bg-green-100 text-green-800' :
                        r.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <Button asChild size="sm" variant="outline" className="h-8">
                      <Link to={`/admin/agent-registrations/${r.id}`}>Review</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No registrations found matching filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAgentRegistrations;
