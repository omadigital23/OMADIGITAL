import { supabaseAdmin } from '../../../lib/supabase/admin'
import AdminDashboard from './AdminDashboard'
import AdminAuth from './AdminAuth'
import { getAdminSession } from '../../../lib/auth'

interface Newsletter {
  id: string
  email: string
  status: string
  source: string
  subscribed_at: string
  confirmed_at: string | null
  segment: string
}

interface ChatbotConversation {
  id: string
  session_id: string
  user_message: string
  bot_response: string
  language: string
  input_type: string
  confidence: number | null
  sentiment: string | null
  lead_score: number | null
  created_at: string
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string
  created_at: string
}

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  created_at: string
}

async function getNewsletters(): Promise<Newsletter[]> {
  const { data, error } = await supabaseAdmin
    .from('blog_subscribers')
    .select('id, email, status, source, created_at, segment')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching newsletters:', error)
    return []
  }
  return data?.map(item => ({
    ...item,
    subscribed_at: item.created_at,
    confirmed_at: null
  })) || []
}

async function getChatbotConversations(): Promise<ChatbotConversation[]> {
  const { data, error } = await supabaseAdmin
    .from('chatbot_conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
  return data || []
}

async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, total_amount, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data || []
}

async function getContacts(): Promise<Contact[]> {
  const { data, error } = await supabaseAdmin
    .from('quotes')
    .select('id, name, email, phone, company, message, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching contacts:', error)
    return []
  }
  return data || []
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const session = getAdminSession()
  if (!session || session.role !== 'admin') {
    return <AdminAuth />
  }

  const [newsletters, conversations, contacts, orders] = await Promise.all([
    getNewsletters(),
    getChatbotConversations(),
    getContacts(),
    getOrders(),
  ])

  return (
    <AdminDashboard 
      newsletters={newsletters}
      conversations={conversations}
      contacts={contacts}
      orders={orders}
    />
  )
}