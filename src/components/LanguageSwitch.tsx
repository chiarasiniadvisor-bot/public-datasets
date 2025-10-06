import { Button } from "@/components/ui/button";
import i18n from "@/i18n";
import { useEffect, useState } from "react";

export function LanguageSwitch() {
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const h = (l: string) => setLang(l);
    i18n.on("languageChanged", h);
    return () => i18n.off("languageChanged", h);
  }, []);

  const toggle = () => {
    const next = lang.startsWith("it") ? "es" : "it";
    i18n.changeLanguage(next);
    try { localStorage.setItem("lang", next); } catch {}
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-label="Switch language"
      className="font-semibold"
      title={lang.startsWith("it") ? "Cambiar a Español" : "Passa a Italiano"}
    >
      {lang.startsWith("it") ? "ES" : "IT"}
    </Button>
  );
}
