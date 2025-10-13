// Lightweight alternatives to heavy components
import { ReactNode, useState, useEffect } from 'react';

// Lightweight animation alternative to Framer Motion
export function SimpleAnimation({ 
  children, 
  delay = 0, 
  className = '' 
}: { 
  children: ReactNode; 
  delay?: number; 
  className?: string; 
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <div 
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Lightweight chart alternative to Recharts
export function SimpleChart({ 
  data, 
  type = 'bar',
  height = 200 
}: { 
  data: Array<{ label: string; value: number }>; 
  type?: 'bar' | 'line';
  height?: number;
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="p-4">
      <div className="flex items-end space-x-2" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className="bg-blue-500 w-full transition-all duration-500"
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: '4px'
              }}
            />
            <span className="text-xs mt-2 text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Lightweight modal alternative
export function SimpleModal({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: ReactNode; 
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className="relative bg-white p-6 rounded-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
}

// Lightweight tooltip
export function SimpleTooltip({ 
  children, 
  tooltip 
}: { 
  children: ReactNode; 
  tooltip: string; 
}) {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap">
          {tooltip}
        </div>
      )}
    </div>
  );
}