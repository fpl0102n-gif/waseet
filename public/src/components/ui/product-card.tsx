import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./category-badge";
import { ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import { useTranslation } from "react-i18next";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  id: number;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  slug: string;
  categoryLabel: string;
  categoryColor?: string;
  productTypeName?: string;
  className?: string;
  stockQuantity: number | null;
}

export const ProductCard = ({
  id,
  name,
  description,
  price,
  images,
  slug,
  categoryLabel,
  categoryColor,
  productTypeName,
  className,
  stockQuantity
}: ProductCardProps) => {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const mainImage = images && images.length > 0 ? images[0] : null;

  const isOutOfStock = stockQuantity !== null && stockQuantity === 0;
  const isLowStock = stockQuantity !== null && stockQuantity > 0 && stockQuantity < 5;

  const truncatedDescription = description
    ? (description.length > 100 ? description.substring(0, 100) + "..." : description)
    : "";

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem({
      id,
      name,
      price,
      images,
      slug,
      stockQuantity
    });
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300 overflow-hidden", className)}>
      <CardHeader className="p-0 relative">
        {mainImage ? (
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={mainImage}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2">
              <CategoryBadge label={categoryLabel} color={categoryColor} size="sm" />
            </div>
            {productTypeName && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  {productTypeName}
                </Badge>
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wider -rotate-12 transform">
                  {t('store.card.outOfStock')}
                </span>
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <div className="absolute bottom-2 right-2 z-10">
                <Badge variant="destructive" className="animate-pulse">
                  {t('store.card.onlyLeft', { count: stockQuantity })}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-square bg-muted flex items-center justify-center">
            <div className="text-muted-foreground text-sm">{t('store.card.noImage')}</div>
            <div className="absolute top-2 left-2">
              <CategoryBadge label={categoryLabel} color={categoryColor} size="sm" />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        {truncatedDescription && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {truncatedDescription}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DZD
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild variant="outline" className="flex-1" size="sm">
          <Link to={`/store/product/${slug}`}>
            <Eye className="h-4 w-4 mr-2" />
            {t('store.card.view')}
          </Link>
        </Button>
        <Button
          className="flex-1"
          size="sm"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant={isOutOfStock ? "secondary" : "default"}
        >
          {isOutOfStock ? (
            <span className="text-xs">{t('store.card.outOfStock')}</span>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('store.card.addToCart')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

