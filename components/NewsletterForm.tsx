'use client'

import { useState } from 'react'

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
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    service: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

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
        setMessage(locale === 'fr' ? 'Inscription réussie !' : 'Successfully subscribed!')
        setFormData({ fullName: '', email: '', service: '' })
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          setMessage(locale === 'fr' ? 'Email déjà inscrit !' : 'Email already subscribed!')
        } else {
          setMessage(locale === 'fr' ? 'Erreur lors de l\'inscription.' : 'Subscription failed.')
        }
      }
    } catch (error) {
      setMessage(locale === 'fr' ? 'Erreur de connexion.' : 'Connection error.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h4 className="text-lg font-semibold mb-4 text-white">
        {locale === 'fr' ? 'Newsletter' : 'Newsletter'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 text-sm"
          placeholder={locale === 'fr' ? 'Nom complet' : 'Full Name'}
        />

        <input
          type="email"
          required
          pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 text-sm"
          placeholder="Email"
        />

        <select
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
          className="w-full px-3 py-2 bg-white text-black rounded border border-gray-600 focus:border-blue-500 text-sm"
        >
          <option value="">
            {locale === 'fr' ? "Service d'intérêt" : 'Service of Interest'}
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
            ? (locale === 'fr' ? 'Inscription...' : 'Subscribing...') 
            : (locale === 'fr' ? 'S\'inscrire' : 'Subscribe')
          }
        </button>
      </form>

      {message && (
        <p className={`mt-2 text-xs ${message.includes('réussie') || message.includes('Successfully') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  )
}