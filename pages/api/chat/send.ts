import type { NextApiRequest, NextApiResponse } from 'next';
import { ultraIntelligentRAG } from '../../../src/lib/ultra-intelligent-rag';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract variables at the beginning to make them available in catch block
  const { message, conversationId, inputMethod, sessionId, context } = req.body;
  
  try {
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    console.log('💬 Chat request:', { 
      message: message.substring(0, 50) + '...', 
      inputMethod, 
      sessionId: sessionId?.substring(0, 8) + '...'
    });

    // Générer sessionId si non fourni
    const currentSessionId = sessionId || conversationId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Utiliser le système RAG Ultra-Intelligent comme solution principale
    console.log('🧠 Using Ultra-Intelligent RAG system with enhanced context');
    const result = await ultraIntelligentRAG.processMessage(
      message.trim(),
      currentSessionId,
      'text',
      context // Passer le contexte amélioré
    );
    
    console.log('🧠 Ultra-Intelligent RAG response:', {
      language: result.language,
      responseLength: result.response.length,
      conversationId: result.conversationId.substring(0, 8) + '...',
      source: result.source,
      confidence: result.confidence,
      suggestions: result.suggestions?.length || 0,
      cta: result.cta?.type || 'none'
    });
    
    return res.status(200).json({
      response: result.response,
      conversationId: result.conversationId,
      language: result.language,
      sessionId: currentSessionId,
      source: result.source,
      confidence: result.confidence,
      suggestions: result.suggestions,
      cta: result.cta,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback avec réponse de secours détaillée
    try {
      const fallbackLanguage = detectLanguage(message?.trim() || '');
      const fallbackResponse = generateFallbackResponse(message?.trim() || '', inputMethod, fallbackLanguage);
      
      return res.status(200).json({ 
        response: fallbackResponse,
        conversationId: conversationId || `fallback-${Date.now()}`,
        language: fallbackLanguage,
        fallback: true,
        error: 'Fallback response used',
        source: 'api_fallback',
        confidence: 0.7,
        suggestions: fallbackLanguage === 'en' 
          ? ['📞 Contact us', '📧 Send email', '🌐 Our services', '💰 Pricing'] 
          : ['📞 Nous contacter', '📧 Envoyer email', '🌐 Nos services', '💰 Tarifs'],
        cta: {
          type: 'contact',
          action: fallbackLanguage === 'en' ? 'Contact us directly' : 'Contactez-nous directement',
          data: { phone: '+212701193811', email: 'omasenegal25@gmail.com' }
        }
      });
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      // Dernier recours - réponse d'erreur minimale
      return res.status(500).json({
        error: 'Service temporarily unavailable',
        message: 'Nous rencontrons actuellement des difficultés techniques. Veuillez réessayer plus tard.'
      });
    }
  }
}

// Enhanced fallback response generator with personality
function generateFallbackResponse(message: string, inputMethod: string = 'text', detectedLanguage: 'fr' | 'en' = 'fr'): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for sensitive topics first
  const sensitiveTopics = detectedLanguage === 'en' 
    ? ['politics', 'religion', 'personal', 'private', 'password', 'hack', 'illegal', 'violence']
    : ['politique', 'religion', 'personnel', 'privé', 'mot de passe', 'pirater', 'illégal', 'violence'];
    
  if (sensitiveTopics.some(topic => lowerMessage.includes(topic))) {
    return detectedLanguage === 'en'
      ? "I'm here to help with OMA Digital services and business automation. For other topics, please contact our team directly at +212701193811. 🙏"
      : "Je suis là pour vous aider avec les services OMA Digital et l'automatisation business. Pour d'autres sujets, contactez notre équipe au +212 701 193 811. 🙏";
  }
  
  if (detectedLanguage === 'en') {
    // Check for greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || 
        lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon')) {
      return "Hello there! 👋 I'm OMADIGITAL, OMA Digital's virtual assistant. Even though I'm having a small technical hiccup, I'm excited to help you with your digital transformation journey!\n\n✨ We specialize in WhatsApp automation with 200% average ROI\n🌐 Professional websites that convert visitors to customers\n🤖 Smart chatbots available 24/7\n📱 Mobile apps that engage your customers\n\nHow can I assist you today? 🤔";
    }
    
    // Services & WhatsApp automation
    if (lowerMessage.includes('service') || lowerMessage.includes('what do you do') || lowerMessage.includes('what services') ||
        lowerMessage.includes('automation') || lowerMessage.includes('whatsapp')) {
      return "OMA Digital specializes in:\n\n• WhatsApp Business Automation (50,000 CFA/month) 🤖\n• Web and mobile application development 💻\n• Digital transformation for SMEs 🚀\n• E-commerce solutions 🛒\n• AI chatbots and customer service automation 🧠\n\nOur WhatsApp automation delivers 200% ROI in 6 months. Interested? Let's discuss how we can help your business grow! 💡";
    }
    
    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('reach')) {
      return "You can contact us:\n\n📞 Phone/WhatsApp: +212 701 193 811\n📧 Email: omasenegal25@gmail.com\n🌐 Website: www.oma-digital.com\n\nWe're available Monday to Friday from 9 AM to 6 PM. WhatsApp us for immediate response! ⚡\n\nEven with this technical issue, we're committed to helping you succeed! 💪";
    }
    
    // Pricing
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pricing') || lowerMessage.includes('how much')) {
      return "Our pricing starts at 50,000 CFA/month for WhatsApp automation with guaranteed 200% ROI. We offer:\n\n• Free personalized consultation 🆓\n• Competitive rates for Senegalese SMEs 💰\n• Flexible payment options 💳\n• Performance-based pricing 📈\n\nContact us at +212 701 193 811 for a detailed quote! We're here to find a solution that fits your budget. 💡";
    }
    
    // ROI & Business benefits
    if (lowerMessage.includes('roi') || lowerMessage.includes('benefit') || lowerMessage.includes('profit') || lowerMessage.includes('business')) {
      return "Our WhatsApp automation delivers:\n\n• 200% average ROI in 6 months 💰\n• 24/7 automated customer service ⏰\n• Increased sales conversion 📈\n• Reduced operational costs 💸\n• Better customer engagement ❤️\n\nPerfect for Senegalese SMEs! Want to see how it works for your business? Let's schedule a quick chat! 📞";
    }
    
    // Default response with personality
    return "Thank you for your message! 🙏 I'm currently experiencing a small technical issue, but I'm still here and eager to help with OMA Digital's automation services.\n\nAs your dedicated assistant OMADIGITAL, I want to ensure you get the support you need:\n\n📞 +212 701 193 811 (WhatsApp 24/7)\n📧 omasenegal25@gmail.com\n\nWe'll be happy to discuss your business needs and find the perfect digital solution for you! 💼✨";
    
  } else {
    // French responses (default)
    
    // Check for sensitive topics first
    const sensitiveTopicsFr = ['politique', 'religion', 'personnel', 'privé', 'mot de passe', 'pirater', 'illégal', 'violence'];
    if (sensitiveTopicsFr.some(topic => lowerMessage.includes(topic))) {
      return "Je suis là pour vous aider avec les services OMA Digital et l'automatisation business. Pour d'autres sujets, contactez notre équipe au +212 701 193 811. 🙏";
    }
    
    // Greetings
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('bonsoir')) {
      return "Bonjour ! 👋 Je suis OMADIGITAL, l'assistant virtuel d'OMA Digital. Même si je rencontre un petit problème technique, je suis excité de vous aider dans votre parcours de transformation digitale !\n\n✨ Nous spécialisons dans l'automatisation WhatsApp avec un ROI moyen de 200%\n🌐 Sites web professionnels qui convertissent les visiteurs en clients\n🤖 Chatbots intelligents disponibles 24/7\n📱 Applications mobiles qui engagent vos clients\n\nComment puis-je vous aider aujourd'hui ? 🤔";
    }
    
    // Services
    if (lowerMessage.includes('service') || lowerMessage.includes('que faites-vous') || lowerMessage.includes('quels services')) {
      return "OMA Digital propose plusieurs services :\n\n• Développement d'applications web et mobiles 💻\n• Transformation digitale 🚀\n• Solutions e-commerce 🛒\n• Consulting IT 🧠\n• Maintenance et support 🛠️\n\nSouhaitez-vous en savoir plus sur un service en particulier ? Je suis là pour vous guider ! 💡";
    }
    
    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('téléphone') || lowerMessage.includes('email') || lowerMessage.includes('joindre')) {
      return "Vous pouvez nous contacter :\n\n📞 Téléphone/WhatsApp : +212 701 193 811\n📧 Email : omasenegal25@gmail.com\n🌐 Site web : www.oma-digital.com\n\nNous sommes disponibles du lundi au vendredi de 9h à 18h. WhatsApppez-nous pour une réponse immédiate ! ⚡\n\nMême avec ce petit souci technique, nous sommes engagés à vous aider à réussir ! 💪";
    }
    
    // Pricing
    if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('coût') || lowerMessage.includes('combien')) {
      return "Nos tarifs commencent à 50 000 FCFA/mois pour l'automatisation WhatsApp avec un ROI garanti de 200%. Nous proposons :\n\n• Consultation personnalisée gratuite 🆓\n• Tarifs compétitifs pour les PME sénégalaises 💰\n• Options de paiement flexibles 💳\n• Tarification basée sur la performance 📈\n\nContactez-nous au +212 701 193 811 pour un devis détaillé ! Nous trouverons une solution qui s'adapte à votre budget. 💡";
    }
    
    // ROI & Business benefits
    if (lowerMessage.includes('roi') || lowerMessage.includes('bénéfice') || lowerMessage.includes('profit') || lowerMessage.includes('business') || lowerMessage.includes('entreprise')) {
      return "Notre automatisation WhatsApp délivre :\n\n• Un ROI moyen de 200% en 6 mois 💰\n• Un service client automatisé 24/7 ⏰\n• Une conversion des ventes accrue 📈\n• Une réduction des coûts opérationnels 💸\n• Un meilleur engagement client ❤️\n\nParfait pour les PME sénégalaises ! Vous voulez voir comment cela fonctionne pour votre entreprise ? Planifions un bref échange ! 📞";
    }
    
    // Default response with personality
    return "Merci pour votre message ! 🙏 Même si je rencontre un petit problème technique, je suis toujours là et impatient de vous aider avec les services d'automatisation d'OMA Digital.\n\nEn tant qu'assistant dédié OMADIGITAL, je veux m'assurer que vous recevez le soutien dont vous avez besoin :\n\n📞 +212 701 193 811 (WhatsApp 24/7)\n📧 omasenegal25@gmail.com\n\nNous serons heureux de discuter de vos besoins professionnels et de trouver la solution digitale parfaite pour vous ! 💼✨";
  }
}

// Enhanced language detection function
function detectLanguage(text: string): 'fr' | 'en' {
  const lowerText = text.toLowerCase();
  
  // French indicators (weighted more heavily for Senegalese market)
  const frenchIndicators = [
    'bonjour', 'salut', 'merci', 's\'il vous plaît', 'svp', 'au revoir', 'dakar', 'sénégal', 'fcfa', 'cfa',
    'prix', 'tarif', 'service', 'whatsapp', 'automatisation', 'entreprise', 'pme', 'business',
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'dans', 'sur'
  ];
  
  // English indicators
  const englishIndicators = [
    'hello', 'hi', 'thank you', 'please', 'goodbye', 'senegal', 'price', 'service', 'whatsapp', 'automation',
    'i', 'you', 'he', 'she', 'we', 'they', 'it',
    'the', 'a', 'an', 'this', 'that', 'these', 'those', 'in', 'on', 'at'
  ];
  
  let frenchScore = 0;
  let englishScore = 0;
  
  frenchIndicators.forEach(word => {
    if (lowerText.includes(word)) frenchScore++;
  });
  
  englishIndicators.forEach(word => {
    if (lowerText.includes(word)) englishScore++;
  });
  
  // Default to French for Senegalese market
  return englishScore > frenchScore ? 'en' : 'fr';
}