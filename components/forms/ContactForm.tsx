'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse e-mail invalide'),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().min(1, 'Veuillez sélectionner un service'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères')
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  locale: string
}

export default function ContactForm({ locale }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched'
  })

  const services = [
    { value: 'site-vitrine', label: locale === 'fr' ? 'Site Vitrine' : 'Showcase Website' },
    { value: 'ecommerce', label: locale === 'fr' ? 'E-commerce' : 'E-commerce' },
    { value: 'app-mobile', label: locale === 'fr' ? 'Application Mobile' : 'Mobile App' },
    { value: 'chatbot', label: locale === 'fr' ? 'Chatbot IA' : 'AI Chatbot' },
    { value: 'marketing', label: locale === 'fr' ? 'Marketing Digital' : 'Digital Marketing' },
    { value: 'autre', label: locale === 'fr' ? 'Autre' : 'Other' }
  ]

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setSubmitStatus('success')
        reset()
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'fr' ? 'Nom complet *' : 'Full Name *'}
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            placeholder={locale === 'fr' ? 'Votre nom...' : 'Your name...'}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="vous@exemple.com"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'fr' ? 'Téléphone' : 'Phone'}
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
            {locale === 'fr' ? 'Entreprise' : 'Company'}
          </label>
          <input
            {...register('company')}
            type="text"
            id="company"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Service souhaité *' : 'Desired Service *'}
        </label>
        <select
          {...register('service')}
          id="service"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.service ? 'border-red-500' : 'border-gray-300'
            }`}
        >
          <option value="">
            {locale === 'fr' ? 'Sélectionnez un service' : 'Select a service'}
          </option>
          {services.map(service => (
            <option key={service.value} value={service.value}>
              {service.label}
            </option>
          ))}
        </select>
        {errors.service && (
          <p className="mt-1 text-xs text-red-500">{errors.service.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          {locale === 'fr' ? 'Message *' : 'Message *'}
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={5}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder={locale === 'fr' ? 'Décrivez votre projet...' : 'Describe your project...'}
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {locale === 'fr'
            ? 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
            : 'Your message has been sent successfully. We will respond to you as soon as possible.'
          }
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {locale === 'fr'
            ? 'Une erreur est survenue. Veuillez réessayer.'
            : 'An error occurred. Please try again.'
          }
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting
          ? (locale === 'fr' ? 'Envoi en cours...' : 'Sending...')
          : (locale === 'fr' ? 'Envoyer le message' : 'Send Message')
        }
      </button>
    </form>
  )
}