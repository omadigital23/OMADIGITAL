-- Remove public write access from anon on form tables.
-- Application writes must go through server routes using the service role key.

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public lead inserts" ON public.leads;
DROP POLICY IF EXISTS "Allow public newsletter inserts" ON public.newsletter;
DROP POLICY IF EXISTS "Allow public newsletter upserts" ON public.newsletter;
DROP POLICY IF EXISTS "Allow public booking inserts" ON public.bookings;
