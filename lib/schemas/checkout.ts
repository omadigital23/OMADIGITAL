import { z } from 'zod'

export const CartItemSchema = z.object({
  serviceId: z.string().min(1, 'Service ID requis'),
  title: z.string().min(1, 'Titre requis'),
  price: z.number().positive('Prix doit être positif'),
  quantity: z.number().int().positive('Quantité doit être positive'),
  id: z.string().optional(),
  addedAt: z.union([z.date(), z.string()]).optional(),
})

export const ShippingInfoSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis').max(50),
  lastName: z.string().min(1, 'Nom requis').max(50),
  email: z.string().email('Email invalide'),
  phone: z.string()
    .min(1, 'Téléphone requis')
    .max(30)
    .regex(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Format téléphone invalide'),
  address: z.string().min(1, 'Adresse requise').max(100),
  city: z.string().min(1, 'Ville requise').max(50),
  postalCode: z.string().min(1, 'Code postal requis').max(20),
  country: z.string().min(1, 'Pays requis').max(50),
})

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'Au moins un article requis'),
  total: z.number().positive('Total doit être positif'),
  shippingInfo: ShippingInfoSchema,
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type CartItem = z.infer<typeof CartItemSchema>
export type ShippingInfo = z.infer<typeof ShippingInfoSchema>
