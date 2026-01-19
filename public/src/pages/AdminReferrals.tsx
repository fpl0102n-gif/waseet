import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Gift, Loader2, TrendingUp, Check, X, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReferralCode {
  id: string;
  code: string;
  owner_contact: string;
  contact_type: string;
  total_collected: number;
  rewards_granted: number;
  total_earnings_da: number;
  created_at: string;
  updated_at: string;
}

const AdminReferrals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [stats, setStats] = useState({
    totalCodes: 0,
    totalCollected: 0,
    totalEarnings: 0,
    totalRewards: 0,
  });



  const fetchReferralCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .order("total_collected", { ascending: false });

      if (error) throw error;

      if (data) {
        setReferralCodes(data);

        // Calculate statistics
        const totalCollected = data.reduce((sum, code) => sum + parseFloat(code.total_collected.toString()), 0);
        const totalEarnings = data.reduce((sum, code) => sum + parseFloat(code.total_earnings_da.toString()), 0);
        const totalRewards = data.reduce((sum, code) => sum + code.rewards_granted, 0);

        setStats({
          totalCodes: data.length,
          totalCollected,
          totalEarnings,
          totalRewards,
        });
      }
    } catch (error: any) {
      console.error("Error fetching referral codes:", error);
      toast({
        title: "Error",
        description: "Failed to load referral codes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };



  // ... existing code ...

  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Withdrawal Processing State
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [processAction, setProcessAction] = useState<'paid' | 'rejected' | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [relatedOrders, setRelatedOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchReferralCodes();
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setWithdrawals(data);
  };

  const fetchRelatedOrders = async (referralCode: string) => {
    setLoadingOrders(true);
    const { data } = await supabase
      .from('orders')
      .select('id, created_at, total, status, notes')
      .eq('referral_code', referralCode)
      .order('created_at', { ascending: false })
      .limit(10); // Limit to last 10 orders for context

    if (data) setRelatedOrders(data);
    setLoadingOrders(false);
  };

  // Modified to open dialog in "View" mode first
  const openProcessDialog = (request: any) => {
    setSelectedRequest(request);
    setProcessAction(null); // Reset action
    setAdminNote("");
    setIsProcessDialogOpen(true);
    fetchRelatedOrders(request.referral_code);
  };

  const handleConfirmProcess = async (action: 'paid' | 'rejected') => {
    if (!selectedRequest) return;

    try {
      setLoading(true);

      // 1. Update Database
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: action,
          admin_note: adminNote
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // 2. Send Email Notification (Fire and Forget)
      supabase.functions.invoke('send-email', {
        body: {
          type: 'withdrawal_processed',
          record: {
            ...selectedRequest,
            status: action,
            admin_note: adminNote
          }
        }
      });

      toast({
        title: "Success",
        description: `Request marked as ${action.toUpperCase()} and email sent.`
      });

      // 3. Cleanup
      setIsProcessDialogOpen(false);
      fetchWithdrawals(); // Refresh list

    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="h-8 w-8" />
            Referral Management
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage all referral codes and earnings
          </p>
        </div>

        <Tabs defaultValue="codes">
          <TabsList>
            <TabsTrigger value="codes">Referral Codes</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="codes" className="space-y-4">
            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Codes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalCodes}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Collected</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">${stats.totalCollected.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalRewards}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stats.totalEarnings.toFixed(0)} DA</p>
                </CardContent>
              </Card>
            </div>

            {/* Referral Codes Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Referral Codes</CardTitle>
                <CardDescription>
                  Complete list of all generated referral codes and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referralCodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No referral codes generated yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Contact Type</TableHead>
                          <TableHead className="text-right">Collected ($)</TableHead>
                          <TableHead className="text-center">Rewards</TableHead>
                          <TableHead className="text-right">Earnings (DA)</TableHead>
                          <TableHead className="text-center">Progress</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referralCodes.map((code) => {
                          const collected = parseFloat(code.total_collected.toString());
                          const nextMilestone = (Math.floor(collected / 200) + 1) * 200;
                          const progressToNext = collected % 200;
                          const progressPercent = (progressToNext / 200) * 100;

                          return (
                            <TableRow key={code.id}>
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-base">
                                  {code.code}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {code.owner_contact}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {code.contact_type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                ${collected.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="default" className="bg-green-600">
                                  {code.rewards_granted}x
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary">
                                {parseFloat(code.total_earnings_da.toString()).toFixed(0)} DA
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 min-w-[120px]">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>${progressToNext.toFixed(0)}</span>
                                    <span>/${nextMilestone}</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary transition-all"
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(code.created_at)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Manage payout requests from partners</CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No withdrawal requests found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Payment Details</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>{formatDate(req.created_at)}</TableCell>
                          <TableCell><Badge variant="outline">{req.referral_code}</Badge></TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{req.contact_info}</span>
                              {req.email && <span className="text-xs text-blue-600">{req.email}</span>}
                              <span className="text-xs text-muted-foreground capitalize">{req.contact_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] text-xs truncate" title={req.payment_notes}>
                              {req.payment_notes || <span className="text-muted-foreground italic">No notes</span>}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-green-600">{req.amount_da} DA</TableCell>
                          <TableCell>
                            <Badge variant={req.status === 'paid' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {req.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openProcessDialog(req)}>
                                  <Eye className="h-4 w-4 mr-1" /> View & Process
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review details and select an action.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Request Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">User Contact</Label>
                <div className="font-medium">{selectedRequest?.contact_info}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Referral Code</Label>
                <div className="font-medium">{selectedRequest?.referral_code}</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <div className="font-medium text-lg">{selectedRequest?.amount_da} DA</div>
              </div>
              <div>
                <Label className="text-muted-foreground">Payment Info</Label>
                <div className="font-medium">{selectedRequest?.payment_notes}</div>
              </div>
            </div>

            {/* Related Orders */}
            <div className="space-y-2">
              <Label>Recent Orders from {selectedRequest?.referral_code}</Label>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                {loadingOrders ? (
                  <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
                ) : relatedOrders.length > 0 ? (
                  <div className="space-y-3">
                    {relatedOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center border-b pb-2 last:border-0 text-sm">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">Order #{order.id}</div>
                          <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                          {/* Try to show items context if available */}
                          {/* Try to show items context if available */}
                          <div className="text-xs text-muted-foreground line-clamp-1" title={(() => {
                            try {
                              const notes = order.notes ? JSON.parse(order.notes) : {};
                              return notes.items_metadata?.map((i: any) => i.name).join(', ') || "No items info";
                            } catch { return "Error parsing items"; }
                          })()}>
                            {(() => {
                              try {
                                const notes = order.notes ? JSON.parse(order.notes) : {};
                                return notes.items_metadata?.map((i: any) => i.name).join(', ') || "Items data unavailable";
                              } catch { return "Error parsing items"; }
                            })()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{order.total} DA</div>
                          <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4 text-sm">
                    No linked orders found.<br />
                    <span className="text-xs opacity-70">(Orders before Jan 5th may not be linked)</span>
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Admin Note Input */}
            <div className="space-y-2">
              <Label htmlFor="note">Admin Note / Transaction ID</Label>
              <Textarea
                id="note"
                placeholder="Required for processing. E.g., 'Paid via CCP 12345'"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="h-24"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex w-full justify-between items-center">
              <Button variant="ghost" onClick={() => setIsProcessDialogOpen(false)}>Close</Button>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => { setProcessAction('rejected'); handleConfirmProcess('rejected'); }}
                  disabled={!adminNote.trim() || loading}
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => { setProcessAction('paid'); handleConfirmProcess('paid'); }}
                  disabled={!adminNote.trim() || loading}
                >
                  <Check className="h-4 w-4 mr-1" /> Pay
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReferrals;
