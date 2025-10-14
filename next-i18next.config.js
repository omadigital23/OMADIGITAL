const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  },
  fallbackLng: {
    default: ['fr'],
  },
  localePath: path.resolve('./public/locales'),
  ns: ['common', 'legal', 'about', 'blog', 'cities'],
  defaultNS: 'common',
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  react: { useSuspense: false },
  
  /**
   * @link https://github.com/i18next/next-i18next#6-advanced-configuration
   */
  // saveMissing: false,
  // strictMode: true,
  // serializeConfig: false,
}