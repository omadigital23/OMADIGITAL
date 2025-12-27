'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/contexts/AuthContext'
import LoginModal from '../../../components/LoginModal'

export default function LoginPage() {
  const params = useParams()
  const locale = params.locale as string
  const router = useRouter()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  // Si l'utilisateur est déjà connecté, on le renvoie vers l'accueil
  useEffect(() => {
    if (user) {
      router.replace(`/${locale}`)
    }
  }, [user, router, locale])

  const handleClose = () => {
    setIsOpen(false)
    router.replace(`/${locale}`)
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <LoginModal isOpen={isOpen} onClose={handleClose} />
    </main>
  )
}
