import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n.use(LanguageDetector).init({
    resources: {
        en: {
            translations: {
                'TRYING TO CONNECT TO SISYFOS SERVER':
                    'TRYING TO CONNECT TO SISYFOS SERVER',
                VO: 'VO',
                PFL: 'PFL',
                'CUE NEXT': 'CUE NEXT',
                PST: 'PST',
            },
        },
        nn: {
            translations: {
                VO: 'STK',
            },
        },
    },
    whitelist: ['en', 'nn'],
    fallbackLng: 'en',
    debug: true,

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    keySeparator: false, // we use content as keys

    interpolation: {
        escapeValue: false, // not needed for react!!
        formatSeparator: ',',
    },

    react: {
        wait: true,
    },
})

export default i18n
