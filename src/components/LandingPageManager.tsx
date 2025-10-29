import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Image, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Upload, 
  Move, 
  Eye,
  Smartphone,
  Monitor,
  Zap,
  Mail,
  FileText
} from 'lucide-react';

interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  illustration: string;
  ctaText: string;
  ctaLink: string;
}

interface KpiItem {
  id: string;
  title: string;
  value: string;
  description: string;
  icon: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  order: number;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  deliverables: string;
  illustration: string;
  order: number;
}

interface ContactSection {
  title: string;
  description: string;
  servicePrefill: string;
  whatsappNumber: string;
  email: string;
}

interface FooterSection {
  senegalAddress: string;
  moroccoAddress: string;
  socialLinks: { platform: string; url: string }[];
  quickLinks: { title: string; url: string }[];
}

export function LandingPageManager() {
  const [activeTab, setActiveTab] = useState('hero');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for each section
  const [heroSection, setHeroSection] = useState<HeroSection>({
    id: 'hero',
    title: 'Solutions IA pour PME au Sénégal & Maroc',
    subtitle: 'Automatisez vos processus et boostez votre productivité avec notre plateforme intelligente',
    illustration: '/images/hero-illustration.webp',
    ctaText: 'Demander une démo personnalisée',
    ctaLink: '#contact'
  });

  const [kpis, setKpis] = useState<KpiItem[]>([
    { id: '1', title: 'Vitesse', value: '2x', description: 'Plus rapide que les solutions traditionnelles', icon: ' Zap' },
    { id: '2', title: 'SEO', value: '95%', description: 'Score Google Lighthouse', icon: 'Search' },
    { id: '3', title: 'Mobile', value: '100%', description: 'Optimisé pour tous les appareils', icon: 'Smartphone' }
  ]);

  const [services, setServices] = useState<ServiceItem[]>([
    { 
      id: '1', 
      title: 'Chatbot IA', 
      description: 'Automatisez vos conversations client 24/7 avec notre solution d\'intelligence artificielle conversationnelle', 
      image: '/images/chatbot.webp', 
      ctaText: 'Découvrir', 
      ctaLink: '#chatbot', 
      order: 1 
    },
    { 
      id: '2', 
      title: 'Sites Web Ultra-Rapides', 
      description: 'Des sites web qui se chargent en moins de 1.5 secondes pour une meilleure conversion', 
      image: '/images/website.webp', 
      ctaText: 'Voir exemples', 
      ctaLink: '#websites', 
      order: 2 
    },
    { 
      id: '3', 
      title: 'Automatisation WhatsApp', 
      description: 'Transformez vos ventes WhatsApp en machine à vendre avec notre solution d\'automatisation', 
      image: '/images/whatsapp.webp', 
      ctaText: 'En savoir plus', 
      ctaLink: '#whatsapp', 
      order: 3 
    }
  ]);

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { 
      id: '1', 
      title: 'Audit & Analyse', 
      description: 'Nous analysons vos besoins et processus actuels', 
      duration: '2-3 jours', 
      deliverables: 'Rapport d\'audit, recommandations', 
      illustration: '/images/audit.webp', 
      order: 1 
    },
    { 
      id: '2', 
      title: 'Conception & Développement', 
      description: 'Création de votre solution personnalisée', 
      duration: '2-4 semaines', 
      deliverables: 'Solution fonctionnelle, documentation', 
      illustration: '/images/development.webp', 
      order: 2 
    },
    { 
      id: '3', 
      title: 'Déploiement & Formation', 
      description: 'Mise en production et formation de votre équipe', 
      duration: '1 semaine', 
      deliverables: 'Solution déployée, sessions de formation', 
      illustration: '/images/deployment.webp', 
      order: 3 
    }
  ]);

  const [contactSection, setContactSection] = useState<ContactSection>({
    title: 'Prêt à transformer votre business?',
    description: 'Contactez notre équipe pour une démonstration personnalisée de nos solutions',
    servicePrefill: '',
    whatsappNumber: '+212 70 119 38 11',
    email: 'contact@oma-digital.sn'
  });

  const [footerSection, setFooterSection] = useState<FooterSection>({
    senegalAddress: 'Dakar, Sénégal',
    moroccoAddress: 'Casablanca, Maroc',
    socialLinks: [
      { platform: 'Facebook', url: 'https://facebook.com/omadigital' },
      { platform: 'LinkedIn', url: 'https://linkedin.com/company/omadigital' },
      { platform: 'Twitter', url: 'https://twitter.com/omadigital' }
    ],
    quickLinks: [
      { title: 'Services', url: '#services' },
      { title: 'Blog', url: '/blog' },
      { title: 'Contact', url: '#contact' }
    ]
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real implementation, this would save to your backend
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Modifications enregistrées avec succès!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement des modifications');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, section: string, id?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real implementation, this would upload to your storage service
      // For now, we'll just show a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imageUrl = event.target.result as string;
          
          switch (section) {
            case 'hero':
              setHeroSection(prev => ({ ...prev, illustration: imageUrl }));
              break;
            case 'service':
              if (id) {
                setServices(prev => 
                  prev.map(service => 
                    service.id === id ? { ...service, image: imageUrl } : service
                  )
                );
              }
              break;
            case 'process':
              if (id) {
                setProcessSteps(prev => 
                  prev.map(step => 
                    step.id === id ? { ...step, illustration: imageUrl } : step
                  )
                );
              }
              break;
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addKpi = () => {
    setKpis(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: '',
        value: '',
        description: '',
        icon: ''
      }
    ]);
  };

  const removeKpi = (id: string) => {
    setKpis(prev => prev.filter(kpi => kpi.id !== id));
  };

  const addService = () => {
    setServices(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        image: '',
        ctaText: 'Découvrir',
        ctaLink: '',
        order: prev.length + 1
      }
    ]);
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(service => service.id !== id));
  };

  const addProcessStep = () => {
    setProcessSteps(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: '',
        description: '',
        duration: '',
        deliverables: '',
        illustration: '',
        order: prev.length + 1
      }
    ]);
  };

  const removeProcessStep = (id: string) => {
    setProcessSteps(prev => prev.filter(step => step.id !== id));
  };

  const moveItem = (array: any[], setArray: Function, id: string, direction: 'up' | 'down') => {
    const index = array.findIndex(item => item.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const newArray = [...array];
      [newArray[index], newArray[index - 1]] = [newArray[index - 1], newArray[index]];
      setArray(newArray);
    } else if (direction === 'down' && index < array.length - 1) {
      const newArray = [...array];
      [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
      setArray(newArray);
    }
  };

  const renderHeroSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Hero</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={heroSection.title}
                onChange={(e) => setHeroSection(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
              <textarea
                value={heroSection.subtitle}
                onChange={(e) => setHeroSection(prev => ({ ...prev, subtitle: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texte CTA</label>
                <input
                  type="text"
                  value={heroSection.ctaText}
                  onChange={(e) => setHeroSection(prev => ({ ...prev, ctaText: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien CTA</label>
                <input
                  type="text"
                  value={heroSection.ctaLink}
                  onChange={(e) => setHeroSection(prev => ({ ...prev, ctaLink: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Illustration IA</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {heroSection.illustration ? (
                <div className="relative">
                  <img 
                    src={heroSection.illustration} 
                    alt="Hero illustration" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setHeroSection(prev => ({ ...prev, illustration: '' }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500">Aucune image sélectionnée</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'hero')}
                className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKpiSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">KPIs / Chiffres Clés</h3>
          <button
            onClick={addKpi}
            className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter KPI</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {kpis.map((kpi, index) => (
            <div key={kpi.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">KPI #{index + 1}</h4>
                <button
                  onClick={() => removeKpi(kpi.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    value={kpi.title}
                    onChange={(e) => setKpis(prev => 
                      prev.map(item => item.id === kpi.id ? { ...item, title: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                  <input
                    type="text"
                    value={kpi.value}
                    onChange={(e) => setKpis(prev => 
                      prev.map(item => item.id === kpi.id ? { ...item, value: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={kpi.description}
                    onChange={(e) => setKpis(prev => 
                      prev.map(item => item.id === kpi.id ? { ...item, description: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icône</label>
                  <input
                    type="text"
                    value={kpi.icon}
                    onChange={(e) => setKpis(prev => 
                      prev.map(item => item.id === kpi.id ? { ...item, icon: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nom de l'icône (ex: Zap, Search, Smartphone)"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServicesSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Solutions & Services</h3>
          <button
            onClick={addService}
            className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Service</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={service.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">Service #{index + 1}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => moveItem(services, setServices, service.id, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Move className="w-4 h-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => moveItem(services, setServices, service.id, 'down')}
                    disabled={index === services.length - 1}
                    className={`p-1 rounded ${index === services.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Move className="w-4 h-4 -rotate-90" />
                  </button>
                  <button
                    onClick={() => removeService(service.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => setServices(prev => 
                      prev.map(item => item.id === service.id ? { ...item, title: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                  <input
                    type="number"
                    value={service.order}
                    onChange={(e) => setServices(prev => 
                      prev.map(item => item.id === service.id ? { ...item, order: parseInt(e.target.value) } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => setServices(prev => 
                      prev.map(item => item.id === service.id ? { ...item, description: e.target.value } : item)
                    )}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texte CTA</label>
                  <input
                    type="text"
                    value={service.ctaText}
                    onChange={(e) => setServices(prev => 
                      prev.map(item => item.id === service.id ? { ...item, ctaText: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien CTA</label>
                  <input
                    type="text"
                    value={service.ctaLink}
                    onChange={(e) => setServices(prev => 
                      prev.map(item => item.id === service.id ? { ...item, ctaLink: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {service.image ? (
                      <div className="relative">
                        <img 
                          src={service.image} 
                          alt="Service" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setServices(prev => 
                            prev.map(item => item.id === service.id ? { ...item, image: '' } : item)
                          )}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <Image className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-gray-500 text-sm">Aucune image sélectionnée</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'service', service.id)}
                      className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProcessSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Processus de Transformation</h3>
          <button
            onClick={addProcessStep}
            className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Étape</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {processSteps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">Étape #{index + 1}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => moveItem(processSteps, setProcessSteps, step.id, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Move className="w-4 h-4 rotate-90" />
                  </button>
                  <button
                    onClick={() => moveItem(processSteps, setProcessSteps, step.id, 'down')}
                    disabled={index === processSteps.length - 1}
                    className={`p-1 rounded ${index === processSteps.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Move className="w-4 h-4 -rotate-90" />
                  </button>
                  <button
                    onClick={() => removeProcessStep(step.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => setProcessSteps(prev => 
                      prev.map(item => item.id === step.id ? { ...item, title: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                  <input
                    type="text"
                    value={step.duration}
                    onChange={(e) => setProcessSteps(prev => 
                      prev.map(item => item.id === step.id ? { ...item, duration: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="ex: 2-3 jours"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={step.description}
                    onChange={(e) => setProcessSteps(prev => 
                      prev.map(item => item.id === step.id ? { ...item, description: e.target.value } : item)
                    )}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Livrables</label>
                  <input
                    type="text"
                    value={step.deliverables}
                    onChange={(e) => setProcessSteps(prev => 
                      prev.map(item => item.id === step.id ? { ...item, deliverables: e.target.value } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                  <input
                    type="number"
                    value={step.order}
                    onChange={(e) => setProcessSteps(prev => 
                      prev.map(item => item.id === step.id ? { ...item, order: parseInt(e.target.value) } : item)
                    )}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Illustration</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {step.illustration ? (
                      <div className="relative">
                        <img 
                          src={step.illustration} 
                          alt="Process step" 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setProcessSteps(prev => 
                            prev.map(item => item.id === step.id ? { ...item, illustration: '' } : item)
                          )}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <Image className="w-8 h-8 text-gray-400 mx-auto" />
                        <p className="text-gray-500 text-sm">Aucune image sélectionnée</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'process', step.id)}
                      className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContactSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CTA & Formulaire Contact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                value={contactSection.title}
                onChange={(e) => setContactSection(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={contactSection.description}
                onChange={(e) => setContactSection(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pré-remplissage services</label>
              <input
                type="text"
                value={contactSection.servicePrefill}
                onChange={(e) => setContactSection(prev => ({ ...prev, servicePrefill: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="ex: Chatbot IA, Site Web Ultra-Rapide"
              />
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro WhatsApp</label>
              <input
                type="text"
                value={contactSection.whatsappNumber}
                onChange={(e) => setContactSection(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={contactSection.email}
                onChange={(e) => setContactSection(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFooterSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Footer</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordonnées Sénégal</label>
              <input
                type="text"
                value={footerSection.senegalAddress}
                onChange={(e) => setFooterSection(prev => ({ ...prev, senegalAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordonnées Maroc</label>
              <input
                type="text"
                value={footerSection.moroccoAddress}
                onChange={(e) => setFooterSection(prev => ({ ...prev, moroccoAddress: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Liens rapides</h4>
            <div className="space-y-2">
              {footerSection.quickLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => {
                      const newLinks = [...footerSection.quickLinks];
                      newLinks[index].title = e.target.value;
                      setFooterSection(prev => ({ ...prev, quickLinks: newLinks }));
                    }}
                    placeholder="Titre"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...footerSection.quickLinks];
                      newLinks[index].url = e.target.value;
                      setFooterSection(prev => ({ ...prev, quickLinks: newLinks }));
                    }}
                    placeholder="URL"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
            </div>
            
            <h4 className="font-medium text-gray-900 mt-4 mb-2">Réseaux sociaux</h4>
            <div className="space-y-2">
              {footerSection.socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => {
                      const newLinks = [...footerSection.socialLinks];
                      newLinks[index].platform = e.target.value;
                      setFooterSection(prev => ({ ...prev, socialLinks: newLinks }));
                    }}
                    placeholder="Plateforme"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...footerSection.socialLinks];
                      newLinks[index].url = e.target.value;
                      setFooterSection(prev => ({ ...prev, socialLinks: newLinks }));
                    }}
                    placeholder="URL"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: Monitor },
    { id: 'kpi', label: 'KPIs', icon: Zap },
    { id: 'services', label: 'Services', icon: Smartphone },
    { id: 'process', label: 'Processus', icon: Move },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'footer', label: 'Footer', icon: FileText }
  ];

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion de la Landing Page</h2>
          <p className="text-gray-600">Gérez toutes les sections de votre page d'accueil</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Enregistrer</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'hero' && renderHeroSection()}
          {activeTab === 'kpi' && renderKpiSection()}
          {activeTab === 'services' && renderServicesSection()}
          {activeTab === 'process' && renderProcessSection()}
          {activeTab === 'contact' && renderContactSection()}
          {activeTab === 'footer' && renderFooterSection()}
        </div>
      </div>
    </div>
  );
}