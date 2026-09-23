-- Grant or revoke the admin role through a security-definer function so the app
-- does not need a privileged service key to manage roles.

CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  _user_id uuid,
  _role public.app_role,
  _grant boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only an existing admin may change roles.
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  -- Never let an admin lock themselves out.
  IF _grant = false AND _user_id = auth.uid() AND _role = 'admin' THEN
    RAISE EXCEPTION 'Cannot remove your own admin access' USING ERRCODE = '42501';
  END IF;

  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = _user_id AND role = _role;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) FROM anon;
