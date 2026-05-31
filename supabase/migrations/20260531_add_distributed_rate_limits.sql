-- Distributed rate limits for server-side form and AI routes.
-- Supabase CLI is not installed locally, so this migration is created manually.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon;
REVOKE ALL ON SCHEMA private FROM authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE TABLE IF NOT EXISTS private.rate_limits (
    bucket TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
    reset_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (bucket, key_hash)
);

ALTER TABLE private.rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE private.rate_limits FROM PUBLIC;
REVOKE ALL ON TABLE private.rate_limits FROM anon;
REVOKE ALL ON TABLE private.rate_limits FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE private.rate_limits TO service_role;

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at
    ON private.rate_limits(reset_at);

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
    p_bucket TEXT,
    p_key TEXT,
    p_limit INTEGER,
    p_window_ms INTEGER
)
RETURNS TABLE (
    ok BOOLEAN,
    remaining INTEGER,
    reset_at TIMESTAMPTZ,
    retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    v_key_hash TEXT := ENCODE(extensions.digest(p_key, 'sha256'), 'hex');
    v_window INTERVAL := (GREATEST(p_window_ms, 1)::TEXT || ' milliseconds')::INTERVAL;
    v_row private.rate_limits%ROWTYPE;
BEGIN
    IF p_bucket IS NULL OR LENGTH(TRIM(p_bucket)) = 0 THEN
        RAISE EXCEPTION 'p_bucket is required';
    END IF;

    IF p_key IS NULL OR LENGTH(TRIM(p_key)) = 0 THEN
        RAISE EXCEPTION 'p_key is required';
    END IF;

    IF p_limit IS NULL OR p_limit < 1 THEN
        RAISE EXCEPTION 'p_limit must be positive';
    END IF;

    IF p_window_ms IS NULL OR p_window_ms < 1 THEN
        RAISE EXCEPTION 'p_window_ms must be positive';
    END IF;

    -- Opportunistic cleanup keeps the table bounded without requiring pg_cron.
    IF random() < 0.01 THEN
        DELETE FROM private.rate_limits
        WHERE private.rate_limits.reset_at < v_now - INTERVAL '1 hour';
    END IF;

    LOOP
        SELECT *
        INTO v_row
        FROM private.rate_limits
        WHERE private.rate_limits.bucket = p_bucket
          AND private.rate_limits.key_hash = v_key_hash
        FOR UPDATE;

        IF NOT FOUND THEN
            BEGIN
                INSERT INTO private.rate_limits(bucket, key_hash, count, reset_at, updated_at)
                VALUES (p_bucket, v_key_hash, 1, v_now + v_window, v_now)
                RETURNING * INTO v_row;

                ok := TRUE;
                remaining := GREATEST(p_limit - 1, 0);
                reset_at := v_row.reset_at;
                retry_after_seconds := GREATEST(CEIL(EXTRACT(EPOCH FROM v_window))::INTEGER, 1);
                RETURN NEXT;
                RETURN;
            EXCEPTION WHEN unique_violation THEN
                -- Another instance created the row first. Retry under row lock.
            END;
        ELSIF v_row.reset_at <= v_now THEN
            UPDATE private.rate_limits
            SET count = 1,
                reset_at = v_now + v_window,
                updated_at = v_now
            WHERE private.rate_limits.bucket = p_bucket
              AND private.rate_limits.key_hash = v_key_hash
            RETURNING * INTO v_row;

            ok := TRUE;
            remaining := GREATEST(p_limit - 1, 0);
            reset_at := v_row.reset_at;
            retry_after_seconds := GREATEST(CEIL(EXTRACT(EPOCH FROM v_window))::INTEGER, 1);
            RETURN NEXT;
            RETURN;
        ELSIF v_row.count >= p_limit THEN
            ok := FALSE;
            remaining := 0;
            reset_at := v_row.reset_at;
            retry_after_seconds := GREATEST(CEIL(EXTRACT(EPOCH FROM (v_row.reset_at - v_now)))::INTEGER, 1);
            RETURN NEXT;
            RETURN;
        ELSE
            UPDATE private.rate_limits
            SET count = count + 1,
                updated_at = v_now
            WHERE private.rate_limits.bucket = p_bucket
              AND private.rate_limits.key_hash = v_key_hash
            RETURNING * INTO v_row;

            ok := TRUE;
            remaining := GREATEST(p_limit - v_row.count, 0);
            reset_at := v_row.reset_at;
            retry_after_seconds := GREATEST(CEIL(EXTRACT(EPOCH FROM (v_row.reset_at - v_now)))::INTEGER, 1);
            RETURN NEXT;
            RETURN;
        END IF;
    END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;
