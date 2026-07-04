import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type BookListFilters = {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  bestseller?: boolean;
  featured?: boolean;
  page?: number;
  pageSize?: number;
};

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export function booksQuery(f: BookListFilters) {
  const {
    search = "",
    categoryId,
    minPrice,
    maxPrice,
    sort = "newest",
    bestseller,
    featured,
    page = 1,
    pageSize = 12,
  } = f;
  return queryOptions({
    queryKey: ["books", f],
    queryFn: async () => {
      let q = supabase.from("books").select("*", { count: "exact" });
      if (search) q = q.or("title.ilike.%" + search + "%,author.ilike.%" + search + "%");
      if (categoryId) q = q.eq("category_id", categoryId);
      if (typeof minPrice === "number") q = q.gte("price", minPrice);
      if (typeof maxPrice === "number") q = q.lte("price", maxPrice);
      if (bestseller) q = q.eq("is_bestseller", true);
      if (featured) q = q.eq("is_featured", true);
      switch (sort) {
        case "price_asc": q = q.order("price", { ascending: true }); break;
        case "price_desc": q = q.order("price", { ascending: false }); break;
        case "rating": q = q.order("rating", { ascending: false }); break;
        default: q = q.order("created_at", { ascending: false });
      }
      const from = (page - 1) * pageSize;
      q = q.range(from, from + pageSize - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data ?? [], total: count ?? 0 };
    },
  });
}

export function bookQuery(id: string) {
  return queryOptions({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*, categories(name, slug)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function reviewsQuery(bookId: string) {
  return queryOptions({
    queryKey: ["reviews", bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function relatedBooksQuery(categoryId: string | null, excludeId: string) {
  return queryOptions({
    queryKey: ["related", categoryId, excludeId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("category_id", categoryId)
        .neq("id", excludeId)
        .limit(4);
      if (error) throw error;
      return data ?? [];
    },
  });
}