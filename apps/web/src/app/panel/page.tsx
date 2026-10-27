import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const etapas = [
  "Identificar",
  "Diseñar",
  "Experimentar",
  "Acompañar",
  "Evaluar",
  "Aprender",
  "Transferir",
  "Retroalimentar",
];

const estados = [
  "Borrador",
  "En revisión",
  "Aprobada",
  "Rechazada",
  "Publicada",
];

type SearchParams = Promise<{
  q?: string | string[];
  estado?: string | string[];
  etapa?: string | string[];
}>;

type Iniciativa = {
  id: string;
  nombre: string;
  responsables: string;
  unidad_academica: string;
  estado: string;
  etapa: string;
  creado_en: string;
};

function primerParametro(
  value: string | string[] | undefined
): string {
  return typeof value === "string" ? value.trim() : "";
}

function estiloEstado(estado: string) {
  if (estado === "Publicada" || estado === "Aprobada") {
    return "border-sage/40 bg-sage/15 text-navy";
  }

  if (estado === "En revisión") {
    return "border-gold/50 bg-gold/15 text-navy";
  }

  if (estado === "Rechazada") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-navy/15 bg-navy/[0.04] text-slate";
}

export default async function Panel({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const parametros = await searchParams;

  const q = primerParametro(parametros.q).slice(0, 150);
  const estadoSolicitado = primerParametro(parametros.estado);
  const etapaSolicitada = primerParametro(parametros.etapa);

  // Solo se aceptan valores conocidos para los filtros.
  const estado = estados.includes(estadoSolicitado)
    ? estadoSolicitado
    : "";

  const etapa = etapas.includes(etapaSolicitada)
    ? etapaSolicitada
    : "";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  let iniciativas: Iniciativa[] = [];
  let errorCarga = "";

  let consulta = supabase
    .from("iniciativas")
    .select(
      "id, nombre, responsables, unidad_academica, estado, etapa, creado_en"
    )
    .order("creado_en", { ascending: false });

  // Los filtros se aplican directamente en la consulta del servidor.
  // RLS sigue determinando qué registros puede consultar el usuario.
  if (q) {
    const textoSeguro = q.replace(/[,%()]/g, " ").trim();

    if (textoSeguro) {
      consulta = consulta.or(
        `nombre.ilike.%${textoSeguro}%,responsables.ilike.%${textoSeguro}%,unidad_academica.ilike.%${textoSeguro}%`
      );
    }
  }

  if (estado) {
    consulta = consulta.eq("estado", estado);
  }

  if (etapa) {
    consulta = consulta.eq("etapa", etapa);
  }

  const { data, error } = await consulta;

  if (error) {
    errorCarga = "No fue posible cargar las iniciativas desde la base de datos.";
    console.error("Error al cargar iniciativas:", error.message);
  } else {
    iniciativas = (data ?? []) as Iniciativa[];
  }

  const total = iniciativas.length;

  const enDesarrollo = iniciativas.filter(
    (item) =>
      item.estado === "Borrador" || item.estado === "Aprobada"
  ).length;

  const pendientes = iniciativas.filter(
    (item) => item.estado === "En revisión"
  ).length;

  const publicadas = iniciativas.filter(
    (item) => item.estado === "Publicada"
  ).length;

  const indicadores = [
    {
      titulo: "Iniciativas registradas",
      valor: total,
      detalle: "Registros según los filtros aplicados",
    },
    {
      titulo: "En desarrollo",
      valor: enDesarrollo,
      detalle: "En borrador o aprobadas",
    },
    {
      titulo: "Pendientes de revisión",
      valor: pendientes,
      detalle: "Requieren validación institucional",
    },
    {
      titulo: "Publicadas",
      valor: publicadas,
      detalle: "Disponibles para compartir",
    },
  ];

  const hayFiltros = Boolean(q || estado || etapa);

  return (
    <>
      <header className="border-b border-navy/15 bg-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-serif text-xl text-navy">
            Portal de Innovación
          </Link>

          <nav className="flex flex-wrap gap-5 text-sm">
            <Link href="/" className="text-slate hover:text-navy">
              Ver portal público
            </Link>
            <span
              className="font-medium text-navy"
              aria-current="page"
            >
              Panel de gestión
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-paper">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold">
                Gestión institucional
              </p>

              <h1 className="mt-2 font-serif text-3xl text-navy sm:text-4xl">
                Panel de innovación educativa
              </h1>

              <p className="mt-3 max-w-2xl leading-relaxed text-slate">
                Organiza las iniciativas docentes, sigue sus avances y
                facilita la revisión antes de compartir las experiencias
                con la comunidad.
              </p>
            </div>

            <Link
              href="/panel/iniciativas/nueva"
              className="border border-navy/20 bg-navy px-5 py-3 text-sm text-paper hover:opacity-90"
            >
              + Registrar iniciativa
            </Link>
          </div>

          {errorCarga && (
            <div
              role="alert"
              className="mt-8 border border-red-300 bg-red-50 p-4 text-sm text-red-800"
            >
              {errorCarga}
            </div>
          )}

          <section
            aria-label="Filtros de iniciativas"
            className="mt-9 border border-navy/15 bg-white p-5 sm:p-6"
          >
            <h2 className="font-serif text-xl text-navy">
              Buscar y filtrar iniciativas
            </h2>

            <form
              action="/panel"
              method="GET"
              className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="sm:col-span-2">
                <label
                  htmlFor="q"
                  className="mb-2 block text-sm font-medium text-navy"
                >
                  Buscar por nombre, responsable o unidad
                </label>
                <input
                  id="q"
                  name="q"
                  type="search"
                  maxLength={150}
                  defaultValue={q}
                  placeholder="Ej.: innovación docente"
                  className="w-full border border-navy/20 bg-paper px-3 py-2.5 text-sm text-navy outline-none focus:border-navy"
                />
              </div>

              <div>
                <label
                  htmlFor="estado"
                  className="mb-2 block text-sm font-medium text-navy"
                >
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  defaultValue={estado}
                  className="w-full border border-navy/20 bg-paper px-3 py-2.5 text-sm text-navy"
                >
                  <option value="">Todos los estados</option>
                  {estados.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="etapa"
                  className="mb-2 block text-sm font-medium text-navy"
                >
                  Etapa
                </label>
                <select
                  id="etapa"
                  name="etapa"
                  defaultValue={etapa}
                  className="w-full border border-navy/20 bg-paper px-3 py-2.5 text-sm text-navy"
                >
                  <option value="">Todas las etapas</option>
                  {etapas.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
                <button
                  type="submit"
                  className="bg-navy px-5 py-2.5 text-sm text-paper hover:opacity-90"
                >
                  Aplicar filtros
                </button>

                <Link
                  href="/panel"
                  className="border border-navy/20 px-5 py-2.5 text-sm text-navy hover:bg-paper"
                >
                  Limpiar filtros
                </Link>
              </div>
            </form>

            {hayFiltros && (
              <p className="mt-4 text-sm text-slate">
                Filtros activos:
                {q ? ` búsqueda «${q}»` : ""}
                {estado ? ` · estado: ${estado}` : ""}
                {etapa ? ` · etapa: ${etapa}` : ""}
              </p>
            )}
          </section>

          <section
            aria-label="Resumen de iniciativas"
            className="mt-9"
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {indicadores.map((indicador) => (
                <article
                  key={indicador.titulo}
                  className="border border-navy/15 bg-white p-5"
                >
                  <p className="text-sm leading-relaxed text-slate">
                    {indicador.titulo}
                  </p>
                  <p className="mt-3 font-serif text-4xl text-navy">
                    {indicador.valor}
                  </p>
                  <p className="mt-2 text-xs text-slate">
                    {indicador.detalle}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <div>
              <h2 className="font-serif text-2xl text-navy">
                Iniciativas registradas
              </h2>
              <p className="mt-2 text-sm text-slate">
                Información recuperada de la base de datos según los
                criterios seleccionados.
              </p>
            </div>

            {!errorCarga && iniciativas.length === 0 && (
              <div className="mt-5 border border-navy/15 bg-white p-6 text-sm text-slate">
                {hayFiltros
                  ? "No se encontraron iniciativas con esos filtros. Prueba otros criterios o limpia la búsqueda."
                  : "Todavía no hay iniciativas registradas."}
              </div>
            )}

            <div className="mt-5 space-y-4">
              {iniciativas.map((iniciativa) => (
                <article
                  key={iniciativa.id}
                  className="border border-navy/15 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-xl text-navy">
                        <Link
                          href={`/panel/iniciativas/${iniciativa.id}`}
                          className="hover:underline"
                        >
                          {iniciativa.nombre}
                        </Link>
                      </h3>

                      <Link
                        href={`/panel/iniciativas/${iniciativa.id}`}
                        className="mt-3 inline-block text-sm font-medium text-navy underline underline-offset-4"
                      >
                        Ver ficha de iniciativa →
                      </Link>

                      <p className="mt-2 text-sm text-slate">
                        Responsable(s): {iniciativa.responsables}
                      </p>

                      <p className="mt-1 text-sm text-slate">
                        Carrera o unidad académica:{" "}
                        {iniciativa.unidad_academica}
                      </p>

                      <p className="mt-1 text-sm text-slate">
                        Etapa actual: {iniciativa.etapa}
                      </p>

                      <p className="mt-1 text-xs text-slate">
                        Creada:{" "}
                        {new Date(
                          iniciativa.creado_en
                        ).toLocaleDateString("es-CL", {
                          timeZone: "America/Santiago",
                        })}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit border px-3 py-1.5 text-xs ${estiloEstado(iniciativa.estado)}`}
                    >
                      {iniciativa.estado}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12 border border-navy/15 bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gold">
              Marco de seguimiento
            </p>

            <h2 className="mt-2 font-serif text-2xl text-navy">
              Las ocho etapas de la innovación
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate">
              Las etapas permiten describir el recorrido de cada iniciativa.
              Pueden revisarse según los aprendizajes y las necesidades de
              cada experiencia.
            </p>

            <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {etapas.map((etapaActual, indice) => (
                <li
                  key={etapaActual}
                  className="flex items-center gap-3 border border-navy/10 p-3"
                >
                  <span className="font-serif text-lg text-gold">
                    {String(indice + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-navy">
                    {etapaActual}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <footer className="border-t border-navy/15">
        <div className="mx-auto max-w-7xl px-6 py-7 text-sm text-slate">
          Portal de Innovación Educativa · Panel de gestión
        </div>
      </footer>
    </>
  );
}
