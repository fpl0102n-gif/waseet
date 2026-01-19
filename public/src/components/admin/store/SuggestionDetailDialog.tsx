import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";

interface SuggestionDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    suggestion: any;
    onUpdate: () => void;
}

export function SuggestionDetailDialog({ open, onOpenChange, suggestion, onUpdate }: SuggestionDetailDialogProps) {
    const { toast } = useToast();
    const [status, setStatus] = useState<string>("pending");
    const [adminNotes, setAdminNotes] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (suggestion) {
            setStatus(suggestion.status);
            setAdminNotes(suggestion.admin_notes || "");
        }
    }, [suggestion]);

    const handleSave = async () => {
        if (!suggestion) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('store_product_suggestions')
                .update({
                    status: status,
                    admin_notes: adminNotes
                })
                .eq('id', suggestion.id);

            if (error) throw error;

            toast({ title: "Updated", description: "Suggestion status updated successfully." });
            onUpdate();
            onOpenChange(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (!suggestion) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Review Suggestion</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Left Column: Product Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase">Product Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Product Name</Label>
                                <p className="font-medium">{suggestion.product_name}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Price</Label>
                                <p className="font-medium">{suggestion.proposed_price} {suggestion.currency}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Store Name</Label>
                                <p className="font-medium">{suggestion.store_name || "N/A"}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Location</Label>
                                <p className="font-medium">{suggestion.store_location || "N/A"}</p>
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground">Description</Label>
                            <div className="p-2 bg-muted/30 rounded-md text-sm min-h-[60px]">
                                {suggestion.description || "No description provided."}
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs text-muted-foreground">Images</Label>
                            <div className="flex gap-2 flex-wrap mt-2">
                                {suggestion.images && suggestion.images.length > 0 ? (
                                    suggestion.images.map((url: string, idx: number) => (
                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="relative h-20 w-20 border rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                                            <img src={url} alt={`Product ${idx}`} className="object-cover w-full h-full" />
                                        </a>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground italic">No images uploaded</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User & Admin actions */}
                    <div className="space-y-6 border-l pl-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase">User Information</h3>
                            <div className="space-y-2">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Name</Label>
                                    <p className="text-sm font-medium">{suggestion.full_name}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Email</Label>
                                    <p className="text-sm font-medium">{suggestion.email || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Phone</Label>
                                        <p className="text-sm">{suggestion.phone}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Source</Label>
                                        <Badge variant="outline">{suggestion.source_type}</Badge>
                                    </div>
                                </div>
                                {(suggestion.whatsapp || suggestion.telegram) && (
                                    <div className="pt-2 flex gap-2">
                                        {suggestion.whatsapp && <Badge variant="secondary" className="bg-green-50 text-green-700">WA: {suggestion.whatsapp}</Badge>}
                                        {suggestion.telegram && <Badge variant="secondary" className="bg-blue-50 text-blue-700">TG: {suggestion.telegram}</Badge>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase">Admin Actions</h3>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="reviewed">Reviewed</SelectItem>
                                        <SelectItem value="accepted">Accepted</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Admin Notes</Label>
                                <Textarea
                                    placeholder="Internal notes..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="h-24"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
