-- Add increment function for updating counters in database

-- Function to safely increment integer values
CREATE OR REPLACE FUNCTION increment(current_value INTEGER, increment_by INTEGER DEFAULT 1)
RETURNS INTEGER AS $$
BEGIN
    -- Handle NULL values
    IF current_value IS NULL THEN
        RETURN increment_by;
    END IF;
    
    -- Return incremented value
    RETURN current_value + increment_by;
END;
$$ LANGUAGE plpgsql;

-- Function to safely increment bigint values
CREATE OR REPLACE FUNCTION increment_bigint(current_value BIGINT, increment_by BIGINT DEFAULT 1)
RETURNS BIGINT AS $$
BEGIN
    -- Handle NULL values
    IF current_value IS NULL THEN
        RETURN increment_by;
    END IF;
    
    -- Return incremented value
    RETURN current_value + increment_by;
END;
$$ LANGUAGE plpgsql;

-- Function to safely increment numeric values
CREATE OR REPLACE FUNCTION increment_numeric(current_value NUMERIC, increment_by NUMERIC DEFAULT 1)
RETURNS NUMERIC AS $$
BEGIN
    -- Handle NULL values
    IF current_value IS NULL THEN
        RETURN increment_by;
    END IF;
    
    -- Return incremented value
    RETURN current_value + increment_by;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION increment(INTEGER, INTEGER) IS 'Safely increment an integer value, handling NULL values';
COMMENT ON FUNCTION increment_bigint(BIGINT, BIGINT) IS 'Safely increment a bigint value, handling NULL values';
COMMENT ON FUNCTION increment_numeric(NUMERIC, NUMERIC) IS 'Safely increment a numeric value, handling NULL values';