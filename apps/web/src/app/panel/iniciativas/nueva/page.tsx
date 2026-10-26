"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function NuevaIniciativa() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsables, setResponsables] = useState("");
  const [unidadAcademica, setUnidadAcademica] = useState("");
  const [objetivos, setObjetivos] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  async function guardarIniciativa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");
    setError(false);

    setGuardando(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: errorBD } = await supabase
        .from("iniciativas")
        .insert({
          nombre: nombre.trim(),
          descripcion: descripcion.trim(),
          responsables: responsables.trim(),
          unidad_academica: unidadAcademica.trim(),
          objetivos: objetivos.trim(),
        });

      if (errorBD) throw errorBD;

      setMensaje("¡Iniciativa registrada correctamente!");
      setNombre("");
      setDescripcion("");
      setResponsables("");
      setUnidadAcademica("");
      setObjetivos("");
    } catch (e) {
      setError(true);
      setMensaje(
        e instanceof Error
          ? `No se pudo guardar la iniciativa: ${e.message}`
          : "No se pudo guardar la iniciativa. Revisa la conexión."
      );
    } finally {
      setGuardando(false);
    }
  }

  const campo =
    "mt-2 w-full border border-navy/20 bg-white px-4 py-3 text-navy outline-none focus:border-navy";
  const etiqueta = "block text-sm font-medium text-navy";

  return (
    <>
      <header className="border-b border-navy/15 bg-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-serif text-xl text-navy">
            Portal de Innovación
          </Link>
          <Link
            href="/panel"
            className="text-sm text-slate hover:text-navy"
          >
            Volver al panel
          </Link>
        </div>
      </header>

      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            Gestión institucional
          </p>
          <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
            Registrar iniciativa
          </h1>
          <p className="mt-3 leading-relaxed text-slate">
            Registra una experiencia que busque mejorar los procesos de
            enseñanza y aprendizaje.
          </p>

          <form
            onSubmit={guardarIniciativa}
            className="mt-8 space-y-6 border border-navy/15 bg-white p-6 sm:p-8"
          >
            <div>
              <label htmlFor="nombre" className={etiqueta}>
                Nombre de la iniciativa *
              </label>
              <input
                id="nombre"
                name="nombre"
                className={campo}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej.: Evaluación auténtica de aprendizajes"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="descripcion" className={etiqueta}>
                Descripción de la iniciativa *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                className={campo}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe la necesidad educativa, el problema o la oportunidad de mejora."
                rows={4}
                required
              />
            </div>

            <div>
              <label htmlFor="responsables" className={etiqueta}>
                Responsable(s) *
              </label>
              <input
                id="responsables"
                name="responsables"
                className={campo}
                value={responsables}
                onChange={(e) => setResponsables(e.target.value)}
                placeholder="Nombre del docente y equipo colaborador"
                required
                maxLength={500}
              />
            </div>

            <div>
              <label htmlFor="unidadAcademica" className={etiqueta}>
                Carrera o unidad académica *
              </label>
              <input
                id="unidadAcademica"
                name="unidadAcademica"
                className={campo}
                value={unidadAcademica}
                onChange={(e) => setUnidadAcademica(e.target.value)}
                placeholder="Ej.: Carrera, facultad o departamento"
                required
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="objetivos" className={etiqueta}>
                Objetivos *
              </label>
              <textarea
                id="objetivos"
                name="objetivos"
                className={campo}
                value={objetivos}
                onChange={(e) => setObjetivos(e.target.value)}
                placeholder="Indica qué se espera mejorar, desarrollar o conseguir."
                rows={4}
                required
              />
            </div>

            {mensaje && (
              <p
                role="status"
                aria-live="polite"
                className={`border p-4 text-sm ${
                  error
                    ? "border-red-300 bg-red-50 text-red-800"
                    : "border-green-300 bg-green-50 text-green-800"
                }`}
              >
                {mensaje}
              </p>
            )}

            <div className="flex flex-wrap gap-3 border-t border-navy/10 pt-5">
              <button
                type="submit"
                disabled={guardando}
                className="bg-navy px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar iniciativa"}
              </button>
              <Link
                href="/panel"
                className="border border-navy/20 px-6 py-3 text-sm text-navy hover:bg-navy/5"
              >
                Cancelar
              </Link>
            </div>

            <p className="text-xs leading-relaxed text-slate">
              Los campos marcados con * son obligatorios. El registro se
              guardará en la base de datos cuando la conexión esté configurada.
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
