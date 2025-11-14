import { CartProvider } from '@/lib/contexts/CartContext'
import { AuthProvider } from '@/lib/contexts/AuthContext'

export const metadata = {
  title: 'OMA Digital',
  description: 'Agence Web & Marketing Digital au Maroc & Sénégal',
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
