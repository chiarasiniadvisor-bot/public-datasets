import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm opacity-70">{t("actions.language")}:</span>
      <button 
        onClick={() => i18n.changeLanguage("it")} 
        className={`px-2 py-1 text-sm rounded ${i18n.language === "it" ? "bg-blue-500 text-white font-semibold" : "hover:bg-gray-100"}`}
      >
        IT
      </button>
      <span>/</span>
      <button 
        onClick={() => i18n.changeLanguage("es")} 
        className={`px-2 py-1 text-sm rounded ${i18n.language === "es" ? "bg-blue-500 text-white font-semibold" : "hover:bg-gray-100"}`}
      >
        ES
      </button>
    </div>
  );
}
