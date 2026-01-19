import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  id: number;
  name: string;
  slug: string;
}

interface FilterBarProps {
  productTypes: FilterOption[];
  selectedProductType: string | null;
  onProductTypeChange: (value: string | null) => void;
  className?: string;
}

export const FilterBar = ({
  productTypes,
  selectedProductType,
  onProductTypeChange,
  className
}: FilterBarProps) => {
  const { t } = useTranslation();
  return (
    <div className={cn("flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">{t('store.filter.label')}</span>
        <Select
          value={selectedProductType || "all"}
          onValueChange={(value) => onProductTypeChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('store.filter.placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('store.filter.all')}</SelectItem>
            {productTypes.map((type) => (
              <SelectItem key={type.id} value={type.slug}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProductType && (
        <Badge variant="secondary" className="gap-2">
          {productTypes.find(t => t.slug === selectedProductType)?.name}
          <button
            onClick={() => onProductTypeChange(null)}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
};

