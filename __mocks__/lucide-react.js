// Mock for lucide-react icons
const mockIcon = ({ size, color, ...props }) => {
  return `<svg ${size ? `width="${size}" height="${size}"` : ''} ${color ? `color="${color}"` : ''} {...props}></svg>`;
};

// Export all the icons we use as mock functions
module.exports = {
  MessageCircle: mockIcon,
  X: mockIcon,
  Send: mockIcon,
  Mic: mockIcon,
  MicOff: mockIcon,
  Volume2: mockIcon,
  VolumeX: mockIcon,
  Bot: mockIcon,
  User: mockIcon,
  Phone: mockIcon,
  Mail: mockIcon,
  Zap: mockIcon,
  Loader: mockIcon,
  Loader2: mockIcon,
  Brain: mockIcon,
  ChevronRight: mockIcon,
  Play: mockIcon,
  ArrowRight: mockIcon,
  Star: mockIcon,
  Users: mockIcon,
  TrendingUp: mockIcon,
  Languages: mockIcon,
  // Add any other icons we use
};