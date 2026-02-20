'use client'

import { useState } from 'react'
import { useCart } from '../lib/contexts/CartContext'
import { useAuth } from '../lib/contexts/AuthContext'
import { useParams } from 'next/navigation'
import LoginModal from './LoginModal'

interface UiTranslations {
  view_details?: string
  hide_details?: string
  included?: string
  technologies?: string
  order?: string
}

interface Service {
  id: string
  title: string
  description: string
  price: string
  icon?: string
  includes: string[]
  stack: string[]
}

interface ServicesGridProps {
  services: Service[]
  uiTranslations?: UiTranslations
}

export default function ServicesGrid({ services, uiTranslations = {} }: ServicesGridProps) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const params = useParams()
  const locale = params.locale as string
  const [addedService, setAddedService] = useState<string | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null)

  // Fall back to locale string if no translation provided
  const t = {
    view_details: uiTranslations.view_details || 'Voir les détails',
    hide_details: uiTranslations.hide_details || 'Masquer les détails',
    included: uiTranslations.included || '✓ Détails inclus :',
    technologies: uiTranslations.technologies || '🔧 Technologies clés :',
    order: uiTranslations.order || 'Commander',
  }

  const toggleDetails = (id: string) => {
    setExpandedServiceId(prev => prev === id ? null : id)
  }

  const handleAddToCart = (service: Service) => {
    // Vérifier si l'utilisateur est authentifié
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    // Extraire le prix numérique à partir de formats comme "10 000 DH", "10,000 DH", etc.
    const numericString = service.price.replace(/[^\d]/g, '')
    const price = numericString ? parseInt(numericString, 10) : 0

    addItem({
      id: service.id,
      serviceId: service.id,
      title: service.title,
      price,
      quantity: 1,
      addedAt: new Date(),
    })

    // Afficher un message de confirmation
    setAddedService(service.id)
    setTimeout(() => setAddedService(null), 2000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service: Service) => (
        <div
          key={service.id}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col"
        >
          <div className="p-8 flex-1 flex flex-col">
            {service.icon && (
              <div className="text-4xl mb-4">{service.icon}</div>
            )}
            <h3 className="text-xl font-bold mb-3 text-gray-800">{service.title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm flex-1">
              {service.description}
            </p>

            <div className="mb-6">
              <span className="text-3xl font-bold text-blue-600">{service.price}</span>
            </div>

            {/* Toggle Button */}
            <div className="mb-4">
              <button
                onClick={() => toggleDetails(service.id)}
                className="text-blue-600 font-semibold hover:text-blue-800 text-sm focus:outline-none flex items-center transition-colors"
              >
                {expandedServiceId === service.id ? t.hide_details : t.view_details}
                <span className={`ml-2 transform transition-transform ${expandedServiceId === service.id ? 'rotate-180' : ''}`}>▼</span>
              </button>
            </div>

            {/* Collapsible Content */}
            {expandedServiceId === service.id && (
              <div className="transition-all duration-300 ease-in-out">
                {/* Détails inclus */}
                {service.includes && service.includes.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-3 text-gray-700 text-sm">
                      {t.included}
                    </h4>
                    <ul className="space-y-2">
                      {service.includes.map((item: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-600 mr-2 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technologies */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-gray-700 text-sm">
                    {t.technologies}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {service.stack?.map((tech: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bouton Ajouter au panier */}
            <button
              onClick={() => handleAddToCart(service)}
              className={`px-6 py-3 rounded-lg font-semibold text-center block w-full transition-all duration-300 transform hover:scale-105 mt-auto ${addedService === service.id
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
            >
              {addedService === service.id
                ? 'Article ajouté'
                : t.order}
            </button>
          </div>
        </div>
      ))}

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  )
}
