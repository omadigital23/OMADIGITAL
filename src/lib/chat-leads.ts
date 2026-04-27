import type { ChatLocale, LeadInsights } from '@/lib/chatbot';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { isValidEmail, isValidPhone } from '@/lib/security';

function buildLeadMessage(insights: LeadInsights, locale: ChatLocale): string {
  const lines = [
    locale === 'en' ? 'Source: Chatbot' : 'Source : Chatbot',
    insights.projectSummary
      ? `${locale === 'en' ? 'Summary' : 'Resume'}: ${insights.projectSummary}`
      : null,
    insights.budget
      ? `${locale === 'en' ? 'Budget' : 'Budget'}: ${insights.budget}`
      : null,
    insights.latestUserMessage
      ? `${locale === 'en' ? 'Latest message' : 'Dernier message'}: ${insights.latestUserMessage}`
      : null,
  ].filter(Boolean);

  return lines.join('\n');
}

export async function persistQualifiedChatLead(
  insights: LeadInsights,
  locale: ChatLocale
): Promise<boolean> {
  if (!insights.name || !insights.email || !insights.phone) {
    return false;
  }

  if (!isValidEmail(insights.email) || !isValidPhone(insights.phone)) {
    return false;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return false;
  }

  const { data: existingLead, error: lookupError } = await supabase
    .from('leads')
    .select('id')
    .eq('email', insights.email)
    .limit(1);

  if (lookupError) {
    console.error('Chat lead lookup error:', lookupError);
    return false;
  }

  if (existingLead && existingLead.length > 0) {
    return false;
  }

  const { error } = await supabase.from('leads').insert({
    name: insights.name,
    email: insights.email,
    phone: insights.phone,
    business_type: insights.businessType,
    message: buildLeadMessage(insights, locale),
    service: insights.service,
    source: 'chatbot',
  });

  if (error) {
    console.error('Chat lead insert error:', error);
    return false;
  }

  return true;
}
