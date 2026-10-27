import Link from "next/link";
import SeccionesClient from "./secciones-client";
import CamposClient from "./campos-client";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdministracionFormularios() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: esGestor, error } = await supabase.rpc(
    "es_gestor_formulario",
  );

  if (error || esGestor !== true) redirect("/panel");

  return (
    <main className="min-h-screen bg-paper px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/panel" className="text-sm text-slate underline">
          ← Volver al panel
        </Link>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.15em] text-gold">
          Gestión institucional
        </p>

        <h1 className="mt-2 font-serif text-3xl text-navy">
          Administrar formularios
        </h1>

        <p className="mt-4 max-w-2xl leading-relaxed text-slate">
          Configura las secciones y los campos disponibles para los formularios
          de iniciativas. Estos cambios se administran por separado del
          formulario que utilizan actualmente los docentes.
        </p>

        <section className="mt-10">
          <h2 className="mb-4 font-serif text-2xl text-navy">
            1. Secciones del formulario
          </h2>
          <SeccionesClient />
        </section>

        <section className="mt-12 border-t border-slate/20 pt-8">
          <h2 className="mb-4 font-serif text-2xl text-navy">
            2. Campos del formulario
          </h2>
          <CamposClient />
        </section>
      </div>
    </main>
  );
}
