'use client'

import { Inter } from 'next/font/google'
import '../app/[locale]/globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="fr" className={inter.className}>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Une erreur inattendue est survenue
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Nous sommes désolés, mais quelque chose s'est mal passé au niveau de l'application.
                            Notre équipe technique a été notifiée.
                        </p>
                        <button
                            onClick={() => reset()}
                            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
                        >
                            Réessayer
                        </button>
                        <p className="mt-4 text-xs text-gray-400 font-mono break-all">
                            Error ID: {error.digest || 'Unknown'}
                        </p>
                    </div>
                </div>
            </body>
        </html>
    )
}
