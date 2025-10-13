import React from 'react';
import { Shield, Lock, Eye, Server, FileCheck, Users, Zap, Award } from 'lucide-react';
import { useTranslation } from 'next-i18next';

const SECURITY_CONFIG = {
  TLS_VERSION: 'TLS 1.3',
  OAUTH_VERSION: 'OAuth 2.0',
  ISO_CERT: 'ISO 27001',
  MONITORING: '24/7',
  RBAC: 'RBAC'
};

export function SecuritySection() {
  const { t } = useTranslation();
  
  const securityFeatures = [
    {
      icon: Shield,
      title: t('security.ssl.title'),
      description: t('security.ssl.description'),
      certification: SECURITY_CONFIG.TLS_VERSION
    },
    {
      icon: Lock,
      title: t('security.mfa.title'),
      description: t('security.mfa.description'),
      certification: SECURITY_CONFIG.OAUTH_VERSION
    },
    {
      icon: Server,
      title: t('security.hosting.title'),
      description: t('security.hosting.description'),
      certification: SECURITY_CONFIG.ISO_CERT
    },
    {
      icon: FileCheck,
      title: t('security.gdpr.title'),
      description: t('security.gdpr.description'),
      certification: "RGPD"
    },
    {
      icon: Eye,
      title: t('security.monitoring.title'),
      description: t('security.monitoring.description'),
      certification: SECURITY_CONFIG.MONITORING
    },
    {
      icon: Users,
      title: t('security.access.title'),
      description: t('security.access.description'),
      certification: SECURITY_CONFIG.RBAC
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4 mr-2" />
            {t('security.badge')}
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('security.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('security.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-green-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {feature.certification}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              {t('security.stats.title')}
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">99.9%</div>
              <div className="text-gray-300">{t('security.stats.uptime')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">0</div>
              <div className="text-gray-300">{t('security.stats.breaches')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">&lt;2min</div>
              <div className="text-gray-300">{t('security.stats.response')}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">24/7</div>
              <div className="text-gray-300">{t('security.stats.monitoring')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}