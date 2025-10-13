// Bundle optimization configuration
export const bundleConfig = {
  // Chunk splitting strategy
  chunks: {
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      maxSize: 244000, // 244KB
    },
    common: {
      name: 'common',
      minChunks: 2,
      maxSize: 244000,
    },
    framerMotion: {
      test: /[\\/]node_modules[\\/]framer-motion/,
      name: 'framer-motion',
      chunks: 'async',
    },
    recharts: {
      test: /[\\/]node_modules[\\/]recharts/,
      name: 'recharts',
      chunks: 'async',
    },
  },
  
  // Preload strategy
  preload: {
    critical: [
      'next/head',
      'next/image',
      'react',
      'react-dom'
    ],
    deferred: [
      'framer-motion',
      'recharts',
      '@tanstack/react-query'
    ]
  },
  
  // Tree shaking configuration
  treeShaking: {
    sideEffects: false,
    usedExports: true,
    providedExports: true
  }
};

export default bundleConfig;