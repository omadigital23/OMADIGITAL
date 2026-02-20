import { CartProvider } from '../lib/contexts/CartContext'
import { AuthProvider } from '../lib/contexts/AuthContext'
import { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'OMA Digital',
  description: 'Agence Web & Marketing Digital au Maroc & Sénégal',
  icons: {
    icon: [
      { url: '/images/logo.webp', sizes: '32x32', type: 'image/webp' },
      { url: '/images/logo.webp', sizes: '16x16', type: 'image/webp' },
    ],
    apple: [
      { url: '/images/logo.webp', sizes: '180x180', type: 'image/webp' },
    ],
    shortcut: '/images/logo.webp',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${poppins.variable} ${inter.variable}`}>
      <body className={poppins.className} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
