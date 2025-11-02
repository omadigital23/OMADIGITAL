// Google Analytics 4 helper functions

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// Track events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track contact form submissions
export const trackContactForm = (service: string) => {
  event({
    action: 'contact_form_submit',
    category: 'engagement',
    label: service,
  })
}

// Track chatbot interactions
export const trackChatbot = (message: string) => {
  event({
    action: 'chatbot_interaction',
    category: 'engagement',
    label: message.substring(0, 50),
  })
}