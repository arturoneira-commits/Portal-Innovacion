"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Datos = Record<string, string>;

type Campo = {
  id: string;
  label: string;
  tipo?: string;
  opciones?: string[];
  required?: boolean;
  max?: number;
};

type Seccion = {
  titulo: string;
  campos: Campo[];
};

const secciones: Seccion[] = [
  {
    titulo: "1. Identificación",
    campos: [
      { id: "nombre", label: "Nombre de la iniciativa", required: true },
      { id: "unidad_academica", label: "Carrera o unidad académica", required: true },
      { id: "responsables", label: "Responsables (para evaluación ciega, usar roles)", required: true },
      { id: "linea_principal", label: "Línea principal de innovación", tipo: "select", opciones: ["Metodologías activas y aprendizaje situado", "Innovación en prácticas pedagógicas", "Tecnologías para el aprendizaje", "Evaluación para el aprendizaje", "Internacionalización del aprendizaje", "Scholarship of Teaching and Learning (SoTL)"] },
      { id: "linea_secundaria", label: "Línea secundaria de innovación", tipo: "select", opciones: ["Ninguna", "Metodologías activas y aprendizaje situado", "Innovación en prácticas pedagógicas", "Tecnologías para el aprendizaje", "Evaluación para el aprendizaje", "Internacionalización del aprendizaje", "Scholarship of Teaching and Learning (SoTL)"] },
      { id: "asignaturas", label: "Asignaturas involucradas" },
      { id: "modalidad", label: "Modalidad", tipo: "select", opciones: ["Presencial", "Online", "Híbrida"] },
      { id: "nivel", label: "Nivel formativo", tipo: "select", opciones: ["Pregrado", "Postgrado"] },
      { id: "duracion_meses", label: "Duración en meses", tipo: "select", opciones: ["2", "3", "5"] },
      { id: "estudiantes_estimados", label: "Cantidad estimada de estudiantes", tipo: "number" },
      { id: "objetivos", label: "Resumen de los objetivos", tipo: "area", required: true },
    ],
  },
  {
    titulo: "2. Diagnóstico",
    campos: [
      { id: "problema_necesidad", label: "Problema, desafío o necesidad que aborda la iniciativa", tipo: "area", max: 2000 },
      { id: "evidencia_diagnostico", label: "Evidencias que muestran la necesidad de intervenir", tipo: "area", max: 1500 },
    ],
  },
  {
    titulo: "3. Objetivos y aprendizaje",
    campos: [
      { id: "objetivo_general", label: "Objetivo general", tipo: "area" },
      { id: "objetivos_especificos", label: "Objetivos específicos (uno por línea, máximo 5)", tipo: "lista" },
      { id: "resultados_esperados", label: "Resultados esperados de la iniciativa", tipo: "area" },
      { id: "resultados_aprendizaje", label: "Aprendizajes, competencias o habilidades que se espera desarrollar", tipo: "area" },
    ],
  },
  {
    titulo: "4. Diseño de la innovación",
    campos: [
      { id: "descripcion", label: "Descripción general de la iniciativa", tipo: "area", required: true },
      { id: "descripcion_innovacion", label: "¿Qué se implementará y qué cambiará respecto de la práctica actual?", tipo: "area", max: 3000 },
      { id: "experiencias_similares", label: "Experiencias similares y diferencias de esta propuesta", tipo: "area", max: 1000 },
      { id: "referentes_conceptuales", label: "Referentes conceptuales y bibliografía", tipo: "area", max: 1500 },
    ],
  },
  {
    titulo: "5. Implementación",
    campos: [
      { id: "actividades", label: "Actividades principales (una por línea)", tipo: "lista" },
      { id: "equipo_trabajo", label: "Integrantes del equipo, roles, tareas y horas semanales (una descripción por línea)", tipo: "lista" },
      { id: "antecedentes_adicionales", label: "Experiencia académica relevante u otros antecedentes", tipo: "area", max: 1500 },
    ],
  },
  {
    titulo: "6. Evaluación y evidencias",
    campos: [
      { id: "estrategia_evaluacion", label: "¿Cómo se evaluará el éxito de la iniciativa?", tipo: "area", max: 2000 },
      { id: "indicadores", label: "Indicadores, metas y momento de medición (una descripción por línea)", tipo: "lista" },
      { id: "evidencias", label: "Evidencias que se recopilarán (una por línea)", tipo: "lista" },
      { id: "justificacion_evidencias", label: "Justificación de las evidencias seleccionadas", tipo: "area", max: 1500 },
    ],
  },
  {
    titulo: "7. Transferencia y presupuesto",
    campos: [
      { id: "escalabilidad_transferencia", label: "Cómo se puede replicar, transferir y mantener la experiencia", tipo: "area", max: 1500 },
      { id: "producto_transferencia", label: "Producto de transferencia", tipo: "select", opciones: ["Presentación institucional", "Taller académico", "Recurso educativo abierto", "Informe o artículo de buenas prácticas", "Póster", "Otro"] },
      { id: "dimension_internacional", label: "¿Tiene dimensión internacional o multicultural?", tipo: "select", opciones: ["No", "Sí"] },
      { id: "presupuesto", label: "Presupuesto estimado en formato JSON (por ejemplo: {\"materiales\": 100000, \"honorarios\": 200000})", tipo: "area" },
      { id: "justificacion_presupuesto", label: "Justificación del presupuesto solicitado", tipo: "area", max: 1500 },
    ],
  },
];

const camposIniciales: Datos = {
  nombre: "",
  unidad_academica: "",
  responsables: "",
  linea_principal: "",
  linea_secundaria: "",
  asignaturas: "",
  modalidad: "",
  nivel: "",
  duracion_meses: "",
  estudiantes_estimados: "",
  objetivos: "",
  problema_necesidad: "",
  evidencia_diagnostico: "",
  objetivo_general: "",
  objetivos_especificos: "",
  resultados_esperados: "",
  resultados_aprendizaje: "",
  descripcion: "",
  descripcion_innovacion: "",
  experiencias_similares: "",
  referentes_conceptuales: "",
  actividades: "",
  equipo_trabajo: "",
  antecedentes_adicionales: "",
  estrategia_evaluacion: "",
  indicadores: "",
  evidencias: "",
  justificacion_evidencias: "",
  escalabilidad_transferencia: "",
  producto_transferencia: "",
  dimension_internacional: "No",
  presupuesto: "{}",
  justificacion_presupuesto: "",
};

const camposLista = [
  "objetivos_especificos",
  "actividades",
  "equipo_trabajo",
  "indicadores",
  "evidencias",
];

export default function FormularioIniciativa() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();

  const [datos, setDatos] = useState<Datos>(camposIniciales);
  const [seccion, setSeccion] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: auth, error: errorAuth } = await supabase.auth.getUser();

        if (errorAuth || !auth.user) {
          router.replace("/login");
          return;
        }

        const columnas = Object.keys(camposIniciales).join(", ");
        const { data, error } = await supabase
          .from("iniciativas")
          .select(columnas)
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("No se encontró la iniciativa.");

        const resultado: Datos = { ...camposIniciales };

        for (const campo of Object.keys(camposIniciales)) {
          const valor = (data as unknown as Record<string, unknown>)[campo];

          if (valor === null || valor === undefined) continue;

          if (camposLista.includes(campo)) {
            resultado[campo] = Array.isArray(valor) ? valor.join("\n") : "";
          } else if (campo === "presupuesto") {
            resultado[campo] = typeof valor === "string"
              ? valor
              : JSON.stringify(valor, null, 2);
          } else if (campo === "dimension_internacional") {
            resultado[campo] = valor === true ? "Sí" : "No";
          } else {
            resultado[campo] = String(valor);
          }
        }

        if (activo) setDatos(resultado);
      } catch (e) {
        if (activo) {
          setEsError(true);
          setMensaje(e instanceof Error ? e.message : "No se pudo cargar la iniciativa.");
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => { activo = false; };
  }, [id, router]);

  function cambiar(campo: string, valor: string) {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
  }

  async function guardarSeccion() {
    setGuardando(true);
    setMensaje("");
    setEsError(false);

    try {
      const actual = secciones[seccion];
      const actualizados: Record<string, unknown> = {};

      for (const campo of actual.campos) {
        const valor = datos[campo.id] ?? "";

        if (campo.required && !valor.trim()) {
          throw new Error(`Completa el campo obligatorio: ${campo.label}.`);
        }

        if (campo.id === "duracion_meses") {
          actualizados[campo.id] = valor ? Number(valor) : null;
        } else if (campo.id === "estudiantes_estimados") {
          actualizados[campo.id] = valor ? Number(valor) : null;
        } else if (camposLista.includes(campo.id)) {
          actualizados[campo.id] = valor
            .split("\n")
            .map((linea) => linea.trim())
            .filter(Boolean);
        } else if (campo.id === "presupuesto") {
          let presupuesto: unknown;
          try {
            presupuesto = JSON.parse(valor || "{}");
          } catch {
            throw new Error("El presupuesto debe tener un formato JSON válido.");
          }
          if (!presupuesto || typeof presupuesto !== "object" || Array.isArray(presupuesto)) {
            throw new Error("El presupuesto debe ser un objeto JSON, por ejemplo {\"materiales\": 100000}.");
          }
          actualizados[campo.id] = presupuesto;
        } else if (campo.id === "dimension_internacional") {
          actualizados[campo.id] = valor === "Sí";
        } else {
          actualizados[campo.id] = valor.trim() || null;
        }
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("iniciativas")
        .update(actualizados)
        .eq("id", id);

      if (error) throw error;

      setMensaje(`Se guardó la sección «${actual.titulo}» correctamente.`);
    } catch (e) {
      setEsError(true);
      setMensaje(e instanceof Error ? e.message : "No se pudo guardar la sección.");
    } finally {
      setGuardando(false);
    }
  }

  const actual = secciones[seccion];
  const claseCampo =
    "mt-2 w-full border border-navy/20 bg-white px-4 py-3 text-navy outline-none focus:border-navy";
  const claseEtiqueta = "block text-sm font-medium text-navy";

  if (cargando) {
    return <main className="mx-auto max-w-4xl px-6 py-10">Cargando formulario...</main>;
  }

  return (
    <>
      <header className="border-b border-navy/15 bg-paper">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="font-serif text-xl text-navy">Portal de Innovación</Link>
          <Link href={`/panel/iniciativas/${id}`} className="text-sm text-slate">Volver a la ficha</Link>
        </div>
      </header>

      <main className="min-h-screen bg-paper px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">
            Formulario de postulación y gestión
          </p>
          <h1 className="mt-2 font-serif text-3xl text-navy">
            Completar iniciativa educativa
          </h1>
          <p className="mt-3 text-slate">
            Completa cada sección y guarda sus cambios antes de continuar. Puedes volver a este formulario para seguir trabajando.
          </p>

          <nav aria-label="Secciones del formulario" className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {secciones.map((item, indice) => (
              <button
                key={item.titulo}
                type="button"
                onClick={() => { setSeccion(indice); setMensaje(""); }}
                className={`border px-3 py-3 text-left text-sm ${
                  indice === seccion
                    ? "border-navy bg-navy text-white"
                    : "border-navy/15 bg-white text-navy hover:bg-navy/5"
                }`}
              >
                {item.titulo}
              </button>
            ))}
          </nav>

          {mensaje && (
            <p role="status" className={`mt-5 border p-4 text-sm ${
              esError ? "border-red-300 bg-red-50 text-red-800" : "border-navy/15 bg-white text-navy"
            }`}>
              {mensaje}
            </p>
          )}

          <section className="mt-6 border border-navy/15 bg-white p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-navy">{actual.titulo}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6">
              {actual.campos.map((campo) => (
                <div key={campo.id}>
                  <label htmlFor={campo.id} className={claseEtiqueta}>
                    {campo.label}{campo.required ? " *" : ""}
                  </label>

                  {campo.tipo === "select" ? (
                    <select
                      id={campo.id}
                      className={claseCampo}
                      value={datos[campo.id] ?? ""}
                      onChange={(e) => cambiar(campo.id, e.target.value)}
                    >
                      <option value="">Selecciona una opción</option>
                      {campo.opciones?.map((opcion) => (
                        <option key={opcion} value={opcion}>{opcion}</option>
                      ))}
                    </select>
                  ) : campo.tipo === "area" || campo.tipo === "lista" ? (
                    <textarea
                      id={campo.id}
                      className={claseCampo}
                      rows={campo.tipo === "lista" ? 5 : 4}
                      maxLength={campo.max}
                      required={campo.required}
                      value={datos[campo.id] ?? ""}
                      onChange={(e) => cambiar(campo.id, e.target.value)}
                      placeholder={campo.tipo === "lista" ? "Escribe un elemento por línea" : "Escribe aquí la información"}
                    />
                  ) : (
                    <input
                      id={campo.id}
                      className={claseCampo}
                      type={campo.tipo === "number" ? "number" : campo.id === "duracion_meses" ? "number" : "text"}
                      min={campo.tipo === "number" || campo.id === "duracion_meses" ? 0 : undefined}
                      max={campo.id === "duracion_meses" ? 5 : undefined}
                      required={campo.required}
                      value={datos[campo.id] ?? ""}
                      onChange={(e) => cambiar(campo.id, e.target.value)}
                    />
                  )}

                  {campo.max && (
                    <p className="mt-1 text-xs text-slate">
                      Máximo {campo.max} caracteres. {(datos[campo.id] ?? "").length}/{campo.max}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 border-t border-navy/10 pt-6">
              <button
                type="button"
                onClick={guardarSeccion}
                disabled={guardando}
                className="bg-navy px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar esta sección"}
              </button>
              {seccion > 0 && (
                <button
                  type="button"
                  onClick={() => { setSeccion(seccion - 1); setMensaje(""); }}
                  className="border border-navy/20 px-5 py-3 text-sm text-navy"
                >
                  Sección anterior
                </button>
              )}
              {seccion < secciones.length - 1 ? (
                <button
                  type="button"
                  onClick={() => { setSeccion(seccion + 1); setMensaje(""); }}
                  className="border border-navy/20 px-5 py-3 text-sm text-navy"
                >
                  Siguiente sección
                </button>
              ) : (
                <Link
                  href={`/panel/iniciativas/${id}`}
                  className="border border-navy/20 px-5 py-3 text-sm text-navy"
                >
                  Volver a la ficha
                </Link>
              )}
            </div>
            <p className="mt-4 text-xs text-slate">
              Recuerda guardar cada sección. Cambiar de sección no guarda automáticamente los datos.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
