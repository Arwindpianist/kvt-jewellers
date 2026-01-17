-- Create trading_pre_registrations table
CREATE TABLE IF NOT EXISTS public.trading_pre_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    country TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_email UNIQUE (email)
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_trading_pre_registrations_email ON public.trading_pre_registrations(email);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_trading_pre_registrations_status ON public.trading_pre_registrations(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_trading_pre_registrations_created_at ON public.trading_pre_registrations(created_at DESC);

-- Enable RLS
ALTER TABLE public.trading_pre_registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can read all pre-registrations
CREATE POLICY "Admins can view all pre-registrations"
    ON public.trading_pre_registrations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Anyone can insert (for pre-registration)
CREATE POLICY "Anyone can pre-register"
    ON public.trading_pre_registrations
    FOR INSERT
    WITH CHECK (true);

-- Only admins can update
CREATE POLICY "Admins can update pre-registrations"
    ON public.trading_pre_registrations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trading_pre_registrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_trading_pre_registrations_updated_at
    BEFORE UPDATE ON public.trading_pre_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_trading_pre_registrations_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.trading_pre_registrations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.trading_pre_registrations TO anon;
