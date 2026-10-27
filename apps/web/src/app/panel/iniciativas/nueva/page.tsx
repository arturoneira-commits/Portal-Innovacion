"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type TipoCampo =
  | "texto"
  | "texto_largo"
  | "numero"
  | "fecha"
  | "seleccion"
  | "casilla"
  | "lista";

type SeccionFormulario = {
  id: string;
  clave: string;
  titulo: string;
  orden: number;
};

type CampoFormulario = {
  id: string;
  seccion_id: string;
  clave: string;
  etiqueta: string;
  tipo: TipoCampo;
  opciones: unknown;
  requerido: boolean;
  orden: number;
};

type Respuesta = string | boolean | string[];
type Respuestas = Record<string, Respuesta>;

function obtenerOpciones(opciones: unknown): string[] {
  if (Array.isArray(opciones)) {
    return opciones.filter((opcion): opcion is string => typeof opcion === "string");
  }

  if (typeof opciones === "string") {
    try {
      const valor = JSON.parse(opciones);
      return Array.isArray(valor)
        ? valor.filter((opcion): opcion is string => typeof opcion === "string")
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

function crearRespuestasIniciales(campos: CampoFormulario[]): Respuestas {
  return campos.reduce<Respuestas>((acumulado, campo) => {
    acumulado[campo.clave] = campo.tipo === "casilla" ? false : campo.tipo === "lista" ? [] : "";
    return acumulado;
  }, {});
}

function tieneRespuesta(campo: CampoFormulario, respuesta: Respuesta | undefined) {
  if (campo.tipo === "casilla") return respuesta === true;
  if (campo.tipo === "lista") {
    return Array.isArray(respuesta) && respuesta.some((valor) => valor.trim() !== "");
  }

  return typeof respuesta === "string" && respuesta.trim() !== "";
}

function normalizarRespuestas(
  campos: CampoFormulario[],
  respuestas: Respuestas,
): Record<string, string | number | boolean | string[]> {
  return campos.reduce<Record<string, string | number | boolean | string[]>>(
    (acumulado, campo) => {
      const respuesta = respuestas[campo.clave];

      if (campo.tipo === "casilla") {
        acumulado[campo.clave] = respuesta === true;
        return acumulado;
      }

      if (campo.tipo === "lista") {
        acumulado[campo.clave] = Array.isArray(respuesta)
          ? respuesta.map((valor) => valor.trim()).filter(Boolean)
          : [];
        return acumulado;
      }

      const valor = typeof respuesta === "string" ? respuesta.trim() : "";

      if (campo.tipo === "numero" && valor !== "") {
        acumulado[campo.clave] = Number(valor);
        return acumulado;
      }

      acumulado[campo.clave] = valor;
      return acumulado;
    },
    {},
  );
}

export default function NuevaIniciativa() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsables, setResponsables] = useState("");
  const [unidadAcademica, setUnidadAcademica] = useState("");
  const [objetivos, setObjetivos] = useState("");

  const [secciones, setSecciones] = useState<SeccionFormulario[]>([]);
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [cargandoCampos, setCargandoCampos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarFormulario() {
      try {
        const supabase = createSupabaseBrowserClient();

        const [{ data: seccionesBD, error: errorSecciones }, { data: camposBD, error: errorCampos }] =
          await Promise.all([
            supabase
              .from("secciones_formulario")
              .select("id, clave, titulo, orden")
              .eq("activa", true)
              .order("orden"),
            supabase
              .from("campos_formulario")
              .select("id, seccion_id, clave, etiqueta, tipo, opciones, requerido, orden")
              .eq("activo", true)
              .order("orden"),
          ]);

        if (errorSecciones) throw errorSecciones;
        if (errorCampos) throw errorCampos;
        if (!activo) return;

        const seccionesActivas = (seccionesBD ?? []) as SeccionFormulario[];
        const camposActivos = (camposBD ?? []) as CampoFormulario[];

        setSecciones(seccionesActivas);
        setCampos(camposActivos);
        setRespuestas(crearRespuestasIniciales(camposActivos));
      } catch (e) {
        if (!activo) return;

        setError(true);
        setMensaje(
          e instanceof Error
            ? `No se pudieron cargar los campos del formulario: ${e.message}`
            : "No se pudieron cargar los campos del formulario.",
        );
      } finally {
        if (activo) setCargandoCampos(false);
      }
    }

    cargarFormulario();

    return () => {
      activo = false;
    };
  }, []);

  const seccionesConCampos = useMemo(
    () =>
      secciones
        .map((seccion) => ({
          ...seccion,
          campos: campos
            .filter((campo) => campo.seccion_id === seccion.id)
            .sort((a, b) => a.orden - b.orden),
        }))
        .filter((seccion) => seccion.campos.length > 0),
    [campos, secciones],
  );

  function actualizarRespuesta(clave: string, valor: Respuesta) {
    setRespuestas((actuales) => ({
      ...actuales,
      [clave]: valor,
    }));
  }

  function actualizarElementoLista(clave: string, indice: number, valor: string) {
    setRespuestas((actuales) => {
      const listaActual = Array.isArray(actuales[clave]) ? [...actuales[clave]] : [];
      listaActual[indice] = valor;

      return {
        ...actuales,
        [clave]: listaActual,
      };
    });
  }

  function agregarElementoLista(clave: string) {
    setRespuestas((actuales) => ({
      ...actuales,
      [clave]: [...(Array.isArray(actuales[clave]) ? actuales[clave] : []), ""],
    }));
  }

  function quitarElementoLista(clave: string, indice: number) {
    setRespuestas((actuales) => ({
      ...actuales,
      [clave]: (Array.isArray(actuales[clave]) ? actuales[clave] : []).filter(
        (_, posicion) => posicion !== indice,
      ),
    }));
  }

  async function guardarIniciativa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");
    setError(false);

    const campoPendiente = campos.find(
      (campo) => campo.requerido && !tieneRespuesta(campo, respuestas[campo.clave]),
    );

    if (campoPendiente) {
      setError(true);
      setMensaje(`Completa el campo obligatorio: ${campoPendiente.etiqueta}.`);
      document.getElementById(`campo-${campoPendiente.id}`)?.focus();
      return;
    }

    setGuardando(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const respuestasAdicionales = normalizarRespuestas(campos, respuestas);

      const { error: errorBD } = await supabase.from("iniciativas").insert({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        responsables: responsables.trim(),
        unidad_academica: unidadAcademica.trim(),
        objetivos: objetivos.trim(),
        respuestas_adicionales: respuestasAdicionales,
      });

      if (errorBD) throw errorBD;

      setMensaje("¡Iniciativa registrada correctamente!");
      setNombre("");
      setDescripcion("");
      setResponsables("");
      setUnidadAcademica("");
      setObjetivos("");
      setRespuestas(crearRespuestasIniciales(campos));
    } catch (e) {
      setError(true);
      setMensaje(
        e instanceof Error
          ? `No se pudo guardar la iniciativa: ${e.message}`
          : "No se pudo guardar la iniciativa. Revisa la conexión.",
      );
    } finally {
      setGuardando(false);
    }
  }

  const campo =
    "mt-2 w-full border border-navy/20 bg-white px-4 py-3 text-navy outline-none focus:border-navy";
  const etiqueta = "block text-sm font-medium text-navy";

  function renderCampoDinamico(campoDinamico: CampoFormulario) {
    const valor = respuestas[campoDinamico.clave];
    const id = `campo-${campoDinamico.id}`;

    if (campoDinamico.tipo === "texto_largo") {
      return (
        <textarea
          id={id}
          className={campo}
          value={typeof valor === "string" ? valor : ""}
          onChange={(event) => actualizarRespuesta(campoDinamico.clave, event.target.value)}
          rows={5}
        />
      );
    }

    if (campoDinamico.tipo === "seleccion") {
      return (
        <select
          id={id}
          className={campo}
          value={typeof valor === "string" ? valor : ""}
          onChange={(event) => actualizarRespuesta(campoDinamico.clave, event.target.value)}
        >
          <option value="">Selecciona una opción</option>
          {obtenerOpciones(campoDinamico.opciones).map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      );
    }

    if (campoDinamico.tipo === "casilla") {
      return (
        <label className="mt-3 flex items-center gap-3 text-sm text-slate" htmlFor={id}>
          <input
            id={id}
            type="checkbox"
            checked={valor === true}
            onChange={(event) => actualizarRespuesta(campoDinamico.clave, event.target.checked)}
          />
          Sí, confirmo esta respuesta.
        </label>
      );
    }

    if (campoDinamico.tipo === "lista") {
      const elementos = Array.isArray(valor) ? valor : [];

      return (
        <div className="mt-2 space-y-3">
          {elementos.map((elemento, indice) => (
            <div key={`${campoDinamico.id}-${indice}`} className="flex gap-2">
              <input
                id={indice === 0 ? id : undefined}
                className={campo}
                value={elemento}
                onChange={(event) =>
                  actualizarElementoLista(campoDinamico.clave, indice, event.target.value)
                }
              />
              <button
                type="button"
                onClick={() => quitarElementoLista(campoDinamico.clave, indice)}
                className="mt-2 border border-red-300 px-3 py-2 text-sm text-red-700"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => agregarElementoLista(campoDinamico.clave)}
            className="border border-navy/20 px-4 py-2 text-sm text-navy hover:bg-navy/5"
          >
            Agregar elemento
          </button>
        </div>
      );
    }

    return (
      <input
        id={id}
        type={campoDinamico.tipo === "numero" ? "number" : campoDinamico.tipo === "fecha" ? "date" : "text"}
        className={campo}
        value={typeof valor === "string" ? valor : ""}
        onChange={(event) => actualizarRespuesta(campoDinamico.clave, event.target.value)}
      />
    );
  }

  return (
    <>
      <header className="border-b border-navy/15 bg-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-serif text-xl text-navy">
            Portal de Innovación
          </Link>
          <Link href="/panel" className="text-sm text-slate hover:text-navy">
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
            Registra una experiencia que busque mejorar los procesos de enseñanza y aprendizaje.
          </p>

          <form
            onSubmit={guardarIniciativa}
            className="mt-8 space-y-8 border border-navy/15 bg-white p-6 sm:p-8"
          >
            <section className="space-y-6">
              <h2 className="font-serif text-2xl text-navy">Datos principales</h2>

              <div>
                <label htmlFor="nombre" className={etiqueta}>
                  Nombre de la iniciativa *
                </label>
                <input id="nombre" className={campo} value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={200} />
              </div>

              <div>
                <label htmlFor="descripcion" className={etiqueta}>
                  Descripción de la iniciativa *
                </label>
                <textarea id="descripcion" className={campo} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} required />
              </div>

              <div>
                <label htmlFor="responsables" className={etiqueta}>
                  Responsable(s) *
                </label>
                <input id="responsables" className={campo} value={responsables} onChange={(e) => setResponsables(e.target.value)} required maxLength={500} />
              </div>

              <div>
                <label htmlFor="unidadAcademica" className={etiqueta}>
                  Carrera o unidad académica *
                </label>
                <input id="unidadAcademica" className={campo} value={unidadAcademica} onChange={(e) => setUnidadAcademica(e.target.value)} required maxLength={200} />
              </div>

              <div>
                <label htmlFor="objetivos" className={etiqueta}>
                  Objetivos *
                </label>
                <textarea id="objetivos" className={campo} value={objetivos} onChange={(e) => setObjetivos(e.target.value)} rows={4} required />
              </div>
            </section>

            {cargandoCampos ? (
              <p className="text-sm text-slate">Cargando campos configurados…</p>
            ) : (
              seccionesConCampos.map((seccion) => (
                <section key={seccion.id} className="space-y-6 border-t border-navy/10 pt-8">
                  <h2 className="font-serif text-2xl text-navy">{seccion.titulo}</h2>

                  {seccion.campos.map((campoDinamico) => (
                    <div key={campoDinamico.id}>
                      <label htmlFor={`campo-${campoDinamico.id}`} className={etiqueta}>
                        {campoDinamico.etiqueta}
                        {campoDinamico.requerido ? " *" : ""}
                      </label>
                      {renderCampoDinamico(campoDinamico)}
                    </div>
                  ))}
                </section>
              ))
            )}

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
                disabled={guardando || cargandoCampos}
                className="bg-navy px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar iniciativa"}
              </button>
              <Link href="/panel" className="border border-navy/20 px-6 py-3 text-sm text-navy hover:bg-navy/5">
                Cancelar
              </Link>
            </div>

            <p className="text-xs leading-relaxed text-slate">
              Los campos marcados con * son obligatorios.
            </p>
          </form>
        </div>
      </main>
    </>
  );
}
