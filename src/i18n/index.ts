import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import it from "./locales/it/translation.json";
import es from "./locales/es/translation.json";
import en from "./locales/en/translation.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: it },
      es: { translation: es },
      en: { translation: en }
    },
    lng: "it",
    fallbackLng: "it",
    interpolation: { escapeValue: false }
  });

export default i18n;
