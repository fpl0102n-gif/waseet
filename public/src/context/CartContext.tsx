
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ShippingAddressDialog } from '@/components/ShippingAddressDialog';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  stockQuantity?: number | null; // Added stockQuantity
  slug: string;
  // Custom order fields
  productUrl?: string;
  shippingPrice?: number;
  notes?: string;
  referralCode?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  shippingInfo: any;
  setShippingInfo: React.Dispatch<React.SetStateAction<any>>;
  isAddressModalOpen: boolean;
  setIsAddressModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  processPendingItem: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [shippingInfo, setShippingInfo] = useState<any>({});
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState<any>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: any) => {
    // Check for shipping info first ONLY if it is a Store Item (no productUrl)
    // Custom items (with productUrl) have their own logic/shipping input.
    const isStoreItem = !product.productUrl;

    if (isStoreItem && (!shippingInfo.wilayaCode || !shippingInfo.address || !shippingInfo.deliveryType)) {
      setPendingItem(product);
      setIsAddressModalOpen(true);
      return;
    }

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      // Check stock limit for existing item
      if (existingItem) {
        if (product.stockQuantity !== null && product.stockQuantity !== undefined && existingItem.quantity >= product.stockQuantity) {
          toast({
            title: "Stock Limit Reached",
            description: `You cannot add more of ${product.name}. Only ${product.stockQuantity} available.`,
            variant: "destructive"
          });
          return currentItems;
        }

        toast({
          title: "Added to cart",
          description: `Increased quantity of ${product.name}`,
        });
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Check stock limit for new item (should be handled by UI disabled state, but good for safety)
      if (product.stockQuantity !== null && product.stockQuantity !== undefined && product.stockQuantity < 1) {
        toast({
          title: "Out of Stock",
          description: `${product.name} is out of stock.`,
          variant: "destructive"
        });
        return currentItems;
      }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });

      return [...currentItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : undefined,
        quantity: 1,
        stockQuantity: product.stockQuantity, // Persist stock quantity
        slug: product.slug,
        productUrl: product.productUrl,
        notes: product.notes,
        referralCode: product.referralCode,
        shippingPrice: product.shippingPrice
      }];
    });
  };

  const processPendingItem = () => {
    if (pendingItem) {
      // We call addItem but checking shippingInfo inside might fail if React state updates haven't propagated yet in this closure?
      // Actually, if we update state in setShippingInfo, it triggers re-render.
      // But processPendingItem is called immediately after setShippingInfo in the Dialog component.
      // To be safe, we just add it directly here or pass it.
      // Better: The Dialog calls setShippingInfo then processPendingItem.
      // Inside processPendingItem we can trust that we want to add it.
      // But we need to use the functional update of setItems to be safe if we were using it?
      // Actually, let's just bypass the check since we know we just set it.

      const product = pendingItem;

      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.id === product.id);

        if (existingItem) {
          toast({
            title: "Added to cart",
            description: `Increased quantity of ${product.name}`,
          });
          return currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        });

        return [...currentItems, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : undefined,
          quantity: 1,
          slug: product.slug,
          productUrl: product.productUrl,
          notes: product.notes,
          referralCode: product.referralCode,
          shippingPrice: product.shippingPrice
        }];
      });

      setPendingItem(null);
    }
  };

  const removeItem = (id: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartTotal,
      itemCount,
      shippingInfo,
      setShippingInfo,
      isAddressModalOpen,
      setIsAddressModalOpen,
      processPendingItem
    }}>
      {children}
      <ShippingAddressDialog />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
