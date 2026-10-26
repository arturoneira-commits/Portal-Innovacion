import Link from "next/link";
import SeccionesClient from "./secciones-client";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdministracionFormularios() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: esGestor, error } = await supabase.rpc("es_gestor_formulario");

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
          Desde aquí configuraremos las secciones, los campos y las opciones
          disponibles en el formulario de iniciativas. Esta pantalla inicial
          confirma el acceso; todavía no modifica el formulario utilizado por
          los docentes.
        </p>

        <SeccionesClient />
      </div>
    </main>
  );
}
