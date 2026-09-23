-- Only signed-in users may call the role-change function; visitors and the
-- public default grant are removed.

REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role, boolean) TO service_role;