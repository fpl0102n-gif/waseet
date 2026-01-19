import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, MessageCircle, Send, Check, Upload, Trash2, X } from "lucide-react";

interface DonationDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    donation: any;
    onUpdate: () => void;
}

export function DonationDetailDialog({ open, onOpenChange, donation, onUpdate }: DonationDetailDialogProps) {
    const { toast } = useToast();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [status, setStatus] = useState<string>("pending");
    const [publicDescription, setPublicDescription] = useState("");
    const [itemName, setItemName] = useState("");
    const [category, setCategory] = useState("");
    const [condition, setCondition] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [location, setLocation] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");

    // Image State
    const [images, setImages] = useState<string[]>([]);
    const [mainImage, setMainImage] = useState<string | null>(null);

    useEffect(() => {
        if (donation) {
            setStatus(donation.status);
            setPublicDescription(donation.admin_description || donation.description || "");
            setItemName(donation.item_name || "");
            setCategory(donation.category || "medicine");
            setCondition(donation.condition || "new");
            setQuantity(donation.quantity?.toString() || "1");
            setLocation(donation.location || "");
            setRejectionReason(donation.rejection_reason || "");
            setImages(donation.images || []);
            setMainImage(donation.main_image || (donation.images && donation.images.length > 0 ? donation.images[0] : null));
        }
    }, [donation]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('donation-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('donation-images')
                    .getPublicUrl(filePath);

                newUrls.push(data.publicUrl);
            }

            const updatedImages = [...images, ...newUrls];
            setImages(updatedImages);
            // If no main image yet, set the first new one
            if (!mainImage && updatedImages.length > 0) {
                setMainImage(updatedImages[0]);
            }

            toast({ title: "Images uploaded", description: `${files.length} images added.` });
        } catch (error: any) {
            console.error(error);
            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (urlToRemove: string) => {
        const filtered = images.filter(url => url !== urlToRemove);
        setImages(filtered);
        if (mainImage === urlToRemove) {
            setMainImage(filtered.length > 0 ? filtered[0] : null);
        }
    };

    const handleSave = async () => {
        if (!donation) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('material_donations')
                .update({
                    status: status,
                    admin_description: publicDescription,
                    rejection_reason: rejectionReason, // Save the rejection note
                    item_name: itemName,
                    category: category,
                    condition: condition,
                    quantity: parseInt(quantity) || 1,
                    location: location,
                    images: images,
                    main_image: mainImage
                })
                .eq('id', donation.id);

            if (error) throw error;

            toast({ title: "Updated", description: "Donation updated successfully." });

            // Trigger Email Notification for Status Changes
            if (['approved', 'rejected', 'completed', 'pending'].includes(status)) {
                console.log("Triggering email for status:", status);
                // Send email
                supabase.functions.invoke('send-email', {
                    body: {
                        type: 'material_donation_update',
                        record: {
                            ...donation,            // Original fields (email, etc)
                            status: status,         // New Status
                            admin_description: publicDescription,
                            item_name: itemName,
                            rejection_reason: rejectionReason // Pass rejection reason as note
                        },
                        admin_note: rejectionReason // Explicitly pass note
                    }
                }).then(({ data, error }) => {
                    if (error) console.error("Email API Error:", error);
                    else console.log("Email sent:", data);
                });
            }

            onUpdate();
            onOpenChange(false);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (!donation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Mise à jour Don Matériel</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* LEFT COLUMN: PUBLIC CONTENT MANAGEMENT */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm text-green-700 bg-green-50 p-2 rounded block border border-green-200 flex justify-between items-center">
                            <span>Gestion Contenu Public</span>
                            <Badge variant="secondary" className="text-[10px] bg-white text-green-700">Editable</Badge>
                        </h3>

                        <div className="space-y-3 p-1">
                            <div>
                                <Label className="text-xs text-muted-foreground">Titre de l'Article</Label>
                                <Input value={itemName} onChange={e => setItemName(e.target.value)} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Catégorie</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="medicine">Médicament</SelectItem>
                                            <SelectItem value="equipment">Équipement</SelectItem>
                                            <SelectItem value="other">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">État</Label>
                                    <Select value={condition} onValueChange={setCondition}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">Neuf</SelectItem>
                                            <SelectItem value="used_good">Bon état</SelectItem>
                                            <SelectItem value="used_fair">Moyen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Quantité</Label>
                                    <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Localisation</Label>
                                    <Input value={location} onChange={e => setLocation(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <Label className="flex justify-between items-center mb-1">
                                    <span>Gestion des Photos</span>
                                    <Badge variant="outline" className="text-[10px]">Star = Principale</Badge>
                                </Label>

                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {images.map((url, idx) => (
                                        <div key={idx}
                                            className={`relative aspect-square border-2 rounded-md overflow-hidden group cursor-pointer ${mainImage === url ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-gray-300'}`}
                                            onClick={() => setMainImage(url)}
                                        >
                                            <img src={url} alt="Item" className="object-cover w-full h-full" />
                                            {mainImage === url && (
                                                <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-0.5">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveImage(url); }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                                        <span className="text-[10px] text-muted-foreground mt-1">Ajouter</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Cliquez sur une photo pour la définir comme principale (affichée sur la carte).</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PRIVATE INFO & STATUS */}
                    <div className="space-y-6 border-l pl-6">
                        {/* Private Donor Info - Read Only */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-red-700 bg-red-50 p-2 rounded block border border-red-200">
                                Information Donneur (PRIVÉ)
                            </h3>

                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-muted-foreground">Nom:</span>
                                    <span className="font-medium">{donation.donor_name}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] items-center">
                                    <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Tél:</span>
                                    <span className="font-medium select-all">{donation.phone}</span>
                                </div>
                                {donation.whatsapp && (
                                    <div className="grid grid-cols-[100px_1fr] items-center">
                                        <span className="text-muted-foreground flex items-center gap-1"><MessageCircle className="h-3 w-3 text-green-600" /> WhatsApp:</span>
                                        <span className="font-medium select-all">{donation.whatsapp}</span>
                                    </div>
                                )}
                                {donation.telegram && (
                                    <div className="grid grid-cols-[100px_1fr] items-center">
                                        <span className="text-muted-foreground flex items-center gap-1"><Send className="h-3 w-3 text-blue-500" /> Telegram:</span>
                                        <span className="font-medium select-all">{donation.telegram}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <Label className="text-xs text-muted-foreground">Description Originale</Label>
                                <div className="mt-1 p-2 bg-gray-50 rounded border text-sm italic text-gray-700 min-h-[60px] text-xs">
                                    "{donation.description}"
                                </div>
                            </div>
                        </div>

                        {/* Status & Desc */}
                        <div className="space-y-4 pt-4 border-t-2 border-dashed">
                            <div className="space-y-2">
                                <Label className="text-green-700 font-bold">Statut</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">En attente (Pending)</SelectItem>
                                        <SelectItem value="approved">Approuvé (Visible Public)</SelectItem>
                                        <SelectItem value="rejected">Rejeté</SelectItem>
                                        <SelectItem value="completed">Terminé / Donné</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className={`space-y-2 p-3 rounded-md border animate-in fade-in zoom-in-95 duration-200 ${status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                                <Label className={`${status === 'rejected' ? 'text-red-700' : 'text-gray-700'} font-medium`}>
                                    {status === 'rejected' ? 'Motif du rejet (Note Admin)' : 'Note Admin (Interne)'}
                                </Label>
                                <Textarea
                                    placeholder={status === 'rejected' ? "Expliquez pourquoi ce don est rejeté..." : "Notes internes pour les administrateurs..."}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className={`min-h-[80px] focus-visible:ring-offset-0 ${status === 'rejected' ? 'border-red-200 focus-visible:ring-red-500' : 'border-gray-300 focus-visible:ring-gray-400'}`}
                                />
                                {status === 'rejected' && (
                                    <p className="text-[10px] text-red-600">
                                        * Ce message sera inclus dans l'email envoyé au donateur.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="flex justify-between">
                                    <span>Description Publique</span>
                                    <span className="text-xs text-muted-foreground font-normal">Visible sur le site</span>
                                </Label>
                                <Textarea
                                    placeholder="Description publique..."
                                    value={publicDescription}
                                    onChange={(e) => setPublicDescription(e.target.value)}
                                    className="h-32 font-normal"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                    <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Enregistrer Modification
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
