'use client'

import { useState, useEffect } from 'react'

const SERVICES = [
  { id: 'site-vitrine', title: 'Site Vitrine (Standard)' },
  { id: 'ecommerce-essentiel', title: 'E-commerce Essentiel' },
  { id: 'app-mobile-mvp', title: 'Application Mobile (MVP)' },
  { id: 'app-mobile-standard', title: 'Application Mobile (Standard)' },
  { id: 'chatbot-ia-rag', title: 'Chatbot IA Personnalisé (RAG)' },
  { id: 'bot-simple', title: 'Bot Simple (WhatsApp/Telegram)' },
  { id: 'automatisation-ia', title: 'Automatisation IA (Workflow)' },
  { id: 'marketing-digital', title: 'Marketing Digital (Gestion)' },
  { id: 'creation-video', title: 'Création Vidéo' }
]

interface NewsletterFormProps {
  locale: string
}

export default function NewsletterForm({ locale }: NewsletterFormProps) {
  const [translations, setTranslations] = useState<any>({})
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    service: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`)
        const data = await response.json()
        setTranslations(data)
      } catch (err) {
        console.error('Erreur lors du chargement des traductions:', err)
      }
    }
    loadTranslations()
  }, [locale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage(translations.newsletter?.success || 'Inscription réussie !')
        setFormData({ fullName: '', email: '', service: '' })
      } else {
        if (response.status === 409) {
          setMessage(translations.newsletter?.already_subscribed || 'Email déjà inscrit !')
        } else {
          setMessage(translations.newsletter?.error || 'Erreur lors de l\'inscription.')
        }
      }
    } catch (error) {
      setMessage(translations.newsletter?.connection_error || 'Erreur de connexion.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h4 className="text-lg font-semibold mb-4 text-white">
        {translations.newsletter?.title || 'Newsletter'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 text-sm"
          placeholder={translations.newsletter?.full_name_placeholder || 'Nom complet'}
        />

        <input
          type="email"
          required
          pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 text-sm"
          placeholder={translations.newsletter?.email_placeholder || 'Votre email'}
        />

        <select
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          className="w-full px-3 py-2 bg-white text-black rounded border border-gray-600 focus:border-blue-500 text-sm"
        >
          <option value="">
            {translations.newsletter?.service_interest || "Service d'intérêt"}
          </option>
          {SERVICES.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {isSubmitting
            ? (translations.newsletter?.subscribing || 'Inscription...')
            : (translations.newsletter?.subscribe || 'S\'inscrire')
          }
        </button>
      </form>

      {message && (
        <p className={`mt-2 text-xs ${message.includes('réussie') || message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}