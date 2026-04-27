-- Grant SQL privileges required by server-side form writes.
-- RLS policies are already restrictive; this fixes missing table grants.

GRANT USAGE ON SCHEMA public TO authenticated, service_role;

GRANT SELECT, UPDATE, DELETE ON TABLE public.leads TO authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.bookings TO authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.newsletter TO authenticated;

GRANT ALL PRIVILEGES ON TABLE public.leads TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.bookings TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.newsletter TO service_role;
