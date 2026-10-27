import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import SeguimientoIniciativa from "./seguimiento";


export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

type CampoConfigurado = {
  clave: string;
  etiqueta: string;
};

function formatearRespuesta(valor: unknown): string {
  if (Array.isArray(valor)) {
    return valor.map(String).filter(Boolean).join("\n") || "Sin información registrada.";
  }

  if (valor === true) return "Sí";
  if (valor === false) return "No";
  if (valor === null || valor === undefined || valor === "") {
    return "Sin información registrada.";
  }

  return String(valor);
}


export default async function DetalleIniciativa({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: iniciativa, error } = await supabase
    .from("iniciativas")
    .select(
      "id, nombre, descripcion, responsables, unidad_academica, objetivos, estado, etapa, creado_en, respuestas_adicionales"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error al cargar la iniciativa:", error.message);
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-red-700">
          No fue posible cargar la información de la iniciativa.
        </p>
        <Link
          href="/panel"
          className="mt-6 inline-block text-sm underline"
        >
          Volver al panel
        </Link>
      </main>
    );
  }

  if (!iniciativa) {
    notFound();
  }


  const { data: camposConfigurados, error: errorCampos } = await supabase
    .from("campos_formulario")
    .select("clave, etiqueta")
    .eq("activo", true)
    .order("orden");

  if (errorCampos) {
    console.error("Error al cargar etiquetas de campos adicionales:", errorCampos.message);
  }

  const etiquetasPorClave = new Map(
    ((camposConfigurados ?? []) as CampoConfigurado[]).map((campo) => [
      campo.clave,
      campo.etiqueta,
    ]),
  );

  const respuestasGuardadas = iniciativa.respuestas_adicionales;
  const respuestasAdicionales =
    respuestasGuardadas &&
    typeof respuestasGuardadas === "object" &&
    !Array.isArray(respuestasGuardadas)
      ? (respuestasGuardadas as Record<string, unknown>)
      : {};

  const camposAdicionales = Object.entries(respuestasAdicionales).map(([clave, valor]) => ({
    clave,
    etiqueta: etiquetasPorClave.get(clave) ?? clave.replaceAll("_", " "),
    contenido: formatearRespuesta(valor),
  }));

  const campos = [
    { titulo: "Descripción", contenido: iniciativa.descripcion },
    { titulo: "Objetivos", contenido: iniciativa.objetivos },
    { titulo: "Responsables", contenido: iniciativa.responsables },
    {
      titulo: "Unidad académica",
      contenido: iniciativa.unidad_academica,
    },
  ];

  return (
    <>
      <header className="border-b border-navy/15 bg-paper">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-serif text-xl text-navy">
            Portal de Innovación
          </Link>
          <Link href="/panel" className="text-sm text-slate hover:text-navy">
            Volver al panel
          </Link>
        </div>
      </header>

      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold">
            Ficha de iniciativa
          </p>

          <h1 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">
            {iniciativa.nombre}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="border border-navy/15 bg-white px-3 py-1.5 text-sm text-navy">
              Estado: {iniciativa.estado || "Sin definir"}
            </span>
            <span className="border border-navy/15 bg-white px-3 py-1.5 text-sm text-navy">
              Etapa: {iniciativa.etapa || "Sin definir"}
            </span>
          </div>

          <section className="mt-8 space-y-4">
            {campos.map((campo) => (
              <article
                key={campo.titulo}
                className="border border-navy/15 bg-white p-5 sm:p-6"
              >
                <h2 className="font-serif text-xl text-navy">
                  {campo.titulo}
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate">
                  {campo.contenido?.trim() || "Sin información registrada."}
                </p>
              </article>
            ))}
          </section>

          {camposAdicionales.length > 0 && (
           <section className="mt-8 border border-navy/15 bg-white p-5 sm:p-6">
             <h2 className="font-serif text-2xl text-navy">Campos adicionales</h2>
             <dl className="mt-5 space-y-5">
               {camposAdicionales.map((campo) => (
                 <div key={campo.clave}>
                   <dt className="text-sm font-medium text-navy">{campo.etiqueta}</dt>
                   <dd className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate">
                     {campo.contenido}
                   </dd>
                 </div>
               ))}
             </dl>
           </section>
         )}

         <SeguimientoIniciativa iniciativaId={iniciativa.id} />

          <p className="mt-6 text-sm text-slate">
            Fecha de creación:{" "}
            {new Date(iniciativa.creado_en).toLocaleDateString("es-CL", {
              timeZone: "America/Santiago",
            })}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
            href={`/panel/iniciativas/${iniciativa.id}/formulario`}
            className="inline-block border border-navy/20 bg-gold px-5 py-3 text-sm text-navy hover:opacity-90"
          >
            Completar formulario
          </Link>
          <Link
              href={`/panel/iniciativas/${iniciativa.id}/editar`}
              className="inline-block border border-navy/20 bg-navy px-5 py-3 text-sm text-paper hover:opacity-90"
            >
              Editar iniciativa
            </Link>
            <Link
              href="/panel"
              className="inline-block border border-navy/20 px-5 py-3 text-sm text-navy hover:bg-navy/5"
            >
              Volver al listado
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
