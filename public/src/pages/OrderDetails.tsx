import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ExternalLink, Save, ClipboardCopy, Send, MessageSquare, CheckCircle2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Order = Database['public']['Tables']['orders']['Row'];
type OrderStatus = Database['public']['Enums']['order_status'];

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>('new');
  const [notes, setNotes] = useState("");
  const [copying, setCopying] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [itemsList, setItemsList] = useState<string[]>([]);
  const [parsedUrl, setParsedUrl] = useState("");

  const parseLegacyNotes = (rawNotes: string) => {
    let info = {
      phone: "",
      type: "",
      items: [] as string[],
      url: "",
      email: "",
      address: "",
      cleanNotes: ""
    };

    // Helper for loose matching
    const looseMatch = (label: string) => new RegExp(`${label}\\s*(.*?)(?:\\r?\\n|$)`, 'i');

    const phoneMatch = rawNotes.match(looseMatch('Phone:'));
    if (phoneMatch) info.phone = phoneMatch[1].trim();

    const typeMatch = rawNotes.match(looseMatch('TYPE:'));
    if (typeMatch) info.type = typeMatch[1].trim();

    const urlMatch = rawNotes.match(looseMatch('URL:'));
    if (urlMatch) info.url = urlMatch[1].trim();

    const emailMatch = rawNotes.match(looseMatch('User Email:'));
    if (emailMatch) info.email = emailMatch[1].trim();

    // Capture address until double newline or next known keyword (Phone, Type, Items, URL, User Email)
    const addressMatch = rawNotes.match(/Shipping Address:\s*([\s\S]*?)(?=\r?\n(?:Phone:|TYPE:|Items:|URL:|User Email:)|$|\r?\n\r?\n)/i);
    if (addressMatch) {
      const addr = addressMatch[1].trim();
      if (!addr.includes('undefined')) {
        info.address = addr;
      }
    }

    // Extract Items block - explicitly handle \r\n and various spacing
    const itemsMatch = rawNotes.match(/Items:\s*([\s\S]*?)(?=\s*(?:URL:|User Email:|Shipping Address:|$))/i);
    if (itemsMatch) {
      info.items = itemsMatch[1].split(/\r?\n/).map(i => i.trim()).filter(i => i);
    }

    // Remove specific fields to leave only "real" notes
    let cleaned = rawNotes
      .replace(/CONTACT INFO:[\s\S]*?(?=\r?\n\r?\n|\n[A-Z]|$)/i, '')
      .replace(new RegExp(`Phone:.*?(?:\\r?\\n|$)`, 'gi'), '')
      .replace(new RegExp(`TYPE:.*?(?:\\r?\\n|$)`, 'gi'), '')
      .replace(/Items:\s*[\s\S]*?(?=\s*(?:URL:|User Email:|Shipping Address:|$))/i, '')
      .replace(new RegExp(`URL:.*?(?:\\r?\\n|$)`, 'gi'), '')
      .replace(new RegExp(`User Email:.*?(?:\\r?\\n|$)`, 'gi'), '')
      .replace(/Shipping Address:[\s\S]*?(?=\r?\n(?:Phone:|TYPE:|Items:|URL:|User Email:)|$|\r?\n\r?\n)/i, '')
      .trim();

    info.cleanNotes = cleaned;
    return info;
  };

  useEffect(() => {
    // checkAuth is handled by RoleGuard
    // checkAuth();
    fetchOrder();
  }, [orderId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      navigate('/admin');
    }
  };

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', parseInt(orderId!))
        .single();

      if (error) throw error;

      let internalNote = data.notes || "";
      let publicNote = "";
      let parsedItems: string[] = [];

      // Parsing Logic
      if (data.notes) {
        try {
          if (data.notes.startsWith('{') || data.notes.startsWith('[')) {
            // New JSON format
            const parsed = JSON.parse(data.notes);
            internalNote = parsed.internal || "";
            publicNote = parsed.public || "";
            if (parsed.items_metadata) {
              parsedItems = parsed.items_metadata.map((i: any) => `${i.quantity}x ${i.name} (${i.price} DZD)`);
            } else if (parsed.items) {
              parsedItems = parsed.items; // Fallback if simple array
            }
            if (parsed.shipping_address) setShippingAddress(parsed.shipping_address);
            if (parsed.user_email) setCustomerEmail(parsed.user_email);
            if (parsed.product_url) setParsedUrl(parsed.product_url);
            else if (data.product_url) setParsedUrl(data.product_url);

            // EDGE CASE: If legacy dump exists INSIDE the 'internal' field (from previous partial save)
            if (internalNote && (internalNote.includes('CONTACT INFO:') || internalNote.match(/Items:\s*(\r?\n|$)/i) || internalNote.match(/URL:\s*http/i))) {
              console.log("Found legacy dump in internalNote:", internalNote);
              const legacy = parseLegacyNotes(internalNote);
              console.log("Parsed legacy dump:", legacy);

              internalNote = legacy.cleanNotes;

              // Recover missing data from the dump if JSON didn't have it (or force overwrite if we found valid data in dump)
              if (legacy.items.length > 0) parsedItems = legacy.items;
              if (legacy.email) setCustomerEmail(legacy.email);
              if (legacy.address) setShippingAddress(legacy.address);
              if (legacy.url) setParsedUrl(legacy.url);

              // If the main contact is missing but we found phone in notes
              if ((!data.contact_value || data.contact_value === 'undefined') && legacy.phone) {
                (data as any)._displayPhone = legacy.phone;
              }
            } else {
              console.log("No legacy dump pattern found in:", internalNote);
            }

          } else {
            // Legacy String format - Parse it!
            const legacy = parseLegacyNotes(data.notes);
            console.log("Parsed legacy string:", legacy);

            if (legacy.phone || legacy.email || legacy.items.length > 0 || legacy.url) {
              internalNote = legacy.cleanNotes; // Hide raw dump from notes
              parsedItems = legacy.items;
              if (legacy.email) setCustomerEmail(legacy.email);
              if (legacy.address) setShippingAddress(legacy.address);
              if (legacy.url) setParsedUrl(legacy.url);

              if ((!data.contact_value || data.contact_value === 'undefined') && legacy.phone) {
                (data as any)._displayPhone = legacy.phone;
              }
            }
          }
        } catch (e) {
          // If parse fails, treat as raw text
          console.log("Parsing error", e);
        }
      }

      setOrder({ ...data, user_notes: publicNote } as any);
      setStatus(data.status);
      setNotes(internalNote);
      setItemsList(parsedItems);
      // Ensure we display URL from DB if exists, else from parse
      if (!parsedUrl && data.product_url) setParsedUrl(data.product_url);

    } catch (error: any) {
      console.error('Fetch order error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
      // navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;

    setSaving(true);
    try {
      // Reconstruct JSON to save all the extracted goodies
      let existingMetadata: any = {};
      try {
        // Attempt to keep existing non-conflicting metadata if it was already JSON
        if (order.notes && (order.notes.startsWith('{') || order.notes.startsWith('['))) {
          existingMetadata = JSON.parse(order.notes);
        }
      } catch (e) { }

      const newNotesJson = {
        ...existingMetadata,
        internal: notes.trim(),
        public: (order as any).user_notes?.trim() || "",
        // Save extracted fields so they persist in structured format
        shipping_address: shippingAddress,
        user_email: customerEmail,
        items: itemsList,
        // If we parsed a URL and it's not in the main column, save it here too
        product_url: parsedUrl || order.product_url
      };

      const { error } = await supabase
        .from('orders')
        .update({
          status,
          notes: JSON.stringify(newNotesJson),
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order updated successfully",
      });

      // Update local state to reflect changes (though load happens on mount)
      setOrder({ ...order, status, notes: JSON.stringify(newNotesJson) });

      // Direct Email Invocation (Order Update)
      console.log(`Invoking Email for Order Update #${order.id}...`);

      // We send the NEW record (with updated status/notes) and the OLD record (from state before update)
      // Force-inject the resolved email so Edge Function doesn't have to parse it
      const updatedRecord = {
        ...order,
        status,
        email: customerEmail,
        notes: JSON.stringify(newNotesJson)
      };

      console.log(`Invoking Email for Order Update #${order.id} to ${customerEmail || "No Email in State"}...`);

      supabase.functions.invoke('send-email', {
        body: {
          type: 'order_update',
          record: updatedRecord,
          old_record: order
        }
      }).then(({ data: emailData, error: emailError }) => {
        if (emailError) console.error("Order Update Email Error:", emailError);
        else console.log("Order Update Email Success:", emailData);
      });
    } catch (error: any) {
      console.error('Update order error:', error);
      toast({
        title: "Error",
        description: `Failed: ${error.message || error}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyCmd = async (cmd: string, label: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopying(label);
      toast({ title: "Copied", description: `${label} copied to clipboard` });
      setTimeout(() => setCopying(""), 1200);
    } catch (e) {
      toast({ title: "Error", description: "Failed to copy", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/30">
      <Navbar />

      <main className="flex-1 container py-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link to="/admin/orders">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order #{order.id}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                order.status === 'processing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  order.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-red-50 text-red-700 border-red-200'
                }`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground ml-10">
              Created on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT COLUMN: INFORMATION (2/3) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Customer & Contact */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid sm:grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer Name</Label>
                  <div className="mt-1 font-medium text-lg">{order.name}</div>
                  {customerEmail && (
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <span className="font-semibold text-xs">EMAIL:</span> {customerEmail}
                    </div>
                  )}
                  {shippingAddress && (
                    <div className="mt-3">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Shipping Address</Label>
                      <div className="mt-1 text-sm text-gray-700 bg-amber-50/50 p-2 rounded border border-amber-100 leading-relaxed">
                        {shippingAddress}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {(() => {
                      const phone = (order as any)._displayPhone || order.contact_value;
                      const cleanPhone = phone?.replace(/\D/g, '') || '';
                      const isWhatsapp = order.contact_type === 'whatsapp';
                      const link = isWhatsapp
                        ? `https://wa.me/${cleanPhone}`
                        : `https://t.me/${cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone}`; // Telegram usually needs + for phone lookup or username

                      return (
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {isWhatsapp ? (
                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                              <Send className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </a>
                      );
                    })()}
                    <span className="font-medium text-lg ml-2">{(order as any)._displayPhone || order.contact_value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product & Order Content */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ClipboardCopy className="h-4 w-4 text-primary" /> Order Content
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Product / Link</Label>
                  <div className="mt-2">
                    <div className="mt-2">
                      {/* Hide generic "Store Order" or "Custom Request" strings if they aren't real links */}
                      {(parsedUrl || order.product_url) &&
                        !((parsedUrl || order.product_url).startsWith('Store Order') || (parsedUrl || order.product_url).startsWith('Custom Request')) &&
                        ((parsedUrl || order.product_url).startsWith('http') || (parsedUrl || order.product_url).startsWith('https')) ? (
                        <a href={parsedUrl || order.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg border bg-blue-50/30 border-blue-100 text-blue-700 hover:bg-blue-50 transition-colors group">
                          <ExternalLink className="h-4 w-4" />
                          <span className="font-medium truncate underline-offset-4 group-hover:underline">{parsedUrl || order.product_url}</span>
                        </a>
                      ) : (
                        // If it's a store order or text-only, just show it as text label or hide if redundant
                        <div className="p-3 rounded-lg border bg-gray-50 text-gray-700 font-medium">
                          {(parsedUrl && !parsedUrl.startsWith('Store Order') && !parsedUrl.startsWith('Custom Request'))
                            ? parsedUrl
                            : (itemsList.length > 0 ? itemsList.length + " Items (See Details below)" : order.product_url || "No link provided")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Details / Items</Label>
                  <div className="mt-2 p-4 rounded-lg border bg-gray-50/50 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {/* Try to parse if it's JSON note structure (legacy fix) */}
                    {itemsList.length > 0 ? (
                      itemsList.map((item, idx) => (
                        <div key={idx} className="mb-1">• {item}</div>
                      ))
                    ) : (
                      (() => {
                        try {
                          if (order.notes && order.notes.startsWith('{') && JSON.parse(order.notes)?.items_metadata) {
                            return JSON.parse(order.notes).items_metadata.map((i: any) => `- ${i.quantity}x ${i.name}`).join('\n');
                          }
                        } catch (e) { }
                        return notes || order.notes || "No details.";
                      })()
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financials */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center text-[10px] font-bold text-primary">$</div>
                  Financials
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center divide-x">
                  <div className="px-2">
                    <div className="text-xs text-muted-foreground">Product Price</div>
                    <div className="font-semibold text-lg mt-1">{order.price} <span className="text-xs font-normal text-gray-500">DZD</span></div>
                  </div>
                  <div className="px-2">
                    <div className="text-xs text-muted-foreground">Shipping</div>
                    <div className="font-semibold text-lg mt-1">{order.shipping_price} <span className="text-xs font-normal text-gray-500">DZD</span></div>
                  </div>
                  <div className="px-2">
                    <div className="text-xs text-primary font-bold">Total</div>
                    <div className="font-bold text-2xl mt-1 text-primary">{order.total} <span className="text-sm font-normal text-primary/70">DZD</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: ACTIONS (1/3) */}
          <div className="space-y-6">

            {/* Status & Workflows */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                <CardTitle className="text-sm font-semibold">Order Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Current Status</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Processing (New)</SelectItem>
                      <SelectItem value="processing">On the way</SelectItem>
                      <SelectItem value="done">Completed</SelectItem>
                      <SelectItem value="cancelled">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader className="pb-3 border-b border-gray-50 bg-gray-50/50">
                <CardTitle className="text-sm font-semibold">Communication</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="user_notes" className="text-xs font-semibold flex items-center gap-2 text-primary">
                    <MessageSquare className="w-3 h-3" /> Public Note
                    <span className="ml-auto text-[10px] font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">Visible to User</span>
                  </Label>
                  <Textarea
                    id="user_notes"
                    placeholder="Message for tracking page..."
                    value={(order as any).user_notes || ""}
                    onChange={(e) => setOrder({ ...order!, user_notes: e.target.value })}
                    rows={3}
                    className="bg-primary/5 border-primary/20 focus-visible:ring-primary/30 min-h-[80px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs font-semibold flex items-center gap-2 text-gray-700">
                    <ClipboardCopy className="w-3 h-3" /> Internal Note
                    <span className="ml-auto text-[10px] font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">Private</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Internal admin comments..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="bg-gray-50 min-h-[80px] text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;
