// ============================================================
// OMA Digital — WhatsApp Notifications (CallMeBot)
// ============================================================

export async function sendWhatsAppNotification(message: string): Promise<boolean> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_API_KEY;

  if (!phone || !apiKey) {
    console.warn('CallMeBot not configured, skipping WhatsApp notification');
    return false;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return false;
  }
}

export function buildLeadWhatsAppMessage(lead: {
  name: string;
  email: string;
  phone: string;
  business?: string;
  service?: string;
}): string {
  return `🎯 *Nouveau Lead OMA Digital*
  
👤 ${lead.name}
📧 ${lead.email}
📱 ${lead.phone}
${lead.business ? `🏢 ${lead.business}` : ''}
${lead.service ? `🔧 ${lead.service}` : ''}

⏰ ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })}`;
}
