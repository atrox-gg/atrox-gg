/* ATROX — the only page interaction: RU/EN and the native resources disclosure. */
(() => {
  'use strict';

  const root = document.documentElement;
  if (root.dataset.atroxInitialized === 'true') return;
  root.dataset.atroxInitialized = 'true';

  const translations = {
    ru: {
      pageTitle: 'ATROX — Ресурсы',
      description: 'Официальные профили ATROX: Telegram, GitHub, TikTok, Reddit, Spotify, SoundCloud и Pinterest.',
      'a11y.skip': 'Перейти к ресурсам',
      'brand.resources': 'ATROX — к ресурсам',
      'nav.label': 'Навигация',
      'nav.resources': 'РЕСУРСЫ',
      'language.label': 'Текущий язык: русский. Переключить на английский',
      'resources.title': 'Ресурсы',
      'resources.primary': 'Основные ресурсы',
      'resources.secondary': 'Другие профили',
      'resources.more.show': 'Дополнительные ресурсы',
      'resources.more.hide': 'Скрыть дополнительные ресурсы',
      'resources.lolzteam': 'Профиль Lolzteam'
    },
    en: {
      pageTitle: 'ATROX — Resources',
      description: 'Official ATROX profiles: Telegram, GitHub, TikTok, Reddit, Spotify, SoundCloud, and Pinterest.',
      'a11y.skip': 'Skip to resources',
      'brand.resources': 'ATROX — go to resources',
      'nav.label': 'Navigation',
      'nav.resources': 'RESOURCES',
      'language.label': 'Current language: English. Switch to Russian',
      'resources.title': 'Resources',
      'resources.primary': 'Primary resources',
      'resources.secondary': 'Other profiles',
      'resources.more.show': 'Additional resources',
      'resources.more.hide': 'Hide additional resources',
      'resources.lolzteam': 'Lolzteam profile'
    }
  };

  const languageToggle = document.querySelector('[data-language-toggle]');
  const translatedElements = document.querySelectorAll('[data-i18n]');
  const labelledElements = document.querySelectorAll('[data-i18n-aria-label]');
  const details = document.querySelector('.resource-more');
  const detailsLabel = details?.querySelector('.resource-more__label');
  const detailsList = details?.querySelector('ul');
  const descriptionMeta = document.querySelector('meta[name="description"]');
  let currentLanguage = 'ru';

  function getSavedLanguage() {
    try {
      const saved = window.localStorage.getItem('atrox-language');
      return saved === 'en' || saved === 'ru' ? saved : 'ru';
    } catch (_error) {
      return 'ru';
    }
  }

  function updateDetailsText() {
    if (detailsLabel) {
      const key = details?.open ? 'resources.more.hide' : 'resources.more.show';
      detailsLabel.dataset.i18n = key;
      detailsLabel.textContent = translations[currentLanguage][key];
    }
    if (detailsList) {
      detailsList.setAttribute('aria-label', translations[currentLanguage]['resources.lolzteam']);
    }
  }

  function setLanguage(language, persist = false) {
    currentLanguage = Object.hasOwn(translations, language) ? language : 'ru';
    const dictionary = translations[currentLanguage];

    root.lang = currentLanguage;
    document.title = dictionary.pageTitle;

    translatedElements.forEach((element) => {
      const value = dictionary[element.dataset.i18n];
      if (typeof value === 'string') element.textContent = value;
    });

    labelledElements.forEach((element) => {
      const value = dictionary[element.dataset.i18nAriaLabel];
      if (typeof value === 'string') element.setAttribute('aria-label', value);
    });

    if (descriptionMeta) descriptionMeta.content = dictionary.description;

    if (languageToggle) {
      languageToggle.disabled = false;
      languageToggle.dataset.currentLanguage = currentLanguage;
      languageToggle.setAttribute('aria-pressed', String(currentLanguage === 'en'));
    }

    updateDetailsText();

    if (persist) {
      try {
        window.localStorage.setItem('atrox-language', currentLanguage);
      } catch (_error) {
        // Language switching remains available until the page is closed.
      }
    }
  }

  languageToggle?.addEventListener('click', () => {
    setLanguage(currentLanguage === 'ru' ? 'en' : 'ru', true);
  });

  details?.addEventListener('toggle', updateDetailsText);
  setLanguage(getSavedLanguage());
})();
