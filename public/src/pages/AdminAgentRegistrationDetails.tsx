import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Registration {
  id: number;
  name: string;
  business_name: string | null;
  email: string;
  phone_whatsapp: string;
  telegram: string | null;
  country: string | null;
  city: string | null;

  shipping_countries: string[] | null;
  shipping_methods: string[] | null;
  shipment_frequency: string | null;

  goods_types: string[] | null;

  price_per_kg: number | null;
  currency: string | null;
  pricing_type: string | null;

  additional_notes: string | null;

  // Legacy or unused fields from old schema might still exist but strictly we look at new ones
  status: string;
  notes: string | null; // Admin notes
  created_at: string;
}

const AdminAgentRegistrationDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [reg, setReg] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);

  const [finalCommission, setFinalCommission] = useState(''); // Used for 'pricing_type' update or notes
  const [adminNote, setAdminNote] = useState('');

  const fetchDetail = async () => {
    const { data, error } = await (supabase as any).from('agents').select('*').eq('id', id).single();
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    setReg(data);
    if (data.notes) setAdminNote(data.notes);
  };

  useEffect(() => { fetchDetail(); }, [id]);

  const log = async (action: string, details: any) => {
    await (supabase as any).from('agent_registration_logs').insert({ registration_id: Number(id), action, details });
  };

  const verify = async (rejected = false) => {
    const newStatus = rejected ? 'rejected' : 'verified';
    const { error } = await (supabase as any).from('agents').update({ status: newStatus, notes: adminNote || null }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      await log(rejected ? 'rejected' : 'verified', { note: adminNote });
      toast({ title: `Registration ${newStatus}` });
      fetchDetail();
    }
  };

  const activate = async () => {
    if (!reg) return;
    setLoading(true);

    // Simplification: In unified schema, we just update status to 'active' and set active=true
    const { error } = await (supabase as any).from('agents').update({
      status: 'active',
      active: true,
      notes: adminNote
    }).eq('id', id);

    if (error) {
      toast({ title: 'Error activating agent', description: error.message, variant: 'destructive' });
      setLoading(false);
    } else {
      await log('activated', { note: adminNote });

      // Direct Email Invocation
      console.log('Sending Approval Email', reg.id);
      supabase.functions.invoke('send-email', {
        body: {
          type: 'agent_approved',
          record: reg,
          admin_note: adminNote
        }
      }).then(({ data, error }) => {
        if (error) console.error('Email Error:', error);
        else console.log('Email Sent:', data);
      });

      toast({ title: 'Agent Activated Successfully' });
      fetchDetail();
    }
    setLoading(false);
  };

  if (!reg) return (
    <div className="min-h-screen flex flex-col"><Navbar /><main className="flex-1 p-8 text-center">Loading...</main></div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/10">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Agent Application #{reg.id}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Created: {new Date(reg.created_at).toLocaleString()}</span>
                <Badge variant={reg.status === 'pending' ? 'secondary' : reg.status === 'active' ? 'default' : 'outline'}>
                  {reg.status.toUpperCase()}
                </Badge>
              </div>
            </div>
            <Button asChild variant="outline"><Link to="/admin/agent-registrations">Back to List</Link></Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-6">

              {/* Identity */}
              <div className="bg-card border rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Identity & Contact</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground text-xs">Full Name</label>
                    <div className="font-medium">{reg.name}</div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Email</label>
                    <div className="font-medium">{reg.email}</div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Phone (WhatsApp)</label>
                    <div className="font-medium">{reg.phone_whatsapp}</div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Telegram</label>
                    <div className="font-medium">{reg.telegram || '-'}</div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Location</label>
                    <div className="font-medium">{reg.country} / {reg.city}</div>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="bg-card border rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Logistics Capabilities</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-muted-foreground text-xs block mb-1">Shipping From (Countries)</label>
                    <div className="flex flex-wrap gap-1">
                      {reg.shipping_countries?.map(c => <Badge key={c} variant="outline" className="bg-blue-50/50">{c}</Badge>) || '-'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-muted-foreground text-xs block mb-1">Methods</label>
                      <div className="space-y-1">
                        {reg.shipping_methods?.map(m => <div key={m}>• {m}</div>) || '-'}
                      </div>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs block mb-1">Frequency</label>
                      <div className="font-medium capitalize">{reg.shipment_frequency || '-'}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs block mb-1">Supported Goods</label>
                    <div className="flex flex-wrap gap-1">
                      {reg.goods_types?.map(g => <Badge key={g} variant="secondary">{g}</Badge>) || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Notes */}
              <div className="bg-card border rounded-lg p-5 shadow-sm">
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Pricing & Additional Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <label className="text-muted-foreground text-xs">Price per KG</label>
                    <div className="font-medium">
                      {reg.price_per_kg ? `${reg.price_per_kg} ${reg.currency || ''}` : 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Pricing Type</label>
                    <div className="font-medium capitalize">{reg.pricing_type || '-'}</div>
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground text-xs block mb-1">Additional Notes</label>
                  <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">{reg.additional_notes || 'No notes provided.'}</div>
                </div>
              </div>

            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-5 shadow-sm sticky top-24">
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Validation</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Notes / Logic</label>
                    <Textarea
                      value={adminNote}
                      onChange={e => setAdminNote(e.target.value)}
                      placeholder="Internal tracking notes..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button onClick={() => verify(false)} variant="outline" className="w-full">
                      Mark Verified
                    </Button>
                    <Button onClick={() => verify(true)} variant="outline" className="w-full border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
                      Reject
                    </Button>
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      onClick={activate}
                      disabled={loading || reg.status === 'active'}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {reg.status === 'active' ? 'Agent Active' : 'Approve & Activate'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Activates agent account and enables matching.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminAgentRegistrationDetails;
