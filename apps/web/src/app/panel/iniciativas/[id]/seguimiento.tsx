 "use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const ETAPAS = [
  "Identificar",
  "Diseñar",
  "Experimentar",
  "Acompañar",
  "Evaluar",
  "Aprender",
  "Transferir",
  "Retroalimentar",
];

type Seguimiento = {
  id: string;
  fecha: string;
  etapa: string;
  responsable: string;
  avances: string;
  dificultades: string | null;
  acuerdos: string | null;
  proximos_pasos: string | null;
  creado_en: string;
};

export default function SeguimientoIniciativa({
  iniciativaId,
}: {
  iniciativaId: string;
}) {
  const [registros, setRegistros] = useState<Seguimiento[]>([]);
  const [fecha, setFecha] = useState(
    new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Santiago",
    })
  );
  const [etapa, setEtapa] = useState("Identificar");
  const [responsable, setResponsable] = useState("");
  const [avances, setAvances] = useState("");
  const [dificultades, setDificultades] = useState("");
  const [acuerdos, setAcuerdos] = useState("");
  const [proximosPasos, setProximosPasos] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarRegistros = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error: consultaError } = await supabase
      .from("seguimientos_iniciativas")
      .select(
        "id, fecha, etapa, responsable, avances, dificultades, acuerdos, proximos_pasos, creado_en"
      )
      .eq("iniciativa_id", iniciativaId)
      .order("fecha", { ascending: false })
      .order("creado_en", { ascending: false });

    if (consultaError) {
      setError("No se pudo cargar el historial: " + consultaError.message);
    } else {
      setRegistros((data ?? []) as Seguimiento[]);
    }
    setCargando(false);
  }, [iniciativaId]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void cargarRegistros();
    }, 0);

    return () => window.clearTimeout(temporizador);
  }, [cargarRegistros]);

  async function guardarSeguimiento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      setError("Tu sesión no está activa. Inicia sesión nuevamente.");
      setGuardando(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("seguimientos_iniciativas")
      .insert({
        iniciativa_id: iniciativaId,
        fecha,
        etapa,
        responsable: responsable.trim(),
        avances: avances.trim(),
        dificultades: dificultades.trim() || null,
        acuerdos: acuerdos.trim() || null,
        proximos_pasos: proximosPasos.trim() || null,
      });

    if (insertError) {
      setError("No se pudo guardar el seguimiento: " + insertError.message);
      setGuardando(false);
      return;
    }

    setMensaje("Seguimiento guardado correctamente.");
    setResponsable("");
    setAvances("");
    setDificultades("");
    setAcuerdos("");
    setProximosPasos("");
    await cargarRegistros();
    setGuardando(false);
  }

  return (
    <section className="mt-10">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold">
        Seguimiento
      </p>
      <h2 className="mt-2 font-serif text-2xl text-navy">
        Historial de la iniciativa
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate">
        Registra los avances y acuerdos sin perder los seguimientos anteriores.
      </p>

      <form
        onSubmit={guardarSeguimiento}
        className="mt-6 space-y-5 border border-navy/15 bg-white p-5 sm:p-6"
      >
        <h3 className="font-serif text-xl text-navy">
          Registrar nuevo seguimiento
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate">
            Fecha
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full border border-navy/20 bg-white px-3 py-2 text-navy"
            />
          </label>

          <label className="block text-sm text-slate">
            Etapa
            <select
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              className="mt-1 block w-full border border-navy/20 bg-white px-3 py-2 text-navy"
            >
              {ETAPAS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm text-slate">
          Responsable
          <input
            required
            value={responsable}
            onChange={(e) => setResponsable(e.target.value)}
            placeholder="Nombre de quien realiza el seguimiento"
            className="mt-1 block w-full border border-navy/20 px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-slate">
          Avances
          <textarea
            required
            rows={3}
            value={avances}
            onChange={(e) => setAvances(e.target.value)}
            placeholder="¿Qué se ha realizado desde el último seguimiento?"
            className="mt-1 block w-full border border-navy/20 px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-slate">
          Dificultades
          <textarea
            rows={2}
            value={dificultades}
            onChange={(e) => setDificultades(e.target.value)}
            className="mt-1 block w-full border border-navy/20 px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-slate">
          Acuerdos
          <textarea
            rows={2}
            value={acuerdos}
            onChange={(e) => setAcuerdos(e.target.value)}
            className="mt-1 block w-full border border-navy/20 px-3 py-2 text-navy"
          />
        </label>

        <label className="block text-sm text-slate">
          Próximos pasos
          <textarea
            rows={2}
            value={proximosPasos}
            onChange={(e) => setProximosPasos(e.target.value)}
            className="mt-1 block w-full border border-navy/20 px-3 py-2 text-navy"
          />
        </label>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {mensaje && <p role="status" className="text-sm text-green-700">{mensaje}</p>}

        <button
          type="submit"
          disabled={guardando}
          className="bg-navy px-5 py-3 text-sm text-paper hover:opacity-90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar seguimiento"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        <h3 className="font-serif text-xl text-navy">Registros anteriores</h3>
        {cargando ? (
          <p className="text-sm text-slate">Cargando historial...</p>
        ) : registros.length === 0 ? (
          <p className="border border-navy/15 bg-white p-5 text-sm text-slate">
            Todavía no hay seguimientos registrados para esta iniciativa.
          </p>
        ) : (
          registros.map((registro) => (
            <article key={registro.id} className="border border-navy/15 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-serif text-lg text-navy">{registro.etapa}</h4>
                <span className="text-sm text-slate">
                  {new Date(`${registro.fecha}T12:00:00`).toLocaleDateString("es-CL", {
                    timeZone: "America/Santiago",
                  })}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate">
                Responsable: {registro.responsable}
              </p>
              {[
                ["Avances", registro.avances],
                ["Dificultades", registro.dificultades],
                ["Acuerdos", registro.acuerdos],
                ["Próximos pasos", registro.proximos_pasos],
              ].map(([titulo, texto]) =>
                texto ? (
                  <div key={titulo} className="mt-4">
                    <h5 className="text-sm font-semibold text-navy">{titulo}</h5>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate">
                      {texto}
                    </p>
                  </div>
                ) : null
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
