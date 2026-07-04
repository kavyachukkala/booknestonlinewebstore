
-- =============== ENUMS ===============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.order_status AS ENUM ('pending','paid','shipped','delivered','cancelled');

-- =============== PROFILES ===============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- =============== ROLES ===============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles self read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- =============== CATEGORIES ===============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =============== BOOKS ===============
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2),
  cover_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  stock INT NOT NULL DEFAULT 100,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  sales INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_bestseller BOOLEAN NOT NULL DEFAULT false,
  isbn TEXT,
  pages INT,
  published_year INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_books_category ON public.books(category_id);
CREATE INDEX idx_books_title ON public.books(title);
CREATE INDEX idx_books_price ON public.books(price);
CREATE INDEX idx_books_bestseller ON public.books(is_bestseller);
CREATE INDEX idx_books_featured ON public.books(is_featured);
GRANT SELECT ON public.books TO anon, authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "books public read" ON public.books FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "books admin write" ON public.books FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =============== REVIEWS ===============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id, user_id)
);
CREATE INDEX idx_reviews_book ON public.reviews(book_id);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews owner insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews owner update" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "reviews owner delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============== ORDERS ===============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'paid',
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  shipping_name TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_phone TEXT,
  payment_method TEXT NOT NULL DEFAULT 'card',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders owner read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders owner insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id),
  title TEXT NOT NULL,
  cover_url TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0)
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_book ON public.order_items(book_id);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items read via order" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "order_items insert via order" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- =============== COUPONS ===============
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons public read active" ON public.coupons FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "coupons admin write" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =============== TRIGGERS ===============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_books_updated BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update book rating on review changes
CREATE OR REPLACE FUNCTION public.refresh_book_rating(_book_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.books SET
    rating = COALESCE((SELECT ROUND(AVG(rating)::numeric,1) FROM public.reviews WHERE book_id = _book_id),0),
    rating_count = (SELECT COUNT(*) FROM public.reviews WHERE book_id = _book_id)
  WHERE id = _book_id;
END; $$;
CREATE OR REPLACE FUNCTION public.trg_reviews_refresh()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.refresh_book_rating(COALESCE(NEW.book_id, OLD.book_id));
  RETURN COALESCE(NEW, OLD);
END; $$;
CREATE TRIGGER reviews_after_change AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.trg_reviews_refresh();

-- =============== SEED DATA ===============
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Fiction','fiction','BookOpen'),
  ('Science Fiction','sci-fi','Rocket'),
  ('Business','business','Briefcase'),
  ('Biography','biography','User'),
  ('Mystery & Thriller','mystery','Search'),
  ('Self Help','self-help','Sparkles'),
  ('Fantasy','fantasy','Wand'),
  ('History','history','Landmark');

INSERT INTO public.coupons (code, discount_percent) VALUES ('BOOKNEST10', 10), ('WELCOME20', 20);

WITH c AS (SELECT id, slug FROM public.categories)
INSERT INTO public.books (title, author, description, price, original_price, cover_url, category_id, stock, is_featured, is_bestseller, pages, published_year, isbn) VALUES
  ('The Midnight Library','Matt Haig','Between life and death is a library where every book is a life you could have lived.', 12.99, 18.99, 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg', (SELECT id FROM c WHERE slug='fiction'), 45, true, true, 304, 2020, '9780525559474'),
  ('Project Hail Mary','Andy Weir','A lone astronaut must save the earth from disaster in this thrilling sci-fi adventure.', 15.49, 22.00, 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg', (SELECT id FROM c WHERE slug='sci-fi'), 60, true, true, 496, 2021, '9780593135204'),
  ('Atomic Habits','James Clear','Tiny changes, remarkable results — proven strategies for building good habits.', 11.25, 16.99, 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', (SELECT id FROM c WHERE slug='self-help'), 120, true, true, 320, 2018, '9780735211292'),
  ('Educated','Tara Westover','A memoir about a woman who leaves her survivalist family and goes on to earn a PhD.', 10.99, 14.99, 'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg', (SELECT id FROM c WHERE slug='biography'), 55, true, true, 334, 2018, '9780399590504'),
  ('The Silent Patient','Alex Michaelides','A shocking psychological thriller of a woman''s act of violence against her husband.', 9.99, 13.99, 'https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg', (SELECT id FROM c WHERE slug='mystery'), 70, true, false, 336, 2019, '9781250301697'),
  ('Dune','Frank Herbert','The epic saga of Paul Atreides on the desert planet Arrakis.', 14.99, 19.99, 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg', (SELECT id FROM c WHERE slug='sci-fi'), 80, true, true, 688, 1965, '9780441172719'),
  ('Sapiens','Yuval Noah Harari','A brief history of humankind from the Stone Age to the twenty-first century.', 13.50, 18.00, 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', (SELECT id FROM c WHERE slug='history'), 90, true, true, 464, 2015, '9780062316097'),
  ('The Name of the Wind','Patrick Rothfuss','The tale of Kvothe, a legendary figure whose story unfolds in this fantasy classic.', 12.75, 17.99, 'https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg', (SELECT id FROM c WHERE slug='fantasy'), 65, true, false, 662, 2007, '9780756404741'),
  ('Zero to One','Peter Thiel','Notes on startups, or how to build the future.', 11.99, 15.99, 'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg', (SELECT id FROM c WHERE slug='business'), 100, false, true, 224, 2014, '9780804139298'),
  ('Where the Crawdads Sing','Delia Owens','A mystery and coming-of-age story set in the marshes of North Carolina.', 10.49, 14.99, 'https://covers.openlibrary.org/b/isbn/9780735219090-L.jpg', (SELECT id FROM c WHERE slug='fiction'), 85, false, true, 384, 2018, '9780735219090'),
  ('The Alchemist','Paulo Coelho','A young shepherd''s journey to find treasure and self-discovery.', 8.99, 12.00, 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg', (SELECT id FROM c WHERE slug='fiction'), 150, false, true, 208, 1988, '9780062315007'),
  ('The Psychology of Money','Morgan Housel','Timeless lessons on wealth, greed, and happiness.', 10.99, 14.99, 'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg', (SELECT id FROM c WHERE slug='business'), 75, false, true, 256, 2020, '9780857197689'),
  ('Klara and the Sun','Kazuo Ishiguro','A story told by Klara, an Artificial Friend with outstanding observational qualities.', 12.99, 17.00, 'https://covers.openlibrary.org/b/isbn/9780593318171-L.jpg', (SELECT id FROM c WHERE slug='sci-fi'), 40, false, false, 320, 2021, '9780593318171'),
  ('Becoming','Michelle Obama','The intimate, powerful memoir of the former First Lady.', 14.50, 20.00, 'https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg', (SELECT id FROM c WHERE slug='biography'), 50, false, false, 448, 2018, '9781524763138'),
  ('Gone Girl','Gillian Flynn','A husband becomes the prime suspect in his wife''s disappearance.', 9.99, 13.50, 'https://covers.openlibrary.org/b/isbn/9780307588371-L.jpg', (SELECT id FROM c WHERE slug='mystery'), 60, false, false, 432, 2012, '9780307588371'),
  ('The Subtle Art of Not Giving a F*ck','Mark Manson','A counterintuitive approach to living a good life.', 10.25, 14.99, 'https://covers.openlibrary.org/b/isbn/9780062457714-L.jpg', (SELECT id FROM c WHERE slug='self-help'), 110, false, true, 224, 2016, '9780062457714'),
  ('The Way of Kings','Brandon Sanderson','The first volume of The Stormlight Archive epic fantasy.', 16.99, 22.99, 'https://covers.openlibrary.org/b/isbn/9780765326355-L.jpg', (SELECT id FROM c WHERE slug='fantasy'), 45, false, false, 1007, 2010, '9780765326355'),
  ('A Brief History of Time','Stephen Hawking','From the big bang to black holes, a landmark in scientific writing.', 11.50, 15.99, 'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg', (SELECT id FROM c WHERE slug='sci-fi'), 55, false, false, 256, 1988, '9780553380163'),
  ('Guns, Germs, and Steel','Jared Diamond','A short history of everybody for the last 13,000 years.', 12.99, 17.99, 'https://covers.openlibrary.org/b/isbn/9780393317558-L.jpg', (SELECT id FROM c WHERE slug='history'), 40, false, false, 494, 1997, '9780393317558'),
  ('Deep Work','Cal Newport','Rules for focused success in a distracted world.', 11.99, 15.99, 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg', (SELECT id FROM c WHERE slug='self-help'), 80, false, false, 304, 2016, '9781455586691'),
  ('Circe','Madeline Miller','A stunning reimagining of the Greek myth from the perspective of a witch.', 11.75, 15.99, 'https://covers.openlibrary.org/b/isbn/9780316556347-L.jpg', (SELECT id FROM c WHERE slug='fantasy'), 65, false, false, 400, 2018, '9780316556347'),
  ('Shoe Dog','Phil Knight','A memoir by the creator of Nike.', 12.25, 16.99, 'https://covers.openlibrary.org/b/isbn/9781501135910-L.jpg', (SELECT id FROM c WHERE slug='biography'), 70, false, false, 400, 2016, '9781501135910'),
  ('The Girl with the Dragon Tattoo','Stieg Larsson','A journalist and a hacker investigate a decades-old disappearance.', 10.99, 14.99, 'https://covers.openlibrary.org/b/isbn/9780307454546-L.jpg', (SELECT id FROM c WHERE slug='mystery'), 60, false, false, 672, 2005, '9780307454546'),
  ('1984','George Orwell','A dystopian classic on totalitarianism and surveillance.', 9.50, 12.99, 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', (SELECT id FROM c WHERE slug='fiction'), 200, false, true, 328, 1949, '9780451524935');
