export interface CartItem {
  id: string
  serviceId: string
  title: string
  price: number
  quantity: number
  addedAt: Date
}

export interface Cart {
  items: CartItem[]
  total: number
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  createdAt: Date
  updatedAt: Date
}
