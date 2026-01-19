import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportRequest {
  id: number;
  customer_name: string | null;
  contact_method: string;
  contact_value: string;
  origin_country: string;
  origin_city: string | null;
  product_description: string;
  product_links: string[] | null;
  product_currency: string;
  product_value: number;
  quantity: number;
  shipping_priority: string;
  delivery_method: string;
  attachments: string[] | null;
  status: string;
  agent_name: string | null;
  agent_phone: string | null;
  agent_note: string | null;
  agent_fee: number | null;
  calculated_commission: number | null;
  calculated_agent_fee: number | null;
  created_at: string;
}

const AdminImportRequestDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const nav = useNavigate();
  const [req, setReq] = useState<ImportRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetail = async () => {
    const { data, error } = await (supabase as any).from('import_requests').select('*').eq('id', id).single();
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setReq(data as any);
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const updateStatus = async (status: string) => {
    if (!id) return;
    setLoading(true);
    const { error } = await (supabase as any).from('import_requests').update({ status }).eq('id', id);
    setLoading(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    else {
      await logAction('status_update', { status });
      toast({ title: 'Updated', description: `Status -> ${status}` });
      fetchDetail();
    }
  };

  const verify = async (rejected = false) => {
    const newStatus = rejected ? 'rejected' : 'verified';
    const { error } = await (supabase as any).from('import_requests').update({ status: newStatus }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' }); else { await logAction('verify', { status: newStatus }); toast({ title: 'Updated' }); fetchDetail(); }
  };

  const assignAgent = async (payload: { name?: string; phone?: string; note?: string; fee?: string }) => {
    const { error } = await (supabase as any).from('import_requests').update({
      agent_name: payload.name || null,
      agent_phone: payload.phone || null,
      agent_note: payload.note || null,
      agent_fee: payload.fee ? Number(payload.fee) : null,
      status: 'assigned'
    }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' }); else { await logAction('assign_agent', payload); toast({ title: 'Agent assigned' }); fetchDetail(); }
  };

  const logAction = async (action: string, details: any) => {
    try {
      await (supabase as any).from('import_request_logs').insert({ request_id: Number(id), action, details });
    } catch (_) {}
  };

  const whatsappUrl = useMemo(() => {
    if (!req?.agent_phone) return '';
    const msg = `Hello ${req.agent_name||''}, new import request #${req.id}: ${req.product_description}. Origin: ${req.origin_country}/${req.origin_city||''}. Value: ${(req.product_value||0)*(req.quantity||1)} ${req.product_currency}. Customer contact: ${req.contact_method}: ${req.contact_value}. Please confirm availability and price.`;
    return `https://wa.me/${encodeURIComponent(req.agent_phone)}?text=${encodeURIComponent(msg)}`;
  }, [req]);

  if (!req) return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1"><div className="container px-4 py-6">Loading...</div></main><Footer /></div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Import Request #{req.id}</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline"><Link to="/admin/import-requests">Back</Link></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-md p-4">
              <h2 className="font-semibold mb-2">Customer</h2>
              <div className="text-sm">{req.customer_name || '-'} — {req.contact_method}: {req.contact_value}</div>
              <div className="text-sm mt-2">Origin: {req.origin_country} / {req.origin_city || '-'}</div>
            </div>
            <div className="border rounded-md p-4">
              <h2 className="font-semibold mb-2">Product</h2>
              <div className="text-sm">{req.product_description}</div>
              <div className="text-sm mt-2">Value × Qty: {(req.product_value||0)} {req.product_currency} × {req.quantity} = {(req.product_value||0)*(req.quantity||1)} {req.product_currency}</div>
              {Array.isArray(req.product_links) && req.product_links.length > 0 && (
                <div className="mt-2 space-y-1">
                  {req.product_links.map((l, idx) => (
                    <div key={idx}><a className="text-primary underline" href={l} target="_blank">Link {idx+1}</a></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4 mb-6">
            <h2 className="font-semibold mb-3">Status: {req.status}</h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => verify(false)} variant="outline">Verify</Button>
              <Button onClick={() => verify(true)} variant="destructive">Reject</Button>
              <Button onClick={() => updateStatus('in_transit')} variant="outline">In Transit</Button>
              <Button onClick={() => updateStatus('arrived')} variant="outline">Arrived</Button>
              <Button onClick={() => updateStatus('delivered')} variant="outline">Delivered</Button>
              <Button onClick={() => updateStatus('completed')}>Mark Completed</Button>
              <Button onClick={() => updateStatus('disputed')} variant="outline">Disputed</Button>
            </div>
          </div>

          <div className="border rounded-md p-4 mb-6">
            <h2 className="font-semibold mb-3">Assign External Agent</h2>
            <AssignAgentForm
              defaultName={req.agent_name||''}
              defaultPhone={req.agent_phone||''}
              defaultNote={req.agent_note||''}
              defaultFee={req.agent_fee?.toString()||''}
              onSubmit={assignAgent}
              whatsappUrl={whatsappUrl}
            />
          </div>

          {req.calculated_commission != null && (
            <div className="border rounded-md p-4 mb-6">
              <h2 className="font-semibold mb-2">Final Amounts</h2>
              <div className="text-sm">Commission: {req.calculated_commission} ({req.product_currency})</div>
              {req.calculated_agent_fee != null && (
                <div className="text-sm">Agent Fee: {req.calculated_agent_fee} ({req.product_currency})</div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const AssignAgentForm = ({ defaultName, defaultPhone, defaultNote, defaultFee, onSubmit, whatsappUrl }: {
  defaultName: string; defaultPhone: string; defaultNote: string; defaultFee: string;
  onSubmit: (p: { name?: string; phone?: string; note?: string; fee?: string }) => void;
  whatsappUrl: string;
}) => {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [note, setNote] = useState(defaultNote);
  const [fee, setFee] = useState(defaultFee);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Agent Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      </div>
      <div>
        <label className="text-sm font-medium">Agent WhatsApp</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +33XXXXXXXXX" />
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-medium">Agent Note</label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Notes for this assignment" />
      </div>
      <div>
        <label className="text-sm font-medium">Agent Fee (optional)</label>
        <Input type="number" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0.00" />
      </div>
      <div className="flex items-end gap-2">
        <Button onClick={() => onSubmit({ name, phone, note, fee })}>Save Assignment</Button>
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <Button variant="outline">Contact Agent via WhatsApp</Button>
          </a>
        )}
      </div>
    </div>
  );
};

export default AdminImportRequestDetails;
