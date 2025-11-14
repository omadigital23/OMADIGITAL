import { z } from 'zod'

export const AddToCartSchema = z.object({
  serviceId: z.string().min(1, 'Service ID requis'),
  title: z.string().min(1, 'Titre requis'),
  price: z.number().positive('Le prix doit être positif'),
  quantity: z.number().int().positive('La quantité doit être positive'),
})

export const UpdateCartItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID requis'),
  quantity: z.number().int().positive('La quantité doit être positive'),
})

export const CheckoutSchema = z.object({
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Le téléphone est requis'),
  address: z.string().min(5, 'L\'adresse est requise'),
  city: z.string().min(2, 'La ville est requise'),
  postalCode: z.string().min(2, 'Le code postal est requis'),
  country: z.string().min(2, 'Le pays est requis'),
})

export type AddToCartInput = z.infer<typeof AddToCartSchema>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
export type CheckoutInput = z.infer<typeof CheckoutSchema>
