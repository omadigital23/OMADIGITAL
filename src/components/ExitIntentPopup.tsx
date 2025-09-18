import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <Gift className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Attendez ! Offre Spéciale
          </h3>
          <p className="text-gray-600 mb-6">
            Audit gratuit de votre business + 30min de consultation offerte
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => {
                window.open('https://wa.me/212701193811?text=Je veux l\'audit gratuit !', '_blank');
                setIsVisible(false);
              }}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              Réclamer l'audit gratuit
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className="w-full text-gray-500 py-2"
            >
              Non merci, je continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}