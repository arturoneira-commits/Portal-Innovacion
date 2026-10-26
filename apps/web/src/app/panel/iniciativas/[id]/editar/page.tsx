"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Campos = {
  nombre: string;
  descripcion: string;
  responsables: string;
  unidad_academica: string;
  objetivos: string;
};

const inicial: Campos = {
  nombre: "",
  descripcion: "",
  responsables: "",
  unidad_academica: "",
  objetivos: "",
};

export default function EditarIniciativa() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [campos, setCampos] = useState<Campos>(inicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user }, error: errorAuth } =
          await supabase.auth.getUser();

        if (errorAuth || !user) {
          router.replace("/login");
          return;
        }

        const { data, error: errorBD } = await supabase
          .from("iniciativas")
          .select(
            "nombre, descripcion, responsables, unidad_academica, objetivos"
          )
          .eq("id", id)
          .maybeSingle();

        if (errorBD) throw errorBD;
        if (!data) {
          if (activo) setMensaje("No se encontró esta iniciativa.");
          return;
        }

        if (activo) setCampos({
          nombre: data.nombre ?? "",
          descripcion: data.descripcion ?? "",
          responsables: data.responsables ?? "",
          unidad_academica: data.unidad_academica ?? "",
          objetivos: data.objetivos ?? "",
        });
      } catch (e) {
        if (activo) {
          setError(true);
          setMensaje(
            e instanceof Error ? e.message : "No se pudo cargar la iniciativa."
          );
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => { activo = false; };
  }, [id, router]);

  function cambiar(campo: keyof Campos, valor: string) {
    setCampos((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setMensaje("");
    setError(false);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: errorBD } = await supabase
        .from("iniciativas")
        .update({
          nombre: campos.nombre.trim(),
          descripcion: campos.descripcion.trim(),
          responsables: campos.responsables.trim(),
          unidad_academica: campos.unidad_academica.trim(),
          objetivos: campos.objetivos.trim(),
        })
        .eq("id", id);

      if (errorBD) throw errorBD;

      setMensaje("Cambios guardados correctamente.");
      router.refresh();
      router.push(`/panel/iniciativas/${id}`);
    } catch (e) {
      setError(true);
      setMensaje(
        e instanceof Error
          ? `No se pudieron guardar los cambios: ${e.message}`
          : "No se pudieron guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  }

  const claseCampo =
    "mt-2 w-full border border-navy/20 bg-white px-4 py-3 text-navy outline-none focus:border-navy";
  const claseEtiqueta = "block text-sm font-medium text-navy";

  if (cargando) {
    return <main className="mx-auto max-w-3xl px-6 py-10">Cargando iniciativa...</main>;
  }

  return (
    <>
      <header className="border-b border-navy/15 bg-paper">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-serif text-xl text-navy">
            Portal de Innovación
          </Link>
          <Link href={`/panel/iniciativas/${id}`} className="text-sm text-slate">
            Volver a la ficha
          </Link>
        </div>
      </header>

      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            Gestión institucional
          </p>
          <h1 className="mt-2 font-serif text-3xl text-navy">
            Editar iniciativa
          </h1>
          <p className="mt-3 text-slate">
            Modifica los datos y guarda los cambios en la iniciativa existente.
          </p>

          {mensaje && (
            <p role="status" className={`mt-5 border p-4 text-sm ${
              error ? "border-red-300 bg-red-50 text-red-800" :
              "border-navy/15 bg-white text-navy"
            }`}>
              {mensaje}
            </p>
          )}

          {!mensaje.startsWith("No se encontró") && (
            <form onSubmit={guardar} className="mt-8 space-y-6 border border-navy/15 bg-white p-6 sm:p-8">
              <div>
                <label htmlFor="nombre" className={claseEtiqueta}>Nombre de la iniciativa *</label>
                <input id="nombre" className={claseCampo} required maxLength={200}
                  value={campos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
              </div>

              <div>
                <label htmlFor="descripcion" className={claseEtiqueta}>Descripción *</label>
                <textarea id="descripcion" className={claseCampo} required rows={4}
                  value={campos.descripcion} onChange={(e) => cambiar("descripcion", e.target.value)} />
              </div>

              <div>
                <label htmlFor="responsables" className={claseEtiqueta}>Responsables *</label>
                <input id="responsables" className={claseCampo} required maxLength={500}
                  value={campos.responsables} onChange={(e) => cambiar("responsables", e.target.value)} />
              </div>

              <div>
                <label htmlFor="unidad" className={claseEtiqueta}>Unidad académica *</label>
                <input id="unidad" className={claseCampo} required maxLength={200}
                  value={campos.unidad_academica} onChange={(e) => cambiar("unidad_academica", e.target.value)} />
              </div>

              <div>
                <label htmlFor="objetivos" className={claseEtiqueta}>Objetivos *</label>
                <textarea id="objetivos" className={claseCampo} required rows={4}
                  value={campos.objetivos} onChange={(e) => cambiar("objetivos", e.target.value)} />
              </div>

              <div className="flex flex-wrap gap-3 border-t border-navy/10 pt-5">
                <button type="submit" disabled={guardando}
                  className="bg-navy px-6 py-3 text-sm font-medium text-white disabled:opacity-60">
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
                <Link href={`/panel/iniciativas/${id}`}
                  className="border border-navy/20 px-6 py-3 text-sm text-navy">
                  Cancelar
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
