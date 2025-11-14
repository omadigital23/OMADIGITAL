import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY!
const CALLMEBOT_PHONE = process.env.CALLMEBOT_PHONE!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface WhatsAppNotificationPayload {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  total: number
  items: Array<{
    title: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppNotificationPayload = await request.json()

    // Construire le message WhatsApp
    const itemsList = body.items
      .map((item) => `• ${item.title} x${item.quantity} - ${item.price} DH`)
      .join('\n')

    const message = `
🎉 *Nouvelle Commande OMA Digital*

📋 *Détails de la Commande*
ID: ${body.orderId}
Client: ${body.customerName}
Email: ${body.customerEmail}
Téléphone: ${body.customerPhone}

📦 *Articles*
${itemsList}

💰 *Total: ${body.total} DH*

📍 *Adresse de Livraison*
${body.shippingAddress.address}
${body.shippingAddress.city}, ${body.shippingAddress.postalCode}
${body.shippingAddress.country}

✅ Commande reçue et en traitement
`.trim()

    // Envoyer via CallMeBot API
    const encodedMessage = encodeURIComponent(message)
    const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${CALLMEBOT_PHONE}&text=${encodedMessage}&apikey=${CALLMEBOT_API_KEY}`

    const response = await fetch(callmebotUrl)

    if (!response.ok) {
      console.error('Erreur CallMeBot:', await response.text())
      // Ne pas bloquer si WhatsApp échoue
    } else {
      console.log('Notification WhatsApp envoyée avec succès')
    }

    // Envoyer email de confirmation via Supabase
    try {
      const emailMessage = `
Bonjour ${body.customerName},

Merci pour votre commande! Voici les détails:

📋 Numéro de Commande: ${body.orderId}

📦 Articles:
${body.items.map((item) => `• ${item.title} x${item.quantity} - ${item.price} DH`).join('\n')}

💰 Total: ${body.total} DH

📍 Adresse de Livraison:
${body.shippingAddress.address}
${body.shippingAddress.city}, ${body.shippingAddress.postalCode}
${body.shippingAddress.country}

💳 Paiement:
• Avance (50%): ${body.total * 0.5} DH
• À la livraison (50%): ${body.total * 0.5} DH

Nous vous contacterons bientôt pour confirmer votre commande.

Cordialement,
OMA Digital
      `.trim()

      // Utiliser la fonction Supabase pour envoyer l'email
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: body.customerEmail,
          subject: `Confirmation de commande - ${body.orderId}`,
          html: emailMessage.replace(/\n/g, '<br>'),
        },
      })

      if (emailError) {
        console.error('Erreur envoi email:', emailError)
        // Ne pas bloquer si l'email échoue
      } else {
        console.log('Email de confirmation envoyé')
      }
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError)
      // Ne pas bloquer si l'email échoue
    }

    return NextResponse.json(
      { message: 'Notifications envoyées' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de la notification:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi de la notification' },
      { status: 500 }
    )
  }
}
