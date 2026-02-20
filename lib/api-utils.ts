/**
 * Shared API Utilities
 * 
 * Centralized functions for authentication extraction, error handling,
 * and response formatting across all API routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// ─── Supabase Client (singleton) ─────────────────────────────────────────

let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabase() {
    if (!supabaseClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        supabaseClient = createClient(url, key)
    }
    return supabaseClient
}

// ─── Authentication ──────────────────────────────────────────────────────

/**
 * Extracts and validates the authenticated user from the request Authorization header.
 * Returns the user object or null if not authenticated.
 */
export async function getAuthUser(request: NextRequest) {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
        return null
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = getSupabase()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
        return null
    }

    return user
}

/**
 * Requires an authenticated user, returning a 401 response if not found.
 * Use this when authentication is mandatory for the route.
 */
export async function requireAuthUser(request: NextRequest) {
    const user = await getAuthUser(request)
    if (!user) {
        return { user: null, errorResponse: unauthorizedResponse() }
    }
    return { user, errorResponse: null }
}

// ─── Client Info ─────────────────────────────────────────────────────────

/**
 * Extracts the client IP address from request headers.
 */
export function getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '0.0.0.0'
    return ip.trim()
}

// ─── Error Handling ──────────────────────────────────────────────────────

/**
 * Sanitizes error messages to prevent leaking internal details in production.
 */
function sanitizeErrorMessage(error: unknown, fallbackMessage: string): string {
    if (process.env.NODE_ENV === 'development') {
        if (error instanceof Error) return error.message
        if (typeof error === 'string') return error
    }
    return fallbackMessage
}

/**
 * Creates a standardized error response based on the error type.
 * - ZodError → 400 with validation details
 * - Generic error → 500 with sanitized message
 */
export function handleApiError(
    error: unknown,
    fallbackMessage: string = 'Internal server error'
): NextResponse {
    // Zod validation errors → 400 Bad Request
    if (error instanceof z.ZodError) {
        return NextResponse.json(
            { error: 'Invalid input', details: error.errors },
            { status: 400 }
        )
    }

    // Log all unexpected errors server-side
    console.error('API Error:', error)

    // Generic server error → 500
    return NextResponse.json(
        { error: sanitizeErrorMessage(error, fallbackMessage) },
        { status: 500 }
    )
}

// ─── Response Helpers ────────────────────────────────────────────────────

export function unauthorizedResponse(message: string = 'Non authentifié') {
    return NextResponse.json({ error: message }, { status: 401 })
}

export function badRequestResponse(message: string, details?: unknown) {
    return NextResponse.json(
        { error: message, ...(details ? { details } : {}) },
        { status: 400 }
    )
}

export function successResponse(data: Record<string, unknown>, status: number = 200) {
    return NextResponse.json(data, { status })
}
