
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PersonalInfoProps {
    formData: any;
    setFormData: (data: any) => void;
    wilayas: any[];
    t: any;
}

export const PersonalInfoSection = ({ formData, setFormData, wilayas, t }: PersonalInfoProps) => {
    return (
        <Card className="border border-primary/60 bg-background shadow-none hover:shadow-md transition-all">
            <CardContent className="p-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit mb-2">
                    <User className="w-4 h-4" />
                    <h3 className="font-semibold text-xs uppercase tracking-wide">{t('alkhayr.local.form.fullName') || "Informations Personnelles"}</h3>
                </div>
                <div className="space-y-4">
                    {/* Name & City */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-xs font-medium">{t('alkhayr.local.form.fullName')} *</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="h-10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-xs font-medium">{t('alkhayr.local.form.city')} *</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="h-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Wilaya, Phone, Email */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="wilaya" className="text-xs font-medium">Wilaya *</Label>
                            <Select
                                value={formData.wilayaId?.toString()}
                                onValueChange={(val) => {
                                    const selected = wilayas.find(w => w.id.toString() === val);
                                    if (selected) {
                                        setFormData({
                                            ...formData,
                                            wilayaId: selected.id,
                                            wilaya: selected.name_fr
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une Wilaya" />
                                </SelectTrigger>
                                <SelectContent>
                                    {wilayas.map((w) => (
                                        <SelectItem key={w.id} value={w.id.toString()}>
                                            {w.code} - {w.name_fr}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-medium">Numéro de téléphone *</Label>
                                <Input
                                    id="phone"
                                    placeholder="Ex: 0550123456"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="h-10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-medium">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Ex: email@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label className="text-xs font-medium">Autres moyens de contact (Optionnel)</Label>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* WhatsApp */}
                                <div className={`p-3 rounded-lg border-2 transition-all ${formData.contactType.whatsapp ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Checkbox
                                            id="contact_whatsapp"
                                            checked={formData.contactType.whatsapp}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                contactType: { ...formData.contactType, whatsapp: checked as boolean }
                                            })}
                                        />
                                        <Label htmlFor="contact_whatsapp" className="cursor-pointer font-semibold flex items-center gap-2">
                                            WhatsApp
                                        </Label>
                                    </div>
                                    {formData.contactType.whatsapp && (
                                        <Input
                                            placeholder="Numéro WhatsApp"
                                            value={formData.contactValues.whatsapp}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                contactValues: { ...formData.contactValues, whatsapp: e.target.value }
                                            })}
                                            className="h-9 bg-white"
                                        />
                                    )}
                                </div>

                                {/* Telegram */}
                                <div className={`p-3 rounded-lg border-2 transition-all ${formData.contactType.telegram ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Checkbox
                                            id="contact_telegram"
                                            checked={formData.contactType.telegram}
                                            onCheckedChange={(checked) => setFormData({
                                                ...formData,
                                                contactType: { ...formData.contactType, telegram: checked as boolean }
                                            })}
                                        />
                                        <Label htmlFor="contact_telegram" className="cursor-pointer font-semibold flex items-center gap-2">
                                            Telegram
                                        </Label>
                                    </div>
                                    {formData.contactType.telegram && (
                                        <Input
                                            placeholder="Username Telegram"
                                            value={formData.contactValues.telegram}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                contactValues: { ...formData.contactValues, telegram: e.target.value }
                                            })}
                                            className="h-9 bg-white"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
