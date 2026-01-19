import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Section from "@/components/ui/section";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart, ArrowLeft, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { CategoryBadge } from "@/components/ui/category-badge";

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    images: string[] | null;
    status: string;
    store_category_id: number;
    product_type_id: number | null;
    created_at: string;
    store_categories?: {
        name: string;
        badge_label: string;
        badge_color: string;
    };
}

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { addItem } = useCart();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (slug) {
            loadProduct();
        }
    }, [slug]);

    const loadProduct = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("products")
                .select(`
          *,
          store_categories (
            name,
            badge_label,
            badge_color
          )
        `)
                .eq("slug", slug)
                .eq("status", "active")
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Not found
                    setProduct(null);
                } else {
                    throw error;
                }
            } else {
                setProduct(data);
                if (data.images && data.images.length > 0) {
                    setSelectedImage(data.images[0]);
                }
            }
        } catch (error) {
            console.error("Error loading product:", error);
            toast({
                title: "Error",
                description: "Failed to load product details.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        // TODO: Add shipping address check here later

        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images,
            slug: product.slug,
            // Store products generally don't have a source URL like custom orders,
            // but we can ensure they are treated as Store items by NOT adding productUrl or setting it to internal.
            // The current distinction logic relies on productUrl being absent for Store items.
        });
    };

    if (loading) {
        return (
            <AppLayout>
                <Section padding="md">
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </Section>
            </AppLayout>
        );
    }

    if (!product) {
        return (
            <AppLayout>
                <Section padding="md">
                    <div className="max-w-4xl mx-auto text-center py-20">
                        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h1 className="text-2xl font-bold mb-2">{t('product_details.notFound.title')}</h1>
                        <p className="text-muted-foreground mb-6">{t('product_details.notFound.desc')}</p>
                        <Button onClick={() => navigate("/store")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('product_details.backToStore')}
                        </Button>
                    </div>
                </Section>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Section padding="md">
                <div className="max-w-6xl mx-auto">
                    {/* Breadcrumb / Back */}
                    <div className="mb-6">
                        <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => navigate(-1)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('product_details.back')}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left: Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-muted rounded-xl overflow-hidden border">
                                {selectedImage ? (
                                    <img
                                        src={selectedImage}
                                        alt={product.name}
                                        className="w-full h-full object-contain bg-white"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                                        <Package className="h-20 w-20 text-muted-foreground/50" />
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {product.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`
                        relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 
                        ${selectedImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}
                      `}
                                        >
                                            <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Info */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    {product.store_categories && (
                                        <CategoryBadge
                                            label={product.store_categories.badge_label}
                                            color={product.store_categories.badge_color}
                                            size="sm"
                                        />
                                    )}
                                    {product.status === 'active' && (
                                        <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">{t('product_details.inStock')}</Badge>
                                    )}
                                </div>

                                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
                                <div className="text-3xl font-bold text-primary">
                                    {product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </div>
                            </div>

                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                <p>{product.description || t('product_details.noDescription')}</p>
                            </div>

                            <div className="pt-6 border-t">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button size="lg" className="flex-1 text-base h-12" onClick={handleAddToCart}>
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        {t('product_details.addToCart')}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 text-center sm:text-left">
                                    <Check className="inline h-3 w-3 mr-1 text-green-600" />
                                    {t('product_details.freeShipping')}
                                    <span className="mx-2">•</span>
                                    <Check className="inline h-3 w-3 mr-1 text-green-600" />
                                    {t('product_details.securePayment')}
                                </p>
                            </div>

                            {/* Features / Details Cards could go here */}
                        </div>
                    </div>
                </div>
            </Section>
        </AppLayout>
    );
};

export default ProductDetails;
