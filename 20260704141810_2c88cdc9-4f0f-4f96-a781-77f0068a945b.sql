
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_book_rating(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_reviews_refresh() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
-- has_role must stay callable by authenticated users because RLS policies invoke it as the caller
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;
