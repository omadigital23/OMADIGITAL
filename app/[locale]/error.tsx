'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Optionally log the error to an error reporting service like Sentry
        console.error('App Error Boundary caught:', error)
    }, [error])

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <svg
                    className="mx-auto h-24 w-24 text-red-500 mb-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Oups ! Quelque chose n'a pas fonctionné.
                </h2>

                <p className="text-gray-600 mb-8">
                    Nous avons rencontré un problème inattendu en chargeant cette page. Vous pouvez essayer de rafraîchir ou revenir plus tard.
                </p>

                <button
                    onClick={() => reset()}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        </div>
    )
}
