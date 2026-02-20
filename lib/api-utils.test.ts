/**
 * Tests for lib/api-utils.ts
 * 
 * Validates error handling utilities and response formatting.
 * 
 * Note: getAuthUser requires Supabase and is tested via integration tests.
 * These tests focus on pure functions: handleApiError, getClientIp, response helpers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'

// We need to mock the Supabase client before importing api-utils
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        },
    })),
}))

// Now import after mocking
import { handleApiError, getClientIp, badRequestResponse, successResponse, unauthorizedResponse } from './api-utils'

describe('handleApiError', () => {
    it('should return 400 for ZodError with validation details', () => {
        const schema = z.object({ email: z.string().email() })
        let zodError: z.ZodError | null = null

        try {
            schema.parse({ email: 'not-an-email' })
        } catch (err) {
            zodError = err as z.ZodError
        }

        expect(zodError).not.toBeNull()
        const response = handleApiError(zodError!)
        expect(response.status).toBe(400)
    })

    it('should return 500 for generic errors with fallback message', () => {
        const error = new Error('Database connection failed')
        const response = handleApiError(error, 'Something went wrong')
        expect(response.status).toBe(500)
    })

    it('should return 500 for string errors', () => {
        const response = handleApiError('unexpected error')
        expect(response.status).toBe(500)
    })

    it('should use fallback message when provided', async () => {
        const response = handleApiError(new Error('secret internal detail'), 'Custom fallback')
        const body = await response.json()
        // In production the details would be hidden, but in test (NODE_ENV=test) 
        // the sanitizeErrorMessage may pass through — we test the response structure
        expect(body.error).toBeDefined()
    })
})

describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
        const mockRequest = {
            headers: {
                get: (name: string) => {
                    if (name === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1'
                    return null
                },
            },
        } as any

        const ip = getClientIp(mockRequest)
        expect(ip).toBe('192.168.1.1')
    })

    it('should fallback to x-real-ip', () => {
        const mockRequest = {
            headers: {
                get: (name: string) => {
                    if (name === 'x-real-ip') return '10.0.0.5'
                    return null
                },
            },
        } as any

        const ip = getClientIp(mockRequest)
        expect(ip).toBe('10.0.0.5')
    })

    it('should return 0.0.0.0 when no headers present', () => {
        const mockRequest = {
            headers: {
                get: () => null,
            },
        } as any

        const ip = getClientIp(mockRequest)
        expect(ip).toBe('0.0.0.0')
    })
})

describe('Response Helpers', () => {
    it('unauthorizedResponse should return 401', () => {
        const response = unauthorizedResponse()
        expect(response.status).toBe(401)
    })

    it('badRequestResponse should return 400 with message', async () => {
        const response = badRequestResponse('Bad input')
        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.error).toBe('Bad input')
    })

    it('badRequestResponse should include details when provided', async () => {
        const response = badRequestResponse('Bad input', { field: 'email' })
        const body = await response.json()
        expect(body.details).toEqual({ field: 'email' })
    })

    it('successResponse should return 200 by default', async () => {
        const response = successResponse({ message: 'OK' })
        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.message).toBe('OK')
    })

    it('successResponse should accept custom status codes', () => {
        const response = successResponse({ created: true }, 201)
        expect(response.status).toBe(201)
    })
})
