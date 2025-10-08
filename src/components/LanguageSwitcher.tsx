import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher: React.FC = () => {
  let t = (k: string) => k;
  let i18n: any = { language: "it", changeLanguage: () => {} };

  try {
    const hook = useTranslation();
    t = hook.t;
    i18n = hook.i18n;
  } catch (e) {
    // fallback: do nothing, prevents runtime crash
    console.warn("i18n not initialized yet, using fallback LanguageSwitcher");
  }

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      i18n.changeLanguage?.(e.target.value);
    } catch {
      /* no-op */
    }
  };

  const current = i18n?.language || "it";

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2">
        <span className="text-sm opacity-70">{t("actions.language")}:</span>
        <select 
          value={current} 
          onChange={onChange}
          className="text-sm px-2 py-1 rounded border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="it">IT</option>
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
      </label>
    </div>
  );
};

export default LanguageSwitcher;
