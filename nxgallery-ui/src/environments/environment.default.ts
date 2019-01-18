export const appConfig = {
  system: {
    applicationName: 'APP_NAME',
    applicationUrl: 'http://ng-seed.fulls1z3.com'
  },
  seo: {
    defaultPageTitle: 'DEFAULT_TITLE',
    pageTitlePositioning: 10,
    pageTitleSeparator: ' | ',
    defaultMetaDescription: 'DEFAULT_META_DESCRIPTION'
  },
  i18n: {
    defaultLanguage: {
      code: 'en',
      name: 'English',
      culture: 'en-US'
    },
    availableLanguages: [
      {
        code: 'en',
        name: 'English',
        culture: 'en-US'
      },
      {
        code: 'tr',
        name: 'Türkçe',
        culture: 'tr-TR'
      }
    ],
    useLocalizedRoutes: true
  },
  routes: {
    en: {
      'ROOT.ABOUT': 'about',
      'ROOT.ABOUT.US': 'us',
      'ROOT.ABOUT.BANANA': 'banana',
      'ROOT.ABOUT.APPLE': 'apple',
      'ROOT.ABOUT.APPLE.PEAR': 'pear',
      CHANGE_LANGUAGE: 'change-language'
    },
    tr: {
      'ROOT.ABOUT': 'hakkinda',
      'ROOT.ABOUT.US': 'biz',
      'ROOT.ABOUT.BANANA': 'muz',
      'ROOT.ABOUT.APPLE': 'elma',
      'ROOT.ABOUT.APPLE.PEAR': 'armut',
      CHANGE_LANGUAGE: 'dil-secimi'
    }
  },
  backend: {
    baseBrowserUrl: 'http://localhost:5200',
    baseServerUrl: 'http://localhost:4000'
  }
};
