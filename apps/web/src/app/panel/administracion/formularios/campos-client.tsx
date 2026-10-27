"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Seccion = {
  id: string;
  clave: string;
  titulo: string;
  activa: boolean;
  orden: number;
};

type TipoCampo =
  | "texto"
  | "texto_largo"
  | "numero"
  | "fecha"
  | "seleccion"
  | "casilla"
  | "lista";

type Campo = {
  id: string;
  seccion_id: string;
  clave: string;
  etiqueta: string;
  descripcion: string | null;
  tipo: TipoCampo;
  opciones: string[];
  requerido: boolean;
  orden: number;
  activo: boolean;
};

const TIPOS: { value: TipoCampo; label: string }[] = [
  { value: "texto", label: "Texto breve" },
  { value: "texto_largo", label: "Texto largo" },
  { value: "numero", label: "Número" },
  { value: "fecha", label: "Fecha" },
  { value: "seleccion", label: "Selección de una opción" },
  { value: "casilla", label: "Casilla de verificación" },
  { value: "lista", label: "Lista de opciones" },
];

const CAMPO_VACIO = {
  seccion_id: "",
  clave: "",
  etiqueta: "",
  descripcion: "",
  tipo: "texto" as TipoCampo,
  opcionesTexto: "",
  requerido: false,
  orden: 0,
  activo: true,
};

export default function CamposClient() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [campos, setCampos] = useState<Campo[]>([]);
  const [formulario, setFormulario] = useState({ ...CAMPO_VACIO });
  const [campoEditando, setCampoEditando] = useState<string | null>(null);
  const [filtroSeccion, setFiltroSeccion] = useState("todas");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const supabase = createSupabaseBrowserClient();

  const cargarDatos = useCallback(async () => {
    const [seccionesResult, camposResult] = await Promise.all([
      supabase
        .from("secciones_formulario")
        .select("id, clave, titulo, activa, orden")
        .order("orden", { ascending: true }),
      supabase
        .from("campos_formulario")
        .select(
          "id, seccion_id, clave, etiqueta, descripcion, tipo, opciones, requerido, orden, activo",
        )
        .order("orden", { ascending: true }),
    ]);

    setError("");

    if (seccionesResult.error) {
      setError(`No se pudieron cargar las secciones: ${seccionesResult.error.message}`);
    } else {
      setSecciones(seccionesResult.data ?? []);
    }

    if (camposResult.error) {
      setError(`No se pudieron cargar los campos: ${camposResult.error.message}`);
    } else {
      setCampos((camposResult.data ?? []) as Campo[]);
    }

    setCargando(false);
  }, [supabase]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      void cargarDatos();
    }, 0);

    return () => window.clearTimeout(temporizador);
  }, [cargarDatos]);

  function cambiar<K extends keyof typeof CAMPO_VACIO>(
    clave: K,
    valor: (typeof CAMPO_VACIO)[K],
  ) {
    setFormulario((actual) => ({ ...actual, [clave]: valor }));
  }

  function limpiarFormulario() {
    setFormulario({
      ...CAMPO_VACIO,
      seccion_id: secciones.find((s) => s.activa)?.id ?? "",
    });
    setCampoEditando(null);
  }

  function editarCampo(campo: Campo) {
    setCampoEditando(campo.id);
    setFormulario({
      seccion_id: campo.seccion_id,
      clave: campo.clave,
      etiqueta: campo.etiqueta,
      descripcion: campo.descripcion ?? "",
      tipo: campo.tipo,
      opcionesTexto: Array.isArray(campo.opciones)
        ? campo.opciones.join("\n")
        : "",
      requerido: campo.requerido,
      orden: campo.orden,
      activo: campo.activo,
    });
    setMensaje("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function guardarCampo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError("");

    const necesitaOpciones =
      formulario.tipo === "seleccion" || formulario.tipo === "lista";

    const opciones = necesitaOpciones
      ? formulario.opcionesTexto
          .split("\n")
          .map((opcion) => opcion.trim())
          .filter(Boolean)
      : formulario.tipo === "casilla"
        ? ["Sí"]
        : [];

    if (necesitaOpciones && opciones.length < 2) {
      setError("Para selección o lista, ingresa al menos dos opciones, una por línea.");
      setGuardando(false);
      return;
    }

    const datos = {
      seccion_id: formulario.seccion_id,
      clave: formulario.clave.trim(),
      etiqueta: formulario.etiqueta.trim(),
      descripcion: formulario.descripcion.trim() || null,
      tipo: formulario.tipo,
      opciones,
      requerido: formulario.requerido,
      orden: Number(formulario.orden) || 0,
      activo: formulario.activo,
    };

    const resultado = campoEditando
      ? await supabase
          .from("campos_formulario")
          .update(datos)
          .eq("id", campoEditando)
      : await supabase.from("campos_formulario").insert(datos);

    if (resultado.error) {
      setError(
        resultado.error.code === "23505"
          ? "Ya existe un campo con esa clave. Utiliza una clave diferente."
          : `No se pudo guardar el campo: ${resultado.error.message}`,
      );
      setGuardando(false);
      return;
    }

    setMensaje(campoEditando ? "Campo actualizado correctamente." : "Campo creado correctamente.");
    limpiarFormulario();
    await cargarDatos();
    setGuardando(false);
  }

  async function cambiarEstado(campo: Campo) {
    setError("");
    setMensaje("");

    const { error: errorActualizacion } = await supabase
      .from("campos_formulario")
      .update({ activo: !campo.activo })
      .eq("id", campo.id);

    if (errorActualizacion) {
      setError(`No se pudo cambiar el estado: ${errorActualizacion.message}`);
      return;
    }

    setMensaje(
      campo.activo ? "Campo desactivado." : "Campo activado.",
    );
    await cargarDatos();
  }

  async function moverCampo(campo: Campo, direccion: -1 | 1) {
    const hermanos = campos
      .filter((c) => c.seccion_id === campo.seccion_id)
      .sort((a, b) => a.orden - b.orden);

    const indice = hermanos.findIndex((c) => c.id === campo.id);
    const otro = hermanos[indice + direccion];

    if (!otro) return;

    setError("");
    setMensaje("");

    const primero = await supabase
      .from("campos_formulario")
      .update({ orden: otro.orden })
      .eq("id", campo.id);

    if (primero.error) {
      setError(`No se pudo cambiar el orden: ${primero.error.message}`);
      return;
    }

    const segundo = await supabase
      .from("campos_formulario")
      .update({ orden: campo.orden })
      .eq("id", otro.id);

    if (segundo.error) {
      setError(`El orden quedó parcialmente actualizado: ${segundo.error.message}`);
      await cargarDatos();
      return;
    }

    await cargarDatos();
  }

  const camposVisibles = campos.filter(
    (campo) =>
      filtroSeccion === "todas" || campo.seccion_id === filtroSeccion,
  );

  if (cargando) {
    return <p className="p-6">Cargando administrador de campos...</p>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-bold">Administrador de campos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Define las preguntas y campos que estarán disponibles para los
          formularios de iniciativas.
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
          {error}
        </div>
      )}

      {mensaje && (
        <div role="status" className="rounded border border-green-300 bg-green-50 p-3 text-green-800">
          {mensaje}
        </div>
      )}

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-xl font-semibold">
          {campoEditando ? "Editar campo" : "Crear campo"}
        </h2>

        <form onSubmit={guardarCampo} className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Sección *</span>
            <select
              required
              value={formulario.seccion_id}
              onChange={(e) => cambiar("seccion_id", e.target.value)}
              className="w-full rounded border p-2"
            >
              <option value="">Selecciona una sección</option>
              {secciones
                .filter((seccion) => seccion.activa)
                .map((seccion) => (
                  <option key={seccion.id} value={seccion.id}>
                    {seccion.titulo}
                  </option>
                ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Tipo de campo *</span>
            <select
              required
              value={formulario.tipo}
              onChange={(e) => cambiar("tipo", e.target.value as TipoCampo)}
              className="w-full rounded border p-2"
            >
              {TIPOS.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Clave única *</span>
            <input
              required
              maxLength={100}
              pattern="[a-zA-Z][a-zA-Z0-9_]*"
              title="Comienza con una letra y utiliza solo letras, números o guion bajo."
              value={formulario.clave}
              onChange={(e) => cambiar("clave", e.target.value)}
              disabled={Boolean(campoEditando)}
              placeholder="ejemplo: objetivo_general"
              className="w-full rounded border p-2 disabled:bg-gray-100"
            />
            <span className="mt-1 block text-xs text-gray-500">
              Sin espacios; utiliza guion bajo. La clave no se puede cambiar al editar.
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Etiqueta visible *</span>
            <input
              required
              maxLength={200}
              value={formulario.etiqueta}
              onChange={(e) => cambiar("etiqueta", e.target.value)}
              placeholder="Ej.: Objetivo general de la iniciativa"
              className="w-full rounded border p-2"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-medium">Descripción o ayuda</span>
            <textarea
              rows={2}
              value={formulario.descripcion}
              onChange={(e) => cambiar("descripcion", e.target.value)}
              placeholder="Instrucciones que verá la persona que completa el formulario."
              className="w-full rounded border p-2"
            />
          </label>

          {(formulario.tipo === "seleccion" ||
            formulario.tipo === "lista") && (
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium">
                Opciones (una por línea) *
              </span>
              <textarea
                required
                rows={5}
                value={formulario.opcionesTexto}
                onChange={(e) => cambiar("opcionesTexto", e.target.value)}
                placeholder={"Innovación educativa\nInnovación curricular\nVinculación con el Medio"}
                className="w-full rounded border p-2"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Orden</span>
            <input
              type="number"
              min={0}
              value={formulario.orden}
              onChange={(e) => cambiar("orden", Number(e.target.value))}
              className="w-full rounded border p-2"
            />
          </label>

          <div className="flex flex-col justify-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formulario.requerido}
                onChange={(e) => cambiar("requerido", e.target.checked)}
              />
              Campo obligatorio
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formulario.activo}
                onChange={(e) => cambiar("activo", e.target.checked)}
              />
              Campo activo
            </label>
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={guardando}
              className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              {guardando
                ? "Guardando..."
                : campoEditando
                  ? "Guardar cambios"
                  : "Crear campo"}
            </button>

            {campoEditando && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded border px-4 py-2"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            Campos registrados ({camposVisibles.length})
          </h2>

          <label className="flex items-center gap-2 text-sm">
            Filtrar por sección
            <select
              value={filtroSeccion}
              onChange={(e) => setFiltroSeccion(e.target.value)}
              className="rounded border p-2"
            >
              <option value="todas">Todas las secciones</option>
              {secciones.map((seccion) => (
                <option key={seccion.id} value={seccion.id}>
                  {seccion.titulo}
                </option>
              ))}
            </select>
          </label>
        </div>

        {camposVisibles.length === 0 ? (
          <p className="rounded border p-5 text-gray-600">
            Todavía no hay campos registrados para este filtro.
          </p>
        ) : (
          <div className="space-y-3">
            {camposVisibles.map((campo) => {
              const seccion = secciones.find(
                (item) => item.id === campo.seccion_id,
              );

              const indiceEnSeccion = campos
                .filter((item) => item.seccion_id === campo.seccion_id)
                .sort((a, b) => a.orden - b.orden)
                .findIndex((item) => item.id === campo.id);

              const totalEnSeccion = campos.filter(
                (item) => item.seccion_id === campo.seccion_id,
              ).length;

              return (
                <article
                  key={campo.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{campo.etiqueta}</h3>
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                          {TIPOS.find((tipo) => tipo.value === campo.tipo)?.label ?? campo.tipo}
                        </span>
                        <span className={`rounded px-2 py-1 text-xs ${campo.activo ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                          {campo.activo ? "Activo" : "Inactivo"}
                        </span>
                        {campo.requerido && (
                          <span className="text-xs font-medium text-red-700">
                            Obligatorio
                          </span>
                        )}
                      </div>

                      <p className="mt-1 break-all text-xs text-gray-500">
                        Clave: {campo.clave} · Sección: {seccion?.titulo ?? "Sin sección"} · Orden: {campo.orden}
                      </p>

                      {campo.descripcion && (
                        <p className="mt-2 text-sm text-gray-700">
                          {campo.descripcion}
                        </p>
                      )}

                      {Array.isArray(campo.opciones) && campo.opciones.length > 0 && (
                        <p className="mt-2 text-sm text-gray-600">
                          Opciones: {campo.opciones.join(", ")}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void moverCampo(campo, -1)}
                        disabled={indiceEnSeccion <= 0}
                        title="Mover hacia arriba"
                        className="rounded border px-3 py-2 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => void moverCampo(campo, 1)}
                        disabled={indiceEnSeccion >= totalEnSeccion - 1}
                        title="Mover hacia abajo"
                        className="rounded border px-3 py-2 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => editarCampo(campo)}
                        className="rounded border px-3 py-2"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void cambiarEstado(campo)}
                        className="rounded border px-3 py-2"
                      >
                        {campo.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
