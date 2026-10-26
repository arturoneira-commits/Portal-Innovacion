"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Seccion = {
  id: string;
  clave: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  activa: boolean;
};

export default function SeccionesClient() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [clave, setClave] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const cargarSecciones = useCallback(async () => {
    setCargando(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { data: usuario } = await supabase.auth.getUser();

    if (!usuario.user) {
      setError("Tu sesión no está activa. Inicia sesión nuevamente.");
      setCargando(false);
      return;
    }

    const { data: gestor, error: errorGestor } = await supabase.rpc(
      "es_gestor_formulario"
    );

    if (errorGestor || gestor !== true) {
      setError("No tienes permisos para administrar las secciones.");
      setCargando(false);
      return;
    }

    const { data, error: errorCarga } = await supabase
      .from("secciones_formulario")
      .select("id, clave, titulo, descripcion, orden, activa")
      .order("orden", { ascending: true });

    if (errorCarga) {
      setError("No se pudieron cargar las secciones: " + errorCarga.message);
    } else {
      setSecciones(data ?? []);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    void cargarSecciones();
  }, [cargarSecciones]);

  function limpiarFormulario() {
    setEditando(null);
    setClave("");
    setTitulo("");
    setDescripcion("");
  }

  function prepararEdicion(seccion: Seccion) {
    setEditando(seccion.id);
    setClave(seccion.clave);
    setTitulo(seccion.titulo);
    setDescripcion(seccion.descripcion ?? "");
    setMensaje("");
    setError("");
  }

  async function guardarSeccion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { data: gestor, error: errorGestor } = await supabase.rpc(
      "es_gestor_formulario"
    );

    if (errorGestor || gestor !== true) {
      setError("Supabase no confirmó tus permisos de gestor.");
      setGuardando(false);
      return;
    }

    const claveNormalizada = clave.trim().toLowerCase();
    const tituloNormalizado = titulo.trim();

    if (!/^[a-z0-9_]+$/.test(claveNormalizada)) {
      setError("La clave solo puede contener letras sin tilde, números y guion bajo.");
      setGuardando(false);
      return;
    }

    if (!tituloNormalizado) {
      setError("El título es obligatorio.");
      setGuardando(false);
      return;
    }

    if (editando) {
      const { error: errorGuardar } = await supabase
        .from("secciones_formulario")
        .update({
          titulo: tituloNormalizado,
          descripcion: descripcion.trim() || null,
        })
        .eq("id", editando);

      if (errorGuardar) {
        setError("No se pudo guardar: " + errorGuardar.message);
      } else {
        setMensaje("Sección actualizada correctamente.");
        limpiarFormulario();
        await cargarSecciones();
      }
    } else {
      const siguienteOrden =
        Math.max(0, ...secciones.map((seccion) => seccion.orden)) + 1;

      const { error: errorGuardar } = await supabase
        .from("secciones_formulario")
        .insert({
          clave: claveNormalizada,
          titulo: tituloNormalizado,
          descripcion: descripcion.trim() || null,
          orden: siguienteOrden,
          activa: true,
        });

      if (errorGuardar) {
        setError("No se pudo crear la sección: " + errorGuardar.message);
      } else {
        setMensaje("Sección creada correctamente.");
        limpiarFormulario();
        await cargarSecciones();
      }
    }

    setGuardando(false);
  }

  async function cambiarEstado(seccion: Seccion) {
    setError("");
    setMensaje("");

    const supabase = createSupabaseBrowserClient();
    const { data: gestor, error: errorGestor } = await supabase.rpc(
      "es_gestor_formulario"
    );

    if (errorGestor || gestor !== true) {
      setError("No tienes permisos para cambiar el estado.");
      return;
    }

    const { error: errorActualizar } = await supabase
      .from("secciones_formulario")
      .update({ activa: !seccion.activa })
      .eq("id", seccion.id);

    if (errorActualizar) {
      setError("No se pudo cambiar el estado: " + errorActualizar.message);
    } else {
      setMensaje("Estado de la sección actualizado.");
      await cargarSecciones();
    }
  }

  async function moverSeccion(indice: number, direccion: -1 | 1) {
    const destino = indice + direccion;

    if (destino < 0 || destino >= secciones.length) return;

    setError("");
    setMensaje("");

    const actual = secciones[indice];
    const vecina = secciones[destino];

    const supabase = createSupabaseBrowserClient();
    const { data: gestor, error: errorGestor } = await supabase.rpc(
      "es_gestor_formulario"
    );

    if (errorGestor || gestor !== true) {
      setError("No tienes permisos para reordenar secciones.");
      return;
    }

    const { error: errorOrden } = await supabase
      .from("secciones_formulario")
      .update({ orden: -actual.orden })
      .eq("id", actual.id);

    if (errorOrden) {
      setError("No se pudo iniciar el cambio de orden: " + errorOrden.message);
      return;
    }

    const { error: errorVecina } = await supabase
      .from("secciones_formulario")
      .update({ orden: actual.orden })
      .eq("id", vecina.id);

    if (errorVecina) {
      setError("No se pudo completar el cambio de orden: " + errorVecina.message);
      await cargarSecciones();
      return;
    }

    const { error: errorFinal } = await supabase
      .from("secciones_formulario")
      .update({ orden: vecina.orden })
      .eq("id", actual.id);

    if (errorFinal) {
      setError("No se pudo completar el cambio de orden: " + errorFinal.message);
    } else {
      setMensaje("Orden actualizado.");
    }

    await cargarSecciones();
  }

  return (
    <section className="mt-8 space-y-8">
      <div className="border border-navy/15 bg-white p-6">
        <h2 className="font-serif text-2xl text-navy">
          {editando ? "Editar sección" : "Crear sección"}
        </h2>

        <form onSubmit={guardarSeccion} className="mt-5 space-y-4">
          <div>
            <label htmlFor="clave" className="mb-1 block text-sm text-navy">
              Clave única
            </label>
            <input
              id="clave"
              value={clave}
              onChange={(event) => setClave(event.target.value)}
              disabled={Boolean(editando) || guardando}
              required
              pattern="[a-zA-Z0-9_]+"
              title="Usa letras sin tilde, números y guion bajo."
              placeholder="ejemplo: evaluacion_final"
              className="w-full border border-navy/20 p-3 text-sm disabled:bg-slate-100"
            />
            <p className="mt-1 text-xs text-slate">
              La clave no se cambia al editar, para mantener su estabilidad.
            </p>
          </div>

          <div>
            <label htmlFor="titulo" className="mb-1 block text-sm text-navy">
              Título de la sección
            </label>
            <input
              id="titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              required
              maxLength={150}
              disabled={guardando}
              className="w-full border border-navy/20 p-3 text-sm"
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="mb-1 block text-sm text-navy">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              rows={3}
              maxLength={1000}
              disabled={guardando}
              className="w-full border border-navy/20 p-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="bg-navy px-5 py-3 text-sm text-white disabled:opacity-50"
            >
              {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear sección"}
            </button>

            {editando && (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="border border-navy/20 px-5 py-3 text-sm text-navy"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </div>

      {mensaje && (
        <p role="status" className="border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          {mensaje}
        </p>
      )}

      {error && (
        <p role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </p>
      )}

      <div>
        <h2 className="font-serif text-2xl text-navy">Secciones registradas</h2>
        {cargando ? (
          <p className="mt-4 text-sm text-slate">Cargando secciones...</p>
        ) : secciones.length === 0 ? (
          <p className="mt-4 border border-navy/15 bg-white p-5 text-sm text-slate">
            No hay secciones registradas.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {secciones.map((seccion, indice) => (
              <li
                key={seccion.id}
                className="border border-navy/15 bg-white p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <p className="text-xs text-slate">
                      Orden {seccion.orden} · Clave: {seccion.clave}
                    </p>
                    <h3 className="mt-1 font-serif text-xl text-navy">
                      {seccion.titulo}
                    </h3>
                    {seccion.descripcion && (
                      <p className="mt-2 text-sm text-slate">{seccion.descripcion}</p>
                    )}
                    <p className="mt-2 text-xs text-slate">
                      Estado: {seccion.activa ? "Activa" : "Inactiva"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void moverSeccion(indice, -1)}
                      disabled={indice === 0}
                      aria-label={`Mover ${seccion.titulo} hacia arriba`}
                      className="border border-navy/20 px-3 py-2 text-sm disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => void moverSeccion(indice, 1)}
                      disabled={indice === secciones.length - 1}
                      aria-label={`Mover ${seccion.titulo} hacia abajo`}
                      className="border border-navy/20 px-3 py-2 text-sm disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => prepararEdicion(seccion)}
                      className="border border-navy/20 px-3 py-2 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void cambiarEstado(seccion)}
                      className="border border-navy/20 px-3 py-2 text-sm"
                    >
                      {seccion.activa ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
