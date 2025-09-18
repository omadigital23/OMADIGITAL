import i18n from '../i18n';

describe('i18n Configuration', () => {
  it('should be configured correctly', () => {
    expect(i18n).toBeDefined();
    expect(i18n.isInitialized).toBe(true);
  });

  it('should have French as default language', () => {
    expect(i18n.language).toBe('fr');
  });

  it('should have all supported languages', () => {
    const supportedLanguages = ['fr', 'en'];
    supportedLanguages.forEach(lang => {
      expect(i18n.hasResourceBundle(lang, 'translation')).toBe(true);
    });
  });

  it('should translate basic strings', () => {
    // Test French translation
    expect(i18n.t('header.home')).toBe('Accueil');
    
    // Test English translation
    i18n.changeLanguage('en');
    expect(i18n.t('header.home')).toBe('Home');
  });

  it('should fallback to French for missing translations', () => {
    // Add a non-existent language
    i18n.changeLanguage('xx');
    
    // Should fallback to French
    expect(i18n.t('header.home')).toBe('Accueil');
  });

  it('should detect browser language', () => {
    // This test would require more complex setup to mock browser language
    // For now, we just ensure the detection is configured
    const detectionOptions = i18n.options?.detection;
    expect(detectionOptions).toBeDefined();
    expect(detectionOptions?.order).toContain('navigator');
  });
});