import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Loader2, Share2, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

const ReferralCode = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  // Default to whatsapp/phone interactions, hidden from user
  const contactType = "whatsapp";
  const [contactValue, setContactValue] = useState("+213");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Check stats section
  const [checkLoading, setCheckLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactValue.trim()) {
      toast({
        title: t('referral.toast.error'),
        description: t('referral.toast.contact_required'),
        variant: "destructive",
      });
      return;
    }

    // Validate Algerian phone number format
    const algerianPhoneRegex = /^\+213[567]\d{8}$/;
    const cleanedValue = contactValue.replace(/[\s-()]/g, '');

    if (!algerianPhoneRegex.test(cleanedValue)) {
      toast({
        title: t('referral.toast.error'),
        description: t('referral.toast.phone_invalid'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Normalize contact
      const normalizedContact = cleanedValue;

      // Check if this contact already has a referral code
      const { data: existingCode } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("owner_contact", normalizedContact)
        .eq("contact_type", contactType)
        .maybeSingle();

      if (existingCode) {
        setGeneratedCode(existingCode.code);
        toast({
          title: t('referral.toast.existing_title'),
          description: t('referral.toast.existing_desc'),
        });
        setLoading(false);
        return;
      }

      // Generate a random 8-character alphanumeric code
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      let newCode = generateCode();
      let isUnique = false;
      let attempts = 0;

      // Retry loop for uniqueness check
      while (!isUnique && attempts < 5) {
        const { data: existing } = await supabase
          .from("referral_codes")
          .select("code")
          .eq("code", newCode)
          .maybeSingle();

        if (!existing) {
          isUnique = true;
        } else {
          newCode = generateCode();
          attempts++;
        }
      }

      if (!isUnique) {
        toast({
          title: t('referral.generationError') || "Error",
          description: "Failed to generate unique code. Please try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Insert
      const { error: insertError } = await supabase
        .from("referral_codes")
        .insert({
          code: newCode,
          owner_contact: normalizedContact,
          contact_type: contactType,
          total_collected: 0,
          rewards_granted: 0,
          total_earnings_da: 0,
        });

      if (insertError) throw insertError;

      setGeneratedCode(newCode);
      toast({
        title: t('referral.toast.success_title'),
        description: t('referral.toast.success_desc'),
      });
    } catch (error: any) {
      console.error("Error generating code:", error);
      toast({
        title: t('referral.toast.error'),
        description: error.message || t('referral.toast.success_desc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      toast({
        title: t('referral.toast.copied_title'),
        description: t('referral.toast.copied_desc'),
      });
    }
  };

  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  const handleCheckStats = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactValue.trim()) {
      toast({
        title: t('referral.toast.error'),
        description: t('referral.toast.contact_required'),
        variant: "destructive",
      });
      return;
    }

    // Validate Algerian phone number format
    const algerianPhoneRegex = /^\+213[567]\d{8}$/;
    const cleanedValue = contactValue.replace(/[\s-()]/g, '');

    if (!algerianPhoneRegex.test(cleanedValue)) {
      toast({
        title: t('referral.toast.error'),
        description: t('referral.toast.phone_invalid'),
        variant: "destructive"
      });
      return;
    }

    setCheckLoading(true);
    try {
      const normalizedContact = cleanedValue;

      const { data, error } = await supabase
        .from("referral_codes")
        .select("*")
        .eq("owner_contact", normalizedContact)
        .eq("contact_type", contactType)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: t('referral.toast.check_none_title'),
          description: t('referral.toast.check_none_desc'),
          variant: "destructive",
        });
        setStats(null);
        setWithdrawals([]);
      } else {
        setStats(data);

        // Fetch withdrawals for this code
        const { data: withdrawalsData, error: withdrawalsError } = await supabase
          .from("withdrawal_requests")
          .select("*")
          .eq("referral_code_id", data.id)
          .order("created_at", { ascending: false });

        if (withdrawalsError) {
          console.error("Error fetching withdrawals:", withdrawalsError);
        } else {
          setWithdrawals(withdrawalsData || []);
        }

        toast({
          title: t('referral.toast.check_found_title'),
          description: t('referral.toast.check_found_desc'),
        });
      }
    } catch (error: any) {
      console.error("Error checking stats:", error);
      toast({
        title: t('referral.toast.error'),
        description: error.message || t('referral.toast.fetch_error'),
        variant: "destructive",
      });
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container py-6 sm:py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <Gift className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">{t('referral.headerTitle')}</h1>
            <p className="text-muted-foreground">{t('referral.headerDesc')}</p>
          </div>

          {!generatedCode ? (
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">{t('referral.genTitle')}</CardTitle>
                <CardDescription className="text-sm">{t('referral.genDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleGenerate} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact">{t('referral.labels.whatsapp')}</Label>
                    <Input
                      id="contact"
                      type="text"
                      placeholder={t('referral.placeholders.whatsapp')}
                      value={contactValue}
                      onChange={(e) => {
                        let value = e.target.value;
                        // Always keep +213 prefix
                        if (!value.startsWith("+213")) {
                          value = "+213";
                        }
                        setContactValue(value);
                      }}
                      required
                    />
                    <p className="text-xs text-muted-foreground">{t('referral.toast.phone_invalid')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('referral.actions.generating')}
                        </>
                      ) : (
                        <>
                          <Share2 className="mr-2 h-4 w-4" />
                          {t('referral.actions.generate')}
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={checkLoading}
                      onClick={(e) => {
                        e.preventDefault();
                        handleCheckStats(e as any);
                      }}
                    >
                      {checkLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('referral.actions.checking')}
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          {t('referral.actions.verify')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                {stats && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{t('referral.stats.your_code')}</h3>
                      <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                        {stats.code}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>{t('referral.stats.total_collected')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-primary">
                            ${parseFloat(stats.total_collected).toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>{t('referral.stats.rewards')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">
                            {stats.rewards_granted}x
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>{t('referral.stats.total_earned')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-orange-600">
                            {parseFloat(stats.total_earnings_da).toFixed(0)} DA
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert>
                      <Gift className="h-4 w-4" />
                      <AlertDescription>
                        {(() => {
                          const collected = parseFloat(stats.total_collected);
                          const nextMilestone = (Math.floor(collected / 200) + 1) * 200;
                          const remaining = nextMilestone - collected;
                          return (
                            <div className="space-y-1 text-sm">
                              <p>
                                {t('referral.stats.milestone_prefix')} <strong>${remaining.toFixed(2)}</strong> {t('referral.stats.milestone_suffix')} {" "}
                                <strong>{t('referral.stats.milestone_reward')}</strong>!
                              </p>
                              <p className="text-xs text-muted-foreground italic">
                                {t('referral.self_referral_note')}
                              </p>
                            </div>
                          );
                        })()}
                      </AlertDescription>
                    </Alert>


                    {(() => {
                      const totalEarnings = parseFloat(stats.total_earnings_da);
                      const totalWithdrawn = withdrawals
                        .filter(w => w.status !== 'rejected')
                        .reduce((sum, w) => sum + parseFloat(w.amount_da), 0);
                      const availableBalance = totalEarnings - totalWithdrawn;
                      const pendingRequest = withdrawals.find(w => w.status === 'pending');

                      if (availableBalance <= 0 && !pendingRequest) return null;

                      return (
                        <>
                          <div className="flex flex-col gap-4">
                            {/* Balance Card or info */}
                            <Card className="bg-primary/5 border-primary/20">
                              <CardContent className="pt-6 pb-4 flex justify-between items-center">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">{t('referral.withdraw.available_balance')}</p>
                                  <p className="text-2xl font-bold text-primary">{availableBalance.toFixed(0)} DA</p>
                                </div>
                                {pendingRequest ? (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" /> {t('referral.withdraw.pending_approval')}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    {t('referral.withdraw.ready')}
                                  </Badge>
                                )}
                              </CardContent>
                            </Card>

                            {pendingRequest ? (
                              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                                <p><strong>{t('referral.withdraw.pending_request')}:</strong> {parseFloat(pendingRequest.amount_da).toFixed(0)} DA requested on {new Date(pendingRequest.created_at).toLocaleDateString()}.</p>
                                <p className="mt-1">You can request again once this is processed.</p>
                              </div>
                            ) : availableBalance >= 1000 ? (
                              <Button
                                onClick={() => setShowWithdrawDialog(true)}
                                className="w-full"
                                size="lg"
                              >
                                <span className="mr-2">💰</span>
                                {t('referral.withdraw.button')} ({availableBalance.toFixed(0)} DA)
                              </Button>
                            ) : (
                              <div className="text-center p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                                Minimum withdrawal amount is 1000 DA. You need {(1000 - availableBalance).toFixed(0)} DA more.
                              </div>
                            )}
                          </div>

                          <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Request Withdrawal</DialogTitle>
                                <DialogDescription>
                                  Please provide your preferred payment details.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                <div className="p-3 bg-muted rounded-md flex justify-between">
                                  <span>Amount to Withdraw:</span>
                                  <span className="font-bold">{availableBalance.toFixed(0)} DA</span>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Payment Method & Notes</Label>
                                  <textarea
                                    id="notes"
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                    placeholder="Examples:&#10;- CCP: 12345678 key 99 (Name)&#10;- BaridiMob: 00799999...&#10;- Hand to hand in Algiers"
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email">Email for Notification (Optional)</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email to receive confirmation"
                                    value={notificationEmail}
                                    onChange={(e) => setNotificationEmail(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>Cancel</Button>
                                <Button
                                  onClick={async () => {
                                    if (!paymentNotes.trim()) {
                                      toast({ title: "Error", description: "Please enter payment details", variant: "destructive" });
                                      return;
                                    }
                                    try {
                                      setLoading(true);
                                      const { error } = await supabase
                                        .from('withdrawal_requests')
                                        .insert({
                                          referral_code_id: stats.id,
                                          referral_code: stats.code,
                                          amount_da: availableBalance,
                                          contact_type: stats.contact_type,
                                          contact_info: stats.owner_contact,
                                          payment_notes: paymentNotes,
                                          email: notificationEmail,
                                          status: 'pending'
                                        });

                                      if (error) throw error;

                                      setShowWithdrawDialog(false);
                                      setShowSuccessDialog(true);
                                      setPaymentNotes("");
                                      // Refresh stats/withdrawals logic should ideally happen here or close clears it
                                      // Simple refresh:
                                      handleCheckStats({ preventDefault: () => { } } as any);

                                      // Email notification is now handled by Database Trigger (on_withdrawal_request_email)

                                      // Clear States Immediately
                                      setPaymentNotes("");
                                      setNotificationEmail("");

                                    } catch (error: any) {
                                      console.error(error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to submit request",
                                        variant: 'destructive'
                                      });
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                  disabled={loading}
                                >
                                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Confirm Request
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-green-600">
                                  ✅ {t('referral.withdraw.request_submitted')}
                                </DialogTitle>
                                <DialogDescription>
                                  Your withdrawal request has been received.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="text-sm space-y-2">
                                <p><span className="font-medium">Code:</span> {stats.code}</p>
                                <p><span className="font-medium">Amount:</span> {availableBalance.toFixed(0)} DA</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  An admin will review your request and process the payment to the details you provided.
                                </p>
                              </div>
                              <DialogFooter>
                                <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('referral.stats.your_code')}</CardTitle>
                  <CardDescription>{t('referral.headerDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted p-4 rounded-lg text-center">
                      <span className="text-3xl font-bold tracking-wider">{generatedCode}</span>
                    </div>
                    <Button onClick={copyToClipboard} variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>{t('referral.contactLabel', { type: contactType === 'whatsapp' ? 'WhatsApp' : 'Telegram', value: contactValue })}</p>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold">{t('referral.howItWorks.title')}</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>{t('referral.howItWorks.step1')}</li>
                      <li>{t('referral.howItWorks.step2')}</li>
                      <li>{t('referral.howItWorks.step3')}</li>
                      <li>{t('referral.howItWorks.step4')}</li>
                    </ul>
                    <p className="text-sm mt-3">{t('referral.howItWorks.example')}</p>
                  </div>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => {
                  setGeneratedCode(null);
                  setContactValue("+213");
                  setStats(null);
                }}
                variant="outline"
                className="w-full"
              >
                {t('referral.generateAnother')}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReferralCode;
