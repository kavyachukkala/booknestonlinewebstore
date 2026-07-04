import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  cover_url: string | null;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (b: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "booknest_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const add = useCallback((b: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((x) => x.id === b.id);
      if (existing) return prev.map((x) => (x.id === b.id ? { ...x, quantity: x.quantity + qty } : x));
      return [...prev, { ...b, quantity: qty }];
    });
  }, []);
  const remove = useCallback((id: string) => setItems((p) => p.filter((x) => x.id !== id)), []);
  const update = useCallback(
    (id: string, qty: number) =>
      setItems((p) => p.map((x) => (x.id === id ? { ...x, quantity: Math.max(1, qty) } : x))),
    [],
  );
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, x) => s + x.quantity, 0);
    const subtotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
    return { items, count, subtotal, add, remove, update, clear };
  }, [items, add, remove, update, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}