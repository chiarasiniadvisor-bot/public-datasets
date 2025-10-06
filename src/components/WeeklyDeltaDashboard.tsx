import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  fetchDelta,
  fetchDeltaTrend,
  DeltaResponse,
  DeltaItem,
  DeltaTrendResponse,
  DeltaTrendSeries,
} from "@/lib/brevoDatasets";
import { useTranslation } from "react-i18next";

function tMetric(raw: string, t: (k: string) => string) {
  const map: Record<string, string> = {
    "Leads a CRM": t("leads"),
    "Iscritti alla Piattaforma (#6)": t("signups"),
    "Profilo completo": t("profileComplete"),
    "Corsisti": t("students"),
    "Clienti paganti": t("paying"),
  };
  return map[raw] ?? raw;
}

export function WeeklyDeltaDashboard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("it") ? "it-IT" : "es-ES";

  const fmtDateShort = (d?: string | null) => {
    if (!d) return "-";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString(locale, { day: "2-digit", month: "short" });
  };
  const pct01 = (v?: number | null) => {
    if (v == null || !isFinite(Number(v))) return "-";
    return `${(Number(v) * 100).toFixed(1)}%`;
  };
  const num = (val: number | null | undefined) => {
    if (val == null || !isFinite(Number(val))) return "-";
    return Number(val).toLocaleString(locale);
  };

  const [delta, setDelta] = useState<DeltaResponse | null>(null);
  const [trend, setTrend] = useState<DeltaTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showRate, setShowRate] = useState(false); // Toggle valori ↔ rate%

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [d, t] = await Promise.all([fetchDelta(), fetchDeltaTrend()]);
        if (!alive) return;
        setDelta(d);
        setTrend(t);
      } catch (e: any) {
        setErr(e?.message || String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Dataset a 2 settimane per i box
  const weekPrev = fmtDateShort(delta?.week_previous);
  const weekCurr = fmtDateShort(delta?.week_current);
  const cards = useMemo(() => (delta?.items ?? []).slice(0, 5), [delta]);

  // Dataset multi-settimana per line chart
  // Costruiamo per ogni metrica un array [{week, value}] usando values oppure rates*100
  type Row = { week: string; value: number | null };
  const seriesRows: Array<{ metric: string; rows: Row[] }> = useMemo(() => {
    if (!trend?.weeks?.length || !trend?.series?.length) return [];
    return trend.series.slice(0, 5).map((s: DeltaTrendSeries) => {
      const rows: Row[] = trend.weeks.map((w, i) => ({
        week: fmtDateShort(w),
        value: showRate
          ? (s.rates[i] == null ? null : Number(s.rates[i]) * 100)
          : (s.values[i] == null ? null : Number(s.values[i])),
      }));
      return { metric: s.metric, rows };
    });
  }, [trend, showRate]);

  if (loading) {
    return (
      <Card className="border-0 bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">
            Secret SSM – {t("weekly.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{t("loading")}</div>
        </CardContent>
      </Card>
    );
  }

  if (err) {
    return (
      <Card className="border-0 bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">
            Secret SSM – {t("weekly.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">{t("error")}: {err}</div>
        </CardContent>
      </Card>
    );
  }

  const periodLabel =
    trend?.weeks?.length
      ? `Dal ${fmtDateShort(trend.weeks[0])} al ${fmtDateShort(trend.weeks[trend.weeks.length - 1])}`
      : `${weekPrev} → ${weekCurr}`;

  return (
    <Card className="shadow-analytics border-0 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">
              {t("weekly.trend")}
            </CardTitle>
            <div className="text-sm text-muted-foreground">{periodLabel}</div>
          </div>

          <button
            onClick={() => setShowRate((v) => !v)}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
          >
            {showRate ? (i18n.language.startsWith("it") ? "Mostra Valori" : "Mostrar Valores") : t("weekly.showRate")}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-10">
        {/* ====== LINE CHARTS MULTI-SETTIMANA (uno per metrica) ====== */}
        {(!trend?.weeks?.length || !seriesRows.length) ? (
          <div className="text-sm text-muted-foreground">{t("noData")}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seriesRows.map(({ metric, rows }) => (
              <div key={metric} className="rounded-lg border bg-card/90 p-3">
                <div className="text-sm font-semibold mb-3">{tMetric(metric, t)}</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={rows} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="week"
                      angle={0}
                      height={30}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickFormatter={(v) => (showRate ? `${v}%` : `${v}`)}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                      formatter={(value: any) => showRate ? [`${Number(value).toFixed(1)}%`, "Rate"] : [num(Number(value)), i18n.language.startsWith("it") ? "Valore" : "Valor"]}
                      labelFormatter={(label) => `${i18n.language.startsWith("it") ? "Settimana" : "Semana"}: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-muted-foreground mt-2">
                  {showRate ? (i18n.language.startsWith("it") ? "Rate% per settimana" : "Rate% por semana") : (i18n.language.startsWith("it") ? "Valore assoluto per settimana" : "Valor absoluto por semana")}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== BOX DI CONFRONTO (2 settimane) ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(cards || []).map((it: DeltaItem) => {
            const deltaAbs = (it.delta_abs ?? ((it.current ?? 0) - (it.previous ?? 0)));
            const deltaPp  = (it.delta_pp ?? (
              it.rate_current != null && it.rate_previous != null
                ? (it.rate_current - it.rate_previous) * 100
                : null
            ));

            const posAbs = Number(deltaAbs) > 0;
            const posPp  = deltaPp != null && Number(deltaPp) > 0;

            return (
              <div key={it.metric} className="rounded-lg border bg-card/90 p-2.5 space-y-1.5">
                <div className="text-sm font-semibold">{tMetric(it.metric, t)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {fmtDateShort(delta?.week_previous)} → {fmtDateShort(delta?.week_current)}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded bg-muted/40 p-2">
                    <div className="text-[10px] text-muted-foreground">{i18n.language.startsWith("it") ? "Valore attuale" : "Valor actual"}</div>
                    <div className="text-lg font-bold">{num(it.current)}</div>
                    <div className="text-[10px] text-muted-foreground">{i18n.language.startsWith("it") ? "Prev" : "Ant"}: {num(it.previous)}</div>
                  </div>

                  <div className="rounded bg-muted/40 p-2">
                    <div className="text-[10px] text-muted-foreground">{i18n.language.startsWith("it") ? "Rate attuale" : "Rate actual"}</div>
                    <div className="text-lg font-bold">{pct01(it.rate_current)}</div>
                    <div className="text-[10px] text-muted-foreground">{i18n.language.startsWith("it") ? "Prev" : "Ant"}: {pct01(it.rate_previous)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded bg-muted/30 p-2">
                    <div className="text-[10px] text-muted-foreground">Δ {i18n.language.startsWith("it") ? "assoluto" : "absoluto"}</div>
                    <div className={`text-sm font-semibold ${posAbs ? "text-emerald-500" : "text-destructive"}`}>
                      {posAbs ? "▲" : "▼"} {num(deltaAbs as any)}
                    </div>
                  </div>

                  <div className="rounded bg-muted/30 p-2">
                    <div className="text-[10px] text-muted-foreground">Δ {i18n.language.startsWith("it") ? "punti %" : "puntos %"}</div>
                    <div className={`text-sm font-semibold ${posPp ? "text-emerald-500" : "text-destructive"}`}>
                      {posPp ? "▲" : "▼"} {deltaPp == null ? "-" : `${Number(deltaPp).toFixed(1)} pp`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
