-- ROLES
CREATE TYPE public.app_role AS ENUM ('user','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  age int,
  gender text,
  state text,
  district text,
  occupation text,
  annual_income numeric,
  category text,
  education text,
  is_student boolean NOT NULL DEFAULT false,
  is_farmer boolean NOT NULL DEFAULT false,
  has_disability boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- SCHEMES
CREATE TABLE public.schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  level text NOT NULL CHECK (level IN ('central','state')),
  state text,
  category text NOT NULL,
  department text,
  description text NOT NULL,
  benefits text[] NOT NULL DEFAULT '{}',
  eligibility_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  eligibility_notes text[] NOT NULL DEFAULT '{}',
  documents text[] NOT NULL DEFAULT '{}',
  application_process text[] NOT NULL DEFAULT '{}',
  beneficiary_type text[] NOT NULL DEFAULT '{}',
  official_source text,
  official_website text,
  official_application_url text,
  last_verified_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.schemes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schemes TO authenticated;
GRANT ALL ON public.schemes TO service_role;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active schemes" ON public.schemes FOR SELECT TO anon, authenticated
  USING (status = 'active' OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert schemes" ON public.schemes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update schemes" ON public.schemes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete schemes" ON public.schemes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.saved_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id uuid NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scheme_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_schemes TO authenticated;
GRANT ALL ON public.saved_schemes TO service_role;
ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved select" ON public.saved_schemes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own saved insert" ON public.saved_schemes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saved delete" ON public.saved_schemes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send message" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admin read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- profile auto creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email, NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER schemes_touch BEFORE UPDATE ON public.schemes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX schemes_level_idx ON public.schemes(level);
CREATE INDEX schemes_state_idx ON public.schemes(state);
CREATE INDEX schemes_category_idx ON public.schemes(category);
