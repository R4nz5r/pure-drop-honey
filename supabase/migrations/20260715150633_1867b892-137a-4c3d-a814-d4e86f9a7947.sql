
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, app_role) SET SCHEMA private;

GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO anon, authenticated;
