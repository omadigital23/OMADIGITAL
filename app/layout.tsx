import { CartProvider } from '../lib/contexts/CartContext'
import { AuthProvider } from '../lib/contexts/AuthContext'
import { Metadata } from 'next'

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
    <html>
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
