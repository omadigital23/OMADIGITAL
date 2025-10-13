import { Star } from 'lucide-react';

export default function ClientTestimonials() {
  const testimonials = [
    {
      name: "Amadou Diallo",
      company: "Diallo Import-Export",
      location: "Dakar, Sénégal",
      text: "Grâce à OMA Digital, mes ventes WhatsApp ont augmenté de 300%. Le chatbot gère 80% de mes commandes automatiquement.",
      rating: 5,
      avatar: "👨🏿‍💼"
    },
    {
      name: "Fatima Benali", 
      company: "Benali Cosmétiques",
      location: "Casablanca, Maroc",
      text: "Mon site se charge maintenant en 1 seconde. Mes clients sont impressionnés et mes ventes en ligne ont doublé.",
      rating: 5,
      avatar: "👩🏽‍💼"
    },
    {
      name: "Moussa Traoré",
      company: "Traoré Services",
      location: "Bamako, Mali", 
      text: "L'assistant IA d'OMA Digital répond à mes clients 24/7. Je peux enfin me concentrer sur le développement de mon business.",
      rating: 5,
      avatar: "👨🏾‍💼"
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-gray-600">Plus de 200 PME transformées en Afrique de l'Ouest</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                  <p className="text-xs text-orange-600">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-700 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}