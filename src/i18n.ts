import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  it: {
    translation: {
      "dashboard.analytics": "Analytics Dashboard",
      "weekly.title": "Delta settimanale",
      "weekly.compare": "Confronto tra {{curr}} e {{prev}}",
      "weekly.current": "Settimana corrente",
      "weekly.previous": "Settimana precedente",
      "weekly.delta": "Delta",
      "weekly.deltaPct": "Delta %",
      "weekly.trend": "Trend ultimi periodi",
      "weekly.showRate": "Mostra variazione %",
      "funnel.title": "Funnel di Conversione",
      "funnel.conversion": "Conversione",
      "leads": "Leads a CRM",
      "signups": "Iscritti alla Piattaforma",
      "profileComplete": "Profilo completo",
      "students": "Corsisti",
      "paying": "Clienti Paganti",
      "withSim": "Con simulazione",
      "withoutSim": "Senza simulazione",
      "distribution": "Distribuzione",
      "university": "Ateneo",
      "birthYear": "Anno di nascita",
      "profilingYear": "Anno di profilazione",
      "source": "Fonte",
      "crm": "CRM",
      "platform": "Piattaforma",
      "webinar": "Webinar",
      "courses": "Corsi",
      "loading": "Caricamento…",
      "error": "Errore",
      "noData": "Nessun dato disponibile.",
      "noDataWeek": "Nessun dato disponibile per questa settimana.",
      "other": "Altro",
      "unknown": "N/D",
    },
  },
  es: {
    translation: {
      "dashboard.analytics": "Panel de Analytics",
      "weekly.title": "Delta semanal",
      "weekly.compare": "Comparación entre {{curr}} y {{prev}}",
      "weekly.current": "Semana actual",
      "weekly.previous": "Semana anterior",
      "weekly.delta": "Delta",
      "weekly.deltaPct": "Delta %",
      "weekly.trend": "Tendencia últimos períodos",
      "weekly.showRate": "Mostrar variación %",
      "funnel.title": "Embudo de Conversión",
      "funnel.conversion": "Conversión",
      "leads": "Leads a CRM",
      "signups": "Registros en la Plataforma",
      "profileComplete": "Perfil completo",
      "students": "Estudiantes",
      "paying": "Clientes de Pago",
      "withSim": "Con simulación",
      "withoutSim": "Sin simulación",
      "distribution": "Distribución",
      "university": "Universidad",
      "birthYear": "Año de nacimiento",
      "profilingYear": "Año de perfilado",
      "source": "Fuente",
      "crm": "CRM",
      "platform": "Plataforma",
      "webinar": "Webinar",
      "courses": "Cursos",
      "loading": "Cargando…",
      "error": "Error",
      "noData": "No hay datos disponibles.",
      "noDataWeek": "No hay datos disponibles para esta semana.",
      "other": "Otro",
      "unknown": "N/D",
    },
  },
};

const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
const initial =
  stored ?? (typeof navigator !== "undefined" && navigator.language?.startsWith("it") ? "it" : "es");

i18n.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export default i18n;
